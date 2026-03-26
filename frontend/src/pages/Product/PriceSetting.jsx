import React, { useState } from "react";
import * as Icons from "../../assets/icons/index";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function PriceSetting() {
  // =========================================================================
  // 1. STATE DỮ LIỆU (Mock Data bám sát ảnh)
  // =========================================================================
  const [categories] = useState([
    "Tất cả",
    "ĐỒ ĂN",
    "ĐỒ UỐNG",
    "THUỐC LÁ",
    "LOẠI BÀN",
    "DỊCH VỤ"
  ]);

  const [products, setProducts] = useState([
    { id: "SP000012", name: "Snack tôm cay (Lớn)", category: "ĐỒ ĂN", listedPrice: 9000, lastImportPrice: 8000, sellPrice: 15000 },
    { id: "SP000013", name: "Snack khoai tây (Lớn)", category: "ĐỒ ĂN", listedPrice: 9000, lastImportPrice: 8000, sellPrice: 15000 },
    { id: "SP000014", name: "Cơm bò lúc lắc", category: "ĐỒ ĂN", listedPrice: 0, lastImportPrice: 0, sellPrice: 27000 },
    { id: "SP000015", name: "Mì xào", category: "ĐỒ ĂN", listedPrice: 0, lastImportPrice: 0, sellPrice: 20000 },
    { id: "SP000016", name: "Sting", category: "ĐỒ UỐNG", listedPrice: 10000, lastImportPrice: 9000, sellPrice: 20000 },
    { id: "SP000017", name: "Pepsi", category: "ĐỒ UỐNG", listedPrice: 10000, lastImportPrice: 9000, sellPrice: 20000 },
    { id: "SP000018", name: "RedBull", category: "ĐỒ UỐNG", listedPrice: 15000, lastImportPrice: 14000, sellPrice: 25000 },
    { id: "SP000019", name: "Bàn lỗ", category: "LOẠI BÀN", listedPrice: 0, lastImportPrice: 0, sellPrice: 55000 },
    { id: "SP000020", name: "Bàn phẳng", category: "LOẠI BÀN", listedPrice: 0, lastImportPrice: 0, sellPrice: 40000 },
    { id: "SP000021", name: "Bàn VIP", category: "LOẠI BÀN", listedPrice: 0, lastImportPrice: 0, sellPrice: 50000 },
    { id: "SP000022", name: "Thuốc Sài Gòn Bạc", category: "THUỐC LÁ", listedPrice: 11000, lastImportPrice: 10000, sellPrice: 20000 },
    { id: "SP000023", name: "Thuốc JET", category: "THUỐC LÁ", listedPrice: 15000, lastImportPrice: 14000, sellPrice: 30000 },
    { id: "SP000024", name: "Ngọc Mỹ", category: "DỊCH VỤ", listedPrice: 600000, lastImportPrice: 600000, sellPrice: 900000 },
    { id: "SP000025", name: "Rhino Carbon RC2025", category: "DỊCH VỤ", listedPrice: 1700000, lastImportPrice: 1700000, sellPrice: 2100000 },
    { id: "SP000026", name: "Allin Crazy Composite", category: "DỊCH VỤ", listedPrice: 1500000, lastImportPrice: 1500000, sellPrice: 2000000 },
  ]);

  // =========================================================================
  // 2. STATE GIAO DIỆN & BỘ LỌC
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  // Xử lý cập nhật giá bán trực tiếp trên ô Input
  const handlePriceChange = (id, newPrice) => {
    // Chỉ cho phép nhập số
    const numericPrice = newPrice.replace(/[^0-9]/g, '');
    setProducts(products.map(p => p.id === id ? { ...p, sellPrice: numericPrice } : p));
  };

  // Lọc dữ liệu
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900 pb-20">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* ========================================================= */}
        {/* SIDEBAR BÊN TRÁI */}
        {/* ========================================================= */}
        <aside className="col-span-3 space-y-4">
          
          {/* Box 1: Bảng giá */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-2 text-gray-800 text-[15px]">Bảng giá</h3>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
              <option value="chung">Bảng giá chung</option>
            </select>
          </div>

          {/* Box 2: Tìm kiếm */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-2 text-gray-800 text-[15px]">Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Theo mã, tên hàng"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Box 3: Nhóm hàng */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-[15px]">Nhóm hàng</h3>
              <img
                src={Icons.ArrowDown} // Dùng icon mũi tên quay lên (theo ảnh của bạn)
                alt="Collapse"
                className={`cursor-pointer transition-transform w-4 h-4 opacity-60 ${isCategoryExpanded ? "rotate-180" : ""}`}
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              />
            </div>
            
            {isCategoryExpanded && (
              <>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src={Icons.Search} alt="Tìm kiếm" className="h-4 w-4 opacity-40 grayscale" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhóm hàng"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <ul className="text-[14px] space-y-2 text-gray-600">
                  {categories.filter(c => c.toLowerCase().includes(categorySearchQuery.toLowerCase())).map(cat => (
                    <li 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer uppercase ${selectedCategory === cat ? "font-bold text-gray-900" : "hover:text-gray-800"}`}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </aside>

        {/* ========================================================= */}
        {/* NỘI DUNG CHÍNH (BẢNG GIÁ) */}
        {/* ========================================================= */}
        <section className="col-span-9">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Bảng giá chung</h2>
          </div>

          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-[14px] border-collapse">
              {/* Header bảng màu xanh nhạt theo đúng thiết kế */}
              <thead className="bg-[#A4C4F0] text-gray-800 font-semibold border-b border-gray-300">
                <tr>
                  <th className="p-3 w-32 border-b border-[#A4C4F0]">Mã hàng</th>
                  <th className="p-3 border-b border-[#A4C4F0]">Tên hàng</th>
                  <th className="p-3 text-right w-36 border-b border-[#A4C4F0]">Giá niêm yết</th>
                  <th className="p-3 text-right w-36 border-b border-[#A4C4F0]">Giá nhập cuối</th>
                  <th className="p-3 text-right w-40 border-b border-[#A4C4F0]">Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, index) => (
                  <tr 
                    key={p.id} 
                    // Sọc ngựa vằn (Trắng / Xám rất nhạt)
                    className={`border-b border-gray-200 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-[#FBFBFC]"}`}
                  >
                    <td className="p-3 text-gray-800">{p.id}</td>
                    <td className="p-3 text-gray-800">{p.name}</td>
                    
                    {/* Giá niêm yết */}
                    <td className="p-3 text-right text-gray-800">
                      {Number(p.listedPrice).toLocaleString()}
                    </td>
                    
                    {/* Giá nhập cuối */}
                    <td className="p-3 text-right text-gray-800">
                      {Number(p.lastImportPrice).toLocaleString()}
                    </td>
                    
                    {/* Ô nhập Giá bán */}
                    <td className="p-2 text-right">
                      <input
                        type="text" // Dùng text để format dấu phẩy, dùng number để lấy số liệu chuẩn
                        value={Number(p.sellPrice).toLocaleString()}
                        onChange={(e) => handlePriceChange(p.id, e.target.value)}
                        className="w-full max-w-[120px] ml-auto border border-gray-300 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Không tìm thấy hàng hóa nào phù hợp.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PriceSetting;