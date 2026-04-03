import React, { useEffect, useState, useRef } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { useNavigate } from "react-router-dom";
import * as Icons from "../../assets/icons/index";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function CreateReturnImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const currentUser = localStorage.getItem("TENNGUOIDUNG") || "Admin";
  const currentEmployeeId = localStorage.getItem("MANVIEN") || "NV001";

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [reason, setReason] = useState("");
  const [discount, setDiscount] = useState(0);
  const [nccPaid, setNccPaid] = useState(0);
  const [maPhieu, setMaPhieu] = useState("THN000001");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [resS, resP, resL] = await Promise.all([
          fetch("http://localhost:5000/api/imports/suppliers", { headers }),
          fetch("http://localhost:5000/api/products", { headers }),
          fetch("http://localhost:5000/api/return-imports/last-code", {
            headers,
          }),
        ]);

        if (resS.ok) setSuppliers(await resS.json());
        if (resP.ok) setProducts(await resP.json());
        if (resL.ok) {
          const data = await resL.json();
          if (data.lastCode) {
            const lastNum = parseInt(data.lastCode.replace("THN", ""));
            const nextNum = (lastNum + 1).toString().padStart(6, "0");
            setMaPhieu(`THN${nextNum}`);
          } else {
            setMaPhieu("THN000001");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC NHẬP FILE EXCEL ---
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const newItems = [...items];
        let errors = [];

        data.forEach((row, index) => {
          // 1. Lấy mã hàng (Xử lý trường hợp file Excel có tên cột khác nhau)
          const maHangTrongFile =
            row.MAHANGHOA || row["Mã hàng"] || row["MaHang"];

          if (!maHangTrongFile) {
            errors.push(`Dòng ${index + 2}: Không tìm thấy cột Mã hàng.`);
            return;
          }

          // 2. Tìm hàng hóa trong danh sách products
          const p = products.find((prod) => prod.MAHANGHOA === maHangTrongFile);

          if (!p) {
            errors.push(
              `Dòng ${index + 2}: Mã [${maHangTrongFile}] không tồn tại trong hệ thống.`,
            );
            return;
          }

          // 3. Kiểm tra tồn kho (Chặn nếu tồn kho = 0)
          const tonKhoHienTai = p.SOLUONGTONKHO ?? 0;
          if (tonKhoHienTai <= 0) {
            errors.push(
              `Dòng ${index + 2}: [${p.TENHANGHOA}] đã hết hàng (Tồn: 0), không thể trả.`,
            );
            return;
          }

          // 4. Lấy số lượng và giá từ file hoặc mặc định
          const slTra = Number(row.SOLUONG || row["Số lượng"] || 1);

          // Chặn nếu số lượng trả vượt tồn kho
          if (slTra > tonKhoHienTai) {
            errors.push(
              `Dòng ${index + 2}: [${p.TENHANGHOA}] trả ${slTra} vượt tồn kho thực tế (${tonKhoHienTai}).`,
            );
            return;
          }

          const giaTra = Number(
            row.DONGIATRA || row["Giá trả"] || p.DONGIABAN || 0,
          );

          // 5. Thêm vào danh sách (hoặc cập nhật nếu trùng)
          const existingIdx = newItems.findIndex(
            (item) => item.MAHANGHOA === p.MAHANGHOA,
          );
          if (existingIdx >= 0) {
            const updatedQty = newItems[existingIdx].qty + slTra;
            if (updatedQty > tonKhoHienTai) {
              newItems[existingIdx].qty = tonKhoHienTai;
            } else {
              newItems[existingIdx].qty = updatedQty;
            }
            newItems[existingIdx].total =
              newItems[existingIdx].qty * newItems[existingIdx].price;
          } else {
            newItems.push({
              MAHANGHOA: p.MAHANGHOA,
              TENHANGHOA: p.TENHANGHOA,
              qty: slTra,
              price: giaTra,
              importPrice: p.DONGIABAN || 0,
              total: slTra * giaTra,
              maxQty: tonKhoHienTai,
            });
          }
        });

        if (errors.length > 0) {
          Swal.fire({
            title: "Lỗi file dữ liệu",
            html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">${errors.join("<br/>")}</div>`,
            icon: "error",
          });
        } else {
          setItems(newItems);
          Swal.fire(
            "Thành công",
            `Đã nhập dữ liệu từ file Excel thành công.`,
            "success",
          );
        }
      } catch (err) {
        Swal.fire("Lỗi", "Định dạng file không hợp lệ!", "error");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const filteredProducts = products.filter((p) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return false;

    return (
      (p.TENHANGHOA || "").toLowerCase().includes(search) ||
      (p.MAHANGHOA || "").toLowerCase().includes(search)
    );
  });

  // --- TÍNH TOÁN ---
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const totalGoods = items.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const safeDiscount = Number(discount) || 0;
  const safeNccPaid = Number(nccPaid) || 0;

  const totalNeedFromNCC = totalGoods - safeDiscount;
  const debtAmount = totalNeedFromNCC - safeNccPaid;

  const handleSave = async (status) => {
    if (items.length === 0) {
      Swal.fire("Lỗi", "Phiếu trả phải có ít nhất 1 mặt hàng!", "error");
      return;
    }
    if (!selectedSupplier) {
      Swal.fire("Lỗi", "Vui lòng chọn nhà cung cấp!", "error");
      return;
    }

    const payload = {
      MAPHIEUTRAHANGNHAP: maPhieu,
      MANCC: selectedSupplier,
      MANVIEN: currentEmployeeId,
      TONGTENHANGTHANG: totalGoods,
      GIAMGIA: Number(discount) || 0,
      NCCCANTRA: debtAmount,
      TRANGTHAI: status,
      LYDOTRA: reason,
      items: items.map((i) => ({
        MAHANGHOA: i.MAHANGHOA,
        SOLUONG: i.qty,
        DONGIATRA: i.price,
        THANHTIEN: i.total,
      })),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/return-imports/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire("Thành công!", "Đã lưu phiếu trả hàng.", "success").then(
          () => {
            navigate("/transactions/return-imports");
          },
        );
      } else {
        Swal.fire("Thất bại", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Lỗi kết nối", "Không thể gửi dữ liệu!", error);
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    const val = value === "" ? "" : Number(value);
    if (field === "qty" && val > newItems[index].maxQty) {
      Swal.fire(
        "Cảnh báo",
        `Tồn kho chỉ còn ${newItems[index].maxQty}`,
        "warning",
      );
      return;
    }
    newItems[index][field] = val;
    newItems[index].total =
      (Number(newItems[index].qty) || 0) * (Number(newItems[index].price) || 0);
    setItems(newItems);
  };

  const handleSelectProduct = (p) => {
    const tonKho = p.SOLUONGTONKHO ?? 0;

    if (tonKho <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Hết hàng trong kho",
        text: `Sản phẩm ${p.TENHANGHOA} hiện đã hết hàng, không thể thực hiện trả hàng!`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    const existingIndex = items.findIndex((i) => i.MAHANGHOA === p.MAHANGHOA);
    if (existingIndex >= 0)
      handleUpdateItem(existingIndex, "qty", items[existingIndex].qty + 1);
    else {
      const price = Number(p.GIANHAPCU) || Number(p.DONGIABAN) || 0;
      setItems([
        ...items,
        {
          MAHANGHOA: p.MAHANGHOA,
          TENHANGHOA: p.TENHANGHOA,
          qty: 1,
          price: price,
          importPrice: Number(p.DONGIABAN) || 0,
          total: price,
          maxQty: Number(p.SOLUONGTONKHO) || 0,
        },
      ]);
    }
    setSearchTerm("");
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans text-[13px] text-slate-700">
      <DashboardHeader storeName="" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
        {/* 1. Phần tiêu đề giữ nguyên */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            <img src={Icons.ArrowBack} alt="Trở về" className="w-5 h-5" /> Quay
            lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight ml-4 border-l-2 border-gray-300 pl-4">
            Trả hàng nhập
          </h1>
        </div>

        {/* 2. KHỐI CHÍNH:  */}
        <div className="flex flex-row gap-4 items-start">
          {/* --- CỘT TRÁI:  --- */}
          <section className="flex-1 bg-white rounded-md shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-160px)] relative">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 relative z-20">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm hàng hóa theo mã hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:border-blue-500 text-base shadow-inner bg-white outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50">
                  <img src={Icons.Search} alt="" className="w-full h-full" />
                </div>
                {showDropdown && searchTerm && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-60 overflow-y-auto z-50">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 italic">
                        Không tìm thấy sản phẩm
                      </div>
                    ) : (
                      filteredProducts.map((p) => {
                        const tonKho = p.SOLUONGTONKHO ?? 0;
                        const giaBan = p.GIABAN ?? p.DONGIABAN ?? 0;

                        return (
                          <div
                            key={p.MAHANGHOA}
                            onClick={() => handleSelectProduct(p)}
                            className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-slate-800">
                                {p.TENHANGHOA || "Chưa có tên"}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {p.MAHANGHOA} | Tồn:{" "}
                                <span
                                  className={
                                    tonKho > 0
                                      ? "text-blue-500"
                                      : "text-red-500"
                                  }
                                >
                                  {tonKho}
                                </span>
                              </span>
                            </div>
                            <span className="font-bold text-blue-600">
                              {Number(giaBan).toLocaleString()} đ
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 border border-green-500 text-green-600 px-4 py-2 rounded font-bold hover:bg-green-50 transition-all cursor-pointer"
                >
                  <img src={Icons.FileExport} className="w-4 h-4" alt="" /> Chọn
                  file
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
              />
              {items.length === 0 ? (
                /* Màn hình trống: Giữ nguyên màu xanh lục bạn đã chọn */
                <div className="h-full flex flex-col items-center justify-center text-center p-20">
                  <h2 className="font-bold text-xl mb-2 text-gray-800">
                    Thêm sản phẩm từ file excel
                  </h2>
                  <p className="text-gray-500 mb-6 text-sm">
                    Xử lý dữ liệu (Tải về File mẫu:{" "}
                    <a href="#" className="text-blue-500 hover:underline">
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
                      className="w-7 h-7 brightness-0 invert"
                      alt=""
                    />
                    Chọn file dữ liệu
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase text-[11px] font-bold">
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3">Mã hàng</th>
                      <th className="p-3 w-1/3">Tên hàng</th>
                      <th className="p-3 text-center w-28">SL</th>
                      <th className="p-3 text-right">Giá vốn</th>
                      <th className="p-3 text-right">Giá trả lại</th>
                      <th className="p-3 text-right">Thành tiền</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="p-3 text-center text-gray-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-gray-500 font-medium text-xs">
                          {item.MAHANGHOA}
                        </td>
                        <td className="p-3 font-bold text-black">
                          {item.TENHANGHOA}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-full text-center border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white font-bold"
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateItem(idx, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-3 text-right text-gray-600 font-medium">
                          {(Number(item.importPrice) || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            className="w-full text-right border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white font-bold text-blue-600"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(idx, "price", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-blue-700 text-base">
                          {(Number(item.total) || 0).toLocaleString()}
                        </td>
                        <td
                          className="p-3 text-center cursor-pointer text-gray-400 hover:text-red-600"
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== idx))
                          }
                        >
                          ✕
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* --- CỘT PHẢI: --- */}
          <aside className="w-[360px] bg-white rounded-md shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-160px)]">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-blue-600 uppercase">
                {currentUser}
              </span>
              <span className="text-gray-500 font-mono">
                {new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 bg-white font-medium"
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
                  <span className="text-gray-600">Mã phiếu trả</span>
                  <b className="text-gray-400 font-mono">{maPhieu}</b>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">
                    Tổng tiền hàng trả ({totalQty})
                  </span>
                  <span className="font-bold text-gray-800 text-[14px]">
                    {totalGoods.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giảm giá</span>
                  <input
                    type="number"
                    className="w-32 text-right border-b-2 border-gray-300 focus:border-blue-500 outline-none font-bold text-red-500"
                    value={discount || ""}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center font-bold text-[14px] text-blue-600">
                  <span>NCC cần trả</span>
                  <span>{totalNeedFromNCC.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tiền NCC trả tiền mặt</span>
                  <input
                    type="number"
                    className="w-32 text-right border-b-2 border-blue-200 py-1 outline-none font-bold text-green-700 bg-transparent"
                    value={nccPaid || ""}
                    onChange={(e) => setNccPaid(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tính vào công nợ</span>
                  <span className="font-bold text-gray-800">
                    {debtAmount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-4">
                  <label className="block text-gray-500 font-bold uppercase text-[11px] mb-1">
                    Lý do trả hàng
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500 resize-none h-24 italic text-gray-700"
                    placeholder="Nhập lý do tại đây..."
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleSave("Phiếu tạm")}
                className="flex-1 bg-[#0f62fe] hover:bg-blue-700 text-white font-bold py-2.5 rounded active:scale-95 transition-all text-[15px] flex items-center justify-center gap-1"
              >
                <img
                  src={Icons.ImportFile}
                  alt=""
                  className="w-5 h-5 brightness-0 invert"
                />{" "}
                Lưu tạm
              </button>
              <button
                onClick={() => handleSave("Đã trả hàng")}
                className="flex-1 bg-[#00a651] hover:bg-green-700 text-white font-bold py-2.5 rounded transition-colors shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1 text-[15px]"
              >
                <img
                  src={Icons.Tick}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />{" "}
                Hoàn thành
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CreateReturnImport;
