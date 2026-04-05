const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

router.get("/active", billController.getActiveBills);
router.post("/open", billController.openBill);
router.get("/tables/:maban/history", billController.getHistoryByTable);
router.get("/details", billController.getAllBills);
router.get("/:id/items", billController.getBillItems);
router.put("/:id/items", billController.updateBillItems);
router.put("/:id/transfer", billController.transferBill);
router.put("/:id/checkout", billController.checkoutBill);
router.put("/:id/cancel", billController.cancelInvoice);
router.patch("/:id/start", billController.updateStartTime);

module.exports = router;

