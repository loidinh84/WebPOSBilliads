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
          <NavItem label="Báo cáo" active={activeTab === "Báo cáo"} to="/reports" />
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
