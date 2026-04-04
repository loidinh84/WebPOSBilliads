const express = require("express");
const router = express.Router();
const khuyenmaiController = require("../controllers/khuyenmaiController");

router.get("/", khuyenmaiController.getDiscounts);
router.post("/", khuyenmaiController.createDiscount);
router.put("/:id", khuyenmaiController.updateDiscount);
router.delete("/:id", khuyenmaiController.deleteDiscount);

module.exports = router;
