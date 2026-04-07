import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function ActionHistory() {
  const [expandedRow, setExpandedRow] = useState(null);

  // States dành cho bộ lọc
  const [filterAction, setFilterAction] = useState("-- Tất cả --");
  const [filterUserSelect, setFilterUserSelect] = useState("-- Tất cả --");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState("Hôm nay");

  // 1. Khởi tạo state logs là mảng rỗng
  const [logs, setLogs] = useState([]);

  // 2. GỌI API BACKEND KHI VỪA MỞ TRANG LÊN
  useEffect(() => {
    // Sửa lại port 5000 cho đúng với port Backend của Bro nếu cần
    fetch("http://localhost:5000/api/action-history")
      .then((response) => response.json())
      .then((result) => {
        console.log("Dữ liệu nhận được từ Backend:", result); // Mở F12 lên xem dòng này nhé Bro!
        if (result.success) {
          setLogs(result.data); // Đổ dữ liệu thật vào state
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API Lịch sử thao tác:", error);
      });
  }, []);

  // 3. LOGIC LỌC DỮ LIỆU (Đã thêm check an toàn để không bị lỗi undefined)
  const filteredLogs = logs.filter((log) => {
    const actionStr = log.action || "";
    const userStr = log.user || "";
    const targetStr = log.target || "";
    const detailsStr = log.details || "";

    const matchesAction = filterAction === "-- Tất cả --" || actionStr.toUpperCase().includes(filterAction.toUpperCase());
    const matchesUserSelect = filterUserSelect === "-- Tất cả --" || userStr.includes(filterUserSelect);
    const matchesSearch =
      userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      targetStr.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAction && matchesUserSelect && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Báo cáo" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-6">
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-[250px] shrink-0 bg-white border border-gray-200 rounded shadow-sm p-5 h-max">
          <div className="space-y-5 text-black">
            <div>
              <label className="block font-bold mb-1.5 text-gray-700">Thao tác</label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white cursor-pointer"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option>-- Tất cả --</option>
                <option>Thanh toán</option>
                <option>Xóa</option>
                <option>Cập nhật</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1.5 text-gray-700">Người dùng</label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white cursor-pointer mb-2"
                value={filterUserSelect}
                onChange={(e) => setFilterUserSelect(e.target.value)}
              >
                <option>-- Tất cả --</option>
                {/* Bro có thể thay bằng danh sách nhân viên linh động nếu muốn */}
                <option>Nguyễn Văn Quản Lý - Quản lý</option>
                <option>Trần Thị Thu - Nhân viên</option>
                <option>Lê Văn Hùng - Nhân viên</option>
              </select>
              <input
                type="text"
                placeholder="Tìm tên, mã đối tượng, chi tiết..."
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold mb-1.5 text-gray-700">Thời gian</label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white cursor-pointer"
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
            <h2 className="text-xl font-bold">Lịch sử thao tác</h2>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 text-black">
                  <th className="p-3 text-left font-bold w-[200px]">Thao tác</th>
                  <th className="p-3 text-left font-bold w-[150px]">Thời gian</th>
                  <th className="p-3 text-left font-bold w-[120px]">Đối tượng</th>
                  <th className="p-3 text-left font-bold w-[180px]">Người dùng</th>
                  <th className="p-3 text-left font-bold">Mô tả chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${expandedRow === log.id ? "bg-blue-50" : ""}`}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="p-3 font-medium">{log.action}</td>
                      <td className="p-3 text-gray-600 font-mono">{log.time}</td>
                      <td className="p-3 text-blue-700 font-bold">{log.target}</td>
                      <td className="p-3">{log.user}</td>
                      <td className="p-3 text-gray-600">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400 italic">
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