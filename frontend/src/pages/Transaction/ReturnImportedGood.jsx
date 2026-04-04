import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function ReturnImportedGood() {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [returnInvoices, setReturnInvoices] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [filterStatuses, setFilterStatuses] = useState([
    "Đã trả hàng",
    "Phiếu tạm",
  ]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const navigate = useNavigate();

  // States dành cho chế độ xuất file hàng loạt
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchReturnInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/return-imports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReturnInvoices(data);
      }
    } catch (error) {
      console.error("Lỗi tải phiếu trả:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnInvoices();
  }, []);

  // --- HÀM IN PHIẾU ---
  const handlePrint = (inv) => {
    const nccDaTra =
      Number(inv.TONGTIEN || 0) -
      Number(inv.GIAMGIA || 0) -
      Number(inv.NCCCANTRA || 0);
    const itemsHtml = inv.items
      ?.map(
        (item) => `
      <tr>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc;">${item.TENHANGHOA}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: center;">${item.SOLUONG}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${Number(item.DONGIATRA).toLocaleString()}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${Number(item.THANHTIEN).toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>In Phiếu Trả Hàng ${inv.MAPHIEUTRAHANGNHAP}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; max-width: 500px; margin: auto; }
            .text-center { text-align: center; } .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2 class="text-center">PHIẾU TRẢ HÀNG NHẬP</h2>
          <p class="text-center">Mã phiếu: ${inv.MAPHIEUTRAHANGNHAP}</p>
          <div class="header">
            <p><b>NCC:</b> ${inv.TENNCC}</p>
            <p><b>Ngày trả:</b> ${new Date(inv.THOIGIAN).toLocaleString("vi-VN")}</p>
            <p><b>Người lập:</b> ${inv.TENNHANVIEN || "Admin"}</p>
          </div>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left;">Tên hàng</th> <th>SL</th> <th style="text-align: right;">Giá trả</th> <th style="text-align: right;">T.Tiền</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top: 20px;">
            <p class="text-right">Tổng tiền hàng: ${Number(inv.TONGTIEN).toLocaleString()} đ</p>
            <p class="text-right">Giảm giá: ${Number(inv.GIAMGIA).toLocaleString()} đ</p>
            <p class="text-right"><b>NCC đã trả: ${nccDaTra.toLocaleString()} đ</b></p>
            <p class="text-right" style="color:red">Còn NCC nợ: ${Number(inv.NCCCANTRA).toLocaleString()} đ</p>
          </div>
          <p class="text-center" style="margin-top: 30px;">--- Cảm ơn Quý khách ---</p>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  // --- HÀM HỦY PHIẾU ---
  const handleCancel = async (id, status) => {
    if (status === "Đã hủy") {
      Swal.fire("Thông báo", "Phiếu này đã được hủy trước đó!", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận hủy?",
      text: `Bạn có chắc chắn muốn hủy phiếu trả ${id}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Đóng",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/return-imports/${id}/cancel`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          setReturnInvoices((prev) =>
            prev.map((inv) =>
              inv.MAPHIEUTRAHANGNHAP === id
                ? { ...inv, TRANGTHAI: "Đã hủy" }
                : inv,
            ),
          );
          Swal.fire("Thành công", "Đã hủy phiếu trả hàng", "success");
        }
      } catch (error) {
        Swal.fire("Lỗi", "Không thể kết nối đến máy chủ", error);
      }
    }
  };

  // --- HÀM XUẤT EXCEL nhiều phiếu ---
  const handleExportExcel = (ids) => {
    const dataToExport = returnInvoices.filter((inv) =>
      ids.includes(inv.MAPHIEUTRAHANGNHAP),
    );

    if (dataToExport.length === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn ít nhất một phiếu!", "info");
      return;
    }

    const excelData = [];

    // 1. Tiêu đề cột (Thêm các cột chi tiết vào đây)
    excelData.push([
      "STT",
      "Mã phiếu trả",
      "Thời gian",
      "Nhà cung cấp",
      "Mã hàng",
      "Tên hàng hóa",
      "Số lượng",
      "Giá nhập (vốn)",
      "Giá trả lại",
      "Thành tiền",
      "Trạng thái",
      "Ghi chú",
    ]);

    let stt = 1;

    // 2. Duyệt qua danh sách các phiếu được chọn
    dataToExport.forEach((inv) => {
      // Kiểm tra xem phiếu có danh sách món hàng (items) không
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item) => {
          excelData.push([
            stt++,
            inv.MAPHIEUTRAHANGNHAP,
            new Date(inv.THOIGIAN).toLocaleString("vi-VN"),
            inv.TENNCC || "---",
            item.MAHANGHOA,
            item.TENHANGHOA,
            item.SOLUONG,
            item.GIANHAPCU,
            item.DONGIATRA,
            item.THANHTIEN,
            inv.TRANGTHAI,
            inv.GHICHU || "",
          ]);
        });
      } else {
        // Trường hợp phiếu không có món hàng nào
        excelData.push([
          stt++,
          inv.MAPHIEUTRAHANGNHAP,
          new Date(inv.THOIGIAN).toLocaleString("vi-VN"),
          inv.TENNCC || "---",
          "",
          "Không có dữ liệu hàng hóa",
          "",
          "",
          "",
          "",
          inv.TRANGTHAI,
          inv.GHICHU || "",
        ]);
      }
    });

    // 3. Tạo và tải file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Chỉnh độ rộng cột cho dễ nhìn
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "ChiTietTraHangLoat");
    XLSX.writeFile(wb, `Bao_cao_tra_hang_chi_tiet_${Date.now()}.xlsx`);

    // 4. Reset trạng thái
    setIsExportMode(false);
    setSelectedIds([]);

    Swal.fire(
      "Thành công",
      `Đã xuất chi tiết ${dataToExport.length} phiếu!`,
      "success",
    );
  };

  // --- HÀM XUẤT EXCEL CHO 1 PHIẾU ---
  const handleExportSingle = (inv) => {
    const excelData = [];

    // 1. Thông tin chung của phiếu
    excelData.push(["THÔNG TIN PHIẾU TRẢ HÀNG NHẬP"]);
    excelData.push(["Mã phiếu:", inv.MAPHIEUTRAHANGNHAP]);
    excelData.push([
      "Thời gian:",
      new Date(inv.THOIGIAN).toLocaleString("vi-VN"),
    ]);
    excelData.push(["Nhà cung cấp:", inv.TENNCC]);
    excelData.push(["Người tạo:", inv.TENNHANVIEN || "Admin"]);
    excelData.push(["Trạng thái:", inv.TRANGTHAI]);
    excelData.push([]); // Dòng trống

    // 2. Tiêu đề bảng hàng hóa
    excelData.push([
      "Mã hàng",
      "Tên hàng hóa",
      "Số lượng",
      "Giá nhập (vốn)",
      "Giá trả lại",
      "Thành tiền",
    ]);

    // 3. Đổ dữ liệu hàng hóa vào
    inv.items?.forEach((item) => {
      excelData.push([
        item.MAHANGHOA,
        item.TENHANGHOA,
        item.SOLUONG,
        item.GIANHAPCU, 
        item.DONGIATRA, 
        item.THANHTIEN,
      ]);
    });

    excelData.push([]); // Dòng trống

    // 4. Phần tổng kết tiền bạc
    const nccDaTra =
      Number(inv.TONGTIEN || 0) -
      Number(inv.GIAMGIA || 0) -
      Number(inv.NCCCANTRA || 0);
    excelData.push(["", "", "", "", "Tổng tiền hàng trả:", inv.TONGTIEN]);
    excelData.push(["", "", "", "", "Giảm giá:", inv.GIAMGIA]);
    excelData.push(["", "", "", "", "NCC đã thanh toán:", nccDaTra]);
    excelData.push(["", "", "", "", "Còn NCC nợ lại:", inv.NCCCANTRA]);

    // Tạo file Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Chỉnh độ rộng cột cho đẹp
    ws["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "ChiTietPhieuTra");
    XLSX.writeFile(wb, `Phieu_Tra_${inv.MAPHIEUTRAHANGNHAP}.xlsx`);

    Swal.fire(
      "Thành công",
      `Đã xuất file cho phiếu ${inv.MAPHIEUTRAHANGNHAP}`,
      "success",
    );
  };

  // Logic lọc dữ liệu
  const filteredInvoices = returnInvoices.filter((inv) => {
    const matchesId = inv.MAPHIEUTRAHANGNHAP.toLowerCase().includes(
      searchId.toLowerCase(),
    );
    const matchesSupplier = (inv.TENNCC || "")
      .toLowerCase()
      .includes(searchSupplier.toLowerCase());
    const matchesStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.TRANGTHAI);
    const matchesItem =
      searchItem === "" ||
      (inv.items &&
        inv.items.some(
          (item) =>
            item.TENHANGHOA.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.MAHANGHOA.toLowerCase().includes(searchItem.toLowerCase()),
        ));

    let matchesTime = true;
    const invoiceDate = new Date(inv.THOIGIAN).toDateString();
    const today = new Date().toDateString();

    if (timeFilter === "today") {
      matchesTime = invoiceDate === today;
    } else if (timeFilter === "custom" && customDate) {
      matchesTime = invoiceDate === new Date(customDate).toDateString();
    }

    return (
      matchesId &&
      matchesSupplier &&
      matchesStatus &&
      matchesItem &&
      matchesTime
    );
  });

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans text-[13px] text-slate-700">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1600px] mx-auto p-6 flex gap-6">
        <aside className="w-[280px] flex-shrink-0 flex flex-col gap-5">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-[15px] text-gray-700 ">
              Tìm kiếm
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Theo mã phiếu trả"
                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo mã hàng hóa"
                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo nhà cung cấp"
                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-[13px] text-slate-500 tracking-wider">
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
                <img
                  src={Icons.Calendar}
                  alt=""
                  className="w-4 h-4 opacity-40"
                />
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

          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-gray-700 text-[13px]">Trạng thái</h3>
            <div className="space-y-2.5">
              {["Phiếu tạm", "Đã trả hàng", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    checked={filterStatuses.includes(st)}
                    onChange={() =>
                      setFilterStatuses((prev) =>
                        prev.includes(st)
                          ? prev.filter((s) => s !== st)
                          : [...prev, st],
                      )
                    }
                  />
                  <span className="group-hover:text-blue-600 transition-colors">
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Phiếu trả hàng nhập
            </h1>
            <div className="flex items-center gap-2">
              {!isExportMode ? (
                <button
                  onClick={() => setIsExportMode(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-[14px] shadow-lg shadow-green-500/20 transition-all cursor-pointer flex gap-1.5 pl-3"
                >
                  <img
                    src={Icons.Export}
                    className="w-5 h-5 brightness-0 invert"
                    alt="xuất file"
                  />{" "}
                  Xuất file
                </button>
              ) : (
                <div className="flex gap-2 animate-in fade-in duration-300">
                  <button
                    onClick={() => {
                      setIsExportMode(false);
                      setSelectedIds([]);
                    }}
                    className="bg-slate-200 cursor-pointer text-slate-700 px-4 py-2 rounded-md font-medium text-[14px] "
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleExportExcel(selectedIds)}
                    disabled={selectedIds.length === 0}
                    className={`${selectedIds.length === 0 ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"} text-white text-[14px] cursor-pointer px-4 py-2 rounded-md font-medium`}
                  >
                    Xác nhận xuất ({selectedIds.length})
                  </button>
                </div>
              )}
              <button
                onClick={() => navigate("/transactions/return-imports/create")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-lg shadow-green-500/20 transition-all cursor-pointer flex gap-1.5 text-[14px] pl-2"
              >
                <img
                  src={Icons.Add}
                  alt="Thêm"
                  className="w-5 h-5 brightness-0 invert"
                />
                Trả hàng nhập
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[13px]  font-bold text-gray-700">
                  {isExportMode && <th className="p-4 w-10"></th>}
                  <th className="p-4 tracking-wider">Mã phiếu</th>
                  <th className="p-4 tracking-wider">Thời gian</th>
                  <th className="p-4 tracking-wider">Nhà cung cấp</th>
                  <th className="p-4 text-right tracking-wider">
                    Tổng tiền trả
                  </th>
                  <th className="p-4 text-right">NCC cần trả</th>
                  <th className="p-4 text-center tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // ===== PHẦN LOADING =====
                  <tr>
                    <td
                      colSpan={isExportMode ? 7 : 6}
                      className="p-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm">
                          Đang tải dữ liệu phiếu trả hàng...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  // ===== PHẦN KHÔNG CÓ DỮ LIỆU =====
                  <tr>
                    <td
                      colSpan={isExportMode ? 7 : 6}
                      className="p-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <p className="font-medium">
                          Không tìm thấy phiếu trả hàng nào
                        </p>
                        <p className="text-sm">
                          Thử thay đổi điều kiện tìm kiếm hoặc thời gian
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isExpanded = expandedRowId === inv.MAPHIEUTRAHANGNHAP;
                    const nccDaTra =
                      Number(inv.TONGTIEN || 0) -
                      Number(inv.GIAMGIA || 0) -
                      Number(inv.NCCCANTRA || 0);
                    return (
                      <React.Fragment key={inv.MAPHIEUTRAHANGNHAP}>
                        <tr
                          onClick={() =>
                            setExpandedRowId(
                              isExpanded ? null : inv.MAPHIEUTRAHANGNHAP,
                            )
                          }
                          className={`cursor-pointer transition-all ${isExpanded ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                        >
                          {isExportMode && (
                            <td
                              className="p-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={selectedIds.includes(
                                  inv.MAPHIEUTRAHANGNHAP,
                                )}
                                onChange={() =>
                                  setSelectedIds((prev) =>
                                    prev.includes(inv.MAPHIEUTRAHANGNHAP)
                                      ? prev.filter(
                                          (id) => id !== inv.MAPHIEUTRAHANGNHAP,
                                        )
                                      : [...prev, inv.MAPHIEUTRAHANGNHAP],
                                  )
                                }
                              />
                            </td>
                          )}
                          <td className="p-4 font-medium  text-gray-700">
                            {inv.MAPHIEUTRAHANGNHAP}
                          </td>
                          <td className="p-4 font-medium  text-gray-700">
                            {new Date(inv.THOIGIAN).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium  text-gray-700">
                            {inv.TENNCC}
                          </td>
                          <td className="p-4 font-medium  text-gray-700 text-right">
                            {Number(inv.TONGTIEN).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium  text-gray-700 text-right">
                            {Number(inv.NCCCANTRA).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium  text-gray-700 text-center">
                            {inv.TRANGTHAI}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={isExportMode ? "7" : "6"}
                              className="p-0 bg-white"
                            >
                              <div className="p-6 border-l-4 border-blue-500 m-2 bg-slate-50 rounded-r-lg">
                                <div className="grid grid-cols-3 gap-x-10 text-sm mb-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between pb-1">
                                      <span className="text-slate-500">
                                        Mã phiếu trả:
                                      </span>{" "}
                                      <b>{inv.MAPHIEUTRAHANGNHAP}</b>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                      <span className="text-slate-500">
                                        Thời gian:
                                      </span>{" "}
                                      <b>
                                        {new Date(
                                          inv.THOIGIAN,
                                        ).toLocaleString()}
                                      </b>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                      <span className="text-slate-500">
                                        Nhà cung cấp:
                                      </span>{" "}
                                      <b className="font-medium">
                                        {inv.TENNCC}
                                      </b>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between pb-1">
                                      <span className="text-slate-500">
                                        Trạng thái:
                                      </span>{" "}
                                      <b>{inv.TRANGTHAI}</b>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                      <span className="text-slate-500">
                                        Người tạo:
                                      </span>{" "}
                                      <b>{inv.TENNHANVIEN || "Admin"}</b>
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex flex-col">
                                    <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-md p-3 text-slate-600 italic shadow-inner">
                                      {inv.items?.[0]?.LYDOTRA || "Lý do..."}
                                    </div>
                                  </div>
                                </div>
                                <table className="w-full border bg-white mb-4 shadow-sm rounded overflow-hidden text-xs">
                                  <thead className="bg-slate-100 uppercase font-bold text-slate-600">
                                    <tr>
                                      <th className="p-2 border text-left">
                                        Mã hàng
                                      </th>
                                      <th className="p-2 border text-left">
                                        Tên hàng
                                      </th>
                                      <th className="p-2 border text-center w-16">
                                        SL
                                      </th>
                                      <th className="p-2 border text-right">
                                        Giá nhập
                                      </th>
                                      <th className="p-2 border text-right">
                                        Giá trả lại
                                      </th>
                                      <th className="p-2 border text-right">
                                        Thành tiền
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.items?.map((item, idx) => (
                                      <tr
                                        key={idx}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="p-2 border font-medium">
                                          {item.MAHANGHOA}
                                        </td>
                                        <td className="p-2 border font-medium">
                                          {item.TENHANGHOA}
                                        </td>
                                        <td className="p-2 border text-center">
                                          {item.SOLUONG}
                                        </td>
                                        <td
                                          className={`p-2 border text-right font-semibold ${Number(item.DONGIATRA) > Number(item.GIANHAPCU) ? "text-orange-600" : "text-blue-600"}`}
                                        >
                                          {Number(
                                            item.GIANHAPCU || 0,
                                          ).toLocaleString()}{" "}
                                        </td>
                                        <td className="p-2 border text-right">
                                          {Number(
                                            item.DONGIATRA,
                                          ).toLocaleString()}
                                        </td>
                                        <td className="p-2 border text-right font-bold">
                                          {Number(
                                            item.THANHTIEN,
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="flex justify-end">
                                  <div className="w-80 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Tổng số lượng:</span>{" "}
                                      <b>
                                        {inv.items?.reduce(
                                          (sum, item) =>
                                            sum + Number(item.SOLUONG || 0),
                                          0,
                                        ) || 0}
                                      </b>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tổng tiền hàng trả:</span>{" "}
                                      <b>
                                        {Number(inv.TONGTIEN).toLocaleString()}{" "}
                                        đ
                                      </b>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                      <span>Giảm giá:</span>{" "}
                                      <b>
                                        {Number(inv.GIAMGIA).toLocaleString()} đ
                                      </b>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>NCC đã trả:</span>{" "}
                                      <b>{nccDaTra.toLocaleString()} đ</b>
                                    </div>
                                    <div className="flex justify-between  font-bold border-t pt-2">
                                      <span>NCC cần trả:</span>{" "}
                                      <span>
                                        {Number(inv.NCCCANTRA).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                      <button
                                        onClick={() => handlePrint(inv)}
                                        className="bg-slate-700 text-white px-4 py-1.5 rounded font-bold hover:bg-slate-800 flex items-center gap-2"
                                      >
                                        <img
                                          src={Icons.Printer}
                                          className="w-4 h-4 invert"
                                          alt=""
                                        />{" "}
                                        In
                                      </button>
                                      <button
                                        onClick={() => handleExportSingle(inv)}
                                        className="flex items-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded font-bold hover:bg-green-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                                      >
                                        <div className="w-4 h-4">
                                          <img
                                            src={Icons.Export}
                                            alt=""
                                            className="w-full h-full filter brightness-0 invert"
                                          />
                                        </div>
                                        Xuất file
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCancel(
                                            inv.MAPHIEUTRAHANGNHAP,
                                            inv.TRANGTHAI,
                                          )
                                        }
                                        className={`px-4 py-1.5 flex gap-1.5 items-center rounded font-bold text-white ${inv.TRANGTHAI === "Đã hủy" ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
                                        disabled={inv.TRANGTHAI === "Đã hủy"}
                                      >
                                        <img
                                          src={Icons.Delete}
                                          alt=""
                                          className="w-4 h-4 filter brightness-0 invert"
                                        />
                                        Hủy phiếu
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ReturnImportedGood;
