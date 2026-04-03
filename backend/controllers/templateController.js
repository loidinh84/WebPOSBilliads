const { sql, poolPromise } = require("../config/db");

const templateController = {
  // 1. Lấy thông tin mẫu in dựa theo tên mẫu
  getTemplate: async (req, res) => {
    try {
      const { name } = req.params;
      const pool = await poolPromise;
      const result = await pool.request()
        .input("TENMAU", sql.NVarChar, name)
        .query("SELECT NOIDUNGHTML FROM MAUIN WHERE TENMAU = @TENMAU AND TRANGTHAI = 1");

      if (result.recordset.length > 0 && result.recordset[0].NOIDUNGHTML) {
         res.json({ success: true, data: JSON.parse(result.recordset[0].NOIDUNGHTML) });
      } else {
         res.json({ success: true, data: null, message: "Chưa có cấu hình" });
      }
    } catch (err) {
      console.error("Lỗi lấy mẫu in:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 2. Cập nhật (hoặc thêm mới) mẫu in
  saveTemplate: async (req, res) => {
    try {
      const { name } = req.params;
      const labelsData = req.body;
      const htmlContent = JSON.stringify(labelsData);

      const pool = await poolPromise;
      
      const checkResult = await pool.request()
         .input("TENMAU", sql.NVarChar, name)
         .query("SELECT MAMAU FROM MAUIN WHERE TENMAU = @TENMAU");

      if (checkResult.recordset.length > 0) {
         await pool.request()
            .input("TENMAU", sql.NVarChar, name)
            .input("NOIDUNGHTML", sql.NVarChar(sql.MAX), htmlContent)
            .query("UPDATE MAUIN SET NOIDUNGHTML = @NOIDUNGHTML WHERE TENMAU = @TENMAU");
      } else {
         const maMauId = "MI" + Date.now().toString().slice(-8);
         await pool.request()
            .input("MAMAU", sql.VarChar, maMauId)
            .input("TENMAU", sql.NVarChar, name)
            .input("NOIDUNGHTML", sql.NVarChar(sql.MAX), htmlContent)
            .query("INSERT INTO MAUIN (MAMAU, TENMAU, NOIDUNGHTML, TRANGTHAI) VALUES (@MAMAU, @TENMAU, @NOIDUNGHTML, 1)");
      }
      
      res.json({ success: true, message: "Lưu bản in thành công!" });
    } catch (err) {
      console.error("Lỗi lưu mẫu in:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = templateController;
