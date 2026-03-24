import React from "react";
import Logo from "../assets/images/Logo.png";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#002B5B] text-white pt-16 px-10 lg:px-20 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <img
              src={Logo}
              alt="Logo"
              className="h-12 w-auto brightness-0 invert"
            />
            <span className="text-xl font-bold">Nhóm Lục Lọi</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Địa chỉ: Khu Công nghệ cao XLHN, Hiệp Phú, <br />
            Thủ Đức, Thành Phố Hồ Chí Minh
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-green-400 mb-1">Tư vấn bán hàng</h4>
          <p className="text-lg">038 8346 580</p>
          <h4 className="font-bold text-green-400 mb-1">Chăm sóc khách hàng</h4>
          <p className="text-lg">034 2675 774</p>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="hover:text-white cursor-pointer">
              Hướng dẫn sử dụng
            </li>
            <li className="hover:text-white cursor-pointer">
              Thông tin cập nhật
            </li>
          </ul>
          <div className="flex gap-6 text-3xl">
            <FaTiktok className="cursor-pointer hover:text-gray-400 transition-all" />
            <FaFacebook className="cursor-pointer hover:text-blue-400 transition-all" />
            <FaInstagram className="cursor-pointer hover:text-pink-400 transition-all" />
          </div>
        </div>
      </div>
      <div className="py-8 border-t border-gray-700 text-center text-sm text-gray-400">
        © Copyright 2026. All Rights Reserved by Nhóm Lục Lọi.
      </div>
    </footer>
  );
}

export default Footer;
