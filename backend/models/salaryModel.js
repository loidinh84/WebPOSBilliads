const { sql, poolPromise } = require("../config/db");

const Salary = {
  // Lấy dữ liệu bảng lương đã lưu từ SQL (dbo.LUONG)
  getExistingPayrolls: async (kytraluong) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("ky", sql.NVarChar, kytraluong)
        .query(`
          SELECT l.*, nv.TENNGUOIDUNG, nv.CHUCVU
          FROM LUONG l
          JOIN NHANVIEN nv ON l.MANVIEN = nv.MANVIEN
          WHERE l.KYTRALUONG = @ky AND (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  // Lưu hoặc cập nhật bảng lương
  saveOrUpdate: async (data) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("ma", sql.NVarChar, data.MALUONG)
        .input("mnv", sql.NVarChar, data.MANVIEN)
        .input("ky", sql.NVarChar, data.KYTRALUONG)
        .input("tonggio", sql.Decimal(10, 2), data.TONGGIOLAM)
        .input("tongluong", sql.Decimal(18, 0), data.TONGLUONG)
        .input("cantra", sql.Decimal(18, 0), data.CONCANTRA)
        .input("status", sql.NVarChar, data.TRANGTHAI)
        .query(`
          IF EXISTS (SELECT 1 FROM LUONG WHERE MALUONG = @ma OR (MANVIEN = @mnv AND KYTRALUONG = @ky))
          BEGIN
            UPDATE LUONG 
            SET TONGGIOLAM = @tonggio, TONGLUONG = @tongluong, CONCANTRA = @cantra, TRANGTHAI = @status
            WHERE MALUONG = @ma OR (MANVIEN = @mnv AND KYTRALUONG = @ky)
          END
          ELSE
          BEGIN
            INSERT INTO LUONG (MALUONG, MANVIEN, KYTRALUONG, TONGGIOLAM, TONGLUONG, CONCANTRA, TRANGTHAI)
            VALUES (@ma, @mnv, @ky, @tonggio, @tongluong, @cantra, @status)
          END
        `);
    } catch (error) {
      throw error;
    }
  },

  // Tính toán lương tạm thời dựa trên CHAMCONG
  getMonthlyCalculated: async (month, year) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year)
        .query(`
          SELECT 
            nv.MANVIEN, 
            nv.TENNGUOIDUNG, 
            nv.CHUCVU,
            SUM(ISNULL(cc.TONGGIO, 0)) as TotalHours
          FROM NHANVIEN nv
          LEFT JOIN CHAMCONG cc ON nv.MANVIEN = cc.MANVIEN 
            AND MONTH(cc.NGAY) = @month 
            AND YEAR(cc.NGAY) = @year
            AND cc.TRANGTHAI = N'Đã duyệt'
          WHERE (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
          GROUP BY nv.MANVIEN, nv.TENNGUOIDUNG, nv.CHUCVU
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Salary;
