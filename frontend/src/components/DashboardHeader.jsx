import React from "react";
import Logo from "../assets/images/Logo.png";
import * as Icons from "../assets/icons/index";

function DashboardHeader({ storeName }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="flex justify-between items-center px-6 lg:px-12 py-4">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
          {/* Giảm từ font-black xuống font-extrabold để chữ sắc nét hơn */}
          <h1 className="text-2xl font-extrabold text-[#5D5FEF] tracking-tight">
            {storeName}
          </h1>
        </div>

        <div className="flex items-center gap-10 text-base font-semibold text-gray-600">
          <div className="cursor-pointer hover:text-[#5D5FEF] transition-colors">
            Thanh toán
          </div>

          <div className="flex items-center  cursor-pointer hover:text-[#5D5FEF]">
            Tiếng Việt (VN)
            <img src={Icons.ArrowDrop} alt="Dropdown" className="w-7 h-10" />
          </div>

          <button className="flex items-center cursor-pointer gap-2 hover:text-[#5D5FEF]">
            <img src={Icons.Setting} alt="Setting" className="w-5" />
            Thiết lập
          </button>

          <div className="flex items-center gap-3 bg-gray-100 px-5 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-all">
            <img src={Icons.User} alt="Avatar" className="w-6 h-6" />
            <span className="text-gray-700 font-bold">[Tên Tài Khoản]</span>
          </div>
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;
