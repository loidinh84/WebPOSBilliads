import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import * as Icons from "../assets/icons/index";

function Kitchen() {
  const [pendingItems, setPendingItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. HÀM LẤY DỮ LIỆU
  const fetchKitchenData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/kitchen", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const allItems = res.data.data;
        // Chia làm 2 mảng: Chờ chế biến và Đã xong
        setPendingItems(
          allItems.filter((i) => i.TRANGTHAI_BEP === "Chờ chế biến"),
        );
        setCompletedItems(
          allItems.filter((i) => i.TRANGTHAI_BEP === "Đã xong"),
        );
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu bếp:", error);
    }
  };

  // 2. CHẠY REAL-TIME
  useEffect(() => {
    fetchKitchenData();
    const interval = setInterval(() => {
      fetchKitchenData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 3. HÀM GOM NHÓM MÓN THEO BÀN
  const groupItemsByTable = (items) => {
    const grouped = {};
    items.forEach((item) => {
      if (
        searchQuery &&
        !item.TENHANGHOA.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.TENBAN.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return;
      }

      if (!grouped[item.MABAN]) {
        grouped[item.MABAN] = {
          maban: item.MABAN,
          tenban: item.TENBAN,
          giobatdau: item.GIOBATDAU,
          items: [],
        };
      }
      grouped[item.MABAN].items.push(item);
    });
    return Object.values(grouped);
  };

  const updateItemStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/kitchen/item/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Gọi lại API để làm mới giao diện ngay lập tức
      fetchKitchenData();
    } catch (error) {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái món!", "error");
    }
  };

  const pendingGroups = groupItemsByTable(pendingItems);
  const completedGroups = groupItemsByTable(completedItems);

  const TableCard = ({ group, isCompletedCol }) => (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-4 animate-fade-in break-inside-avoid">
      {/* Header Thẻ */}
      <div
        className={`p-3 flex justify-between items-center text-white ${isCompletedCol ? "bg-green-600" : "bg-orange-500"}`}
      >
        <span className="font-bold text-[16px]">{group.tenban}</span>
        <div className="text-[11px] font-medium bg-black/20 px-2 py-1 rounded">
          <i className="fa-regular fa-clock mr-1"></i>
          {group.giobatdau ? group.giobatdau.substring(11, 16) : "--:--"}
        </div>
      </div>

      {/* Danh sách món */}
      <div className="p-2">
        {group.items.map((item, index) => (
          <div
            key={item.MACHITETHOADON}
            className={`flex items-center justify-between p-2 rounded-lg mb-1 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 font-bold rounded text-xs">
                {item.SOLUONG}
              </span>
              <span className="font-bold text-gray-800 text-[14px]">
                {item.TENHANGHOA}
              </span>
            </div>

            {/* Nút thao tác */}
            {!isCompletedCol ? (
              <button
                onClick={() => updateItemStatus(item.MACHITETHOADON, "Đã xong")}
                className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs border border-blue-200"
              >
                Xong
              </button>
            ) : (
              <button
                onClick={() => updateItemStatus(item.MACHITETHOADON, "Đã giao")}
                className="bg-gray-100 hover:bg-gray-600 hover:text-white text-gray-700 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs border border-gray-300"
              >
                Đã giao
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
              Chờ chế biến ({pendingItems.length})
            </div>
            {/* Search Box (Viền mờ trên nền xanh) */}
            <div className="relative mb-2 mr-4">
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn, tên món..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-full pl-10 pr-4 py-2 text-[14px] outline-none focus:bg-white/20 focus:border-white/50 w-[400px] transition-all placeholder-white/50 backdrop-blur-md shadow-sm"
              />
              <img
                src={Icons.Search}
                alt="search"
                className="w-6 h-6 absolute right-3 top-1/2 -translate-y-1/2 filter brightness-0 invert opacity-60"
              />
            </div>
          </div>

          {/* Bảng Nội Dung */}
          <div className="bg-white flex-1 rounded-b-lg rounded-tr-lg flex flex-col items-center justify-center shadow-md overflow-y-auto">
            {pendingItems.length === 0 ? (
              <div className="flex flex-col items-center text-gray-400">
                <img
                  src={Icons.Dinner}
                  alt="empty"
                  className="w-15 h-15 object-contain brightness-200 invert"
                />
                <p className="font-medium text-[14px]">
                  Chưa có đơn hàng cần chế biến
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                {pendingGroups.map((group) => (
                  <TableCard
                    key={group.maban}
                    group={group}
                    isCompletedCol={false}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- CỘT PHẢI: ĐÃ XONG / CHỜ CUNG ỨNG --- */}
        <section className="flex-1 flex flex-col">
          {/* Header Tab (Căn phải) */}
          <div className="flex justify-end items-end">
            <div className="bg-white text-blue-600 font-bold text-xl px-6 py-2 rounded-t-lg inline-block w-max shadow-sm">
              Đã xong / Chờ cung ứng ({completedItems.length})
            </div>
          </div>

          {/* Bảng Nội Dung */}
          <div className="bg-white flex-1 rounded-b-lg rounded-tl-lg flex flex-col items-center justify-center shadow-md overflow-y-auto">
            {completedItems.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <img
                  src={Icons.Dinner}
                  alt="empty"
                  className="w-15 h-15 object-contain brightness-200 invert"
                />
                <p className="font-medium text-[14px]">
                  Chưa có đơn hàng cần cung ứng
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                {completedGroups.map((group) => (
                  <TableCard
                    key={group.maban}
                    group={group}
                    isCompletedCol={true}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Kitchen;
