import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000/api/schedule";

function Schedule() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper: Lấy ngày Thứ 2 và Chủ Nhật của tuần (Dùng Local Time chuẩn xác)
  const getWeekRange = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMonday);
    
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const format = (dObj) => {
      const year = dObj.getFullYear();
      const month = String(dObj.getMonth() + 1).padStart(2, "0");
      const dayOfMonth = String(dObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${dayOfMonth}`;
    };

    return {
      monday: format(mon),
      sunday: format(sun),
      mondayObj: mon,
    };
  };

  const { monday, sunday, mondayObj } = getWeekRange(currentDate);
  const weekLabel = `Tuần ${Math.ceil(mondayObj.getDate() / 7)} - Th. ${mondayObj.getMonth() + 1} ${mondayObj.getFullYear()}`;

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/weekly?startDate=${monday}&endDate=${sunday}`);
      setEmployees(response.data);
    } catch (err) {
      console.error("Lỗi khi tải lịch làm việc:", err);
      const errorMsg = err.response?.data?.message || "Không thể tải lịch làm việc.";
      Swal.fire("Lỗi", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  // ─── CHỈ THÊM PHẦN LOGIC NÀY ─────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.staffId || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // ─────────────────────────────────────────────────────────────────────────

  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const openModal = (type, extraData = null) => {
    setModal({
      isOpen: true,
      type,
      data: extraData,
    });
  };
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  const handleSave = async (newValue) => {
    const { type, data } = modal;
    if (type === "EDIT_SHIFT") {
      const { employeeId, day } = data;
      
      // Sửa lỗi nhảy ngày: Tách ngày tháng năm từ chuỗi Monday (YYYY-MM-DD)
      const daysOffset = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
      const [y, m, d] = monday.split("-").map(Number);
      const shiftDate = new Date(y, m - 1, d); // Thứ 2 chuẩn Local
      shiftDate.setDate(shiftDate.getDate() + daysOffset[day]);
      
      const resY = shiftDate.getFullYear();
      const resM = String(shiftDate.getMonth() + 1).padStart(2, "0");
      const resD = String(shiftDate.getDate()).padStart(2, "0");
      const dateString = `${resY}-${resM}-${resD}`;

      try {
        await axios.post(`${API_BASE_URL}/upsert`, {
          employeeId,
          date: dateString,
          value: newValue
        });
        Swal.fire("Thành công", "Đã cập nhật ca làm!", "success");
        fetchSchedules();
      } catch (err) {
        console.error("Lỗi khi cập nhật ca làm:", err);
        const errorMsg = err.response?.data?.message || "Không thể cập nhật ca làm.";
        Swal.fire("Lỗi", errorMsg, "error");
      }
    } else if (type === "EDIT_SALARY") {
      Swal.fire("Thông báo", "Tính năng chỉnh sửa lương đang được phát triển.", "info");
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Lịch làm việc
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative group min-w-[300px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <img
                  src={Icons.Search}
                  className="w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity"
                  alt="search"
                />
              </div>
              {/* GIỮ NGUYÊN INPUT - CHỈ GẮN VALUE VÀ ONCHANGE */}
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 pointer-events-none"
                alt="dropdown"
              />
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded shadow-sm overflow-hidden h-[34px]">
              <button 
                onClick={() => changeWeek(-1)}
                className="px-2 hover:bg-gray-50 transition-colors border-r border-gray-200 h-full flex items-center justify-center cursor-pointer"
              >
                <img
                  src={Icons.ArrowBack}
                  className="w-2.5 h-2.5 opacity-60"
                  alt="prev"
                />
              </button>
              <div className="px-3 text-[13px] font-bold text-gray-700 min-w-[120px] text-center">
                {weekLabel}
              </div>
              <button 
                onClick={() => changeWeek(1)}
                className="px-2 hover:bg-gray-50 transition-colors border-l border-gray-200 h-full flex items-center justify-center cursor-pointer"
              >
                <img
                  src={Icons.ArrowBack}
                  className="w-2.5 h-2.5 opacity-60 rotate-180"
                  alt="next"
                />
              </button>
            </div>
 
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded text-[13px] font-bold transition-all shadow-sm active:scale-95 h-[34px] cursor-pointer"
            >
              Tuần này
            </button>
          </div>
          <div className="flex items-center gap-2">
             <button
               onClick={() => openModal("VIEW_BY_SHIFT")}
               className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95"
             >
               <img
                 src={Icons.Person}
                 className="w-3.5 h-3.5 opacity-80"
                 alt="view"
               />
               <span>Xem theo nhân viên</span>
             </button>
           </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[650px]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.2fr] border-b border-gray-200 bg-[#F9FAFB]">
            {[
              "Nhân viên",
              "Thứ hai",
              "Thứ ba",
              "Thứ tư",
              "Thứ năm",
              "Thứ sáu",
              "Thứ bảy",
              "Chủ nhật",
              "Lương dự kiến",
            ].map((header, idx) => (
              <div
                key={idx}
                className={`p-3 text-[13px] font-bold text-gray-700 text-center flex items-center justify-center border-r border-gray-100 last:border-r-0 h-[50px] ${header === "Thứ bảy" ? "text-[#5D5FEF]" : ""} ${header === "Chủ nhật" ? "text-red-500" : ""}`}
              >
                {header}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {/* ĐỔI employees THÀNH filteredEmployees */}
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.2fr] border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <div className="p-4 border-r border-gray-50 flex flex-col justify-center">
                  <p className="font-bold text-[14px] text-gray-800 mb-0.5">
                    {emp.name}
                  </p>
                  <p className="text-[12px] text-[#5D5FEF] font-semibold">
                    {emp.staffId}
                  </p>
                </div>
                {[
                  { day: "mon", label: "Thứ hai" },
                  { day: "tue", label: "Thứ ba" },
                  { day: "wed", label: "Thứ tư" },
                  { day: "thu", label: "Thứ năm" },
                  { day: "fri", label: "Thứ sáu" },
                  { day: "sat", label: "Thứ bảy" },
                  { day: "sun", label: "Chủ nhật" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openModal("EDIT_SHIFT", {
                        employeeId: emp.id,
                        name: emp.name,
                        day: item.day,
                        label: item.label,
                        value: emp.schedule[item.day],
                      })
                    }
                    className="p-3 border-r border-gray-50 flex items-center justify-center text-[13px] text-gray-600 cursor-pointer group/cell"
                  >
                    {emp.schedule[item.day] === "OFF" ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded text-[11px] font-bold group-hover/cell:bg-gray-200 transition-colors">
                        NGHỈ
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold transition-all border ${
                          emp.schedule[item.day]?.isCompleted 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-blue-50 text-[#5D5FEF] border-blue-100 group-hover/cell:bg-[#5D5FEF] group-hover/cell:text-white'
                        }`}>
                          {typeof emp.schedule[item.day] === "object" && emp.schedule[item.day] !== null 
                            ? emp.schedule[item.day]?.time?.toString() 
                            : (emp.schedule[item.day]?.toString() || "OFF")}
                        </span>
                        {emp.schedule[item.day]?.isCompleted && (
                          <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                            <span className="scale-125">✓</span> Xong
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div
                  onClick={() =>
                    openModal("EDIT_SALARY", {
                      employeeId: emp.id,
                      name: emp.name,
                      value: emp.expectedSalary,
                    })
                  }
                  className="p-4 flex items-center justify-center font-bold text-[#5D5FEF] text-[14px] cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {emp.expectedSalary}đ
                </div>
              </div>
            ))}

            {/* TRƯỜNG HỢP KHÔNG TÌM THẤY AI (GIỮ NGUYÊN GIAO DIỆN TRỐNG CỦA BẠN) */}
            {filteredEmployees.length === 0 && employees.length > 0 && (
              <div className="p-20 text-center text-gray-400 italic">
                Không tìm thấy nhân viên phù hợp
              </div>
            )}

            {employees.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-20">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <img
                    src={Icons.Person}
                    className="w-8 h-8 opacity-20"
                    alt="no employees"
                  />
                </div>
                <p className="text-gray-400 font-medium text-[14px]">
                  Bạn chưa tạo nhân viên cho cửa hàng
                </p>
                <p className="text-gray-400 text-[14px]">
                  Nhấn{" "}
                  <Link
                    to="/staff/list"
                    className="text-[#5D5FEF] font-bold hover:underline"
                  >
                    vào đây
                  </Link>{" "}
                  để tạo nhân viên.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EmployeeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        data={modal.data}
        onSave={handleSave}
      />
    </div>
  );
}

export default Schedule;
