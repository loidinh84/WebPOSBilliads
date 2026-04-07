const { sql, poolPromise } = require("../config/db");
const ActionHistoryModel = require("../models/actionHistoryModel");

const inventoryController = {
  // 1. Lấy danh sách phiếu kiểm kho
  getAllSlips: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          MAKIEMKHO AS id, 
          FORMAT(THOIGIAN, 'dd/MM/yyyy HH:mm') AS createdDate,
          TONGCHENHLECH AS totalDiff,
          SOLUONGLECHTANG AS incDiff,
          SOLUONGLECHGIAM AS decDiff,
          GHICHU AS note,
          TRANGTHAI AS status
        FROM KIEMKHO
        ORDER BY THOIGIAN DESC
      `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      console.error("Lỗi lấy danh sách phiếu kiểm:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 2. Lấy chi tiết hàng hóa trong một phiếu
  getSlipDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("id", sql.VarChar, id).query(`
          SELECT 
            CT.MAHANGHOA, 
            H.TENHANGHOA, 
            CT.TONKHO, 
            CT.SOLUONGCHENHLECH AS LECH
          FROM CHITIETKIEMKHO CT
          JOIN HANGHOA H ON CT.MAHANGHOA = H.MAHANGHOA
          WHERE CT.MAKIEMKHO = @id
        `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. Tạo phiếu kiểm kho mới (Đã sửa lỗi chữ N)
  createInventorySlip: async (req, res) => {
    const { items, note, isDraft } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Tự sinh mã phiếu PKK...
      const maxIdRes = await transaction
        .request()
        .query("SELECT TOP 1 MAKIEMKHO FROM KIEMKHO ORDER BY MAKIEMKHO DESC");
      let newId = "PKK000001";
      if (maxIdRes.recordset.length > 0) {
        const lastNum = parseInt(
          maxIdRes.recordset[0].MAKIEMKHO.replace("PKK", ""),
          10,
        );
        newId = "PKK" + String(lastNum + 1).padStart(6, "0");
      }

      const totalInc = items.reduce(
        (sum, i) => (i.THUCTE > i.TONKHO ? sum + (i.THUCTE - i.TONKHO) : sum),
        0,
      );
      const totalDec = items.reduce(
        (sum, i) => (i.THUCTE < i.TONKHO ? sum + (i.TONKHO - i.THUCTE) : sum),
        0,
      );

      // SỬA LỖI TẠI ĐÂY: Bỏ chữ N ở trước chuỗi
      const status = isDraft ? "Phiếu tạm" : "Đã cân bằng kho";

      await transaction
        .request()
        .input("id", sql.VarChar, newId)
        .input("thoigian", sql.DateTime, new Date())
        .input("status", sql.NVarChar, status)
        .input("diff", sql.Decimal(18, 0), totalInc - totalDec)
        .input("inc", sql.Int, totalInc)
        .input("dec", sql.Int, totalDec)
        .input("note", sql.NVarChar, note || "").query(`
          INSERT INTO KIEMKHO (MAKIEMKHO, THOIGIAN, TRANGTHAI, TONGCHENHLECH, SOLUONGLECHTANG, SOLUONGLECHGIAM, GHICHU)
          VALUES (@id, @thoigian, @status, @diff, @inc, @dec, @note)
        `);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const detailId = "CTKK" + newId.replace("PKK", "") + "_" + (i + 1);

        await transaction
          .request()
          .input("ctid", sql.VarChar, detailId)
          .input("mahang", sql.VarChar, item.MAHANGHOA)
          .input("maphieu", sql.VarChar, newId)
          .input("tonkho", sql.Int, item.TONKHO)
          .input("lech", sql.Int, item.THUCTE - item.TONKHO).query(`
            INSERT INTO CHITIETKIEMKHO (MACHITETKIEMKHO, MAHANGHOA, MAKIEMKHO, TONKHO, SOLUONGCHENHLECH)
            VALUES (@ctid, @mahang, @maphieu, @tonkho, @lech)
          `);

        if (!isDraft) {
          await transaction
            .request()
            .input("mahang", sql.VarChar, item.MAHANGHOA)
            .input("thucte", sql.Int, item.THUCTE)
            .query(
              `UPDATE HANGHOA SET SOLUONGTONKHO = @thucte WHERE MAHANGHOA = @mahang`,
            );
        }
      }

      await transaction.commit();

      // Ghi Log
      const maNhanVien = req.user?.MANVIEN || "NV001";
      await ActionHistoryModel.insertActionLog(
        maNhanVien,
        isDraft ? "KIỂM KHO (TẠM)" : "HOÀN THÀNH KIỂM KHO",
        newId,
        `Mã phiếu: ${newId}`,
      );

      res.json({ success: true, MAKIEMKHO: newId });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = inventoryController;
