import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";

/**
 * Trang Bảng lương (Salary)
 * Quản lý danh sách bảng lương của nhân viên, hỗ trợ lọc và tìm kiếm.
 */
function Salary() {
  // Trạng thái danh sách bảng lương
  const [payrolls] = useState([]);

  // Trạng thái tìm kiếm và bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Đang tạo");

  // ─── State: Modal ─────────────────────────────────────────────────────────
  const [modal, setModal] = useState({ isOpen: false, type: "" });

  const openModal = (type) => setModal({ isOpen: true, type });
  const closeModal = () => setModal({ isOpen: false, type: "" });

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900 pb-10">
      {/* Header và Thanh điều hướng */}
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">
        {/* Thanh bên trái: Bộ lọc (Sidebar) */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* Bộ lọc: Kỳ hạn trả lương */}
            <div className="mb-8">
              <h3 className="text-[14px] font-bold text-gray-800 mb-3 uppercase tracking-wider">
                Kỳ hạn trả lương
              </h3>
              <div className="relative group">
                <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all text-gray-700 font-medium cursor-pointer">
                  <option>Chọn kỳ hạn trả lương</option>
                  <option>Tháng 03/2026</option>
                  <option>Tháng 02/2026</option>
                </select>
                <img
                  src={Icons.ArrowDown}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity"
                  alt="arrow"
                />
              </div>
            </div>

            {/* Bộ lọc: Trạng thái */}
            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4 uppercase tracking-wider">
                Trạng thái
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { id: "creating", label: "Đang tạo" },
                  { id: "draft", label: "Tạm tính" },
                  { id: "finalized", label: "Đã chốt lương" },
                  { id: "cancelled", label: "Đã hủy" },
                ].map((status) => (
                  <label
                    key={status.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="status"
                        checked={selectedStatus === status.label}
                        onChange={() => setSelectedStatus(status.label)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all"
                      />
                      <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                    </div>
                    <span
                      className={`text-[14px] font-medium transition-colors ${
                        selectedStatus === status.label
                          ? "text-[#5D5FEF]"
                          : "text-gray-600 group-hover:text-[#5D5FEF]"
                      }`}
                    >
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Nội dung chính bên phải */}
        <section className="col-span-12 md:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Bảng lương
            </h2>

            <div className="flex items-center gap-3">
              {/* Ô tìm kiếm bảng lương */}
              <div className="relative group min-w-[320px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <img
                    src={Icons.Search}
                    className="w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity"
                    alt="search"
                  />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Theo mã, tên bảng lương"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all shadow-sm"
                />
                <img
                  src={Icons.ArrowDown}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 pointer-events-none"
                  alt="dropdown"
                />
              </div>

              {/* Nút Tạo Bảng Tính Lương -> mở modal SALARY */}
              <button
                onClick={() => openModal("SALARY")}
                className="bg-[#5D5FEF] hover:bg-[#4B4DDB] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-[14px] font-bold transition-all shadow-md active:scale-95"
              >
                <span className="text-lg leading-none">+</span>
                <span>Bảng Tính Lương</span>
              </button>

              {/* Nút Xuất file -> mở modal EXPORT */}
              <button
                onClick={() => openModal("EXPORT")}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg flex items-center gap-2 text-[14px] font-bold transition-all shadow-sm active:scale-95"
              >
                <img
                  src={Icons.SaveFile}
                  className="w-4 h-4 opacity-70"
                  alt="export"
                />
                <span>Xuất file</span>
              </button>
            </div>
          </div>

          {/* Bảng dữ liệu bảng lương */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {/* Header của bảng */}
            <div className="grid grid-cols-[80px_1fr_120px_130px_120px_150px_120px_120px] bg-white border-b border-gray-200">
              {[
                "Mã",
                "Tên",
                "Kỳ hạn trả",
                "Kỳ làm việc",
                "Tổng lương",
                "Đã trả nhân viên",
                "Còn cần trả",
                "Trạng thái",
              ].map((header, idx) => (
                <div
                  key={idx}
                  className="p-4 text-[13px] font-bold text-gray-700 flex items-center border-r border-gray-50 last:border-r-0"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* Dữ liệu bảng: Hiển thị danh sách hoặc trạng thái trống */}
            {payrolls.length > 0 ? (
              <div className="flex-1">{/* Dữ liệu sẽ được render ở đây */}</div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-10">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  <img
                    src={Icons.Person}
                    className="w-10 h-10 opacity-20"
                    alt="no payrolls"
                  />
                </div>
                <p className="text-gray-500 font-medium text-[15px] mb-1">
                  Cửa hàng chưa có bảng lương nào.
                </p>
                <p className="text-gray-400 text-[14px]">
                  Nhấn{" "}
                  <button className="text-[#5D5FEF] font-bold hover:underline">
                    vào đây
                  </button>{" "}
                  để tạo bảng lương.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Modal trung tâm - xử lý Bảng lương và Xuất file */}
      <EmployeeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
      />
    </div>
  );
}

export default Salary;
