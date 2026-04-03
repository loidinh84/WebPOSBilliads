import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function Invoices() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [timeFilter, setTimeFilter] = useState("all");
  const [filterStatuses, setFilterStatuses] = useState(["Đã thanh toán"]);
  const [searchTable, setSearchTable] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 10;

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bills/details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        console.error("Lỗi khi lấy dữ liệu hóa đơn");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (expandedRow && !invoiceDetails[expandedRow]) {
      const fetchItems = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/api/bills/${expandedRow}/items`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.ok) {
            const data = await res.json();
            setInvoiceDetails((prev) => ({
              ...prev,
              [expandedRow]: data,
            }));
          }
        } catch (error) {
          console.error("Lỗi tải chi tiết món ăn:", error);
        }
      };
      fetchItems();
    }
  }, [expandedRow, invoiceDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    searchCustomer,
    searchTable,
    filterStatuses,
    timeFilter,
    customDate,
  ]);

  // Hàm hủy hóa đơn
  const handleCancel = async (id, status) => {
    if (status === "Đã hủy") {
      Swal.fire({
        icon: "info",
        title: "Hóa đơn đã được hủy",
        text: "Trạng thái hóa đơn này đã là 'Đã hủy'. Không thể hủy lại.",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Xác nhận HỦY hóa đơn ${id}?`,
      text: "Nếu bàn này đang chơi, hệ thống sẽ tự động trả bàn về trạng thái 'Trống'. Dữ liệu vẫn được giữ lại để đối soát.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Hủy hóa đơn",
      cancelButtonText: "Không, quay lại",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/bills/${id}/cancel`,
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
          setInvoices(
            invoices.map((inv) =>
              inv.MAHOADON === id ? { ...inv, TRANGTHAI: "Đã hủy" } : inv,
            ),
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi khi hủy hóa đơn",
            text: "Lỗi khi hủy hóa đơn: " + data.message,
          });
        }
      } catch (error) {
        console.error("Lỗi gọi API hủy hóa đơn:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi kết nối",
          text: "Không thể kết nối đến máy chủ!",
        });
      }
    }
  };

  // Hàm format
  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "---";

    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("vi-VN");
    return `${time} ${date}`;
  };

  // Hàm tính khoảng thời gian
  const calculateDuration = (start, end) => {
    if (!start || !end) return "--:--:--";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (isNaN(startTime) || isNaN(endTime)) return "--:--:--";

    const diffMs = endTime - startTime;
    if (diffMs <= 0) return "00:00:00";

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${String(diffHrs).padStart(2, "0")}:${String(diffMins).padStart(2, "0")}:${String(diffSecs).padStart(2, "0")}`;
  };

  // Hàm in hóa đơn
  const handlePrint = (inv) => {
    if (!invoiceDetails[inv.MAHOADON]) {
      Swal.fire({
        icon: "info",
        title: "Đang tải chi tiết hóa đơn",
        text: "Vui lòng chờ tải xong chi tiết hóa đơn trước khi in.",
      });
      return;
    }

    // 1. GIẢ LẬP DỮ LIỆU TỪ DATABASE
    const mauInTuDB = `
      <html>
        <head>
          <title>In Hóa Đơn {{MA_HOA_DON}}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 400px; margin: auto; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2 class="text-center">{{TEN_CUA_HANG}}</h2>
          <p class="text-center">ĐC: 123 Đường Billiards, TP.HCM</p>
          <p class="text-center border-bottom">-------------------------</p>
          <h3 class="text-center">HÓA ĐƠN THANH TOÁN</h3>
          <p><b>Mã HĐ:</b> {{MA_HOA_DON}}</p>
          <p><b>Khách:</b> {{TEN_KHACH_HANG}}</p>
          <p><b>Giờ chơi:</b> {{GIO_CHOI}}</p>
          
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left;">Món</th>
                <th>SL</th>
                <th style="text-align: right;">Đơn giá</th>
                <th style="text-align: right;">T.Tiền</th>
              </tr>
            </thead>
            <tbody>{{DANH_SACH_MON}}</tbody>
          </table>
          
          <h3 class="text-right font-bold">TỔNG CỘNG: {{TONG_TIEN}} VNĐ</h3>
          <p class="text-center">Cảm ơn quý khách và hẹn gặp lại!</p>
        </body>
      </html>
    `;

    // 2. Tạo chuỗi HTML các món ăn
    const itemsHtml = invoiceDetails[inv.MAHOADON]
      .map(
        (item) => `
      <tr>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc;">${item.TENHANGHOA}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: center;">${item.SOLUONG}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${item.DONGIA.toLocaleString()}</td>
        <td style="padding: 5px; border-bottom: 1px dashed #ccc; text-align: right;">${item.THANHTIEN.toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");

    // 3. THAY THẾ (REPLACE) TỪ KHÓA BẰNG DỮ LIỆU THẬT
    let finalHtml = mauInTuDB
      .replace("{{TEN_CUA_HANG}}", "Billiards Lục Lọi")
      .replace(/{{MA_HOA_DON}}/g, inv.MAHOADON)
      .replace("{{TEN_KHACH_HANG}}", inv.TENKHACHHANG || "Khách vãng lai")
      .replace("{{GIO_CHOI}}", calculateDuration(inv.GIOBATDAU, inv.GIOKETTHUC))
      .replace("{{DANH_SACH_MON}}", itemsHtml)
      .replace("{{TONG_TIEN}}", Number(inv.TONGTHANHTOAN).toLocaleString());

    // 4. In ra cửa sổ ảo
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(finalHtml);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Hàm xuất CSV
  const handleExportExcel = (inv) => {
    if (!invoiceDetails[inv.MAHOADON]) {
      alert("Vui lòng chờ tải xong chi tiết để xuất file!");
      return;
    }

    const tongGoc = (inv.TONGTIENHANG || 0) + (inv.TONGTIENGIO || 0);
    const giamGia = tongGoc - (inv.TONGTHANHTOAN || 0);
    const tongSoLuong = invoiceDetails[inv.MAHOADON].reduce(
      (acc, item) => acc + item.SOLUONG,
      0,
    );

    // 1. Tạo mảng dữ liệu 2 chiều
    const excelData = [
      ["THÔNG TIN HÓA ĐƠN"],
      ["Mã hóa đơn:", inv.MAHOADON],
      ["Tên bàn:", inv.TENBAN],
      ["Khách hàng:", inv.TENKHACHHANG || "Khách vãng lai"],
      ["Người tạo:", inv.TENNHANVIEN || "Admin"],
      ["Giờ đến:", formatDateTime(inv.GIOBATDAU)],
      ["Giờ đi:", formatDateTime(inv.GIOKETTHUC)],
      ["Giờ chơi:", calculateDuration(inv.GIOBATDAU, inv.GIOKETTHUC)],
      ["Trạng thái:", inv.TRANGTHAI],
      [], // Dòng trống ngăn cách
      ["CHI TIẾT HÀNG HÓA"],
      ["Mã Hàng", "Tên Hàng", "Số Lượng", "Đơn Giá", "Thành Tiền"],
    ];

    // 2. Lặp qua từng món ăn để đẩy vào mảng
    invoiceDetails[inv.MAHOADON].forEach((item) => {
      excelData.push([
        item.MAHANGHOA,
        item.TENHANGHOA,
        item.SOLUONG,
        item.DONGIA,
        item.THANHTIEN,
      ]);
    });

    // 3. Thêm phần Tổng kết
    excelData.push([]); // Dòng trống
    excelData.push(["TỔNG KẾT"]);
    excelData.push(["Tổng số lượng món:", tongSoLuong]);
    excelData.push(["Tổng tiền hàng + giờ:", tongGoc]);
    excelData.push(["Giảm giá:", giamGia]);
    excelData.push(["Khách cần trả:", inv.TONGTHANHTOAN || 0]);
    excelData.push(["Khách đã trả:", inv.TONGTHANHTOAN || 0]);

    // 4. Khởi tạo File Excel ảo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // 5. Làm đẹp: Thiết lập độ rộng cột (Column Width)
    ws["!cols"] = [
      { wch: 20 }, // Cột A rộng 20 (Mã hàng / Tiêu đề)
      { wch: 30 }, // Cột B rộng 30 (Tên hàng / Dữ liệu)
      { wch: 15 }, // Cột C rộng 15
      { wch: 15 }, // Cột D rộng 15
      { wch: 20 }, // Cột E rộng 20
    ];

    // Đưa sheet vào file Excel
    XLSX.utils.book_append_sheet(wb, ws, "ChiTietHoaDon");

    // 6. Tải file xuống máy với định dạng .xlsx
    XLSX.writeFile(wb, `HoaDon_${inv.MAHOADON}.xlsx`);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchId = inv.MAHOADON.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );

    const customerName = inv.TENKHACHHANG || "Khách vãng lai";
    const matchCustomer = customerName
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const tableName = inv.TENBAN || "";
    const matchTable = tableName
      .toLowerCase()
      .includes(searchTable.toLowerCase());

    const matchStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.TRANGTHAI);

    let matchTime = true;
    if (timeFilter === "today") {
      matchTime = inv.NGAY
        ? new Date(inv.NGAY).toDateString() === new Date().toDateString()
        : false;
    } else if (timeFilter === "custom" && customDate) {
      matchTime = inv.NGAY
        ? new Date(inv.NGAY).toDateString() ===
          new Date(customDate).toDateString()
        : false;
    }

    return matchId && matchCustomer && matchTable && matchStatus && matchTime;
  });

  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;

  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice,
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1440px] mx-auto p-4 flex gap-4">
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-[280px] space-y-3 shrink-0">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Theo mã hóa đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md px-3 py-1.5 mb-2 outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="Theo tên khách hàng..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">
              Thời gian
            </h3>
            {/* 1. Tất cả */}
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
              <input
                type="radio"
                name="time"
                checked={timeFilter === "all"}
                onChange={() => setTimeFilter("all")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />{" "}
              Tất cả
            </label>

            {/* 2. Hôm nay */}
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
              <input
                type="radio"
                name="time"
                checked={timeFilter === "today"}
                onChange={() => setTimeFilter("today")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />{" "}
              Hôm nay
            </label>

            {/* 3. Lựa chọn khác */}
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
              <input
                type="radio"
                name="time"
                checked={timeFilter === "custom"}
                onChange={() => setTimeFilter("custom")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />{" "}
              Lựa chọn khác
            </label>

            {/* Input chọn ngày*/}
            {timeFilter === "custom" && (
              <div className="mt-2 animate-fade-in">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-400 text-sm text-gray-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">
              Trạng thái
            </h3>
            {["Đang chơi", "Đã thanh toán", "Đã hủy"].map((st) => (
              <label
                key={st}
                className="flex items-center gap-2 mb-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filterStatuses.includes(st)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterStatuses([...filterStatuses, st]);
                    } else {
                      setFilterStatuses(filterStatuses.filter((s) => s !== st));
                    }
                  }}
                  className="w-4 h-4 accent-blue-600 rounded"
                />{" "}
                {st}
              </label>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">
              Phòng/Bàn
            </h3>
            <input
              type="text"
              placeholder="Tìm theo tên bàn..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>
        </aside>

        {/* --- DANH SÁCH HÓA ĐƠN --- */}
        <section className="flex-1 bg-white rounded shadow-sm border border-gray-200 flex flex-col overflow-hidden text-black h-full">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Hóa đơn</h2>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse whitespace-nowrap">
              <thead className="bg-[#f8f9fa] sticky top-0 z-10 border-b border-gray-200 font-bold uppercase text-[11px] text-gray-600">
                <tr>
                  <th className="p-3 text-left border-r">Mã hóa đơn</th>
                  <th className="p-3 text-left border-r">Thời gian</th>
                  <th className="p-3 text-left border-r">Khách hàng</th>
                  <th className="p-3 text-right border-r">Tổng tiền hàng</th>
                  <th className="p-3 text-right border-r">Giảm giá</th>
                  <th className="p-3 text-right">Khách đã trả</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices
                  .filter((inv) => {
                    // 1. Lọc Mã hóa đơn
                    const matchId = inv.MAHOADON.toLowerCase().includes(
                      searchTerm.toLowerCase(),
                    );

                    // 2. Lọc Khách hàng
                    const customerName = inv.TENKHACHHANG || "Khách vãng lai";
                    const matchCustomer = customerName
                      .toLowerCase()
                      .includes(searchCustomer.toLowerCase());

                    // 3. Lọc Tên Bàn
                    const tableName = inv.TENBAN || "";
                    const matchTable = tableName
                      .toLowerCase()
                      .includes(searchTable.toLowerCase());

                    // 4. Lọc Trạng thái
                    const matchStatus =
                      filterStatuses.length === 0 ||
                      filterStatuses.includes(inv.TRANGTHAI);

                    // 5. Lọc Thời gian
                    let matchTime = true;
                    if (timeFilter === "today" && inv.NGAY) {
                      const invDate = new Date(inv.NGAY).toDateString();
                      const todayDate = new Date().toDateString();
                      matchTime = invDate === todayDate;
                    } else if (
                      timeFilter === "custom" &&
                      customDate &&
                      inv.NGAY
                    ) {
                      const invDate = new Date(inv.NGAY).toDateString();
                      const selectedDate = new Date(customDate).toDateString();
                      matchTime = invDate === selectedDate;
                    }

                    return (
                      matchId &&
                      matchCustomer &&
                      matchTable &&
                      matchStatus &&
                      matchTime
                    );
                  })

                  .map((inv) => {
                    const tongGoc =
                      (inv.TONGTIENHANG || 0) + (inv.TONGTIENGIO || 0);
                    const giamGia = tongGoc - (inv.TONGTHANHTOAN || 0);

                    return (
                      <React.Fragment key={inv.MAHOADON}>
                        <tr
                          className={`border-b cursor-pointer hover:bg-blue-50 transition-colors ${expandedRow === inv.MAHOADON ? "bg-[#e1f0ff]" : ""}`}
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === inv.MAHOADON
                                ? null
                                : inv.MAHOADON,
                            )
                          }
                        >
                          {/* 1. Mã hóa đơn */}
                          <td className="p-3 border-r font-bold text-blue-700">
                            {inv.MAHOADON}
                          </td>

                          {/* 2. Thời gian */}
                          <td className="p-3 border-r">
                            {inv.NGAY
                              ? new Date(inv.NGAY).toLocaleString("vi-VN")
                              : "-"}
                          </td>

                          {/* 3. Khách hàng */}
                          <td className="p-3 border-r text-black">
                            {inv.TENKHACHHANG || "Khách vãng lai"}
                          </td>

                          {/* 4. Tổng tiền hàng */}
                          <td className="p-3 border-r text-right font-bold">
                            {tongGoc.toLocaleString()}
                          </td>

                          {/* 5. Giảm giá */}
                          <td className="p-3 border-r text-right">
                            {giamGia > 0 ? giamGia.toLocaleString() : "0"}
                          </td>

                          {/* 6. Khách đã trả */}
                          <td className="p-3 text-right font-bold">
                            {Number(inv.TONGTHANHTOAN || 0).toLocaleString()}
                          </td>
                        </tr>

                        {/* CHI TIẾT KHI MỞ RỘNG */}
                        {expandedRow === inv.MAHOADON && (
                          <tr className="bg-white">
                            <td
                              colSpan="6"
                              className="p-0 border-b shadow-inner"
                            >
                              <div className="p-6 border-l-4 border-blue-500">
                                <div className="flex gap-4 border-b border-gray-200 mb-4 text-xs">
                                  <button
                                    className={`pb-2 px-2 font-bold uppercase cursor-pointer ${activeTab === "Thông tin" ? "border-b-2 border-blue-600 text-black" : "text-gray-500 hover:text-black"}`}
                                    onClick={() => setActiveTab("Thông tin")}
                                  >
                                    Thông tin
                                  </button>
                                  <button
                                    className={`pb-2 px-2 font-bold uppercase cursor-pointer ${activeTab === "Lịch sử" ? "border-b-2 border-blue-600 text-black" : "text-gray-500 hover:text-black"}`}
                                    onClick={() => setActiveTab("Lịch sử")}
                                  >
                                    Lịch sử thanh toán
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-x-20 mb-6 text-sm">
                                  <div className="space-y-1">
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Mã hóa đơn:
                                      </span>{" "}
                                      <strong>{inv.MAHOADON}</strong>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Giờ đến:
                                      </span>{" "}
                                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border">
                                        {formatDateTime(inv.GIOBATDAU)}
                                        <img
                                          src={Icons.Calendar}
                                          alt="calendar"
                                          className="w-3 h-3 object-contain filter brightness-0 opacity-50"
                                        />
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Giờ đi:
                                      </span>{" "}
                                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border">
                                        {formatDateTime(inv.GIOKETTHUC)}
                                        <img
                                          src={Icons.Calendar}
                                          alt="calendar"
                                          className="w-3 h-3 object-contain filter brightness-0 opacity-50"
                                        />
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500 font-medium">
                                        Giờ chơi:
                                      </span>{" "}
                                      <span className="font-bold font-bold text-black uppercase">
                                        {calculateDuration(
                                          inv.GIOBATDAU,
                                          inv.GIOKETTHUC,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Trạng thái:
                                      </span>{" "}
                                      <span className="text-black font-medium">
                                        {inv.TRANGTHAI}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Người tạo:
                                      </span>{" "}
                                      <span>{inv.TENNHANVIEN || "Admin"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Khách hàng:
                                      </span>{" "}
                                      <span className="text-black font-medium">
                                        {inv.TENKHACHHANG || "Khách vãng lai"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                      <span className="text-gray-500">
                                        Tên bàn:
                                      </span>{" "}
                                      <span className="text-black font-bold">
                                        {inv.TENBAN}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Bảng danh sách hàng hóa */}
                                {invoiceDetails[inv.MAHOADON] ? (
                                  <table className="w-full border text-xs mb-4">
                                    <thead className="bg-[#f1f3f9] font-bold text-gray-700 uppercase">
                                      <tr>
                                        <th className="p-2 border">
                                          Mã hàng hóa
                                        </th>
                                        <th className="p-2 border text-left">
                                          Tên hàng
                                        </th>
                                        <th className="p-2 border text-center">
                                          Số lượng
                                        </th>
                                        <th className="p-2 border text-right">
                                          Đơn giá
                                        </th>
                                        <th className="p-2 border text-right font-bold">
                                          Thành tiền
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {invoiceDetails[inv.MAHOADON].map(
                                        (item, idx) => (
                                          <tr
                                            key={idx}
                                            className="border-b hover:bg-gray-50 transition-colors"
                                          >
                                            <td className="p-2 border text-black">
                                              {item.MAHANGHOA}
                                            </td>
                                            <td className="p-2 border text-left font-medium">
                                              {item.TENHANGHOA}
                                            </td>
                                            <td className="p-2 border text-center">
                                              {item.SOLUONG}
                                            </td>
                                            <td className="p-2 border text-right">
                                              {item.DONGIA.toLocaleString()}
                                            </td>
                                            <td className="p-2 border text-right font-bold text-black">
                                              {item.THANHTIEN.toLocaleString()}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-center py-4 text-gray-500 italic">
                                    Đang tải chi tiết hàng hóa...
                                  </div>
                                )}

                                <div className="flex justify-between items-start">
                                  <div className="flex-1 max-w-[40%]">
                                    <textarea
                                      placeholder="Ghi chú..."
                                      className="w-full border-b border-gray-300 outline-none text-black italic p-1 h-10 resize-none bg-transparent focus:border-blue-400 transition-colors"
                                    ></textarea>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 w-[350px] bg-gray-50 p-4 rounded-md shadow-sm border text-black">
                                    <div className="flex justify-between w-full">
                                      <span className="text-gray-500">
                                        Tổng số lượng:
                                      </span>{" "}
                                      <strong className="text-black font-bold text-lg">
                                        {invoiceDetails[inv.MAHOADON]
                                          ? invoiceDetails[inv.MAHOADON].reduce(
                                              (acc, item) => acc + item.SOLUONG,
                                              0,
                                            )
                                          : 0}
                                      </strong>
                                    </div>
                                    <div className="flex justify-between w-full">
                                      <span className="text-gray-500">
                                        Tổng tiền hàng:
                                      </span>{" "}
                                      <strong className="text-black font-bold text-lg">
                                        {tongGoc.toLocaleString()}
                                      </strong>
                                    </div>
                                    <div className="flex justify-between w-full text-gray-500 border-b pb-1">
                                      <span>Giảm giá:</span>{" "}
                                      <span>
                                        {giamGia > 0
                                          ? giamGia.toLocaleString()
                                          : 0}{" "}
                                        đ
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-full font-bold mt-1 text-black">
                                      <span className="text-sm text-gray-600">
                                        Khách cần trả:
                                      </span>{" "}
                                      <span className="text-xl underline underline-offset-4 decoration-2">
                                        {Number(
                                          inv.TONGTHANHTOAN || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-full text-gray-500 text-xs">
                                      <span>Khách đã trả:</span>{" "}
                                      <span>
                                        {Number(
                                          inv.TONGTHANHTOAN || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </span>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6 w-full">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrint(inv);
                                        }}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded flex items-center gap-1.5 font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                                      >
                                        <div className="w-4 h-4">
                                          <img
                                            src={Icons.Printer}
                                            alt="print"
                                            className="w-full h-full object-contain filter brightness-0 invert"
                                          />
                                        </div>
                                        In
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExportExcel(inv);
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded flex items-center gap-1.5 font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                                      >
                                        <div className="w-4 h-4">
                                          <img
                                            src={Icons.SaveFile}
                                            alt="export"
                                            className="w-full h-full object-contain filter brightness-0 invert"
                                          />
                                        </div>
                                        Xuất file
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancel(
                                            inv.MAHOADON,
                                            inv.TRANGTHAI,
                                          );
                                        }}
                                        className={`px-4 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all shadow-sm ${
                                          inv.TRANGTHAI === "Đã hủy"
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95"
                                        }`}
                                        disabled={inv.TRANGTHAI === "Đã hủy"}
                                      >
                                        {inv.TRANGTHAI === "Đã hủy"
                                          ? "Đã hủy"
                                          : "Hủy hóa đơn"}
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

          {/* --- THÊM PHÂN TRANG  --- */}
          <div className="bg-white border-t border-gray-200 p-3 flex justify-between items-center text-gray-500 shrink-0">
            <div className="text-xs">
              Hiển thị từ{" "}
              {filteredInvoices.length > 0 ? indexOfFirstInvoice + 1 : 0} đến{" "}
              {Math.min(indexOfLastInvoice, filteredInvoices.length)} trên tổng
              số {filteredInvoices.length} hóa đơn
            </div>

            <div className="flex items-center gap-3">
              {/* Về trang đầu */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &laquo;
              </button>

              {/* Lùi 1 trang */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>

              {/* Dãy số trang */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 rounded font-medium flex items-center justify-center cursor-pointer transition-colors ${
                      currentPage === pageNum
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Tiến 1 trang */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &rsaquo;
              </button>

              {/* Đến trang cuối */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &raquo;
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Invoices;
