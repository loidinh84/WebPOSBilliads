import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function StaffSetup() {
  const [activeTab, setActiveTab] = useState("Khởi tạo");
  
  // State quản lý việc đóng/mở Modal Thêm Nhân Viên
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

  // Dữ liệu Menu bên trái (Đã xóa phần Tiện ích Máy chấm công)
  const setupMenu = [
    { id: "Khởi tạo", icon: Icons.SettingIcon, label: "Khởi tạo" },
    { id: "Chấm công", icon: Icons.ClipboardIcon, label: "Chấm công" },
    { id: "Tính lương", icon: Icons.MoneyIcon, label: "Tính lương" },
    { id: "Ngày làm", icon: Icons.CalendarIcon, label: "Ngày làm và ngày nghỉ" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Khởi tạo":
        return (
          <div className="animate-fadeIn relative">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Khởi tạo</h2>
            <p className="text-gray-500 mb-8 text-[13px]">
              Khởi tạo bước cài đặt để quản lý nhân viên hiệu quả, tối ưu vận hành và tính lương chính xác.
            </p>

            <div className="space-y-6">
              {/* BƯỚC 1: THÊM NHÂN VIÊN (Đang Active) */}
              <div className="flex gap-4 p-4 border border-blue-200 bg-blue-50/50 rounded-lg shadow-sm">
                <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-[14px]">Thêm nhân viên</h3>
                  <p className="text-gray-600 text-[13px] mt-1 mb-3">
                    Bắt đầu thêm hồ sơ của nhân viên để quản lý hiệu quả và cấp quyền truy cập hệ thống.
                  </p>
                  <button 
                    onClick={() => setIsAddEmployeeModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    + Thiết lập ngay
                  </button>
                </div>
              </div>

              {/* Các bước 2->6 (Inactive, chờ làm tiếp) */}
              {[
                { step: 2, title: "Tạo ca làm việc", desc: "Tạo các ca làm việc trong cửa hàng (ví dụ: Ca sáng 8:00 - 12:00)." },
                { step: 3, title: "Xếp lịch làm việc", desc: "Xếp lịch làm việc cho nhân viên, tự động tạo lịch và hỗ trợ lập tuần." },
                { step: 4, title: "Hình thức chấm công", desc: "Chọn hình thức chấm công của cửa hàng (Zalo mini map, Máy chấm công)." },
                { step: 5, title: "Thiết lập lương", desc: "Cấu hình các mục được ghi nhận lương, thưởng, hoa hồng, phụ cấp." },
                { step: 6, title: "Thiết lập bảng lương", desc: "Theo dõi chính xác và tự động tính lương của nhân viên." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 opacity-50 px-4">
                  <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-300 text-gray-400 font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-600 text-[14px]">{item.title}</h3>
                    <p className="text-gray-500 text-[13px] mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "Chấm công": return <div className="text-gray-500">Giao diện cấu hình Chấm công...</div>;
      case "Tính lương": return <div className="text-gray-500">Giao diện cấu hình Tính lương...</div>;
      case "Ngày làm": return <div className="text-gray-500">Giao diện Ngày làm...</div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[13px]">
      <DashboardHeader />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Thiết lập nhân viên</h1>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* CỘT TRÁI: SIDEBAR MENU */}
          <aside className="w-full md:w-[260px] bg-white rounded-lg shadow-sm shrink-0 py-4">
            <div className="px-4">
              <h3 className="font-bold text-gray-800 mb-3 text-[14px]">Thiết lập</h3>
              <ul className="space-y-1">
                {setupMenu.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                        isActive ? "bg-[#dbeafe] text-black font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-4 h-4 shrink-0">
                        <img 
                          src={item.icon} 
                          alt={item.id} 
                          className={`w-full h-full object-contain ${isActive ? "" : "filter brightness-0 opacity-70"}`} 
                        />
                      </div>
                      <span className="text-[13px]">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* CỘT PHẢI: NỘI DUNG */}
          <section className="flex-1 bg-white rounded-lg shadow-sm p-6 lg:p-8 min-h-[500px]">
            {renderContent()}
          </section>

        </div>
      </main>

      {/* ================================================================= */}
      {/* MODAL 1: THÊM NHÂN VIÊN */}
      {/* ================================================================= */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Thêm nhân viên mới</h2>
              <button 
                onClick={() => setIsAddEmployeeModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body Modal (Form) */}
            <div className="p-6 space-y-5">
              
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Mã nhân viên</label>
                   <input type="text" placeholder="Tự động tạo (VD: NV0001)" disabled className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 text-sm cursor-not-allowed" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên nhân viên <span className="text-red-500">*</span></label>
                   <input type="text" placeholder="Nhập họ và tên..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 outline-none text-sm transition-colors" />
                 </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                   <input type="text" placeholder="Nhập SĐT..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 outline-none text-sm transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Vai trò <span className="text-red-500">*</span></label>
                   <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 outline-none text-sm bg-white transition-colors cursor-pointer">
                      <option value="">-- Chọn vai trò --</option>
                      <option value="cashier">Thu ngân</option>
                      <option value="staff">Nhân viên phục vụ</option>
                      <option value="bida_staff">Nhân viên xếp bi</option>
                      <option value="manager">Quản lý</option>
                   </select>
                 </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-5 mt-2">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[14px] text-blue-800">Cấp tài khoản đăng nhập hệ thống</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 rounded" />
                      <span className="text-xs font-medium text-gray-600">Cho phép đăng nhập</span>
                    </label>
                 </div>

                 {/* Row 3: Account Info */}
                 <div className="grid grid-cols-2 gap-5 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                   <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên đăng nhập <span className="text-red-500">*</span></label>
                     <input type="text" placeholder="VD: nguyenvan_a" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 outline-none text-sm transition-colors" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                     <input type="password" placeholder="Nhập mật khẩu..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 outline-none text-sm transition-colors" />
                   </div>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
               <button 
                 onClick={() => setIsAddEmployeeModalOpen(false)} 
                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-bold text-[13px] hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
               >
                 Hủy bỏ
               </button>
               <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold text-[13px] hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                 Lưu nhân viên
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StaffSetup;