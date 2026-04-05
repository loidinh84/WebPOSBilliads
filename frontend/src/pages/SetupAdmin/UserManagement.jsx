import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";

function UserManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Dữ liệu mẫu
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [filterRole, setFilterRole] = useState("Chọn vai trò");
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    email: "",
    address: "",
  });
  const initialFormState = {
    username: "",
    fullname: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    email: "",
    address: "",
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const formattedData = data.map((u) => ({
        ...u,
        status: Number(u.status) === 0 ? "Ngừng hoạt động" : "Đang hoạt động",
      }));
      setUsers(formattedData);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "Tất cả" || user.status === filterStatus;
    const matchesRole =
      filterRole === "Chọn vai trò" || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAddNewClick = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setFormData(initialFormState);
    setIsEditMode(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. kiểm tra URL và method
    const url = isEditMode
      ? "http://localhost:5000/api/users/update"
      : "http://localhost:5000/api/users/create";

    const method = isEditMode ? "PUT" : "POST";

    // 2. Kiểm tra các trường bắt buộc
    const requiredFields = {
      fullname: "Tên người dùng",
      username: "Tên đăng nhập",
      role: "Vai trò",
      phone: "Số điện thoại",
      email: "Email",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].trim() === "") {
        return Swal.fire(
          "Thông báo",
          `Vui lòng không bỏ trống: ${label}`,
          "warning",
        );
      }
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      return Swal.fire(
        "Lỗi",
        "Tên đăng nhập viết liền không dấu, không chứa khoảng trắng hay ký tự đặc biệt!",
        "error",
      );
    }

    if (!isEditMode) {
      if (!formData.password || formData.password.trim() === "") {
        return Swal.fire(
          "Thông báo",
          "Vui lòng nhập mật khẩu cho người dùng mới",
          "warning",
        );
      }
    }

    // 3. Kiểm tra mật khẩu
    if (!isEditMode) {
      if (!formData.password || formData.password.length < 6) {
        return Swal.fire(
          "Lỗi",
          "Mật khẩu mới phải có ít nhất 6 ký tự!",
          "error",
        );
      }
      if (formData.password !== formData.confirmPassword) {
        return Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp!", "error");
      }
    } else {
      if (formData.password && formData.password.length > 0) {
        if (formData.password.length < 6) {
          return Swal.fire(
            "Lỗi",
            "Mật khẩu mới phải có ít nhất 6 ký tự!",
            "error",
          );
        }
        if (formData.password !== formData.confirmPassword) {
          return Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp!", "error");
        }
      }
    }

    // 4. Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      return Swal.fire("Lỗi", "Số điện thoại không hợp lệ!", "error");
    }

    // 5. Kiểm tra định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return Swal.fire(
        "Lỗi",
        "Định dạng Email không hợp lệ (ví dụ: abc@gmail.com)!",
        "error",
      );
    }

    // 6. Nếu tất cả ổn, mới gửi API
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        await Swal.fire(
          "Thành công",
          isEditMode ? "Cập nhật thành công!" : "Đã thêm người dùng mới!",
          "success",
        );
        setIsAddModalOpen(false);
        fetchUsers();
      } else {
        Swal.fire("Lỗi", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể kết nối Server", err);
    }
  };

  const handleEditClick = (user) => {
    setFormData({
      username: user.username,
      fullname: user.fullname,
      password: "",
      confirmPassword: "",
      role: user.role,
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      status: user.status,
    });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const confirmText =
      user.status === "Đang hoạt động" ? "ngừng hoạt động" : "kích hoạt lại";

    const result = await Swal.fire({
      title: "Xác nhận?",
      text: `Bạn có chắc muốn ${confirmText} tài khoản này?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00a651",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Bỏ qua",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("http://localhost:5000/api/users/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            username: user.username,
            currentStatus: user.status,
          }),
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Thành công", data.message, "success");
          fetchUsers();
        }
      } catch (err) {
        Swal.fire("Lỗi", "Không thể xử lý yêu cầu", err);
      }
    }
  };

  const handleDeleteUser = async (username) => {
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn?",
      text: `Hệ thống sẽ xóa hoàn toàn người dùng ${username} nhưng vẫn giữ giao dịch lịch sử nếu có. Bạn có chắc chắn muốn xóa?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ee4d2d",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Bỏ qua",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${username}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Đã xóa!", data.message, "success");
          setSelectedUser(null);
          fetchUsers();
        } else {
          Swal.fire("Không thể xóa", data.message, "warning");
        }
      } catch (err) {
        Swal.fire("Lỗi", "Lỗi server", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e8ea] font-sans text-[13px] text-[#333]">
      <DashboardHeader storeName="" />
      <DashboardNav />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-4">
        {/* SIDEBAR FILTER */}
        <aside className="w-[300px] flex-shrink-0 space-y-3">
          <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
            <h3 className="font-bold mb-2 text-gray-700 text-[16px]">
              Tìm kiếm
            </h3>
            <input
              type="text"
              placeholder="Theo tên ĐN, người dùng"
              className="w-full border border-gray-300 rounded-sm px-3 py-1.5 focus:outline-none focus:border-[#00a651] text-[15px] font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* BỔ SUNG LẠI BỘ LỌC VAI TRÒ */}
          <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
            <h3 className="font-bold mb-2 ext-gray-700 text-[16px] font-bold">
              Vai trò
            </h3>
            <select
              className="w-full border border-gray-300 rounded-sm px-2 py-1.5 focus:outline-none focus:border-[#00a651] text-[15px] font-normal appearance-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="Chọn vai trò">Chọn vai trò...</option>
              <option value="Admin">Admin</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Nhà bếp">Nhà bếp</option>
              <option value="Thu ngân">Thu ngân</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
            <h3 className="font-bold mb-2 text-gray-700 text-[16px]">
              Trạng thái
            </h3>
            <div className="space-y-2 text-[16px]">
              {["Tất cả", "Đang hoạt động", "Ngừng hoạt động"].map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    checked={filterStatus === status}
                    onChange={() => setFilterStatus(status)}
                    className="w-5 h-5 accent-[#383da9]"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-[#333]">Người dùng</h1>
            <button
              onClick={handleAddNewClick}
              className="bg-[#00a651] hover:bg-[#008d45] text-white px-4 rounded-sm flex items-center gap-2 font-medium transition-all active:scale-95 text-[16px] py-2.5 cursor-pointer"
            >
              <img
                src={Icons.Add}
                alt="Thêm người dùng"
                className="w-6 h-6 brightness-0 invert"
              />{" "}
              Thêm người dùng
            </button>
          </div>

          <div className="bg-white rounded-sm shadow-sm border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9] border-b border-gray-200 text-gray-700 font-bold text-[16px]">
                  <th className="p-3 text-left border-r border-gray-100">
                    Tên đăng nhập
                  </th>
                  <th className="p-3 text-left border-r border-gray-100">
                    Tên người dùng
                  </th>
                  <th className="p-3 text-left ">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.username}>
                    <tr
                      onClick={() => {
                        if (selectedUser === user.username) {
                          setSelectedUser(null);
                        } else {
                          setSelectedUser(user.username);
                          setActiveTab("info");
                        }
                      }}
                      className={`border-b border-gray-100 hover:bg-[#f1f1f1] cursor-pointer ${selectedUser === user.username ? "bg-[#e8f5e9]" : ""}`}
                    >
                      <td className="p-3 text-gray-700 text-[17px] font-medium">
                        {user.username}
                      </td>
                      <td className="p-3 text-gray-700 text-[17px] font-medium">
                        {user.fullname}
                      </td>
                      <td className="p-3 text-gray-700 text-[17px] font-medium">
                        {user.status}
                      </td>
                    </tr>

                    {/* CHI TIẾT NGƯỜI DÙNG */}
                    {selectedUser === user.username && (
                      <tr className="bg-white">
                        <td colSpan="3" className="p-4 bg-[#fcfcfc]">
                          <div className="border border-gray-200 rounded-sm bg-white shadow-inner -mx-4 -my-4">
                            {/* TAB NAVIGATION */}
                            <div className="flex border-b border-gray-200 bg-[#f9f9f9]">
                              <button
                                onClick={() => setActiveTab("info")}
                                className={`px-8 text-[15px] py-2 font-bold transition-all ${activeTab === "info" ? "border-b-2 border-[#0021a6] text-[#0021a6]" : "text-gray-500"}`}
                              >
                                Thông tin
                              </button>
                              <button
                                onClick={() => setActiveTab("access")}
                                className={`px-6 py-2 text-[15px] font-bold transition-all ${activeTab === "access" ? "border-b-2 border-[#0021a6] text-[#0021a6]" : "text-gray-500"}`}
                              >
                                Thời gian truy cập
                              </button>
                            </div>

                            {/* TAB CONTENT 1: THÔNG TIN */}
                            {activeTab === "info" && (
                              <div className="p-6 animate-fadeIn bg-white">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-3 w-3/4">
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Tên đăng nhập:
                                    </span>{" "}
                                    <b className="text-[16px]">
                                      {user.username}
                                    </b>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Vai trò:
                                    </span>{" "}
                                    <b className="text-[16px]">{user.role}</b>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Tên người dùng:
                                    </span>{" "}
                                    <b className="text-[16px]">
                                      {user.fullname}
                                    </b>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Trạng thái:
                                    </span>{" "}
                                    <b className="text-[16px]">{user.status}</b>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Số điện thoại:
                                    </span>{" "}
                                    <b className="text-[16px]">
                                      {user.phone || "---"}
                                    </b>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[14px] w-32 inline-block">
                                      Email:
                                    </span>{" "}
                                    <b className="text-[16px]">
                                      {user.email || "---"}
                                    </b>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 ">
                                  <button
                                    onClick={() =>
                                      handleEditClick(
                                        users.find(
                                          (u) => u.username === selectedUser,
                                        ),
                                      )
                                    }
                                    className="bg-amber-600 text-white px-5 py-2 rounded-sm font-bold hover:bg-amber-500 flex items-center gap-2 transition-all min-w-[120px] justify-center text-[16px]"
                                  >
                                    <img
                                      src={Icons.Pen}
                                      className="w-4 h-4 brightness-0 invert"
                                      alt=""
                                    />
                                    Chỉnh sửa
                                  </button>

                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    className={`${user.status === "Đang hoạt động" ? "bg-red-600" : "bg-green-600"}  text-white px-5 py-2 rounded-sm font-bold hover:bg-red-700 flex items-center gap-2 transition-all min-w-[90px] justify-center text-[16px]`}
                                  >
                                    <img
                                      src={Icons.Block}
                                      className="w-4 h-4 brightness-0 invert"
                                      alt=""
                                    />
                                    {user.status === "Đang hoạt động"
                                      ? "Ngừng hoạt động"
                                      : "Kích hoạt lại"}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user.username)
                                    }
                                    className="px-4 py-1.5 flex gap-1.5 items-center rounded font-semibold text-white bg-red-600 text-[16px]"
                                  >
                                    <img
                                      src={Icons.Delete}
                                      alt=""
                                      className="w-4 h-4 filter brightness-0 invert"
                                    />
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT 2: THỜI GIAN TRUY CẬP */}
                            {activeTab === "access" && (
                              <div className="p-6 animate-fadeIn">
                                <div className="flex items-center gap-2 mb-4">
                                  <input
                                    type="checkbox"
                                    checked
                                    className="accent-[#00a651] w-4 h-4"
                                  />
                                  <span className="font-bold text-gray-700">
                                    Giới hạn thời gian truy cập theo các ngày
                                    trong tuần
                                  </span>
                                </div>
                                <table className="w-full border border-gray-200">
                                  <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                      <th className="p-2 border border-gray-200 font-semibold">
                                        Ngày trong tuần
                                      </th>
                                      <th className="p-2 border border-gray-200 font-semibold">
                                        Từ
                                      </th>
                                      <th className="p-2 border border-gray-200 font-semibold">
                                        Đến
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      "Thứ 2",
                                      "Thứ 3",
                                      "Thứ 4",
                                      "Thứ 5",
                                      "Thứ 6",
                                      "Thứ 7",
                                      "Chủ nhật",
                                    ].map((day) => (
                                      <tr key={day}>
                                        <td className="p-2 border border-gray-200 text-center font-medium">
                                          {day}
                                        </td>
                                        <td className="p-2 border border-gray-200">
                                          <input
                                            type="time"
                                            defaultValue="08:00"
                                            className="w-full outline-none focus:text-[#00a651]"
                                          />
                                        </td>
                                        <td className="p-2 border border-gray-200">
                                          <input
                                            type="time"
                                            defaultValue="22:00"
                                            className="w-full outline-none focus:text-[#00a651]"
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-4 flex justify-end">
                                  <button className="bg-[#00a651] text-white px-6 py-1.5 rounded-sm font-bold shadow-sm">
                                    Lưu cài đặt giờ
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL THÊM MỚI (CHIA 2 CỘT) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-[750px] border border-gray-300">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-2xl font-bold text-gray-700">
                {isEditMode ? "Cập nhật người dùng" : "Thêm mới người dùng"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-red-500 text-xl cursor-pointer"
              >
                <img
                  src={Icons.Close}
                  alt="Đóng"
                  className="w-6 h-6 brightness-110 invert"
                />
              </button>
            </div>
            <form className="p-6 " onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* CỘT 1 */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Tên người dùng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-sm px-2 py-1.5 outline-none focus:border-[#00a651] text-[16px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      disabled={isEditMode}
                      readOnly={isEditMode}
                      onChange={handleChange}
                      className={`border border-gray-300 rounded-sm px-2 py-1.5 outline-none focus:border-[#00a651] text-[16px] ${isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                    />
                    {isEditMode && (
                      <p className="text-gray-400 text-[11px] mt-1">
                        * Tên đăng nhập không thể thay đổi
                      </p>
                    )}
                  </div>
                  <div className="relative flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-sm px-2 py-1.5 pr-8 outline-none focus:border-[#00a651] text-[16px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-[32px] text-gray-500 text-lg"
                    >
                      <img
                        src={showPassword ? Icons.HiddenEye : Icons.Eye}
                        alt=""
                        className="w-5 h-5 brightness-100 mt-0.5 "
                      />
                    </button>
                  </div>
                  <div className="relative flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border text-[16px] border-gray-300 rounded-sm px-2 py-1.5 outline-none focus:border-[#00a651] appearance-none "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-[32px] text-gray-500 text-lg"
                    >
                      <img
                        src={showPassword ? Icons.HiddenEye : Icons.Eye}
                        alt="Xác nhận mật khẩu"
                        className="w-5 h-5 brightness-100 mt-0.5 "
                      />
                    </button>
                  </div>
                </div>

                {/* CỘT 2 */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-sm px-2 py-1.5 outline-none text-[16px] focus:border-[#00a651] appearance-none"
                    >
                      <option value="">Chọn vai trò</option>
                      <option>Admin</option>
                      <option>Quản lý</option>
                      <option>Nhà bếp</option>
                      <option>Thu ngân</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border border-gray-300 text-[16px] rounded-sm px-2 py-1.5 outline-none focus:border-[#00a651]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-sm text-[16px] px-2 py-1.5 outline-none focus:border-[#00a651]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-800 font-semibold text-[16px]">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-sm text-[16px] px-2 py-1.5 outline-none focus:border-[#00a651]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-[#11c869] text-white px-4 py-2 rounded-sm font-bold flex items-center gap-2 transition-all hover:bg-[#059249] shadow-sm text-[16px]"
                >
                  <img
                    src={Icons.Export}
                    alt="Lưu"
                    className="h-6 w-6 brightness-0 invert"
                  />{" "}
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-[#6c757d] text-white px-4 py-2 rounded-sm font-bold flex items-center gap-2 transition-all hover:bg-gray-600 text-[16px]"
                >
                  <img
                    src={Icons.Block}
                    alt="Đóng"
                    className="w-6 h-6 brightness-0 invert"
                  />{" "}
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
