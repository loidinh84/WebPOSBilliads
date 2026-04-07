const { sql, poolPromise } = require("../config/db");

const importController = {
  // 1. Lấy danh sách phiếu nhập
  getAllImports: async (req, res) => {
    try {
      const pool = await poolPromise;

      const resultImports = await pool.request().query(`
        SELECT 
          N.MAPHIEUNHAP, N.THOIGIAN, NCC.TENNCC, N.CANTRANCC, 
          N.TRANGTHAI, NV.TENNGUOIDUNG AS TENNHANVIEN, 
          N.TONGTIEN, N.SOLUONG, ISNULL(N.GIAMGIA, 0) AS GIAMGIA, N.GHICHU
        FROM NHAPKHO N
        LEFT JOIN NHACUNGCAP NCC ON N.MANCC = NCC.MANCC
        LEFT JOIN NHANVIEN NV ON N.MANVIEN = NV.MANVIEN
        ORDER BY N.THOIGIAN DESC
      `);
      const resultDetails = await pool.request().query(`
        SELECT CT.*, HH.TENHANGHOA 
        FROM CHITIETNHAPKHO CT
        JOIN HANGHOA HH ON CT.MAHANGHOA = HH.MAHANGHOA
      `);

      const allImports = resultImports.recordset;
      const allDetails = resultDetails.recordset;

      const finalData = allImports.map((inv) => {
        return {
          ...inv,
          Details: allDetails.filter((d) => d.MAPHIEUNHAP === inv.MAPHIEUNHAP),
        };
      });

      res.json(finalData);
    } catch (err) {
      console.error("Lỗi lấy danh sách phiếu nhập:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // 2. Lấy CHI TIẾT các món hàng
  getImportItems: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("MAPHIEUNHAP", sql.VarChar, id)
        .query(`
          SELECT 
            C.MAHANGHOA, 
            H.TENHANGHOA, 
            C.SOLUONGNHAP, 
            C.DONGIA, 
            ISNULL(C.GIAMGIA, 0) AS GIAMGIA, 
            C.THANHTIEN
          FROM CHITIETNHAPKHO C
          LEFT JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
          WHERE C.MAPHIEUNHAP = @MAPHIEUNHAP
        `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi lấy chi tiết phiếu nhập:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hủy phiếu nhập
  cancelImport: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;

      await pool.request().input("MAPHIEUNHAP", sql.VarChar, id).query(`
          UPDATE NHAPKHO 
          SET TRANGTHAI = N'Đã hủy' 
          WHERE MAPHIEUNHAP = @MAPHIEUNHAP
        `);

      res.json({ success: true, message: "Đã hủy phiếu nhập thành công!" });
    } catch (err) {
      console.error("Lỗi khi hủy phiếu nhập:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Lấy danh sách Nhà cung cấp
  getSuppliers: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query(`SELECT MANCC, TENNCC FROM NHACUNGCAP`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Lấy danh sách Hàng hóa
  getProducts: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT MAHANGHOA, TENHANGHOA, DONGIABAN 
        FROM HANGHOA
      `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Lưu phiếu nhập mới
  createImport: async (req, res) => {
    const {
      supplierId,
      employeeId,
      items,
      note,
      discount,
      paidAmount,
      totalGoods,
      totalQty,
      status,
    } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const configReq = new sql.Request(transaction);
      const configRes = await configReq.query(`
        SELECT TOP 1 GIAVON_TRUNGBINH 
        FROM THIETLAPCUAHANG
      `);
      const isGiaVonTrungBinh =
        configRes.recordset.length > 0 &&
        configRes.recordset[0].GIAVON_TRUNGBINH
          ? 1
          : 0;
      const resultMaxPN = await pool.request().query(`
        SELECT TOP 1 MAPHIEUNHAP 
        FROM NHAPKHO 
        WHERE MAPHIEUNHAP LIKE 'PN%' 
        ORDER BY LEN(MAPHIEUNHAP) DESC, MAPHIEUNHAP DESC
      `);

      let maPhieu = "PN00001";
      if (resultMaxPN.recordset.length > 0) {
        const lastPN = resultMaxPN.recordset[0].MAPHIEUNHAP.trim();
        const lastNumber = parseInt(lastPN.replace("PN", ""), 10);
        maPhieu = "PN" + (lastNumber + 1).toString().padStart(5, "0");
      }

      const canTra = totalGoods - discount - paidAmount;

      // 2. Lưu vào bảng NHAPKHO
      const reqNhapKho = new sql.Request(transaction);
      await reqNhapKho
        .input("MAPHIEUNHAP", sql.VarChar, maPhieu)
        .input("THOIGIAN", sql.DateTime, new Date())
        .input("MANCC", sql.VarChar, supplierId)
        .input("MANVIEN", sql.VarChar, employeeId)
        .input("TONGTIEN", sql.Float, totalGoods)
        .input("GHICHU", sql.NVarChar, note)
        .input("SOLUONG", sql.Int, totalQty)
        .input("TRANGTHAI", sql.NVarChar, status)
        .input("CANTRANCC", sql.Float, canTra)
        .input("GIAMGIA", sql.Float, discount).query(`
          INSERT INTO NHAPKHO (MAPHIEUNHAP, THOIGIAN, MANCC, MANVIEN, TONGTIEN, GHICHU, SOLUONG, TRANGTHAI, CANTRANCC, GIAMGIA)
          VALUES (@MAPHIEUNHAP, @THOIGIAN, @MANCC, @MANVIEN, @TONGTIEN, @GHICHU, @SOLUONG, @TRANGTHAI, @CANTRANCC, @GIAMGIA)
        `);

      // 3. Lưu vào bảng CHITIETNHAPKHO
      for (let item of items) {
        const reqChiTiet = new sql.Request(transaction);
        const maChiTiet = "CT" + Math.floor(Math.random() * 10000);

        await reqChiTiet
          .input("MACHITIETNHAPKHO", sql.VarChar, maChiTiet)
          .input("MAPHIEUNHAP", sql.VarChar, maPhieu)
          .input("MAHANGHOA", sql.VarChar, item.MAHANGHOA)
          .input("SOLUONGNHAP", sql.Int, item.qty)
          .input("DONGIA", sql.Float, item.price)
          .input("THANHTIEN", sql.Float, item.total)
          .input("GIAMGIA", sql.Float, 0).query(`
            INSERT INTO CHITIETNHAPKHO (MACHITIETNHAPKHO, MAPHIEUNHAP, MAHANGHOA, SOLUONGNHAP, DONGIA, THANHTIEN, GIAMGIA)
            VALUES (@MACHITIETNHAPKHO, @MAPHIEUNHAP, @MAHANGHOA, @SOLUONGNHAP, @DONGIA, @THANHTIEN, @GIAMGIA)
          `);

        // 4. Nếu "Hoàn thành"
        if (status === "Đã nhập hàng") {
          const reqTonKho = new sql.Request(transaction);
          await reqTonKho
            .input("MAHANGHOA", sql.VarChar, item.MAHANGHOA)
            .input("SL", sql.Int, item.qty)
            .input("DONGIANHAP", sql.Float, item.price)
            .input("IS_TRUNGBINH", sql.Int, isGiaVonTrungBinh).query(`
              UPDATE HANGHOA 
              SET 
                -- Thuật toán Tính Giá Vốn Nâng Cấp (Chuẩn ERP)
                GIAVON = CASE 
                  WHEN @IS_TRUNGBINH = 1 THEN 
                    CASE 
                      WHEN ISNULL(SOLUONGTONKHO, 0) <= 0 THEN @DONGIANHAP
                      ELSE ROUND(
                        ((ISNULL(SOLUONGTONKHO, 0) * ISNULL(GIAVON, 0)) + (@SL * @DONGIANHAP)) 
                        / (@SL + ISNULL(SOLUONGTONKHO, 0))
                      , 0)
                    END
                  ELSE 
                    @DONGIANHAP 
                END,
                SOLUONGTONKHO = ISNULL(SOLUONGTONKHO, 0) + @SL 
              WHERE MAHANGHOA = @MAHANGHOA
            `);
        }
      }

      await transaction.commit();
      res.json({ success: true, message: "Lưu phiếu nhập thành công!" });
    } catch (err) {
      await transaction.rollback();
      console.error("Lỗi Transaction:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Thêm nhanh hàng hóa
  quickAddProduct: async (req, res) => {
    try {
      const { TENHANGHOA, DONGIABAN, MADANHMUC, DONVITINH } = req.body;
      const pool = await poolPromise;

      // 1. Lấy mã hàng lớn nhất hiện có
      const maxCodeResult = await pool.request().query(`
        SELECT TOP 1 MAHANGHOA 
        FROM HANGHOA 
        WHERE MAHANGHOA LIKE 'HH%' 
        ORDER BY LEN(MAHANGHOA) DESC, MAHANGHOA DESC
      `);

      let newMaHang = "HH00001"; // Mặc định nếu chưa có món nào
      if (maxCodeResult.recordset.length > 0) {
        const lastCode = maxCodeResult.recordset[0].MAHANGHOA.trim();
        const lastNumber = parseInt(lastCode.replace("HH", ""));
        newMaHang = "HH" + (lastNumber + 1).toString().padStart(5, "0");
      }
      await pool
        .request()
        .input("MAHANGHOA", sql.VarChar, newMaHang)
        .input("TENHANGHOA", sql.NVarChar, TENHANGHOA)
        .input("DONGIABAN", sql.Float, DONGIABAN)
        .input("MADANHMUC", sql.VarChar, MADANHMUC || null)
        .input("DONVITINH", sql.NVarChar, DONVITINH || "").query(`
          INSERT INTO HANGHOA (MAHANGHOA, TENHANGHOA, DONGIABAN, TRANGTHAI, SOLUONGTONKHO, MADANHMUC, DONVITINH) 
          VALUES (@MAHANGHOA, @TENHANGHOA, @DONGIABAN, 1, 0, @MADANHMUC, @DONVITINH)
        `);

      res.json({
        success: true,
        message: "Thêm hàng thành công",
        product: { MAHANGHOA: newMaHang, TENHANGHOA, DONGIABAN },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = importController;
