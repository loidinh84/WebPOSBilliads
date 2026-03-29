import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundLogin from "../assets/images/BackgroundLogin.png";
import * as Icons from "../assets/icons/index";

function Login() {
  const navigate = useNavigate();

  // 1. Các State cũ của bạn
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. State quản lý Đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 3. THÊM MỚI: State để hứng tên cửa hàng trong Modal Setup
  const [tempStoreName, setTempStoreName] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        const savedStoreName = localStorage.getItem("storeName");

        if (data.user.QUYENHAN === "Quản lý" && !savedStoreName) {
          setIsSetupOpen(true);
        } else {
          navigate("/dashboard");
        }
      } else {
        setErrorMessage(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      setErrorMessage("Không thể kết nối đến máy chủ!", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Hàm xử lý khi bấm nút "Vào cửa hàng ngay"
  const handleFinalSetup = () => {
    if (tempStoreName.trim() !== "") {
      // Lưu tên cửa hàng vào LocalStorage
      localStorage.setItem("storeName", tempStoreName);
    }
    setIsSetupOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* ---  Ảnh nền  --- */}
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

      {/* --- Form Đăng nhập --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-white relative">
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

          <form className="space-y-8" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-[20px] text-sm font-semibold border border-red-100 text-center">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-base font-bold text-gray-800 ml-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tài khoản của bạn..."
                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none text-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-3 relative">
              <label className="text-base font-bold text-gray-800 ml-2">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none text-lg focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <img
                    src={showPassword ? Icons.HiddenEye : Icons.Eye}
                    alt="toggle"
                    className="w-7 h-7 object-contain"
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold px-4 -mt-5">
              <label className="flex items-center gap-3 text-gray-500 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                />
                <span className="group-hover:text-gray-700">
                  Duy trì đăng nhập
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-purple-600 hover:underline underline-offset-4"
              >
                Quên mật khẩu?
              </button>
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
                disabled={isLoading}
                className={`flex-1 py-5 text-white rounded-[25px] font-bold text-lg transition-all shadow-lg shadow-green-100 active:scale-95 ${
                  isLoading
                    ? "bg-green-400 cursor-wait"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
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
                value={tempStoreName}
                onChange={(e) => setTempStoreName(e.target.value)}
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

              <button
                onClick={handleFinalSetup}
                className="w-full py-5 bg-blue-700 text-white rounded-[25px] font-bold text-xl hover:bg-blue-800 transition-all mt-8 shadow-2xl shadow-blue-200 active:scale-95"
              >
                Vào cửa hàng ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component SetupInput dùng chung
function SetupInput({ label, type = "text", placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-2">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
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
