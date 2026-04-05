const { sql, poolPromise } = require("../config/db");

const billController = {
  // Hàm lấy lịch sử hóa đơn theo bàn
  getHistoryByTable: async (req, res) => {
    try {
      const { maban } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("MABAN", sql.VarChar, maban)
        .query(`
          SELECT MAHOADON, NGAY, GIOBATDAU, GIOKETTHUC, TONGTHANHTOAN 
          FROM HOADON 
          WHERE MABAN = @MABAN AND TRANGTHAI = N'Đã thanh toán'
          ORDER BY NGAY DESC, GIOKETTHUC DESC
        `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Hàm lấy tất cả hóa đơn
  getAllBills: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          H.MAHOADON, H.NGAY, H.TONGTIENGIO, H.TONGTIENHANG, 
          H.TONGTHANHTOAN, H.TRANGTHAI, H.MAKHUYENMAI,
          D.TENKHACHHANG, -- Lấy từ bảng DATBAN
          N.TENNGUOIDUNG AS TENNHANVIEN,
          H.GIOBATDAU, H.GIOKETTHUC,
          B.TENBAN
        FROM HOADON H
        LEFT JOIN DATBAN D ON H.MADATBAN = D.MADATBAN
        LEFT JOIN NHANVIEN N ON H.MANVIEN = N.MANVIEN
        LEFT JOIN BAN B ON H.MABAN = B.MABAN
        ORDER BY H.NGAY DESC
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi truy vấn Hóa Đơn:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hàm lấy chi tiết hóa đơn
  getBillItems: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("MAHOADON", sql.VarChar, id)
        .query(`
          SELECT 
            C.MAHANGHOA, 
            H.TENHANGHOA, 
            C.SOLUONG, 
            C.DONGIA, 
            C.THANHTIEN
          FROM CHITIETHOADON C
          JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
          WHERE C.MAHOADON = @MAHOADON
        `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi lấy chi tiết HD:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hàm hủy hóa đơn
  cancelInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;

      await pool.request().input("MAHOADON", sql.VarChar, id).query(`
          UPDATE HOADON 
          SET TRANGTHAI = N'Đã hủy' 
          WHERE MAHOADON = @MAHOADON
        `);

      res.json({ success: true, message: "Đã hủy hóa đơn thành công!" });
    } catch (err) {
      console.error("Lỗi khi hủy hóa đơn:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Cập nhật MABAN khi Thu Ngân chuyển bàn
  transferBill: async (req, res) => {
    try {
      const { id } = req.params;
      const { MABAN } = req.body;
      const pool = await poolPromise;
      await pool.request()
        .input('MAHOADON', sql.VarChar, id)
        .input('MABAN', sql.VarChar, MABAN)
        .query(`UPDATE HOADON SET MABAN = @MABAN WHERE MAHOADON = @MAHOADON`);
      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi transferBill:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Lấy các hóa đơn đang chơi để phục hồi trạng thái sau reload
  getActiveBills: async (req, res) => {
    try {
      const pool = await poolPromise;
      // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
      const today = new Date().toISOString().slice(0, 10);

      // Lấy danh sách hóa đơn đang chơi TRONG NGÀY HÔM NAY
      const billsResult = await pool.request()
        .input("TODAY", sql.VarChar, today)
        .query(`
          SELECT MAHOADON, MABAN, MAKHUYENMAI, GIOBATDAU, NGAY
          FROM HOADON
          WHERE TRANGTHAI = N'Đang chơi' AND NGAY = @TODAY
        `);
      const bills = billsResult.recordset;

      // Với mỗi hóa đơn, lấy thêm danh sách các món
      const result = [];
      for (const bill of bills) {
        try {
          const itemsResult = await pool.request()
            .input("MAHOADON", sql.VarChar, bill.MAHOADON)
            .query(`
              SELECT C.MAHANGHOA, H.TENHANGHOA, C.SOLUONG, C.DONGIA, C.THANHTIEN
              FROM CHITIETHOADON C
              LEFT JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
              WHERE C.MAHOADON = @MAHOADON
            `);
          result.push({ ...bill, items: itemsResult.recordset });
        } catch (itemErr) {
          console.error(`Lỗi lấy món cho HD ${bill.MAHOADON}:`, itemErr);
          result.push({ ...bill, items: [] });
        }
      }

      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Lỗi getActiveBills:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Tạo hóa đơn mới khi Thu Ngân mở bàn
  openBill: async (req, res) => {
    try {
      const { MABAN, GIOBATDAU, NGAY } = req.body;
      const pool = await poolPromise;

      // 1. Lấy mã nhân viên mặc định (ví dụ lấy người đầu tiên hoặc NV001)
      let manvien = 'NV001';
      const nvResult = await pool.request().query(`SELECT TOP 1 MANVIEN FROM NHANVIEN`);
      if (nvResult.recordset.length > 0) {
        manvien = nvResult.recordset[0].MANVIEN;
      }

      // 2. Tạo mã hóa đơn tự động (lấy max hiện tại + 1 để tránh trùng)
      const maxIdResult = await pool.request().query(`SELECT MAHOADON FROM HOADON ORDER BY MAHOADON DESC`);
      let newId = 'HD001';
      if (maxIdResult.recordset.length > 0) {
        const lastId = maxIdResult.recordset[0].MAHOADON;
        const lastNum = parseInt(lastId.replace('HD', ''), 10);
        newId = 'HD' + String(lastNum + 1).padStart(3, '0');
      }

      // 3. Insert với đầy đủ các cột có thể là NOT NULL
      await pool.request()
        .input('MAHOADON', sql.VarChar, newId)
        .input('MABAN', sql.VarChar, MABAN)
        .input('MANVIEN', sql.VarChar, manvien)
        .input('GIOBATDAU', sql.VarChar, GIOBATDAU || null)
        .input('NGAY', sql.Date, new Date(NGAY))
        .input('TRANGTHAI', sql.NVarChar, 'Đang chơi')
        .input('TONGTIENGIO', sql.Decimal(18,0), 0)
        .input('TONGTIENHANG', sql.Decimal(18,0), 0)
        .input('TONGTHANHTOAN', sql.Decimal(18,0), 0)
        .query(`
          INSERT INTO HOADON (MAHOADON, MABAN, MANVIEN, GIOBATDAU, NGAY, TRANGTHAI, TONGTIENGIO, TONGTIENHANG, TONGTHANHTOAN)
          VALUES (@MAHOADON, @MABAN, @MANVIEN, @GIOBATDAU, @NGAY, @TRANGTHAI, @TONGTIENGIO, @TONGTIENHANG, @TONGTHANHTOAN)
        `);

      res.json({ success: true, MAHOADON: newId });
    } catch (err) {
      console.error("Lỗi openBill:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Cập nhật danh sách món cho hóa đơn
  updateBillItems: async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body; // [{ MAHANGHOA, TENHANGHOA, SOLUONG, DONGIA }]
      const pool = await poolPromise;

      // Xóa các món cũ
      await pool.request().input('MAHOADON', sql.VarChar, id)
        .query(`DELETE FROM CHITIETHOADON WHERE MAHOADON = @MAHOADON`);

      // Lấy danh sách các mã hàng hóa hợp lệ HIỆN CÓ trong CSDL để tránh lỗi khóa ngoại
      const validItemsRes = await pool.request().query("SELECT MAHANGHOA FROM HANGHOA");
      const validIds = new Set(validItemsRes.recordset.map(i => String(i.MAHANGHOA)));

      // Thêm lại toàn bộ danh sách món mới (chỉ thêm món có mã hợp lệ)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = String(item.MAHANGHOA || item.id);
        
        // Nếu mã không tồn tại trong danh mục Hàng hóa, ta bỏ qua để không bị lỗi khóa ngoại
        // Điều này xử lý triệt để cả trường hợp mã 108 hoặc bất kỳ mã ảo nào khác
        if (!validIds.has(itemId)) {
          console.warn(`Bỏ qua lưu món ${item.TENHANGHOA || itemId} vào CTHD vì mã không tồn tại trong danh mục.`);
          continue;
        }

        const cthd = 'CTHD' + id.replace('HD','') + '_' + String(i + 1).padStart(2, '0');
        const price = item.price ?? item.DONGIA ?? 0;
        const qty = item.qty ?? item.SOLUONG ?? 1;

        await pool.request()
          .input('MACHITETHOADON', sql.VarChar, cthd)
          .input('MAHOADON', sql.VarChar, id)
          .input('MAHANGHOA', sql.VarChar, itemId)
          .input('SOLUONG', sql.Int, qty)
          .input('DONGIA', sql.Decimal(18,0), price)
          .input('THANHTIEN', sql.Decimal(18,0), price * qty)
          .query(`
            INSERT INTO CHITIETHOADON (MACHITETHOADON, MAHOADON, MAHANGHOA, SOLUONG, DONGIA, THANHTIEN)
            VALUES (@MACHITETHOADON, @MAHOADON, @MAHANGHOA, @SOLUONG, @DONGIA, @THANHTIEN)
          `);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi updateBillItems:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Thanh toán hóa đơn
  checkoutBill: async (req, res) => {
    try {
      const { id } = req.params;
      const { GIOKETTHUC, TONGTHANHTOAN, MAKHUYENMAI, TONGTIENHANG } = req.body;
      const pool = await poolPromise;

      await pool.request()
        .input('MAHOADON', sql.VarChar, id)
        .input('GIOKETTHUC', sql.VarChar, GIOKETTHUC)
        .input('TONGTHANHTOAN', sql.Decimal(18,0), TONGTHANHTOAN)
        .input('MAKHUYENMAI', sql.VarChar, MAKHUYENMAI || null)
        .input('TONGTIENHANG', sql.Decimal(18,0), TONGTIENHANG || 0)
        .query(`
          UPDATE HOADON
          SET GIOKETTHUC = @GIOKETTHUC,
              TONGTHANHTOAN = @TONGTHANHTOAN,
              MAKHUYENMAI = @MAKHUYENMAI,
              TONGTIENHANG = @TONGTIENHANG,
              TRANGTHAI = N'Đã thanh toán'
          WHERE MAHOADON = @MAHOADON
        `);

      res.json({ success: true, message: 'Thanh toán thành công!' });
    } catch (err) {
      console.error("Lỗi checkoutBill:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // [MỚI] Cập nhật giờ bắt đầu (khi khách chọn món tính giờ)
  updateStartTime: async (req, res) => {
    try {
      const { id } = req.params;
      const { GIOBATDAU } = req.body;
      const pool = await poolPromise;

      await pool.request()
        .input('MAHOADON', sql.VarChar, id)
        .input('GIOBATDAU', sql.VarChar, GIOBATDAU)
        .query(`UPDATE HOADON SET GIOBATDAU = @GIOBATDAU WHERE MAHOADON = @MAHOADON`);

      res.json({ success: true, message: 'Đã kích hoạt giờ chơi!' });
    } catch (err) {
      console.error("Lỗi updateStartTime:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = billController;
