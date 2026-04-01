const { sql, poolPromise } = require("../config/db");

const billController = {
  // Hàm lấy lịch sử hóa đơn theo bàn
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

  // Hàm lấy tất cả hóa đơn
  getAllBills: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          H.MAHOADON, H.NGAY, H.TONGTIENGIO, H.TONGTIENHANG, 
          H.TONGTHANHTOAN, H.TRANGTHAI, H.MAKHUYENMAI,
          H.TENKHACHHANG,
          N.TENNGUOIDUNG AS TENNHANVIEN,
          H.GIOBATDAU, H.GIOKETTHUC,
          B.TENBAN
        FROM HOADON H
        LEFT JOIN DATBAN D ON H.MADATBAN = D.MADATBAN
        LEFT JOIN NHANVIEN N ON H.MANVIEN = N.MANVIEN
        LEFT JOIN BAN B ON H.MABAN = B.MABAN
        ORDER BY H.NGAY DESC
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi truy vấn Hóa Đơn:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hàm lấy chi tiết hóa đơn
  getBillItems: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("MAHOADON", sql.VarChar, id)
        .query(`
          SELECT 
            C.MAHANGHOA, 
            H.TENHANGHOA, 
            C.SOLUONG, 
            C.DONGIA, 
            C.THANHTIEN
          FROM CHITIETHOADON C
          JOIN HANGHOA H ON C.MAHANGHOA = H.MAHANGHOA
          WHERE C.MAHOADON = @MAHOADON
        `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi lấy chi tiết HD:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hàm hủy hóa đơn
  cancelInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;

      await pool.request().input("MAHOADON", sql.VarChar, id).query(`
          UPDATE HOADON 
          SET TRANGTHAI = N'Đã hủy' 
          WHERE MAHOADON = @MAHOADON
        `);

      res.json({ success: true, message: "Đã hủy hóa đơn thành công!" });
    } catch (err) {
      console.error("Lỗi khi hủy hóa đơn:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = billController;
