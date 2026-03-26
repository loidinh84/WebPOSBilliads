import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

/**
 * Trang Lịch làm việc của nhân viên
 * Hiển thị lịch biểu hàng tuần, cho phép tìm kiếm và điều hướng ngày tháng.
 */
function Schedule() {
  // Trạng thái lưu trữ tuần hiện tại để hiển thị
  const [currentWeek] = useState("Tuần 1 - Th. 3 2026");
  
  // Trạng thái danh sách nhân viên (Hiện tại đang để trống để hiển thị giao diện chưa có dữ liệu)
  const [employees] = useState([]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      {/* Header và Thanh điều hướng chính */}
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6">
        {/* Tiêu đề trang */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Lịch làm việc
          </h2>
        </div>

        {/* Thanh công cụ: Tìm kiếm, Điều hướng ngày tháng và Các nút hành động */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Ô tìm kiếm nhân viên */}
            <div className="relative group min-w-[300px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <img
                  src={Icons.Search}
                  className="w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity"
                  alt="search"
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all shadow-sm"
              />
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 pointer-events-none"
                alt="dropdown"
              />
            </div>

            {/* Điều hướng tuần (Trước/Sau) */}
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

            {/* Nút quay về tuần hiện tại */}
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded text-[13px] font-medium transition-all shadow-sm active:scale-95 h-[34px]">
              Tuần này
            </button>
          </div>

          {/* Các nút hành động bên phải: Xem theo nhân viên, Import, Xuất file */}
          <div className="flex items-center gap-2">
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95">
              <img
                src={Icons.Person}
                className="w-3.5 h-3.5 opacity-80"
                alt="view"
              />
              <span>Xem theo nhân viên</span>
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95">
              <img
                src={Icons.SaveFile}
                className="w-3.5 h-3.5 opacity-80"
                alt="import"
              />
              <span>Import</span>
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm active:scale-95">
              <img
                src={Icons.SaveFile}
                className="w-3.5 h-3.5 opacity-80"
                alt="export"
              />
              <span>Xuất file</span>
            </button>
          </div>
        </div>

        {/* Bảng hiển thị lịch làm việc */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[650px]">
          {/* Tiêu đề các cột trong bảng */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.2fr] border-b border-gray-200">
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
                className={`p-3 text-[13px] font-bold text-gray-700 text-center flex items-center justify-center border-r border-gray-100 last:border-r-0 h-[50px] ${
                  header === "Thứ bảy" ? "text-[#5D5FEF]" : ""
                }`}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Dữ liệu bảng: Hiển thị danh sách hoặc trạng thái trống */}
          {employees.length > 0 ? (
            <div className="flex-1">{/* Các hàng dữ liệu nhân viên sẽ được thêm vào đây */}</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              {/* Hình ảnh minh họa khi chưa có dữ liệu */}
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
      </main>
    </div>
  );
}

export default Schedule;
