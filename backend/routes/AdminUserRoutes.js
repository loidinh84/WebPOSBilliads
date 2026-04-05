const express = require("express");
const router = express.Router();
const AdminUserController = require("../controllers/AdminUserController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/all", verifyToken, AdminUserController.getAllUsers);
router.post("/create", verifyToken, AdminUserController.createUser);
router.put("/update", verifyToken, AdminUserController.updateUser);
router.patch("/status", verifyToken, AdminUserController.toggleStatus);
router.delete("/:username", verifyToken, AdminUserController.deleteUser);

module.exports = router;
