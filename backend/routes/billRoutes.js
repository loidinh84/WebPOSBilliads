const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/tables/:maban/history", billController.getHistoryByTable);
router.get("/details", billController.getAllBills);
router.get("/:id/items", billController.getBillItems);
router.put("/:id/cancel", billController.cancelInvoice);

module.exports = router;
