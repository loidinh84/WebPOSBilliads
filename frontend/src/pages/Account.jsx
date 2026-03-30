import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import * as Icons from "../assets/icons/index";

function Account() {
  const [user, setUser] = useState({ TENDANGNHAP: "" });
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const navigate = useNavigate();

  // State dành cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 1. Lấy dữ liệu profile khi vào trang
  const fetchProfile = () => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const loginName = savedUser?.TENDANGNHAP || savedUser?.username;

    fetch(`http://localhost:5000/api/user/profile/${loginName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.NGAYSINH) data.NGAYSINH = data.NGAYSINH.split("T")[0];
        setUser(data);
        setTempUser(data);
        setIsLoading(false);
      });
  };

  const toggleEdit = () => {
    if (isEditing) {
      setUser(tempUser);
    } else {
      setTempUser(user);
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Hàm xử lý khi gõ vào bất kỳ ô input nào
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Hàm xử lý khi gõ vào các ô mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. API: Lưu thông tin cá nhân
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/update/${user.TENDANGNHAP}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Cập nhật thông tin thành công!");
        setTempUser(user);
        setIsEditing(false);
      } else {
        alert("Lỗi từ server: " + data.message);
      }
    } catch (err) {
      alert("Không thể kết nối đến server để lưu dữ liệu!");
      console.error(err);
    }
  };

  // 5. API: Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Kiểm tra khớp mật khẩu mới
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/user/change-password/${user.TENDANGNHAP}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Đổi mật khẩu thành công!");
        setShowPasswordModal(false); // Đóng modal
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Lỗi server, vui lòng thử lại sau!", err);
    }
  };

  // 6. API: Đổi hình ảnh
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUser((prev) => ({ ...prev, HINHANH: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading)
    return <div className="p-10 text-center font-bold">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-inter">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* CỘT TRÁI: AVATAR & BẢO MẬT */}
          <div className="w-full lg:w-[350px] space-y-8">
            <div className="bg-white rounded-[25px] p-10 shadow-lg border border-gray-100 text-center relative">
              <div
                className="relative w-36 h-36 mx-auto mb-6 group"
                onClick={() => isEditing && fileInputRef.current.click()}
              >
                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden transition-all group-hover:border-purple-100">
                  <img
                    src={user.HINHANH || Icons.User}
                    alt="Avatar"
                    className={
                      user.HINHANH
                        ? "w-full h-full object-cover"
                        : "w-16 h-16 opacity-15"
                    }
                  />
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-purple-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm cursor-pointer">
                    <img
                      src={Icons.Setting}
                      alt="change"
                      className="w-8 h-8 invert"
                    />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {user.TENNGUOIDUNG || user.TENDANGNHAP}
              </h3>
              <p className="text-[#5D5FEF] font-bold text-sm mb-5 uppercase">
                {user.QUYENHAN}
              </p>
              <div className="inline-flex gap-3 px-5 py-2.5 bg-green-50 text-green-700 text-xs font-black rounded-full uppercase tracking-wider">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                Đang hoạt động
              </div>
            </div>

            <div className="bg-white rounded-[25px] p-8 shadow-lg border border-gray-100 space-y-6">
              <h4 className="font-bold text-gray-800 text-lg">
                Bảo mật tài khoản
              </h4>
              <div className="space-y-5">
                <StatusItem
                  label="Xác thực Email"
                  isDone={!!user.EMAIL}
                  Icon={Icons.Setting}
                />
                <StatusItem
                  label="Xác thực Số Điện Thoại"
                  isDone={!!user.SDT}
                  Icon={Icons.Setting}
                />
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-3 py-4 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-700 transition-all border border-gray-200"
              >
                Đổi mật khẩu bảo mật
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="flex-1 bg-white rounded-[30px] p-10 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-10 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-6">
                {/* NÚT QUAY LẠI ĐÃ SỬA CỦA BẠN */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all group cursor-pointer"
                  title="Quay lại"
                >
                  <img
                    src={Icons.ArrowBackLong}
                    alt="Quay lại"
                    className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all"
                  />
                  <span className="font-bold text-gray-500 group-hover:text-[#5D5FEF] text-sm">
                    Trở về
                  </span>
                </button>

                <h2 className="text-2xl font-black text-gray-900 tracking-tight self-center items-center">
                  Hồ sơ cá nhân
                </h2>
              </div>
              <button
                onClick={toggleEdit}
                className="flex gap-2.5 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                <img src={Icons.Setting} alt="Edit" className="w-4 h-4" />
                {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <InfoField
                label="Tên người dùng"
                name="TENDANGNHAP"
                value={user.TENDANGNHAP}
                isLocked={true}
              />
              <InfoField
                label="Họ và tên"
                name="TENNGUOIDUNG"
                value={user.TENNGUOIDUNG}
                isLocked={!isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Số điện thoại"
                name="SDT"
                value={user.SDT}
                isLocked={!isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Email"
                name="EMAIL"
                value={user.EMAIL}
                isLocked={!isEditing}
                onChange={handleChange}
              />

              <div className="md:col-span-2 grid grid-cols-2 gap-12">
                <InfoField
                  label="Ngày Sinh"
                  name="NGAYSINH"
                  value={user.NGAYSINH}
                  type="date"
                  isLocked={!isEditing}
                  onChange={handleChange}
                />
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-widest">
                    Giới tính
                  </label>
                  <div className="relative">
                    <select
                      name="GIOITINH"
                      value={user.GIOITINH || "Nam"}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-800 outline-none appearance-none focus:border-[#5D5FEF] transition-all disabled:opacity-60"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                    <img
                      src={Icons.ArrowDrop}
                      alt="drop"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none opacity-30"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <InfoField
                  label="Địa chỉ thường trú"
                  name="DIACHI"
                  value={user.DIACHI}
                  isLocked={!isEditing}
                  onChange={handleChange}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-5 pt-8 animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={handleUpdateProfile}
                  className="w-full py-5 bg-[#5D5FEF] text-white rounded-2xl font-black text-sm hover:shadow-lg transition-all active:scale-95"
                >
                  Lưu thay đổi thông tin
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[30px] p-12 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Đổi mật khẩu bảo mật
              </h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <img
                  src={Icons.Close}
                  alt="close"
                  className="w-7 h-7 opacity-30"
                />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <PasswordField
                label="Mật khẩu hiện tại"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
              />
              <PasswordField
                label="Mật khẩu mới"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="submit"
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm mt-6 hover:bg-black transition-all"
              >
                Cập nhật mật khẩu mới
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TRÍCH XUẤT COMPONENT ---

function InfoField({
  label,
  name,
  value,
  type = "text",
  isLocked = false,
  onChange,
  placeholder = "",
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-widest">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        readOnly={isLocked}
        placeholder={placeholder}
        className={`w-full p-4 rounded-2xl border text-sm font-bold outline-none transition-all ${
          isLocked
            ? "bg-gray-100 border-transparent text-gray-500 cursor-not-allowed"
            : "bg-white border-gray-200 text-gray-800 focus:border-[#5D5FEF]"
        }`}
      />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-gray-400"
      />
    </div>
  );
}

function StatusItem({ label, isDone, Icon }) {
  return (
    <div className="flex justify-between items-center py-1">
      <div className="flex items-center gap-3">
        <img
          src={Icon}
          alt="Icon"
          className={`w-5 h-5 ${isDone ? "opacity-80" : "opacity-20"}`}
        />
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isDone ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
        ></div>
        <span
          className={`text-[10px] font-black uppercase tracking-wider ${isDone ? "text-green-600" : "text-red-500"}`}
        >
          {isDone ? "Hoàn tất" : "Chưa có"}
        </span>
      </div>
    </div>
  );
}

export default Account;
