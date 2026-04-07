const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.get("/weekly", scheduleController.getWeeklySchedule);
router.post("/upsert", scheduleController.upsertShift);
router.get("/by-shift", scheduleController.getScheduleByShift);
router.post("/bulk-upsert", scheduleController.bulkUpsertShifts);

module.exports = router;
