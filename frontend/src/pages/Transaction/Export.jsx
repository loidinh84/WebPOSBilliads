import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { useNavigate } from "react-router-dom";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function Export() {
  const navigate = useNavigate();

  const [exportInvoices, setExportInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // States quản lý lọc
  const [searchId, setSearchId] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [filterStatuses, setFilterStatuses] = useState([
    "Hoàn thành",
    "Phiếu tạm",
  ]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isExportMode, setIsExportMode] = useState(false);

  // Fetch dữ liệu
  const fetchExports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/transactions/exports",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setExportInvoices(data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách xuất hủy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleViewDetail = async (invoice) => {
    if (expandedId === invoice.MAXUATHUY) {
      setExpandedId(null);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/transactions/exports/${invoice.MAXUATHUY}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const detailData = await res.json();

        setExportInvoices((prev) =>
          prev.map((inv) =>
            inv.MAXUATHUY === invoice.MAXUATHUY
              ? { ...inv, details: detailData }
              : inv,
          ),
        );

        // Mở rộng dòng này ra
        setExpandedId(invoice.MAXUATHUY);
      } else {
        alert("Không thể lấy chi tiết phiếu!");
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết:", err);
    }
  };

  const getStatusText = (status) => {
    if (status === 0 || status === "Phiếu tạm") return "Phiếu tạm";
    if (status === 1 || status === "Hoàn thành") return "Hoàn thành";
    if (status === 2 || status === "Đã hủy") return "Đã hủy";
    return "Không xác định";
  };

  // ==================== LOGIC LỌC ====================
  const filteredData = exportInvoices.filter((inv) => {
    // 1. Lọc theo mã phiếu
    const matchesId = (inv.MAXUATHUY || "")
      .toLowerCase()
      .includes(searchId.toLowerCase());

    // 2. Lọc theo mã/tên hàng
    const matchesItem = true;

    // 3. Lọc theo trạng thái
    let matchesStatus = true;
    if (filterStatuses.length > 0) {
      const statusText = getStatusText(inv.TRANGTHAI);
      matchesStatus = filterStatuses.includes(statusText);
    }

    // 4. Lọc theo thời gian
    let matchesTime = true;
    if (inv.NGAYXUATHUY) {
      const invDate = new Date(inv.NGAYXUATHUY);

      if (timeFilter === "today") {
        matchesTime = invDate.toDateString() === new Date().toDateString();
      } else if (timeFilter === "custom" && customDate) {
        matchesTime = invDate.toISOString().split("T")[0] === customDate;
      }
    }

    return matchesId && matchesItem && matchesStatus && matchesTime;
  });

  // Toggle trạng thái
  const toggleStatus = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  // ---  Hàm In phiếu ---
  const handlePrint = (invoice) => {
    // 1. Tạo nội dung HTML cho mẫu in
    const printContents = `
    <div style="font-family: Arial; padding: 20px; color: #333;">
      <h2 style="text-align: center; margin-bottom: 5px;">Billiards Lục Lọi</h2>
      <p style="text-align: center; margin-top: 0;">Đồ án Cơ sở - Quản lý Kho</p>
      <hr/>
      <h3 style="text-align: center;">PHIẾU XUẤT HỦY HÀNG HÓA</h3>
      <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
        <tr><td>Mã phiếu: <b>${invoice.MAXUATHUY}</b></td><td style="text-align: right;">Ngày: ${new Date(invoice.NGAYXUATHUY).toLocaleString("vi-VN")}</td></tr>
        <tr><td>Lý do: ${invoice.LYDO || "---"}</td><td style="text-align: right;">Người tạo: ${invoice.NGUOITAO || "Admin"}</td></tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">STT</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Tên hàng</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">SL</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Đơn giá</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.details
            .map(
              (d, i) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${i + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${d.TENHANGHOA}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${d.SOLUONG}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${Number(d.GIATRITHIETHAI).toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(d.SOLUONG * d.GIATRITHIETHAI).toLocaleString()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: right; font-bold: true;"><b>Tổng cộng:</b></td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: red;"><b>${Number(invoice.TONGTIEN).toLocaleString()} đ</b></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

    // 2. Mở cửa sổ in
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>In Phiếu ${invoice.MAXUATHUY}</title></head><body>${printContents}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // --- Hàm Xuất file Excel ---
  const handleExportFile = (invoice) => {
    if (!invoice.details || invoice.details.length === 0) {
      Swal.fire(
        "Lỗi",
        "Phiếu này không có chi tiết hàng hóa để xuất!",
        "error",
      );
      return;
    }

    // 1. Tạo dữ liệu Header phiếu
    const headerData = [
      ["PHIẾU XUẤT HỦY"],
      ["Mã phiếu:", invoice.MAXUATHUY],
      ["Ngày tạo:", new Date(invoice.NGAYXUATHUY).toLocaleString("vi-VN")],
      ["Lý do:", invoice.LYDO || "---"],
      ["Người tạo:", invoice.NGUOITAO || "Admin"],
      [""],
      ["STT", "Mã hàng", "Tên hàng", "Số lượng", "Đơn giá", "Thành tiền"],
    ];

    // 2. Map danh sách hàng hóa
    const itemData = invoice.details.map((d, index) => [
      index + 1,
      d.MAHANGHOA,
      d.TENHANGHOA,
      d.SOLUONG,
      d.GIATRITHIETHAI,
      d.SOLUONG * d.GIATRITHIETHAI,
    ]);

    // 3. Thêm dòng tổng tiền
    const footerData = [["", "", "", "", "TỔNG CỘNG:", invoice.TONGTIEN]];

    // 4. Kết hợp và tạo file
    const fullData = [...headerData, ...itemData, ...footerData];
    const worksheet = XLSX.utils.aoa_to_sheet(fullData);
    const wscols = [
      { wch: 15 },
      { wch: 20 },
      { wch: 17 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chi Tiet Xuat Huy");

    // 5. Tải file về máy
    XLSX.writeFile(workbook, `PhieuXuatHuy_${invoice.MAXUATHUY}.xlsx`);

    Swal.fire("Thành công", "File Excel đã được tải xuống!", "success");
  };

  // Hàm xuất nhiều file
  const handleBulkExport = async () => {
    if (selectedIds.length === 0) {
      Swal.fire(
        "Thông báo",
        "Vui lòng chọn ít nhất một phiếu để xuất file!",
        "info",
      );
      return;
    }

    Swal.fire({
      title: "Đang chuẩn bị dữ liệu...",
      text: "Vui lòng chờ trong giây lát",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");

      // 1. Duyệt qua các ID đã chọn, nếu phiếu nào chưa có details thì đi fetch ngay
      const promises = selectedIds.map(async (id) => {
        const inv = exportInvoices.find((item) => item.MAXUATHUY === id);
        if (!inv.details) {
          const res = await fetch(
            `http://localhost:5000/api/transactions/exports/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const details = await res.json();
            return { ...inv, details };
          }
        }
        return inv;
      });

      const fullDataToExport = await Promise.all(promises);

      // 2. Cấu trúc dữ liệu cho Excel
      const fullRows = [["BÁO CÁO TỔNG HỢP PHIẾU XUẤT HỦY"], []];
      fullDataToExport.forEach((inv, index) => {
        fullRows.push([`PHIẾU #${index + 1}: ${inv.MAXUATHUY}`]);
        fullRows.push([
          "Ngày tạo:",
          new Date(inv.NGAYXUATHUY).toLocaleString("vi-VN"),
        ]);
        fullRows.push(["Lý do:", inv.LYDO || "---"]);
        fullRows.push([
          "STT",
          "Mã hàng",
          "Tên hàng",
          "Số lượng",
          "Đơn giá",
          "Thành tiền",
        ]);

        inv.details?.forEach((d, i) => {
          fullRows.push([
            i + 1,
            d.MAHANGHOA,
            d.TENHANGHOA,
            d.SOLUONG,
            d.GIATRITHIETHAI,
            d.SOLUONG * d.GIATRITHIETHAI,
          ]);
        });
        fullRows.push(["", "", "", "", "TỔNG CỘNG:", inv.TONGTIEN]);
        fullRows.push([]);
        fullRows.push([
          "------------------------------------------------------------",
        ]);
        fullRows.push([]);
      });

      // 3. Tạo và tải file
      const worksheet = XLSX.utils.aoa_to_sheet(fullRows);
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 40 },
        { wch: 10 },
        { wch: 15 },
        { wch: 20 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "TongHopXuatHuy");
      XLSX.writeFile(workbook, `Bao_Cao_Tong_Hop_${new Date().getTime()}.xlsx`);

      Swal.close();
      Swal.fire(
        "Thành công",
        `Đã xuất ${selectedIds.length} phiếu đầy đủ chi tiết!`,
        "success",
      );
      setIsExportMode(false);
      setSelectedIds([]);
    } catch (err) {
      Swal.close();
      Swal.fire("Lỗi", "Có lỗi xảy ra khi lấy chi tiết phiếu!", "error");
      console.error(err);
    }
  };

  // Hàm toggle chọn từng phiếu
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Hàm chọn tất cả các phiếu đang hiển thị
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredData.map((inv) => inv.MAXUATHUY);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // --- 3. Hàm Hủy bỏ phiếu ---
  const handleCancelInvoice = async (invoice) => {
    const result = await Swal.fire({
      title: "Xác nhận hủy phiếu?",
      text: `Phiếu ${invoice.MAXUATHUY} sẽ bị hủy và số lượng hàng sẽ được hoàn lại vào kho.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Bỏ qua",
      confirmButtonText: "Hủy phiếu",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/transactions/exports/cancel/${invoice.MAXUATHUY}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await res.json();

        if (res.ok) {
          Swal.fire(
            "Đã hủy!",
            "Phiếu xuất hủy đã được chuyển sang trạng thái Đã hủy.",
            "success",
          );
          fetchExports();
          setExpandedId(null);
        } else {
          Swal.fire("Lỗi!", data.message || "Không thể hủy phiếu", "error");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Kết nối đến server bị gián đoạn", "error");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans text-[13px] text-slate-700">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-4">
        {/* ==================== SIDEBAR LỌC ==================== */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3">
          {/* Tìm kiếm */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-[15px] text-gray-700">
              Tìm kiếm
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Theo mã phiếu xuất hủy"
                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo mã hoặc tên hàng hóa"
                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
            </div>
          </div>

          {/* Thời gian */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-[11px] text-slate-500 tracking-wider">
              Thời gian
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  checked={timeFilter === "all"}
                  onChange={() => setTimeFilter("all")}
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  Tất cả
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  checked={timeFilter === "today"}
                  onChange={() => setTimeFilter("today")}
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  Hôm nay
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  checked={timeFilter === "custom"}
                  onChange={() => setTimeFilter("custom")}
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  Lựa chọn khác
                </span>
              </label>

              {timeFilter === "custom" && (
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 mt-2 focus:border-blue-500 outline-none text-sm"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3  text-[11px] tracking-wider">
              Trạng thái
            </h3>
            <div className="space-y-2.5">
              {["Phiếu tạm", "Hoàn thành", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    checked={filterStatuses.includes(st)}
                    onChange={() => toggleStatus(st)}
                  />
                  <span className="group-hover:text-blue-600 transition-colors">
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ==================== BẢNG DỮ LIỆU ==================== */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">
              Phiếu xuất hủy
            </h1>
            <div className="flex items-center gap-2">
              {!isExportMode ? (
                <>
                  {/* 1. Nút Xuất file (Khi bấm sẽ hiện checkbox) */}
                  <button
                    onClick={() => setIsExportMode(true)}
                    className="flex items-center gap-2 bg-white border border-[#00a651] text-[#00a651] hover:bg-green-50 font-medium px-4 py-2 rounded shadow-sm transition-all active:scale-95 text-[15px] cursor-pointer"
                  >
                    <img
                      src={Icons.FileExport}
                      className="w-5 h-5"
                      alt="icon xuất"
                    />
                    Xuất file
                  </button>

                  {/* 2. Nút Tạo phiếu */}
                  <button
                    onClick={() => navigate("/transactions/exports/create")}
                    className="flex items-center gap-2 bg-[#00a651] hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow-sm transition-all active:scale-95 text-[15px] cursor-pointer"
                  >
                    <img
                      src={Icons.Add}
                      className="w-6 h-6 brightness-0 invert"
                      alt="icon thêm"
                    />
                    Tạo phiếu
                  </button>
                </>
              ) : (
                /* Chế độ đang chọn phiếu để xuất */
                <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-300">
                  <button
                    onClick={() => {
                      setIsExportMode(false);
                      setSelectedIds([]);
                    }}
                    className="bg-slate-200 cursor-pointer text-slate-700 px-4 py-2 rounded-md font-medium text-[14px] hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleBulkExport}
                    disabled={selectedIds.length === 0}
                    className={`${
                      selectedIds.length === 0
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-500/30"
                    } text-white text-[14px] px-4 py-2 rounded-md font-medium transition-all`}
                  >
                    Xác nhận xuất ({selectedIds.length} phiếu)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white flex flex-col rounded shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  Đang tải dữ liệu...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr className="text-slate-700 text-[13px] font-bold">
                      {isExportMode && (
                        <th className="p-3 w-10 animate-in slide-in-from-left duration-300">
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            onChange={handleSelectAll}
                            checked={
                              selectedIds.length === filteredData.length &&
                              filteredData.length > 0
                            }
                          />
                        </th>
                      )}
                      <th className="p-3">Mã xuất hủy</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3 text-right">Tổng giá trị</th>
                      <th className="p-3">Ghi chú</th>
                      <th className="p-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((invoice) => (
                      <React.Fragment key={invoice.MAXUATHUY}>
                        {/* DÒNG CHÍNH */}
                        <tr
                          onClick={() =>
                            isExportMode
                              ? handleSelectRow(invoice.MAXUATHUY)
                              : handleViewDetail(invoice)
                          }
                          className={`cursor-pointer transition-colors border-b ${
                            expandedId === invoice.MAXUATHUY
                              ? "bg-blue-50/50"
                              : "hover:bg-blue-50/30"
                          }`}
                        >
                          {isExportMode && (
                            <td
                              className="p-3 animate-in slide-in-from-left duration-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={selectedIds.includes(
                                  invoice.MAXUATHUY,
                                )}
                                onChange={() =>
                                  handleSelectRow(invoice.MAXUATHUY)
                                }
                              />
                            </td>
                          )}
                          <td className="p-3 text-blue-600 font-bold">
                            {invoice.MAXUATHUY}
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(invoice.NGAYXUATHUY).toLocaleString(
                              "vi-VN",
                              { hour12: false },
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-700">
                            {Number(invoice.TONGTIEN).toLocaleString()}
                          </td>
                          <td className="p-3 text-slate-400 italic text-[12px]">
                            {invoice.LYDO || "---"}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-0.5 rounded text-[13px] font-bold ">
                              {getStatusText(invoice.TRANGTHAI)}
                            </span>
                          </td>
                        </tr>

                        {/* DÒNG CHI TIẾT */}
                        {expandedId === invoice.MAXUATHUY && (
                          <tr>
                            <td
                              colSpan="5"
                              className="bg-white p-6 border border border-blue-400"
                            >
                              <div className="flex flex-col gap-5 animate-fadeIn">
                                <div className="flex gap-8  text-[14px]">
                                  <div className="pb-2 font-bold text-gray-700">
                                    Thông tin phiếu
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-12 text-[14px]">
                                  {/* Cột 1 */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between border-b border-dashed pb-1">
                                      <span className="text-gray-700 font-medium">
                                        Mã phiếu:
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        {invoice.MAXUATHUY}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed pb-1">
                                      <span className="text-gray-700 font-medium">
                                        Thời gian:
                                      </span>
                                      <span>
                                        {new Date(
                                          invoice.NGAYXUATHUY,
                                        ).toLocaleString("vi-VN")}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Cột 2 */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between border-b border-dashed pb-1">
                                      <span className="text-gray-700 font-medium">
                                        Trạng thái:
                                      </span>
                                      <span className="font-bold  px-2 rounded">
                                        {getStatusText(invoice.TRANGTHAI)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed pb-1">
                                      <span className="text-gray-700 font-medium">
                                        Người tạo:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        {invoice.NGUOITAO}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Cột 3 - Tổng tiền */}
                                  <div className="col-span-1 flex flex-col">
                                    <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-md p-3 text-slate-600 italic shadow-inner">
                                      {invoice.LYDO || "Lý do..."}
                                    </div>
                                  </div>
                                </div>

                                <table className="w-full border bg-white mb-4 shadow-sm rounded overflow-hidden text-xs">
                                  <thead className="bg-slate-100 text-slate-700 text-[13px]">
                                    <tr>
                                      <th className="p-2 border text-left">
                                        Mã hàng
                                      </th>
                                      <th className="p-2 border text-left">
                                        Tên hàng
                                      </th>
                                      <th className="p-2 border text-center">
                                        Số lượng
                                      </th>
                                      <th className="p-2 border text-right">
                                        Giá trị hủy
                                      </th>
                                      <th className="p-2 border text-right">
                                        Thành tiền
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {invoice.details?.map((d, index) => (
                                      <tr
                                        key={index}
                                        className="border-b last:border-0 hover:bg-gray-50"
                                      >
                                        <td className="p-2 border font-medium">
                                          {d.MAHANGHOA}
                                        </td>
                                        <td className="p-2 border font-medium">
                                          {d.TENHANGHOA}
                                        </td>
                                        <td className="p-2 border text-center font-bold">
                                          {d.SOLUONG}
                                        </td>
                                        <td className="p-2 border text-right">
                                          {Number(
                                            d.GIATRITHIETHAI,
                                          ).toLocaleString()}
                                        </td>
                                        <td className="p-2 border text-right font-bold">
                                          {(
                                            d.SOLUONG * d.GIATRITHIETHAI
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                <div className="flex justify-end mt-4 gap-2">
                                  <div className="w-[300px] space-y-3 text-[14px]">
                                    <div className="flex justify-between items-center text-slate-600">
                                      <span>Tổng số lượng:</span>
                                      <span className="font-bold text-slate-800 text-[15px]">
                                        {invoice.details?.reduce(
                                          (sum, d) =>
                                            sum + Number(d.SOLUONG || 0),
                                          0,
                                        )}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center text-slate-600">
                                      <span>Tổng số mặt hàng:</span>
                                      <span className="font-bold text-slate-800 text-[15px]">
                                        {invoice.details?.length || 0}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                                      <span className="font-bold text-slate-700">
                                        Tổng giá trị hủy:
                                      </span>
                                      <span className="font-bold text-gray-700 text-[16px]">
                                        {Number(
                                          invoice.TONGTIEN || 0,
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Cụm nút bấm thao tác */}
                                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                                  <button
                                    onClick={() => handlePrint(invoice)}
                                    className="bg-slate-700 text-white px-4 py-1.5 rounded font-bold hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <img
                                      src={Icons.Printer}
                                      className="w-4 h-4 brightness-0 invert"
                                      alt=""
                                    />
                                    In phiếu
                                  </button>

                                  <button
                                    onClick={() => handleExportFile(invoice)}
                                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded font-bold hover:bg-green-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                                  >
                                    <img
                                      src={Icons.FileExport}
                                      className="w-4 h-4 brightness-0 invert"
                                      alt=""
                                    />
                                    Xuất file
                                  </button>

                                  <button
                                    onClick={() => handleCancelInvoice(invoice)}
                                    className={`px-4 py-1.5 flex gap-1.5 items-center rounded font-bold text-white ${invoice.TRANGTHAI === "Đã hủy" ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
                                    disabled={invoice.TRANGTHAI === "Đã hủy"}
                                  >
                                    <img
                                      src={Icons.Delete}
                                      alt=""
                                      className="w-4 h-4 filter brightness-0 invert"
                                    />
                                    {invoice.TRANGTHAI === 2
                                      ? "Đã hủy"
                                      : "Hủy phiếu"}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {filteredData.length === 0 && !loading && (
                      <tr>
                        <td colSpan="6" className="p-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <img
                              src={Icons.Box}
                              className="w-16 h-16 mb-3 opacity-45"
                              alt=""
                            />
                            <p className="italic">
                              Không tìm thấy phiếu xuất hủy nào phù hợp
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-50 p-3 text-slate-500 font-medium">
              Tổng số phiếu: {filteredData.length}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Export;
