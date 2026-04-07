import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { useNavigate } from "react-router-dom";
import * as Icons from "../../assets/icons/index";

function CheckInventory() {
  const navigate = useNavigate();
  const [inventorySlips] = useState([
    {
      id: "PKK000007",
      createdDate: "30/11/2025 14:12",
      totalDiff: 10,
      incDiff: 10,
      decDiff: 0,
      note: "Kiểm kho định kỳ cuối tháng.",
      status: "Đã cân bằng kho",
    },
    {
      id: "PKK000006",
      createdDate: "29/11/2025 22:43",
      totalDiff: -5,
      incDiff: 0,
      decDiff: 5,
      note: "Kiểm tra lại bia Tiger.",
      status: "Đã cân bằng kho",
    },
  ]);

  const [searchId, setSearchId] = useState("");

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-slate-700 text-[13px]">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-4">
        {/* SIDEBAR LỌC */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3">
          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-800 uppercase tracking-tight text-[12px]">
              Tìm kiếm
            </h3>
            <input
              type="text"
              placeholder="Theo mã phiếu..."
              className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500 transition-all"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>

          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-400 uppercase tracking-widest text-[11px]">
              Trạng thái
            </h3>
            <div className="space-y-2">
              {["Phiếu tạm", "Đã cân bằng kho", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    defaultChecked={st === "Đã cân bằng kho"}
                  />
                  <span className="group-hover:text-blue-600 transition-colors">
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Danh sách phiếu kiểm kho
            </h1>
            <button
              onClick={() => navigate("/product/check-inventory/create")}
              className="flex items-center gap-2 bg-[#00a651] hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <img
                src={Icons.Add}
                className="w-4 h-4 brightness-0 invert"
                alt=""
              />
              KIỂM KHO
            </button>
          </div>

          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="p-3 w-10 text-center">
                    <input type="checkbox" className="cursor-pointer" />
                  </th>
                  <th className="p-3">Mã kiểm kho</th>
                  <th className="p-3 text-center">Ngày lập</th>
                  <th className="p-3 text-right">Tổng lệch</th>
                  <th className="p-3 text-right">Tăng</th>
                  <th className="p-3 text-right">Giảm</th>
                  <th className="p-3">Ghi chú</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventorySlips.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 text-center">
                      <input type="checkbox" className="cursor-pointer" />
                    </td>
                    <td className="p-3 font-bold text-blue-600 group-hover:underline">
                      {slip.id}
                    </td>
                    <td className="p-3 text-center text-slate-500 font-mono">
                      {slip.createdDate}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {slip.totalDiff}
                    </td>
                    <td className="p-3 text-right text-gray-700 font-bold">
                      +{slip.incDiff}
                    </td>
                    <td className="p-3 text-right text-gray-700 font-bold">
                      -{slip.decDiff}
                    </td>
                    <td className="p-3 text-slate-400 italic truncate max-w-[200px]">
                      {slip.note}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-600 font-black uppercase text-[10px] tracking-tighter">
                        {slip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-10 text-center text-slate-400 italic">
              -- Hết danh sách phiếu --
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckInventory;
