const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

router.post(
  "/checkout",
  verifyToken,
  authorize(["Admin", "Quản lý", "Thu ngân"]),
);
router.get(
  "/kitchen/orders",
  verifyToken,
  authorize(["Admin", "Quản lý", "Nhà bếp"]),
);
router.put(
  "/update/:username",
  verifyToken,
  authorize(["Admin", "Quản lý"]),
  userController.updateProfile,
);
router.get("/profile/:username", verifyToken, userController.getUserProfile);

router.put("/update/:username", verifyToken, userController.updateProfile);
router.put(
  "/change-password/:username",
  verifyToken,
  userController.changePassword,
);

module.exports = router;
