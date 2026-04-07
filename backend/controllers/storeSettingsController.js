const { sql, poolPromise } = require("../config/db");

// 1. API Lấy dữ liệu cấu hình lên Giao diện
const getStoreSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM THIETLAPCUAHANG");

    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (error) {
    console.error("Lỗi getStoreSettings:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi lấy dữ liệu!" });
  }
};

// 2. API Lưu dữ liệu khi Admin bấm nút "Lưu thông tin"
const updateStoreSettings = async (req, res) => {
  try {
    const {
      giaVonTrungBinh,
      hangHoaThuocTinh,
      dinhLuongNguyenLieu,
      nhanGoiMon,
      khoaThoiGianGiaoDich,
      blockTinhGio,
      lamTronTien,
      khuyenMai,
      datBanTruoc,
      soPhutBlock,
      kieuLamTron,
      bankBin,
      accountNumber,
      accountName,
      tenCuaHang,
      dienThoai,
      diaChi,
      email,
      anhDaiDien,
      choPhepChinhGio,
    } = req.body;

    const pool = await poolPromise;
    const checkData = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM THIETLAPCUAHANG");
    const isTableEmpty = checkData.recordset[0].count === 0;
    const request = pool
      .request()
      .input("MACUAHANG", sql.NVarChar, "CH01")
      .input("TRANGTHAI", sql.Bit, 1)
      .input("TENCH", sql.NVarChar, tenCuaHang || "Cửa hàng của tôi")
      // Nạp các cột còn lại
      .input("GIAVON", sql.Bit, giaVonTrungBinh ? 1 : 0)
      .input("THUOCTINH", sql.Bit, hangHoaThuocTinh ? 1 : 0)
      .input("DINHLUONG", sql.Bit, dinhLuongNguyenLieu ? 1 : 0)
      .input("GOIMON", sql.Bit, nhanGoiMon ? 1 : 0)
      .input("KHOAGD", sql.Bit, khoaThoiGianGiaoDich ? 1 : 0)
      .input("BLOCK", sql.Bit, blockTinhGio ? 1 : 0)
      .input("LAMTRON", sql.Bit, lamTronTien ? 1 : 0)
      .input("KHUYENMAI", sql.Bit, khuyenMai ? 1 : 0)
      .input("DATBAN", sql.Bit, datBanTruoc ? 1 : 0)
      .input("CHINHGIO", sql.Bit, choPhepChinhGio ? 1 : 0)
      .input("PHUTBLOCK", sql.Int, soPhutBlock || 15)
      .input("KIEULAMTRON", sql.VarChar, kieuLamTron || "round")
      .input("BIN", sql.VarChar, bankBin || "")
      .input("STK", sql.VarChar, accountNumber || "")
      .input("TENTK", sql.NVarChar, accountName || "")
      .input("SDT", sql.VarChar, dienThoai || "")
      .input("DIACHI", sql.NVarChar, diaChi || "")
      .input("EMAIL", sql.VarChar, email || "")
      .input("ANHDAIDIEN", sql.NVarChar(sql.MAX), anhDaiDien || "");

    if (isTableEmpty) {
      // NẾU BẢNG TRỐNG -> INSERT
      await request.query(`
        INSERT INTO THIETLAPCUAHANG (
          MACUAHANG, TRANGTHAI, TENCUAHANG, SDT, DIACHI, EMAIL, ANHDAIDIEN,
          GIAVON_TRUNGBINH, HANGHOA_THUOCTHINH, DINHLUONG_NGUYENLIEU, NHAN_GOIMON,
          KHOA_THOIGIAN_GIAODICH, BLOCK_TINHGIO, LAMTRON_TIEN, KHUYENMAI, DATBAN_TRUOC,
          CHOPHEP_CHINHGIO, SOPHUT_BLOCK, KIEU_LAMTRON, NGANHANG_BIN, SOTAIKHOAN, TENTAIKHOAN
        ) VALUES (
          @MACUAHANG, @TRANGTHAI, @TENCH, @SDT, @DIACHI, @EMAIL, @ANHDAIDIEN,
          @GIAVON, @THUOCTINH, @DINHLUONG, @GOIMON,
          @KHOAGD, @BLOCK, @LAMTRON, @KHUYENMAI, @DATBAN,
          @CHINHGIO, @PHUTBLOCK, @KIEULAMTRON, @BIN, @STK, @TENTK
        )
      `);
    } else {
      // NẾU BẢNG ĐÃ CÓ DỮ LIỆU -> UPDATE
      await request.query(`
        UPDATE THIETLAPCUAHANG
        SET
          GIAVON_TRUNGBINH = @GIAVON, HANGHOA_THUOCTHINH = @THUOCTINH,
          DINHLUONG_NGUYENLIEU = @DINHLUONG, NHAN_GOIMON = @GOIMON,
          KHOA_THOIGIAN_GIAODICH = @KHOAGD, BLOCK_TINHGIO = @BLOCK,
          LAMTRON_TIEN = @LAMTRON, KHUYENMAI = @KHUYENMAI,
          DATBAN_TRUOC = @DATBAN, SOPHUT_BLOCK = @PHUTBLOCK,
          KIEU_LAMTRON = @KIEULAMTRON, CHOPHEP_CHINHGIO = @CHINHGIO,
          NGANHANG_BIN = @BIN, SOTAIKHOAN = @STK, TENTAIKHOAN = @TENTK,
          TENCUAHANG = @TENCH, SDT = @SDT, DIACHI = @DIACHI,
          EMAIL = @EMAIL, ANHDAIDIEN = @ANHDAIDIEN
      `);
    }
    res.json({ success: true, message: "Lưu cấu hình thành công!" });
  } catch (error) {
    console.error("Lỗi updateStoreSettings:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi cập nhật!" });
  }
};

module.exports = { getStoreSettings, updateStoreSettings };
