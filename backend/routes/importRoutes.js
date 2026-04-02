const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");

router.get("/details", importController.getAllImports);
router.get("/:id/items", importController.getImportItems);
router.put("/:id/cancel", importController.cancelImport);
router.get("/suppliers", importController.getSuppliers);
router.get("/products", importController.getProducts);
router.post("/create", importController.createImport);
router.post("/quick-add-product", importController.quickAddProduct);

module.exports = router;
