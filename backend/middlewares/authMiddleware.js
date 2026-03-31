const jwt = require("jsonwebtoken");

// Kiểm tra đăng nhập
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Vui lòng đăng nhập!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Phiên làm việc hết hạn!" });
  }
};

// Hàm phân quyền: Truyền vào danh sách các quyền được phép
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });

    if (allowedRoles.includes(req.user.QUYENHAN)) {
      next();
    } else {
      return res.status(403).json({
        message: `Quyền ${req.user.QUYENHAN} không được phép truy cập khu vực này!`,
      });
    }
  };
};

module.exports = { verifyToken, authorize };
