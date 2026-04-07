const { sql, poolPromise } = require("../config/db");

const LeaveRequest = {
  // Lấy tất cả yêu cầu chưa xử lý
  getAllPending: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT YC.*, NV.TENNGUOIDUNG as FullName 
        FROM YEUCAUNGHIPHEP YC
        JOIN NHANVIEN NV ON YC.MANVIEN = NV.MANVIEN
        WHERE YC.TRANGTHAI = N'Chờ duyệt' AND (NV.DAXOA = 0 OR NV.DAXOA IS NULL)
        ORDER BY YC.NGAYGUI DESC
      `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật trạng thái yêu cầu và nhân viên
  approve: async (id) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      // 1. Lấy mã nhân viên từ yêu cầu
      const requestData = await transaction
        .request()
        .input("id", sql.Int, id)
        .query("SELECT MANVIEN FROM YEUCAUNGHIPHEP WHERE MAYEUCAU = @id");

      if (requestData.recordset.length === 0)
        throw new Error("Không tìm thấy yêu cầu");
      const manvien = requestData.recordset[0].MANVIEN;

      // 2. Cập nhật trạng thái yêu cầu thành 'Đã duyệt'
      await transaction
        .request()
        .input("id", sql.Int, id)
        .query(
          "UPDATE YEUCAUNGHIPHEP SET TRANGTHAI = N'Đã duyệt' WHERE MAYEUCAU = @id",
        );

      // 3. Cập nhật trạng thái nhân viên thành 'Đã nghỉ' (0)
      await transaction
        .request()
        .input("manvien", sql.NVarChar, manvien)
        .query("UPDATE NHANVIEN SET TRANGTHAI = 0 WHERE MANVIEN = @manvien");

      await transaction.commit();
      return { success: true };
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  },

  // Từ chối yêu cầu
  reject: async (id) => {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          "UPDATE YEUCAUNGHIPHEP SET TRANGTHAI = N'Từ chối' WHERE MAYEUCAU = @id",
        );
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = LeaveRequest;
