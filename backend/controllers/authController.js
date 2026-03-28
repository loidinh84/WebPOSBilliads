const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!" });
  }

  try {
    // Đợi kết nối CSDL sẵn sàng
    const pool = await poolPromise;

    const result = await pool.request().input("username", sql.VarChar, username)
      .query(`
                SELECT 
                    t.TENDANGNHAP, t.MATKHAU, t.QUYENHAN, n.MANVIEN, n.TENNGUOIDUNG
                FROM TAIKHOAN t
                LEFT JOIN NHANVIEN n ON t.TENDANGNHAP = n.TENDANGNHAP
                WHERE t.TENDANGNHAP = @username AND t.TRANGTHAI = 1
            `);

    const user = result.recordset[0];

    if (!user) {
      return res
        .status(401)
        .json({
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

    res
      .status(200)
      .json({
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

module.exports = { login };
