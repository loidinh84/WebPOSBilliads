const { sql, poolPromise } = require("../config/db");

const Attendance = {
  // Lấy dữ liệu chấm công và lịch làm gộp lại cho một khoảng thời gian
  getWeeklyAttendance: async (startDate, endDate) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("start", sql.Date, startDate)
        .input("end", sql.Date, endDate)
        .query(`
          WITH Dates AS (
            SELECT CAST(@start AS DATE) AS NGAY
            UNION ALL
            SELECT DATEADD(day, 1, NGAY) FROM Dates WHERE NGAY < CAST(@end AS DATE)
          )
          SELECT 
            nv.MANVIEN, 
            nv.TENNGUOIDUNG,
            nv.CHUCVU,
            d.NGAY,
            lc.GIOBATDAU AS DU_KIEN_VAO,
            lc.GIOKETTHUC AS DU_KIEN_RA,
            cc.MACHAMCONG,
            cc.GIOVAO AS THUC_TE_VAO,
            cc.GIORA AS THUC_TE_RA,
            cc.TONGGIO,
            cc.GHICHU,
            cc.TRANGTHAI
          FROM Dates d
          CROSS JOIN NHANVIEN nv
          LEFT JOIN LICHLAMVIEC lc ON nv.MANVIEN = lc.MANVIEN AND d.NGAY = lc.NGAY
          LEFT JOIN CHAMCONG cc ON nv.MANVIEN = cc.MANVIEN AND d.NGAY = cc.NGAY
          WHERE (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
          ORDER BY nv.MANVIEN, d.NGAY
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật hoặc thêm mới chấm công thủ công
  upsertRecord: async (data) => {
    try {
      const pool = await poolPromise;
      
      // Chuyển đổi chuỗi HH:mm thành Date object chuẩn cho sql.Time (Dùng UTC để tránh lệch múi giờ)
      const prepareTime = (timeStr) => {
        if (!timeStr || timeStr === "--:--") return null;
        const [h, m] = timeStr.split(":").map(Number);
        const d = new Date(Date.UTC(1970, 0, 1, h, m, 0));
        return isNaN(d.getTime()) ? null : d;
      };

      await pool.request()
        .input("ma", sql.NVarChar, data.MACHAMCONG || `CC${Date.now()}`)
        .input("mnv", sql.NVarChar, data.MANVIEN)
        .input("ngay", sql.Date, data.NGAY)
        .input("vao", sql.Time, prepareTime(data.GIOVAO))
        .input("ra", sql.Time, prepareTime(data.GIORA))
        .input("tong", sql.Decimal(5, 2), data.TONGGIO || 0)
        .input("ghi", sql.NVarChar, data.GHICHU || "")
        .input("status", sql.NVarChar, data.TRANGTHAI || 'Đã duyệt')
        .query(`
          IF EXISTS (SELECT 1 FROM CHAMCONG WHERE MACHAMCONG = @ma OR (MANVIEN = @mnv AND NGAY = @ngay))
          BEGIN
            UPDATE CHAMCONG 
            SET GIOVAO = @vao, GIORA = @ra, TONGGIO = @tong, GHICHU = @ghi, TRANGTHAI = @status
            WHERE MACHAMCONG = @ma OR (MANVIEN = @mnv AND NGAY = @ngay)
          END
          ELSE
          BEGIN
            INSERT INTO CHAMCONG (MACHAMCONG, MANVIEN, NGAY, GIOVAO, GIORA, TONGGIO, GHICHU, TRANGTHAI)
            VALUES (@ma, @mnv, @ngay, @vao, @ra, @tong, @ghi, @status)
          END
        `);
    } catch (error) {
      throw error;
    }
  },

  // Duyệt nhanh một bản ghi
  approveRecord: async (maChamCong) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("id", sql.NVarChar, maChamCong)
        .query("UPDATE CHAMCONG SET TRANGTHAI = 'Đã duyệt' WHERE MACHAMCONG = @id");
    } catch (error) {
      throw error;
    }
  },

  // Lấy các bản ghi chờ duyệt
  getPending: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT cc.*, nv.TENNGUOIDUNG 
          FROM CHAMCONG cc
          JOIN NHANVIEN nv ON cc.MANVIEN = nv.MANVIEN
          WHERE (cc.TRANGTHAI = 'Chờ duyệt' OR cc.TRANGTHAI IS NULL) AND (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
          ORDER BY cc.NGAY DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Attendance;
