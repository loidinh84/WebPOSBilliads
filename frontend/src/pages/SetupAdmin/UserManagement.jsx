import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function UserManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState([
    {
      username: "nhanvien01",
      fullname: "Tài - Kế Toán",
      status: "Đang hoạt động",
    },
    {
      username: "nhanvien02",
      fullname: "Lợi - Thu ngân",
      status: "Đang hoạt động",
    },
    {
      username: "nhanvien03",
      fullname: "Levis - Kinh Doanh",
      status: "Đang hoạt động",
    },
    {
      username: "nhanvien04",
      fullname: "Khang - Thủ Kho",
      status: "Đang hoạt động",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px] relative">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-6">
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-[280px] space-y-4 shrink-0">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 text-gray-700 uppercase">Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Theo mã, tên chương trình"
              className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 text-gray-700 uppercase">Vai trò</h3>
            <select className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400 bg-white cursor-pointer transition-colors hover:border-gray-400">
              <option value="">Chọn vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 text-gray-700 uppercase">
              Trạng thái
            </h3>
            <div className="space-y-2">
              {["Tất cả", "Đang hoạt động", "Ngừng hoạt động"].map(
                (label, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="status"
                      defaultChecked={index === 1}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="group-hover:text-blue-600 transition-colors">
                      {label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>
        </aside>

        {/* --- NỘI DUNG CHÍNH --- */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Người dùng</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 px-4 py-1.5 rounded shadow-sm transition-all flex items-center gap-2 font-bold cursor-pointer active:scale-95"
            >
              <span className="text-lg">+</span> Thêm mới người dùng
            </button>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#dbeafe] border-b border-gray-200 font-bold text-gray-700 uppercase text-[11px]">
                  <th className="p-3 text-left w-1/4">Tên đăng nhập</th>
                  <th className="p-3 text-left w-2/4">Tên người dùng</th>
                  <th className="p-3 text-right w-1/4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 text-blue-700 font-bold">
                      {user.username}
                    </td>
                    <td className="p-3 font-medium">{user.fullname}</td>
                    <td className="p-3 text-right text-gray-600">
                      {user.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-10 bg-white"></div>
          </div>
        </section>
      </main>

      {/* --- MODAL THÊM MỚI NGƯỜI DÙNG --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#4154F1] text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Thêm người dùng mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-2xl leading-none cursor-pointer hover:opacity-80"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 outline-none focus:border-blue-500"
                  placeholder="vd: nhanvien05"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Tên người dùng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 outline-none focus:border-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="on"
                  className="w-full border rounded p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-gray-700">
                  Vai trò
                </label>
                <select className="w-full border rounded p-2 outline-none cursor-pointer">
                  <option>Nhân viên</option>
                  <option>Quản trị viên</option>
                  <option>Kế toán</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold cursor-pointer transition-all active:scale-95">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
