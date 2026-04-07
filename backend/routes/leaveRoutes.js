const express = require("express");
const router = express.Router();
const {
  getAllPendingRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require("../controllers/leaveController");

router.get("/pending", getAllPendingRequests);
router.post("/approve/:id", approveLeaveRequest);
router.post("/reject/:id", rejectLeaveRequest);

module.exports = router;
