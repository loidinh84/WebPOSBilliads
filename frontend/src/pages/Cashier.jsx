import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import * as Icons from "../assets/icons/index";

function Cashier() {
  const [leftTab, setLeftTab] = useState('tables'); 
  
  const [tables, setTables] = useState([
    { id: 1, name: "Bàn 1", status: "occupied" },
    { id: 2, name: "Bàn 2", status: "empty" },
    { id: 3, name: "Bàn 3", status: "empty" },
    { id: 4, name: "Bàn 4", status: "empty" },
    { id: 5, name: "Bàn 5", status: "empty" },
    { id: 6, name: "Bàn 6", status: "empty" },
    { id: 7, name: "Bàn 7", status: "empty" },
    { id: 8, name: "Bàn 8", status: "empty" },
    { id: 9, name: "Bàn 9", status: "empty" },
    { id: 10, name: "Bàn 10", status: "occupied" },
    { id: 11, name: "Bàn 11", status: "empty" },
    { id: 12, name: "Bàn 12", status: "empty" },
    { id: 13, name: "Bàn 13", status: "empty" },
  ]);

  const menuCategories = ["Tất cả", "Thức ăn", "Đồ uống", "Thuốc lá", "Dịch vụ"];
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const menuItems = [
    { id: 101, name: "Mì trứng", price: 25000, category: "Thức ăn", image: "" },
    { id: 102, name: "Cơm gà", price: 35000, category: "Thức ăn", image: "" },
    { id: 103, name: "Bò húc", price: 15000, category: "Đồ uống", image: "" },
    { id: 104, name: "Sting dâu", price: 12000, category: "Đồ uống", image: "" },
    { id: 105, name: "555 Anh", price: 35000, category: "Thuốc lá", image: "" },
    { id: 106, name: "Marlboro", price: 30000, category: "Thuốc lá", image: "" },
    { id: 107, name: "Trà đá", price: 5000, category: "Đồ uống", image: "" },
    { id: 108, name: "Bàn lỗ (Giờ)", price: 55000, category: "Dịch vụ", image: "" },
  ];

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const handleTableClick = (table) => {
    const isAlreadyOpen = openTabs.find(t => t.id === table.id);
    if (!isAlreadyOpen) {
      setOpenTabs([...openTabs, { id: table.id, name: table.name }]);
    }
    setActiveTabId(table.id);
  };

  const handleCloseTab = (e, tableId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t.id !== tableId);
    setOpenTabs(newTabs);
    if (activeTabId === tableId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const [ordersByTable, setOrdersByTable] = useState({
    1: [
      { id: 101, name: "Mì trứng", qty: 2, price: 25000 },
      { id: 102, name: "Cơm gà", qty: 1, price: 35000 },
    ],
    10: [
      { id: 108, name: "Bàn lỗ (Giờ)", qty: 1, price: 55000 },
      { id: 103, name: "Bò húc", qty: 2, price: 15000 },
    ]
  });

  const currentOrderItems = ordersByTable[activeTabId] || [];

  const handleDeleteItem = (itemId) => {
    setOrdersByTable(prev => ({
      ...prev,
      [activeTabId]: prev[activeTabId].filter(item => item.id !== itemId)
    }));
  };

  const updateQuantity = (itemId, delta) => {
    setOrdersByTable(prev => ({
      ...prev,
      [activeTabId]: prev[activeTabId].map(item => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    }));
  };

  const handleAddItemToBill = (item) => {
    if (!activeTabId) {
      alert("Vui lòng chọn bàn ở tab 'Phòng bàn' trước khi gọi món!");
      return;
    }

    setOrdersByTable(prev => {
      const currentOrders = prev[activeTabId] || [];
      const existingItem = currentOrders.find(i => i.id === item.id);
      
      if (existingItem) {
        return { ...prev, [activeTabId]: currentOrders.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
      } else {
        return { ...prev, [activeTabId]: [...currentOrders, { ...item, qty: 1 }] };
      }
    });

    setTables(tables.map(t => t.id === activeTabId ? { ...t, status: 'occupied' } : t));
  };

  const calculateTotal = () => {
    return currentOrderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const isTableEmpty = currentOrderItems.length === 0;

  const filteredMenuItems = activeCategory === "Tất cả" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="h-screen flex flex-col font-sans text-[13px] bg-[#e9ecf4] overflow-hidden">
      
      {/* ---------------- HEADER ---------------- */}
      <header className="h-12 bg-[#2a3f85] flex justify-between items-center px-4 shrink-0 text-white shadow-sm z-10">
        <div className="flex items-center gap-3">
           <img src={Logo} alt="logo" className="w-12 h-12 object-contain shrink-0" />
           <span className="font-bold text-[18px] uppercase tracking-wide">Billiards Lục Lợi</span>
        </div>
        <div className="flex items-center">
          <span className="cursor-pointer hover:text-gray-200 flex items-center gap-2 font-medium bg-[#1e2d61] px-4 py-1.5 rounded-full transition-colors">
            <img src={Icons.User} alt="user" className="w-5 h-5 filter brightness-0 invert" />
            [Tên Tài Khoản]
          </span>
        </div>
      </header>

      {/* ---------------- MAIN WORKSPACE ---------------- */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* --- CỘT TRÁI: ĐỘNG (PHÒNG BÀN / THỰC ĐƠN) --- */}
        <section className="flex-[5.5] flex flex-col h-full border-r border-gray-300 bg-white">
          
          {/* SỬA LẠI Ở ĐÂY: Thêm thanh Search theo hình */}
          <div className="flex justify-between items-end bg-[#0066ff] px-2 pt-2 shrink-0">
            <div className="flex gap-1">
              <button 
                onClick={() => setLeftTab('tables')}
                className={`font-bold px-6 py-2 rounded-t-lg transition-colors cursor-pointer ${leftTab === 'tables' ? 'bg-white text-[#0066ff]' : 'text-white hover:bg-blue-600'}`}
              >
                Phòng bàn
              </button>
              <button 
                onClick={() => setLeftTab('menu')}
                className={`font-bold px-6 py-2 rounded-t-lg transition-colors cursor-pointer ${leftTab === 'menu' ? 'bg-white text-[#0066ff]' : 'text-white hover:bg-blue-600'}`}
              >
                Thực đơn
              </button>
            </div>

            {/* THANH SEARCH */}
            <div className="relative mb-1.5 mr-2">
              <input 
                type="text" 
                className="bg-transparent border border-white/50 text-white rounded pr-8 pl-3 py-1 text-xs outline-none focus:border-white w-[250px] transition-colors placeholder-white/60"
              />
              <img 
                src={Icons.Search} 
                alt="search" 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 filter brightness-0 invert opacity-80" 
              />
            </div>
          </div>

          <div className="p-4 flex flex-col h-full bg-[#f4f6f8]">
            
            {leftTab === 'tables' ? (
              
              /* ====== CHẾ ĐỘ 1: PHÒNG BÀN ====== */
              <>
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors hover:bg-blue-700">Tất cả (16)</button>
                    <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors">Đang sử dụng (3)</button>
                    <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors">Còn trống (13)</button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                    Mở thực đơn khi chọn bàn
                  </label>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                  <div className="grid grid-cols-4 gap-6">
                    {tables.map(table => {
                      const isSelected = table.id === activeTabId;
                      const isOccupied = table.status === 'occupied';
                      let bgClass = "bg-white text-black border-gray-400"; 
                      if (isSelected) bgClass = "bg-[#0066ff] text-white border-blue-700 shadow-blue-500/50";
                      else if (isOccupied) bgClass = "bg-[#4dabf7] text-black border-blue-400";

                      return (
                        <div 
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`relative w-full aspect-[4/3] rounded-3xl flex items-center justify-center font-bold text-[15px] cursor-pointer shadow-sm border-2 transition-all hover:scale-105 ${bgClass}`}
                        >
                          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-1 h-1/2 border-l-2 border-dashed border-gray-400"></div>
                          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-1 h-1/2 border-r-2 border-dashed border-gray-400"></div>
                          {table.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (

              /* ====== CHẾ ĐỘ 2: THỰC ĐƠN ====== */
              <div className="flex flex-col h-full">
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 shrink-0 pb-2 border-b border-gray-200">
                  {menuCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-colors border shadow-sm cursor-pointer
                        ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                  
                  <div className="ml-auto flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 shadow-sm">
                    <img src={Icons.Search} alt="search" className="w-3 h-3 opacity-50" />
                    <input type="text" placeholder="Tìm tên món..." className="ml-2 outline-none text-xs w-[120px]" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredMenuItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleAddItemToBill(item)}
                        className="bg-white rounded-xl p-2 flex flex-col items-center cursor-pointer shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all active:scale-95 group"
                      >
                        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs overflow-hidden relative">
                          {item.image ? (
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                             <span className="opacity-50">Chưa có ảnh</span>
                          )}
                          <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">+</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800 text-center w-full truncate mb-1">{item.name}</span>
                        <span className="text-blue-600 font-bold">{item.price.toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- CỘT PHẢI: BILL THANH TOÁN --- */}
        <section className="flex-[4.5] bg-white flex flex-col h-full border-l-4 border-[#2a3f85]">
          
          {openTabs.length === 0 ? (
            <div className="flex-1 bg-[#f4f6f8] flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 mb-4 opacity-30">
                <img src={Icons.Search} alt="empty" className="w-full h-full filter grayscale" />
              </div>
              <p className="text-base font-medium">Vui lòng chọn bàn để xem chi tiết</p>
            </div>
          ) : (
            <>
              <div className="flex items-end bg-[#0066ff] pt-2 px-2 shrink-0 overflow-x-auto no-scrollbar gap-1">
                {openTabs.map(tab => {
                  const isActive = activeTabId === tab.id;
                  return (
                    <div 
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`group flex items-center justify-between px-4 py-2 rounded-t-lg cursor-pointer min-w-[100px] max-w-[150px] transition-colors
                        ${isActive ? 'bg-white text-[#0066ff] font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'bg-[#2a3f85] text-white hover:bg-blue-600'}
                      `}
                    >
                      <span className="truncate text-[13px]">{tab.name}</span>
                      <button 
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className={`ml-2 w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold transition-opacity
                          ${isActive ? 'text-gray-400 hover:bg-red-100 hover:text-red-500' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white'}
                        `}
                      >✕</button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 p-3 bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
                <button className="flex items-center gap-1 bg-[#ffc107] hover:bg-yellow-500 text-black font-bold px-3 py-1.5 rounded text-xs shadow-sm cursor-pointer transition-colors">
                  <img src={Icons.Discount} alt="discount" className="w-3 h-3" /> Giảm giá
                </button>
                <button className="flex items-center gap-1 bg-[#ff6b6b] hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded text-xs shadow-sm cursor-pointer transition-colors">
                  <img src={Icons.Delete} alt="cancel" className="w-3 h-3 filter brightness-0 invert" /> Hủy bàn
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="border-b-2 border-gray-300">
                      <th className="p-3 font-bold text-gray-800">Tên món</th>
                      <th className="p-3 font-bold text-gray-800 text-center w-24">Số lượng</th>
                      <th className="p-3 font-bold text-gray-800 text-right">Đơn giá</th>
                      <th className="p-3 font-bold text-gray-800 text-right pr-8">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrderItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className="group border-b border-gray-200 cursor-pointer transition-colors hover:bg-[#d6e4ff]"
                      >
                        <td className="p-3 text-black font-medium">{item.name}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-600 font-bold cursor-pointer">-</button>
                            <span className="w-4 text-center">{item.qty}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-600 font-bold cursor-pointer">+</button>
                          </div>
                        </td>
                        <td className="p-3 text-right text-gray-600">{item.price.toLocaleString()}đ</td>
                        <td className="p-3 text-right font-bold text-black relative pr-8">
                          {(item.price * item.qty).toLocaleString()}đ
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded cursor-pointer"
                            title="Xóa món"
                          >✕</button>
                        </td>
                      </tr>
                    ))}
                    {[...Array(Math.max(4, 6 - currentOrderItems.length))].map((_, i) => (
                      <tr key={`empty-${i}`} className="border-b border-gray-200 h-11"><td colSpan="4"></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-2 text-[14px]">
                <div className="flex justify-between text-gray-700">
                  <span>Giờ bắt đầu</span>
                  <span className="flex items-center gap-1">
                    <img src={Icons.Clock} alt="time" className="w-4 h-4 opacity-70" /> 
                    {isTableEmpty ? "--:--" : "6:20"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tổng giờ chơi</span>
                  <span className="font-medium">{isTableEmpty ? "--:--" : "2:13"}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tổng món</span>
                  <span className="font-medium">{currentOrderItems.reduce((acc, item) => acc + item.qty, 0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Giảm giá</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between font-bold text-[18px] text-black pt-2 border-t mt-2">
                  <span>Tổng tiền</span>
                  <span className="text-blue-600">{calculateTotal().toLocaleString()}đ</span>
                </div>
              </div>

              <div className="p-3 bg-white grid grid-cols-3 gap-2 shrink-0">
                <button className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] ${isTableEmpty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#4dabf7] hover:bg-blue-600 text-white cursor-pointer'}`}>Báo bếp</button>
                <button className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] ${isTableEmpty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#ff922b] hover:bg-orange-600 text-white cursor-pointer'}`}>Chuyển bàn</button>
                <button className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] uppercase tracking-wide ${isTableEmpty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#20c997] hover:bg-green-600 text-white cursor-pointer'}`}>Thanh Toán</button>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}

export default Cashier;