const Attendance = require("../models/attendanceModel");

const formatTime = (timeObj) => {
  if (!timeObj) return "";
  if (typeof timeObj === "string") return timeObj.substring(0, 5);
  // Đối với SQL TIME object (thường là Date object ở UTC 1970-01-01)
  if (timeObj instanceof Date) {
    return (
      timeObj.getUTCHours().toString().padStart(2, "0") +
      ":" +
      timeObj.getUTCMinutes().toString().padStart(2, "0")
    );
  }
  return "";
};

const getWeeklyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Thiếu startDate hoặc endDate." });
    }

    const data = await Attendance.getWeeklyAttendance(startDate, endDate);

    // Group dữ liệu theo nhân viên
    const staffMap = {};

    data.forEach((row) => {
      const { MANVIEN, TENNGUOIDUNG, CHUCVU, NGAY } = row;

      if (!staffMap[MANVIEN]) {
        staffMap[MANVIEN] = {
          id: MANVIEN,
          name: TENNGUOIDUNG,
          role: CHUCVU || "Nhân viên",
          schedule: {}, // Key là ngày YYYY-MM-DD
          totalHours: 0,
        };
      }

      const dateKey = new Date(NGAY).toISOString().split("T")[0];

      const vao_dk = formatTime(row.DU_KIEN_VAO);
      const ra_dk = formatTime(row.DU_KIEN_RA);
      const vao_tt = formatTime(row.THUC_TE_VAO);
      const ra_tt = formatTime(row.THUC_TE_RA);

      // Tính toán giờ làm nếu TONGGIO đang NULL nhưng có đủ giờ vào/ra
      let hoursRow = row.TONGGIO ? parseFloat(row.TONGGIO) : 0;
      if (!hoursRow && vao_tt && ra_tt && ra_tt !== "--:--") {
        const [h1, m1] = vao_tt.split(":").map(Number);
        const [h2, m2] = ra_tt.split(":").map(Number);
        hoursRow = h2 + m2 / 60 - (h1 + m1 / 60);
        if (hoursRow < 0) hoursRow += 24; // Qua đêm
        hoursRow = Math.round(hoursRow * 10) / 10; // Làm tròn 1 chữ số
      }

      // Tính lương ngày (Dựa trên CHUCVU)
      const rateMap = {
        "Quản lý (40k)": 40000,
        "Thu ngân (30k)": 30000,
        "Nhà bếp (30k)": 30000,
      };
      let rate = rateMap[CHUCVU];
      if (!rate) {
        const searchStr = (
          CHUCVU || "" + " " + (TENNGUOIDUNG || "")
        ).toLowerCase();
        if (searchStr.includes("quản lý") || searchStr.includes("admin"))
          rate = 40000;
        else if (
          searchStr.includes("thu ngân") ||
          searchStr.includes("bếp") ||
          searchStr.includes("bàn")
        )
          rate = 30000;
        else rate = 25000;
      }
      const dailySalary = hoursRow * rate;

      // Xác định trạng thái và tính toán chênh lệch
      let status = "NGHI";
      let discrepancy = null;
      let isCompleted = false;

      if (vao_dk) {
        if (!vao_tt) {
          status = "CHUA_CHAM";
          discrepancy = "Vắng mặt";
        } else if (!ra_tt || ra_tt === "--:--") {
          status = "THIEU";
          discrepancy = "Thiếu giờ ra";
        } else {
          isCompleted = true; // Đã quẹt cả vào và ra
          const isLate = vao_tt > vao_dk;
          const isEarly = ra_tt < ra_dk;
          status = isLate || isEarly ? "TRE_SOM" : "DUNG_GIO";

          // Tính toán số phút chênh lệch
          let notes = [];
          if (isLate) {
            const diff =
              parseInt(vao_tt.split(":")[0]) * 60 +
              parseInt(vao_tt.split(":")[1]) -
              (parseInt(vao_dk.split(":")[0]) * 60 +
                parseInt(vao_dk.split(":")[1]));
            notes.push(`Muộn ${diff}p`);
          }
          if (isEarly) {
            const diff =
              parseInt(ra_dk.split(":")[0]) * 60 +
              parseInt(ra_dk.split(":")[1]) -
              (parseInt(ra_tt.split(":")[0]) * 60 +
                parseInt(ra_tt.split(":")[1]));
            notes.push(`Sớm ${diff}p`);
          }
          discrepancy = notes.length > 0 ? notes.join(", ") : null;
        }
      }

      staffMap[MANVIEN].schedule[dateKey] = {
        planned: vao_dk ? `${vao_dk} - ${ra_dk}` : null,
        actual: vao_tt ? `${vao_tt} - ${ra_tt}` : null,
        status: status,
        hours: hoursRow,
        salary: dailySalary,
        isCompleted: isCompleted,
        discrepancy: discrepancy,
      };

      staffMap[MANVIEN].totalHours += hoursRow;
    });

    res.json(
      Object.values(staffMap).map((s) => ({
        ...s,
        totalHours: s.totalHours.toFixed(1),
      })),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveAttendance = async (req, res) => {
  try {
    const { id } = req.body;
    await Attendance.approveRecord(id);
    res.json({ message: "Đã duyệt thành công." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const data = req.body;

    // Tự động tính TONGGIO nếu có giờ Vào và Giờ Ra
    if (data.GIOVAO && data.GIORA && data.GIORA !== "--:--") {
      try {
        const [h1, m1] = data.GIOVAO.split(":").map(Number);
        const [h2, m2] = data.GIORA.split(":").map(Number);

        // Validation: Kiểm tra xem có phải là số hợp lệ không
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          let hours = h2 + m2 / 60 - (h1 + m1 / 60);
          if (hours < 0) hours += 24; // Ca xuyên đêm

          data.TONGGIO = Math.round(hours * 10) / 10;
        } else {
          data.TONGGIO = 0;
        }
      } catch (e) {
        console.error("Lỗi tính TONGGIO (Backend):", e);
        data.TONGGIO = 0;
      }
    }

    await Attendance.upsertRecord(data);
    res.json({ message: "Cập nhật thành công." });
  } catch (error) {
    console.error("LỖI SQL KHI LƯU CHẤM CÔNG:", error.message);
    res.status(500).json({
      message: "Lỗi cơ sở dữ liệu: " + error.message,
      detail: error,
    });
  }
};

const getPendingAttendance = async (req, res) => {
  try {
    const data = await Attendance.getPending();
    const result = data.map((r) => {
      const vao = formatTime(r.GIOVAO);
      const ra = formatTime(r.GIORA);

      // Ghi chú cơ bản
      let note = "";
      if (!ra || ra === "--:--") note = "Quên quẹt ra";

      return {
        id: r.MACHAMCONG,
        name: r.TENNGUOIDUNG,
        date: new Date(r.NGAY).toLocaleDateString("vi-VN"),
        time: `${vao} - ${ra || "--:--"}`,
        note: note || r.GHICHU || "Cần duyệt",
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWeeklyAttendance,
  approveAttendance,
  updateAttendance,
  getPendingAttendance,
};
