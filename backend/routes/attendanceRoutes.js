const express = require("express");
const router = express.Router();
const {
  getWeeklyAttendance,
  approveAttendance,
  updateAttendance,
  getPendingAttendance,
} = require("../controllers/attendanceController");

router.get("/", getWeeklyAttendance);
router.get("/pending", getPendingAttendance);
router.post("/approve", approveAttendance);
router.post("/update", updateAttendance);

module.exports = router;
