import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import * as Icons from "../assets/icons/index";

function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser
      ? JSON.parse(savedUser)
      : { QUYENHAN: "Chưa rõ", TENDANGNHAP: "" };
  });

  const [headerStoreInfo, setHeaderStoreInfo] = useState({
    tenCuaHang: "Đang tải...",
    anhDaiDien: null,
  });

  const [userProfile, setUserProfile] = useState({
    TENNGUOIDUNG: "",
    HINHANH: null,
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Nhớ đổi port 5000 nếu backend của bạn chạy port khác
        const response = await fetch(
          "http://localhost:5000/api/store-settings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await response.json();

        if (result.success) {
          setHeaderStoreInfo({
            tenCuaHang: result.data.TENCUAHANG || "Tên Cửa Hàng",
            anhDaiDien: result.data.ANHDAIDIEN || null,
          });
        }
      } catch (error) {
        console.error("Lỗi tải thông tin Header:", error);
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = JSON.parse(localStorage.getItem("user"));
        const loginName = savedUser?.TENDANGNHAP || savedUser?.username;

        // A. Kéo dữ liệu Cửa hàng
        const resStore = await fetch(
          "http://localhost:5000/api/store-settings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const resultStore = await resStore.json();
        if (resultStore.success) {
          setHeaderStoreInfo({
            tenCuaHang: resultStore.data.TENCUAHANG || "Tên Cửa Hàng",
            anhDaiDien: resultStore.data.ANHDAIDIEN || null,
          });
        }

        // B. Kéo dữ liệu Profile User hiện tại (MỚI THÊM)
        if (loginName) {
          const resUser = await fetch(
            `http://localhost:5000/api/user/profile/${loginName}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const dataUser = await resUser.json();
          if (dataUser) {
            setUserProfile({
              TENNGUOIDUNG: dataUser.TENNGUOIDUNG || dataUser.TENDANGNHAP,
              HINHANH: dataUser.HINHANH || null,
            });
          }
        }
      } catch (error) {
        console.error("Lỗi tải thông tin Header:", error);
      }
    };

    fetchHeaderData();
  }, []);

  // LOGIC ĐIỀU HƯỚNG CHUẨN
  useEffect(() => {
    if (!userInfo || userInfo.QUYENHAN === "Chưa rõ") {
      navigate("/login");
      return;
    }

    const userRole = userInfo.QUYENHAN ? userInfo.QUYENHAN.toLowerCase() : "";

    if (location.pathname === "/dashboard" || location.pathname === "/") {
      if (userRole === "nhà bếp") {
        navigate("/kitchen");
      } else if (userRole === "thu ngân") {
        navigate("/cashier");
      }
    }
  }, [userInfo.QUYENHAN, navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full z-50 relative">
      <div className="flex justify-between items-center px-6 lg:px-12 py-4">
        {/* Bên trái: Logo và Tên cửa hàng */}
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          {headerStoreInfo.anhDaiDien ? (
            <img
              src={headerStoreInfo.anhDaiDien}
              alt="Logo Cửa Hàng"
              className="h-12 w-12 object-cover rounded-full"
            />
          ) : (
            <img
              src={Logo}
              alt="Logo Mặc Định"
              className="h-10 w-auto object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-[#5D5FEF] tracking-tight ">
            {headerStoreInfo.tenCuaHang}
          </h1>
        </div>

        {/* Bên phải: Các công cụ và Tài khoản */}
        <div className="flex items-center gap-10 text-base font-semibold text-gray-600">
          {/* Nút Thanh toán: Chỉ Thu ngân, Quản lý, Admin thấy */}
          {["Admin", "Quản lý", "Thu ngân", "Nhà bếp"].includes(
            userInfo.QUYENHAN,
          ) && (
            <div
              onClick={() => navigate("/cashier")}
              className="cursor-pointer hover:text-[#5D5FEF] transition-colors"
            >
              Thanh toán
            </div>
          )}

          {/* Nút Thiết lập: */}
          {userInfo.QUYENHAN === "Admin" && (
            <div className="relative group">
              <button className="flex items-center cursor-pointer gap-2 hover:text-[#5D5FEF] py-2">
                <img
                  src={Icons.Setting}
                  alt="Setting"
                  className="w-5 object-contain"
                />
                Thiết lập
              </button>

              {/* Dropdown Menu của Thiết lập */}
              <div className="absolute right-0 top-full w-56 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden translate-y-2 group-hover:translate-y-0 ">
                <button
                  onClick={() => navigate("/settings/store")}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] font-bold transition-colors text-[14px] border-b border-gray-50 cursor-pointer"
                >
                  Thiết lập cửa hàng
                </button>
                <button
                  onClick={() => navigate("/settings/users")}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] font-bold transition-colors text-[14px] border-b border-gray-50 cursor-pointer"
                >
                  Quản lý người dùng
                </button>
                <button
                  onClick={() => navigate("/settings/print-templates")}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] font-bold transition-colors text-[14px] border-b border-gray-50 cursor-pointer"
                >
                  Quản lý mẫu in
                </button>
                <button
                  onClick={() => navigate("/settings/discount")}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] font-bold transition-colors text-[14px] border-b border-gray-50 cursor-pointer"
                >
                  Quản lý KM
                </button>
                <button
                  onClick={() => navigate("/settings/history")}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] font-bold transition-colors text-[14px] cursor-pointer"
                >
                  Lịch sử thao tác
                </button>
              </div>
            </div>
          )}

          {/* CỤM TÀI KHOẢN & ĐĂNG XUẤT */}
          <div className="relative group">
            <div className="flex items-center gap-3 bg-gray-100 px-5 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-all">
              <img
                src={userProfile.HINHANH || Icons.User}
                alt="Avatar"
                className="w-8 h-8 object-cover rounded-full"
              />
              <span className="text-gray-700 font-bold">
                {userProfile.TENNGUOIDUNG || userInfo.TENDANGNHAP}
              </span>
            </div>

            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden translate-y-2 group-hover:translate-y-0 ">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="text-[12px] text-gray-500 font-medium">Vai trò</p>
                <p className="font-bold text-[#5D5FEF] text-[14px]">
                  {userInfo.QUYENHAN}
                </p>
              </div>

              <button
                onClick={() => navigate("/account")}
                className="w-full text-left px-4 py-3.5 text-gray-700 hover:bg-gray-100 font-bold transition-colors text-[14px] cursor-pointer"
              >
                Thông tin tài khoản
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3.5 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-colors text-[14px] cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
