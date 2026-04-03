const { sql, poolPromise } = require("../config/db");

const returnImportController = {
  // Lấy danh sách phiếu trả hàng
  getAllReturnImports: async (req, res) => {
    try {
      const pool = await poolPromise;

      // 1. Lấy thông tin chung của phiếu trả
      const resultInvoices = await pool.request().query(`
        SELECT 
          P.MAPHIEUTRAHANGNHAP, 
          P.THOIGIAN, 
          NCC.TENNCC, 
          P.TONGTENHANGTHANG as TONGTIEN, 
          P.GIAMGIA, 
          P.NCCCANTRA, 
          (P.TONGTENHANGTHANG - P.GIAMGIA - P.NCCCANTRA) as NCCDATRA, -- Tính số tiền NCC đã trả
          P.TRANGTHAI, 
          NV.TENNGUOIDUNG AS TENNHANVIEN
        FROM PHIEUTRAHANGNHAP P
        LEFT JOIN NHACUNGCAP NCC ON P.MANCC = NCC.MANCC
        LEFT JOIN NHANVIEN NV ON P.MANVIEN = NV.MANVIEN
        ORDER BY P.THOIGIAN DESC
      `);

      // 2. Lấy chi tiết hàng hóa của tất cả các phiếu trả
      const resultDetails = await pool.request().query(`
        SELECT CT.*, HH.TENHANGHOA, HH.DONGIABAN,
        ISNULL(
      (SELECT TOP 1 DONGIA 
      FROM CHITIETNHAPKHO 
      WHERE MAHANGHOA = CT.MAHANGHOA 
      ORDER BY MAPHIEUNHAP DESC), 
      CT.DONGIATRA -- Nếu chưa từng nhập hàng này, lấy tạm giá trả lại để tránh hiện số 0
    ) as GIANHAPCU
        FROM CHITIETTRAHANGNHAP CT
        JOIN HANGHOA HH ON CT.MAHANGHOA = HH.MAHANGHOA
      `);

      const allInvoices = resultInvoices.recordset;
      const allDetails = resultDetails.recordset;

      // 3. Gộp chi tiết vào từng phiếu
      const finalData = allInvoices.map((inv) => ({
        ...inv,
        items: allDetails.filter(
          (d) => d.MAPHIEUTRAHANGNHAP === inv.MAPHIEUTRAHANGNHAP,
        ),
      }));

      res.json(finalData);
    } catch (err) {
      console.error("Lỗi lấy danh sách phiếu trả:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Hủy phiếu trả
  cancelReturnImport: async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.VarChar, id)
        .query(
          "UPDATE PHIEUTRAHANGNHAP SET TRANGTHAI = N'Đã hủy' WHERE MAPHIEUTRAHANGNHAP = @id",
        );

      res.json({ success: true, message: "Đã hủy phiếu trả hàng thành công" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  createReturnImport: async (req, res) => {
    const {
      MAPHIEUTRAHANGNHAP,
      MANCC,
      MANVIEN,
      TONGTENHANGTHANG,
      GIAMGIA,
      NCCCANTRA,
      TRANGTHAI,
      LYDOTRA,
      items,
    } = req.body;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      await transaction
        .request()
        .input("ma", sql.VarChar, MAPHIEUTRAHANGNHAP)
        .input("ncc", sql.VarChar, MANCC)
        .input("nv", sql.VarChar, MANVIEN)
        .input("tong", sql.Decimal(18, 2), TONGTENHANGTHANG)
        .input("gg", sql.Decimal(18, 2), GIAMGIA)
        .input("ct", sql.Decimal(18, 2), NCCCANTRA)
        .input("st", sql.NVarChar, TRANGTHAI).query(`
                INSERT INTO PHIEUTRAHANGNHAP (MAPHIEUTRAHANGNHAP, MANCC, MANVIEN, THOIGIAN, TONGTENHANGTHANG, NCCCANTRA, GIAMGIA, TRANGTHAI)
                VALUES (@ma, @ncc, @nv, GETDATE(), @tong, @ct, @gg, @st)
            `);

      // 2. Chèn vào bảng CHITIETTRAHANGNHAP (Khớp image_f9a161.png)
      for (const item of items) {
        const MACHITIET = "CTTH" + Date.now() + Math.floor(Math.random() * 100);

        await transaction
          .request()
          .input("mact", sql.VarChar, MACHITIET)
          .input("map", sql.VarChar, MAPHIEUTRAHANGNHAP)
          .input("mah", sql.VarChar, item.MAHANGHOA)
          .input("sl", sql.Int, item.SOLUONG)
          .input("dg", sql.Decimal(18, 2), item.DONGIATRA)
          .input("tt", sql.Decimal(18, 2), item.THANHTIEN)
          .input("ld", sql.NVarChar, LYDOTRA)
          .input("st", sql.NVarChar, TRANGTHAI).query(`
                    INSERT INTO CHITIETTRAHANGNHAP (MACHITIETTRAHANGNHAP, MAPHIEUTRAHANGNHAP, MAHANGHOA, LYDOTRA, SOLUONG, DONGIATRA, THANHTIEN, TRANGTHAI)
                    VALUES (@mact, @map, @mah, @ld, @sl, @dg, @tt, @st)
                `);

        // 3. TRỪ KHO HÀNG (Nếu là 'Đã trả hàng')
        if (TRANGTHAI === "Đã trả hàng") {
          await transaction
            .request()
            .input("mah", sql.VarChar, item.MAHANGHOA)
            .input("sl", sql.Int, item.SOLUONG)
            .query(
              `UPDATE HANGHOA SET SOLUONGTONKHO = SOLUONGTONKHO - @sl WHERE MAHANGHOA = @mah`,
            );
        }
      }

      await transaction.commit();
      res.json({ success: true, message: "Lưu thành công!" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getLastCode: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        // Lấy mã lớn nhất theo thời gian tạo
        "SELECT TOP 1 MAPHIEUTRAHANGNHAP FROM PHIEUTRAHANGNHAP ORDER BY THOIGIAN DESC",
      );

      if (result.recordset.length > 0) {
        res.json({ lastCode: result.recordset[0].MAPHIEUTRAHANGNHAP });
      } else {
        res.json({ lastCode: null });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = returnImportController;
