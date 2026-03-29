import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function Timesheet() {
  // Bro có thể dùng state này sau để xử lý logic lùi/tiến tuần
  const [currentWeek, setCurrentWeek] = useState("Tuần 1 - Th. 3 2026");

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      {/* Header & Nav giữ nguyên */}
      <DashboardHeader storeName="Billiards Lục Lợi" />
      <DashboardNav activeTab="Nhân viên" /> {/* Chú ý tôi đổi active tab sang Nhân viên nhé */}

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        
        {/* Tiêu đề trang */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng chấm công</h1>

        {/* ---------------- TOOLBAR (Tìm kiếm, Điều hướng tuần, Nút thao tác) ---------------- */}
        <div className="flex justify-between items-center">
          
          {/* Cụm Tìm kiếm */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 bg-white w-[250px] focus-within:border-blue-500 transition-colors shadow-sm">
            <img src={Icons.Search} alt="search" className="w-4 h-4 opacity-50 mr-2 filter brightness-0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên" 
              className="w-full outline-none text-sm text-gray-700 bg-transparent"
            />
            <img src={Icons.ArrowDown} alt="dropdown" className="w-3 h-3 opacity-50 filter brightness-0 cursor-pointer" />
          </div>

          {/* Cụm Điều hướng tuần */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-md bg-white shadow-sm overflow-hidden">
              <button className="px-3 py-1.5 hover:bg-gray-100 transition-colors border-r border-gray-300 cursor-pointer font-bold text-gray-600">
                &lt;
              </button>
              <span className="px-4 py-1.5 font-medium text-gray-800 text-sm">
                {currentWeek}
              </span>
              <button className="px-3 py-1.5 hover:bg-gray-100 transition-colors border-l border-gray-300 cursor-pointer font-bold text-gray-600">
                &gt;
              </button>
            </div>
            <button className="border border-gray-300 rounded-md px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm cursor-pointer transition-colors">
              Tuần này
            </button>
          </div>

          {/* Cụm Nút Thao tác */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm cursor-pointer transition-colors">
              <img src={Icons.Calendar2} alt="view" className="w-4 h-4 filter brightness-0 opacity-70" />
              Xem theo ca
            </button>
            <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm cursor-pointer transition-colors">
              <img src={Icons.Calendar} alt="approve" className="w-4 h-4 filter brightness-0 opacity-70" />
              Duyệt chấm công
            </button>
          </div>

        </div>

        {/* ---------------- KHU VỰC BẢNG (TABLE) ---------------- */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center whitespace-nowrap">
              
              {/* Table Header */}
              <thead className="bg-white border-b border-gray-200 text-sm text-gray-800 font-bold">
                <tr>
                  <th className="p-3 border-r border-gray-200 w-[15%]">
                    <div className="flex justify-between items-center px-2">
                      <span>Ca làm việc</span>
                      <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-lg cursor-pointer transition-colors">
                        +
                      </button>
                    </div>
                  </th>
                  <th className="p-3 border-r border-gray-200 w-[10%]">Thứ hai</th>
                  <th className="p-3 border-r border-gray-200 w-[10%]">Thứ ba</th>
                  <th className="p-3 border-r border-gray-200 w-[10%]">Thứ tư</th>
                  <th className="p-3 border-r border-gray-200 w-[10%]">Thứ năm</th>
                  <th className="p-3 border-r border-gray-200 w-[10%]">Thứ sáu</th>
                  {/* Cột Thứ Bảy có text màu xanh dương theo thiết kế */}
                  <th className="p-3 border-r border-gray-200 w-[10%] text-blue-500">Thứ bảy</th>
                  <th className="p-3 border-r border-gray-200 w-[10%] text-red-500">Chủ nhật</th>
                  <th className="p-3 w-[15%]">Lương dự kiến</th>
                </tr>
              </thead>

              {/* Table Body - Hiển thị Trạng thái Trống (Empty State) */}
              <tbody>
                <tr>
                  {/* Cột trái (Trống) */}
                  <td className="border-r border-gray-200 h-[350px]"></td>
                  
                  {/* Ô span qua 8 cột còn lại để chứa thông báo */}
                  <td colSpan="8" className="h-[350px] align-middle">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      {/* Icon User Empty */}
                      <div className="w-12 h-12 mb-3 opacity-60">
                        <img src={Icons.User} alt="empty" className="w-full h-full object-contain filter brightness-0" />
                      </div>
                      <p className="mb-1 text-[13px]">Nhân viên chưa có ca làm việc.</p>
                      <p className="text-[13px]">
                        Nhấn <span className="text-blue-600 font-medium cursor-pointer hover:underline">vào đây</span> để thêm mới ca làm việc.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

          {/* ---------------- CHÚ THÍCH TRẠNG THÁI (LEGEND) ---------------- */}
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-4 flex justify-center items-center gap-6 text-[12px] text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span> Đúng giờ
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span> Đi muộn / về sớm
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> Chấm công thiếu
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> Chưa chấm công
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span> Nghỉ làm
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Timesheet;