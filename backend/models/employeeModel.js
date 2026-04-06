const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");

const Employee = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM NHANVIEN");
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.NVarChar, id)
        .query("SELECT * FROM NHANVIEN WHERE MANVIEN = @id");
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("manvien", sql.NVarChar, data.MANVIEN)
        .input("macch", sql.NVarChar, data.MACCH)
        .input("tendangnhap", sql.NVarChar, data.TENDANGNHAP || null)
        .input("tennguoidung", sql.NVarChar, data.TENNGUOIDUNG)
        .input("matkhau", sql.NVarChar, data.MATKHAU || null)
        .input("sdt", sql.NVarChar, data.SDT || null)
        .input("email", sql.NVarChar, data.EMAIL || null)
        .input("chucvu", sql.NVarChar, data.CHUCVU || null)
        .input("trangthai", sql.Bit, 1)
        .input("hinhanh", sql.NVarChar(sql.MAX), data.HINHANH || null)
        .input("ngaysinh", sql.Date, data.NGAYSINH || null)
        .input("gioitinh", sql.NVarChar, data.GIOITINH || null)
        .input("diachi", sql.NVarChar, data.DIACHI || null)
        .input("cccd", sql.NVarChar, data.CCCD || null)
        .query(`
          INSERT INTO NHANVIEN (MANVIEN, MACCH, TENDANGNHAP, TENNGUOIDUNG, MATKHAU, SDT, EMAIL, CHUCVU, TRANGTHAI, HINHANH, NGAYSINH, GIOITINH, DIACHI, CCCD)
          VALUES (@manvien, @macch, @tendangnhap, @tennguoidung, @matkhau, @sdt, @email, @chucvu, @trangthai, @hinhanh, @ngaysinh, @gioitinh, @diachi, @cccd)
        `);

      return { success: true, manvien: data.MANVIEN };
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.NVarChar, id)
        .input("macch", sql.NVarChar, data.MACCH || null)
        .input("tennguoidung", sql.NVarChar, data.TENNGUOIDUNG || null)
        .input("sdt", sql.NVarChar, data.SDT || null)
        .input("email", sql.NVarChar, data.EMAIL || null)
        .input("chucvu", sql.NVarChar, data.CHUCVU || null)
        .input("hinhanh", sql.NVarChar(sql.MAX), data.HINHANH || null)
        .input("ngaysinh", sql.Date, data.NGAYSINH || null)
        .input("gioitinh", sql.NVarChar, data.GIOITINH || null)
        .input("diachi", sql.NVarChar, data.DIACHI || null)
        .input("cccd", sql.NVarChar, data.CCCD || null)
        .query(`
          UPDATE NHANVIEN 
          SET MACCH = @macch, 
              TENNGUOIDUNG = @tennguoidung, 
              SDT = @sdt, 
              EMAIL = @email, 
              CHUCVU = @chucvu, 
              HINHANH = @hinhanh, 
              NGAYSINH = @ngaysinh, 
              GIOITINH = @gioitinh, 
              DIACHI = @diachi,
              CCCD = @cccd
          WHERE MANVIEN = @id
        `);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.NVarChar, id)
        .query("DELETE FROM NHANVIEN WHERE MANVIEN = @id");

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Employee;
