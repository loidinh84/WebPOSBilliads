const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");

const Employee = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM NHANVIEN WHERE DAXOA = 0 OR DAXOA IS NULL");
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

      // Logic tự động tạo MANVIEN và MACCH nếu thiếu
      let manvien = data.MANVIEN;
      let macch = data.MACCH;

      const existingResult = await pool.request().query("SELECT MANVIEN, MACCH FROM NHANVIEN");
      const employees = existingResult.recordset;

      // Tự động tạo MANVIEN nếu không có hoặc là mã tạm từ frontend
      if (!manvien || manvien.startsWith('NV') && manvien.length > 5) { // Ví dụ NV + timestamp
        const nvIds = employees.map(e => e.MANVIEN).filter(id => id && id.startsWith('NV')).map(id => {
          const num = parseInt(id.replace('NV', ''));
          return isNaN(num) ? 0 : num;
        });
        const maxNv = nvIds.length > 0 ? Math.max(...nvIds) : 0;
        manvien = `NV${(maxNv + 1).toString().padStart(3, '0')}`;
      }

      // Tự động tạo MACCH nếu không có
      if (!macch) {
        const mccIds = employees.map(e => e.MACCH).filter(id => id && id.startsWith('MCC')).map(id => {
          const num = parseInt(id.replace('MCC', ''));
          return isNaN(num) ? 0 : num;
        });
        const maxMcc = mccIds.length > 0 ? Math.max(...mccIds) : 0;
        macch = `MCC${(maxMcc + 1).toString().padStart(3, '0')}`;
      }

      await pool
        .request()
        .input("manvien", sql.NVarChar, manvien)
        .input("macch", sql.NVarChar, macch)
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

      return { success: true, manvien: manvien, macch: macch };
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

  delete: async (id, username) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      // 1. Đánh dấu xóa nhân viên trong bảng NHANVIEN (Soft Delete)
      await transaction
        .request()
        .input("id", sql.NVarChar, id)
        .query("UPDATE NHANVIEN SET DAXOA = 1 WHERE MANVIEN = @id");

      // 2. Đánh dấu xóa tài khoản liên quan trong bảng TAIKHOAN (Soft Delete)
      if (username) {
        await transaction
          .request()
          .input("username", sql.NVarChar, username)
          .query("UPDATE TAIKHOAN SET DAXOA = 1 WHERE TENDANGNHAP = @username");
      }

      await transaction.commit();
      return { success: true };
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  },
};

module.exports = Employee;
