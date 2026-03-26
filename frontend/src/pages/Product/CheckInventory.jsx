import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function CheckInventory() {
  // =========================================================================
  // 1. STATE DỮ LIỆU PHIẾU KIỂM KHO
  // =========================================================================
  const [inventorySlips, setInventorySlips] = useState([
    { 
      id: "PKK000007", 
      createdDate: "30/11/2025 14:12", 
      totalDiff: 10, incDiff: 10, decDiff: 0, 
      note: "Kiểm kho định kỳ cuối tháng.", 
      status: "Đã cân bằng kho",
      employee: "Admin",
      items: [
        { id: "SP000012", name: "Snack tôm cay (Lớn)", systemQty: 226, actualQty: 236, diff: 10 }
      ]
    },
    { 
      id: "PKK000006", 
      createdDate: "29/11/2025 22:43", 
      totalDiff: -5, incDiff: 0, decDiff: 5, 
      note: "Kiểm tra lại bia Tiger do nghi ngờ thất thoát.", 
      status: "Đã cân bằng kho",
      employee: "Thu Ngân 1",
      items: [
        { id: "SP000013", name: "Bia Tiger Lon 330ml", systemQty: 155, actualQty: 150, diff: -5 }
      ]
    },
  ]);

  // =========================================================================
  // 2. STATE DỮ LIỆU HÀNG HÓA (Dành cho lúc bấm "Kiểm kho")
  // =========================================================================
  const [products] = useState([
    { id: "SP000012", name: "Snack tôm cay (Lớn)", type: "Hàng thường", category: "ĐỒ ĂN", systemQty: 236 },
    { id: "SP000013", name: "Bia Tiger Lon 330ml", type: "Hàng thường", category: "ĐỒ UỐNG", systemQty: 150 },
    { id: "SP000014", name: "Thuốc JET", type: "Hàng thường", category: "THUỐC LÁ", systemQty: 45 },
    { id: "SP000015", name: "Bò húc", type: "Hàng thường", category: "ĐỒ UỐNG", systemQty: 120 },
  ]);

  // =========================================================================
  // 3. STATE ĐIỀU HƯỚNG GIAO DIỆN
  // =========================================================================
  const [viewMode, setViewMode] = useState("LIST"); // "LIST" | "CHECKING"
  const [selectedSlip, setSelectedSlip] = useState(null); // Lưu thông tin phiếu đang xem chi tiết

  // BỘ LỌC CHO DANH SÁCH PHIẾU
  const [slipSearchQuery, setSlipSearchQuery] = useState("");
  const [isStatusExpanded, setIsStatusExpanded] = useState(true);
  const [statusFilters, setStatusFilters] = useState({ "Phiếu tạm": false, "Đã cân bằng kho": true, "Đã hủy": false });
  const [timeFilter, setTimeFilter] = useState("Tháng này");

  // BỘ LỌC & STATE CHO MÀN HÌNH "KIỂM KHO"
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [actualInventory, setActualInventory] = useState({}); // Lưu số lượng thực tế user nhập

  // =========================================================================
  // 4. CÁC HÀM XỬ LÝ LOGIC
  // =========================================================================

  const handleStatusChange = (status) => setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));

  // ---- MỞ MÀN HÌNH KIỂM KHO ----
  const handleStartChecking = () => {
    // Khởi tạo tồn kho thực tế = tồn kho hệ thống ban đầu
    const initialActual = {};
    products.forEach(p => {
      initialActual[p.id] = p.systemQty;
    });
    setActualInventory(initialActual);
    setViewMode("CHECKING");
  };

  // ---- NHẬP TỒN KHO THỰC TẾ ----
  const handleActualInventoryChange = (id, value) => {
    setActualInventory(prev => ({ ...prev, [id]: value }));
  };

  // ---- LƯU PHIẾU KIỂM KHO MỚI ----
  const handleSaveCheck = () => {
    let incDiff = 0;
    let decDiff = 0;
    const itemsChecked = [];

    // Tính toán chênh lệch
    products.forEach(p => {
      const actual = Number(actualInventory[p.id]);
      const system = Number(p.systemQty);
      const diff = actual - system;

      if (diff !== 0) {
        if (diff > 0) incDiff += diff;
        if (diff < 0) decDiff += Math.abs(diff);
        
        itemsChecked.push({
          id: p.id,
          name: p.name,
          systemQty: system,
          actualQty: actual,
          diff: diff
        });
      }
    });

    const totalDiff = incDiff - decDiff; // Hoặc Math.abs(incDiff) + Math.abs(decDiff) tùy nghiệp vụ

    // Sinh thời gian thực
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newSlip = {
      id: `PKK${String(inventorySlips.length + 1).padStart(6, '0')}`,
      createdDate: formattedDate,
      totalDiff,
      incDiff,
      decDiff,
      note: "Phiếu kiểm kho mới tạo.",
      status: "Đã cân bằng kho",
      employee: "Admin", // Lấy từ tài khoản đăng nhập
      items: itemsChecked
    };

    setInventorySlips([newSlip, ...inventorySlips]);
    setViewMode("LIST");
  };

  // ---- HỦY PHIẾU (TRONG CHI TIẾT) ----
  const handleCancelSlip = (slipId) => {
    if(window.confirm("Bạn có chắc chắn muốn hủy phiếu kiểm kho này?")) {
      setInventorySlips(inventorySlips.map(s => s.id === slipId ? { ...s, status: "Đã hủy" } : s));
      setSelectedSlip(null);
    }
  };

  // Lọc sản phẩm trong lúc Kiểm kho
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.id.toLowerCase().includes(productSearchQuery.toLowerCase()));

  // Lọc phiếu kiểm kho
  const filteredSlips = inventorySlips.filter(s => s.id.toLowerCase().includes(slipSearchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900 pb-24 relative">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* ========================================================================================= */}
        {/* SIDEBAR TÙY BIẾN THEO CHẾ ĐỘ (LIST HOẶC CHECKING) */}
        {/* ========================================================================================= */}
        <aside className="col-span-3 space-y-4">
          {viewMode === "LIST" ? (
            // SIDEBAR: TÌM KIẾM & LỌC PHIẾU KIỂM KHO
            <>
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <h3 className="font-bold mb-2 text-gray-800 text-[15px]">Tìm kiếm</h3>
                <input type="text" placeholder="Theo mã phiếu..." value={slipSearchQuery} onChange={(e) => setSlipSearchQuery(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-[15px]">Trạng thái</h3>
                  <img src={Icons.ArrowDown} alt="Collapse" className={`cursor-pointer transition-transform w-4 h-4 opacity-60 ${isStatusExpanded ? "rotate-180" : ""}`} onClick={() => setIsStatusExpanded(!isStatusExpanded)} />
                </div>
                {isStatusExpanded && (
                  <div className="space-y-2 text-[14px] text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={statusFilters["Phiếu tạm"]} onChange={() => handleStatusChange("Phiếu tạm")} className="w-4 h-4 cursor-pointer" /> Phiếu tạm</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={statusFilters["Đã cân bằng kho"]} onChange={() => handleStatusChange("Đã cân bằng kho")} className="w-4 h-4 cursor-pointer" /> Đã cân bằng kho</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={statusFilters["Đã hủy"]} onChange={() => handleStatusChange("Đã hủy")} className="w-4 h-4 cursor-pointer" /> Đã hủy</label>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <h3 className="font-bold mb-3 text-gray-800 text-[15px]">Thời gian</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="timeFilter" checked={timeFilter === "Tháng này"} onChange={() => setTimeFilter("Tháng này")} className="w-4 h-4 cursor-pointer text-blue-600" />
                    <select className={`border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none w-full max-w-[150px] ${timeFilter !== "Tháng này" && "opacity-50"}`} disabled={timeFilter !== "Tháng này"}><option>Tháng này</option><option>Tháng trước</option></select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="timeFilter" checked={timeFilter === "Lựa chọn khác"} onChange={() => setTimeFilter("Lựa chọn khác")} className="w-4 h-4 cursor-pointer" />
                    <input type="text" placeholder="Lựa chọn khác" disabled={timeFilter !== "Lựa chọn khác"} className={`border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none w-full max-w-[150px] ${timeFilter !== "Lựa chọn khác" && "opacity-50 bg-gray-50"}`} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // SIDEBAR: BỘ LỌC HÀNG HÓA KHI ĐANG KIỂM KHO
            <>
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <h3 className="font-bold mb-2 text-gray-800 text-[15px]">Tìm kiếm hàng hóa</h3>
                <div className="relative">
                  <input type="text" placeholder="Theo mã, tên hàng" value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-[15px]">Nhóm hàng</h3>
                  <img src={Icons.ArrowDown} alt="Collapse" className={`cursor-pointer transition-transform w-4 h-4 opacity-60 ${isCategoryExpanded ? "rotate-180" : ""}`} onClick={() => setIsCategoryExpanded(!isCategoryExpanded)} />
                </div>
                {isCategoryExpanded && (
                  <ul className="text-[14px] space-y-2 text-gray-600">
                    <li className="font-bold text-gray-900 cursor-pointer">Tất cả</li>
                    <li className="hover:text-gray-800 cursor-pointer">ĐỒ ĂN</li>
                    <li className="hover:text-gray-800 cursor-pointer">ĐỒ UỐNG</li>
                  </ul>
                )}
              </div>
            </>
          )}
        </aside>

        {/* ========================================================================================= */}
        {/* NỘI DUNG CHÍNH */}
        {/* ========================================================================================= */}
        <section className="col-span-9">
          
          {viewMode === "LIST" ? (
            // ---- MÀN HÌNH 1: DANH SÁCH PHIẾU ----
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Danh sách phiếu kiểm kho</h2>
                <button onClick={handleStartChecking} className="flex items-center justify-center gap-1 bg-[#10B981] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 shadow-sm transition-colors cursor-pointer">
                  <img src={Icons.Add} alt="Add" className="w-4 h-4 brightness-0 invert" />
                  <span>Kiểm kho</span>
                </button>
              </div>

              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead className="bg-[#A4C4F0] text-gray-800 font-semibold border-b border-gray-300">
                    <tr>
                      <th className="p-3 w-10 text-center border-b border-[#A4C4F0]"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></th>
                      <th className="p-3 border-b border-[#A4C4F0] whitespace-nowrap">Mã kiểm kho</th>
                      <th className="p-3 border-b border-[#A4C4F0] whitespace-nowrap text-center">Ngày lập phiếu</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-right whitespace-nowrap">Tổng lệch</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-right whitespace-nowrap">Lệch tăng</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-right whitespace-nowrap">Lệch giảm</th>
                      <th className="p-3 border-b border-[#A4C4F0]">Ghi chú</th>
                      <th className="p-3 border-b border-[#A4C4F0] whitespace-nowrap">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlips.map((slip, index) => (
                      <tr 
                        key={slip.id} 
                        onClick={() => setSelectedSlip(slip)}
                        className={`cursor-pointer border-b border-gray-200 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-[#FBFBFC]"}`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="w-4 h-4 cursor-pointer" /></td>
                        <td className="p-3 font-medium text-blue-600">{slip.id}</td>
                        <td className="p-3 text-gray-800 text-center">{slip.createdDate}</td>
                        <td className="p-3 text-gray-800 text-right">{slip.totalDiff}</td>
                        <td className="p-3 text-green-600 font-bold text-right">{slip.incDiff}</td>
                        <td className="p-3 text-red-500 font-bold text-right">{slip.decDiff}</td>
                        <td className="p-3 text-gray-600 max-w-[180px] truncate" title={slip.note}>{slip.note}</td>
                        <td className={`p-3 font-bold ${slip.status === "Đã hủy" ? "text-red-500" : "text-green-600"}`}>{slip.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // ---- MÀN HÌNH 2: TIẾN HÀNH KIỂM KHO (CHỌN MÓN VÀ NHẬP SỐ) ----
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Tiến hành kiểm kho</h2>
              </div>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mb-10">
                <table className="w-full text-left text-[14px] border-collapse">
                  <thead className="bg-[#A4C4F0] text-gray-800 font-semibold border-b border-gray-300">
                    <tr>
                      <th className="p-3 border-b border-[#A4C4F0] w-32">Mã hàng</th>
                      <th className="p-3 border-b border-[#A4C4F0]">Tên hàng</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-center">Loại hàng</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-center">Nhóm hàng</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-right">Tồn hệ thống</th>
                      <th className="p-3 border-b border-[#A4C4F0] text-right w-40">Tồn kho thực tế</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => {
                      const sysQty = p.systemQty;
                      const actQty = actualInventory[p.id] !== undefined ? actualInventory[p.id] : sysQty;
                      const diff = actQty - sysQty;
                      
                      return (
                        <tr key={p.id} className={`border-b border-gray-200 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-[#FBFBFC]"}`}>
                          <td className="p-3 text-gray-800 font-medium">{p.id}</td>
                          <td className="p-3 text-gray-800">{p.name}</td>
                          <td className="p-3 text-gray-600 text-center">{p.type}</td>
                          <td className="p-3 text-gray-600 text-center">{p.category}</td>
                          <td className="p-3 text-gray-800 text-right font-bold">{sysQty}</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {diff !== 0 && (
                                <span className={`text-xs font-bold ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                              <input
                                type="number"
                                value={actQty}
                                onChange={(e) => handleActualInventoryChange(p.id, e.target.value)}
                                className="w-full max-w-[90px] border border-gray-300 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-600"
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* THANH ĐIỀU KHIỂN CỐ ĐỊNH KHI KIỂM KHO */}
              <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
                <div className="max-w-[1440px] mx-auto flex justify-end gap-3 pr-6">
                    <button onClick={() => setViewMode("LIST")} className="bg-white border border-gray-300 text-gray-700 rounded px-8 py-2.5 text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button onClick={handleSaveCheck} className="bg-[#2563EB] text-white rounded px-8 py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                        Xác nhận & Lưu
                    </button>
                </div>
              </div>
            </>
          )}

        </section>
      </main>

      {/* ========================================================================================= */}
      {/* MODAL: CHI TIẾT PHIẾU KIỂM KHO (CHỈ XEM, DO BẠN YÊU CẦU TỰ THIẾT KẾ) */}
      {/* ========================================================================================= */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#F8F9FB]">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết phiếu kiểm kho: <span className="text-blue-600">{selectedSlip.id}</span></h2>
              <button onClick={() => setSelectedSlip(null)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Thông tin chung (Grid) */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50 p-4 rounded border border-gray-100 text-[14px]">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Ngày lập phiếu:</span>
                  <span className="font-semibold text-gray-800">{selectedSlip.createdDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Nhân viên:</span>
                  <span className="font-semibold text-gray-800">{selectedSlip.employee}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`font-bold ${selectedSlip.status === "Đã hủy" ? "text-red-500" : "text-green-600"}`}>{selectedSlip.status}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Tổng chênh lệch:</span>
                  <span className="font-semibold text-gray-800">{selectedSlip.totalDiff}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Lệch tăng:</span>
                  <span className="font-bold text-green-600">+{selectedSlip.incDiff}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Lệch giảm:</span>
                  <span className="font-bold text-red-500">-{selectedSlip.decDiff}</span>
                </div>
                <div className="col-span-2 pt-2">
                  <span className="text-gray-500 block mb-1">Ghi chú:</span>
                  <p className="text-gray-800 italic bg-white p-2 rounded border border-gray-200">{selectedSlip.note || "Không có ghi chú"}</p>
                </div>
              </div>

              {/* Bảng các mặt hàng được cân bằng */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-2">Mặt hàng được cân bằng</h3>
                {selectedSlip.items && selectedSlip.items.length > 0 ? (
                  <table className="w-full text-left text-[13px] border-collapse border border-gray-200">
                    <thead className="bg-[#E8EBF3] text-gray-700">
                      <tr>
                        <th className="p-2 border border-gray-200">Mã hàng</th>
                        <th className="p-2 border border-gray-200">Tên hàng</th>
                        <th className="p-2 border border-gray-200 text-right">Hệ thống</th>
                        <th className="p-2 border border-gray-200 text-right">Thực tế</th>
                        <th className="p-2 border border-gray-200 text-right">Lệch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSlip.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-2 border border-gray-200 font-medium text-blue-600">{item.id}</td>
                          <td className="p-2 border border-gray-200 text-gray-800">{item.name}</td>
                          <td className="p-2 border border-gray-200 text-right">{item.systemQty}</td>
                          <td className="p-2 border border-gray-200 text-right font-bold">{item.actualQty}</td>
                          <td className={`p-2 border border-gray-200 text-right font-bold ${item.diff > 0 ? "text-green-600" : "text-red-500"}`}>
                            {item.diff > 0 ? `+${item.diff}` : item.diff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 italic">Phiếu này không ghi nhận mặt hàng nào bị lệch.</p>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
              <button 
                onClick={() => handleCancelSlip(selectedSlip.id)} 
                disabled={selectedSlip.status === "Đã hủy"}
                className={`px-5 py-2 text-sm font-bold rounded transition-colors ${selectedSlip.status === "Đã hủy" ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white"}`}
              >
                Hủy phiếu
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => setSelectedSlip(null)} className="px-5 py-2 text-sm font-bold bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100">Đóng</button>
                <button onClick={() => alert("Chức năng xuất file đang được phát triển")} className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Xuất file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckInventory;