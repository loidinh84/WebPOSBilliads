const { sql, poolPromise } = require("../config/db");
// 1. IMPORT MODEL LỊCH SỬ THAO TÁC
const ActionHistoryModel = require("../models/actionHistoryModel");

const tableController = {
  // Hàm lấy danh sách bàn (Không cần ghi log)
  getAllTables: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
            B.MABAN, 
            B.TENBAN, 
            B.KHUVUC, 
            B.TRANGTHAI, 
            B.GHICHU,
            B.MAHANGHOA,
            H.TENHANGHOA AS LOAIBAN, 
            H.DONGIABAN AS GIAGIO,   
            D.MADANHMUC              
        FROM [dbo].[BAN] B
        LEFT JOIN [dbo].[HANGHOA] H ON B.MAHANGHOA = H.MAHANGHOA
        LEFT JOIN [dbo].[DANHMUC] D ON H.MADANHMUC = D.MADANHMUC
      `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // 2. Thêm mới bàn
  createTable: async (req, res) => {
    try {
      const { MABAN, TENBAN, KHUVUC, MAHANGHOA, GHICHU, TRANGTHAI } = req.body;
      const pool = await poolPromise;
      await pool
        .request()
        .input("MABAN", sql.VarChar, MABAN)
        .input("TENBAN", sql.NVarChar, TENBAN)
        .input("KHUVUC", sql.NVarChar, KHUVUC)
        .input("MAHANGHOA", sql.VarChar, MAHANGHOA)
        .input("TRANGTHAI", sql.NVarChar, TRANGTHAI || "Hoạt động")
        .input("GHICHU", sql.NVarChar, GHICHU || "").query(`
          INSERT INTO BAN (MABAN, TENBAN, KHUVUC, TRANGTHAI, MAHANGHOA, GHICHU)
          VALUES (@MABAN, @TENBAN, @KHUVUC, @TRANGTHAI, @MAHANGHOA, @GHICHU)
        `);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'THÊM BÀN',
          MABAN,
          `Thêm bàn mới: ${TENBAN} - Khu vực: ${KHUVUC}`
      );

      res.json({ success: true, message: "Thêm bàn thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. Cập nhật bàn
  updateTable: async (req, res) => {
    try {
      const { id } = req.params; // Đây là MABAN
      const { TENBAN, KHUVUC, MAHANGHOA, GHICHU, TRANGTHAI } = req.body;
      const pool = await poolPromise;
      await pool
        .request()
        .input("MABAN", sql.VarChar, id)
        .input("TENBAN", sql.NVarChar, TENBAN)
        .input("KHUVUC", sql.NVarChar, KHUVUC)
        .input("MAHANGHOA", sql.VarChar, MAHANGHOA)
        .input("GHICHU", sql.NVarChar, GHICHU)
        .input("TRANGTHAI", sql.NVarChar, TRANGTHAI).query(`
          UPDATE BAN 
          SET TENBAN = @TENBAN, KHUVUC = @KHUVUC, 
              MAHANGHOA = @MAHANGHOA, GHICHU = @GHICHU,
              TRANGTHAI = @TRANGTHAI
          WHERE MABAN = @MABAN
        `);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'CẬP NHẬT BÀN',
          id,
          `Thay đổi thông tin bàn: ${TENBAN}`
      );

      res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Xóa bàn
  deleteTable: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      await pool
        .request()
        .input("MABAN", sql.VarChar, id)
        .query("DELETE FROM BAN WHERE MABAN = @MABAN");

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'XÓA BÀN',
          id,
          `Xóa bàn mã số: ${id}`
      );

      res.json({ success: true, message: "Đã xóa bàn!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = tableController;