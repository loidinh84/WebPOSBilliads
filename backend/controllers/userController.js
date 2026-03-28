const User = require("../models/userModel");

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

module.exports = { getUserProfile, updateProfile };
