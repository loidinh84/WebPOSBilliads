const { sql, poolPromise } = require("../config/db");

const discountModel = {
  getAll: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM KHUYENMAI ORDER BY MAKHUYENMAI DESC");
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const pool = await poolPromise;

      // --- LOGIC TỰ ĐỘNG SINH MÁ KHUYẾN MÃI (KM000001) ---
      const lastRecord = await pool.request().query(`
          SELECT TOP 1 MAKHUYENMAI 
          FROM KHUYENMAI 
          ORDER BY MAKHUYENMAI DESC
       `);

      let newMaKM = "KM000001"; // Mặc định nếu bảng rỗng
      if (lastRecord.recordset.length > 0) {
        const lastMa = lastRecord.recordset[0].MAKHUYENMAI; // VD: KM000005
        const numberPart = parseInt(lastMa.replace("KM", ""), 10);
        if (!isNaN(numberPart)) {
          const nextNumber = numberPart + 1;
          // Hàm padStart(6, '0') sẽ tự động chèn thêm số 0 cho đủ 6 ký tự
          newMaKM = "KM" + String(nextNumber).padStart(6, "0");
        }
      }

      const result = await pool
        .request()
        .input("MAKHUYENMAI", sql.NVarChar, newMaKM)
        .input("TENKHUYENMAI", sql.NVarChar, data.TENKHUYENMAI || "") // Bổ sung Tên KM
        .input("NGAYBATDAU", sql.Date, data.NGAYBATDAU || null)
        .input("NGAYKETTHUC", sql.Date, data.NGAYKETTHUC || null)
        .input(
          "MACHITETKHOAN",
          sql.NVarChar,
          data.MACHITETKHOAN || data.MACHITIETKHUYENMAI || "",
        )
        .input(
          "TRANGTHAI",
          sql.Bit,
          data.TRANGTHAI === undefined ? 1 : data.TRANGTHAI,
        ).query(`
           INSERT INTO KHUYENMAI (MAKHUYENMAI, TENKHUYENMAI, NGAYBATDAU, NGAYKETTHUC, MACHITETKHOAN, TRANGTHAI)
           VALUES (@MAKHUYENMAI, @TENKHUYENMAI, @NGAYBATDAU, @NGAYKETTHUC, @MACHITETKHOAN, @TRANGTHAI)
         `);
      return result;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("MAKHUYENMAI_OLD", sql.NVarChar, id)
        .input("MAKHUYENMAI", sql.NVarChar, data.MAKHUYENMAI)
        .input("TENKHUYENMAI", sql.NVarChar, data.TENKHUYENMAI || "") // Bổ sung Tên KM
        .input("NGAYBATDAU", sql.Date, data.NGAYBATDAU || null)
        .input("NGAYKETTHUC", sql.Date, data.NGAYKETTHUC || null)
        .input(
          "MACHITETKHOAN",
          sql.NVarChar,
          data.MACHITETKHOAN || data.MACHITIETKHUYENMAI || "",
        )
        .input("TRANGTHAI", sql.Bit, data.TRANGTHAI).query(`
          UPDATE KHUYENMAI 
          SET MAKHUYENMAI = @MAKHUYENMAI,
              TENKHUYENMAI = @TENKHUYENMAI,
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
      const result = await pool
        .request()
        .input("MAKHUYENMAI", sql.NVarChar, id)
        .query("DELETE FROM KHUYENMAI WHERE MAKHUYENMAI = @MAKHUYENMAI");
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = discountModel;
