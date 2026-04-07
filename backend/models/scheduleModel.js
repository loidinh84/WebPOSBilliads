const { sql, poolPromise } = require("../config/db");

const Schedule = {
  // Lấy lịch làm việc trong một khoảng ngày
  getWeekly: async (startDate, endDate) => {
    try {
      const pool = await poolPromise;

      // 1. Lấy tất cả nhân viên trước để đảm bảo ai cũng hiện trên bảng
      const employees = await pool
        .request()
        .query(
          "SELECT MANVIEN, TENNGUOIDUNG, CHUCVU FROM NHANVIEN WHERE DAXOA = 0 OR DAXOA IS NULL",
        );

      // 2. Lấy danh sách ca làm
      const shifts = await pool
        .request()
        .input("start", sql.Date, startDate)
        .input("end", sql.Date, endDate).query(`
          SELECT lc.*, cc.GIOVAO, cc.GIORA, cc.TONGGIO, cc.TRANGTHAI 
          FROM LICHLAMVIEC lc
          LEFT JOIN CHAMCONG cc ON lc.MANVIEN = cc.MANVIEN AND lc.NGAY = cc.NGAY
          WHERE lc.NGAY BETWEEN @start AND @end
        `);

      return {
        employees: employees.recordset,
        shifts: shifts.recordset,
      };
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật hoặc thêm mới ca làm
  upsert: async (data) => {
    try {
      const pool = await poolPromise;

      // 1. Xóa ca cũ (nếu có)
      await pool
        .request()
        .input("manvien", sql.NVarChar, data.MANVIEN)
        .input("ngay", sql.Date, data.NGAY)
        .query(
          "DELETE FROM LICHLAMVIEC WHERE MANVIEN = @manvien AND NGAY = @ngay",
        );

      // 2. Thêm mới nếu không phải là OFF
      if (data.CALAM !== "OFF") {
        // Tự tạo mã MALICH mới (do bảng không có Identity tự tăng)
        const timestamp = Date.now().toString().slice(-8); // Lấy 8 số cuối timestamp để ngắn gọn
        const malich = "LC" + timestamp + Math.floor(Math.random() * 100);

        await pool
          .request()
          .input("malich", sql.NVarChar, malich)
          .input("manvien", sql.NVarChar, data.MANVIEN)
          .input("ngay", sql.Date, data.NGAY)
          .input("calam", sql.NVarChar, data.CALAM)
          .input("giobd", sql.NVarChar, data.GIOBATDAU)
          .input("giokt", sql.NVarChar, data.GIOKETTHUC).query(`
            INSERT INTO LICHLAMVIEC (MALICH, MANVIEN, NGAY, CALAM, GIOBATDAU, GIOKETTHUC)
            VALUES (@malich, @manvien, @ngay, @calam, @giobd, @giokt)
          `);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật/Thêm mới hàng loạt (Dùng cho Import)
  bulkUpsert: async (records) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      for (const rec of records) {
        const req = new sql.Request(transaction);
        // 1. Xóa cũ
        await req
          .input("manvien", sql.NVarChar, rec.MANVIEN)
          .input("ngay", sql.Date, rec.NGAY)
          .query(
            "DELETE FROM LICHLAMVIEC WHERE MANVIEN = @manvien AND NGAY = @ngay",
          );

        // 2. Thêm mới nếu không phải OFF
        if (rec.CALAM !== "OFF") {
          const malich =
            "LC" +
            Date.now().toString().slice(-6) +
            Math.floor(Math.random() * 1000);
          await req
            .input("malich", sql.NVarChar, malich)
            .input("manvien", sql.NVarChar, rec.MANVIEN)
            .input("ngay", sql.Date, rec.NGAY)
            .input("calam", sql.NVarChar, rec.CALAM)
            .input("giobd", sql.NVarChar, rec.GIOBATDAU)
            .input("giokt", sql.NVarChar, rec.GIOKETTHUC).query(`
              INSERT INTO LICHLAMVIEC (MALICH, MANVIEN, NGAY, CALAM, GIOBATDAU, GIOKETTHUC)
              VALUES (@malich, @manvien, @ngay, @calam, @giobd, @giokt)
            `);
        }
      }
      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy danh sách nhân viên theo ngày (để frontend tự lọc theo khung giờ)
  getByShift: async (date) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("date", sql.Date, date).query(`
          SELECT nv.MANVIEN, nv.TENNGUOIDUNG, nv.CHUCVU, lc.GIOBATDAU, lc.GIOKETTHUC
          FROM LICHLAMVIEC lc
          JOIN NHANVIEN nv ON lc.MANVIEN = nv.MANVIEN
          WHERE CAST(lc.NGAY AS DATE) = @date AND (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Schedule;
