const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/last-code", verifyToken, exportController.getLastCode);
router.get("/", verifyToken, exportController.getAllExports);
router.post("/create", verifyToken, exportController.createExport);
router.get("/:id", verifyToken, exportController.getExportDetail);
router.put("/cancel/:id", verifyToken, exportController.cancelExport);
router.get("/next-code", verifyToken, exportController.getNextCode);
router.get("/search-products", verifyToken, exportController.getProducts);
router.post("/get-details-bulk", verifyToken, exportController.getDetailsBulk);

module.exports = router;
