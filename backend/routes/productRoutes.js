const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/categories", verifyToken, productController.getCategories);
router.get("/", verifyToken, productController.getAllProducts);
router.post("/", verifyToken, productController.createProduct);
router.delete("/:id", verifyToken, productController.deleteProduct);
router.put("/:MAHANGHOA", verifyToken, productController.updateProduct);
router.put("/:id/status", verifyToken, productController.toggleStatus);

module.exports = router;
