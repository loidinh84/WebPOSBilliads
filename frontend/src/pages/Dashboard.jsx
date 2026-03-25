import React from "react";
import * as Icons from "../assets/icons/index";
import DashboardHeader from "../components/DashboardHeader";
import DashboardNav from "../components/DashboardNav";

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Tổng quan" />

      <main className="max-w-[1440px] mx-auto p-8 grid grid-cols-12 gap-6">
        {/* Nội dung bên trái */}
        <div className="col-span-9 space-y-6">
          <h2 className="text-xl font-bold  uppercase tracking-widest text-gray-600 ml-1">
            Kết quả bán hàng hằng ngày
          </h2>

          <div className="grid grid-cols-3 gap-6 ">
            <StatCard
              icon={Icons.Dollar}
              title="3 Đơn đã xong"
              value="2,100,000"
              color="text-red-500"
              iconCircleBg="bg-red-50"
              iconFilter="invert(20%) sepia(90%) saturate(3000%) hue-rotate(340deg)"
            />
            <StatCard
              icon={Icons.Pen}
              title="2 Đơn đang phục vụ"
              value="2"
              color="text-green-600"
              iconCircleBg="bg-green-50"
              iconFilter="invert(40%) sepia(90%) saturate(1000%) hue-rotate(100deg)"
            />
            <StatCard
              icon={Icons.Customer}
              title="Khách hàng"
              value="7"
              color="text-orange-500"
              iconCircleBg="bg-orange-50"
              iconFilter="invert(60%) sepia(80%) saturate(1000%) hue-rotate(15deg)"
            />
          </div>

          {/* Biểu đồ */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[420px]">
            <h3 className="text-xl font-bold text-gray-800 mb-8">
              Doanh số hôm nay
            </h3>
            <div className="h-64 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium"></div>
          </div>
        </div>

        {/* Cột bên phải */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="p-5 text-xl font-semibold text-center border-b border-gray-100 bg-gray-50/30 text-gray-700">
              Giao dịch gần đây
            </h3>
            <div className="p-5 space-y-6">
              <TransactionItem
                icon={Icons.Dollar}
                table="01"
                amount="255,000"
                time="14:30"
              />
              <TransactionItem
                icon={Icons.Dollar}
                table="04"
                amount="45,000"
                time="15:00"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color, iconCircleBg, iconFilter }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-gray-200 transition-all">
      <div
        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg ${iconCircleBg}`}
      >
        <img
          src={icon}
          alt="icon"
          className="w-6 h-6 object-contain"
          style={{ filter: iconFilter }}
        />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-gray-800 uppercase tracking-wide">
          {title}
        </p>
        <h4 className={`text-xl font-bold ${color} mt-0.5`}>{value}</h4>
      </div>
    </div>
  );
}

function TransactionItem({ icon, table, amount, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-50">
        <img
          src={icon}
          alt="tx"
          className="w-4 h-4"
          style={{
            filter: "invert(40%) sepia(80%) saturate(2000%) hue-rotate(190deg)",
          }}
        />
      </div>
      <div className="text-[14px]">
        <p className="text-gray-600 font-medium leading-tight">
          Bàn <span className="text-gray-900 font-bold">{table}</span> thanh
          toán <br />
          <span className="text-blue-600 font-bold">{amount} VND</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">
          Lúc {time}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
