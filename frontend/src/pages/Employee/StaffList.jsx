import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";

function StaffList() {
  // ─── State: Danh sách nhân viên (Thêm dữ liệu mẫu để test bộ lọc) ─────────
  const [employees, setEmployees] = useState([
    {
      id: 1,
      staffId: "NV001",
      checkInId: "1001",
      name: "Trần Thanh Khang",
      phone: "0344999655",
      idCard: "12345678910",
      role: "Quản lý",
      department: "Điều hành",
      status: "working", // working hoặc off
      avatar: null,
    },
    {
      id: 2,
      staffId: "NV002",
      checkInId: "1002",
      name: "Nguyễn Văn Lợi lém lỉnh",
      phone: "0901234567",
      idCard: "98765432100",
      role: "Thu ngân",
      department: "Kế toán",
      status: "off",
      avatar: null,
    },
  ]);

  // ─── State: Quản lý Bộ lọc & Tìm kiếm ─────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, working, off
  const [filterDept, setFilterDept] = useState("Chọn phòng ban");
  const [filterRole, setFilterRole] = useState("Chọn chức danh");

  // ─── LOGIC LỌC TỔNG HỢP ───────────────────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    // 1. Lọc theo Tìm kiếm (Tên, Mã, SĐT)
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm);

    // 2. Lọc theo Trạng thái (Radio)
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;

    // 3. Lọc theo Phòng ban (Dropdown)
    const matchesDept =
      filterDept === "Chọn phòng ban" || emp.department === filterDept;

    // 4. Lọc theo Chức danh (Dropdown)
    const matchesRole =
      filterRole === "Chọn chức danh" || emp.role === filterRole;

    return matchesSearch && matchesStatus && matchesDept && matchesRole;
  });

  // ─── State khác (Yêu cầu & Modal) ────────────────────────────────────────
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Trần Thanh Khang",
      reason: "Gửi yêu cầu nghỉ phép: 05/04/2026",
      employeeId: 1,
    },
  ]);

  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddEmployee = (formData) => {
    const newEmp = {
      ...formData,
      id: Date.now(),
      staffId: `NV${String(employees.length + 1).padStart(3, "0")}`,
      status: "working",
      avatar: null,
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleUpdateEmployee = (updatedData) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedData.id ? updatedData : emp)),
    );
  };

  const handleApproveRequest = (reqId) => {
    const req = requests.find((r) => r.id === reqId);
    if (req) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === req.employeeId ? { ...emp, status: "off" } : emp,
        ),
      );
    }
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">
        {/* --- SIDEBAR FILTERS --- */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-4 text-black">
          {/* Trạng thái nhân viên */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4 uppercase text-[11px]">
              Trạng thái nhân viên
            </h3>
            <div className="flex flex-col gap-3">
              <label
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setFilterStatus("all")}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    checked={filterStatus === "all"}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all cursor-pointer"
                    readOnly
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-[#5D5FEF]">
                  Tất cả
                </span>
              </label>
              <label
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setFilterStatus("working")}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    checked={filterStatus === "working"}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all cursor-pointer"
                    readOnly
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-[#5D5FEF]">
                  Đang làm việc
                </span>
              </label>
              <label
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setFilterStatus("off")}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    checked={filterStatus === "off"}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#5D5FEF] transition-all cursor-pointer"
                    readOnly
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#5D5FEF] rounded-full opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-[#5D5FEF]">
                  Đã nghỉ
                </span>
              </label>
            </div>
          </div>

          {/* Phòng ban */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3 uppercase text-[11px]">
              Phòng ban
            </h3>
            <div className="relative">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] text-gray-600 font-medium cursor-pointer"
              >
                <option>Chọn phòng ban</option>
                <option>Điều hành</option>
                <option>Kế toán</option>
                <option>Dịch vụ</option>
              </select>
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50"
                alt=""
              />
            </div>
          </div>

          {/* Chức danh */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3 uppercase text-[11px]">
              Chức danh
            </h3>
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] text-gray-600 font-medium cursor-pointer"
              >
                <option>Chọn chức danh</option>
                <option>Quản lý</option>
                <option>Thu ngân</option>
                <option>Nhân viên bàn</option>
              </select>
              <img
                src={Icons.ArrowDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50"
                alt=""
              />
            </div>
          </div>

          {/* Tìm kiếm thông tin */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3 uppercase text-[11px]">
              Tìm kiếm thông tin
            </h3>
            <div className="relative group">
              <img
                src={Icons.Search}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"
                alt=""
              />
              <input
                type="text"
                placeholder="Tìm tên, mã, SĐT..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <section className="col-span-12 md:col-span-9 flex flex-col gap-6 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Nhân viên ({filteredEmployees.length})
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => openModal("ADD")}
                className="bg-white hover:bg-gray-50 text-[#5D5FEF] border border-gray-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95 cursor-pointer leading-none"
              >
                <span className="text-xl">+</span>
                <span>Thêm nhân viên</span>
              </button>
              <button
                onClick={() => openModal("APPROVE_REQUESTS")}
                className="relative bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="bg-black rounded-md p-1 flex items-center justify-center">
                  <img
                    src={Icons.insertPage}
                    className="w-3.5 h-3.5 invert"
                    alt=""
                  />
                </div>
                <span>Duyệt yêu cầu</span>
                {requests.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
            <div className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr] bg-[#EDF2F9] border-b border-gray-200">
              <div className="p-4 flex justify-center border-r border-gray-200">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase">
                Ảnh
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase">
                Mã NV
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase">
                Mã CC
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase">
                Tên nhân viên
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase text-center">
                SĐT
              </div>
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase text-center">
                Số CMND/CCCD
              </div>
            </div>

            {filteredEmployees.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr] border-b border-gray-100 hover:bg-blue-50/30 transition-all items-center group"
                  >
                    <div className="p-4 flex justify-center border-r border-gray-50 h-full items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </div>
                    <div className="p-4 border-r border-gray-50 flex items-center h-full justify-center">
                      {emp.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border">
                          <img
                            src={emp.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <img
                          src={Icons.Person}
                          alt=""
                          className="w-8 h-8 opacity-20"
                        />
                      )}
                    </div>
                    <div className="p-4 text-[14px] text-gray-700 font-medium border-r border-gray-50">
                      {emp.staffId}
                    </div>
                    <div className="p-4 text-[14px] text-gray-700 font-medium border-r border-gray-50">
                      {emp.checkInId}
                    </div>
                    <div
                      className="p-4 text-[14px] text-gray-800 font-bold border-r border-gray-50 group-hover:text-[#5D5FEF] transition-colors cursor-pointer"
                      onClick={() => openModal("VIEW_BY_EMPLOYEE", emp)}
                    >
                      {emp.name}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 border-r border-gray-50 text-center">
                      {emp.phone}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 text-center">
                      {emp.idCard}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 font-medium">
                <img
                  src={Icons.Person}
                  className="w-16 h-16 opacity-20 mb-2"
                  alt=""
                />
                <p>Không tìm thấy nhân viên nào khớp với bộ lọc.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <EmployeeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        data={modal.data}
        onAddEmployee={handleAddEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        requests={requests}
        onApproveRequest={handleApproveRequest}
      />
    </div>
  );
}

export default StaffList;
