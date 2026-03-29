const { sql, poolPromise } = require("./config/db");
const bcrypt = require("bcrypt");

async function resetPassword() {
  try {
    // Đợi kết nối Database
    const pool = await poolPromise;

    // 1. Tự động mã hóa mật khẩu '123456'
    const hashedPass = await bcrypt.hash("123456", 10);

    // 2. Ghi thẳng vào Database, không qua copy-paste
    await pool
      .request()
      .input("matkhau", sql.VarChar, hashedPass)
      .query(
        `UPDATE TAIKHOAN SET MATKHAU = @matkhau WHERE TENDANGNHAP = 'admin'`,
      );

    console.log(
      "Cập nhật thành công! Mật khẩu của tài khoản admin hiện tại là: 123456",
    );
    process.exit(0); 
  } catch (error) {
    console.log("Lỗi:", error);
    process.exit(1);
  }
}

resetPassword();
