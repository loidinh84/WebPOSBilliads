const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dinhhoangloibt@gmail.com",
    pass: "mbvltuaoljmrrjol",
  },
});

let otpStore = {};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("username", sql.VarChar, username)
      .query(`
                SELECT t.TENDANGNHAP, t.MATKHAU, t.QUYENHAN, n.MANVIEN, n.TENNGUOIDUNG
                FROM TAIKHOAN t
                LEFT JOIN NHANVIEN n ON t.TENDANGNHAP = n.TENDANGNHAP
                WHERE t.TENDANGNHAP = @username AND t.TRANGTHAI = 1
            `);

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại hoặc đã bị khóa!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.MATKHAU);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    const payload = {
      TENDANGNHAP: user.TENDANGNHAP,
      QUYENHAN: user.QUYENHAN,
      MANVIEN: user.MANVIEN,
      TENNGUOIDUNG: user.TENNGUOIDUNG,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Lỗi login:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const checkUser = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("val", sql.NVarChar, email || phone)
      .query(
        `SELECT EMAIL, SDT FROM NHANVIEN WHERE EMAIL = @val OR SDT = @val`,
      );

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const foundValue = email ? user.EMAIL : user.SDT;
      let masked;
      if (email) {
        const [name, domain] = foundValue.split("@");
        masked = name.substring(0, 3) + "****@" + domain;
      } else {
        masked = foundValue.substring(0, 3) + "****" + foundValue.slice(-3);
      }
      res.json({ exists: true, maskedValue: masked });
    } else {
      res.json({
        exists: false,
        message: "Thông tin này chưa được đăng ký trên hệ thống!",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { method, destination } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[destination] = {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    if (method === "email") {
      const mailOptions = {
        from: '"Billiard POS" <dinhhoangloibt@gmail.com>',
        to: destination,
        subject: "Mã xác thực đổi mật khẩu",
        html: `
          <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #5D5FEF; text-align: center;">Xác thực tài khoản</h2>
            <p style="color: #666; font-size: 15px;">Mã xác thực của bạn là:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <b style="font-size: 32px; letter-spacing: 5px; color: #333;">${otpCode}</b>
            </div>
            <p style="color: #999; font-size: 13px;">Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Đã gửi mail thành công!" });
    } else if (method === "phone") {
      // GIẢ LẬP SMS: Thay vì tốn tiền mua dịch vụ, ta in ra màn hình để test
      console.log("-----------------------------------------");
      console.log(`[HỆ THỐNG SMS] Đang gửi mã xác thực...`);
      console.log(`Gửi tới số: ${destination}`);
      console.log(`MÃ OTP LÀ: ${otpCode}`);
      console.log("-----------------------------------------");

      res.json({
        success: true,
        message: "Mã xác thực đã được gửi qua tin nhắn SMS!",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
  }
};

const verifyOTP = async (req, res) => {
  const { destination, code } = req.body;
  const otpData = otpStore[destination];

  if (!otpData) {
    return res
      .status(400)
      .json({ success: false, message: "Mã đã hết hạn hoặc không tồn tại!" });
  }

  // KIỂM TRA THỜI GIAN THỰC TẾ
  if (Date.now() > otpData.expiresAt) {
    delete otpStore[destination];
    return res
      .status(400)
      .json({ success: false, message: "Mã OTP đã hết hiệu lực!" });
  }

  if (otpData.code === code) {
    delete otpStore[destination];
    res.json({ success: true, message: "Xác thực thành công!" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Mã OTP không chính xác!" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { destination, newPassword } = req.body;
    const pool = await poolPromise;

    // 1. Tìm TENDANGNHAP từ bảng NHANVIEN dựa trên email/sdt
    const userResult = await pool
      .request()
      .input("val", sql.NVarChar, destination)
      .query(
        `SELECT TENDANGNHAP FROM NHANVIEN WHERE EMAIL = @val OR SDT = @val`,
      );

    if (userResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài khoản!" });
    }

    const username = userResult.recordset[0].TENDANGNHAP;

    // 2. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Cập nhật vào bảng TAIKHOAN
    await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .query(
        `UPDATE TAIKHOAN SET MATKHAU = @password WHERE TENDANGNHAP = @username`,
      );

    res.json({
      success: true,
      message: "Mật khẩu đã được cập nhật thành công!",
    });
  } catch (error) {
    console.error("Lỗi reset password:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi đổi mật khẩu" });
  }
};

module.exports = { login, checkUser, sendOTP, verifyOTP, resetPassword };
