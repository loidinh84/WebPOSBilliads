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

    if (!MAXUATHUY || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã phiếu hoặc danh sách hàng hóa",
      });
    }

    // Chuyển trạng thái về số nếu frontend gửi string
    let statusValue = 0;
    if (typeof TRANGTHAI === "string") {
      if (TRANGTHAI === "Hoàn thành") statusValue = 1;
      else if (TRANGTHAI === "Đã hủy") statusValue = 2;
      else statusValue = 0; // Phiếu tạm
    } else {
      statusValue = Number(TRANGTHAI) || 0;
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Chèn bảng chính XUATHUY
      await transaction
        .request()
        .input("ma", sql.VarChar(20), MAXUATHUY)
        .input("ld", sql.NVarChar(500), LYDO || "")
        .input("tong", sql.Decimal(18, 2), TONGTIEN || 0)
        .input("st", sql.TinyInt, statusValue) // ← Đổi thành TinyInt
        .input("nv", sql.VarChar(20), MANVIEN || null).query(`
          INSERT INTO XUATHUY (MAXUATHUY, NGAYXUATHUY, LYDO, TONGTIEN, TRANGTHAI, MANVIEN)
          VALUES (@ma, GETDATE(), @ld, @tong, @st, @nv)
        `);

      // 2. Chèn chi tiết + trừ kho
      for (const item of items) {
        const maChiTiet = "CTXH" + Math.floor(Math.random() * 1000000);

        await transaction
          .request()
          .input("mact", sql.VarChar(20), maChiTiet)
          .input("maHang", sql.VarChar, item.MAHANGHOA)
          .input("maXuat", sql.VarChar, MAXUATHUY)
          .input("soLuong", sql.Int, item.SOLUONG)
          .input("gia", sql.Decimal(18, 2), item.GIATRITHETHAI || 0)
          .input("st", sql.TinyInt, statusValue) // ← Đổi thành TinyInt
          .query(`
            INSERT INTO CHITIETXUATHUY 
              (MACHITETXUATHUY, MAHANGHOA, MAXUATHUY, SOLUONG, GIATRITHETHAI, TRANGTHAI)
            VALUES (@mact, @maHang, @maXuat, @soLuong, @gia, @st)
          `);

        // Trừ tồn kho chỉ khi trạng thái là "Hoàn thành" (1)
        if (statusValue === 1) {
          await transaction
            .request()
            .input("maHang", sql.VarChar, item.MAHANGHOA)
            .input("slXuat", sql.Int, item.SOLUONG).query(`
              UPDATE HANGHOA 
              SET SOLUONGTONKHO = SOLUONGTONKHO - @slXuat 
              WHERE MAHANGHOA = @maHang
            `);
        }
      }

      await transaction.commit();
      res.json({ success: true, message: "Lưu phiếu xuất hủy thành công!" });
    } catch (err) {
      console.error("Lỗi SQL:", err.message);
      if (transaction) await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
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
};

module.exports = ExportController;
