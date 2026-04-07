const Salary = require("../models/salaryModel");

/**
 * Controller xử lý tính toán và quản lý bảng lương
 */
const getSalaryReport = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const kytraluong = `Tháng ${month.toString().padStart(2, "0")}/${year}`;

    // 1. Lấy dữ liệu đã lưu trong bảng LUONG
    const existingPayrolls = await Salary.getExistingPayrolls(kytraluong);

    // 2. Tính toán lương tạm thời từ bảng CHAMCONG cho TẤT CẢ nhân viên
    const calculatedData = await Salary.getMonthlyCalculated(month, year);

    const RATES = {
      Admin: 50000,
      "Quản lý (40k)": 40000,
      "Thu ngân (30k)": 30000,
      "Nhà bếp (30k)": 30000,
      default: 20000,
    };

    // 3. Map dữu liệu đã lưu để tra cứu nhanh
    const existingMap = {};
    existingPayrolls.forEach((p) => {
      existingMap[p.MANVIEN] = p;
    });

    // 4. Hợp nhất dữ liệu: Ưu tiên bản ghi đã lưu, nếu chưa có thì dùng bản ghi tính toán
    const report = calculatedData.map((item) => {
      if (existingMap[item.MANVIEN]) {
        return existingMap[item.MANVIEN];
      }

      // Nếu chưa có trong bảng LUONG, tạo bản ghi "Xem trước" (Chưa thanh toán)
      const role = item.CHUCVU ? item.CHUCVU.trim() : "Nhân viên";
      let rate = RATES[role];

      // Fallback cực mạnh cho tên chức vụ cũ, sai lệch hoặc NULL
      if (!rate || rate === RATES["default"]) {
        const searchStr = (
          (role || "") +
          " " +
          (item.TENNGUOIDUNG || "")
        ).toLowerCase();

        if (searchStr.includes("admin")) {
          rate = 50000;
        } else if (searchStr.includes("quản lý")) {
          rate = 40000;
        } else if (
          searchStr.includes("thu ngân") ||
          searchStr.includes("nhà bếp") ||
          searchStr.includes("bàn") ||
          searchStr.includes("dịch vụ") ||
          searchStr.includes("nhân viên")
        ) {
          rate = 30000;
        } else {
          rate = 30000; // Mặc định là 30k theo yêu cầu mới
        }
      }

      const hours = item.TotalHours || 0;
      const totalSalary = Math.round(hours * rate);

      return {
        MALUONG: `L${item.MANVIEN}${month}${year}`,
        MANVIEN: item.MANVIEN,
        TENNGUOIDUNG: item.TENNGUOIDUNG,
        CHUCVU: role,
        KYTRALUONG: kytraluong,
        TONGGIOLAM: parseFloat(hours.toFixed(1)),
        TONGLUONG: totalSalary,
        CONCANTRA: totalSalary,
        TRANGTHAI: "Chưa thanh toán",
      };
    });

    res.json(report);
  } catch (error) {
    console.error("Lỗi lấy báo cáo lương:", error);
    res.status(500).json({ message: error.message });
  }
};

const finalizeSalary = async (req, res) => {
  try {
    const { payrolls } = req.body; // Mảng các bản ghi lương
    if (!payrolls || !Array.isArray(payrolls)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    for (const item of payrolls) {
      await Salary.saveOrUpdate({
        MALUONG: item.MALUONG,
        MANVIEN: item.MANVIEN,
        KYTRALUONG: item.KYTRALUONG,
        TONGGIOLAM: item.TONGGIOLAM,
        TONGLUONG: item.TONGLUONG,
        CONCANTRA: item.CONCANTRA,
        TRANGTHAI: item.TRANGTHAI,
      });
    }

    res.json({ message: "Đã chốt bảng lương thành công!" });
  } catch (error) {
    console.error("Lỗi chốt lương:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalaryReport,
  finalizeSalary,
};
