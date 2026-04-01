import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function ActionHistory() {
  const [expandedRow, setExpandedRow] = useState(null);

  // States dành cho bộ lọc
  const [filterAction, setFilterAction] = useState("-- Tất cả --");
  const [filterUserSelect, setFilterUserSelect] = useState("-- Tất cả --");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState("Hôm nay");

  // Dữ liệu mẫu
  const [logs] = useState([
    {
      id: 1,
      action: "THANH TOÁN HÓA ĐƠN",
      time: "2026/03/31 22:30",
      target: "HD000001",
      user: "Lợi - Thu ngân",
      details: "Thanh toán hóa đơn: THANH TOÁN HÓA ĐƠN",
    },
    {
      id: 2,
      action: "XÓA HÓA ĐƠN",
      time: "2026/03/31 22:15",
      target: "HD000001",
      user: "Tài - Kế Toán",
      details: "Mô tả xử sinh tác số: XÓA HÓA ĐƠN",
    },
    {
      id: 3,
      action: "XÓA HÀNG HÓA",
      time: "2026/03/31 21:45",
      target: "SP000025",
      user: "Khang - Thủ Kho",
      details: "Mô tả xử sinh tác số: XÓA HÀNG HÓA",
    },
    {
      id: 4,
      action: "CẬP NHẬT GIÁ",
      time: "2026/03/31 20:30",
      target: "SP000019",
      user: "Levis - Kinh Doanh",
      details: "Thay đổi giá bán sản phẩm",
    },
    {
      id: 5,
      action: "THANH TOÁN HÓA ĐƠN",
      time: "2026/03/31 20:10",
      target: "HD000002",
      user: "Lợi - Thu ngân",
      details: "Thanh toán hóa đơn: THANH TOÁN HÓA ĐƠN",
    },
  ]);

  // LOGIC LỌC DỮ LIỆU
  const filteredLogs = logs.filter((log) => {
    // 1. Lọc theo Thao tác (Dropdown)
    const matchesAction =
      filterAction === "-- Tất cả --" ||
      log.action.includes(filterAction.toUpperCase());

    // 2. Lọc theo Người dùng (Dropdown)
    const matchesUserSelect =
      filterUserSelect === "-- Tất cả --" || log.user === filterUserSelect;

    // 3. Lọc theo Ô tìm kiếm (Tìm trong tên nhân viên hoặc chi tiết)
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAction && matchesUserSelect && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Báo cáo" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-6">
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-[250px] space-y-4 shrink-0">
          <div className="space-y-4 text-black">
            {/* Bộ lọc Thao tác */}
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Thao tác
              </label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none bg-white cursor-pointer"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option>-- Tất cả --</option>
                <option>Thanh toán</option>
                <option>Xóa</option>
                <option>Cập nhật</option>
              </select>
            </div>

            {/* Bộ lọc Người dùng */}
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Người dùng
              </label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none bg-white cursor-pointer mb-2"
                value={filterUserSelect}
                onChange={(e) => setFilterUserSelect(e.target.value)}
              >
                <option>-- Tất cả --</option>
                <option>Tài - Kế Toán</option>
                <option>Lợi - Thu ngân</option>
                <option>Levis - Kinh Doanh</option>
                <option>Khang - Thủ Kho</option>
              </select>
              <input
                type="text"
                placeholder="Tìm tên, nội dung..."
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Bộ lọc Thời gian */}
            <div>
              <label className="block font-bold mb-1 text-gray-700">
                Thời gian
              </label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none bg-white cursor-pointer"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
              >
                <option>Hôm nay</option>
                <option>Lựa chọn khác</option>
              </select>
            </div>
          </div>
        </aside>

        {/* --- NỘI DUNG CHÍNH --- */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Lịch sử thao tác ({filteredLogs.length})
            </h2>
            <button className="bg-white border border-gray-300 px-4 py-1 rounded shadow-sm font-bold cursor-pointer hover:bg-gray-50 active:scale-95 transition-all text-[12px]">
              Xuất file Excel
            </button>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 text-black">
                  <th className="p-3 text-left font-bold w-[200px]">
                    Thao tác
                  </th>
                  <th className="p-3 text-left font-bold w-[150px]">
                    Thời gian
                  </th>
                  <th className="p-3 text-left font-bold w-[120px]">
                    Đối tượng
                  </th>
                  <th className="p-3 text-left font-bold w-[180px]">
                    Người dùng
                  </th>
                  <th className="p-3 text-left font-bold">Mô tả chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${expandedRow === log.id ? "bg-blue-50" : ""}`}
                      onClick={() =>
                        setExpandedRow(expandedRow === log.id ? null : log.id)
                      }
                    >
                      <td className="p-3 font-medium">{log.action}</td>
                      <td className="p-3 text-gray-600 font-mono">
                        {log.time}
                      </td>
                      <td className="p-3 text-blue-700 font-bold">
                        {log.target}
                      </td>
                      <td className="p-3">{log.user}</td>
                      <td className="p-3 text-gray-600">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center text-gray-400 italic"
                    >
                      Không tìm thấy lịch sử phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="p-8 bg-white border-t border-gray-50 text-center">
              <p className="text-gray-400 italic">-- Hết danh sách --</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ActionHistory;
