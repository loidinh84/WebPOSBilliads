const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");

// Lấy template của một tab cụ thể
router.get("/:name", templateController.getTemplate);

// Lưu hoặc cập nhật template
router.post("/:name", templateController.saveTemplate);

module.exports = router;
