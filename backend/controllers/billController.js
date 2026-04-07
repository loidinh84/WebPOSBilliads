const { sql, poolPromise } = require("../config/db");
// 1. IMPORT MODEL LỊCH SỬ THAO TÁC VÀO ĐÂY
const ActionHistoryModel = require("../models/actionHistoryModel");

const billController = {
  // Lấy danh sách bàn
  getTables: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT MABAN as maban, TENBAN as name, TRANGTHAI as status
        FROM BAN
      `);

      const tables = result.recordset.map((t) => ({
        id: parseInt(t.maban.replace(/\D/g, ""), 10) || t.maban,
        name: t.name,
        maban: t.maban,
        status:
          t.status === "Đang sử dụng" || t.status === "Đang chơi"
            ? "occupied"
            : "empty",
      }));
      res.json({ success: true, data: tables });
    } catch (err) {
      console.error("Lỗi lấy danh sách bàn:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

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

          UPDATE BAN 
          SET TRANGTHAI = N'Trống' 
            WHERE MABAN = (
              SELECT MABAN FROM HOADON WHERE MAHOADON = @MAHOADON);
        `);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        "HỦY HÓA ĐƠN",
        id,
        `Hủy hóa đơn chưa thanh toán`,
      );

      res.json({ success: true, message: "Đã hủy hóa đơn thành công!" });
    } catch (err) {
      console.error("Lỗi khi hủy hóa đơn:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Cập nhật MABAN khi Thu Ngân chuyển bàn
  transferBill: async (req, res) => {
    try {
      const { id } = req.params;
      const { MABAN_MOI } = req.body;
      const pool = await poolPromise;

      // 1. Lấy bàn cũ trước khi chuyển
      const oldBillRes = await pool
        .request()
        .input("MAHOADON", sql.VarChar, id)
        .query(`SELECT MABAN FROM HOADON WHERE MAHOADON = @MAHOADON`);

      const maBanCu = oldBillRes.recordset[0]?.MABAN;

      // 2. Cập nhật hóa đơn sang bàn mới
      await pool
        .request()
        .input("MAHOADON", sql.VarChar, id)
        .input("MABAN_MOI", sql.VarChar, MABAN_MOI)
        .query(
          `UPDATE HOADON SET MABAN = @MABAN_MOI WHERE MAHOADON = @MAHOADON`,
        );

      // 3. Cập nhật trạng thái 2 bàn
      if (maBanCu) {
        await pool
          .request()
          .input("MABAN_CU", sql.VarChar, maBanCu)
          .input("MABAN_MOI", sql.VarChar, MABAN_MOI).query(`
          UPDATE BAN SET TRANGTHAI = N'Trống' WHERE MABAN = @MABAN_CU;
          UPDATE BAN SET TRANGTHAI = N'Đang sử dụng' WHERE MABAN = @MABAN_MOI;
        `);
      }

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        "CHUYỂN BÀN",
        id,
        `Chuyển khách từ bàn ${maBanCu} sang bàn mới: ${MABAN_MOI}`,
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi transferBill:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Lấy các hóa đơn đang chơi để phục hồi trạng thái sau reload
  getActiveBills: async (req, res) => {
    try {
      const pool = await poolPromise;

      const billsResult = await pool.request().query(`
          SELECT MAHOADON, MABAN, MAKHUYENMAI, GIOBATDAU, NGAY
          FROM HOADON
          WHERE TRANGTHAI = N'Đang chơi'
        `);
      const bills = billsResult.recordset;

      const result = [];
      for (const bill of bills) {
        try {
          const itemsResult = await pool
            .request()
            .input("MAHOADON", sql.VarChar, bill.MAHOADON).query(`
              SELECT C.MAHANGHOA, H.TENHANGHOA, C.SOLUONG, C.DONGIA, C.THANHTIEN
              FROM CHITIETHOADON C
              LEFT JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
              WHERE C.MAHOADON = @MAHOADON
            `);
          result.push({ ...bill, items: itemsResult.recordset });
        } catch (itemErr) {
          result.push({ ...bill, items: [] });
        }
      }
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Tạo hóa đơn mới khi Thu Ngân mở bàn
  openBill: async (req, res) => {
    try {
      const { MABAN, GIOBATDAU, NGAY } = req.body;
      const pool = await poolPromise;

      let manvien = "NV001";
      const nvResult = await pool
        .request()
        .query(`SELECT TOP 1 MANVIEN FROM NHANVIEN`);
      if (nvResult.recordset.length > 0)
        manvien = nvResult.recordset[0].MANVIEN;

      const maxIdResult = await pool
        .request()
        .query(`SELECT MAHOADON FROM HOADON ORDER BY MAHOADON DESC`);
      let newId = "HD001";
      if (maxIdResult.recordset.length > 0) {
        const lastId = maxIdResult.recordset[0].MAHOADON;
        const lastNum = parseInt(lastId.replace("HD", ""), 10);
        newId = "HD" + String(lastNum + 1).padStart(3, "0");
      }

      // Xử lý lấy mã nhân viên thực tế đang đăng nhập nếu có, ưu tiên token
      const maNhanVienThucTe =
        req.user?.MANVIEN || req.body?.MANVIEN || manvien;

      await pool
        .request()
        .input("MAHOADON", sql.VarChar, newId)
        .input("MABAN", sql.VarChar, MABAN)
        .input("MANVIEN", sql.VarChar, maNhanVienThucTe)
        .input("GIOBATDAU", sql.VarChar, GIOBATDAU || null)
        .input("NGAY", sql.Date, new Date(NGAY))
        .input("TRANGTHAI", sql.NVarChar, "Đang chơi")
        .input("TONGTIENGIO", sql.Decimal(18, 0), 0)
        .input("TONGTIENHANG", sql.Decimal(18, 0), 0)
        .input("TONGTHANHTOAN", sql.Decimal(18, 0), 0).query(`
          INSERT INTO HOADON (MAHOADON, MABAN, MANVIEN, GIOBATDAU, NGAY, TRANGTHAI, TONGTIENGIO, TONGTIENHANG, TONGTHANHTOAN)
          VALUES (@MAHOADON, @MABAN, @MANVIEN, @GIOBATDAU, @NGAY, @TRANGTHAI, @TONGTIENGIO, @TONGTIENHANG, @TONGTHANHTOAN);
          
          -- CẬP NHẬT TRẠNG THÁI BÀN
          UPDATE BAN SET TRANGTHAI = N'Đang sử dụng' WHERE MABAN = @MABAN;
        `);

      // === GHI LOG ===
      await ActionHistoryModel.insertActionLog(
        maNhanVienThucTe,
        "MỞ BÀN",
        newId,
        `Khởi tạo hóa đơn mới cho bàn: ${MABAN}`,
      );

      res.json({ success: true, MAHOADON: newId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Cập nhật danh sách món cho hóa đơn
  updateBillItems: async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const pool = await poolPromise;

      // Xóa các món cũ
      await pool
        .request()
        .input("MAHOADON", sql.VarChar, id)
        .query(`DELETE FROM CHITIETHOADON WHERE MAHOADON = @MAHOADON`);

      // Lấy danh sách các mã hàng hóa hợp lệ HIỆN CÓ trong CSDL
      const validItemsRes = await pool
        .request()
        .query("SELECT MAHANGHOA FROM HANGHOA");
      const validIds = new Set(
        validItemsRes.recordset.map((i) => String(i.MAHANGHOA)),
      );

      // Thêm lại toàn bộ danh sách món mới
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = String(item.MAHANGHOA || item.id);

        if (!validIds.has(itemId)) {
          console.warn(
            `Bỏ qua lưu món ${item.TENHANGHOA || itemId} vào CTHD vì mã không tồn tại.`,
          );
          continue;
        }

        const cthd =
          "CTHD" + id.replace("HD", "") + "_" + String(i + 1).padStart(2, "0");
        const price = item.price ?? item.DONGIA ?? 0;
        const qty = item.qty ?? item.SOLUONG ?? 1;

        await pool
          .request()
          .input("MACHITETHOADON", sql.VarChar, cthd)
          .input("MAHOADON", sql.VarChar, id)
          .input("MAHANGHOA", sql.VarChar, itemId)
          .input("SOLUONG", sql.Int, qty)
          .input("DONGIA", sql.Decimal(18, 0), price)
          .input("THANHTIEN", sql.Decimal(18, 0), price * qty).query(`
            INSERT INTO CHITIETHOADON (MACHITETHOADON, MAHOADON, MAHANGHOA, SOLUONG, DONGIA, THANHTIEN)
            VALUES (@MACHITETHOADON, @MAHOADON, @MAHANGHOA, @SOLUONG, @DONGIA, @THANHTIEN)
          `);
      }

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        "CẬP NHẬT MÓN",
        id,
        `Thêm/Sửa danh sách món (Tổng: ${items.length} mặt hàng)`,
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi updateBillItems:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Thanh toán hóa đơn
  checkoutBill: async (req, res) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    const gioKetThuc = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      const { id } = req.params;
      const {
        TONGTHANHTOAN,
        MAKHUYENMAI,
        TONGTIENHANG,
        TONGTIENGIO,
        TENKHACHHANG,
        PHUONGTHUCTHANHTOAN,
      } = req.body;

      await transaction.begin();

      // 1. Chốt hóa đơn & Lưu tên khách, phương thức thanh toán
      await transaction
        .request()
        .input("MAHOADON", sql.VarChar, id)
        .input("GIOKETTHUC", sql.VarChar, gioKetThuc)
        .input("TONGTHANHTOAN", sql.Decimal(18, 0), TONGTHANHTOAN)
        .input("MAKHUYENMAI", sql.VarChar, MAKHUYENMAI || null)
        .input("TONGTIENHANG", sql.Decimal(18, 0), TONGTIENHANG || 0)
        .input("TONGTIENGIO", sql.Decimal(18, 0), TONGTIENGIO || 0)
        .input("TENKHACHHANG", sql.NVarChar, TENKHACHHANG || null)
        .input(
          "PHUONGTHUCTHANHTOAN",
          sql.NVarChar,
          PHUONGTHUCTHANHTOAN || "Tiền mặt",
        ).query(`
          UPDATE HOADON
          SET GIOKETTHUC = @GIOKETTHUC,
              TONGTHANHTOAN = @TONGTHANHTOAN,
              MAKHUYENMAI = @MAKHUYENMAI,
              TONGTIENHANG = @TONGTIENHANG,
              TONGTIENGIO = @TONGTIENGIO,
              TENKHACHHANG = @TENKHACHHANG,
              PHUONGTHUCTHANHTOAN = @PHUONGTHUCTHANHTOAN,
              TRANGTHAI = N'Đã thanh toán'
          WHERE MAHOADON = @MAHOADON
        `);

      // 2. Trả bàn về trạng thái Trống
      await transaction.request().input("MAHOADON", sql.VarChar, id).query(`
          UPDATE BAN 
          SET TRANGTHAI = N'Trống' 
          WHERE MABAN = (SELECT MABAN FROM HOADON WHERE MAHOADON = @MAHOADON)
        `);

      // 3. TRỪ TỒN KHO HÀNG HÓA TỰ ĐỘNG
      await transaction.request().input("MAHOADON", sql.VarChar, id).query(`
          UPDATE H
          SET H.SOLUONGTONKHO = ISNULL(H.SOLUONGTONKHO, 0) - C.SOLUONG
          FROM HANGHOA H
          INNER JOIN CHITIETHOADON C ON H.MAHANGHOA = C.MAHANGHOA
          WHERE C.MAHOADON = @MAHOADON
            AND ISNULL(H.LOAIHANG, '') != N'Dịch vụ' 
        `);

      await transaction.commit();

      // === GHI LOG SAU KHI TRANSACTION THÀNH CÔNG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        "THANH TOÁN HÓA ĐƠN",
        id,
        `Hoàn tất thanh toán. Tổng tiền: ${TONGTHANHTOAN?.toLocaleString()}đ (${PHUONGTHUCTHANHTOAN})`,
      );

      res.json({ success: true, message: "Thanh toán thành công!" });
    } catch (err) {
      await transaction.rollback();
      console.error("Lỗi checkoutBill:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Cập nhật giờ bắt đầu
  updateStartTime: async (req, res) => {
    try {
      const { id } = req.params;
      const { GIOBATDAU } = req.body;
      const pool = await poolPromise;

      await pool
        .request()
        .input("MAHOADON", sql.VarChar, id)
        .input("GIOBATDAU", sql.VarChar, GIOBATDAU)
        .query(
          `UPDATE HOADON SET GIOBATDAU = @GIOBATDAU WHERE MAHOADON = @MAHOADON`,
        );

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        "CẬP NHẬT GIỜ CHƠI",
        id,
        `Bắt đầu tính giờ chơi lúc ${GIOBATDAU}`,
      );

      res.json({ success: true, message: "Đã kích hoạt giờ chơi!" });
    } catch (err) {
      console.error("Lỗi updateStartTime:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Thêm vào billController.js
  getDashboardStats: async (req, res) => {
    try {
      const pool = await poolPromise;

      // 1. Lấy ngày lọc (mặc định hôm nay VN)
      const selectedDate =
        req.query.date ||
        new Intl.DateTimeFormat("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date());

      // 2. Lấy đơn ĐÃ XONG và DOANH THU (Từ HOADON)
      const statsResult = await pool
        .request()
        .input("SelectedDate", sql.VarChar, selectedDate).query(`
          SELECT COUNT(MAHOADON) as TotalOrders, ISNULL(SUM(TONGTHANHTOAN), 0) as TotalRevenue
          FROM HOADON 
          WHERE TRANGTHAI = N'Đã thanh toán' 
          AND CONVERT(VARCHAR(10), NGAY, 126) = @SelectedDate
        `);

      // 3. ĐẾM SỐ BÀN ĐANG PHỤC VỤ (Lấy trực tiếp từ bảng BAN)
      const tableStats = await pool.request().query(`
        SELECT 
          COUNT(*) as Total, 
          SUM(CASE WHEN TRANGTHAI IN (N'Đang sử dụng', N'Đang chơi') THEN 1 ELSE 0 END) as Active 
        FROM BAN
      `);
      const totalTables = tableStats.recordset[0].Total || 1;
      const activeTables = tableStats.recordset[0].Active || 0;
      const occupancyRate = Math.round((activeTables / totalTables) * 100);

      // 4. Dữ liệu biểu đồ theo giờ
      const chartResult = await pool
        .request()
        .input("SelectedDate", sql.VarChar, selectedDate).query(`
          SELECT DATEPART(HOUR, NGAY) as Hour, SUM(TONGTHANHTOAN) as Revenue, COUNT(MAHOADON) as Orders
          FROM HOADON 
          WHERE TRANGTHAI = N'Đã thanh toán' AND CONVERT(VARCHAR(10), NGAY, 126) = @SelectedDate
          GROUP BY DATEPART(HOUR, NGAY)
        `);

      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}h`,
        revenue: 0,
        orders: 0,
      }));
      chartResult.recordset.forEach((row) => {
        if (hourlyData[row.Hour]) {
          hourlyData[row.Hour].revenue = row.Revenue;
          hourlyData[row.Hour].orders = row.Orders;
        }
      });

      // 5. Giao dịch gần đây
      const recentTxResult = await pool.request().query(`
        SELECT TOP 5 H.MAHOADON, B.TENBAN, H.TONGTHANHTOAN, FORMAT(H.NGAY, 'dd/MM') + ' ' + FORMAT(H.GIOKETTHUC, 'HH:mm') as THOIGIAN_STR
        FROM HOADON H JOIN BAN B ON H.MABAN = B.MABAN
        WHERE H.TRANGTHAI = N'Đã thanh toán'
        ORDER BY H.NGAY DESC, H.GIOKETTHUC DESC
      `);

      res.json({
        success: true,
        stats: {
          completedOrders: statsResult.recordset[0].TotalOrders || 0,
          revenue: statsResult.recordset[0].TotalRevenue || 0,
          activeOrders: activeTables, // Số bàn đang hoạt động
          occupancyRate: occupancyRate, // Công suất dựa trên bảng BAN
        },
        hourlyData,
        recentTransactions: recentTxResult.recordset,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = billController;
