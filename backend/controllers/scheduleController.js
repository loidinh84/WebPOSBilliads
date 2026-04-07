const Schedule = require("../models/scheduleModel");

const formatTime = (timeObj) => {
  if (!timeObj) return "";
  
  // Nếu đã là chuỗi (VD: "08:00") thì lấy 5 ký tự đầu
  if (typeof timeObj === "string") return timeObj.substring(0, 5);
  
  // Nếu là đối tượng Date (kiểu TIME của SQL Server)
  if (timeObj instanceof Date) {
    try {
      // Dùng getUTC để đảm bảo lấy đúng giá trị thô từ DB
      const h = timeObj.getUTCHours().toString().padStart(2, "0");
      const m = timeObj.getUTCMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    } catch (e) {
      return "";
    }
  }
  
  return "";
};

const getWeeklySchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: "Cần startDate và endDate" });

    const { employees, shifts } = await Schedule.getWeekly(startDate, endDate);

    const daysMapping = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const employeeSchedules = employees.map((emp) => {
      const empShifts = shifts.filter((s) => s.MANVIEN === emp.MANVIEN);
      let totalExpectedSalary = 0;
      const RATES = {
        "Admin": 50000,
        "Quản lý (40k)": 40000,
        "Thu ngân (30k)": 30000,
        "Nhà bếp (30k)": 30000,
        "default": 20000
      };
      let rate = RATES[emp.CHUCVU?.trim()];
      if (!rate || rate === RATES["default"]) {
        const searchStr = ((emp.CHUCVU || "") + " " + (emp.TENNGUOIDUNG || "")).toLowerCase();
        if (searchStr.includes("admin")) rate = 50000;
        else if (searchStr.includes("quản lý")) rate = 40000;
        else if (searchStr.includes("thu ngân") || searchStr.includes("bếp") || searchStr.includes("bàn")) rate = 30000;
        else rate = 20000;
      }

      const scheduleMap = {
        mon: "OFF", tue: "OFF", wed: "OFF", thu: "OFF", fri: "OFF", sat: "OFF", sun: "OFF"
      };

      empShifts.forEach((s) => {
        const d = new Date(s.NGAY);
        const dateStr = d.getFullYear() + "-" + 
                        (d.getMonth() + 1).toString().padStart(2, "0") + "-" + 
                        d.getDate().toString().padStart(2, "0");
        
        const parts = dateStr.split("-").map(Number);
        const dayKey = daysMapping[new Date(parts[0], parts[1] - 1, parts[2]).getDay()];
        
        const start = formatTime(s.GIOBATDAU);
        const end = formatTime(s.GIOKETTHUC);

        if (start && end) {
          // Tính giờ làm việc (Ưu tiên giờ thực tế nếu đã chấm công)
          let hours = 0;
          if (s.TONGGIO) {
            hours = parseFloat(s.TONGGIO);
          } else {
            const [h1, m1] = start.split(":").map(Number);
            const [h2, m2] = end.split(":").map(Number);
            hours = (h2 + m2/60) - (h1 + m1/60);
            if (hours < 0) hours += 24; // Ca đêm
          }
          totalExpectedSalary += hours * rate;

          scheduleMap[dayKey] = {
            time: `${start} - ${end}`,
            isCompleted: !!(s.GIOVAO && s.GIORA)
          };
        } else {
          scheduleMap[dayKey] = "OFF";
        }
      });

      return {
        id: emp.MANVIEN,
        staffId: emp.MANVIEN,
        name: emp.TENNGUOIDUNG,
        role: emp.CHUCVU,
        schedule: scheduleMap,
        expectedSalary: new Intl.NumberFormat("vi-VN").format(Math.round(totalExpectedSalary)),
      };
    });

    res.json(employeeSchedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertShift = async (req, res) => {
  try {
    const { employeeId, date, value } = req.body;
    
    let calam = "Ca làm";
    let giobd = "";
    let giokt = "";
    
    if (value && value !== "OFF" && value.includes("-")) {
      const parts = value.split("-").map(p => p.trim());
      giobd = parts[0];
      giokt = parts[1];
    } else {
      calam = "OFF";
    }

    await Schedule.upsert({
      MANVIEN: employeeId,
      NGAY: date,
      CALAM: calam,
      GIOBATDAU: giobd,
      GIOKETTHUC: giokt
    });

    res.json({ message: "Đã cập nhật ca làm thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật ca làm:", error);
    res.status(500).json({ message: "Lỗi cơ sở dữ liệu: " + error.message });
  }
};

const getScheduleByShift = async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`--- FETCHING BY SHIFT: DATE = [${date}] ---`);
    if (!date) {
      return res.status(400).json({ message: "Thiếu thông tin ngày cần xem." });
    }

    const schedules = await Schedule.getByShift(date);
    console.log(`--- FOUND ${schedules.length} SCHEDULES ---`);
    
    const result = schedules.map(s => ({
      id: s.MANVIEN,
      name: s.TENNGUOIDUNG,
      role: s.CHUCVU || "Chưa xác định",
      startTime: formatTime(s.GIOBATDAU),
      endTime: formatTime(s.GIOKETTHUC)
    }));

    res.json(result);
  } catch (error) {
    console.error("--- ERROR IN getScheduleByShift ---", error);
    res.status(500).json({ message: error.message });
  }
};

const bulkUpsertShifts = async (req, res) => {
  try {
    const { schedules } = req.body;
    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ (Expect array of schedules)." });
    }

    // records format: { MANVIEN, NGAY, CALAM, GIOBATDAU, GIOKETTHUC }
    const result = await Schedule.bulkUpsert(schedules);
    res.json({ success: true, message: `Đã cập nhật ${schedules.length} ca làm thành công!` });
  } catch (error) {
    console.error("Lỗi cập nhật hàng loạt:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

module.exports = {
  getWeeklySchedule,
  upsertShift,
  getScheduleByShift,
  bulkUpsertShifts
};
