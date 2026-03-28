import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import { Printer, Delete, Calendar, SaveFile } from "../../assets/icons/index";

function Invoices() {
  const [expandedRow, setExpandedRow] = useState("HD000001");
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [searchTerm, setSearchTerm] = useState("");

  const [invoices, setInvoices] = useState([
    {
      id: "HD000001",
      time: "05/03/2026",
      customer: "William Roberto TaiSleep",
      total: 150000,
      paid: 150000,
      discount: 0,
      status: "Hoàn thành",
      details: {
        checkIn: "05/03/2026 20:30",
        checkOut: "05/03/2026 21:35",
        duration: "01:05:35",
        creator: "Thành Lợi",
        table: "Bàn 4",
        items: [
          {
            id: "SP000019",
            name: "Bàn lỗ",
            qty: 1,
            price: 55000,
            discount: 0,
            sellPrice: 55000,
            total: 60000,
          },
          {
            id: "SP000015",
            name: "Mì Xào",
            qty: 2,
            price: 20000,
            discount: 0,
            sellPrice: 20000,
            total: 40000,
          },
          {
            id: "SP000018",
            name: "Redbull",
            qty: 2,
            price: 25000,
            discount: 0,
            sellPrice: 25000,
            total: 50000,
          },
        ],
      },
    },
    {
      id: "HD000002",
      time: "05/03/2026",
      customer: "Christiano KhangJohancalor",
      total: 700000,
      paid: 700000,
      discount: 0,
    },
    {
      id: "HD000003",
      time: "05/03/2026",
      customer: "Ko Pin DowLoi",
      total: 500000,
      paid: 500000,
      discount: 0,
    },
    {
      id: "HD000004",
      time: "05/03/2026",
      customer: "Levis",
      total: 180000,
      paid: 180000,
      discount: 0,
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
      setExpandedRow(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-black text-[13px]">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Giao dịch" />

      <main className="max-w-[1600px] mx-auto p-4 flex gap-4">
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-[280px] space-y-3 shrink-0">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Theo mã hóa đơn"
              className="w-full border rounded-md px-3 py-1.5 mb-2 outline-none focus:border-blue-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              placeholder="Theo tên hàng"
              className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">
              Thời gian
            </h3>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="time"
                defaultChecked
                className="w-4 h-4 accent-blue-600"
              />{" "}
              Hôm nay
            </label>
            <div className="flex items-center justify-between border rounded px-3 py-1.5 cursor-pointer bg-white">
              <span>Lựa chọn khác</span>
              <img
                src={Calendar}
                alt="calendar"
                className="w-5 h-5 brightness-0"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center font-bold mb-3 cursor-pointer uppercase text-gray-700">
              Trạng thái <span>^</span>
            </div>
            {["Đang xử lý", "Hoàn thành", "Đã hủy"].map((st) => (
              <label
                key={st}
                className="flex items-center gap-2 mb-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={st === "Hoàn thành"}
                  className="w-4 h-4 accent-blue-600"
                />{" "}
                {st}
              </label>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center font-bold mb-3 cursor-pointer uppercase text-gray-700">
              Phương thức <span>^</span>
            </div>
            {["Tiền mặt", "Thẻ", "Chuyển khoản", "Ví điện tử"].map((pt) => (
              <label
                key={pt}
                className="flex items-center gap-2 mb-1 cursor-pointer"
              >
                <input type="checkbox" className="w-4 h-4 accent-blue-600" />{" "}
                {pt}
              </label>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 uppercase text-gray-700">
              Phòng/Bàn
            </h3>
            <input
              type="text"
              placeholder="Chọn khu vực"
              className="w-full border rounded-md px-3 py-1.5 mb-2 outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="Chọn phòng/bàn..."
              className="w-full border rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>
        </aside>

        {/* --- DANH SÁCH HÓA ĐƠN --- */}
        <section className="flex-1 bg-white rounded shadow-sm border border-gray-200 overflow-hidden text-black">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Hóa đơn</h2>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-200 font-bold uppercase text-[11px] text-gray-600">
                <th className="p-3 text-left border-r">Mã hóa đơn</th>
                <th className="p-3 text-left border-r">Thời gian</th>
                <th className="p-3 text-left border-r">Khách hàng</th>
                <th className="p-3 text-right border-r">Tổng tiền hàng</th>
                <th className="p-3 text-right border-r">Giảm giá</th>
                <th className="p-3 text-right">Khách đã trả</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .filter((inv) => inv.id.includes(searchTerm.toUpperCase()))
                .map((inv) => (
                  <React.Fragment key={inv.id}>
                    <tr
                      className={`border-b cursor-pointer hover:bg-blue-50 transition-colors ${expandedRow === inv.id ? "bg-[#e1f0ff]" : ""}`}
                      onClick={() =>
                        setExpandedRow(expandedRow === inv.id ? null : inv.id)
                      }
                    >
                      <td className="p-3 border-r font-bold text-blue-700">
                        {inv.id}
                      </td>
                      <td className="p-3 border-r">{inv.time}</td>
                      <td className="p-3 border-r text-black">
                        {inv.customer}
                      </td>
                      <td className="p-3 border-r text-right font-bold">
                        {inv.total.toLocaleString()}
                      </td>
                      <td className="p-3 border-r text-right">
                        {inv.discount}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {inv.paid.toLocaleString()}
                      </td>
                    </tr>

                    {/* CHI TIẾT KHI MỞ RỘNG */}
                    {expandedRow === inv.id && (
                      <tr className="bg-white">
                        <td colSpan="6" className="p-6 border-b shadow-inner">
                          <div className="flex gap-4 border-b border-gray-200 mb-4 text-xs">
                            <button
                              className={`pb-2 px-2 font-bold uppercase ${activeTab === "Thông tin" ? "border-b-2 border-blue-600 text-black" : "text-black"}`}
                              onClick={() => setActiveTab("Thông tin")}
                            >
                              Thông tin
                            </button>
                            <button
                              className={`pb-2 px-2 font-bold uppercase ${activeTab === "Lịch sử" ? "border-b-2 border-blue-600 text-black" : "text-black"}`}
                              onClick={() => setActiveTab("Lịch sử")}
                            >
                              Lịch sử thanh toán
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-x-20 mb-6 text-sm">
                            <div className="space-y-1">
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Mã hóa đơn:</span>{" "}
                                <strong>{inv.id}</strong>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Giờ đến:</span>{" "}
                                <span className="flex items-center gap-1">
                                  {inv.details?.checkIn}{" "}
                                  <img
                                    src={Calendar}
                                    alt="calendar"
                                    className="w-4 h-4 brightness-0"
                                  />
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Giờ đi:</span>{" "}
                                <span className="flex items-center gap-1">
                                  {inv.details?.checkOut}{" "}
                                  <img
                                    src={Calendar}
                                    alt="calendar"
                                    className="w-4 h-4 brightness-0"
                                  />
                                </span>
                              </div>

                              {/* GIỜ CHƠI - SỬA ĐỔI ĐỂ LOẠI BỎ HIGHLIGHT */}
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span className="text-gray-500 font-medium">
                                  Giờ chơi:
                                </span>{" "}
                                <span className="font-mono font-bold text-black uppercase">
                                  {inv.details?.duration || "01:05:35"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Trạng thái:</span>{" "}
                                <span className="text-black">Hoàn thành</span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Người tạo:</span>{" "}
                                <span>{inv.details?.creator}</span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Khách hàng:</span>{" "}
                                <span className="text-black">
                                  {inv.customer}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5">
                                <span>Tên bàn:</span>{" "}
                                <span className="text-black font-bold">
                                  {inv.details?.table}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bảng hàng hóa bên trong */}
                          <table className="w-full border text-xs mb-4">
                            <thead className="bg-[#f1f3f9] font-bold text-gray-700 uppercase">
                              <tr>
                                <th className="p-2 border">Mã hàng hóa</th>
                                <th className="p-2 border text-left">
                                  Tên hàng
                                </th>
                                <th className="p-2 border text-center">
                                  Số lượng
                                </th>
                                <th className="p-2 border text-right">
                                  Đơn giá
                                </th>
                                <th className="p-2 border text-right text-black">
                                  Giảm giá
                                </th>
                                <th className="p-2 border text-right">
                                  Giá bán
                                </th>
                                <th className="p-2 border text-right font-bold">
                                  Thành tiền
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.details?.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b hover:bg-gray-50 transition-colors"
                                >
                                  <td className="p-2 border text-black">
                                    {item.id}
                                  </td>
                                  <td className="p-2 border text-left font-medium">
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
                                  <td className="p-2 border text-right">
                                    {item.sellPrice.toLocaleString()}
                                  </td>
                                  <td className="p-2 border text-right font-bold text-black">
                                    {item.total.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Summary & Buttons */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1 max-w-[40%]">
                              <textarea
                                placeholder="Ghi chú..."
                                className="w-full border-b border-gray-300 outline-none text-black italic p-1 h-10 resize-none bg-transparent focus:border-blue-400 transition-colors"
                              ></textarea>
                            </div>
                            <div className="flex flex-col items-end gap-1 w-[350px] bg-gray-50 p-4 rounded-md shadow-sm border text-black">
                              <div className="flex justify-between w-full">
                                <span>Tổng số lượng:</span>{" "}
                                <strong className="text-black font-bold text-lg">
                                  5
                                </strong>
                              </div>
                              <div className="flex justify-between w-full">
                                <span>Tổng tiền hàng:</span>{" "}
                                <strong className="text-black font-bold text-lg">
                                  150,000
                                </strong>
                              </div>
                              <div className="flex justify-between w-full text-gray-500 border-b pb-1">
                                <span>Giảm giá:</span> <span>0</span>
                              </div>
                              <div className="flex justify-between w-full font-bold mt-1 text-black">
                                <span className="text-sm">Khách cần trả:</span>{" "}
                                <span className="text-xl underline underline-offset-4 decoration-2">
                                  150,000
                                </span>
                              </div>
                              <div className="flex justify-between w-full text-gray-500 text-xs">
                                <span>Khách đã trả:</span> <span>150,000</span>
                              </div>

                              <div className="flex gap-2 mt-6">
                                <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
                                  <img
                                    src={Printer}
                                    alt="print"
                                    className="w-4 h-4"
                                  />{" "}
                                  In
                                </button>
                                <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
                                  <img
                                    src={SaveFile}
                                    alt="export"
                                    className="w-4 h-4"
                                  />{" "}
                                  Xuất file
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(inv.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                                >
                                  <img
                                    src={Delete}
                                    alt="delete"
                                    className="w-4 h-4"
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
                ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Invoices;
