const { sql, poolPromise } = require("../config/db");

const billController = {
  getHistoryByTable: async (req, res) => {
    try {
      const { maban } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("MABAN", sql.VarChar, maban)
        .query(`
          SELECT MAHOADON, NGAY, GIOBATDAU, GIOKETTHUC, TONGTHANHTOAN 
          FROM HOADON 
          WHERE MABAN = @MABAN AND TRANGTHAI = N'Đã thanh toán'
          ORDER BY NGAY DESC, GIOKETTHUC DESC
        `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getBillDetail: async (req, res) => {
    // Logic lấy chi tiết cả nước uống, dịch vụ...
  },
};

module.exports = billController;
