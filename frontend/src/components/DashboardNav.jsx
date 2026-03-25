import React from "react";
import { Link } from "react-router-dom";
import * as Icons from "../assets/icons/index";

function DashboardNav({ activeTab = "Tổng quan" }) {
  return (
    <nav className="bg-[#5D5FEF] sticky top-0 z-40  shadow-sm w-full font-inter">
      <div className="flex justify-between items-center  px-6 lg:px-12">
        <div className="flex text-xl font-bold cursor-pointer text-white">
          <NavItem label="Tổng quan" active={activeTab === "Tổng quan"} to="/dashboard" />
          <NavItem label="Hàng hóa" active={activeTab === "Hàng hóa"} to="/products" />
          <NavItem label="Bàn" active={activeTab === "Bàn"} to="/tables" />
          <NavItem label="Giao dịch" active={activeTab === "Giao dịch"} to="/transactions" />
          <NavItem label="Nhân viên" active={activeTab === "Nhân viên"} to="/staff" />
          
          <div className="relative group">
            <NavItem label="Báo cáo" active={activeTab === "Báo cáo"} to="/reports?type=revenue" />
            
            {/* Dropdown Menu */}
            <div className="absolute top-[100%] left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden text-gray-800">
              <Link to="/reports?type=revenue" className="block px-5 py-3 text-[14px] font-medium hover:bg-gray-50 hover:text-[#5D5FEF] transition-colors border-b border-gray-50">
                Báo cáo doanh thu
              </Link>
              <Link to="/reports?type=expense" className="block px-5 py-3 text-[14px] font-medium hover:bg-gray-50 hover:text-[#5D5FEF] transition-colors">
                Báo cáo chi phí
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-3 py-2">
          <button className="bg-white hover:bg-gray-100 cursor-pointer text-2xl px-5 py-2 rounded-lg flex items-center gap-2 font-semibold text-gray-800 transition-all shadow-sm">
            <img src={Icons.Bell} alt="Nhà bếp" className="w-7 h-10" /> Nhà bếp
          </button>
          <button className="bg-white hover:bg-gray-100 cursor-pointer px-5 py-2 rounded-lg flex items-center gap-2 text-xl font-semibold text-gray-800 transition-all shadow-sm">
            <img src={Icons.MoneyBag} alt="Thu ngân" className="w-7 h-10" /> Thu ngân
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ label, active = false, to = "#" }) {
  return (
    <Link
      to={to}
      className={`px-7 py-5 font-semibold transition-all border-b-4 block ${
        active
          ? "bg-white/10 border-white text-white"
          : "border-transparent text-white/80 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}
export default DashboardNav;
