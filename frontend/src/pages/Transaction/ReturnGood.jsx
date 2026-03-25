import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function ReturnGood() {
  return (
    <div>
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Giao dịch" />
    </div>
  );
}

export default ReturnGood;
