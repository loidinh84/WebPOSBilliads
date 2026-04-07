import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import EmployeeModal from "./Modal";
import axios from "axios";
import Swal from "sweetalert2";

function Salary() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  // Mặc định tháng/năm hiện tại
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });

  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: "", data: null });

  const API_URL = "http://localhost:5000/api/salary";

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/report?month=${month}&year=${year}`,
      );
      setPayrolls(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu lương:", error);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset) => {
    let newMonth = parseInt(month) + offset;
    let newYear = parseInt(year);
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleFinalize = async () => {
    const result = await Swal.fire({
      title: "Chốt lương?",
      text: `Dữ liệu lương Tháng ${month}/${year} sẽ được lưu vào SQL.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${API_URL}/finalize`, { payrolls });
        Swal.fire("Thành công", "Đã chốt bảng lương!", "success");
        fetchPayrolls();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể chốt lương.", "error");
      }
    }
  };

  const filteredPayrolls = (Array.isArray(payrolls) ? payrolls : []).filter(
    (p) => {
      const matchesSearch =
        (p.TENNGUOIDUNG || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (p.MANVIEN || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "Tất cả" || p.TRANGTHAI === selectedStatus;
      return matchesSearch && matchesStatus;
    },
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900 pb-10">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">


            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4 uppercase tracking-wider">
                Trạng thái
              </h3>
              <div className="flex flex-col gap-4">
                {["Tất cả", "Chưa thanh toán", "Đã thanh toán"].map(
                  (status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={selectedStatus === status}
                        onChange={() => setSelectedStatus(status)}
                        className="w-4 h-4 accent-[#5D5FEF]"
                      />
                      <span
                        className={`text-[14px] ${selectedStatus === status ? "text-[#5D5FEF] font-bold" : "text-gray-600"}`}
                      >
                        {status}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Bảng lương {month.toString().padStart(2, "0")}/{year}
              </h2>

              <div className="flex items-center bg-white border border-gray-200 rounded shadow-sm overflow-hidden h-[34px]">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="px-2 hover:bg-gray-50 transition-colors border-r border-gray-200 h-full flex items-center justify-center cursor-pointer"
                >
                  <img src={Icons.ArrowBack} className="w-2.5 h-2.5 opacity-60" alt="prev" />
                </button>
                <div className="px-3 text-[13px] font-bold text-gray-700 min-w-[100px] text-center">
                  Tháng {month}/{year}
                </div>
                <button 
                  onClick={() => changeMonth(1)}
                  className="px-2 hover:bg-gray-50 transition-colors border-l border-gray-200 h-full flex items-center justify-center cursor-pointer"
                >
                  <img src={Icons.ArrowBack} className="w-2.5 h-2.5 opacity-60 rotate-180" alt="next" />
                </button>
              </div>

              <button 
                onClick={() => {
                  setMonth(new Date().getMonth() + 1);
                  setYear(new Date().getFullYear());
                }}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded text-[13px] font-bold transition-all shadow-sm active:scale-95 h-[34px] cursor-pointer"
              >
                Tháng này
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group min-w-[320px]">
                <img
                  src={Icons.Search}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"
                  alt="search"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Theo mã, tên nhân viên"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-[14px] outline-none focus:border-[#5D5FEF]"
                />
              </div>

              <button
                onClick={handleFinalize}
                className="bg-[#5D5FEF] hover:bg-[#4B4DDB] text-white px-5 py-2 rounded-lg flex items-center gap-2 text-[14px] font-bold shadow-md transition-all active:scale-95"
              >
                <span>Chốt lương</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="grid grid-cols-[80px_1fr_120px_100px_130px_130px_130px] bg-gray-50 border-b border-gray-200">
              {[
                "Mã",
                "Tên nhân viên",
                "Kỳ hạn",
                "Tổng giờ",
                "Tổng lương",
                "Còn cần trả",
                "Trạng thái",
              ].map((header, idx) => (
                <div
                  key={idx}
                  className="p-4 text-[13px] font-bold text-gray-600"
                >
                  {header}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="p-20 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            ) : filteredPayrolls.length > 0 ? (
              <div className="flex-1">
                {filteredPayrolls.map((p) => (
                  <div
                    key={p.MALUONG}
                    className="grid grid-cols-[80px_1fr_120px_100px_130px_130px_130px] border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openModal("SALARY", p)}
                  >
                    <div className="p-4 text-[13px] text-gray-500 font-medium">
                      {p.MANVIEN}
                    </div>
                    <div className="p-4 text-[14px] font-bold text-gray-800">
                      {p.TENNGUOIDUNG}
                    </div>
                    <div className="p-4 text-[13px] text-gray-600">
                      {p.KYTRALUONG}
                    </div>
                    <div className="p-4 text-[13px] font-bold text-blue-600">
                      {p.TONGGIOLAM}h
                    </div>
                    <div className="p-4 text-[13px] font-bold text-gray-800">
                      {new Intl.NumberFormat("vi-VN").format(p.TONGLUONG || 0)}đ
                    </div>
                    <div className="p-4 text-[13px] font-bold text-red-500">
                      {new Intl.NumberFormat("vi-VN").format(p.CONCANTRA || 0)}đ
                    </div>
                    <div className="p-4 flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.TRANGTHAI === "Đã thanh toán" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {p.TRANGTHAI || "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center p-20">
                <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-10">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  {Icons.Person ? (
                    <img
                      src={Icons.Person}
                      className="w-10 h-10 opacity-20"
                      alt="no payrolls"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                </div>
                <p className="text-gray-500 font-medium text-[15px] mb-1">
                  Không tìm thấy dữ liệu bảng lương cho kỳ này.
                </p>
                <p className="text-gray-400 text-[14px]">
                  Vui lòng nhấn{" "}
                  <span className="text-[#5D5FEF] font-bold">"Chốt lương"</span>{" "}
                  để tạo mới.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <EmployeeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        data={modal.data}
        onSaveSuccess={fetchPayrolls}
      />
    </div>
  );
}

export default Salary;
