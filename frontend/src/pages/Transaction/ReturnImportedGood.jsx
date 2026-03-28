import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";

function ReturnImportedGood() {
  const [returnInvoices, setReturnInvoices] = useState([]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-sm text-gray-800">
      <DashboardHeader storeName="Thành Lợi" />
      <DashboardNav activeTab="Giao dịch" />

      <div className="flex p-4 gap-4">
        
        {/* ---------------- CỘT TRÁI: SIDEBAR LỌC (FILTER) ---------------- */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">
          
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Tìm kiếm</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Theo mã phiếu trả" 
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Theo mã, tên hàng" 
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Theo mã, tên NCC" 
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Thời gian</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="timeFilter" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked />
                <div className="flex-1">
                  <input 
                    type="text" 
                    value="Tháng này" 
                    readOnly 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-600 cursor-default"
                  />
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="timeFilter" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Lựa chọn khác" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4">
                    <img src={Icons.Calendar} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
              <h3 className="font-semibold text-gray-800">Trạng thái</h3>
              <div className="w-4 h-4">
                <img src={Icons.ArrowDown} alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Phiếu tạm</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span>Đã nhập hàng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Đã hủy</span>
              </label>
            </div>
          </div>

        </div>

        {/* ---------------- CỘT PHẢI: NỘI DUNG CHÍNH ---------------- */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Tiêu đề trang được thêm vào đây */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Phiếu trả hàng nhập</h1>
          </div>

          {/* Container Bảng & Phân trang */}
          <div className="bg-white flex flex-col rounded shadow-sm border border-gray-200 overflow-hidden h-full">
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f4f6f8] sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700">Mã phiếu trả</th>
                    <th className="p-3 font-semibold text-gray-700">Thời gian</th>
                    <th className="p-3 font-semibold text-gray-700">Nhà cung cấp</th>
                    <th className="p-3 font-semibold text-gray-700 text-right">Tổng tiền hàng trả</th>
                    <th className="p-3 font-semibold text-gray-700 text-right">Giảm giá</th>
                    <th className="p-3 font-semibold text-gray-700 text-right">NCC cần trả</th>
                    <th className="p-3 font-semibold text-gray-700 text-right">NCC đã trả</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">Trạng thái</th>
                  </tr>
                </thead>
                
                <tbody>
                  {returnInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="h-[400px]">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="mb-4 w-16 h-16 opacity-30">
                            <img src={Icons.Box} alt="" className="w-full h-full object-contain" />
                          </div>
                          <p>Không tìm thấy phiếu trả hàng nào phù hợp</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    returnInvoices.map((invoice, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">{invoice.id}</td>
                        <td className="p-3">{invoice.date}</td>
                        <td className="p-3">{invoice.supplier}</td>
                        <td className="p-3 text-right">{invoice.total}</td>
                        <td className="p-3 text-right">{invoice.discount}</td>
                        <td className="p-3 text-right">{invoice.supplierOwes}</td>
                        <td className="p-3 text-right">{invoice.supplierPaid}</td>
                        <td className="p-3 text-center">{invoice.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="bg-white border-t border-gray-200 p-3 flex justify-start items-center text-gray-500">
              <div className="flex items-center gap-3">
                <button className="hover:text-blue-600 disabled:opacity-50 cursor-pointer">&laquo;</button>
                <button className="hover:text-blue-600 disabled:opacity-50 cursor-pointer">&lsaquo;</button>
                <button className="w-6 h-6 rounded bg-green-600 text-white font-medium flex items-center justify-center cursor-pointer">1</button>
                <button className="hover:text-blue-600 cursor-pointer">2</button>
                <button className="hover:text-blue-600 cursor-pointer">3</button>
                <button className="hover:text-blue-600 disabled:opacity-50 cursor-pointer">&rsaquo;</button>
                <button className="hover:text-blue-600 disabled:opacity-50 cursor-pointer">&raquo;</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnImportedGood;