const express = require("express");
const router = express.Router();
const returnImportController = require("../controllers/returnImportController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, returnImportController.getAllReturnImports);
router.put(
  "/:id/cancel",
  verifyToken,
  returnImportController.cancelReturnImport,
);
router.post("/create", verifyToken, returnImportController.createReturnImport);
router.get("/last-code", verifyToken, returnImportController.getLastCode);

module.exports = router;
