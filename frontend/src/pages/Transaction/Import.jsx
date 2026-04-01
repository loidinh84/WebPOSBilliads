import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function Import() {
  // 1. Quản lý trạng thái đóng/mở dòng chi tiết
  const [expandedRowId, setExpandedRowId] = useState("PN000001");

  // 2. States dành cho bộ lọc
  const [searchId, setSearchId] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Đã nhập hàng"]); // Mặc định chọn Đã nhập hàng

  // 3. Mock Data (Đã cập nhật tên nhân viên theo ảnh trước đó)
  const [importInvoices] = useState([
    {
      id: "PN000001",
      time: "04/03/2026 12:00",
      supplier: "Đại lý Hồng Phúc",
      amountOwed: "600,000",
      status: "Đã nhập hàng",
      creator: "Tài - Kế Toán",
      branch: "Chi nhánh trung tâm",
      importer: "Tài - Kế Toán",
      items: [
        {
          code: "SP0000018",
          name: "Redbull",
          qty: 24,
          price: 15000,
          discount: 0,
          importPrice: 15000,
          total: "360,000",
        },
        {
          code: "SP0000017",
          name: "Pepsi",
          qty: 24,
          price: 10000,
          discount: 0,
          importPrice: 10000,
          total: "240,000",
        },
      ],
      summary: {
        totalQty: 48,
        totalItems: 2,
        totalGoods: "600,000",
        invoiceDiscount: "0",
        finalTotal: "600,000",
        paid: "600,000",
      },
    },
    {
      id: "PN000002",
      time: "04/03/2026 10:30",
      supplier: "Cơ Sở Bida Thanh Minh",
      amountOwed: "2,350,000",
      status: "Đã nhập hàng",
      creator: "Tài - Kế Toán",
      branch: "Chi nhánh trung tâm",
      importer: "Tài - Kế Toán",
      items: [
        {
          code: "SP0000019",
          name: "Cơ bida lỗ loại 1",
          qty: 5,
          price: 450000,
          discount: 0,
          importPrice: 450000,
          total: "2,250,000",
        },
        {
          code: "SP0000020",
          name: "Đầu cơ bida",
          qty: 10,
          price: 10000,
          discount: 0,
          importPrice: 10000,
          total: "100,000",
        },
      ],
      summary: {
        totalQty: 15,
        totalItems: 2,
        totalGoods: "2,350,000",
        invoiceDiscount: "0",
        finalTotal: "2,350,000",
        paid: "2,350,000",
      },
    },
    {
      id: "PN000003",
      time: "04/03/2026 21:00",
      supplier: "Đại lý Bia Nước Ngọt Q1",
      amountOwed: "1,700,000",
      status: "Đã nhập hàng",
      creator: "Lợi - Thu ngân",
      branch: "Chi nhánh trung tâm",
      importer: "Lợi - Thu ngân",
      items: [
        {
          code: "SP0000021",
          name: "Bia Tiger Bạc (Thùng)",
          qty: 3,
          price: 400000,
          discount: 0,
          importPrice: 400000,
          total: "1,200,000",
        },
      ],
      summary: {
        totalQty: 3,
        totalItems: 1,
        totalGoods: "1,200,000",
        invoiceDiscount: "0",
        finalTotal: "1,200,000",
        paid: "1,200,000",
      },
    },
  ]);

  // LOGIC LỌC DỮ LIỆU
  const filteredInvoices = importInvoices.filter((inv) => {
    const matchesId = inv.id.toLowerCase().includes(searchId.toLowerCase());
    const matchesSupplier = inv.supplier
      .toLowerCase()
      .includes(searchSupplier.toLowerCase());
    const matchesStatus =
      filterStatuses.length === 0 || filterStatuses.includes(inv.status);

    // Tìm trong danh sách hàng hóa bên trong phiếu
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

      <div className="flex p-4 gap-4">
        {/* ---------------- CỘT TRÁI: SIDEBAR LỌC ---------------- */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-[12px]">
              Tìm kiếm
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Theo mã phiếu nhập"
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
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-[12px]">
              Thời gian
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="timeFilter"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  defaultChecked
                />
                <span>Hôm nay</span>
              </label>
              <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                <span className="text-gray-500">Lựa chọn khác</span>
                <img
                  src={Icons.Calendar}
                  alt=""
                  className="w-4 h-4 opacity-50 brightness-0"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 cursor-pointer select-none">
              <h3 className="font-bold text-gray-700 uppercase text-[12px]">
                Trạng thái
              </h3>
              <img
                src={Icons.ArrowUp}
                alt=""
                className="w-4 h-4 brightness-0 opacity-50"
              />
            </div>
            <div className="space-y-2">
              {["Phiếu tạm", "Đã nhập hàng", "Đã hủy"].map((st) => (
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
                  <span className="group-hover:text-blue-600">{st}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- CỘT PHẢI: NỘI DUNG CHÍNH ---------------- */}
        <section className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Phiếu nhập hàng</h1>

          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 text-black font-bold uppercase text-[11px]">
                  <th className="p-3 w-1/5">Mã nhập hàng</th>
                  <th className="p-3 w-1/5">Thời gian</th>
                  <th className="p-3 w-1/5">Nhà cung cấp</th>
                  <th className="p-3 w-1/5 text-right">Cần trả NCC</th>
                  <th className="p-3 w-1/5 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const isExpanded = expandedRowId === invoice.id;
                  return (
                    <React.Fragment key={invoice.id}>
                      <tr
                        onClick={() =>
                          setExpandedRowId(isExpanded ? null : invoice.id)
                        }
                        className={`cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 ${isExpanded ? "bg-[#e1f0ff]" : ""}`}
                      >
                        <td className="p-3 font-bold text-blue-700">
                          {invoice.id}
                        </td>
                        <td className="p-3 text-gray-600">{invoice.time}</td>
                        <td className="p-3 font-medium">{invoice.supplier}</td>
                        <td className="p-3 text-right font-bold">
                          {invoice.amountOwed}
                        </td>
                        <td className="p-3 text-center">{invoice.status}</td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-white">
                          <td colSpan="5" className="p-6 border-b shadow-inner">
                            <div className="flex gap-4 border-b border-gray-200 mb-4 text-xs">
                              <button className="pb-2 border-b-2 border-blue-600 font-bold text-blue-700 uppercase cursor-pointer">
                                Thông tin
                              </button>
                              <button className="pb-2 text-gray-500 hover:text-black uppercase cursor-pointer font-bold">
                                Lịch sử thanh toán
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-6">
                              <div className="col-span-2 grid grid-cols-2 gap-y-2 text-sm">
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Mã phiếu nhập:
                                  </span>
                                  <strong>{invoice.id}</strong>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Trạng thái:
                                  </span>
                                  <span className="font-bold text-green-600 uppercase text-[11px]">
                                    {invoice.status}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Thời gian:
                                  </span>
                                  <span className="flex items-center gap-1 font-bold">
                                    {invoice.time}{" "}
                                    <img
                                      src={Icons.Calendar}
                                      className="w-3.5 h-3.5 brightness-0 opacity-40"
                                    />
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Chi nhánh:
                                  </span>
                                  <span>{invoice.branch}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1 mr-4">
                                  <span className="text-gray-500">
                                    Nhà cung cấp:
                                  </span>
                                  <span className="text-blue-700 font-bold">
                                    {invoice.supplier}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-dashed py-1">
                                  <span className="text-gray-500">
                                    Người nhập:
                                  </span>
                                  <span>{invoice.importer}</span>
                                </div>
                              </div>
                              <div className="col-span-1">
                                <textarea
                                  className="w-full h-full border rounded p-2 text-gray-500 italic resize-none outline-none focus:border-blue-400"
                                  placeholder="Ghi chú..."
                                ></textarea>
                              </div>
                            </div>

                            <table className="w-full text-xs border mb-4">
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
                                    Đơn giá
                                  </th>
                                  <th className="p-2 border text-right">
                                    Giảm giá
                                  </th>
                                  <th className="p-2 border text-right font-bold">
                                    Thành tiền
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice.items.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b hover:bg-gray-50"
                                  >
                                    <td className="p-2 border text-gray-500 font-mono">
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
                                    <td className="p-2 border text-right">
                                      {item.discount}
                                    </td>
                                    <td className="p-2 border text-right font-bold">
                                      {item.total}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="flex justify-end mt-4">
                              <div className="w-[350px] space-y-1.5 text-right bg-gray-50 p-4 rounded-md border">
                                <div className="flex justify-between w-full">
                                  <span>Tổng số lượng:</span>{" "}
                                  <strong>{invoice.summary.totalQty}</strong>
                                </div>
                                <div className="flex justify-between w-full border-b pb-1">
                                  <span>Tổng tiền hàng:</span>{" "}
                                  <strong>{invoice.summary.totalGoods}</strong>
                                </div>
                                <div className="flex justify-between w-full font-bold mt-1 text-black">
                                  <span>Cần trả NCC:</span>
                                  <span className="text-xl underline underline-offset-4 decoration-2">
                                    {invoice.summary.finalTotal}
                                  </span>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
                                    <img
                                      src={Icons.Printer}
                                      className="w-3.5 h-3.5 brightness-0 invert"
                                    />{" "}
                                    In
                                  </button>
                                  <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
                                    <img
                                      src={Icons.Export}
                                      className="w-3.5 h-3.5 brightness-0 invert"
                                    />{" "}
                                    Xuất file
                                  </button>
                                  <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
                                    <img
                                      src={Icons.Delete}
                                      className="w-3.5 h-3.5 brightness-0 invert"
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
                  );
                })}
              </tbody>
            </table>

            {/* Đã loại bỏ vạch phân trang, chỉ để thông báo cuối danh sách */}
            <div className="p-8 bg-white border-t border-gray-50 text-center text-gray-400 italic">
              -- Hết danh sách phiếu nhập --
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Import;
