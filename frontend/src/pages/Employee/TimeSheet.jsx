import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";
import axios from "axios";

function Timesheet() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ─── State: Modal ─────────────────────────────────────────────────────────
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  // ─── Logic: Xử lý Ngày tháng ─────────────────────────────────────────────
  const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      const y = nextDay.getFullYear();
      const m = String(nextDay.getMonth() + 1).padStart(2, "0");
      const dayVal = String(nextDay.getDate()).padStart(2, "0");
      days.push(`${y}-${m}-${dayVal}`);
    }
    return days;
  };

  const weekDays = getWeekRange(currentDate);

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance`, {
        params: {
          startDate: weekDays[0],
          endDate: weekDays[6],
        },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Lỗi khi tải bảng chấm công:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  // ─── Render Helper: Trạng thái ──────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case "DUNG_GIO":
        return "bg-blue-600";
      case "TRE_SOM":
        return "bg-purple-600";
      case "THIEU":
        return "bg-red-500";
      case "CHUA_CHAM":
        return "bg-orange-500";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      <DashboardHeader storeName="Billiards Lục Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bảng chấm công
        </h1>

        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 w-[300px] focus-within:bg-white transition-all shadow-inner">
            <img
              src={Icons.Search}
              alt="search"
              className="w-4 h-4 opacity-40 mr-3"
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              className="w-full outline-none text-[13px] bg-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeWeek(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all font-bold cursor-pointer"
              >
                &lt;
              </button>
              <span className="px-4 font-bold text-gray-700 min-w-[180px] text-center">
                {`${weekDays[0].split("-").reverse().join("/")} - ${weekDays[6].split("-").reverse().join("/")}`}
              </span>
              <button
                onClick={() => changeWeek(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all font-bold cursor-pointer"
              >
                &gt;
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-[#5D5FEF] text-white rounded-lg font-bold hover:bg-[#4b4dbf] transition-all"
            >
              Tuần này
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal("VIEW_BY_SHIFT")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-all text-gray-600"
            >
              <img
                src={Icons.Calendar2}
                alt="view"
                className="w-4 h-4 opacity-60"
              />
              Xem theo ca
            </button>
            <button
              onClick={() => openModal("APPROVE_ATTENDANCE")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-all text-gray-600"
            >
              <img
                src={Icons.Calendar}
                alt="approve"
                className="w-4 h-4 opacity-60"
              />
              Duyệt chấm công
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">
                  <th className="p-4 text-left border-r border-gray-50 w-[200px]">
                    Nhân viên
                  </th>
                  <th className="p-4 border-r border-gray-50">Thứ hai</th>
                  <th className="p-4 border-r border-gray-50">Thứ ba</th>
                  <th className="p-4 border-r border-gray-50">Thứ tư</th>
                  <th className="p-4 border-r border-gray-50">Thứ năm</th>
                  <th className="p-4 border-r border-gray-50">Thứ sáu</th>
                  <th className="p-4 border-r border-gray-50 text-blue-500">
                    Thứ bảy
                  </th>
                  <th className="p-4 border-r border-gray-50 text-red-500">
                    Chủ nhật
                  </th>
                  <th className="p-4 bg-blue-50/30 text-blue-700">Tổng giờ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="font-bold text-gray-400">
                          Đang tải bảng chấm công...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 border-r border-gray-50">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-[14px]">
                            {emp.name}
                          </span>
                          <span className="text-[11px] text-gray-400 font-bold uppercase">
                            {emp.role}
                          </span>
                        </div>
                      </td>
                      {weekDays.map((date) => {
                        const dayData = emp.schedule[date];
                        return (
                          <td
                            key={date}
                            className="p-2 border-r border-gray-50 align-middle cursor-pointer hover:bg-blue-50/50 transition-all group/cell"
                            onClick={() =>
                              openModal("MANUAL_ATTENDANCE", {
                                staffId: emp.id,
                                staffName: emp.name,
                                date: date,
                                dayData: dayData,
                              })
                            }
                          >
                            {dayData && dayData.status !== "NGHI" ? (
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusStyle(dayData.status)}`}
                                ></div>
                                <div className="text-[11px] font-bold text-gray-800">
                                  {dayData.actual || "00:00 - 00:00"}
                                </div>
                                <div className="text-[9px] text-gray-400 italic">
                                  {dayData.planned}
                                </div>
                                {dayData.isCompleted && (
                                  <div className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-0.5 border border-green-100 uppercase tracking-tighter">
                                    Hoàn thành ca
                                  </div>
                                )}
                                {dayData.salary > 0 && (
                                  <div className="text-[11px] font-black text-blue-900 mt-1">
                                    {new Intl.NumberFormat("vi-VN").format(
                                      dayData.salary,
                                    )}
                                    đ
                                  </div>
                                )}
                                {dayData.discrepancy && (
                                  <div
                                    className={`text-[10px] font-bold mt-0.5 ${dayData.status === "TRE_SOM" || dayData.status === "THIEU" ? "text-red-500" : "text-orange-500"}`}
                                  >
                                    {dayData.discrepancy}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-300 font-medium italic text-center">
                                Nghỉ
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 font-bold text-blue-700 text-center bg-blue-50/10">
                        {emp.totalHours}h
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="h-[400px] text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <img
                          src={Icons.User}
                          alt="empty"
                          className="w-12 h-12 opacity-10"
                        />
                        <p className="font-medium">
                          Không tìm thấy dữ liệu trong tuần này
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-gray-100 bg-gray-50/30 p-4 flex justify-center items-center gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></span>{" "}
              Đúng giờ
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 shadow-sm"></span>{" "}
              Muộn/Sớm
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>{" "}
              Thiếu
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span>{" "}
              Chưa chấm
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-200 shadow-sm"></span>{" "}
              Nghỉ làm
            </div>
          </div>
        </div>
      </main>

      <EmployeeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        data={modal.data}
        onSaveSuccess={fetchAttendance}
      />
    </div>
  );
}

export default Timesheet;
