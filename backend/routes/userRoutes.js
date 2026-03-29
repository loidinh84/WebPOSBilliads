const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/profile/:username", userController.getUserProfile);
router.put("/update/:username", userController.updateProfile);
router.put("/change-password/:username", userController.changePassword);

module.exports = router;
