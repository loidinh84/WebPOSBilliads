const { sql, poolPromise } = require("../config/db");

const ExportController = {
  // 1. Lấy mã phiếu xuất hủy cuối cùng
  getLastCode: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT TOP 1 MAXUATHUY 
          FROM XUATHUY 
          ORDER BY NGAYXUATHUY DESC
        `);

      res.json({
        lastCode:
          result.recordset.length > 0 ? result.recordset[0].MAXUATHUY : null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server khi lấy mã cuối" });
    }
  },

  // 2. Lấy danh sách phiếu xuất hủy
  getAllExports: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          XH.MAXUATHUY, 
          XH.NGAYXUATHUY, 
          XH.LYDO, 
          XH.TONGTIEN, 
          XH.TRANGTHAI,
          NV.TENNGUOIDUNG AS NGUOITAO
        FROM XUATHUY XH
        LEFT JOIN NHANVIEN NV ON XH.MANVIEN = NV.MANVIEN
        ORDER BY XH.NGAYXUATHUY DESC
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  // 3. TẠO PHIẾU XUẤT HỦY
  createExport: async (req, res) => {
    const {
      MAXUATHUY,
      LYDO,
      TONGTIEN,
      TRANGTHAI,
      items = [],
      MANVIEN,
    } = req.body;

    if (!MAXUATHUY || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã phiếu hoặc danh sách hàng hóa",
      });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Chèn vào bảng XUATHUY
      await transaction
        .request()
        .input("ma", sql.VarChar(20), MAXUATHUY)
        .input("ld", sql.NVarChar(500), LYDO || "")
        .input("tong", sql.Decimal(18, 2), TONGTIEN || 0)
        .input("st", sql.TinyInt, Number(TRANGTHAI))
        .input("nv", sql.VarChar(20), MANVIEN).query(`
          INSERT INTO XUATHUY (MAXUATHUY, NGAYXUATHUY, LYDO, TONGTIEN, TRANGTHAI, MANVIEN)
          VALUES (@ma, GETDATE(), @ld, @tong, @st, @nv)
        `);

      // 2. Chèn vào bảng CHITIETXUATHUY & Cập nhật kho
      for (const item of items) {
        // Tạo mã chi tiết duy nhất
        const maChiTiet =
          "CTXH" +
          Date.now().toString().slice(-6) +
          Math.floor(Math.random() * 10);

        await transaction
          .request()
          .input("mact", sql.VarChar(20), maChiTiet)
          .input("maHang", sql.VarChar(20), item.MAHANGHOA)
          .input("maXuat", sql.VarChar(20), MAXUATHUY)
          .input("soLuong", sql.Int, item.SOLUONG)
          .input("gia", sql.Decimal(18, 2), item.GIATRITHIETHAI || 0)
          .input("st", sql.TinyInt, Number(TRANGTHAI)).query(`
            INSERT INTO CHITIETXUATHUY 
              (MACHITIETXUATHUY, MAHANGHOA, MAXUATHUY, SOLUONG, GIATRITHIETHAI, TRANGTHAI)
            VALUES (@mact, @maHang, @maXuat, @soLuong, @gia, @st)
          `);

        // 3. CHỈ TRỪ KHO KHI TRANGTHAI = 1 (Hoàn thành)
        if (Number(TRANGTHAI) === 1) {
          await transaction
            .request()
            .input("maH", sql.VarChar(20), item.MAHANGHOA)
            .input("sl", sql.Int, item.SOLUONG).query(`
              UPDATE HANGHOA 
              SET SOLUONGTONKHO = SOLUONGTONKHO - @sl 
              WHERE MAHANGHOA = @maH
            `);
        }
      }

      await transaction.commit();
      res.json({ success: true, message: "Lưu phiếu thành công!" });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error("Lỗi SQL CreateExport:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
  },

  // 4. Lấy chi tiết phiếu
  getExportDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("maXH", sql.VarChar, id).query(`
          SELECT CT.*, HH.TENHANGHOA 
          FROM CHITIETXUATHUY CT
          JOIN HANGHOA HH ON CT.MAHANGHOA = HH.MAHANGHOA
          WHERE CT.MAXUATHUY = @maXH
        `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // 5. Hủy phiếu
  cancelExport: async (req, res) => {
    const { id } = req.params;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Kiểm tra trạng thái phiếu
      const currentInvoice = await transaction
        .request()
        .input("id", sql.VarChar, id)
        .query("SELECT TRANGTHAI FROM XUATHUY WHERE MAXUATHUY = @id");

      if (currentInvoice.recordset[0].TRANGTHAI === 1) {
        const items = await transaction
          .request()
          .input("id", sql.VarChar, id)
          .query(
            "SELECT MAHANGHOA, SOLUONG FROM CHITIETXUATHUY WHERE MAXUATHUY = @id",
          );

        for (const item of items.recordset) {
          await transaction
            .request()
            .input("maH", sql.VarChar, item.MAHANGHOA)
            .input("sl", sql.Int, item.SOLUONG)
            .query(
              "UPDATE HANGHOA SET SOLUONGTONKHO = SOLUONGTONKHO + @sl WHERE MAHANGHOA = @maH",
            );
        }
      }

      // 3. Cập nhật trạng thái phiếu thành 2
      await transaction
        .request()
        .input("id", sql.VarChar, id)
        .query("UPDATE XUATHUY SET TRANGTHAI = 2 WHERE MAXUATHUY = @id");

      await transaction
        .request()
        .input("id", sql.VarChar, id)
        .query("UPDATE CHITIETXUATHUY SET TRANGTHAI = 2 WHERE MAXUATHUY = @id");

      await transaction.commit();
      res.json({
        success: true,
        message: "Đã hủy phiếu và hoàn tồn kho thành công!",
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      res.status(500).json({ message: err.message });
    }
  },

  getNextCode: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT TOP 1 MAXUATHUY FROM XUATHUY ORDER BY MAXUATHUY DESC");
      let nextCode = "XH000001";
      if (result.recordset.length > 0) {
        const lastCode = result.recordset[0].MAXUATHUY;
        const number = parseInt(lastCode.replace("XH", "")) + 1;
        nextCode = `XH${number.toString().padStart(6, "0")}`;
      }
      res.json({ nextCode });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getProducts: async (req, res) => {
    try {
      const { query } = req.query;
      const pool = await poolPromise;

      // DÒNG NÀY SẼ HIỆN Ở TERMINAL NẾU BẠN GỌI ĐÚNG API
      console.log("-----------------------------------------");
      console.log("===> BACKEND NHẬN TỪ KHÓA:", query);
      console.log("-----------------------------------------");

      if (!query) return res.json([]);

      const result = await pool
        .request()
        .input("search", sql.NVarChar, `%${query.trim()}%`).query(`
            SELECT TOP 10 
                LTRIM(RTRIM(MAHANGHOA)) AS MAHANGHOA, 
                LTRIM(RTRIM(TENHANGHOA)) AS TENHANGHOA, 
                SOLUONGTONKHO, 
                DONGIABAN AS GIANHAP 
            FROM HANGHOA 
            WHERE 
                MAHANGHOA LIKE @search 
                OR TENHANGHOA LIKE @search
                OR TENHANGHOA COLLATE Vietnamese_CI_AI LIKE @search
        `);

      console.log("===> ĐÃ TÌM THẤY:", result.recordset.length, "SẢN PHẨM");
      res.json(result.recordset);
    } catch (err) {
      console.error("LỖI SQL:", err.message);
      res.status(500).json({ message: err.message });
    }
  },

  getDetailsBulk: async (req, res) => {
    try {
      const { codes } = req.body;
      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return res.json([]);
      }

      const pool = await poolPromise;
      const formattedCodes = codes.map((c) => `'${c}'`).join(",");

      const query = `
        SELECT MAHANGHOA, TENHANGHOA, DONGIABAN 
        FROM HANGHOA 
        WHERE MAHANGHOA IN (${formattedCodes})
      `;

      const result = await pool.request().query(query);

      const finalData = result.recordset.map((item) => ({
        MAHANGHOA: item.MAHANGHOA,
        TENHANGHOA: item.TENHANGHOA,
        GIANHAP: item.DONGIABAN || 0,
      }));

      res.json(finalData);
    } catch (err) {
      console.error("Lỗi getDetailsBulk:", err.message);
      res.status(500).json({ message: "Lỗi SQL: " + err.message });
    }
  },
};

module.exports = ExportController;
