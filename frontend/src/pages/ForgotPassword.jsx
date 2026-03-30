import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundLogin from "../assets/images/BackgroundLogin.png";

function ForgotPassword() {
  const navigate = useNavigate(); // Hook để chuyển trang
  const [method, setMethod] = useState("email");
  const [inputValue, setInputValue] = useState("");
  const [maskedValue, setMaskedValue] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [hasSentFirstCode, setHasSentFirstCode] = useState(false);
  const [info, setInfo] = useState({ msg: "", type: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const otpBoxRef = useRef([]);

  // Hiển thị thông báo Toast
  const showMessage = (msg, type = "error") => {
    setInfo({ msg, type });
    setTimeout(() => setInfo({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCheckUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [method]: inputValue }),
      });
      const data = await res.json();
      if (data.exists) {
        setMaskedValue(data.maskedValue);
        setStep(2);
      } else {
        showMessage(data.message || "Thông tin không tồn tại!");
      }
    } catch (err) {
      showMessage("Lỗi kết nối server!", err);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpBoxRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpBoxRef.current[index - 1].focus();
    }
  };

  const handleSendOTP = async () => {
    setHasSentFirstCode(true);
    setTimer(60);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, destination: inputValue }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Mã OTP đã được gửi!", "success");
      }
    } catch (error) {
      showMessage("Không thể gửi mã!", error);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      showMessage("Vui lòng nhập đủ 6 số!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: inputValue, code: fullOtp }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Xác thực thành công!", "success");
        setStep(3);
      } else {
        showMessage(data.message);
      }
    } catch (err) {
      showMessage("Lỗi xác thực!", err);
    }
  };

  // Hàm xử lý đổi mật khẩu cuối cùng
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("Mật khẩu phải từ 6 ký tự trở lên!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: inputValue, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(
          "Đổi mật khẩu thành công! Đang quay lại trang đăng nhập...",
          "success",
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showMessage(data.message);
      }
    } catch (err) {
      showMessage("Lỗi server!", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden font-inter">
      {/* ẢNH BÊN TRÁI */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={BackgroundLogin}
          className="absolute inset-0 w-full h-full object-cover"
          alt="bg"
        />
      </div>

      {/* FORM BÊN PHẢI */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative">
        <div className="w-full max-w-[450px] space-y-8">
          {/* THÔNG BÁO TOAST */}
          {info.msg && (
            <div
              className={`fixed top-5 right-5 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 z-50 flex items-center gap-3 border ${
                info.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${info.type === "success" ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="font-bold text-sm">{info.msg}</span>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              {step === 3 ? "Mật khẩu mới" : "Quên mật khẩu?"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {step === 3
                ? "Vui lòng thiết lập mật khẩu an toàn hơn"
                : "Xác thực danh tính để đổi mật khẩu mới"}
            </p>
          </div>

          {/* BƯỚC 1: NHẬP INFO */}
          {step === 1 ? (
            <form
              onSubmit={handleCheckUser}
              className="space-y-6 animate-in fade-in duration-500"
            >
              <div className="flex gap-4 p-1 bg-gray-100 rounded-[20px]">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setInputValue("");
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all ${method === "email" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("phone");
                    setInputValue("");
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all ${method === "phone" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"}`}
                >
                  Số điện thoại
                </button>
              </div>
              <input
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  method === "email" ? "example@gmail.com" : "090*******"
                }
                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none focus:border-purple-500 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="w-full py-5 bg-purple-600 text-white rounded-[25px] font-bold text-lg hover:bg-purple-700 active:scale-95 transition-all"
              >
                Tiếp tục
              </button>
            </form>
          ) : step === 2 ? (
            /* BƯỚC 2: NHẬP OTP */
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="p-8 bg-purple-50 rounded-[30px] border border-purple-100 text-center">
                <p className="text-gray-500 text-sm mb-2 font-medium">
                  Mã sẽ được gửi đến:
                </p>
                <p className="text-purple-700 font-black text-xl">
                  {maskedValue}
                </p>
              </div>

              {!hasSentFirstCode ? (
                <button
                  onClick={handleSendOTP}
                  className="w-full py-5 bg-gray-900 text-white rounded-[25px] font-bold text-lg hover:bg-black transition-all active:scale-95"
                >
                  Gửi mã xác thực ngay
                </button>
              ) : (
                <div className="space-y-6 animate-in zoom-in duration-300">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        ref={(el) => (otpBoxRef.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-2xl text-center text-2xl font-black text-purple-700 bg-gray-50 border-gray-200 outline-none focus:border-purple-500 transition-all"
                      />
                    ))}
                  </div>
                  <div className="text-center h-6">
                    {timer > 0 ? (
                      <p className="text-sm font-bold text-gray-400">
                        Gửi lại mã sau{" "}
                        <span className="text-purple-600">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        className="text-sm font-black text-purple-600 hover:underline"
                      >
                        Gửi lại mã mới
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    className="w-full py-5 bg-green-600 text-white rounded-[25px] font-bold text-lg hover:bg-green-700 active:scale-95 transition-all"
                  >
                    Xác nhận mã
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setStep(1);
                  setHasSentFirstCode(false);
                  setTimer(0);
                  setOtp(new Array(6).fill(""));
                }}
                className="w-full text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                Thay đổi thông tin nhận mã
              </button>
            </div>
          ) : (
            /* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */
            <form
              onSubmit={handleResetPassword}
              className="space-y-6 animate-in slide-in-from-right duration-500"
            >
              <div className="space-y-4">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none focus:border-purple-500 transition-all shadow-sm"
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[25px] outline-none focus:border-purple-500 transition-all shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-[25px] font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
              >
                Cập nhật mật khẩu
              </button>
            </form>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="text-purple-600 font-bold hover:underline underline-offset-4 text-sm"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
