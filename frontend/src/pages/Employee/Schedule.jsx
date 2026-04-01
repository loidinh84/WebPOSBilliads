import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";

function Schedule() {
  const [currentWeek] = useState("Tuần 1 - Th. 3 2026");

  const [employees, setEmployees] = useState([
    {
      id: 1,
      staffId: "NV001",
      name: "Trần Thanh Khang",
      schedule: {
        mon: "08:00 - 17:00",
        tue: "08:00 - 17:00",
        wed: "08:00 - 17:00",
        thu: "08:00 - 17:00",
        fri: "08:00 - 17:00",
        sat: "08:00 - 12:00",
        sun: "OFF",
      },
      expectedSalary: "12,500,000",
    },
    {
      id: 2,
      staffId: "NV002",
      name: "Nguyễn Thị Mai",
      schedule: {
        mon: "14:00 - 22:00",
        tue: "14:00 - 22:00",
        wed: "OFF",
        thu: "14:00 - 22:00",
        fri: "14:00 - 22:00",
        sat: "14:00 - 22:00",
        sun: "08:00 - 17:00",
      },
      expectedSalary: "10,000,000",
    },
  ]);

  // ─── CHỈ THÊM PHẦN LOGIC NÀY ─────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.staffId.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // ─────────────────────────────────────────────────────────────────────────

  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  const handleSave = (newValue) => {
    const { type, data } = modal;
    if (type === "EDIT_SHIFT") {
      const { employeeId, day } = data;
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? { ...emp, schedule: { ...emp.schedule, [day]: newValue } }
            : emp,
        ),
      );
    } else if (type === "EDIT_SALARY") {
      const { employeeId } = data;
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, expectedSalary: newValue } : emp,
        ),
      );
    }
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
              <button className="px-2 hover:bg-gray-50 transition-colors border-r border-gray-200 h-full flex items-center justify-center">
                <img
                  src={Icons.ArrowBack}
                  className="w-2.5 h-2.5 opacity-60"
                  alt="prev"
                />
              </button>
              <div className="px-3 text-[13px] font-medium text-gray-700 min-w-[120px] text-center">
                {currentWeek}
              </div>
              <button className="px-2 hover:bg-gray-50 transition-colors border-l border-gray-200 h-full flex items-center justify-center">
                <img
                  src={Icons.ArrowBack}
                  className="w-2.5 h-2.5 opacity-60 rotate-180"
                  alt="next"
                />
              </button>
            </div>

            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded text-[13px] font-medium transition-all shadow-sm active:scale-95 h-[34px]">
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
            <button
              onClick={() => openModal("IMPORT")}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95"
            >
              <img
                src={Icons.SaveFile}
                className="w-3.5 h-3.5 opacity-80"
                alt="import"
              />
              <span>Import</span>
            </button>
            <button
              onClick={() => openModal("EXPORT")}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95"
            >
              <img
                src={Icons.SaveFile}
                className="w-3.5 h-3.5 opacity-80"
                alt="export"
              />
              <span>Xuất file</span>
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
                      <span className="px-2 py-1 bg-blue-50 text-[#5D5FEF] rounded text-[11px] font-bold group-hover/cell:bg-[#5D5FEF] group-hover/cell:text-white transition-all">
                        {emp.schedule[item.day]}
                      </span>
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
