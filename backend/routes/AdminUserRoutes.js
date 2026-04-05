const express = require("express");
const router = express.Router();
const AdminUserController = require("../controllers/AdminUserController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/all", verifyToken, AdminUserController.getAllUsers);
router.post("/create", verifyToken, AdminUserController.createUser);
router.put("/update", verifyToken, AdminUserController.updateUser);
router.patch("/status", verifyToken, AdminUserController.toggleStatus);
router.delete("/:username", verifyToken, AdminUserController.deleteUser);
router.get(
  "/access-time/:username",
  verifyToken,
  AdminUserController.getAccessTime,
);
router.post("/access-time", verifyToken, AdminUserController.saveAccessTime);

module.exports = router;
