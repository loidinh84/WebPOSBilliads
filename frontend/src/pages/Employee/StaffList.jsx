import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function StaffList() {
  const [employees] = useState([
    {
      id: 1,
      staffId: "NV001",
      checkInId: "1001",
      name: "Trần Thanh Khang",
      phone: "0344999655",
      idCard: "12345678910",
      avatar: null,
    },
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-4">
          {/* Trạng thái nhân viên */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">
              Trạng thái nhân viên
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all"
                    defaultChecked
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-[#5D5FEF]">
                  Đang làm việc
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all"
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-[#5D5FEF]">
                  Đã nghỉ
                </span>
              </label>
            </div>
          </div>

          {/* Phòng ban */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3">
              Phòng ban
            </h3>
            <div className="relative">
              <select className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all text-gray-600 font-medium">
                <option>Chọn phòng ban</option>
              </select>
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50"
                alt="arrow"
              />
            </div>
          </div>

          {/* Chức danh */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3">
              Chức danh
            </h3>
            <div className="relative">
              <select className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all text-gray-600 font-medium">
                <option>Chọn chức danh</option>
              </select>
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50"
                alt="arrow"
              />
            </div>
          </div>

          {/* Tìm kiếm thông tin */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3">
              Tìm kiếm thông tin
            </h3>
            <div className="relative group">
              <img
                src={Icons.Search}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity"
                alt="search"
              />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="col-span-12 md:col-span-9 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Danh sách nhân viên
            </h2>
            <div className="flex gap-3">
              <button className="bg-white hover:bg-gray-50 text-[#5D5FEF] border border-gray-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95 leading-none cursor-pointer">
                <span className="text-xl">+</span>
                <span>Nhân viên</span>
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
                <div className="bg-black rounded-md p-1 flex items-center justify-center">
                  <img
                    src={Icons.insertPage}
                    className="w-3.5 h-3.5 invert"
                    alt="approve"
                  />
                </div>
                <span>Duyệt yêu cầu</span>
              </button>
              <button className="bg-white hover:bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm transition-all active:scale-95 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-lg leading-none mb-1">
                  ...
                </span>
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
            <div className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr] bg-[#EDF2F9] border-b border-gray-200">
              <div className="p-4 flex justify-center border-r border-gray-200">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                />
              </div>
              <div className="p-4 text-[14px] font-bold text-gray-700">Ảnh</div>
              <div className="p-4 text-[14px] font-bold text-gray-700">
                Mã nhân viên
              </div>
              <div className="p-4 text-[14px] font-bold text-gray-700">
                Mã chấm công
              </div>
              <div className="p-4 text-[14px] font-bold text-gray-700">
                Tên nhân viên
              </div>
              <div className="p-4 text-[14px] font-bold text-gray-700">
                Số điện thoại
              </div>
              <div className="p-4 text-[14px] font-bold text-gray-700">
                Số CMND/CCCD
              </div>
            </div>

            {/* Table Rows or Empty State */}
            {employees.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr] border-b border-gray-100 hover:bg-white hover:shadow-md transition-all group items-center"
                  >
                    <div className="p-4 flex justify-center border-r border-gray-50 h-full items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF] cursor-pointer"
                      />
                    </div>
                    <div className="p-4 border-r border-gray-50 flex items-center h-full">
                      {emp.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <img
                          src={Icons.Person}
                          alt="user"
                          className="w-8 h-8 opacity-20"
                        />
                      )}
                    </div>
                    <div className="p-4 text-[14px] text-gray-700 font-medium flex items-center border-r border-gray-50">
                      {emp.staffId}
                    </div>
                    <div className="p-4 text-[14px] text-gray-700 font-medium flex items-center border-r border-gray-50">
                      {emp.checkInId}
                    </div>
                    <div className="p-4 text-[14px] text-gray-800 font-bold flex items-center border-r border-gray-50 group-hover:text-[#5D5FEF] transition-colors">
                      {emp.name}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 flex items-center border-r border-gray-50">
                      {emp.phone}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 flex items-center">
                      {emp.idCard}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <img
                  src={Icons.Person}
                  className="w-16 h-16 opacity-30 mb-2"
                  alt="no staff"
                />
                <p className="text-gray-400 font-medium text-[15px]">
                  Gian hàng chưa có nhân viên.
                  <br />
                  Nhấn{" "}
                  <span className="text-[#5D5FEF] font-bold cursor-pointer hover:underline">
                    vào đây
                  </span>{" "}
                  để thêm mới nhân viên.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StaffList;
