import React, { useEffect, useState, useRef } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { useNavigate } from "react-router-dom";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function CreateImport() {
  const navigate = useNavigate();

  // Lấy thông tin tài khoản đang đăng nhập
  const currentUser = localStorage.getItem("TENNGUOIDUNG") || "Admin";
  const currentEmployeeId = localStorage.getItem("MANVIEN") || "NV001";

  // --- STATES DỮ LIỆU TỪ API ---
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // --- STATES GIAO DIỆN & TÍNH TOÁN ---
  const [items, setItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    MAHANGHOA: "",
    TENHANGHOA: "",
    DONGIABAN: 0,
  });

  const handleQuickAddProduct = async () => {
    if (!newProduct.TENHANGHOA) {
      Swal.fire("Lỗi", "Vui lòng nhập đủ Mã và Tên hàng", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/imports/quick-add-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newProduct),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        // Cập nhật list products cục bộ
        setProducts([...products, { ...newProduct, TRANGTHAI: 1 }]);
        Swal.fire({
          icon: "success",
          title: "Đã thêm hàng mới",
          timer: 1500,
          showConfirmButton: false,
        });
        setShowAddModal(false);
        setNewProduct({ MAHANGHOA: "", TENHANGHOA: "", DONGIABAN: 0 });
      } else {
        Swal.fire("Lỗi", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Lỗi mạng", "Không kết nối được server", err);
    }
  };

  // States cho ô tìm kiếm hàng hóa
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  // States cho Upload Excel
  const fileInputRef = useRef(null);
  const [importErrors, setImportErrors] = useState([]);

  // 1. Kéo dữ liệu Hàng hóa & NCC khi vừa vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resSuppliers, resProducts, resCategories] = await Promise.all([
          fetch("http://localhost:5000/api/imports/suppliers", { headers }),
          fetch("http://localhost:5000/api/imports/products", { headers }),
          fetch("http://localhost:5000/api/products/categories", { headers }),
        ]);

        if (resSuppliers.ok) setSuppliers(await resSuppliers.json());
        if (resProducts.ok) setProducts(await resProducts.json());
        if (resCategories.ok) setCategories(await resCategories.json());
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  // 2. Logic Lọc hàng hóa
  const filteredProducts = products.filter(
    (p) =>
      (p.TENHANGHOA || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()) ||
      (p.MAHANGHOA || "")
        .trim()
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()),
  );

  // 3. Logic chọn hàng hóa từ Dropdown
  const handleSelectProduct = (product) => {
    const existingItemIndex = items.findIndex(
      (i) => (i.MAHANGHOA || "").trim() === (product.MAHANGHOA || "").trim(),
    );

    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].qty += 1;
      newItems[existingItemIndex].total =
        newItems[existingItemIndex].qty * newItems[existingItemIndex].price;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          MAHANGHOA: product.MAHANGHOA,
          TENHANGHOA: product.TENHANGHOA,
          qty: 1,
          price: product.GIABAN || 0,
          total: product.GIABAN || 0,
        },
      ]);
    }
    setSearchTerm("");
    setShowDropdown(false);
  };

  // 4. Logic cập nhật bảng
  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value === "" ? "" : Number(value);
    const currentQty = Number(newItems[index].qty) || 0;
    const currentPrice = Number(newItems[index].price) || 0;
    newItems[index].total = currentQty * currentPrice;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // --- LOGIC NHẬP TỪ FILE EXCEL ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const newItems = [...items];
        const errors = [];

        // 1. Tự động dò tìm dòng bắt đầu chứa dữ liệu Hàng hóa
        let startIndex = 1;
        let colMaHang = 0,
          colSoLuong = 1,
          colGiaNhap = 2;

        for (let i = 0; i < data.length; i++) {
          const firstCell =
            data[i] && data[i][0] ? data[i][0].toString().toLowerCase() : "";
          if (firstCell.includes("mã hàng")) {
            startIndex = i + 1;
            if (
              data[i][2] &&
              data[i][2].toString().toLowerCase().includes("số lượng")
            ) {
              colSoLuong = 2;
              colGiaNhap = 3;
            }
            break;
          }
        }

        // 2. Bắt đầu đọc dữ liệu từ startIndex
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const maHang = row[colMaHang] ? row[colMaHang].toString().trim() : "";

          if (
            maHang.toUpperCase().includes("TỔNG KẾT") ||
            maHang.includes("Tổng số lượng")
          ) {
            break;
          }
          if (maHang === "") continue;

          const soLuong = Number(row[colSoLuong]) || 0;
          const giaNhap = Number(row[colGiaNhap]) || 0;
          const rowNum = i + 1;

          // 3. Kiểm tra tính hợp lệ
          const productMatch = products.find(
            (p) =>
              (p.MAHANGHOA || "").trim().toLowerCase() === maHang.toLowerCase(),
          );

          if (!productMatch) {
            errors.push({
              row: rowNum,
              message: `Mã hàng "${maHang}" không tồn tại trong hệ thống.`,
            });
            continue;
          }
          if (soLuong <= 0) {
            errors.push({
              row: rowNum,
              message: `Mã hàng "${maHang}": Số lượng phải lớn hơn 0.`,
            });
            continue;
          }
          if (giaNhap < 0) {
            errors.push({
              row: rowNum,
              message: `Mã hàng "${maHang}": Giá nhập không hợp lệ.`,
            });
            continue;
          }

          // 4. Hợp lệ thì đẩy vào bảng
          const existingIndex = newItems.findIndex(
            (item) => item.MAHANGHOA === productMatch.MAHANGHOA,
          );
          if (existingIndex >= 0) {
            newItems[existingIndex].qty += soLuong;
            newItems[existingIndex].total =
              newItems[existingIndex].qty * newItems[existingIndex].price;
          } else {
            newItems.push({
              MAHANGHOA: productMatch.MAHANGHOA,
              TENHANGHOA: productMatch.TENHANGHOA,
              qty: soLuong,
              price: giaNhap,
              total: soLuong * giaNhap,
            });
          }
        }

        setItems(newItems);
        setImportErrors(errors);

        // Hiện thông báo
        if (errors.length === 0 && newItems.length > items.length) {
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Đã nhập dữ liệu từ Excel!",
            timer: 1500,
            showConfirmButton: false,
          });
        } else if (errors.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "Cảnh báo",
            text: `Có ${errors.length} dòng bị lỗi!`,
          });
        } else {
          Swal.fire({
            icon: "info",
            title: "Thông báo",
            text: "Không tìm thấy dữ liệu hợp lệ trong file.",
          });
        }
      } catch (error) {
        Swal.fire(
          "Lỗi",
          "Không thể đọc file Excel. Định dạng không hợp lệ.",
          error,
        );
      }
      e.target.value = null; // Reset input để có thể up lại file đó
    };
    reader.readAsBinaryString(file);
  };

  // TÍNH TOÁN TỔNG CỘNG
  const totalQty = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0),
    0,
  );
  const totalGoods = items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0,
  );
  const totalNeedToPay = totalGoods - discount;

  // --- HÀM XỬ LÝ LƯU DỮ LIỆU BACKEND ---
  const handleSave = async (status) => {
    if (items.length === 0) {
      Swal.fire("Lỗi", "Phiếu nhập phải có ít nhất 1 mặt hàng!", "error");
      return;
    }
    if (!selectedSupplier) {
      Swal.fire("Lỗi", "Vui lòng chọn nhà cung cấp!", "error");
      return;
    }

    const payload = {
      supplierId: selectedSupplier,
      employeeId: currentEmployeeId,
      items: items,
      note: note,
      discount: discount,
      paidAmount: paidAmount,
      totalGoods: totalGoods,
      totalQty: totalQty,
      status: status,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/imports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire("Thành công!", "Đã lưu phiếu nhập.", "success").then(() => {
          navigate("/transactions/imports");
        });
      } else {
        Swal.fire("Lỗi", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Lỗi mạng", "Không thể kết nối đến máy chủ!", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-black">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1440px] mx-auto p-4 flex flex-col gap-4">
        {/* Nút quay lại */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            &lsaquo; Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight ml-4 border-l-2 border-gray-300 pl-4">
            Tạo phiếu nhập hàng
          </h1>
        </div>

        <div className="flex gap-4 items-start">
          {/* --- CỘT TRÁI: TÌM KIẾM & BẢNG HÀNG HÓA --- */}
          <div className="flex-1 bg-white rounded shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] relative">
            {/* Thanh tìm kiếm */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 relative z-20">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Thêm hàng hóa vào phiếu nhập (Gõ mã hoặc tên)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => {
                    if (searchTerm.length > 0) setShowDropdown(true);
                  }}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 text-base shadow-inner bg-white"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>

                {/* Dropdown Gợi ý */}
                {showDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-gray-500 text-center italic">
                        Không tìm thấy hàng hóa!
                      </div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p.MAHANGHOA}
                          onClick={() => handleSelectProduct(p)}
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
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Nút Thêm mới hàng hóa  */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-md font-bold hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>

            {showDropdown && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>
            )}

            {/* Input file ẩn */}
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Bảng danh sách */}
            <div className="flex-1 overflow-auto z-10 relative flex flex-col">
              {/* Lỗi Excel */}
              {importErrors.length > 0 && (
                <div className="m-3 p-3 bg-red-50 border border-red-300 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-red-700 font-bold flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cảnh báo: Dữ liệu nhập từ file có lỗi
                    </h3>
                    <button
                      onClick={() => setImportErrors([])}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <ul className="list-disc pl-5 text-red-600 text-xs space-y-1 max-h-24 overflow-y-auto">
                    {importErrors.map((err, i) => (
                      <li key={i}>
                        <strong>Dòng {err.row}:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                      Đơn giá nhập
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
                          <h2 className="font-bold text-xl mb-2 text-gray-800">
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
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-blue-50/30"
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
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateItem(idx, "qty", e.target.value)
                            }
                            className="w-full text-center border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(idx, "price", e.target.value)
                            }
                            className="w-full text-right border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white font-bold"
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-blue-700 text-base">
                          {(Number(item.total) || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN THANH TOÁN --- */}
          <aside className="w-[340px] bg-white rounded shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] text-[13px]">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <span className="font-medium">{currentUser}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-gray-500 font-mono">
                {new Date().toLocaleDateString("vi-VN")}{" "}
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white shadow-sm font-medium"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">-- Chọn Nhà Cung Cấp --</option>
                {suppliers.map((s) => (
                  <option key={s.MANCC} value={s.MANCC}>
                    {s.TENNCC}
                  </option>
                ))}
              </select>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã phiếu nhập</span>
                  <input
                    type="text"
                    placeholder="Mã phiếu tự động"
                    className="w-40 border border-gray-300 rounded px-2 py-1 outline-none bg-gray-50 text-right text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="w-40 text-right font-medium text-gray-800">
                    Phiếu tạm
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 flex items-center">
                    Tổng tiền hàng
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] ml-1 font-bold border border-gray-300">
                      {totalQty}
                    </span>
                  </span>
                  <span className="font-bold text-gray-800 text-[14px]">
                    {totalGoods.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giảm giá</span>
                  <input
                    type="number"
                    min="0"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-40 text-right border border-gray-300 border-b-2 focus:border-b-blue-500 rounded px-2 py-1 outline-none text-gray-800 font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center font-bold text-[14px]">
                  <span className="text-gray-800">Cần trả nhà cung cấp</span>
                  <span className="text-[#0f62fe]">
                    {totalNeedToPay.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex flex-col">
                    <span>Tiền trả nhà cung cấp</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#0f62fe"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                      />
                    </svg>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount === 0 ? "" : paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-[100px] text-right border border-gray-300 border-b-2 focus:border-b-blue-500 rounded px-2 py-1 outline-none text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tính vào công nợ</span>
                  <span className="font-bold text-gray-800">
                    {Math.max(0, totalNeedToPay - paidAmount).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3">
                  <div className="relative">
                    <div className="absolute top-2 left-2 opacity-40">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú"
                      className="w-full border border-gray-300 border-b-2 focus:border-b-blue-500 rounded p-2 pl-8 outline-none resize-none h-14 text-gray-700"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleSave("Phiếu tạm")}
                className="flex-1 bg-[#0f62fe] hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-colors shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1 text-[13px]"
              >
                <img
                  src={Icons.SaveFile}
                  alt="Lưu tạm"
                  className="w-4 h-4 brightness-0 invert"
                />
                Lưu tạm
              </button>
              <button
                onClick={() => handleSave("Đã nhập hàng")}
                className="flex-1 bg-[#00a651] hover:bg-green-700 text-white font-bold py-2.5 rounded transition-colors shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1 text-[13px]"
              >
                <img
                  src={Icons.Tick}
                  alt="Hoàn thành"
                  className="w-5 h-5 brightness-0 invert"
                />
                Hoàn thành
              </button>
            </div>
          </aside>
        </div>
        {/* --- MODAL THÊM NHANH HÀNG HÓA --- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[600px] flex flex-col overflow-hidden animate-fade-in">
              {/* Header Modal */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#00a651] text-white">
                <h2 className="font-bold text-lg">Thêm nhanh hàng hóa</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-green-200 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                {/* Hàng 1: Mã hàng & Tên hàng */}
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-gray-700 font-bold mb-1">
                      Mã hàng hóa
                    </label>
                    <input
                      type="text"
                      placeholder="Mã tự động"
                      disabled
                      className="w-full border border-gray-300 rounded p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed italic font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-bold mb-1">
                      Tên hàng hóa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProduct.TENHANGHOA}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          TENHANGHOA: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded p-2.5 focus:border-[#00a651] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Hàng 2: Nhóm hàng & Đơn vị tính */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-bold mb-1">
                      Nhóm hàng
                    </label>
                    <select
                      value={newProduct.MADANHMUC}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          MADANHMUC: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded p-2.5 focus:border-[#00a651] outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Lựa chọn nhóm --</option>
                      {categories &&
                        categories.length > 0 &&
                        categories
                          .filter(
                            (c, index, self) =>
                              c.MADANHMUC !== "ALL" &&
                              c.MADANHMUC !== "Tất cả" &&
                              index ===
                                self.findIndex(
                                  (t) => t.MADANHMUC === c.MADANHMUC,
                                ),
                          )
                          .map((c) => (
                            <option key={c.MADANHMUC} value={c.MADANHMUC}>
                              {c.TENDANHMUC}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-bold mb-1">
                      Đơn vị tính
                    </label>
                    <input
                      type="text"
                      value={newProduct.DONVITINH}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          DONVITINH: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded p-2.5 focus:border-[#00a651] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Hàng 3: Giá bán */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Giá bán
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={
                      newProduct.DONGIABAN === 0 ? "" : newProduct.DONGIABAN
                    }
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        DONGIABAN: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded p-2.5 focus:border-[#00a651] outline-none text-right font-bold text-[#0f62fe] text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleQuickAddProduct}
                  className="px-6 py-2.5 bg-[#00a651] hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Lưu hàng hóa
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreateImport;
