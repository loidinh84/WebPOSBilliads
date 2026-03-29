const { sql, poolPromise } = require("../config/db");

const User = {
  findByUsername: async (username) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("username", sql.VarChar, username).query(`
            SELECT 
                t.TENDANGNHAP, t.QUYENHAN, t.TRANGTHAI,
                n.MANVIEN, n.TENNGUOIDUNG, n.SDT, 
                n.EMAIL,
                n.DIACHI, n.GIOITINH, n.NGAYSINH, n.HINHANH
            FROM TAIKHOAN t
            LEFT JOIN NHANVIEN n ON t.TENDANGNHAP = n.TENDANGNHAP
            WHERE t.TENDANGNHAP = @username
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (username, data) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("name", sql.NVarChar, data.TENNGUOIDUNG)
        .input("phone", sql.VarChar, data.SDT)
        .input("email", sql.VarChar, data.EMAIL)
        .input("address", sql.NVarChar, data.DIACHI || null)
        .input("dob", sql.Date, data.NGAYSINH || null)
        .input("gender", sql.NVarChar, data.GIOITINH || null)
        .input("image", sql.NVarChar(sql.MAX), data.HINHANH || null).query(`
            UPDATE NHANVIEN 
            SET TENNGUOIDUNG = @name, SDT = @phone, EMAIL = @email,
                DIACHI = @address, NGAYSINH = @dob, GIOITINH = @gender, HINHANH = @image
            WHERE TENDANGNHAP = @username
        `);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (username, newPassword) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, newPassword).query(`
                UPDATE TAIKHOAN 
                SET MATKHAU = @password 
                WHERE TENDANGNHAP = @username
            `);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  verifyPassword: async (username) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("username", sql.VarChar, username)
            .query("SELECT MATKHAU FROM TAIKHOAN WHERE TENDANGNHAP = @username");
        return result.recordset[0];
    } catch (error) {
        throw error;
    }
}
};

module.exports = User;
