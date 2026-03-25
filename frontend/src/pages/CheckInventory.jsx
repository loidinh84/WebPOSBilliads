import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import DashboardNav from "../components/DashboardNav";
import * as Icons from "../assets/icons/index";

function CheckInventory() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />
    </div>
  );
}

export default CheckInventory;
