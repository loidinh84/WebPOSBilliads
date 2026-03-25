import React from "react";
import { Link } from "react-router-dom";
import * as Icons from "../assets/icons/index";

function DashboardNav({ activeTab = "Tổng quan" }) {
  return (
    <nav className="bg-[#5D5FEF] sticky top-0 z-40 shadow-sm w-full font-inter">
      <div className="flex justify-between items-center px-6 lg:px-12">
        <div className="flex text-[16px] font-bold cursor-pointer text-white">
          <NavItem
            label="Tổng quan"
            active={activeTab === "Tổng quan"}
            to="/dashboard"
          />

          {/* Menu Dropdown: Hàng hóa */}
          <NavItem
            label="Hàng hóa"
            active={activeTab === "Hàng hóa"}
            to="/products/list"
            dropdown={[
              { label: "Danh sách hàng hóa", to: "/products/list" },
              { label: "Thiết lập giá", to: "/products/price-setting" },
              { label: "Kiểm kho", to: "/products/check-inventory" },
            ]}
          />

          <NavItem label="Bàn" active={activeTab === "Bàn"} to="/tables" />

          {/* Menu Dropdown: Giao dịch */}
          <NavItem
            label="Giao dịch"
            active={activeTab === "Giao dịch"}
            to="/transactions/invoices"
            dropdown={[
              { label: "Hóa đơn", to: "/transactions/invoices" },
              { label: "Nhập hàng", to: "/transactions/imports" },
              { label: "Trả hàng nhập", to: "/transactions/return-imports" },
              { label: "Xuất hủy", to: "/transactions/exports" },
            ]}
          />

          {/* Menu Dropdown: Nhân viên */}
          <NavItem
            label="Nhân viên"
            active={activeTab === "Nhân viên"}
            to="/staff"
            dropdown={[
              { label: "Danh sách nhân viên", to: "/staff/list" },
              { label: "Lịch làm việc", to: "/staff/schedule" },
              { label: "Bảng chấm công", to: "/staff/time-sheet" },
              { label: "Bảng lương", to: "/staff/payroll" },
              { label: "Thiết lập nhân viên", to: "/staff/settings" },
            ]}
          />

          {/* Menu Dropdown: Báo cáo */}
          <NavItem
            label="Báo cáo"
            active={activeTab === "Báo cáo"}
            to="/reports"
            dropdown={[
              { label: "Báo cáo doanh thu", to: "/reports?type=revenue" },
              { label: "Báo cáo chi phí", to: "/reports?type=expense" },
            ]}
          />
        </div>

        {/* Cụm nút bấm bên phải */}
        <div className="flex gap-3 py-2">
          <button className="bg-white hover:bg-gray-100 cursor-pointer text-[15px] px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-gray-800 transition-all shadow-sm">
            <img
              src={Icons.Bell}
              alt="Nhà bếp"
              className="w-7 h-10 object-contain"
            />
            Nhà bếp
          </button>
          <button className="bg-white hover:bg-gray-100 cursor-pointer text-[15px] px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-gray-800 transition-all shadow-sm">
            <img
              src={Icons.MoneyBag}
              alt="Thu ngân"
              className="w-7 h-10 object-contain"
            />
            Thu ngân
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ label, active = false, to = "#", dropdown }) {
  if (!dropdown) {
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

  // Trường hợp CÓ dropdown
  return (
    <div className="relative group">
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

      {/* Box Dropdown Menu */}
      <div className="absolute top-full left-0 min-w-[220px] bg-white border border-gray-100 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden text-gray-800 flex flex-col pt-1">
        {dropdown.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="block px-5 py-3.5 text-[14px] font-medium hover:bg-gray-50 hover:text-[#5D5FEF] transition-colors border-b border-gray-50 last:border-none"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardNav;
