const { sql, poolPromise } = require("../config/db");

const khuyenmaiModel = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM KHUYENMAI');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },
  create: async (data) => {
    try {
       const pool = await poolPromise;
       const result = await pool.request()
         .input('MAKHUYENMAI', sql.NVarChar, data.MAKHUYENMAI)
         .input('NGAYBATDAU', sql.Date, data.NGAYBATDAU)
         .input('NGAYKETTHUC', sql.Date, data.NGAYKETTHUC)
         .input('MACHITETKHOAN', sql.NVarChar, data.MACHITETKHOAN || data.MACHITIETKHUYENMAI) 
         .input('TRANGTHAI', sql.Bit, data.TRANGTHAI === undefined ? 1 : data.TRANGTHAI)
         .query(`
           INSERT INTO KHUYENMAI (MAKHUYENMAI, NGAYBATDAU, NGAYKETTHUC, MACHITETKHOAN, TRANGTHAI)
           VALUES (@MAKHUYENMAI, @NGAYBATDAU, @NGAYKETTHUC, @MACHITETKHOAN, @TRANGTHAI)
         `);
       return result;
    } catch (error) {
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MAKHUYENMAI_OLD', sql.NVarChar, id)
        .input('MAKHUYENMAI', sql.NVarChar, data.MAKHUYENMAI)
        .input('NGAYBATDAU', sql.Date, data.NGAYBATDAU)
        .input('NGAYKETTHUC', sql.Date, data.NGAYKETTHUC)
        .input('MACHITETKHOAN', sql.NVarChar, data.MACHITETKHOAN || data.MACHITIETKHUYENMAI)
        .input('TRANGTHAI', sql.Bit, data.TRANGTHAI)
        .query(`
          UPDATE KHUYENMAI 
          SET MAKHUYENMAI = @MAKHUYENMAI,
              NGAYBATDAU = @NGAYBATDAU, 
              NGAYKETTHUC = @NGAYKETTHUC, 
              MACHITETKHOAN = @MACHITETKHOAN, 
              TRANGTHAI = @TRANGTHAI
          WHERE MAKHUYENMAI = @MAKHUYENMAI_OLD
        `);
      return result;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MAKHUYENMAI', sql.NVarChar, id)
        .query('DELETE FROM KHUYENMAI WHERE MAKHUYENMAI = @MAKHUYENMAI');
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = khuyenmaiModel;
