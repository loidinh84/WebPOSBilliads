import React, { useState, useRef, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import { useNavigate } from "react-router-dom";

export const CostFilters = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-bold mb-3 text-gray-700 text-sm">Loại chi phí</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" /> Tiền nhập hàng
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" /> Chi phí vận hành
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" /> Chi phí bảo trì
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" /> Lương
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" /> Chi phí khác
        </label>
      </div>
    </div>
  );
};

export const CostChart = ({
  pieRef,
  handlePieMouseMove,
  handlePieMouseLeave,
  hoveredSlice,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between print:hidden">
      <h3 className="font-bold text-gray-800">Biểu đồ chi phí</h3>

      <div className="flex-1 flex justify-center items-center">
        <div
          ref={pieRef}
          onMouseMove={handlePieMouseMove}
          onMouseLeave={handlePieMouseLeave}
          className="w-56 h-56 rounded-full relative shadow-sm border border-gray-100 cursor-pointer"
          style={{
            background:
              "conic-gradient(#FF0000 0% 45%, #38DBF8 45% 70%, #90FB98 70% 85%, #FFFF00 85% 100%)",
          }}
        >
          {hoveredSlice && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 text-white rounded shadow-xl p-2 pointer-events-none z-10 flex flex-col items-center min-w-[90px] border border-gray-700">
              <span className="text-[10px] text-gray-300 font-normal leading-tight mb-0.5">
                {hoveredSlice.label}
              </span>
              <span
                className="font-bold text-lg leading-none"
                style={{ color: hoveredSlice.color }}
              >
                {hoveredSlice.percent}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 text-sm text-gray-700 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#FF0000] rounded-sm shadow-sm"></div>
          <span>Tiền nhập hàng</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#38DBF8] rounded-sm shadow-sm"></div>
          <span>Chi phí vận hành</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#90FB98] rounded-sm shadow-sm"></div>
          <span>Chi phí bảo trì</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#FFFF00] rounded-sm shadow-sm"></div>
          <span>Lương</span>
        </div>
      </div>
    </div>
  );
};

export const CostTable = () => {
  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Báo cáo tổng hợp chi phí
        </h1>
        <p className="text-sm text-gray-500">Tháng 05/2026</p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-center text-sm border-collapse">
          <thead className="bg-[#b3d4f6] text-gray-800 font-semibold">
            <tr>
              <th className="py-2 px-3 border border-gray-200">Mã chứng từ</th>
              <th className="py-2 px-3 border border-gray-200">Thời gian</th>
              <th className="py-2 px-3 border border-gray-200">Loại chi phí</th>
              <th className="py-2 px-3 border border-gray-200">
                Người nhận tiền
              </th>
              <th className="py-2 px-3 border border-gray-200">Số tiền chi</th>
              <th className="py-2 px-3 border border-gray-200">
                Người lập phiếu
              </th>
              <th className="py-2 px-3 border border-gray-200">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={7}
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

const CostReport = () => {
  const navigate = useNavigate();

  // Các state cho thanh công cụ
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const viewerRef = useRef(null);

  // State for Pie Chart hover interactivity
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const pieRef = useRef(null);

  const handlePieMouseMove = (e) => {
    if (!pieRef.current) return;
    const rect = pieRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    );
    if (distance > rect.width / 2) {
      setHoveredSlice(null);
      return;
    }

    const dx = x - centerX;
    const dy = y - centerY;

    let theta = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (theta < 0) theta += 360;

    const percent = (theta / 360) * 100;

    if (percent >= 0 && percent < 45) {
      setHoveredSlice({
        label: "Tiền nhập hàng",
        percent: 45,
        color: "#FF0000",
      });
    } else if (percent >= 45 && percent < 70) {
      setHoveredSlice({
        label: "Chi phí vận hành",
        percent: 25,
        color: "#38DBF8",
      });
    } else if (percent >= 70 && percent < 85) {
      setHoveredSlice({
        label: "Chi phí bảo trì",
        percent: 15,
        color: "#90FB98",
      });
    } else {
      setHoveredSlice({ label: "Lương", percent: 15, color: "#FFFF00" });
    }
  };

  const handlePieMouseLeave = () => {
    setHoveredSlice(null);
  };

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
              <label
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/reports/revenue")}
              >
                <input
                  type="radio"
                  name="report-type"
                  className="w-4 h-4 text-blue-600"
                  checked={false}
                  readOnly
                />
                Báo cáo Doanh thu
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="report-type"
                  className="w-4 h-4 text-blue-600"
                  checked={true}
                  readOnly
                />
                Báo cáo Chi phí
              </label>
            </div>
          </div>

          <CostFilters />

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
          <CostChart
            pieRef={pieRef}
            handlePieMouseMove={handlePieMouseMove}
            handlePieMouseLeave={handlePieMouseLeave}
            hoveredSlice={hoveredSlice}
          />

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

                <CostTable />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CostReport;
