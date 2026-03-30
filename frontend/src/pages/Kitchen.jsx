import React from "react";
import DashboardHeader from "../components/DashboardHeader";

function KitchenPage() {
  const mockOrders = [
    {
      id: 1,
      table: "Bàn 05",
      items: ["Mì xào bò", "Coca-Cola"],
      time: "5 phút trước",
      status: "Đang chờ",
    },
    {
      id: 2,
      table: "Bàn 02",
      items: ["Cá viên chiên", "Sting"],
      time: "2 phút trước",
      status: "Đang chờ",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-800">Khu vực Nhà Bếp</h2>
          <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold">
            {mockOrders.length} đơn đang chờ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-[#5D5FEF]">
                  {order.table}
                </h3>
                <span className="text-xs text-gray-400 font-bold uppercase">
                  {order.time}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 font-semibold text-gray-700"
                  >
                    <div className="w-2 h-2 bg-gray-300 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all">
                Hoàn thành
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default KitchenPage;
