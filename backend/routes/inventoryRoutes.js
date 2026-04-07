const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// Lấy danh sách phiếu
router.get("/", inventoryController.getAllSlips);

// Lấy chi tiết 1 phiếu
router.get("/:id", inventoryController.getSlipDetails);

// Tạo phiếu kiểm kho mới (Lưu tạm hoặc Hoàn thành)
router.post("/", inventoryController.createInventorySlip);

module.exports = router;
