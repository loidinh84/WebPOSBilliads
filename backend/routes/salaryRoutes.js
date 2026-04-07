const express = require("express");
const router = express.Router();
const { getSalaryReport, finalizeSalary } = require("../controllers/salaryController");

// Lấy báo cáo lương theo tháng
router.get("/report", getSalaryReport);

// Chốt bảng lương (Lưu vào SQL)
router.post("/finalize", finalizeSalary);

module.exports = router;
