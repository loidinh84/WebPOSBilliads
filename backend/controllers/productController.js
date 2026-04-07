const { sql, poolPromise } = require("../config/db");
const ActionHistoryModel = require("../models/actionHistoryModel");

const productController = {
  // Cập nhật trạng thái hàng hóa
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { TRANGTHAI } = req.body;
      const pool = await poolPromise;

      await pool
        .request()
        .input("MAHANGHOA", sql.VarChar, id)
        .input("TRANGTHAI", sql.Bit, TRANGTHAI)
        .query(
          "UPDATE HANGHOA SET TRANGTHAI = @TRANGTHAI WHERE MAHANGHOA = @MAHANGHOA",
        );
        
      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'CẬP NHẬT TRẠNG THÁI',
          id,
          `Cập nhật trạng thái hàng hóa thành: ${TRANGTHAI ? 'Hiện' : 'Ẩn'}`
      );

      res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 1. Lấy danh sách hàng hóa
  getAllProducts: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
                SELECT hh.*, dm.TENDANHMUC as NHOMHANG
                FROM HANGHOA hh
                LEFT JOIN DANHMUC dm ON hh.MADANHMUC = dm.MADANHMUC
                ORDER BY hh.MAHANGHOA DESC
            `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  // 2. Thêm mới hàng hóa
  createProduct: async (req, res) => {
    const {
      MAHANGHOA, TENHANGHOA, MADANHMUC, DONGIABAN, DONVITINH,
      GIANIEMYET, TONKHO, MOTA, HINHANH, LOAIHANG,
    } = req.body;

    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("MAHANGHOA", sql.VarChar, MAHANGHOA)
        .input("TENHANGHOA", sql.NVarChar, TENHANGHOA)
        .input("MADANHMUC", sql.VarChar, MADANHMUC)
        .input("DONGIABAN", sql.Decimal(18, 0), parseFloat(DONGIABAN) || 0)
        .input("DONVITINH", sql.NVarChar, DONVITINH || "Cái")
        .input("GIANIEMYET", sql.Decimal(18, 0), parseFloat(GIANIEMYET) || 0)
        .input("SOLUONGTONKHO", sql.Int, parseInt(TONKHO) || 0)
        .input("HINHANH", sql.NVarChar, HINHANH || null)
        .input("LOAIHANG", sql.NVarChar, LOAIHANG || "Hàng thường")
        .input("MOTA", sql.NVarChar, MOTA || "").query(`
                INSERT INTO HANGHOA (
                    MAHANGHOA, TENHANGHOA, MADANHMUC, DONVITINH, 
                    DONGIABAN, GIANIEMYET, SOLUONGTONKHO, 
                    HINHANH, TRANGTHAI, LOAIHANG, MOTA
                )
                VALUES (
                    @MAHANGHOA, @TENHANGHOA, @MADANHMUC, @DONVITINH,
                    @DONGIABAN, @GIANIEMYET, @SOLUONGTONKHO, 
                    @HINHANH, 1, @LOAIHANG, @MOTA
                )
            `);
            
      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'THÊM HÀNG HÓA',
          MAHANGHOA,
          `Thêm mới hàng hóa: ${TENHANGHOA}`
      );

      res.json({ success: true, message: "Thêm hàng hóa thành công!" });
    } catch (err) {
      console.error("Lỗi thêm hàng hóa:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. Cập nhật hàng hóa
  updateProduct: async (req, res) => {
    const { MAHANGHOA } = req.params;
    const {
      TENHANGHOA, DONGIABAN, GIANIEMYET, SOLUONGTONKHO, DONVITINH, HINHANH, MOTA,
    } = req.body;

    try {
      const pool = await poolPromise;
      let queryUpdate = `
            UPDATE HANGHOA 
            SET TENHANGHOA = @TENHANGHOA, 
                DONGIABAN = @DONGIABAN, 
                GIANIEMYET = @GIANIEMYET, 
                SOLUONGTONKHO = @SOLUONGTONKHO, 
                DONVITINH = @DONVITINH,
                MOTA = @MOTA
        `;
      if (HINHANH && HINHANH.startsWith("data:image")) {
        queryUpdate += `, HINHANH = @HINHANH`;
      }

      queryUpdate += ` WHERE MAHANGHOA = @MAHANGHOA`;

      const request = pool
        .request()
        .input("MAHANGHOA", sql.VarChar, MAHANGHOA)
        .input("TENHANGHOA", sql.NVarChar, TENHANGHOA)
        .input("DONGIABAN", sql.Decimal(18, 0), DONGIABAN)
        .input("DONVITINH", sql.NVarChar, DONVITINH)
        .input("GIANIEMYET", sql.Decimal(18, 0), GIANIEMYET)
        .input("SOLUONGTONKHO", sql.Int, SOLUONGTONKHO)
        .input("MOTA", sql.NVarChar, MOTA);

      if (HINHANH && HINHANH.startsWith("data:image")) {
        request.input("HINHANH", sql.NVarChar, HINHANH);
      }

      await request.query(queryUpdate);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'CẬP NHẬT HÀNG HÓA',
          MAHANGHOA,
          `Thay đổi thông tin hàng hóa: ${TENHANGHOA}`
      );

      res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Xóa hàng hóa
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;

      const result = await pool
        .request()
        .input("id", sql.VarChar, id)
        .query("DELETE FROM HANGHOA WHERE MAHANGHOA = @id");
        
      if (result.rowsAffected[0] > 0) {
        // === GHI LOG ===
        const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
        await ActionHistoryModel.insertActionLog(
            maNhanVien,
            'XÓA HÀNG HÓA',
            id,
            `Xóa hàng hóa mã số: ${id}`
        );

        res.json({ success: true, message: "Đã xóa hàng hóa thành công" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy mã hàng để xóa" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 1. Lấy danh sách danh mục
  getCategories: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT MADANHMUC, TENDANHMUC FROM DANHMUC WHERE TRANGTHAI = 1");

      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
  },

  // 2. Thêm mới danh mục
  createCategory: async (req, res) => {
    try {
      const { MADANHMUC, TENDANHMUC } = req.body;
      const pool = await poolPromise;
      await pool
        .request()
        .input("MADANHMUC", sql.VarChar, MADANHMUC)
        .input("TENDANHMUC", sql.NVarChar, TENDANHMUC).query(`
          INSERT INTO DANHMUC (MADANHMUC, TENDANHMUC, TRANGTHAI)
          VALUES (@MADANHMUC, @TENDANHMUC, 1)
        `);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'THÊM DANH MỤC',
          MADANHMUC,
          `Thêm danh mục mới: ${TENDANHMUC}`
      );

      res.json({ success: true, message: "Thêm danh mục thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. Cập nhật danh mục
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { TENDANHMUC, TRANGTHAI } = req.body;
      const pool = await poolPromise;
      await pool
        .request()
        .input("MADANHMUC", sql.VarChar, id)
        .input("TENDANHMUC", sql.NVarChar, TENDANHMUC)
        .input("TRANGTHAI", sql.Int, TRANGTHAI).query(`
          UPDATE DANHMUC 
          SET TENDANHMUC = @TENDANHMUC, TRANGTHAI = @TRANGTHAI
          WHERE MADANHMUC = @MADANHMUC
        `);

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'CẬP NHẬT DANH MỤC',
          id,
          `Thay đổi thông tin danh mục: ${TENDANHMUC}`
      );

      res.json({ success: true, message: "Cập nhật danh mục thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Xóa danh mục
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const checkProduct = await pool
        .request()
        .input("MADANHMUC", sql.VarChar, id)
        .query(
          "SELECT COUNT(*) as count FROM HANGHOA WHERE MADANHMUC = @MADANHMUC",
        );

      if (checkProduct.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa danh mục này vì vẫn còn hàng hóa bên trong!",
        });
      }

      await pool
        .request()
        .input("MADANHMUC", sql.VarChar, id)
        .query("DELETE FROM DANHMUC WHERE MADANHMUC = @MADANHMUC");

      // === GHI LOG ===
      const maNhanVien = req.user?.MANVIEN || req.body?.MANVIEN || 'NV001';
      await ActionHistoryModel.insertActionLog(
          maNhanVien,
          'XÓA DANH MỤC',
          id,
          `Xóa danh mục mã số: ${id}`
      );

      res.json({ success: true, message: "Đã xóa danh mục thành công" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = productController;