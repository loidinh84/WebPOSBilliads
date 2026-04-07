import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";

function CreateCheckInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [note, setNote] = useState("");

  // 1. Lấy hàng hóa thật từ DB
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setAllProducts(result.data);
      });
  }, []);

  const handleAddItem = (product) => {
    if (items.find((i) => i.MAHANGHOA === product.MAHANGHOA)) return;
    setItems([
      ...items,
      {
        ...product,
        TONKHO: product.SOLUONGTONKHO || 0,
        THUCTE: product.SOLUONGTONKHO || 0,
      },
    ]);
    setSearchQuery("");
  };

  // 2. Kích hoạt logic lưu dữ liệu
  const handleFinish = async (isDraft) => {
    if (items.length === 0)
      return Swal.fire("Thông báo", "Vui lòng chọn hàng hóa!", "warning");
    try {
      const res = await fetch("http://localhost:5000/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, note, isDraft }),
      });
      const result = await res.json();
      if (result.success) {
        await Swal.fire(
          "Thành công",
          isDraft ? "Đã lưu phiếu tạm" : "Đã cân bằng kho",
          "success",
        );
        navigate("/product/check-inventory");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể kết nối Server", "error");
    }
  };

  const totalInc = items.reduce(
    (sum, i) => (i.THUCTE > i.TONKHO ? sum + (i.THUCTE - i.TONKHO) : sum),
    0,
  );
  const totalDec = items.reduce(
    (sum, i) => (i.THUCTE < i.TONKHO ? sum + (i.TONKHO - i.THUCTE) : sum),
    0,
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-[13px] text-slate-700">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/products/check-inventory")}
            className="flex items-center gap-1 text-gray-500 hover:text-black cursor-pointer"
          >
            <img src={Icons.ArrowBack} alt="" className="w-4 h-4 opacity-60" />{" "}
            <span>Quay lại danh sách</span>
          </button>
          <h1 className="text-xl font-bold text-black ml-4 border-l-2 border-gray-300 pl-4">
            Tạo phiếu kiểm kho
          </h1>
        </div>

        <div className="flex gap-4 items-start">
          {/* CỘT TRÁI: BẢNG HÀNG HÓA GỐC */}
          <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Gõ mã hoặc tên hàng hóa để kiểm..."
                  className="w-full border border-gray-200 rounded-md pl-10 pr-4 py-2 outline-none focus:border-blue-400 text-[14px]"
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
                    {allProducts
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
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Mã hàng</th>
                    <th className="p-3">Tên hàng</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Tồn thực tế</th>
                    <th className="p-3 text-right">Thành tiền</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-20 text-center text-gray-400 italic"
                      >
                        Chưa có hàng hóa nào
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={item.MAHANGHOA}
                        className="border-b border-gray-50 hover:bg-gray-50/50 text-black"
                      >
                        <td className="p-3 text-center text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-gray-600 font-mono">
                          {item.MAHANGHOA}
                        </td>
                        <td className="p-3 font-medium">{item.TENHANGHOA}</td>
                        <td className="p-3 text-center font-bold text-gray-500">
                          {item.TONKHO}
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            className="w-20 border-b border-gray-200 text-center font-bold outline-none"
                            value={item.THUCTE}
                            onChange={(e) =>
                              setItems(
                                items.map((i) =>
                                  i.MAHANGHOA === item.MAHANGHOA
                                    ? { ...i, THUCTE: Number(e.target.value) }
                                    : i,
                                ),
                              )
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
                            onClick={() =>
                              setItems(
                                items.filter(
                                  (i) => i.MAHANGHOA !== item.MAHANGHOA,
                                ),
                              )
                            }
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

          {/* CỘT PHẢI: THÔNG TIN PHIẾU GỐC */}
          <aside className="w-[340px] bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
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
                  <span className="text-gray-400 font-medium">Mã phiếu</span>
                  <span className="font-bold text-black uppercase">
                    PKK000008
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Trạng thái</span>
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
                  className="w-full h-24 border border-gray-200 rounded p-2 outline-none text-black resize-none"
                  placeholder="Lý do chênh lệch..."
                />
              </div>
            </div>

            <div className="p-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => handleFinish(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded shadow-sm text-[12px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <img
                  src={Icons.SaveFile}
                  className="w-3.5 h-3.5 brightness-0 invert"
                  alt=""
                />{" "}
                LƯU TẠM
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="flex-1 bg-[#00a651] hover:bg-green-700 text-white font-bold py-2.5 rounded shadow-sm text-[12px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <img
                  src={Icons.Tick}
                  className="w-3.5 h-3.5 brightness-0 invert"
                  alt=""
                />{" "}
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
