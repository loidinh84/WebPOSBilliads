import React from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function UserManagement() {
  return (
    <div>
      <DashboardHeader />
      <DashboardNav />
      <div className="p-10">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>
    </div>
  );
}

export default UserManagement;
