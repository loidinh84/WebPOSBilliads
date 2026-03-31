import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardNav from "../components/DashboardNav";
import EditTableModal from "../components/EditTableModal";
import AddTableModal from "../components/AddTableModal";
import * as Icons from "../assets/icons/index";

function Tables() {
  const [tables, setTables] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterArea, setFilterArea] = useState("--Tất cả--");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const filteredTables = tables.filter((table) => {
    const matchesArea =
      filterArea === "--Tất cả--" || table.KHUVUC === filterArea;
    const matchesSearch = table.TENBAN?.toLowerCase().includes(
      searchQuery.toLowerCase(),
    );

    const matchesStatus =
      filterStatus === "Tất cả" ||
      (filterStatus === "Đang hoạt động" &&
        table.TRANGTHAI !== "Ngừng hoạt động") ||
      (filterStatus === "Ngừng hoạt động" &&
        table.TRANGTHAI === "Ngừng hoạt động");

    return matchesArea && matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/tables", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Dữ liệu bàn nhận được:", data);
        setTables(data);
      } else {
        console.error("Lỗi xác thực hoặc không tìm thấy API");
      }
    } catch (err) {
      console.error("Lỗi fetch bàn:", err);
    }
  };

  // Hàm thêm bàn mới
  const handleAddSave = async (newTableData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTableData),
      });

      if (res.ok) {
        alert("Thêm bàn thành công!");
        fetchTables();
        setIsAddModalOpen(false);
      } else {
        const error = await res.json();
        alert("Lỗi: " + error.message);
      }
    } catch (err) {
      console.error("Lỗi thêm bàn:", err);
    }
  };

  // Hàm chỉnh sửa bàn
  const handleEdit = (tableId) => {
    const table = tables.find((t) => t.MABAN === tableId);
    if (table) {
      setEditingTable(table);
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy dữ liệu bàn với mã:", tableId);
    }
  };

  // Hàm lưu chỉnh sửa
  const handleSave = async (editedData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/tables/${editedData.MABAN}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedData),
        },
      );

      if (res.ok) {
        alert("Cập nhật thành công!");
        fetchTables();
        setIsEditModalOpen(false);
        setEditingTable(null);
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
    }
  };

  // Hàm hủy chỉnh sửa
  const handleCancel = () => {
    setIsEditModalOpen(false);
    setEditingTable(null);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
  };

  // Hàm ngừng hoạt động
  const handleDisable = async (tableId) => {
    const table = tables.find((t) => t.MABAN === tableId);
    if (!table) return;

    const updatedData = {
      ...table,
      TRANGTHAI: "Ngừng hoạt động",
    };
    await handleSave(updatedData);
  };

  // Hàm xóa bàn
  const handleDelete = async (MABAN) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bàn ${MABAN}?`)) {
      try {
        const token = localStorage.getItem("token");
        // Gửi đúng MABAN lên URL
        const res = await fetch(`http://localhost:5000/api/tables/${MABAN}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await fetchTables();
          setExpandedRow(null);
          alert("Xóa thành công!");
        }
      } catch (err) {
        console.error("Lỗi xóa bàn:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Bàn" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Thanh bên trái */}
        <div className="space-y-6 md:col-span-1">
          {/* Khu vực */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Khu vực
            </label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option>--Tất cả--</option>
              <option>Tầng trệt</option>
              <option>Lầu 1</option>
              <option>Lầu 2</option>
            </select>
          </div>

          {/* Tìm kiếm */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Theo tên bàn"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Trạng thái */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Trạng thái
            </label>
            <div className="space-y-2 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === "Đang hoạt động"}
                  onChange={() => setFilterStatus("Đang hoạt động")}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Đang hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === "Ngừng hoạt động"}
                  onChange={() => setFilterStatus("Ngừng hoạt động")}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Ngừng hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === "Tất cả"}
                  onChange={() => setFilterStatus("Tất cả")}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Tất cả</span>
              </label>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="bg-white rounded border border-gray-200 shadow-sm md:col-span-3 pb-8">
          {/* Đầu trang */}
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Danh sách bàn
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg"
            >
              <span className="text-lg leading-none">
                <img
                  src={Icons.Add}
                  alt="Thêm bàn"
                  className="w-5 h-5 brightness-0 invert"
                />
              </span>{" "}
              Thêm bàn
            </button>
          </div>

          {/* Bảng */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#EDF2F9] text-gray-700">
                  <th className="py-3 px-6 font-semibold border-b border-t border-gray-200 w-1/4">
                    Tên bàn
                  </th>
                  <th className="py-3 px-6 font-semibold border-b border-t border-gray-200 w-1/4">
                    Ghi chú
                  </th>
                  <th className="py-3 px-6 font-semibold border-b border-t border-gray-200 w-1/4">
                    Giá giờ
                  </th>
                  <th className="py-3 px-6 font-semibold border-b border-t border-gray-200 w-1/4">
                    Khu vực
                  </th>
                  <th className="py-3 px-6 font-semibold border-b border-t border-gray-200 w-1/4">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      Không tìm thấy bàn nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredTables.map((table) => (
                    <React.Fragment key={table.MABAN}>
                      {/* Hàng chính */}
                      <tr
                        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                          expandedRow === table.MABAN ? "bg-[#F5F8FA]" : ""
                        }`}
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === table.MABAN ? null : table.MABAN,
                          )
                        }
                      >
                        {/* 1. Tên bàn */}
                        <td className="py-4 px-6 font-bold text-gray-800">
                          {table.TENBAN}
                        </td>

                        {/* 2. Loại bàn  */}
                        <td className="py-4 px-6 text-gray-600">
                          {table.LOAIBAN || "Chưa xác định"}
                        </td>

                        {/* 3. Giá giờ  */}
                        <td className="py-4 px-6 font-black text-blue-600">
                          {table.GIAGIO
                            ? `${Number(table.GIAGIO).toLocaleString()} đ`
                            : "0 đ"}
                        </td>

                        {/* 4. Khu vực */}
                        <td className="py-4 px-6 text-gray-600">
                          {table.KHUVUC}
                        </td>

                        {/* 5. Trạng thái */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              table.TRANGTHAI === "Trống"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {table.TRANGTHAI}
                          </span>
                        </td>
                      </tr>

                      {/* Nội dung mở rộng */}
                      {expandedRow === table.MABAN && (
                        <tr className="border-b border-gray-200">
                          <td colSpan="4" className="p-0">
                            <div className="bg-white border-x-4 border-l-[#5D5FEF] border-r-transparent py-2">
                              {/* Các tab */}
                              <div className="flex border-b border-gray-200 px-6">
                                <button
                                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] cursor-pointer transition-all hover:scale-105 ${
                                    activeTab === "Thông tin"
                                      ? "border-blue-500 text-blue-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700"
                                  }`}
                                  onClick={() => setActiveTab("Thông tin")}
                                >
                                  Thông tin
                                </button>
                                <button
                                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] cursor-pointer transition-all hover:scale-105 ${
                                    activeTab === "Lịch sử giao dịch"
                                      ? "border-blue-500 text-blue-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700"
                                  }`}
                                  onClick={() =>
                                    setActiveTab("Lịch sử giao dịch")
                                  }
                                >
                                  Lịch sử giao dịch
                                </button>
                              </div>

                              {/* Tab Content: Thông tin */}
                              {activeTab === "Thông tin" && (
                                <div className="p-6">
                                  <div className="max-w-[500px] space-y-4">
                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                      <span className="text-sm text-gray-600">
                                        Tên bàn:
                                      </span>
                                      <div className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50">
                                        {table.name}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                      <span className="text-sm text-gray-600">
                                        Ghi chú:
                                      </span>
                                      <div className="border border-gray-200 rounded px-3 py-1.5 text-sm h-[34px]">
                                        {table.note}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                      <span className="text-sm text-gray-600">
                                        Khu vực:
                                      </span>
                                      <div className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50">
                                        {table.area}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                      <span className="text-sm text-gray-600">
                                        Trạng thái:
                                      </span>
                                      <span className="text-sm text-gray-800 font-medium">
                                        {table.status}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Tác vụ */}
                                  <div className="flex justify-end gap-3 mt-6">
                                    <button
                                      onClick={() => handleEdit(table.MABAN)}
                                      className="bg-[#F59E0B] hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 cursor-pointer transition-all"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                      Chỉnh sửa
                                    </button>
                                    <button
                                      onClick={() => handleDisable(table.id)}
                                      className="bg-[#DC2626] hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 cursor-pointer transition-all"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                      </svg>
                                      Ngừng hoạt động
                                    </button>
                                    <button
                                      onClick={() => handleDelete(table.id)}
                                      className="bg-[#DC2626] hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 cursor-pointer transition-all"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Tab Content: Lịch sử giao dịch */}
                              {activeTab === "Lịch sử giao dịch" && (
                                <div className="p-6 text-sm text-gray-500 text-center">
                                  Chưa có giao dịch nào gần đây.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal chỉnh sửa bàn */}
      {isEditModalOpen && editingTable && (
        <EditTableModal
          isOpen={isEditModalOpen}
          table={editingTable}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={() => handleDelete(editingTable.MABAN)}
        />
      )}

      {/* Modal thêm bàn mới */}
      <AddTableModal
        isOpen={isAddModalOpen}
        onSave={handleAddSave}
        onCancel={handleAddCancel}
      />
    </div>
  );
}

export default Tables;
