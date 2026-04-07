const express = require("express");
const router = express.Router();
const storeSettingsController = require("../controllers/storeSettingsController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Lấy thông tin cấu hình
router.get("/", verifyToken, storeSettingsController.getStoreSettings);

// Cập nhật thông tin cấu hình
router.put("/", verifyToken, storeSettingsController.updateStoreSettings);

module.exports = router;
