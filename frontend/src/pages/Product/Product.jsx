import React, { useState } from "react";
import * as Icons from "../../assets/icons/index";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function Product() {
  // Trạng thái để mở/đóng xem chi tiết sản phẩm mẫu
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6">
        {/* SIDEBAR BÊN TRÁI: BỘ LỌC */}
        <aside className="col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold mb-3 text-gray-700">Tìm kiếm</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Theo mã, tên hàng"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Loại hàng</h3>
              <img
                src={Icons.ArrowDown}
                alt="mũi tên"
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Hàng thường
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Hàng chế biến
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Combo, gọi món
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Dịch vụ
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Nhóm hàng</h3>
              <img src={Icons.Add} alt="add" className="cursor-pointer" />
            </div>
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  src={Icons.Search}
                  alt="Tìm kiếm"
                  className="h-4 w-4 text-gray-400"
                  style={{ filter: "grayscale(1) opacity(0.5)" }} // Căn chỉnh màu nếu icon là ảnh màu
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm nhóm hàng"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="font-bold text-blue-600">Tất cả</li>
              <li>ĐỒ ĂN</li>
              <li>ĐỒ UỐNG</li>
              <li>THUỐC LÁ</li>
              <li>LOẠI BÀN</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Tồn kho</h3>
              <img
                src={Icons.ArrowDown}
                alt="mũi tên"
                className="cursor-pointer"
              />
            </div>
            {/* Ô tìm kiếm */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  src={Icons.Search}
                  alt="Tìm kiếm"
                  className="h-4 w-4 text-gray-400"
                  style={{ filter: "grayscale(1) opacity(0.5)" }} // Căn chỉnh màu nếu icon là ảnh màu
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm nhóm hàng"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" /> Tất cả
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" /> Dưới định mức tồn
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" /> Vượt định mức tồn
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" /> Còn hàng trong kho
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" /> Hết hàng trong kho
              </label>
            </div>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH BÊN PHẢI: DANH SÁCH */}
        <section className="col-span-9 space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-t-lg border-b border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Danh sách hàng hóa
            </h2>
            <div className="flex items-center gap-3">
              {/* Nút: THÊM MÓN */}
              <button className="flex items-start gap-1 cursor-pointer bg-green-600 text-white px-5 py-2.5 pl-1.5 pr-3.5 rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-all shadow-sm">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img
                    src={Icons.Add}
                    alt="Thêm món"
                    className="h-4 w-4 brightness-0 invert"
                  />
                </div>
                <span>Thêm món</span>
              </button>

              {/* Nút: THÊM HÀNG CHẾ BIẾN */}
              <button className="flex items-center gap-1 cursor-pointer bg-green-600 text-white px-5 py-2.5 pl-1.5 pr-3.5 rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-all shadow-sm">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img
                    src={Icons.Add}
                    alt="Thêm hàng chế biến"
                    className="h-4 w-4 brightness-0 invert"
                  />
                </div>
                <span>Thêm hàng chế biến</span>
              </button>

              {/* Nút: COMBO, GỌI MÓN */}
              <button className="flex items-center gap-1 bg-blue-600 text-white px-5 py-2.5 pl-1.5 pr-3.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img
                    src={Icons.Add}
                    alt="Combo, gọi món"
                    className="h-4 w-4 brightness-0 invert"
                  />
                </div>
                <span>Combo, gọi món</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#E8EBF3] text-gray-700 font-bold">
                <tr>
                  <th className="p-3 border-b">Mã hàng</th>
                  <th className="p-3 border-b">Tên hàng</th>
                  <th className="p-3 border-b text-right">Nhóm hàng</th>
                  <th className="p-3 border-b text-right">Giá bán</th>
                  <th className="p-3 border-b text-right">Giá niêm yết</th>
                  <th className="p-3 border-b text-right">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {/* DÒNG TỔNG CỘNG */}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="3" className="p-3 text-right"></td>
                  <td className="p-3 text-right text-blue-600">0</td>
                  <td className="p-3 text-right text-blue-600">0</td>
                  <td className="p-3 text-right text-blue-600">1147</td>
                </tr>

                <tr
                  className={`cursor-pointer hover:bg-blue-50 ${isExpanded ? "bg-blue-50" : ""}`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <td className="p-3 border-t font-medium text-blue-700">
                    SP000012
                  </td>
                  <td className="p-3 border-t font-medium">
                    Snack tôm cay (Lớn)
                  </td>
                  <td className="p-3 border-t text-right">Khác</td>
                  <td className="p-3 border-t text-right">15,000</td>
                  <td className="p-3 border-t text-right text-gray-400">
                    9,000
                  </td>
                  <td className="p-3 border-t text-right font-bold">236</td>
                </tr>

                {/* CHI TIẾT KHI CLICK VÀO DÒNG (Dữ liệu mẫu) */}
                {isExpanded && (
                  <tr>
                    <td colSpan="6" className="p-6 bg-white border-t">
                      <div className="flex gap-8">
                        <div className="w-48 h-48 border rounded p-2 flex items-center justify-center bg-gray-50">
                          {/* Thay src bằng ảnh thật của bạn */}
                          <img
                            src="https://via.placeholder.com/150"
                            alt="Snack tôm cay"
                            className="max-h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-y-3 text-[14px]">
                          <div className="text-gray-500">Mã hàng hóa:</div>
                          <div className="font-bold">SP000012</div>

                          <div className="text-gray-500">Nhóm hàng:</div>
                          <div>Khác</div>

                          <div className="text-gray-500">Loại hàng:</div>
                          <div>Hàng thường</div>

                          <div className="text-gray-500">Định mức tồn:</div>
                          <div>0 {">"} 1,000</div>

                          <div className="text-gray-500">Giá bán:</div>
                          <div className="font-bold text-blue-600">15,000</div>

                          <div className="text-gray-500">Giá vốn:</div>
                          <div>9,000</div>
                        </div>

                        <div className="flex-1 justify-end flex-col hidden lg:flex w-full">
                          <p className="text-gray-500 mb-2">Mô tả</p>
                          <p className="text-sm italic text-gray-400">
                            Chưa có mô tả
                          </p>

                          <div className="mt-12 flex gap-2 justify-end">
                            <button className="flex items-center justify-center gap-2 cursor-pointer bg-[#FF6600] text-white px-5 py-2 pl-0.5 pr-2 rounded-lg text-sm font-semibold hover:bg-[#e65c00] transition-all duration-200 shadow-sm min-w-[120px]">
                              <div className="flex items-center justify-center w-5 h-5">
                                <img
                                  src={Icons.Pen}
                                  alt="Chỉnh sửa"
                                  className="h-4 w-4 brightness-0 invert"
                                />
                              </div>
                              <span className="leading-none pt-0.5 whitespace-nowrap">
                                Chỉnh sửa
                              </span>
                            </button>

                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 pl-1.5 pr-2 rounded-lg flex items-center gap-1 cursor-pointer">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <img
                                  src={Icons.Block}
                                  alt="Khóa"
                                  className="h-4 w-4 brightness-0 invert"
                                />
                              </div>
                              <span className="whitespace-nowrap">
                                Ngừng hoạt động
                              </span>
                            </button>

                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 pl-2 pr-3 rounded-lg flex items-center gap-1 cursor-pointer">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <img
                                  src={Icons.Delete}
                                  alt="Xóa"
                                  className="h-4 w-4 brightness-0 invert"
                                />
                              </div>
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Product;
