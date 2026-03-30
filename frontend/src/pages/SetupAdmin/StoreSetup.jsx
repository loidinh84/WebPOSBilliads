import React from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function StoreSetup() {
  return (
    <div>
      <DashboardHeader />
      <DashboardNav />
      <div className="p-10">
        <h1 className="text-2xl font-bold">Thiết lập cửa hàng</h1>
      </div>
    </div>
  );
}

export default StoreSetup;
