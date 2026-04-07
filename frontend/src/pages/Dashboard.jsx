import React, { useState, useEffect } from "react";
import * as Icons from "../assets/icons/index";
import DashboardHeader from "../components/DashboardHeader";
import DashboardNav from "../components/DashboardNav";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [chartView, setChartView] = useState("revenue");
  const [data, setData] = useState({
    stats: {
      completedOrders: 0,
      revenue: 0,
      occupancyRate: 0,
      activeOrders: 0,
    },
    hourlyData: [],
    recentTransactions: [],
  });

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bills/dashboard/stats?date=${selectedDate}`,
      );
      const result = await res.json();
      if (result.success) setData(result);
    } catch (err) {
      console.error("Lỗi kết nối Dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Tổng quan" />

      <main className="max-w-[1440px] mx-auto p-8 grid grid-cols-12 gap-6">
        <div className="col-span-9 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-600">
              Thống kê hoạt động
            </h2>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition-all">
              <span className="text-[11px] font-black text-gray-400 uppercase">
                Chọn ngày:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none text-sm font-bold text-blue-600 cursor-pointer bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <StatCard
              icon={Icons.Dollar}
              title={`${data.stats.completedOrders} Đơn đã xong`}
              value={`${data.stats.revenue.toLocaleString()} đ`}
              color="text-red-500"
              iconCircleBg="bg-red-50"
              iconFilter="invert(20%) sepia(90%) saturate(3000%) hue-rotate(340deg)"
            />
            <StatCard
              icon={Icons.Pen}
              title="Bàn đang sử dụng"
              value={data.stats.activeOrders.toString()}
              color="text-green-600"
              iconCircleBg="bg-green-50"
              iconFilter="invert(40%) sepia(90%) saturate(1000%) hue-rotate(100deg)"
            />
            <StatCard
              icon={Icons.Customer}
              title="Công suất bàn"
              value={`${data.stats.occupancyRate}%`}
              color="text-indigo-600"
              iconCircleBg="bg-indigo-50"
              iconFilter="invert(30%) sepia(90%) saturate(1500%) hue-rotate(220deg)"
            />
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[480px]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-bold text-gray-800">
                Biểu đồ tăng trưởng
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartView("revenue")}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${chartView === "revenue" ? "bg-white shadow-md text-red-600" : "text-gray-400"}`}
                >
                  DOANH THU
                </button>
                <button
                  onClick={() => setChartView("orders")}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${chartView === "orders" ? "bg-white shadow-md text-blue-600" : "text-gray-400"}`}
                >
                  SỐ ĐƠN
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hourlyData}>
                  <defs>
                    <linearGradient id="colorTheme" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          chartView === "revenue" ? "#ef4444" : "#3b82f6"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          chartView === "revenue" ? "#ef4444" : "#3b82f6"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(val) => [
                      chartView === "revenue"
                        ? `${val.toLocaleString()} đ`
                        : `${val} đơn`,
                      chartView === "revenue" ? "Doanh thu" : "Sản lượng",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartView === "revenue" ? "revenue" : "orders"}
                    stroke={chartView === "revenue" ? "#ef4444" : "#3b82f6"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTheme)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <h3 className="p-5 text-xl font-semibold text-center border-b border-gray-100 bg-gray-50/30 text-gray-700">
              Giao dịch gần đây
            </h3>
            <div className="p-5 space-y-6">
              {data.recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx.MAHOADON}
                  icon={Icons.Dollar}
                  table={tx.TENBAN}
                  amount={tx.TONGTHANHTOAN.toLocaleString()}
                  time={tx.THOIGIAN_STR || "--:--"}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color, iconCircleBg, iconFilter }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:scale-[1.02] transition-all cursor-default group">
      <div
        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg ${iconCircleBg} transition-transform group-hover:rotate-12`}
      >
        <img
          src={icon}
          alt="icon"
          className="w-6 h-6 object-contain"
          style={{ filter: iconFilter }}
        />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        <h4 className={`text-xl font-bold ${color} mt-0.5`}>{value}</h4>
      </div>
    </div>
  );
}

function TransactionItem({ icon, table, amount, time }) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
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
      <div className="text-[14px] flex-1">
        <p className="text-gray-600 font-medium leading-tight">
          <span className="text-gray-900 font-bold">{table}</span> thanh toán{" "}
          <br />
          <span className="text-blue-600 font-bold">{amount} VND</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-tighter">
          Lúc {time}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
