import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

// Hàm thay thế {PLACEHOLDER} bằng data thật
const parseTemplate = (templateStr, dataObj) => {
  if (!templateStr) return "";
  return templateStr.replace(/\{(\w+)\}/g, (match, key) => {
    return dataObj[key] !== undefined ? dataObj[key] : match;
  });
};

export default function PrintBillModal({ billData, onClose }) {
  const [labels, setLabels] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  // billData gồm: billId, tableName, items, timePrice, rawTotal,
  //               discountAmount, finalTotal, startTime, endTime,
  //               durationSeconds, storeSettings, customerName,
  //               paymentMethod, discountCode

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/templates/Hóa đơn",
        );
        if (res.data.success && res.data.data) {
          setLabels(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy mẫu in:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, []);

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "--:--";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Build data object để thay thế placeholder
  const buildPrintData = () => {
    const s = billData.storeSettings || {};
    const now = new Date();

    const bank = s.NGANHANG_BIN || "";
    const acc = s.SOTAIKHOAN || "";
    const accName = encodeURIComponent(s.TENTAIKHOAN || "");
    const amount = billData.finalTotal || 0;
    const info = encodeURIComponent(`THANHTOAN_${billData.billId}`);
    const qrUrl =
      bank && acc
        ? `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${accName}`
        : "";

    return {
      TENCUAHANG: s.TENCUAHANG || s.TENSHOP || "Billiards",
      DIACHI: s.DIACHI || s.ADDRESS || "",
      SDT: s.SDT || s.DIENTHOAI || s.PHONE || "",
      TENBAN: billData.tableName || "",
      MAHOADON: billData.billId || "",
      NGAY: now.toLocaleDateString("vi-VN"),
      THOIGIAN: now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      TENNGUOIDUNG: billData.cashierName || "",
      GIOBATDAU: billData.startTime || "--:--",
      GIOKETTHUC: billData.endTime || "--:--",
      SOGIOPHUT: formatDuration(billData.durationSeconds),
      TONGTIENGIO: (billData.timePrice || 0).toLocaleString() + "đ",
      TONGTIENHANG: (billData.rawTotal || 0).toLocaleString() + "đ",
      GIAMGIA: (billData.discountAmount || 0).toLocaleString() + "đ",
      TONGTHANHTOAN: (billData.finalTotal || 0).toLocaleString() + "đ",
      TENKHACHHANG: billData.customerName || "",
      PHUONGTHUCTHANHTOAN: billData.paymentMethod || "Tiền mặt",
      MAKHUYENMAI: billData.discountCode || "",
      QR_URL: qrUrl,
    };
  };

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open("", "_blank", "width=500,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${billData.billId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải mẫu in...</span>
        </div>
      </div>
    );
  }

  if (!labels) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-red-500 font-bold mb-4">
            Chưa có mẫu in. Vui lòng thiết lập trong Mẫu In.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded-lg font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const printData = buildPrintData();

  const renderLabel = (key, label) => {
    // Số món thực tế
    const itemCount = billData.items?.length || 0;

    // top của dòng items đầu tiên trong mẫu
    const itemsStartTop = labels.lblItemVal?.top || 220;

    // Mỗi dòng item cao 18px — tính phần cần đẩy thêm so với mẫu
    const MOCK_ITEM_COUNT = 2; // mock data trong PrintTemplate có 2 món
    const extraOffset = Math.max(0, itemCount - MOCK_ITEM_COUNT) * 18;

    // Các label nằm SAU phần items cần được đẩy xuống
    const isAfterItems =
      (label.top || 0) > itemsStartTop + MOCK_ITEM_COUNT * 18;

    const adjustedTop = isAfterItems
      ? (label.top || 0) + extraOffset
      : label.top || 0;

    const style = {
      position: "absolute",
      top: `${adjustedTop}px`,
      left: `${label.left || 0}px`,
      width: label.width
        ? typeof label.width === "number"
          ? `${label.width}px`
          : label.width
        : "auto",
      textAlign: label.align || "left",
      fontSize: `${label.fontSize || 12}px`,
      fontWeight: label.bold ? "bold" : "normal",
      fontStyle: label.italic ? "italic" : "normal",
      whiteSpace: "nowrap",
    };

    // Các label dạng item — lặp theo từng dòng món
    const isItemKey = [
      "lblItemVal",
      "lblQtyVal",
      "lblPriceVal",
      "lblTotalItemVal",
    ].includes(key);

    if (isItemKey && billData.items) {
      return billData.items.map((item, i) => {
        const itemData = {
          TENHANGHOA: item.name,
          SOLUONG: item.qty,
          DONGIA: item.price.toLocaleString(),
          THANHTIEN: (item.price * item.qty).toLocaleString(),
        };
        return (
          <div
            key={`${key}-${i}`}
            style={{ ...style, top: `${(label.top || 0) + i * 18}px` }}
          >
            {parseTemplate(label.text, itemData)}
          </div>
        );
      });
    }

    if (key === "qrText" && printData.QR_URL) {
      return (
        <div key={key} style={style}>
          <div
            style={{
              fontSize: `${label.fontSize || 10}px`,
              marginBottom: "4px",
            }}
          >
            {label.text}
          </div>
          <img
            src={printData.QR_URL}
            alt="QR thanh toán"
            style={{ width: "110px", height: "110px", display: "block" }}
          />
        </div>
      );
    }

    // Nếu chưa cấu hình ngân hàng thì ẩn label qrText
    if (key === "qrText" && !printData.QR_URL) {
      return null;
    }

    return (
      <div key={key} style={style}>
        {parseTemplate(label.text, printData)}
      </div>
    );
  };

  // Tính chiều cao động dựa trên số món
  const itemCount = billData.items?.length || 0;
  const MOCK_ITEM_COUNT = 2;
  const extraHeight = Math.max(0, itemCount - MOCK_ITEM_COUNT) * 18;

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] w-[520px]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Xem trước hóa đơn</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Preview vùng in */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center">
          <div
            ref={printRef}
            className="bg-white shadow-sm"
            style={{
              width: "380px",
              minHeight: `${500 + extraHeight}px`,
              position: "relative",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {/* Đường kẻ ngang phân cách items */}
            <div
              style={{
                position: "absolute",
                top: `${(labels.lblItem?.top || 200) - 4}px`,
                left: "8px",
                right: "8px",
                borderTop: "1px dashed #999",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: `${(labels.lblItem?.top || 200) + 14 + itemCount * 18 + 8}px`,
                left: "8px",
                right: "8px",
                borderTop: "1px dashed #999",
              }}
            />

            {/* Render tất cả labels */}
            {Object.entries(labels).map(([key, label]) =>
              renderLabel(key, label),
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-[2] bg-[#169c4e] hover:bg-[#12b862] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-print"></i> In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}
