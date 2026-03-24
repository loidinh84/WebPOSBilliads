import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Background from "../assets/images/Background.png";
import * as Icons from "../assets/icons/index";
import { Link } from "react-router-dom";

function Landing() {
  const primaryColor = "#5D5FEF";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header primaryColor={primaryColor} />

      {/* --- HERO SECTION --- */}
      <main
        className="relative min-h-screen flex items-center px-10 lg:px-20"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-8">
          <h1 className="text-6xl font-extrabold leading-[1.1]">
            Phần mềm <br /> Quản lý quán{" "}
            <span className="text-primary-purple">Billiards</span>
          </h1>
          <Link to="/login">
            <button
              style={{ backgroundColor: primaryColor }}
              className="text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
            >
              <span className="text-lg font-bold">Vào phần mềm</span>
              <img
                src={Icons.ArrowRight}
                alt="icon"
                className="w-6 h-6 object-contain"
              />
            </button>
          </Link>
        </div>
      </main>

      {/* --- FEATURES SECTION --- */}
      <section className="bg-white py-24 px-10 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Nhóm 1: Cup, Heo, Tick */}
          <div className="space-y-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 leading-snug">
              Phần mềm giúp bạn quản lý dễ dàng và kinh doanh hiệu quả
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard
                icon={Icons.Cafe}
                title="Đơn giản & Dễ sử dụng"
                desc="Giao diện đơn giản, thân thiện với người dùng. Chỉ mất 15 phút làm quen."
                iconCircleBg="bg-yellow-50"
                iconFilter="invert(60%) sepia(80%) saturate(1000%) hue-rotate(15deg) brightness(100%) contrast(105%)"
              />
              <FeatureCard
                icon={Icons.Pig}
                title="Tiết kiệm chi phí và thời gian"
                desc="Cài đặt miễn phí, triển khai, nâng cấp và hỗ trợ nhanh chóng."
                iconCircleBg="bg-pink-50"
                iconFilter="invert(50%) sepia(90%) saturate(2000%) hue-rotate(300deg) brightness(100%) contrast(105%)"
              />
              <FeatureCard
                icon={Icons.Tick}
                title="Cập nhật & Bảo mật"
                desc="Luôn cập nhật những công nghệ mới và kiểm soát bảo mật thường xuyên."
                iconCircleBg="bg-indigo-50"
                iconFilter="invert(40%) sepia(80%) saturate(2000%) hue-rotate(220deg) brightness(100%) contrast(105%)"
              />
            </div>
          </div>

          {/* Nhóm 2: Wifi, Printer, Devices */}
          <div className="space-y-16">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Chúng tôi thiết kế phần mềm riêng biệt cho quán Billiards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard
                icon={Icons.RouterWifi}
                title="Bán hàng mượt mà khi mất kết nối"
                desc="Khi cửa hàng gặp sự cố mất mạng internet, hoạt động bán hàng vẫn diễn ra bình thường. Nhờ công nghệ điện toán đám mây, dữ liệu được lưu giữ và đồng bộ khi kết nối internet hoạt động trở lại."
                iconCircleBg="bg-green-100"
                iconFilter="invert(35%) sepia(93%) saturate(1637%) hue-rotate(101deg) brightness(97%) contrast(101%)"
              />
              <FeatureCard
                icon={Icons.Printer}
                title="Xuất hóa đơn điện tử nhanh chóng"
                desc="Sử dụng máy quét hoặc điện thoại thông minh tìm kiếm hàng hóa có mã vạch giúp kiểm kho nhanh chóng, chính xác, hạn chế tối đa thất thoát sản phẩm."
                iconCircleBg="bg-orange-100"
                iconFilter="invert(60%) sepia(50%) saturate(3000%) hue-rotate(10deg) brightness(100%) contrast(105%)"
              />
              <FeatureCard
                icon={Icons.Devices}
                title="Tích hợp mọi thiết bị phần cứng"
                desc="Phần mềm chạy mượt mà trên mọi nền tảng thiết bị như Mobile, Tablet, Windows, Android hay IOS, đáp ứng trọn vẹn nhu cầu của mọi quy mô quán."
                iconCircleBg="bg-blue-100"
                iconFilter="invert(40%) sepia(80%) saturate(2000%) hue-rotate(190deg) brightness(100%) contrast(105%)"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- FEATURECARD ---
function FeatureCard({
  icon,
  title,
  desc,
  iconCircleBg = "bg-white",
  iconFilter = "",
}) {
  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-50 flex flex-col items-center text-center space-y-6 hover:-translate-y-1 transition-all duration-300 group">
      <div
        className={`w-20 h-20 flex items-center justify-center rounded-full ${iconCircleBg} shadow-inner group-hover:scale-105 transition-transform`}
      >
        <img
          src={icon}
          alt={title}
          className="w-10 h-10 object-contain"
          style={{ filter: iconFilter }}
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default Landing;
