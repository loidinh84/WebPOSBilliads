import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function StaffSetup() {
  return (
    <div>
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />
    </div>
  );
}

export default StaffSetup;
