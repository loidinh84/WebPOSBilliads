const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/categories", verifyToken, productController.getCategories);
router.get("/", productController.getAllProducts);
router.post("/", verifyToken, productController.createProduct);
router.delete("/:id", verifyToken, productController.deleteProduct);
router.put("/:MAHANGHOA", verifyToken, productController.updateProduct);
router.put("/:id/status", verifyToken, productController.toggleStatus);
router.post("/categories", verifyToken, productController.createCategory);
router.put("/categories/:id", verifyToken, productController.updateCategory);
router.delete("/categories/:id", verifyToken, productController.deleteCategory);


module.exports = router;
