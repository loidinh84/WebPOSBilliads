import React from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function ActionHistory() {
  return (
    <div>
      <DashboardHeader />
      <DashboardNav />
      <div className="p-10">
        <h1 className="text-2xl font-bold">lịch sử thao tác</h1>
      </div>
    </div>
  );
}

export default ActionHistory;
