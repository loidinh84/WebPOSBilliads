import React, { useState } from "react";
import { Link } from "react-router-dom";
import BackgroundLogin from "../assets/images/BackgroundLogin.png";
import * as Icons from "../assets/icons/index";

function Login() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* 1. BÊN TRÁI: Ảnh nền nghệ thuật */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={BackgroundLogin}
          alt="Billiard Art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <Link
          to="/"
          className="absolute top-10 left-10 p-2 hover:bg-white/20 rounded-full transition-all group backdrop-blur-sm"
        >
          <img
            src={Icons.Close}
            alt="Đóng"
            className="w-15 h-15 object-contain invert opacity-80 group-hover:opacity-100 transition-all"
          />
        </Link>
      </div>

      {/* 2. BÊN PHẢI: Form Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-white relative">
        {/* Nút đóng cho Mobile */}
        <Link to="/" className="lg:hidden absolute top-8 right-8 p-2">
          <img src={Icons.Close} alt="Đóng" className="w-15 h-15 opacity-40" />
        </Link>

        <div className="w-full max-w-[500px] space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Đăng Nhập
            </h2>
            <p className="text-gray-500 text-lg">Chào mừng bạn trở lại!</p>
          </div>

          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setIsSetupOpen(true);
            }}
          >
            {/* Tên đăng nhập */}
            <div className="space-y-3">
              <label className="text-base font-bold text-gray-800 ml-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tài khoản của bạn..."
                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none text-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Mật khẩu */}
            <div className="space-y-3 relative">
              <label className="text-base font-bold text-gray-800 ml-2">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none text-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <img
                    src={showPassword ? Icons.EyeOff : Icons.Eye} // Tự động chuyển đổi icon
                    alt="toggle"
                    className="w-7 h-7 object-contain"
                  />
                </button>
              </div>
            </div>

            {/* Duy trì & Quên mật khẩu */}
            <div className="flex items-center justify-between text-sm font-bold px-4 -mt-5">
              <label className="flex items-center gap-3 text-gray-500 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                />
                <span className="group-hover:text-gray-700">
                  Duy trì đăng nhập
                </span>
              </label>
              <a
                href="#"
                className="text-purple-600 hover:underline underline-offset-4"
              >
                Quên mật khẩu?
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4 mt-10">
              <Link to="/" className="flex-1">
                <button
                  type="button"
                  className="w-full py-5 bg-blue-500 text-white rounded-[25px] font-bold text-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  Quay về
                </button>
              </Link>
              <button
                type="submit"
                className="flex-1 py-5 bg-green-600 text-white rounded-[25px] font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODAL THIẾT LẬP --- */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg p-12 rounded-[50px] shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setIsSetupOpen(false)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all group"
            >
              <img
                src={Icons.Close}
                alt="Close"
                className="w-7 h-7 opacity-40 group-hover:opacity-100"
              />
            </button>

            <h3 className="text-3xl font-black text-center mb-10">
              Tạo tài khoản cửa hàng
            </h3>

            <div className="space-y-6">
              <SetupInput
                label="Tên cửa hàng"
                placeholder="Nhập tên cửa hàng của bạn..."
              />
              <SetupInput
                label="Số điện thoại"
                placeholder="Nhập số điện thoại..."
              />
              <SetupInput
                label="Mật khẩu admin"
                type="password"
                placeholder="Nhập mật khẩu..."
              />
              <SetupInput
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu..."
              />

              <Link to="/dashboard">
                <button className="w-full py-5 bg-blue-700 text-white rounded-[25px] font-bold text-xl hover:bg-blue-800 transition-all mt-8 shadow-2xl shadow-blue-200 active:scale-95">
                  Vào cửa hàng ngay
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component SetupInput dùng chung
function SetupInput({ label, type = "text", placeholder }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-2">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <img
              src={show ? Icons.HiddenEye : Icons.Eye}
              alt="toggle"
              className="w-6 h-6 object-contain"
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;
