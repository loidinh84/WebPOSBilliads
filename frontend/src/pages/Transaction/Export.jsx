import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function Export() {
  // --- 1. STATES QUẢN LÝ TÌM KIẾM VÀ LỌC ---
  const [searchId, setSearchId] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchUser, setSearchUser] = useState("");
  // Mặc định lọc "Hoàn thành" như code cũ của bạn
  const [filterStatuses, setFilterStatuses] = useState(["Hoàn thành"]);

  // 2. Dữ liệu mẫu (Giữ nguyên từ code của bạn)
  const [exportInvoices] = useState([
    {
      id: "XH-20231025-001",
      date: "25/10/2023 14:30",
      supplier: "Suntory Pepsico",
      total: "2,500,000",
      note: "Hàng lỗi nhà SX",
      status: "Chờ duyệt",
      user: "Tài - Kế Toán",
    },
    {
      id: "XH-20231025-002",
      date: "24/10/2023 15:40",
      supplier: "TK SAIGON",
      total: "1,300,000",
      note: "Hết hạn sử dụng",
      status: "Hoàn thành",
      user: "Lợi - Thu ngân",
    },
    {
      id: "XH-20231025-003",
      date: "21/10/2023 12:13",
      supplier: "Aramit",
      total: "8,000,000",
      note: "Hàng lỗi cơ học",
      status: "Đã hủy",
      user: "Khang - Thủ Kho",
    },
  ]);

  // --- 3. LOGIC LỌC TỔNG HỢP ---
  const filteredData = exportInvoices.filter((inv) => {
    const matchesId = inv.id.toLowerCase().includes(searchId.toLowerCase());
    const matchesItem =
      inv.supplier.toLowerCase().includes(searchItem.toLowerCase()) ||
      inv.note.toLowerCase().includes(searchItem.toLowerCase());
    const matchesUser = inv.user
      .toLowerCase()
      .includes(searchUser.toLowerCase());
    // Lọc theo mảng các trạng thái được chọn
    const matchesStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.status);

    return matchesId && matchesItem && matchesUser && matchesStatus;
  });

  // Hàm xử lý khi tích/bỏ tích checkbox trạng thái
  const toggleStatus = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return "bg-yellow-100 text-yellow-700";
      case "Hoàn thành":
        return "bg-green-100 text-green-700";
      case "Đã hủy":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-gray-800">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Giao dịch" />

      <div className="flex p-4 gap-4">
        {/* ---------------- SIDEBAR BỘ LỌC ---------------- */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          {/* Cụm Tìm kiếm */}
          <div className="bg-white p-4 rounded shadow-sm border-2 border-blue-400">
            <h3 className="font-semibold text-gray-800 mb-3 uppercase text-[12px]">
              Tìm kiếm
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Theo mã xuất hủy"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo mã, tên hàng"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo người xuất hủy"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>
          </div>

          {/* Cụm Thời gian */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Thời gian</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 text-blue-600"
                  defaultChecked
                />
                <input
                  type="text"
                  value="Toàn thời gian"
                  readOnly
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-600 cursor-default outline-none"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer relative">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Lựa chọn khác"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4">
                    <img
                      src={Icons.Calendar}
                      alt=""
                      className="w-full h-full object-contain filter brightness-0 opacity-50"
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Cụm Trạng thái (Lọc bằng Checkbox) */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
              <h3 className="font-semibold text-gray-800">Trạng thái</h3>
              <div className="w-4 h-4">
                <img
                  src={Icons.ArrowUp}
                  alt=""
                  className="w-full h-full object-contain filter brightness-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              {["Chờ duyệt", "Hoàn thành", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filterStatuses.includes(st)}
                    onChange={() => toggleStatus(st)}
                  />
                  <span className="group-hover:text-blue-600 transition-colors">
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- NỘI DUNG CHÍNH (BẢNG) ---------------- */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Phiếu xuất hủy
          </h1>

          <div className="bg-white flex flex-col rounded shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#e9f0fc] sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-800">
                      Mã xuất hủy
                    </th>
                    <th className="p-3 font-semibold text-gray-800">
                      Ngày trả
                    </th>
                    <th className="p-3 font-semibold text-gray-800">
                      Nhà cung cấp
                    </th>
                    <th className="p-3 font-semibold text-gray-800">
                      Tổng giá trị
                    </th>
                    <th className="p-3 font-semibold text-gray-800">Ghi chú</th>
                    <th className="p-3 font-semibold text-gray-800 text-center">
                      Trạng Thái
                    </th>
                    <th className="p-3 font-semibold text-gray-800 text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((invoice, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-blue-700 font-bold">
                        {invoice.id}
                      </td>
                      <td className="p-3 text-gray-600">{invoice.date}</td>
                      <td className="p-3 text-gray-600">{invoice.supplier}</td>
                      <td className="p-3 text-gray-800 font-bold">
                        {invoice.total}
                      </td>
                      <td className="p-3 text-gray-600 italic">
                        {invoice.note}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button className="w-5 h-5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
                            <img
                              src={Icons.Eye}
                              alt="Xem"
                              className="w-full h-full object-contain filter brightness-0"
                            />
                          </button>
                          <button className="w-5 h-5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
                            <img
                              src={Icons.Printer}
                              alt="In"
                              className="w-full h-full object-contain filter brightness-0"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-20 text-center text-gray-400 italic"
                      >
                        Không tìm thấy dữ liệu phù hợp với bộ lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white border-t border-gray-200 p-3 flex justify-start items-center text-gray-500">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium">
                  Số phiếu: {filteredData.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Export;
