const { sql, poolPromise } = require("../config/db");

const kitchenController = {
  // 1. API Thu ngân bấm "Báo Bếp"
  notifyKitchen: async (req, res) => {
    try {
      const { billId } = req.params;
      const pool = await poolPromise;
      await pool.request().input("MAHOADON", sql.VarChar, billId).query(`
          UPDATE C
          SET C.TRANGTHAI_BEP = N'Chờ chế biến'
          FROM CHITIETHOADON C
          INNER JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
          LEFT JOIN DANHMUC D ON H.MADANHMUC = D.MADANHMUC
          WHERE C.MAHOADON = @MAHOADON 
            AND C.TRANGTHAI_BEP = N'Chưa báo'
            AND UPPER(ISNULL(D.TENDANHMUC, '')) != N'LOẠI BÀN'
        `);

      res.json({ success: true, message: "Đã báo bếp thành công!" });
    } catch (err) {
      console.error("Lỗi notifyKitchen:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 2. API Màn hình Bếp lấy danh sách món
  getKitchenItems: async (req, res) => {
    try {
      const pool = await poolPromise;

      const result = await pool.request().query(`
        SELECT 
          C.MACHITETHOADON,
          C.MAHOADON,
          C.SOLUONG,
          C.TRANGTHAI_BEP,
          H.TENHANGHOA,
          B.TENBAN,
          B.MABAN,
          HD.GIOBATDAU
        FROM CHITIETHOADON C
        INNER JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
        INNER JOIN HOADON HD ON C.MAHOADON = HD.MAHOADON
        INNER JOIN BAN B ON HD.MABAN = B.MABAN
        LEFT JOIN DANHMUC D ON H.MADANHMUC = D.MADANHMUC
        WHERE HD.TRANGTHAI = N'Đang chơi'
          AND C.TRANGTHAI_BEP IN (N'Chờ chế biến', N'Đã xong')
          AND UPPER(ISNULL(D.TENDANHMUC, '')) != N'LOẠI BÀN'
        ORDER BY HD.GIOBATDAU ASC
      `);

      res.json({ success: true, data: result.recordset });
    } catch (err) {
      console.error("Lỗi getKitchenItems:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. API Đầu bếp bấm nút cập nhật trạng thái
  updateItemStatus: async (req, res) => {
    try {
      const { id } = req.params; 
      const { status } = req.body; 
      const pool = await poolPromise;

      await pool
        .request()
        .input("MACHITETHOADON", sql.VarChar, id)
        .input("TRANGTHAI_BEP", sql.NVarChar, status).query(`
          UPDATE CHITIETHOADON
          SET TRANGTHAI_BEP = @TRANGTHAI_BEP
          WHERE MACHITETHOADON = @MACHITETHOADON
        `);

      res.json({ success: true, message: "Đã cập nhật trạng thái món!" });
    } catch (err) {
      console.error("Lỗi updateItemStatus:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = kitchenController;
