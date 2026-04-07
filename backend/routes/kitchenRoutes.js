const express = require("express");
const router = express.Router();
const kitchenController = require("../controllers/kitchenController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Thu ngân báo bếp
router.put("/notify/:billId", verifyToken, kitchenController.notifyKitchen);

// Bếp lấy danh sách món
router.get("/", verifyToken, kitchenController.getKitchenItems);

// Bếp cập nhật trạng thái món (Xong/Đã giao)
router.put("/item/:id/status", verifyToken, kitchenController.updateItemStatus);

module.exports = router;
