import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

function Import() {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [activeTab, setActiveTab] = useState("Thông tin");
  const navigate = useNavigate();

  // States quản lý dữ liệu
  const [imports, setImports] = useState([]);
  const [importDetails, setImportDetails] = useState({});

  // States lọc & phân trang
  const [searchId, setSearchId] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Đã nhập hàng"]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const importsPerPage = 10;
  const [selectedImportIds, setSelectedImportIds] = useState([]);
  const [isExportMode, setIsExportMode] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  const fetchImports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/imports/details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setImports(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
    }
  };

  useEffect(() => {
    fetchImports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (expandedRowId && !importDetails[expandedRowId]) {
      const fetchItems = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/api/imports/${expandedRowId}/items`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            setImportDetails((prev) => ({ ...prev, [expandedRowId]: data }));
          }
        } catch (error) {
          console.error("Lỗi tải chi tiết:", error);
        }
      };
      fetchItems();
    }
  }, [expandedRowId, importDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchId, searchSupplier, filterStatuses, timeFilter, customDate]);

  // Hàm xử lý đóng/mở dòng
  const toggleRow = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };


  const toggleStatusFilter = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  // Hàm Format Giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "---";
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${d.toLocaleDateString("vi-VN")}`;
  };

  // --- 1. HÀM HỦY PHIẾU NHẬP ---
  const handleCancel = async (id, status) => {
    if (status === "Đã hủy") {
      Swal.fire({
        icon: "info",
        title: "Thông báo",
        text: "Phiếu nhập này đã bị hủy từ trước!",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Xác nhận hủy phiếu nhập ${id}?`,
      text: "Dữ liệu vẫn được giữ lại trên hệ thống để đối soát.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Hủy phiếu nhập",
      cancelButtonText: "Đóng",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/imports/${id}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        if (res.ok && data.success) {
          setImports(
            imports.map((inv) =>
              inv.MAPHIEUNHAP === id ? { ...inv, TRANGTHAI: "Đã hủy" } : inv,
            ),
          );
          Swal.fire({
            icon: "success",
            title: "Đã hủy thành công!",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("Lỗi", "Lỗi: " + data.message, "error");
        }
      } catch (error) {
        Swal.fire("Lỗi mạng", "Không kết nối được server!", error);
      }
    }
  };

  // --- 2. HÀM IN PHIẾU NHẬP ---
  const handlePrint = (inv) => {
    if (!importDetails[inv.MAPHIEUNHAP]) {
      Swal.fire({
        icon: "info",
        title: "Đang tải",
        text: "Vui lòng chờ chi tiết hàng hóa tải xong...",
      });
      return;
    }

    const tienDaTra = (inv.TONGTIEN || 0) - (inv.CANTRANCC || 0);
    const itemsHtml = importDetails[inv.MAPHIEUNHAP]
      .map(
        (item) => `
      <tr>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc;">${item.TENHANGHOA}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: center;">${item.SOLUONGNHAP}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${item.DONGIA.toLocaleString()}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${item.THANHTIEN.toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>In Phiếu Nhập ${inv.MAPHIEUNHAP}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 450px; margin: auto; }
            .text-center { text-align: center; } .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2 class="text-center">PHIẾU NHẬP KHO</h2>
          <p class="text-center">-------------------------</p>
          <p><b>Mã Phiếu:</b> ${inv.MAPHIEUNHAP}</p>
          <p><b>Nhà Cung Cấp:</b> ${inv.TENNCC || "---"}</p>
          <p><b>Ngày Nhập:</b> ${formatDateTime(inv.THOIGIAN)}</p>
          <p><b>Người Nhập:</b> ${inv.TENNHANVIEN || "Admin"}</p>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left;">Món</th> <th>SL</th>
                <th style="text-align: right;">Đơn giá</th> <th style="text-align: right;">T.Tiền</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 class="text-right">TỔNG TIỀN: ${Number(inv.TONGTIEN || 0).toLocaleString()} VNĐ</h3>
          <p class="text-right">Giảm giá: ${Number(inv.GIAMGIA || 0).toLocaleString()} VNĐ</p>
          <p class="text-right">Đã trả NCC: ${tienDaTra.toLocaleString()} VNĐ</p>
          <h3 class="text-right" style="color:red">CÒN NỢ: ${Number(inv.CANTRANCC || 0).toLocaleString()} VNĐ</h3>
          <br/><br/>
          <p class="text-center">Người giao hàng &emsp;&emsp;&emsp; Người nhận hàng</p>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // --- 3. HÀM XUẤT EXCEL ---
  const handleExportExcel = (inv) => {
    if (!importDetails[inv.MAPHIEUNHAP]) {
      Swal.fire({
        icon: "info",
        title: "Đang tải",
        text: "Vui lòng chờ chi tiết hàng hóa tải xong...",
      });
      return;
    }

    const tienDaTra = (inv.TONGTIEN || 0) - (inv.CANTRANCC || 0);
    const excelData = [
      ["THÔNG TIN PHIẾU NHẬP KHO"],
      ["Mã phiếu nhập:", inv.MAPHIEUNHAP],
      ["Nhà cung cấp:", inv.TENNCC || "---"],
      ["Người nhập:", inv.TENNHANVIEN || "Admin"],
      ["Thời gian:", formatDateTime(inv.THOIGIAN)],
      ["Trạng thái:", inv.TRANGTHAI],
      ["Ghi chú:", inv.GHICHU || ""],
      [], // Dòng trống
      ["CHI TIẾT HÀNG HÓA"],
      [
        "Mã Hàng",
        "Tên Hàng",
        "Số Lượng",
        "Đơn Giá Nhập",
        "Giảm Giá",
        "Thành Tiền",
      ],
    ];

    importDetails[inv.MAPHIEUNHAP].forEach((item) => {
      excelData.push([
        item.MAHANGHOA,
        item.TENHANGHOA,
        item.SOLUONGNHAP,
        item.DONGIA,
        item.GIAMGIA,
        item.THANHTIEN,
      ]);
    });

    excelData.push([]);
    excelData.push(["TỔNG KẾT"]);
    excelData.push(["Tổng số lượng món:", inv.SOLUONG]);
    excelData.push(["Tổng tiền hàng:", inv.TONGTIEN]);
    excelData.push(["Giảm giá phiếu nhập:", inv.GIAMGIA]);
    excelData.push(["Tiền đã trả NCC:", tienDaTra]);
    excelData.push(["Còn cần trả NCC:", inv.CANTRANCC]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "ChiTietNhapKho");
    XLSX.writeFile(wb, `PhieuNhap_${inv.MAPHIEUNHAP}.xlsx`);
  };

  // --- 4. HÀM XUẤT EXCEL HÀNG LOẠT ---
  const handleExportBatchExcel = () => {
    if (selectedImportIds.length === 0) {
      Swal.fire(
        "Thông báo",
        "Vui lòng chọn ít nhất một phiếu để xuất file!",
        "info",
      );
      return;
    }

    const excelData = [];

    // Tiêu đề cột
    excelData.push([
      "STT",
      "Mã phiếu",
      "Thời gian",
      "Nhà cung cấp",
      "Mã hàng",
      "Tên hàng hóa",
      "Số lượng",
      "Đơn giá",
      "Thành tiền",
      "Trạng thái",
      "Ghi chú",
    ]);

    let stt = 1;
    selectedImportIds.forEach((maPhieu) => {
      const inv = imports.find((item) => item.MAPHIEUNHAP === maPhieu);

      // Lấy trực tiếp từ mảng Details mà Backend vừa trả về
      const details = inv.Details || [];

      if (details.length > 0) {
        details.forEach((product) => {
          excelData.push([
            stt++,
            inv.MAPHIEUNHAP,
            formatDateTime(inv.THOIGIAN),
            inv.TENNCC || "---",
            product.MAHANGHOA,
            product.TENHANGHOA,
            product.SOLUONGNHAP,
            product.DONGIA,
            product.THANHTIEN,
            inv.TRANGTHAI,
            inv.GHICHU || "",
          ]);
        });
      } else {
        excelData.push([
          stt++,
          inv.MAPHIEUNHAP,
          formatDateTime(inv.THOIGIAN),
          inv.TENNCC || "---",
          "",
          "Không có dữ liệu hàng hóa",
          "",
          "",
          "",
          inv.TRANGTHAI,
          inv.GHICHU || "",
        ]);
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Chỉnh độ rộng cột
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "ChiTietXuatKho");
    XLSX.writeFile(wb, `Bao_cao_nhap_hang_chi_tiet_${Date.now()}.xlsx`);

    Swal.fire("Thành công", `Đã xuất chi tiết các phiếu được chọn!`, "success");
    setIsExportMode(false); // Xong thì đóng chế độ chọn
    setSelectedImportIds([]);
  };

  // LOGIC LỌC DỮ LIỆU
  const filteredImports = imports.filter((inv) => {
    const matchId = inv.MAPHIEUNHAP.toLowerCase().includes(
      searchId.toLowerCase(),
    );
    const supplierName = inv.TENNCC || "";
    const matchSupplier = supplierName
      .toLowerCase()
      .includes(searchSupplier.toLowerCase());
    const matchProduct =
      searchProduct === "" ||
      (inv.Details &&
        inv.Details.some(
          (item) =>
            item.TENHANGHOA.toLowerCase().includes(
              searchProduct.toLowerCase(),
            ) ||
            item.MAHANGHOA.toLowerCase().includes(searchProduct.toLowerCase()),
        ));

    const matchStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.TRANGTHAI);

    let matchTime = true;
    if (timeFilter === "today") {
      matchTime = inv.THOIGIAN
        ? new Date(inv.THOIGIAN).toDateString() === new Date().toDateString()
        : false;
    } else if (timeFilter === "custom" && customDate) {
      matchTime = inv.THOIGIAN
        ? new Date(inv.THOIGIAN).toDateString() ===
          new Date(customDate).toDateString()
        : false;
    }

    return matchId && matchSupplier && matchStatus && matchTime && matchProduct;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredImports.length / importsPerPage);
  const indexOfLastImport = currentPage * importsPerPage;
  const indexOfFirstImport = indexOfLastImport - importsPerPage;
  const currentImports = filteredImports.slice(
    indexOfFirstImport,
    indexOfLastImport,
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-black">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1440px] mx-auto p-4 flex gap-4">
        {/* ---------------- CỘT TRÁI: SIDEBAR LỌC ---------------- */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-[12px]">
              Tìm kiếm
            </h3>
            <div className="space-y-3">
              {/* Ô 1: Tìm theo Mã phiếu - Giữ nguyên searchId */}
              <input
                type="text"
                placeholder="Theo mã phiếu nhập"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
              />

              {/* Ô 2: Tìm theo Hàng hóa - Đổi sang searchProduct */}
              <input
                type="text"
                placeholder="Theo mã, tên hàng"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
              />

              {/* Ô 3: Tìm theo Nhà cung cấp - Giữ nguyên searchSupplier */}
              <input
                type="text"
                placeholder="Theo mã, tên NCC"
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-[12px]">
              Thời gian
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  checked={timeFilter === "all"}
                  onChange={() => setTimeFilter("all")}
                />
                Tất cả
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  checked={timeFilter === "today"}
                  onChange={() => setTimeFilter("today")}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                Hôm nay
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  checked={timeFilter === "custom"}
                  onChange={() => setTimeFilter("custom")}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                Lựa chọn khác
                <img
                  src={Icons.Calendar}
                  alt="Lịch"
                  className="w-5 h-5 brightness-0 invert"
                />
              </label>
              {timeFilter === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 mt-2"
                />
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-[12px]">
              Trạng thái
            </h3>
            <div className="space-y-2">
              {["Phiếu tạm", "Đã nhập hàng", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filterStatuses.includes(st)}
                    onChange={() => toggleStatusFilter(st)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- CỘT PHẢI: NỘI DUNG CHÍNH ---------------- */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Phiếu nhập hàng
            </h1>
            <div className="flex items-center gap-2">
              {!isExportMode ? (
                // Chế độ bình thường: Bấm để hiện Checkbox
                <button
                  onClick={() => setIsExportMode(true)}
                  className="flex items-center gap-1 bg-[#4CAF50] text-white px-3 py-1.5 rounded font-semibold hover:bg-green-600 transition-colors shadow-sm cursor-pointer"
                >
                  <img
                    src={Icons.Export}
                    alt=""
                    className="w-6 h-6 brightness-0 invert"
                  />
                  Xuất file
                </button>
              ) : (
                // Chế độ Export: Hiện nút Xác nhận và Hủy
                <div className="flex items-center gap-2 animate-fade-in">
                  <button
                    onClick={() => {
                      setIsExportMode(false);
                      setSelectedImportIds([]);
                    }}
                    className="bg-gray-500 text-white px-3 py-1.5 rounded font-semibold hover:bg-gray-600 cursor-pointer"
                  >
                    Hủy chọn
                  </button>
                  <button
                    onClick={handleExportBatchExcel}
                    disabled={selectedImportIds.length === 0}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Xác nhận xuất ({selectedImportIds.length})
                  </button>
                </div>
              )}

              {/* Nút Nhập file */}
              <button
                onClick={() => navigate("/import/create")}
                className="flex items-center gap-1 bg-[#4CAF50] text-white px-3 py-1.5 rounded font-semibold hover:bg-green-600 transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                <img
                  src={Icons.Add}
                  alt="Nhập file"
                  className="w-6 h-6 brightness-0 invert"
                />
                Nhập hàng
              </button>
            </div>
          </div>

          <div className="bg-white flex flex-col rounded shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f4f6f8] sticky top-0 z-10 border-b border-gray-200 whitespace-nowrap">
                  <tr>
                    {isExportMode && (
                      <th className="p-3 w-10 animate-fade-in">
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allIds = currentImports.map(
                                (item) => item.MAPHIEUNHAP,
                              );
                              setSelectedImportIds(allIds);
                            } else {
                              setSelectedImportIds([]);
                            }
                          }}
                          checked={
                            selectedImportIds.length ===
                              currentImports.length && currentImports.length > 0
                          }
                        />
                      </th>
                    )}
                    <th className="p-3 font-semibold text-gray-700 w-1/5">
                      Mã nhập hàng
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">
                      Thời gian
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">
                      Nhà cung cấp
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5 text-right">
                      Cần trả NCC
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5 text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentImports.map((inv) => {
                    const isExpanded = expandedRowId === inv.MAPHIEUNHAP;
                    const tienDaTra =
                      (inv.TONGTIEN || 0) - (inv.CANTRANCC || 0);
                    return (
                      <React.Fragment key={inv.MAPHIEUNHAP}>
                        <tr
                          onClick={() => toggleRow(inv.MAPHIEUNHAP)}
                          className={`cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                            isExpanded ? "bg-blue-50/30" : ""
                          }`}
                        >
                          {isExportMode && (
                            <td
                              className="p-3 text-center animate-fade-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={selectedImportIds.includes(
                                  inv.MAPHIEUNHAP,
                                )}
                                onChange={() => {
                                  if (
                                    selectedImportIds.includes(inv.MAPHIEUNHAP)
                                  ) {
                                    setSelectedImportIds(
                                      selectedImportIds.filter(
                                        (id) => id !== inv.MAPHIEUNHAP,
                                      ),
                                    );
                                  } else {
                                    setSelectedImportIds([
                                      ...selectedImportIds,
                                      inv.MAPHIEUNHAP,
                                    ]);
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td className="p-3 font-medium text-gray-800">
                            {inv.MAPHIEUNHAP}
                          </td>
                          <td className="p-3">
                            {formatDateTime(inv.THOIGIAN)}
                          </td>
                          <td className="p-3">{inv.TENNCC || "---"}</td>
                          <td className="p-3 text-right font-medium">
                            {Number(inv.CANTRANCC || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-center">{inv.TRANGTHAI}</td>
                        </tr>

                        {/* Dòng chi tiết */}
                        {isExpanded && (
                          <tr className="border-b-2 border-blue-200 bg-white">
                            <td
                              colSpan={isExportMode ? "6" : "5"}
                              className="p-0"
                            >
                              <div className="p-4 border-l-4 border-blue-500">
                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-gray-200 mb-4">
                                  <button
                                    onClick={() => setActiveTab("Thông tin")}
                                    className={`pb-2 font-medium cursor-pointer ${
                                      activeTab === "Thông tin"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Thông tin
                                  </button>
                                </div>

                                {/* Thông tin chung */}
                                <div className="grid grid-cols-3 gap-6 mb-6">
                                  <div className="col-span-2 grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="flex">
                                      <span className="w-28 text-gray-500">
                                        Mã phiếu nhập:
                                      </span>
                                      <span className="font-semibold">
                                        {inv.MAPHIEUNHAP}
                                      </span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-24 text-gray-500">
                                        Trạng thái:
                                      </span>
                                      <span>{inv.TRANGTHAI}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-28 text-gray-500">
                                        Thời gian:
                                      </span>
                                      <div className="flex items-center border border-gray-300 rounded px-2 py-0.5 bg-white">
                                        <span>
                                          {formatDateTime(inv.THOIGIAN)}
                                        </span>
                                        <img
                                          src={Icons.Calendar}
                                          alt=""
                                          className="w-3 h-3 ml-2 opacity-50 filter brightness-0"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <span className="w-24 text-gray-500">
                                        Người nhập:
                                      </span>
                                      <span>{inv.TENNHANVIEN || "Admin"}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-28 text-gray-500">
                                        Nhà cung cấp:
                                      </span>
                                      <span className="text-blue-600 cursor-pointer">
                                        {inv.TENNCC || "---"}
                                      </span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-24 text-gray-500">
                                        Người tạo:
                                      </span>
                                      <span className="font-semibold">
                                        {inv.TENNHANVIEN || "Admin"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="col-span-1">
                                    <textarea
                                      value={inv.GHICHU || ""}
                                      className="w-full h-full min-h-[80px] border border-gray-300 rounded p-2 text-gray-600 resize-none focus:outline-blue-500 bg-gray-50"
                                      placeholder="Ghi chú..."
                                      readOnly
                                    ></textarea>
                                  </div>
                                </div>

                                {/* Bảng chi tiết hàng hóa */}
                                <div className="border border-gray-200 rounded mb-4">
                                  {importDetails[inv.MAPHIEUNHAP] ? (
                                    <table className="w-full text-left whitespace-nowrap">
                                      <thead className="bg-gray-50 border-b border-gray-200 text-sm">
                                        <tr>
                                          <th className="p-2 font-semibold">
                                            Mã hàng hóa
                                          </th>
                                          <th className="p-2 font-semibold">
                                            Tên hàng
                                          </th>
                                          <th className="p-2 font-semibold text-right">
                                            Số lượng
                                          </th>
                                          <th className="p-2 font-semibold text-right">
                                            Đơn giá nhập
                                          </th>
                                          <th className="p-2 font-semibold text-right">
                                            Giảm giá
                                          </th>
                                          <th className="p-2 font-semibold text-right">
                                            Thành tiền
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {importDetails[inv.MAPHIEUNHAP].map(
                                          (item, idx) => (
                                            <tr
                                              key={idx}
                                              className="border-b border-gray-100 text-sm hover:bg-gray-50"
                                            >
                                              <td className="p-2">
                                                {item.MAHANGHOA}
                                              </td>
                                              <td className="p-2">
                                                {item.TENHANGHOA}
                                              </td>
                                              <td className="p-2 text-right">
                                                {item.SOLUONGNHAP}
                                              </td>
                                              <td className="p-2 text-right">
                                                {item.DONGIA.toLocaleString()}
                                              </td>
                                              <td className="p-2 text-right">
                                                {item.GIAMGIA.toLocaleString()}
                                              </td>
                                              <td className="p-2 text-right">
                                                {item.THANHTIEN.toLocaleString()}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="text-center py-6 text-gray-500 italic">
                                      Đang tải chi tiết hàng hóa...
                                    </div>
                                  )}
                                </div>

                                {/* Tổng kết + Nút hành động */}
                                <div className="flex justify-end mt-4">
                                  <div className="w-80 space-y-2 text-right">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Tổng số lượng:
                                      </span>
                                      <span className="font-semibold">
                                        {inv.SOLUONG || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Tổng tiền hàng
                                      </span>
                                      <span className="font-semibold">
                                        {Number(
                                          inv.TONGTIEN || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Giảm giá phiếu nhập:
                                      </span>
                                      <span className="font-semibold">
                                        {Number(
                                          inv.GIAMGIA || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-semibold">
                                        Tiền đã trả NCC:
                                      </span>
                                      <span className="font-bold text-lg">
                                        {tienDaTra.toLocaleString()} đ
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Còn cần trả NCC:
                                      </span>
                                      <span className="font-semibold">
                                        {Number(
                                          inv.CANTRANCC || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4 ">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrint(inv);
                                        }}
                                        className="flex items-center gap-1 bg-gray-600 text-white px-4 py-1.5 rounded font-bold hover:bg-gray-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                                      >
                                        <div className="w-4 h-4">
                                          <img
                                            src={Icons.Printer}
                                            alt=""
                                            className="w-full h-full filter brightness-0 invert"
                                          />
                                        </div>
                                        In
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExportExcel(inv);
                                        }}
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancel(
                                            inv.MAPHIEUNHAP,
                                            inv.TRANGTHAI,
                                          );
                                        }}
                                        disabled={inv.TRANGTHAI === "Đã hủy"}
                                        className={`whitespace-nowrap flex items-center gap-1 text-white px-4 py-1.5 rounded font-bold transition-all shadow-sm ${
                                          inv.TRANGTHAI === "Đã hủy"
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700 cursor-pointer active:scale-95"
                                        }`}
                                      >
                                        <div className="w-4 h-4">
                                          <img
                                            src={Icons.Delete}
                                            alt=""
                                            className="w-full h-full filter brightness-0 invert"
                                          />
                                        </div>
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="bg-white border-t border-gray-200 p-3 flex justify-between items-center text-gray-500 text-xs">
              <div>
                Hiển thị từ{" "}
                {filteredImports.length > 0 ? indexOfFirstImport + 1 : 0} đến{" "}
                {Math.min(indexOfLastImport, filteredImports.length)} trên tổng
                số {filteredImports.length} phiếu
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hover:text-blue-600 disabled:opacity-50"
                >
                  &laquo;
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="hover:text-blue-600 disabled:opacity-50"
                >
                  &lsaquo;
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-6 h-6 rounded font-medium flex items-center justify-center ${currentPage === i + 1 ? "bg-green-600 text-white" : "hover:bg-gray-100 hover:text-blue-600"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="hover:text-blue-600 disabled:opacity-50"
                >
                  &rsaquo;
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="hover:text-blue-600 disabled:opacity-50"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Import;
