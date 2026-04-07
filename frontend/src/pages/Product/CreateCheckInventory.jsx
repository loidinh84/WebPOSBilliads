import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";

function CreateCheckInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [note, setNote] = useState("");

  const productsSample = [
    { MAHANGHOA: "SP000012", TENHANGHOA: "Snack tôm cay (Lớn)", TONKHO: 226 },
    { MAHANGHOA: "SP000013", TENHANGHOA: "Bia Tiger Lon 330ml", TONKHO: 155 },
  ];

  const handleAddItem = (product) => {
    if (items.find((i) => i.MAHANGHOA === product.MAHANGHOA)) return;
    setItems([...items, { ...product, THUCTE: product.TONKHO }]);
    setSearchQuery("");
  };

  const updateActualQty = (code, val) => {
    setItems(
      items.map((i) =>
        i.MAHANGHOA === code ? { ...i, THUCTE: Number(val) } : i,
      ),
    );
  };

  const removeItem = (code) =>
    setItems(items.filter((i) => i.MAHANGHOA !== code));

  const totalInc = items.reduce(
    (sum, i) => (i.THUCTE > i.TONKHO ? sum + (i.THUCTE - i.TONKHO) : sum),
    0,
  );
  const totalDec = items.reduce(
    (sum, i) => (i.THUCTE < i.TONKHO ? sum + (i.TONKHO - i.THUCTE) : sum),
    0,
  );

  const handleFinish = (isDraft) => {
    if (items.length === 0)
      return Swal.fire("Thông báo", "Vui lòng chọn hàng hóa!", "warning");
    Swal.fire(
      "Thành công",
      isDraft ? "Đã lưu phiếu tạm" : "Đã cân bằng kho",
      "success",
    );
    navigate("/products/check-inventory");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-[13px] text-slate-700">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/products/check-inventory")}
            className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            <img src={Icons.ArrowBack} alt="" className="w-4 h-4 opacity-60" />
            <span className="font-medium">Quay lại danh sách</span>
          </button>
          <h1 className="text-xl font-bold text-black ml-4 border-l-2 border-gray-300 pl-4">
            Tạo phiếu kiểm kho
          </h1>
        </div>

        <div className="flex gap-4 items-start">
          {/* CỘT TRÁI: BẢNG HÀNG HÓA */}
          <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Gõ mã hoặc tên hàng hóa để kiểm..."
                  className="w-full border border-gray-200 rounded-md pl-10 pr-4 py-2 focus:border-blue-400 outline-none text-[14px] bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <img
                  src={Icons.Search}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30"
                  alt=""
                />

                {searchQuery && (
                  <div className="absolute top-full left-0 w-full bg-white border shadow-xl z-50 mt-1 rounded overflow-hidden">
                    {productsSample
                      .filter((p) =>
                        p.TENHANGHOA.toLowerCase().includes(
                          searchQuery.toLowerCase(),
                        ),
                      )
                      .map((p) => (
                        <div
                          key={p.MAHANGHOA}
                          onClick={() => handleAddItem(p)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between border-b last:border-0 text-black"
                        >
                          <span className="font-medium">{p.TENHANGHOA}</span>
                          <span className="text-gray-400 text-xs">
                            {p.MAHANGHOA}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 border-b border-gray-200 text-black font-bold">
                  <tr>
                    <th className="p-3 w-12 text-center font-bold">STT</th>
                    <th className="p-3 font-bold">Mã hàng</th>
                    <th className="p-3 font-bold">Tên hàng</th>
                    <th className="p-3 text-center font-bold">Số lượng</th>
                    <th className="p-3 text-right font-bold">Tồn thực tế</th>
                    <th className="p-3 text-right font-bold">Thành tiền</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <img
                            src={Icons.Box}
                            className="w-16 h-16 mb-4"
                            alt=""
                          />
                          <p className="text-lg font-bold text-black">
                            Chưa có hàng hóa nào
                          </p>
                          <p className="text-gray-500">
                            Vui lòng sử dụng thanh tìm kiếm để thêm hàng vào
                            phiếu
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={item.MAHANGHOA}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="p-3 text-center text-gray-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-gray-600 font-mono">
                          {item.MAHANGHOA}
                        </td>
                        <td className="p-3 font-medium text-black">
                          {item.TENHANGHOA}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-500">
                          {item.TONKHO}
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            className="w-20 border-b border-gray-200 text-center font-bold text-black outline-none focus:border-blue-400 bg-transparent"
                            value={item.THUCTE}
                            onChange={(e) =>
                              updateActualQty(item.MAHANGHOA, e.target.value)
                            }
                          />
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${item.THUCTE - item.TONKHO >= 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {item.THUCTE - item.TONKHO > 0
                            ? `+${item.THUCTE - item.TONKHO}`
                            : item.THUCTE - item.TONKHO}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeItem(item.MAHANGHOA)}
                            className="cursor-pointer opacity-30 hover:opacity-100"
                          >
                            <img
                              src={Icons.Delete}
                              className="w-4 h-4"
                              alt=""
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN PHIẾU */}
          <aside className="w-[340px] bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            {/* Header Sidebar */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center text-black">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                  A
                </div>
                <span className="font-bold text-[12px]">Admin</span>
              </div>
              <span className="text-[11px] text-gray-500">4/4/2026 22:05</span>
            </div>

            <div className="p-5 flex-1 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium text-[13px]">
                    Mã phiếu
                  </span>
                  <span className="font-bold text-black text-[14px] font-mono uppercase">
                    PKK000008
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium text-[13px]">
                    Trạng thái
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase border border-amber-100">
                    Phiếu tạm
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Lệch tăng</span>
                  <span className="text-gray-600 font-bold">+{totalInc}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Lệch giảm</span>
                  <span className="text-gray-600 font-bold">-{totalDec}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-bold text-black uppercase text-[12px]">
                    Tổng chênh lệch
                  </span>
                  <span className="text-2xl font-bold text-black">
                    {totalInc - totalDec}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <label className="text-gray-400 font-bold text-[11px] uppercase block mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 border border-gray-200 rounded p-2 outline-none focus:border-blue-400 resize-none text-black text-[13px]"
                  placeholder="Lý do chênh lệch..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => handleFinish(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-all active:scale-95 shadow-sm text-[12px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <img
                  src={Icons.SaveFile}
                  className="w-3.5 h-3.5 brightness-0 invert"
                  alt=""
                />
                LƯU TẠM
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="flex-1 bg-[#00a651] hover:bg-green-700 text-white font-bold py-2.5 rounded transition-all active:scale-95 shadow-sm text-[12px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <img
                  src={Icons.Tick}
                  className="w-3.5 h-3.5 brightness-0 invert"
                  alt=""
                />
                HOÀN THÀNH
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CreateCheckInventory;
