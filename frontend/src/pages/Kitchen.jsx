import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "../assets/icons/index";

function Kitchen() {
  // Quản lý state danh sách món (Hiện tại mảng rỗng để hiển thị Empty State như thiết kế)
  const [pendingItems, setPendingItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  return (
    // Dùng h-screen để giao diện nhà bếp fix cứng vừa vặn màn hình, không bị cuộn trang thừa thãi
    <div className="h-screen flex flex-col font-sans text-[13px] bg-[#1e293b]">
      

      {/* ---------------- 2. KHÔNG GIAN LÀM VIỆC CHÍNH ---------------- */}
      {/* Nền xanh đen đặc trưng của màn hình bếp (Navy/Slate) */}
      <main className="flex-1 bg-[#1a295c] p-4 flex gap-4 overflow-hidden">
        
        {/* --- CỘT TRÁI: CHỜ CHẾ BIẾN --- */}
        <section className="flex-1 flex flex-col">
          {/* Header Tab & Search */}
          <div className="flex justify-between items-end">
            {/* Tab Title */}
            <div className="bg-white text-blue-600 font-bold text-xl px-6 py-2 rounded-t-lg inline-block w-max shadow-sm">
              Chờ chế biến
            </div>
            {/* Search Box (Viền mờ trên nền xanh) */}
            <div className="relative mb-2 mr-4">
              <input 
                type="text" 
                placeholder="Tìm kiếm mã đơn, tên món..."
                className="bg-white/10 border border-white/20 text-white rounded-full pl-10 pr-4 py-2 text-[13px] outline-none focus:bg-white/20 focus:border-white/50 w-[400px] transition-all placeholder-white/50 backdrop-blur-md shadow-sm"
              />
              <img 
                src={Icons.Search} 
                alt="search" 
                className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 filter brightness-0 invert opacity-60" 
              />
            </div>
          </div>

          {/* Bảng Nội Dung */}
          <div className="bg-white flex-1 rounded-b-lg rounded-tr-lg flex flex-col items-center justify-center shadow-md overflow-y-auto">
            {pendingItems.length === 0 ? (
              // Trạng thái trống (Empty State)
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <img src={Icons.Dinner} alt="empty" className="w-full h-full object-contain filter grayscale" />
                </div>
                <p className="font-medium text-[14px]">Chưa có đơn hàng cần chế biến</p>
              </div>
            ) : (
              // Map list order ở đây sau này
              <div className="w-full h-full p-4">
                {/* Dữ liệu thực tế sẽ render ở đây */}
              </div>
            )}
          </div>  
        </section>

        {/* --- CỘT PHẢI: ĐÃ XONG / CHỜ CUNG ỨNG --- */}
        <section className="flex-1 flex flex-col">
          {/* Header Tab (Căn phải) */}
          <div className="flex justify-end items-end">
            <div className="bg-white text-blue-600 font-bold text-xl px-6 py-2 rounded-t-lg inline-block w-max shadow-sm">
              Đã xong / Chờ cung ứng
            </div>
          </div>

          {/* Bảng Nội Dung */}
          <div className="bg-white flex-1 rounded-b-lg rounded-tl-lg flex flex-col items-center justify-center shadow-md overflow-y-auto">
            {completedItems.length === 0 ? (
              // Trạng thái trống (Empty State)
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <img src={Icons.Dinner} alt="empty" className="w-full h-full object-contain filter grayscale" />
                </div>
                <p className="font-medium text-[14px]">Chưa có đơn hàng cần cung ứng</p>
              </div>
            ) : (
              // Map list order đã xong ở đây sau này
              <div className="w-full h-full p-4">
                {/* Dữ liệu thực tế sẽ render ở đây */}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default Kitchen;