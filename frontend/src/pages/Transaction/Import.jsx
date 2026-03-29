import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function Import() {
  // 1. Quản lý trạng thái dòng nào đang được mở rộng (Expand)
  // Đổi mặc định mở PN000001
  const [expandedRowId, setExpandedRowId] = useState('PN000001');

  // Hàm xử lý đóng/mở dòng
  const toggleRow = (id) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  // 2. Mock Data đã được cập nhật đầy đủ chi tiết cho 4 phiếu
  const importInvoices = [
    {
      id: 'PN000001',
      time: '04/03/2026 12:00',
      supplier: 'Đại lý Hồng Phúc',
      amountOwed: '600,000',
      status: 'Đã nhập hàng',
      creator: 'Tài - Kế Toán',
      branch: 'Chi nhánh trung tâm',
      importer: 'Tài - Kế Toán',
      items: [
        { code: 'SP0000018', name: 'Redbull', qty: 24, price: 15000, discount: 0, importPrice: 15000, total: '360,000' },
        { code: 'SP0000017', name: 'Pepsi', qty: 24, price: 10000, discount: 0, importPrice: 10000, total: '240,000' }
      ],
      summary: { totalQty: 48, totalItems: 2, totalGoods: '600,000', invoiceDiscount: '0', finalTotal: '600,000', paid: '600,000' }
    },
    { 
      id: 'PN000002', 
      time: '04/03/2026 10:30', 
      supplier: 'Cơ Sở Bida Thanh Minh', 
      amountOwed: '2,350,000', 
      status: 'Đã nhập hàng',
      creator: 'Tài - Kế Toán',
      branch: 'Chi nhánh trung tâm',
      importer: 'Tài - Kế Toán',
      items: [
        { code: 'SP0000019', name: 'Cơ bida lỗ loại 1', qty: 5, price: 450000, discount: 0, importPrice: 450000, total: '2,250,000' },
        { code: 'SP0000020', name: 'Đầu cơ bida', qty: 10, price: 10000, discount: 0, importPrice: 10000, total: '100,000' }
      ],
      summary: { totalQty: 15, totalItems: 2, totalGoods: '2,350,000', invoiceDiscount: '0', finalTotal: '2,350,000', paid: '2,350,000' }
    },
    { 
      id: 'PN000003', 
      time: '04/03/2026 21:00', 
      supplier: 'Đại lý Bia Nước Ngọt Q1', 
      amountOwed: '1,700,000', 
      status: 'Đã nhập hàng',
      creator: 'Tài - Kế Toán',
      branch: 'Chi nhánh trung tâm',
      importer: 'Tài - Kế Toán',
      items: [
        { code: 'SP0000021', name: 'Bia Tiger Bạc (Thùng)', qty: 3, price: 400000, discount: 0, importPrice: 400000, total: '1,200,000' },
        { code: 'SP0000022', name: 'Bia Sài Gòn Special (Thùng)', qty: 2, price: 250000, discount: 0, importPrice: 250000, total: '500,000' }
      ],
      summary: { totalQty: 5, totalItems: 2, totalGoods: '1,700,000', invoiceDiscount: '0', finalTotal: '1,700,000', paid: '1,700,000' }
    },
    { 
      id: 'PN000004', 
      time: '04/03/2026 22:45', 
      supplier: 'Phụ Kiện Bida Phát Đạt', 
      amountOwed: '450,000', 
      status: 'Đã nhập hàng',
      creator: 'Tài - Kế Toán',
      branch: 'Chi nhánh trung tâm',
      importer: 'Tài - Kế Toán',
      items: [
        { code: 'SP0000023', name: 'Lơ bida xanh', qty: 20, price: 15000, discount: 0, importPrice: 15000, total: '300,000' },
        { code: 'SP0000024', name: 'Bao tay bida (Hộp)', qty: 3, price: 50000, discount: 0, importPrice: 50000, total: '150,000' }
      ],
      summary: { totalQty: 23, totalItems: 2, totalGoods: '450,000', invoiceDiscount: '0', finalTotal: '450,000', paid: '450,000' }
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-gray-800">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Giao dịch" />

      <div className="flex p-4 gap-4">
        
        {/* ---------------- CỘT TRÁI: SIDEBAR LỌC ---------------- */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Tìm kiếm</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Theo mã phiếu nhập" className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Theo mã, tên hàng" className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Theo mã, tên NCC" className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Thời gian</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="timeFilter" className="w-4 h-4 text-blue-600" defaultChecked />
                <input type="text" value="Hôm nay" readOnly className="flex-1 border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-600 cursor-default" />
              </label>
              <label className="flex items-center gap-2 cursor-pointer relative">
                <input type="radio" name="timeFilter" className="w-4 h-4 text-blue-600" />
                <div className="flex-1 relative">
                  <input type="text" placeholder="Lựa chọn khác" className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4">
                    <img src={Icons.Calendar} alt="" className="w-full h-full object-contain filter brightness-0 opacity-50" />
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
              <h3 className="font-semibold text-gray-800">Trạng thái</h3>
                {/* Đã áp dụng filter brightness-0 để đảm bảo icon màu đen */}
                <img src={Icons.ArrowUp} alt="" className="w-5 h-5 object-contain brightness-0" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span>Phiếu tạm</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" defaultChecked />
                <span>Đã nhập hàng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span>Đã hủy</span>
              </label>
            </div>
          </div>
        </div>

        {/* ---------------- CỘT PHẢI: NỘI DUNG CHÍNH ---------------- */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Phiếu nhập hàng</h1>
          </div>

          <div className="bg-white flex flex-col rounded shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f4f6f8] sticky top-0 z-10 border-b border-gray-200 whitespace-nowrap">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">Mã nhập hàng</th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">Thời gian</th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">Nhà cung cấp</th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5 text-right">Cần trả NCC</th>
                    <th className="p-3 font-semibold text-gray-700 w-1/5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                
                <tbody>
                  {importInvoices.map((invoice) => {
                    const isExpanded = expandedRowId === invoice.id;
                    return (
                      <React.Fragment key={invoice.id}>
                        {/* Dòng tóm tắt (Master Row) */}
                        <tr 
                          onClick={() => toggleRow(invoice.id)}
                          className={`cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="p-3 font-medium text-gray-800">{invoice.id}</td>
                          <td className="p-3">{invoice.time}</td>
                          <td className="p-3">{invoice.supplier}</td>
                          <td className="p-3 text-right font-medium">{invoice.amountOwed}</td>
                          <td className="p-3 text-center">{invoice.status}</td>
                        </tr>

                        {/* Dòng chi tiết (Detail Row) */}
                        {isExpanded && invoice.items && (
                          <tr className="border-b-2 border-blue-200 bg-white">
                            <td colSpan="5" className="p-0">
                              <div className="p-4 border-l-4 border-blue-500">
                                {/* Tabs Mở rộng */}
                                <div className="flex gap-4 border-b border-gray-200 mb-4">
                                  <button className="pb-2 border-b-2 border-blue-600 font-medium text-blue-600 cursor-pointer">Thông tin</button>
                                  <button className="pb-2 text-gray-500 hover:text-gray-700 cursor-pointer">Lịch sử thanh toán</button>
                                </div>

                                {/* Lưới thông tin chung */}
                                <div className="grid grid-cols-3 gap-6 mb-6">
                                  <div className="col-span-2 grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="flex"><span className="w-28 text-gray-500">Mã phiếu nhập:</span><span className="font-semibold">{invoice.id}</span></div>
                                    <div className="flex"><span className="w-24 text-gray-500">Trạng thái:</span><span>{invoice.status}</span></div>
                                    <div className="flex">
                                      <span className="w-28 text-gray-500">Thời gian:</span>
                                      <div className="flex items-center border border-gray-300 rounded px-2 py-0.5 bg-white">
                                        <span>{invoice.time}</span>
                                        <div className="w-3 h-3 ml-2 opacity-50"><img src={Icons.Calendar} alt="" className="w-full h-full object-contain filter brightness-0" /></div>
                                      </div>
                                    </div>
                                    <div className="flex"><span className="w-24 text-gray-500">Chi nhánh:</span><span>{invoice.branch}</span></div>
                                    <div className="flex"><span className="w-28 text-gray-500">Nhà cung cấp:</span><span className="text-blue-600 cursor-pointer">{invoice.supplier}</span></div>
                                    <div className="flex"><span className="w-24 text-gray-500">Người nhập:</span><span>{invoice.importer}</span></div>
                                    <div className="flex"><span className="w-28 text-gray-500">Người tạo:</span><span className="font-semibold">{invoice.creator}</span></div>
                                  </div>
                                  {/* Ô Ghi chú */}
                                  <div className="col-span-1">
                                    <textarea 
                                      className="w-full h-full min-h-[80px] border border-gray-200 rounded p-2 text-gray-600 resize-none focus:outline-blue-500" 
                                      placeholder="Ghi chú..."
                                      disabled
                                    ></textarea>
                                  </div>
                                </div>

                                {/* Bảng Chi tiết mặt hàng (Inner Table) */}
                                <div className="border border-gray-200 rounded mb-4">
                                  <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-sm">
                                      <tr>
                                        <th className="p-2 font-semibold">Mã hàng hóa</th>
                                        <th className="p-2 font-semibold">Tên hàng</th>
                                        <th className="p-2 font-semibold text-right">Số lượng</th>
                                        <th className="p-2 font-semibold text-right">Đơn giá</th>
                                        <th className="p-2 font-semibold text-right">Giảm giá</th>
                                        <th className="p-2 font-semibold text-right">Giá nhập</th>
                                        <th className="p-2 font-semibold text-right">Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {invoice.items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                                          <td className="p-2">{item.code}</td>
                                          <td className="p-2">{item.name}</td>
                                          <td className="p-2 text-right">{item.qty}</td>
                                          <td className="p-2 text-right">{item.price.toLocaleString()}</td>
                                          <td className="p-2 text-right">{item.discount}</td>
                                          <td className="p-2 text-right">{item.importPrice.toLocaleString()}</td>
                                          <td className="p-2 text-right font-semibold">{item.total}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Tổng kết & Nút hành động */}
                                <div className="flex justify-end mt-4">
                                  <div className="w-80 space-y-2 text-right">
                                    <div className="flex justify-between"><span className="text-gray-500">Tổng số lượng:</span><span className="font-semibold">{invoice.summary.totalQty}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tổng số mặt hàng:</span><span className="font-semibold">{invoice.summary.totalItems}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tổng tiền hàng:</span><span className="font-semibold">{invoice.summary.totalGoods}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Giảm giá phiếu nhập:</span><span className="font-semibold">{invoice.summary.invoiceDiscount}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500 font-semibold">Tổng cộng:</span><span className="font-bold text-lg">{invoice.summary.finalTotal}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tiền đã trả NCC:</span><span className="font-semibold">{invoice.summary.paid}</span></div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 pt-4">
                                      <button className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-gray-600 cursor-pointer">
                                        <div className="w-4 h-4"><img src={Icons.Printer} alt="" className="w-full h-full object-contain filter brightness-0 invert" /></div>
                                        In
                                      </button>
                                      <button className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 cursor-pointer">
                                        <div className="w-4 h-4"><img src={Icons.Export} alt="" className="w-full h-full object-contain filter brightness-0 invert" /></div>
                                        Xuất file
                                      </button>
                                      <button className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 cursor-pointer">
                                        <div className="w-4 h-4"><img src={Icons.Delete} alt="" className="w-full h-full object-contain filter brightness-0 invert" /></div>
                                        Xóa
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
            
            {/* Phân trang (Pagination) - Đã thêm cursor-pointer đầy đủ */}
             <div className="bg-white border-t border-gray-200 p-3 flex justify-start items-center text-gray-500">
              <div className="flex items-center gap-3">
                <button className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
                <button className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&lsaquo;</button>
                <button className="w-6 h-6 rounded bg-green-600 text-white font-medium flex items-center justify-center cursor-pointer">1</button>
                <button className="hover:text-blue-600 cursor-pointer">2</button>
                <button className="hover:text-blue-600 cursor-pointer">3</button>
                <button className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&rsaquo;</button>
                <button className="hover:text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Import;