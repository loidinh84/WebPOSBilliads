import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000/api/employees";
const API_LEAVE_URL = "http://localhost:5000/api/leave";

function StaffList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch Data ──────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhân viên:", err);
      setError("Không thể tải danh sách nhân viên.");
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${API_LEAVE_URL}/pending`);
      const mappedRequests = response.data.map((req) => ({
        id: req.MAYEUCAU,
        name: req.FullName,
        reason: `${req.LYDO} (${new Date(req.NGAYBATDAU).toLocaleDateString("vi-VN")} - ${new Date(req.NGAYKETTHUC).toLocaleDateString("vi-VN")})`,
        employeeId: req.MANVIEN,
      }));
      setRequests(mappedRequests);
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn("Route /api/leave/pending chưa tồn tại hoặc sai tên");
        setRequests([]);
      } else {
        console.error("Lỗi khi tải yêu cầu nghỉ phép:", err);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  // ─── State: Quản lý Bộ lọc & Tìm kiếm ─────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, working, off
  const [filterRole, setFilterRole] = useState("Chọn chức danh");

  // ─── LOGIC LỌC TỔNG HỢP ───────────────────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    // 1. Lọc theo Tìm kiếm (Tên, Mã, SĐT)
    const matchesSearch =
      (emp.TENNGUOIDUNG || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (emp.MANVIEN || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.SDT || "").includes(searchTerm);

    // 2. Lọc theo Trạng thái (Radio)
    // Dựa trên employeeModel: 1 hoặc NULL/undefined là Đang làm việc, 0 là Đã nghỉ
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "working" &&
        (emp.TRANGTHAI === 1 ||
          emp.TRANGTHAI === true ||
          emp.TRANGTHAI === null ||
          emp.TRANGTHAI === undefined)) ||
      (filterStatus === "off" &&
        (emp.TRANGTHAI === 0 || emp.TRANGTHAI === false));

    // 3. Lọc theo Chức danh (Dropdown)
    // Cho phép khớp cả tên cũ (ví dụ: Quản lý) và tên mới (Quản lý (40k))
    const matchesRole =
      filterRole === "Chọn chức danh" ||
      (emp.CHUCVU &&
        emp.CHUCVU.toLowerCase().includes(filterRole.toLowerCase()));

    return matchesSearch && matchesStatus && matchesRole;
  });

  // ─── State khác (Yêu cầu & Modal) ────────────────────────────────────────
  const [requests, setRequests] = useState([]);

  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddEmployee = async (formData) => {
    try {
      // Map frontend fields to backend schema
      const payload = {
        TENNGUOIDUNG: formData.name,
        SDT: formData.phone,
        EMAIL: formData.email || null,
        DIACHI: formData.address || null,
        GIOITINH: formData.gender || null,
        NGAYSINH: formData.dob || null,
        CCCD: formData.idCard || null,
        CHUCVU: formData.role,
        HINHANH: formData.avatar || null,
      };

      await axios.post(API_BASE_URL, payload);
      Swal.fire("Thành công", "Đã thêm nhân viên mới!", "success");
      fetchEmployees();
    } catch (err) {
      console.error("Lỗi khi thêm nhân viên:", err);
      Swal.fire(
        "Lỗi",
        err.response?.data?.message || "Không thể thêm nhân viên.",
        "error",
      );
    }
  };

  const handleUpdateEmployee = async (updatedData) => {
    try {
      const payload = {
        MACCH: updatedData.checkInId || updatedData.MACCH,
        TENNGUOIDUNG: updatedData.name || updatedData.TENNGUOIDUNG,
        SDT: updatedData.phone || updatedData.SDT,
        EMAIL: updatedData.email || updatedData.EMAIL,
        DIACHI: updatedData.address || updatedData.DIACHI,
        GIOITINH: updatedData.gender || updatedData.GIOITINH,
        NGAYSINH: updatedData.dob || updatedData.NGAYSINH,
        CCCD: updatedData.idCard || updatedData.CCCD,
        CHUCVU: updatedData.role || updatedData.CHUCVU,
        HINHANH: updatedData.avatar || updatedData.HINHANH,
      };

      await axios.put(`${API_BASE_URL}/${updatedData.MANVIEN}`, payload);
      Swal.fire("Thành công", "Đã cập nhật thông tin nhân viên!", "success");
      fetchEmployees();
    } catch (err) {
      console.error("Lỗi khi cập nhật nhân viên:", err);
      Swal.fire("Lỗi", "Không thể cập nhật thông tin nhân viên.", "error");
    }
  };

  const handleDeleteEmployee = async (manvien, username) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Nhân viên này sẽ bị xóa vĩnh viễn khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/${manvien}?username=${username}`);
        Swal.fire("Đã xóa!", "Nhân viên đã được gỡ bỏ.", "success");
        fetchEmployees();
      } catch (err) {
        console.error("Lỗi khi xóa nhân viên:", err);
        Swal.fire("Lỗi", "Không thể xóa nhân viên này.", "error");
      }
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      await axios.post(`${API_LEAVE_URL}/approve/${reqId}`);
      Swal.fire(
        "Thành công",
        "Đã duyệt yêu cầu và cập nhật trạng thái nhân viên!",
        "success",
      );
      fetchEmployees();
      fetchLeaveRequests();
    } catch (err) {
      console.error("Lỗi khi duyệt yêu cầu:", err);
      Swal.fire("Lỗi", "Không thể duyệt yêu cầu này.", "error");
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await axios.post(`${API_LEAVE_URL}/reject/${reqId}`);
      Swal.fire("Thành công", "Đã từ chối yêu cầu nghỉ phép!", "success");
      fetchLeaveRequests();
    } catch (err) {
      console.error("Lỗi khi từ chối yêu cầu:", err);
      Swal.fire("Lỗi", "Không thể từ chối yêu cầu này.", "error");
    }
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
                <option value="Admin">Admin</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Nhà bếp">Nhà bếp</option>
                <option value="Thu ngân">Thu ngân</option>
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
            <div className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr_120px] bg-[#EDF2F9] border-b border-gray-200">
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
              <div className="p-4 text-[13px] font-bold text-gray-700 uppercase text-center">
                Thao tác
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center p-6 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.MANVIEN}
                    className="grid grid-cols-[50px_100px_1.2fr_1.2fr_1.8fr_1.2fr_1.4fr_120px] border-b border-gray-100 hover:bg-blue-50/30 transition-all items-center group"
                  >
                    <div className="p-4 flex justify-center border-r border-gray-50 h-full items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </div>
                    <div className="p-4 border-r border-gray-50 flex items-center h-full justify-center">
                      {emp.HINHANH ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border">
                          <img
                            src={emp.HINHANH}
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
                      {emp.MANVIEN}
                    </div>
                    <div className="p-4 text-[14px] text-gray-700 font-medium border-r border-gray-50">
                      {emp.MACCH}
                    </div>
                    <div
                      className="p-4 text-[14px] text-gray-800 font-bold border-r border-gray-50 group-hover:text-[#5D5FEF] transition-colors cursor-pointer"
                      onClick={() =>
                        openModal("VIEW_BY_EMPLOYEE", {
                          ...emp,
                          name: emp.TENNGUOIDUNG,
                          phone: emp.SDT,
                          email: emp.EMAIL,
                          address: emp.DIACHI,
                          role: emp.CHUCVU,
                          staffId: emp.MANVIEN,
                          checkInId: emp.MACCH,
                          gender: emp.GIOITINH,
                          dob: emp.NGAYSINH,
                          idCard: emp.CCCD,
                        })
                      }
                    >
                      {emp.TENNGUOIDUNG}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 border-r border-gray-50 text-center">
                      {emp.SDT}
                    </div>
                    <div className="p-4 text-[14px] text-gray-600 text-center border-r border-gray-50">
                      {emp.CCCD || "---"}
                    </div>
                    <div className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() =>
                          openModal("EDIT", {
                            ...emp,
                            name: emp.TENNGUOIDUNG,
                            phone: emp.SDT,
                            email: emp.EMAIL,
                            address: emp.DIACHI,
                            role: emp.CHUCVU,
                            staffId: emp.MANVIEN,
                            checkInId: emp.MACCH,
                            gender: emp.GIOITINH,
                            dob: emp.NGAYSINH,
                            idCard: emp.CCCD,
                          })
                        }
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteEmployee(emp.MANVIEN, emp.TENDANGNHAP)
                        }
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
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
        onRejectRequest={handleRejectRequest}
      />
    </div>
  );
}

export default StaffList;
