import React, { useState, useRef, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import { useNavigate } from "react-router-dom";

export const RevenueFilters = () => {
  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-bold mb-3 text-gray-700 text-sm">Mối quan tâm</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" /> Bán hàng
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" /> Thu chi
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" /> Hàng hóa
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" /> Hủy món
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" /> Tổng hợp
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-bold mb-3 text-gray-700 text-sm">Khách hàng</h3>
        <input
          type="text"
          placeholder="Theo mã, tên, số điện thoại"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </>
  );
};

export const RevenueTable = () => {
  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Báo cáo doanh thu bán hàng
        </h1>
        <p className="text-sm text-gray-500">Ngày bán 01/05/2026</p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-center text-sm border-collapse">
          <thead className="bg-[#b3d4f6] text-gray-800 font-semibold">
            <tr>
              <th className="py-2 px-3 border border-gray-200">Mã chứng từ</th>
              <th className="py-2 px-3 border border-gray-200">Thời gian</th>
              <th className="py-2 px-3 border border-gray-200">Phòng/Bàn</th>
              <th className="py-2 px-3 border border-gray-200">SLSP</th>
              <th className="py-2 px-3 border border-gray-200">Doanh Thu</th>
              <th className="py-2 px-3 border border-gray-200">Thuế</th>
              <th className="py-2 px-3 border border-gray-200">Phí trả hàng</th>
              <th className="py-2 px-3 border border-gray-200">Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={8}
                className="text-center py-4 bg-[#ffffcc] text-gray-600 font-medium"
              >
                Báo cáo chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

const RevenueReport = () => {
  const navigate = useNavigate();

  // Các state cho thanh công cụ
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const viewerRef = useRef(null);

  // Xử lý Phóng to/Thu nhỏ
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Xử lý Chuyển trang (mô phỏng)
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);

  // Xử lý Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Báo cáo" />

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">
        <aside className="col-span-12 md:col-span-3 space-y-4 print:hidden">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Bộ lọc báo cáo
          </h2>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold mb-3 text-gray-700 text-sm">
              Loại báo cáo
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="report-type"
                  className="w-4 h-4 text-blue-600"
                  checked={true}
                  readOnly
                />
                Báo cáo Doanh thu
              </label>
              <label
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/reports/cost")}
              >
                <input
                  type="radio"
                  name="report-type"
                  className="w-4 h-4 text-blue-600"
                  checked={false}
                  readOnly
                />
                Báo cáo Chi phí
              </label>
            </div>
          </div>

          <RevenueFilters />

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold mb-3 text-gray-700 text-sm">Thời gian</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="time" defaultChecked />
                <input
                  type="text"
                  value="01/05/2026"
                  readOnly
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                />
              </label>
              <div className="flex gap-2 pl-6">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Từ"
                    className="border border-gray-300 rounded px-2 py-1 w-full pl-8"
                  />
                  <span className="absolute left-2 top-1.5 text-gray-400">
                    🕒
                  </span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Đến"
                    className="border border-gray-300 rounded px-2 py-1 w-full pl-8"
                  />
                  <span className="absolute left-2 top-1.5 text-gray-400">
                    🕒
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="radio" name="time" />
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Lựa chọn khác"
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                  />
                  <span className="absolute right-2 top-1.5 text-gray-400">
                    📅
                  </span>
                </div>
              </label>
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9 flex flex-col gap-6">
          <div
            ref={viewerRef}
            className={`bg-[#747474] w-full min-h-[800px] flex flex-col rounded-sm overflow-hidden border border-gray-300 shadow-inner ${isFullscreen ? "overflow-y-auto" : ""}`}
          >
            {/* Toolbar */}
            <div className="bg-[#e2e4e8] h-14 border-b border-gray-300 flex items-center justify-center gap-4 text-[#4b5563] px-4 shadow-sm print:hidden sticky top-0 z-10 w-full">
              <button
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Hoàn tác"
              >
                {Icons.reply && (
                  <img src={Icons.reply} alt="Hoàn tác" className="w-4 h-4" />
                )}
              </button>
              <button
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Làm lại"
              >
                {Icons.reply && (
                  <img
                    src={Icons.reply}
                    alt="Làm lại"
                    className="w-4 h-4 scale-x-[-1]"
                  />
                )}
              </button>
              <button
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Làm mới"
              >
                {Icons.forwardMedia && (
                  <img
                    src={Icons.forwardMedia}
                    alt="Làm mới"
                    className="w-4 h-4"
                  />
                )}
              </button>

              <div className="w-px h-6 bg-gray-400 mx-1"></div>

              <button
                onClick={handleFirstPage}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Trang đầu"
              >
                {Icons.doubleArrow && (
                  <img
                    src={Icons.doubleArrow}
                    alt="Trang đầu"
                    className="w-4 h-4"
                  />
                )}
              </button>
              <button
                onClick={handlePrevPage}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Trang trước"
              >
                {Icons.FirstPage && (
                  <img
                    src={Icons.FirstPage}
                    alt="Trang trước"
                    className="w-4 h-4"
                  />
                )}
              </button>

              <div className="flex items-center gap-1 bg-white px-3 py-1.5 border border-gray-300 rounded shadow-sm text-sm font-medium mx-1">
                <span className="text-gray-800">{currentPage}</span>{" "}
                <span className="text-gray-400 px-1">/</span>{" "}
                <span className="text-gray-500">{totalPages}</span>
              </div>

              <button
                onClick={handleNextPage}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Trang sau"
              >
                {Icons.LastPage && (
                  <img
                    src={Icons.LastPage}
                    alt="Trang sau"
                    className="w-4 h-4"
                  />
                )}
              </button>
              <button
                onClick={handleLastPage}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Trang cuối"
              >
                {Icons.ArrowDouble && (
                  <img
                    src={Icons.ArrowDouble}
                    alt="Trang cuối"
                    className="w-4 h-4"
                  />
                )}
              </button>

              <div className="w-px h-6 bg-gray-400 mx-1"></div>

              <button
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer bg-white/20 shadow-sm"
                title="Xem tài liệu"
              >
                {Icons.insertPage && (
                  <img
                    src={Icons.insertPage}
                    alt="Xem tài liệu"
                    className="w-4 h-4"
                  />
                )}
              </button>
              <button
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Tải xuống"
              >
                {Icons.CloudDownload && (
                  <img
                    src={Icons.CloudDownload}
                    alt="Tải xuống"
                    className="w-4 h-4"
                  />
                )}
              </button>
              <button
                onClick={handlePrint}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="In báo cáo"
              >
                {Icons.Printer && (
                  <img
                    src={Icons.Printer}
                    alt="In báo cáo"
                    className="w-4 h-4"
                  />
                )}
              </button>

              <div className="w-px h-6 bg-gray-400 mx-1"></div>

              <button
                onClick={handleZoomIn}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Phóng to"
              >
                {Icons.ZoomIn && (
                  <img src={Icons.ZoomIn} alt="Phóng to" className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleZoomOut}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Thu nhỏ"
              >
                {Icons.ZoomOut && (
                  <img src={Icons.ZoomOut} alt="Thu nhỏ" className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleZoomReset}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer"
                title="Đặt lại thu phóng"
              >
                {Icons.Search && (
                  <img
                    src={Icons.Search}
                    alt="Đặt lại thu phóng"
                    className="w-4 h-4"
                  />
                )}
              </button>

              <div className="w-px h-6 bg-gray-400 mx-1"></div>

              <button
                onClick={toggleFullscreen}
                className="hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-black/5 cursor-pointer text-gray-500 ml-1"
                title="Toàn màn hình"
              >
                {Icons.FullScreen && (
                  <img
                    src={Icons.FullScreen}
                    alt="Toàn màn hình"
                    className="w-4 h-4"
                  />
                )}
              </button>
            </div>

            {/* Vùng cuộn của Giấy in */}
            <div className="flex-1 w-full overflow-hidden flex justify-center py-10 print:py-0 print:block overflow-y-auto">
              <div
                className="bg-white w-full mx-auto shadow-2xl border-4 border-[#30B5E0] min-h-[700px] p-10 flex flex-col print:border-none print:shadow-none print:m-0 print:p-4 transition-transform duration-200 transform-origin-top"
                style={{
                  maxWidth: "900px",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  height: "max-content",
                  marginBottom: "40px",
                }}
              >
                <div className="text-xs text-gray-500 mb-6">
                  Ngày lập 01/05/2026 09:00
                </div>

                <RevenueTable />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RevenueReport;
