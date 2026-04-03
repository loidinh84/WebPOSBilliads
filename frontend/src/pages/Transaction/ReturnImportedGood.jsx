import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { Calendar, Printer, Delete, SaveFile } from "../../assets/icons/index";

function ReturnImportedGood() {
  // 1. Quản lý trạng thái mở rộng dòng chi tiết
  const [expandedRowId, setExpandedRowId] = useState(null);

  // 2. States dành cho bộ lọc
  const [searchId, setSearchId] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Đã trả hàng"]); // Đã đổi thành Đã trả hàng

  // 3. Dữ liệu mẫu (Đã đổi trạng thái thành Đã trả hàng)
  const [returnInvoices] = useState([
    {
      id: "TH000001",
      time: "31/03/2026 14:00",
      supplier: "Đại lý Hồng Phúc",
      totalReturn: "150,000",
      discount: "0",
      supplierNeedsToPay: "150,000",
      supplierPaid: "150,000",
      status: "Đã trả hàng",
      creator: "Lợi - Thu ngân",
      branch: "Chi nhánh trung tâm",
      items: [
        {
          code: "SP0000018",
          name: "Redbull",
          qty: 10,
          price: 15000,
          total: "150,000",
        },
      ],
    },
    {
      id: "TH000002",
      time: "2026/03/30 09:30",
      supplier: "Phụ Kiện Bida Phát Đạt",
      totalReturn: "450,000",
      discount: "0",
      supplierNeedsToPay: "450,000",
      supplierPaid: "0",
      status: "Đã trả hàng",
      creator: "Tài - Kế Toán",
      branch: "Chi nhánh trung tâm",
      items: [
        {
          code: "SP0000023",
          name: "Lơ bida xanh",
          qty: 30,
          price: 15000,
          total: "450,000",
        },
      ],
    },
  ]);

  // LOGIC LỌC DỮ LIỆU
  const filteredInvoices = returnInvoices.filter((inv) => {
    const matchesId = inv.id.toLowerCase().includes(searchId.toLowerCase());
    const matchesSupplier = inv.supplier
      .toLowerCase()
      .includes(searchSupplier.toLowerCase());
    const matchesStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.status);
    const matchesItem =
      searchItem === "" ||
      inv.items.some(
        (item) =>
          item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.code.toLowerCase().includes(searchItem.toLowerCase()),
      );
    return matchesId && matchesSupplier && matchesStatus && matchesItem;
  });

  const toggleStatusFilter = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-black">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1440px] mx-auto p-4 flex gap-4">
        {/* ---------------- CỘT TRÁI: SIDEBAR LỌC ---------------- */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-[12px] text-gray-700">
              Tìm kiếm
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Theo mã phiếu trả"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 outline-none"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo mã, tên hàng"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 outline-none"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
              <input
                type="text"
                placeholder="Theo mã, tên NCC"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 outline-none"
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-[12px] text-gray-700">
              Thời gian
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="radio"
                  name="time"
                  defaultChecked
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  Tháng này
                </span>
              </label>
              <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                <span className="text-gray-500">Lựa chọn khác</span>
                <img
                  src={Calendar}
                  alt=""
                  className="w-4 h-4 opacity-50 brightness-0"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-[12px] text-gray-700">
              Trạng thái
            </h3>
            <div className="space-y-2">
              {["Phiếu tạm", "Đã trả hàng", "Đã hủy"].map((st) => (
                <label
                  key={st}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                    checked={filterStatuses.includes(st)}
                    onChange={() => toggleStatusFilter(st)}
                  />
                  <span className="group-hover:text-blue-600 transition-colors">
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- CỘT PHẢI: NỘI DUNG CHÍNH ---------------- */}
        <section className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Phiếu trả hàng nhập
          </h1>

          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-black">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Mã phiếu trả</th>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Nhà cung cấp</th>
                  <th className="p-3 text-right">Tổng tiền trả</th>
                  <th className="p-3 text-right text-gray-400 font-medium">
                    Giảm giá
                  </th>
                  <th className="p-3 text-right">NCC cần trả</th>
                  <th className="p-3 text-right">NCC đã trả</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <React.Fragment key={inv.id}>
                      <tr
                        onClick={() =>
                          setExpandedRowId(
                            expandedRowId === inv.id ? null : inv.id,
                          )
                        }
                        className={`cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${expandedRowId === inv.id ? "bg-[#e1f0ff]" : ""}`}
                      >
                        <td className="p-3 font-bold text-blue-700">
                          {inv.id}
                        </td>
                        <td className="p-3 text-gray-600 font-mono">
                          {inv.time}
                        </td>
                        <td className="p-3 font-medium">{inv.supplier}</td>
                        <td className="p-3 text-right font-bold">
                          {inv.totalReturn}
                        </td>
                        <td className="p-3 text-right">{inv.discount}</td>
                        <td className="p-3 text-right font-bold text-blue-700">
                          {inv.supplierNeedsToPay}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {inv.supplierPaid}
                        </td>
                        <td className="p-3 text-center">{inv.status}</td>
                      </tr>

                      {expandedRowId === inv.id && (
                        <tr className="bg-white">
                          <td colSpan="8" className="p-6 border-b shadow-inner">
                            <div className="flex gap-4 border-b border-gray-200 mb-4 text-xs font-bold uppercase">
                              <button className="pb-2 border-b-2 border-blue-600 text-blue-700 cursor-pointer">
                                Thông tin
                              </button>
                              <button className="pb-2 text-gray-400 hover:text-black cursor-pointer">
                                Lịch sử thanh toán
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-6">
                              <div className="col-span-2 grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm">
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Mã phiếu trả:
                                  </span>
                                  <strong>{inv.id}</strong>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Trạng thái:
                                  </span>
                                  <span className="font-bold text-green-600 uppercase text-[11px]">
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Thời gian:
                                  </span>
                                  <span className="font-bold flex items-center gap-1">
                                    {inv.time}{" "}
                                    <img
                                      src={Calendar}
                                      className="w-3.5 h-3.5 opacity-40 brightness-0"
                                      alt=""
                                    />
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Người tạo:
                                  </span>
                                  <strong>{inv.creator}</strong>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Nhà cung cấp:
                                  </span>
                                  <strong className="text-blue-700">
                                    {inv.supplier}
                                  </strong>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Chi nhánh:
                                  </span>
                                  <span>{inv.branch}</span>
                                </div>
                              </div>
                              <div className="col-span-1">
                                <textarea
                                  className="w-full h-full border border-gray-300 rounded p-2 text-gray-500 italic resize-none outline-none focus:border-blue-400"
                                  placeholder="Ghi chú..."
                                ></textarea>
                              </div>
                            </div>

                            <table className="w-full text-xs border border-gray-200 mb-4 text-black">
                              <thead className="bg-[#f1f3f9] font-bold text-gray-700 uppercase">
                                <tr>
                                  <th className="p-2 border">Mã hàng</th>
                                  <th className="p-2 border text-left">
                                    Tên hàng
                                  </th>
                                  <th className="p-2 border text-center w-16">
                                    SL
                                  </th>
                                  <th className="p-2 border text-right">
                                    Giá nhập
                                  </th>
                                  <th className="p-2 border text-right font-bold">
                                    Thành tiền
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {inv.items.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="p-2 border text-center text-gray-500 font-mono">
                                      {item.code}
                                    </td>
                                    <td className="p-2 border font-medium">
                                      {item.name}
                                    </td>
                                    <td className="p-2 border text-center">
                                      {item.qty}
                                    </td>
                                    <td className="p-2 border text-right">
                                      {item.price.toLocaleString()}
                                    </td>
                                    <td className="p-2 border text-right font-bold">
                                      {item.total}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="flex justify-end mt-4">
                              <div className="w-[350px] space-y-1.5 text-right bg-gray-50 p-4 rounded-md border text-black">
                                <div className="flex justify-between w-full">
                                  <span>Tổng số lượng:</span>{" "}
                                  <strong>{inv.items.length}</strong>
                                </div>
                                <div className="flex justify-between w-full">
                                  <span>Tổng tiền hàng trả:</span>{" "}
                                  <strong>{inv.totalReturn}</strong>
                                </div>
                                <div className="flex justify-between w-full text-gray-500 border-b pb-1">
                                  <span>Giảm giá:</span>{" "}
                                  <span>{inv.discount}</span>
                                </div>
                                <div className="flex justify-between w-full font-bold mt-1">
                                  <span>NCC cần trả:</span>
                                  <span className="text-xl underline underline-offset-4 decoration-2">
                                    {inv.supplierNeedsToPay}
                                  </span>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer active:scale-95 transition-all shadow-sm">
                                    <img
                                      src={Printer}
                                      className="w-3.5 h-3.5 invert brightness-0"
                                      alt=""
                                    />{" "}
                                    In
                                  </button>
                                  <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer active:scale-95 transition-all shadow-sm">
                                    <img
                                      src={SaveFile}
                                      className="w-3.5 h-3.5 invert brightness-0"
                                      alt=""
                                    />{" "}
                                    Xuất file
                                  </button>
                                  <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer active:scale-95 transition-all shadow-sm">
                                    <img
                                      src={Delete}
                                      className="w-3.5 h-3.5 invert brightness-0"
                                      alt=""
                                    />{" "}
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-20 text-center text-gray-400 italic"
                    >
                      Không tìm thấy phiếu trả hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="p-10 bg-white border-t border-gray-50 text-center text-gray-400 italic font-medium">
              -- Hết danh sách phiếu trả --
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ReturnImportedGood;
