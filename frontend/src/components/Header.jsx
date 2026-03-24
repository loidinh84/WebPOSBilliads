import React, { useState, useEffect } from "react";
import Logo from "../assets/images/Logo.png";
import { Link } from "react-router-dom";

function Header({ primaryColor }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 flex justify-between items-center px-10 lg:px-20 py-4 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-15 w-auto object-contain" />
          <span
            className={`text-xl font-bold ${isScrolled ? "text-gray-800" : "text-gray-900"}`}
          >
            Nhóm Lục Lọi
          </span>
        </Link>
      </div>

      <Link to="/login">
        <button
          style={{ backgroundColor: primaryColor }}
          className="text-white px-8 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          Đăng nhập
        </button>
      </Link>
    </header>
  );
}

export default Header;
