const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await User.findByUsername(username);
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await User.updateProfile(username, req.body);
    res.json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;
    const userAccount = await User.verifyPassword(username);

    if (!userAccount) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }
    const isMatch = await bcrypt.compare(oldPassword, userAccount.MATKHAU);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu cũ không chính xác!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    await User.changePassword(username, hashedNewPassword);

    res.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi mã hóa mật khẩu" });
  }
};

module.exports = { getUserProfile, updateProfile, changePassword };
