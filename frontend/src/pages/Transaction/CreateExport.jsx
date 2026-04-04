import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import Swal from "sweetalert2";
import * as Icons from "../../assets/icons/index";
import * as XLSX from "xlsx";

function CreateExport() {
  const navigate = useNavigate();

  // --- 1. KHAI BÁO CÁC BIẾN LOGIC ---
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [note, setNote] = useState("");
  const [nextCode, setNextCode] = useState("Mã phiếu tự động");

  const searchRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchNextCode = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/transactions/exports/last-code",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setNextCode(
          data.lastCode
            ? `XH${String(parseInt(data.lastCode.replace("XH", "")) + 1).padStart(5, "0")}`
            : "XH000001",
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchNextCode();

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm tìm kiếm hàng hóa
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      const url = `http://localhost:5000/api/transactions/exports/search-products?query=${query}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
    }
  };

  // Hàm thêm hàng hóa
  const handleAddItem = (product) => {
    const existing = items.find((i) => i.MAHANGHOA === product.MAHANGHOA);
    if (existing) {
      setItems(
        items.map((i) =>
          i.MAHANGHOA === product.MAHANGHOA
            ? { ...i, SOLUONG: i.SOLUONG + 1 }
            : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          MAHANGHOA: product.MAHANGHOA,
          TENHANGHOA: product.TENHANGHOA,
          SOLUONG: 1,
          GIATRITHIETHAI: Number(product.GIANHAP) || 0,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Hàm cập nhật số lượng
  const updateQuantity = (id, value) => {
    const newQty = parseInt(value);
    if (isNaN(newQty) || newQty < 1) return;
    setItems(
      items.map((i) => (i.MAHANGHOA === id ? { ...i, SOLUONG: newQty } : i)),
    );
  };

  // Hàm xóa món hàng khỏi danh sách
  const removeItem = (id) => {
    setItems(items.filter((i) => i.MAHANGHOA !== id));
  };

  // Tính tổng tiền
  const totalAmount = items.reduce(
    (sum, i) => sum + i.SOLUONG * i.GIATRITHIETHAI,
    0,
  );

  const handleSubmit = async (isComplete) => {
    if (items.length === 0)
      return Swal.fire(
        "Thông báo",
        "Vui lòng chọn ít nhất 1 mặt hàng để xuất hủy",
        "warning",
      );

    const result = await Swal.fire({
      title: isComplete ? "Xác nhận hoàn thành?" : "Lưu phiếu tạm?",
      text: isComplete
        ? "Hàng hóa sẽ bị trừ khỏi kho ngay lập tức."
        : "Phiếu sẽ được lưu để xử lý sau.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      const payload = {
        MAXUATHUY: nextCode,
        LYDO: note,
        TONGTIEN: totalAmount,
        TRANGTHAI: isComplete ? 1 : 0,
        items: items,
        MANVIEN: localStorage.getItem("MANVIEN") || "NV001",
      };

      try {
        const res = await fetch(
          "http://localhost:5000/api/transactions/exports/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (res.ok) {
          Swal.fire(
            "Thành công",
            isComplete
              ? "Đã xuất hủy hàng hóa và trừ kho."
              : "Đã lưu phiếu tạm.",
            "success",
          );
          navigate("/transactions/exports");
        } else {
          const errorData = await res.json();
          Swal.fire("Lỗi", errorData.message || "Không thể lưu phiếu", "error");
        }
      } catch (err) {
        Swal.fire("Lỗi", "Mất kết nối với máy chủ", err);
      }
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0)
          return Swal.fire("Lỗi", "File Excel không có dữ liệu!", "error");

        const excelItems = data
          .map((row) => ({
            MAHANGHOA: row.MAHANGHOA || row["Mã hàng"] || row["Mã sản phẩm"],
            TENHANGHOA:
              row.TENHANGHOA || row["Tên hàng"] || row["Tên sản phẩm"],
            SOLUONG: parseInt(row.SOLUONG || row["Số lượng"]) || 1,
            GIATRITHIETHAI:
              parseFloat(
                row.GIATRITHIETHAI || row["Giá trị hủy"] || row["Đơn giá"],
              ) || 0,
          }))
          .filter((item) => item.MAHANGHOA);
        const res = await fetch(
          "http://localhost:5000/api/transactions/exports/get-details-bulk",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ codes: excelItems.map((d) => d.MAHANGHOA) }),
          },
        );

        if (res.ok) {
          const dbProducts = await res.json();

          const finalItems = excelItems.map((item) => {
            const dbInfo = dbProducts.find(
              (p) => p.MAHANGHOA === item.MAHANGHOA,
            );
            return {
              ...item,
              TENHANGHOA:
                item.TENHANGHOA ||
                (dbInfo ? dbInfo.TENHANGHOA : "Không xác định"),
              GIATRITHIETHAI:
                item.GIATRITHIETHAI > 0
                  ? item.GIATRITHIETHAI
                  : dbInfo
                    ? dbInfo.GIANHAP
                    : 0,
            };
          });

          setItems([...items, ...finalItems]);
          Swal.fire(
            "Thành công",
            `Đã nhập ${finalItems.length} mặt hàng từ Excel`,
            "success",
          );
        }

        e.target.value = null;
      } catch (err) {
        Swal.fire("Lỗi", "Không thể đọc file Excel!", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-black">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        {/* Header: Nút quay lại & Tiêu đề */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/transactions/exports")}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            <img src={Icons.ArrowBack} alt="Trở về" className="w-5 h-5" />
            Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight ml-4 border-l-2 border-gray-300 pl-4">
            Tạo phiếu xuất hủy
          </h1>
        </div>

        <div className="flex gap-4 items-start">
          {/* --- CỘT TRÁI: TÌM KIẾM & BẢNG HÀNG HÓA --- */}
          <div className="flex-1 bg-white rounded shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] relative">
            {/* Thanh tìm kiếm hàng hóa */}
            <div
              className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 relative z-20"
              ref={searchRef}
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Gõ mã hoặc tên hàng hóa để xuất hủy..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 text-base shadow-inner bg-white"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40">
                  <img src={Icons.Search} alt="" className="w-full h-full" />
                </div>

                {/* Dropdown Gợi ý tìm kiếm */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-60 overflow-y-auto z-50">
                    {searchResults.map((p) => (
                      <div
                        key={p.MAHANGHOA}
                        onClick={() => handleAddItem(p)}
                        className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <span className="font-bold text-gray-800">
                            {p.TENHANGHOA}
                          </span>
                          <span className="text-gray-400 text-xs ml-2">
                            ({p.MAHANGHOA})
                          </span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {Number(p.GIANHAP).toLocaleString()} đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bảng danh sách hàng chọn xuất hủy */}
            <div className="flex-1 overflow-auto z-10 relative flex flex-col">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#f4f6f8] sticky top-0 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 font-semibold w-12 text-center">STT</th>
                    <th className="p-3 font-semibold">Mã hàng</th>
                    <th className="p-3 font-semibold w-1/3">Tên hàng</th>
                    <th className="p-3 font-semibold text-center w-28">
                      Số lượng
                    </th>
                    <th className="p-3 font-semibold text-right w-32">
                      Giá trị hủy
                    </th>
                    <th className="p-3 font-semibold text-right w-32">
                      Thành tiền
                    </th>
                    <th className="p-3 font-semibold text-center w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-20 bg-white">
                        <div className="flex flex-col items-center justify-center text-center">
                          <h2 className="font-bold text-xl  text-gray-800">
                            Thêm sản phẩm từ file excel
                          </h2>
                          <p className="text-gray-500 mb-6 text-sm">
                            Xử lý dữ liệu (Tải về File mẫu:{" "}
                            <a
                              href="#"
                              className="text-blue-500 hover:underline"
                            >
                              Excel 2003
                            </a>
                            )
                          </p>
                          <button
                            onClick={() => fileInputRef.current.click()}
                            className="flex items-center gap-2 bg-[#09c765] hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded transition-colors shadow-sm text-xl cursor-pointer active:scale-95"
                          >
                            <img
                              src={Icons.FileExport}
                              alt="Nhập file"
                              className="w-7 h-7 brightness-0 invert"
                            />
                            Chọn file dữ liệu
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImportExcel(e)}
                            accept=".xlsx, .xls"
                            className="hidden"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="p-3 text-center font-semibold text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-gray-500 font-mono text-xs">
                          {item.MAHANGHOA}
                        </td>
                        <td className="p-3 font-bold text-black">
                          {item.TENHANGHOA}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.SOLUONG}
                            onChange={(e) =>
                              updateQuantity(item.MAHANGHOA, e.target.value)
                            }
                            className="w-full text-center border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white font-bold"
                          />
                        </td>
                        <td className="p-3 text-right font-medium">
                          {Number(item.GIATRITHIETHAI).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-700 text-base">
                          {(
                            item.SOLUONG * item.GIATRITHIETHAI
                          ).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeItem(item.MAHANGHOA)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          >
                            <img
                              src={Icons.Delete}
                              alt="Xóa"
                              className="w-5 h-5 brightness-75"
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN PHIẾU XUẤT HỦY --- */}
          <aside className="w-[340px] bg-white rounded shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] text-[13px]">
            {/* Header Sidebar */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-1 text-gray-700">
                <span className="font-bold">Admin</span>
              </div>
              <div className="text-gray-500 text-[13px]">
                {new Date().toLocaleDateString("vi-VN")}{" "}
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Nội dung thông tin phiếu */}
            <div className="p-4 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    Mã phiếu xuất hủy
                  </span>
                  <span className="font-medium text-gray-700 ">{nextCode}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Trạng thái</span>
                  <span className="font-medium text-gray-700">Phiếu tạm</span>
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between  items-center">
                    <span className="text-gray-600 font-medium">
                      Tổng giá trị hủy
                    </span>
                    <div className="text-right">
                      <div className="text-[17px] font-bold text-gray-700">
                        {totalAmount.toLocaleString()}{" "}
                        <small className="text-xs">đ</small>
                      </div>
                      <div className="text-[12px] text-gray-500">
                        Số lượng mặt hàng: {items.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khu vực Ghi chú */}
                <div className="pt-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú..."
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500 resize-none h-24 text-gray-700 bg-gray-50/50"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Cụm nút hành động dính đáy */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 bg-[#0f62fe] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <img
                  src={Icons.SaveFile}
                  alt=""
                  className="w-5 h-5 brightness-0 invert"
                />
                Lưu tạm
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-[#00a651] hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 text-[13px]"
              >
                <img
                  src={Icons.Tick}
                  alt=""
                  className="w-7 h-7 brightness-0 invert"
                />
                Hoàn thành
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CreateExport;
