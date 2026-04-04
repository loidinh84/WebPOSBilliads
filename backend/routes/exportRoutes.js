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

module.exports = router;
