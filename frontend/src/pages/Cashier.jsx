import React from "react";
import DashboardHeader from "../components/DashboardHeader";

function CashierPage() {
  const activeTables = [
    { id: 1, name: "Bàn 01", total: "150.000đ", status: "Đang chơi" },
    { id: 2, name: "Bàn 03", total: "280.000đ", status: "Chờ thanh toán" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <DashboardHeader />
      <main className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-800">Quầy Thu Ngân</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600">
              Lịch sử hóa đơn
            </button>
            <button className="px-6 py-3 bg-[#5D5FEF] text-white rounded-2xl font-bold">
              Mở bàn mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTables.map((table) => (
            <div
              key={table.id}
              className="bg-white p-6 rounded-[30px] shadow-md border-b-4 border-[#5D5FEF]"
            >
              <p className="text-gray-400 font-black text-xs uppercase mb-1">
                {table.status}
              </p>
              <h3 className="text-2xl font-black text-gray-800 mb-4">
                {table.name}
              </h3>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-4">
                <span className="text-gray-500 font-bold">Tổng cộng:</span>
                <span className="text-[#5D5FEF] font-black text-xl">
                  {table.total}
                </span>
              </div>
              <button
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  table.status === "Chờ thanh toán"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {table.status === "Chờ thanh toán"
                  ? "Thanh toán ngay"
                  : "Xem chi tiết"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default CashierPage;
