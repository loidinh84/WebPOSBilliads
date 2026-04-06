const { sql, poolPromise } = require("../config/db");

// 1. API Lấy dữ liệu cấu hình lên Giao diện
const getStoreSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM THIETLAPCUAHANG");

    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Chưa có cấu hình cửa hàng!" });
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
    // Rút trích tất cả dữ liệu được gửi từ React lên
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
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      // Ép kiểu dữ liệu (Công tắc true/false thì chuyển thành 1/0 cho SQL)
      .input("GIAVON", sql.Bit, giaVonTrungBinh ? 1 : 0)
      .input("THUOCTINH", sql.Bit, hangHoaThuocTinh ? 1 : 0)
      .input("DINHLUONG", sql.Bit, dinhLuongNguyenLieu ? 1 : 0)
      .input("GOIMON", sql.Bit, nhanGoiMon ? 1 : 0)
      .input("KHOAGD", sql.Bit, khoaThoiGianGiaoDich ? 1 : 0)
      .input("BLOCK", sql.Bit, blockTinhGio ? 1 : 0)
      .input("LAMTRON", sql.Bit, lamTronTien ? 1 : 0)
      .input("KHUYENMAI", sql.Bit, khuyenMai ? 1 : 0)
      .input("DATBAN", sql.Bit, datBanTruoc ? 1 : 0)

      // Các ô nhập liệu và Dropdown
      .input("PHUTBLOCK", sql.Int, soPhutBlock || 15)
      .input("KIEULAMTRON", sql.VarChar, kieuLamTron || "round")
      .input("BIN", sql.VarChar, bankBin)
      .input("STK", sql.VarChar, accountNumber)
      .input("TENTK", sql.NVarChar, accountName)
      .input("TENCH", sql.NVarChar, tenCuaHang)
      .input("SDT", sql.VarChar, dienThoai)
      .input("DIACHI", sql.NVarChar, diaChi)
      .input("EMAIL", sql.VarChar, email)
      .input("ANHDAIDIEN", sql.VarChar(sql.MAX), anhDaiDien || "").query(`
        UPDATE THIETLAPCUAHANG
        SET
          GIAVON_TRUNGBINH = @GIAVON,
          HANGHOA_THUOCTHINH = @THUOCTINH,
          DINHLUONG_NGUYENLIEU = @DINHLUONG,
          NHAN_GOIMON = @GOIMON,
          KHOA_THOIGIAN_GIAODICH = @KHOAGD,
          BLOCK_TINHGIO = @BLOCK,
          LAMTRON_TIEN = @LAMTRON,
          KHUYENMAI = @KHUYENMAI,
          DATBAN_TRUOC = @DATBAN,
          SOPHUT_BLOCK = @PHUTBLOCK,
          KIEU_LAMTRON = @KIEULAMTRON,
          NGANHANG_BIN = @BIN,
          SOTAIKHOAN = @STK,
          TENTAIKHOAN = @TENTK,
          TENCUAHANG = @TENCH,
          SDT = @SDT,
          DIACHI = @DIACHI,
          EMAIL = @EMAIL,
          ANHDAIDIEN = @ANHDAIDIEN
      `);

    res.json({ success: true, message: "Lưu cấu hình thành công!" });
  } catch (error) {
    console.error("Lỗi updateStoreSettings:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi cập nhật!" });
  }
};

module.exports = { getStoreSettings, updateStoreSettings };
