import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import Swal from "sweetalert2";

const TABS = ['Hóa đơn', 'Trả hàng', 'Nhập hàng', 'Phiếu thu', 'Phiếu chi', 'Phiếu bàn giao ca'];

const DEFAULT_LABELS = {
  'Hóa đơn': {
    title: { text: "HÓA ĐƠN THANH TOÁN", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblTableName: { text: "{TENBAN}", top: 10, left: 10, fontSize: 14, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Hóa đơn:", top: 115, left: 130, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAHOADON}", top: 115, left: 190, fontSize: 12 },
    lblDate: { text: "Ngày:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{NGAY}", top: 140, left: 60, fontSize: 11, bold: true },
    lblTime: { text: "Giờ:", top: 155, left: 10, fontSize: 11 },
    lblTimeVal: { text: "{THOIGIAN}", top: 155, left: 60, fontSize: 11, bold: true },
    lblCashier: { text: "Thu ngân:", top: 170, left: 10, fontSize: 11 },
    lblCashierVal: { text: "{TENNGUOIDUNG}", top: 170, left: 65, fontSize: 11, bold: true },
    lblTimeIn: { text: "Giờ vào:", top: 140, left: 240, fontSize: 11 },
    lblTimeInVal: { text: "{GIOBATDAU}", top: 140, left: 290, fontSize: 11, bold: true },
    lblTimeOut: { text: "Giờ ra:", top: 155, left: 240, fontSize: 11 },
    lblTimeOutVal: { text: "{GIOKETTHUC}", top: 155, left: 290, fontSize: 11, bold: true },
    lblPlayTime: { text: "Giờ chơi:", top: 170, left: 240, fontSize: 11 },
    lblPlayTimeVal: { text: "{SOGIOPHUT}", top: 170, left: 295, fontSize: 11, bold: true },
    
    // Items table headers
    lblItem: { text: "Tên hàng", top: 200, left: 10, fontSize: 11, bold: true },
    lblQty: { text: "SL", top: 200, left: 170, fontSize: 11, bold: true },
    lblPrice: { text: "Đơn giá", top: 200, left: 230, fontSize: 11, bold: true },
    lblTotalItem: { text: "Thành tiền", top: 200, left: 295, fontSize: 11, bold: true },
    
    // Items table values (representative of rows)
    lblItemVal: { text: "{TENHANGHOA}", top: 220, left: 10, fontSize: 11 },
    lblQtyVal: { text: "{SOLUONG}", top: 220, left: 170, fontSize: 11 },
    lblPriceVal: { text: "{DONGIA}", top: 220, left: 230, fontSize: 11 },
    lblTotalItemVal: { text: "{THANHTIEN}", top: 220, left: 300, fontSize: 11 },
    
    lblTotalRaw: { text: "Tổng tiền giờ:", top: 260, left: 200, fontSize: 11, bold: true },
    lblTotalRawVal: { text: "{TONGTIENGIO}", top: 260, left: 290, fontSize: 11, width: 80, align: 'right' },
    lblTotalGoods: { text: "Dịch vụ:", top: 275, left: 200, fontSize: 11, bold: true },
    lblTotalGoodsVal: { text: "{TONGTIENHANG}", top: 275, left: 290, fontSize: 11, width: 80, align: 'right' },
    lblDiscount: { text: "Giảm giá:", top: 290, left: 200, fontSize: 11, bold: true },
    lblDiscountVal: { text: "{GIAMGIA}", top: 290, left: 290, fontSize: 11, width: 80, align: 'right' },
    lblGrandTotal: { text: "Tổng thanh toán:", top: 315, left: 170, fontSize: 13, bold: true },
    lblGrandTotalVal: { text: "{TONGTHANHTOAN}", top: 315, left: 280, fontSize: 14, width: 90, align: 'right', bold: true },
    
    qrText: { text: "Quét QR để thanh toán!", top: 260, left: 10, fontSize: 10 },
    footerMsg: { text: "Cảm ơn quý khách đã đến chơi tại Billiards Lục Lọi!", top: 360, left: 0, width: 380, align: 'center', fontSize: 10, italic: true }
  },
  'Trả hàng': {
    title: { text: "PHIẾU TRẢ HÀNG", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Phiếu trả:", top: 115, left: 130, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAPHIEUTRA}", top: 115, left: 190, fontSize: 12 },
    lblDate: { text: "Ngày:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{NGAY}", top: 140, left: 60, fontSize: 11, bold: true },
    lblTime: { text: "Giờ:", top: 155, left: 10, fontSize: 11 },
    lblTimeVal: { text: "{THOIGIAN}", top: 155, left: 60, fontSize: 11, bold: true },
    lblCashier: { text: "Nhân viên:", top: 170, left: 10, fontSize: 11 },
    lblCashierVal: { text: "{TENNGUOIDUNG}", top: 170, left: 65, fontSize: 11, bold: true },
    lblItem: { text: "Tên hàng", top: 200, left: 10, fontSize: 11, bold: true },
    lblQty: { text: "SL trả", top: 200, left: 170, fontSize: 11, bold: true },
    lblPrice: { text: "Đơn giá", top: 200, left: 230, fontSize: 11, bold: true },
    lblTotalItem: { text: "Thành tiền", top: 200, left: 295, fontSize: 11, bold: true },
    lblItemVal: { text: "{TENHANGHOA}", top: 220, left: 10, fontSize: 11 },
    lblQtyVal: { text: "{SOLUONG}", top: 220, left: 170, fontSize: 11 },
    lblPriceVal: { text: "{DONGIATRA}", top: 220, left: 230, fontSize: 11 },
    lblTotalItemVal: { text: "{THANHTIEN}", top: 220, left: 300, fontSize: 11 },
    lblTotalRaw: { text: "Tiền trả lại:", top: 260, left: 200, fontSize: 13, bold: true },
    lblTotalRawVal: { text: "{TONGTHANHTOAN}", top: 260, left: 290, fontSize: 14, width: 80, align: 'right', bold: true },
    footerMsg: { text: "Cảm ơn quý khách!", top: 320, left: 0, width: 380, align: 'center', fontSize: 10, italic: true }
  },
  'Nhập hàng': {
    title: { text: "PHIẾU NHẬP HÀNG", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Mã phiếu:", top: 115, left: 130, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAPHIEUNHAP}", top: 115, left: 190, fontSize: 12 },
    lblDate: { text: "Ngày nhập:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{THOIGIAN}", top: 140, left: 80, fontSize: 11, bold: true },
    lblCashier: { text: "Người lập:", top: 155, left: 10, fontSize: 11 },
    lblCashierVal: { text: "{TENNHANVIEN}", top: 155, left: 75, fontSize: 11, bold: true },
    lblSupplier: { text: "NCC:", top: 170, left: 10, fontSize: 11 },
    lblSupplierVal: { text: "{TENNCC}", top: 170, left: 45, fontSize: 11, bold: true },
    lblItem: { text: "Tên hàng", top: 200, left: 10, fontSize: 11, bold: true },
    lblQty: { text: "SL", top: 200, left: 170, fontSize: 11, bold: true },
    lblPrice: { text: "Đơn giá", top: 200, left: 230, fontSize: 11, bold: true },
    lblTotalItem: { text: "Thành tiền", top: 200, left: 295, fontSize: 11, bold: true },
    lblItemVal: { text: "{TENHANGHOA}", top: 220, left: 10, fontSize: 11 },
    lblQtyVal: { text: "{SOLUONGNHAP}", top: 220, left: 170, fontSize: 11 },
    lblPriceVal: { text: "{DONGIA}", top: 220, left: 230, fontSize: 11 },
    lblTotalItemVal: { text: "{THANHTIEN}", top: 220, left: 300, fontSize: 11 },
    lblTotalRaw: { text: "Tổng tiền:", top: 260, left: 200, fontSize: 11, bold: true },
    lblTotalRawVal: { text: "{TONGTIEN}", top: 260, left: 290, fontSize: 11, width: 80, align: 'right' },
    lblPaid: { text: "Đã trả:", top: 275, left: 200, fontSize: 11, bold: true },
    lblPaidVal: { text: "{DATRA}", top: 275, left: 290, fontSize: 11, width: 80, align: 'right' },
    lblDebt: { text: "Công nợ:", top: 290, left: 200, fontSize: 11, bold: true },
    lblDebtVal: { text: "{CANTRANCC}", top: 290, left: 290, fontSize: 11, width: 80, align: 'right' },
    footerMsg: { text: "Phiếu lưu nội bộ", top: 330, left: 0, width: 380, align: 'center', fontSize: 10, italic: true }
  },
  'Phiếu thu': {
    title: { text: "PHIẾU THU TIỀN", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Mã phiếu:", top: 115, left: 10, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAPHIEUTHU}", top: 115, left: 80, fontSize: 12 },
    lblDate: { text: "Ngày:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{THOIGIAN}", top: 140, left: 60, fontSize: 11 },
    lblCashier: { text: "Người lập:", top: 155, left: 10, fontSize: 11 },
    lblCashierVal: { text: "{TENNGUOIDUNG}", top: 155, left: 75, fontSize: 11 },
    lblTarget: { text: "Người nộp:", top: 170, left: 10, fontSize: 11 },
    lblTargetVal: { text: "{DOITUONG}", top: 170, left: 80, fontSize: 11, bold: true },
    lblReason: { text: "Lý do:", top: 185, left: 10, fontSize: 11 },
    lblReasonVal: { text: "{LYDO}", top: 185, left: 55, fontSize: 11 },
    lblAmount: { text: "Số tiền:", top: 220, left: 10, fontSize: 12, bold: true },
    lblAmountVal: { text: "{SOTIEN}", top: 220, left: 65, fontSize: 16, bold: true },
    lblAmountText: { text: "Bằng chữ:", top: 245, left: 10, fontSize: 11, italic: true },
    lblAmountTextVal: { text: "{SOTIENCHU}", top: 245, left: 75, fontSize: 11, italic: true },
    lblSign1: { text: "Người nộp", top: 290, left: 40, fontSize: 12, bold: true },
    lblSign2: { text: "Người lập phiếu", top: 290, left: 240, fontSize: 12, bold: true }
  },
  'Phiếu chi': {
    title: { text: "PHIẾU CHI TIỀN", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Mã phiếu:", top: 115, left: 10, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAPHIEUCHI}", top: 115, left: 80, fontSize: 12 },
    lblDate: { text: "Ngày:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{THOIGIAN}", top: 140, left: 60, fontSize: 11 },
    lblCashier: { text: "Người lập:", top: 155, left: 10, fontSize: 11 },
    lblCashierVal: { text: "{TENNGUOIDUNG}", top: 155, left: 75, fontSize: 11 },
    lblTarget: { text: "Người nhận:", top: 170, left: 10, fontSize: 11 },
    lblTargetVal: { text: "{DOITUONG}", top: 170, left: 85, fontSize: 11, bold: true },
    lblReason: { text: "Lý do:", top: 185, left: 10, fontSize: 11 },
    lblReasonVal: { text: "{LYDO}", top: 185, left: 55, fontSize: 11 },
    lblAmount: { text: "Số tiền:", top: 220, left: 10, fontSize: 12, bold: true },
    lblAmountVal: { text: "{SOTIEN}", top: 220, left: 65, fontSize: 16, bold: true },
    lblAmountText: { text: "Bằng chữ:", top: 245, left: 10, fontSize: 11, italic: true },
    lblAmountTextVal: { text: "{SOTIENCHU}", top: 245, left: 75, fontSize: 11, italic: true },
    lblSign1: { text: "Người nhận", top: 290, left: 40, fontSize: 12, bold: true },
    lblSign2: { text: "Người lập phiếu", top: 290, left: 240, fontSize: 12, bold: true }
  },
  'Phiếu bàn giao ca': {
    title: { text: "PHIẾU BÀN GIAO CA", top: 80, left: 0, width: 380, align: 'center', fontSize: 18, bold: true },
    lblStoreName: { text: "{TENCUAHANG}", top: 20, left: 0, width: 380, align: 'center', fontSize: 13, bold: true },
    lblAddress: { text: "{DIACHI}", top: 38, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblPhone: { text: "{SDT}", top: 54, left: 0, width: 380, align: 'center', fontSize: 11 },
    lblInvoice: { text: "Mã phiếu:", top: 115, left: 10, fontSize: 12, bold: true },
    lblInvoiceVal: { text: "{MAPHIEU}", top: 115, left: 80, fontSize: 12 },
    lblDate: { text: "Thời gian:", top: 140, left: 10, fontSize: 11 },
    lblDateVal: { text: "{THOIGIAN}", top: 140, left: 80, fontSize: 11 },
    lblShift: { text: "Ca làm việc:", top: 155, left: 10, fontSize: 11 },
    lblShiftVal: { text: "{CALAM}", top: 155, left: 90, fontSize: 11, bold: true },
    lblHandover: { text: "Người giao:", top: 170, left: 10, fontSize: 11 },
    lblHandoverVal: { text: "{NGUOIGIAO}", top: 170, left: 85, fontSize: 11 },
    lblReceiver: { text: "Người nhận:", top: 185, left: 10, fontSize: 11 },
    lblReceiverVal: { text: "{NGUOINHAN}", top: 185, left: 90, fontSize: 11 },
    lblStartCash: { text: "Tiền đầu ca:", top: 215, left: 10, fontSize: 11, bold: true },
    lblStartCashVal: { text: "{TIENDAUCA}", top: 215, left: 280, fontSize: 11, width: 90, align: 'right' },
    lblTotalRevenue: { text: "Tổng thu:", top: 230, left: 10, fontSize: 11, bold: true },
    lblTotalRevenueVal: { text: "{TONGTHU}", top: 230, left: 280, fontSize: 11, width: 90, align: 'right' },
    lblTotalExpense: { text: "Tổng chi:", top: 245, left: 10, fontSize: 11, bold: true },
    lblTotalExpenseVal: { text: "{TONGCHI}", top: 245, left: 280, fontSize: 11, width: 90, align: 'right' },
    lblRealCash: { text: "Tiền mặt thực tế:", top: 275, left: 10, fontSize: 13, bold: true },
    lblRealCashVal: { text: "{TIENTHUCTE}", top: 275, left: 260, fontSize: 16, width: 110, align: 'right', bold: true },
    lblDiff: { text: "Chênh lệch:", top: 300, left: 10, fontSize: 11, italic: true },
    lblDiffVal: { text: "{CHENHLECH}", top: 300, left: 280, fontSize: 11, width: 90, align: 'right', italic: true },
    lblSign1: { text: "Người giao", top: 350, left: 40, fontSize: 12, bold: true },
    lblSign2: { text: "Người nhận", top: 350, left: 240, fontSize: 12, bold: true }
  }
};

const MOCK_DATA_MAP = {
  'Hóa đơn': {
    TENBAN: "Bàn 4", TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAHOADON: "HD12345", NGAY: "05/03/2026", THOIGIAN: "21:35", TENNGUOIDUNG: "Thành Lợi",
    GIOBATDAU: "20:30", GIOKETTHUC: "21:35", SOGIOPHUT: "01:05",
    items: [
      { TENHANGHOA: "Bàn lỗ", SOLUONG: 1, DONGIA: "55,000", THANHTIEN: "60,000" },
      { TENHANGHOA: "Mì Xào", SOLUONG: 2, DONGIA: "20,000", THANHTIEN: "40,000" }
    ],
    TONGTIENGIO: "60,000đ", TONGTIENHANG: "40,000đ", GIAMGIA: "0", TONGTHANHTOAN: "100,000đ"
  },
  'Trả hàng': {
    TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAPHIEUTRA: "TH12345", NGAY: "05/03/2026", THOIGIAN: "21:35", TENNGUOIDUNG: "Thành Lợi",
    items: [
      { TENHANGHOA: "Mì Xào (Lỗi)", SOLUONG: 1, DONGIATRA: "20,000", THANHTIEN: "20,000" }
    ],
    TONGTHANHTOAN: "20,000đ"
  },
  'Nhập hàng': {
    TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAPHIEUNHAP: "PN00123", THOIGIAN: "05/03/2026 09:15", TENNHANVIEN: "Thành Lợi", TENNCC: "Đại lý bia Tiger",
    items: [
      { TENHANGHOA: "Bia Tiger", SOLUONGNHAP: 2, DONGIA: "350,000", THANHTIEN: "700,000" },
      { TENHANGHOA: "Bia Heineken", SOLUONGNHAP: 1, DONGIA: "420,000", THANHTIEN: "420,000" }
    ],
    TONGTIEN: "1,120,000đ", DATRA: "1,120,000đ", CANTRANCC: "0đ"
  },
  'Phiếu thu': {
    TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAPHIEUTHU: "PT00124", THOIGIAN: "05/03/2026 21:00", TENNGUOIDUNG: "Thành Lợi", DOITUONG: "Nguyễn Văn A",
    LYDO: "Thu nợ hóa đơn tháng trước", SOTIEN: "500,000đ", SOTIENCHU: "Năm trăm nghìn đồng chẵn."
  },
  'Phiếu chi': {
    TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAPHIEUCHI: "PC00125", THOIGIAN: "05/03/2026 10:30", TENNGUOIDUNG: "Thành Lợi", DOITUONG: "Cô Lan tạp vụ",
    LYDO: "Thanh toán tiền lương tuần", SOTIEN: "300,000đ", SOTIENCHU: "Ba trăm nghìn đồng chẵn."
  },
  'Phiếu bàn giao ca': {
    TENCUAHANG: "Billiards Lục Lọi", DIACHI: "123 Đường Số 1, TP.HCM", SDT: "0901234567",
    MAPHIEU: "BGC001", THOIGIAN: "05/03/2026 22:00", CALAM: "Ca tối (18:00 - 22:00)", NGUOIGIAO: "Thành Lợi", NGUOINHAN: "Thanh Khang",
    TIENDAUCA: "1,000,000đ", TONGTHU: "4,500,000đ", TONGCHI: "200,000đ", TIENTHUCTE: "5,300,000đ", CHENHLECH: "0đ"
  }
};

const parseTemplate = (templateStr, dataObj) => {
    if (!templateStr) return "";
    return templateStr.replace(/\{(\w+)\}/g, (match, key) => {
       return dataObj[key] !== undefined ? dataObj[key] : match;
    });
};

const DraggableItem = ({ id, label, isPreview, onDrag, onChange, mockData, selectedId, setSelectedId }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (isPreview) return;
    if (e.target.hasAttribute('contenteditable')) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX - (label.left || 0),
      y: e.clientY - (label.top || 0)
    });
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      // Constraint dragging within the 380px paper area
      const newLeft = Math.max(0, Math.min(380 - (label.width || 50), e.clientX - startPos.x));
      const newTop = Math.max(0, e.clientY - startPos.y);

      onDrag(id, {
        left: newLeft,
        top: newTop
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, id, onDrag, label.width]);

  const style = {
    position: 'absolute',
    top: `${label.top || 0}px`,
    left: `${label.left || 0}px`,
    width: label.width ? (typeof label.width === 'number' ? `${label.width}px` : label.width) : 'auto',
    textAlign: label.align || 'left',
    fontSize: `${label.fontSize || 12}px`,
    fontWeight: label.bold ? 'bold' : 'normal',
    fontStyle: label.italic ? 'italic' : 'normal',
    cursor: isPreview ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: 'none',
    border: isPreview ? 'none' : (id === selectedId ? '1px solid #4154F1' : '1px dashed #cbd5e1'),
    background: isPreview ? 'transparent' : (id === selectedId ? 'rgba(65, 84, 241, 0.05)' : 'transparent'),
    padding: '2px',
    whiteSpace: 'nowrap',
    zIndex: id === selectedId ? 50 : (isDragging ? 10 : (label.top < 100 ? 5 : 1)),
    fontFamily: (id === 'title' || id.includes('lblInvoice')) ? 'inherit' : 'sans-serif'
  };

  const handleClick = (e) => {
    if (isPreview) return;
    setSelectedId(id);
    e.stopPropagation();
  };

  return (
    <div 
      style={style} 
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={!isPreview ? 'hover:border-blue-400 group transition-all rounded' : ''}
    >
      {isPreview ? parseTemplate(label.text, mockData) : (
        <EditableSpan 
          value={label.text} 
          onChange={(v) => onChange(id, v)} 
          className="min-w-[10px]"
        />
      )}
    </div>
  );
};

const EditableSpan = ({ value, onChange, className = "" }) => {
  const handleBlur = (e) => {
    if (onChange) onChange(e.target.textContent);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`border border-transparent hover:border-dashed hover:border-slate-400 focus:border-solid focus:border-blue-500 focus:bg-white focus:outline-none rounded px-1 cursor-text transition-all inline-block min-w-[20px] ${className}`}
    >
      {value}
    </span>
  );
};

export default function PrintTemplate() {
  const [activeTab, setActiveTab] = useState('Hóa đơn');
  const [labels, setLabels] = useState(DEFAULT_LABELS['Hóa đơn']);
  const [selectedId, setSelectedId] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      const defaultForTab = DEFAULT_LABELS[activeTab];
      try {
        const res = await fetch(`http://localhost:5000/api/templates/${activeTab}`);
        const result = await res.json();
        if (result.success && result.data) {
           // Deep merge: prioritize backend values but ensure default coordinates if missing
           const merged = { ...defaultForTab };
           Object.keys(result.data).forEach(key => {
             if (merged[key]) {
               // Merge coordinates and styles: prioritize backend for text, top, left
               merged[key] = { 
                 ...merged[key], 
                 ...result.data[key] 
               };
             } else {
               merged[key] = result.data[key];
             }
           });
           setLabels(merged);
        } else {
           setLabels(defaultForTab);
        }
      } catch (e) {
        console.error("Lỗi kết nối Backend:", e);
        setLabels(defaultForTab);
      }
    };
    fetchTemplate();
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId || isDraggingAnywhere()) return;
      
      const step = e.shiftKey ? 10 : 1;
      const current = labels[selectedId];
      
      if (e.key === 'ArrowUp') {
        handleLabelDrag(selectedId, { top: Math.max(0, current.top - step) });
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        handleLabelDrag(selectedId, { top: current.top + step });
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        handleLabelDrag(selectedId, { left: Math.max(0, current.left - step) });
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const maxWidth = 380 - (current.width || 50);
        handleLabelDrag(selectedId, { left: Math.min(maxWidth, current.left + step) });
        e.preventDefault();
      } else if (e.key === 'Delete' || (e.key === 'Backspace' && !e.target.hasAttribute('contenteditable'))) {
        // Optional: delete logic if needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, labels]);

  const isDraggingAnywhere = () => {
    return document.body.style.cursor === 'grabbing';
  };

  const alignElement = (type) => {
    if (!selectedId) return;
    const current = labels[selectedId];
    const width = current.width || 100;

    if (type === 'center') {
      handleLabelDrag(selectedId, { left: (380 - width) / 2, align: 'center', width: 380, left: 0 });
    } else if (type === 'left') {
      handleLabelDrag(selectedId, { left: 10, align: 'left', width: 'auto' });
    } else if (type === 'right') {
      handleLabelDrag(selectedId, { left: 380 - width - 10, align: 'right' });
    }
  };

  const updateStyle = (key, value) => {
    if (!selectedId) return;
    setLabels(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [key]: value }
    }));
  };

  const handleLabelChange = (key, text) => {
    setLabels(prev => ({ 
      ...prev, 
      [key]: typeof prev[key] === 'object' ? { ...prev[key], text } : { text, top: 0, left: 0 } 
    }));
  };

  const handleLabelDrag = (key, pos) => {
    setLabels(prev => ({
      ...prev,
      [key]: { ...prev[key], ...pos }
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/templates/${activeTab}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(labels)
      });
      const result = await res.json();
      if (result.success) {
         Swal.fire({
           icon: 'success',
           title: 'Đã lưu!',
           text: 'Bản in hệ thống đã được đồng bộ.',
           confirmButtonColor: '#4154F1'
         });
      } else {
         Swal.fire("Lỗi", result.message || "Không thể lưu bản in", "error");
      }
    } catch (e) {
      Swal.fire("Lỗi mạng", "Không kết nối được đến máy chủ", "error");
    }
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Khôi phục mặc định?',
      text: "Tất cả thông tin chỉnh sửa sẽ bị xóa bỏ!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Khôi phục',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const defaultLabels = DEFAULT_LABELS[activeTab];
        setLabels(defaultLabels);
        
        // Tự động lưu bản in mặc định vào DB để tránh lỗi trắng trang khi reload
        try {
          await fetch(`http://localhost:5000/api/templates/${activeTab}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultLabels)
          });
          Swal.fire('Đã khôi phục', 'Bản in đã được đưa về trạng thái mặc định chuyên nghiệp.', 'success');
        } catch (e) {
          console.error("Lỗi lưu mẫu in mặc định:", e);
        }
      }
    });
  };

  const mockData = MOCK_DATA_MAP[activeTab] || MOCK_DATA_MAP['Hóa đơn'];

  const renderCanvas = (isPreview) => {
    const gridStyle = (!isPreview && showGrid) ? {
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    } : {};

    return (
      <div 
        className="relative w-[380px] min-h-[600px] bg-white shadow-lg mx-auto" 
        style={{ ...gridStyle, border: isPreview ? 'none' : '1px solid #e2e8f0' }}
        onClick={() => !isPreview && setSelectedId(null)}
      >
        {Object.entries(labels).map(([key, label]) => {
          // Special handling for labels that represent the items table values
          // Since it's a list, we show dummy rows in the designer/preview
          if (key.endsWith('Val') && mockData.items && (key === 'lblItemVal' || key === 'lblQtyVal' || key === 'lblPriceVal' || key === 'lblTotalItemVal')) {
            return mockData.items.map((item, idx) => {
              const itemLabel = { ...label, top: label.top + (idx * 20), text: parseTemplate(label.text, item) };
              return (
                <DraggableItem
                  key={`${key}-${idx}`}
                  id={key}
                  label={itemLabel}
                  isPreview={isPreview}
                  onDrag={handleLabelDrag}
                  onChange={handleLabelChange}
                  mockData={mockData}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              );
            });
          }
          
          return (
            <DraggableItem
              key={key}
              id={key}
              label={label}
              isPreview={isPreview}
              onDrag={handleLabelDrag}
              onChange={handleLabelChange}
              mockData={mockData}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          );
        })}
      </div>
    );
  };

  const getTemplateLayout = (isPreview) => {
    return renderCanvas(isPreview);
  };

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Thiết lập" />

      <main className="flex-1 overflow-y-auto px-8 py-6 bg-white min-h-0">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 font-sans">Mẫu in</h1>
        
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[14px] font-bold mb-8 font-sans border-b border-slate-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-all cursor-pointer pb-2 border-b-2 -mb-[1px] px-1 ${activeTab === tab ? 'text-[#4154F1] border-[#4154F1]' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 font-sans">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowGrid(!showGrid)} 
              className={`px-3 py-1 text-[11px] font-bold rounded border transition-colors ${showGrid ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              {showGrid ? 'Ẩn lưới' : 'Hiện lưới'}
            </button>
          </div>

          {selectedId && (
            <div className="flex items-center gap-1 bg-white border border-blue-100 p-1 rounded shadow-sm animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] font-bold text-blue-400 px-2 uppercase tracking-tight">Căn lề:</span>
              <button onClick={() => alignElement('left')} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="Căn trái"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg></button>
              <button onClick={() => alignElement('center')} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="Căn giữa"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg></button>
              <button onClick={() => alignElement('right')} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="Căn phải"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg></button>
              
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              
              <button 
                onClick={() => updateStyle('bold', !labels[selectedId].bold)} 
                className={`p-1.5 rounded transition-colors ${labels[selectedId].bold ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-600'}`}
                title="In đậm"
              >
                <span className="font-bold">B</span>
              </button>
              <button 
                onClick={() => updateStyle('italic', !labels[selectedId].italic)} 
                className={`p-1.5 rounded transition-colors ${labels[selectedId].italic ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-600'}`}
                title="In nghiêng"
              >
                <span className="italic">I</span>
              </button>
              
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              
              <div className="flex items-center gap-1 ml-1">
                <button onClick={() => updateStyle('fontSize', (labels[selectedId].fontSize || 12) - 1)} className="p-1 hover:bg-blue-50 text-blue-600 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
                <span className="text-[11px] font-bold w-4 text-center">{labels[selectedId].fontSize || 12}</span>
                <button onClick={() => updateStyle('fontSize', (labels[selectedId].fontSize || 12) + 1)} className="p-1 hover:bg-blue-50 text-blue-600 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" /></svg></button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 min-h-[600px] h-auto pb-10">
          
          <div className="flex-1 bg-[#F4F6F8] relative border border-slate-200 rounded">
            <div className="flex justify-between items-center p-4">
              <h3 className="font-bold text-slate-600 text-[13px] font-sans">Mẫu in ({activeTab})</h3>
              <button onClick={handleReset} className="bg-white border border-slate-200 px-3 py-1 text-[11px] font-sans font-bold rounded shadow-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                Khôi phục gốc
              </button>
            </div>
            
            <div className="p-4 pt-0 w-full flex justify-center pb-20">
               <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[420px] p-6 font-mono text-[12px] text-slate-800 min-h-[500px]">
                  {getTemplateLayout(false)}
               </div>
            </div>
            
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
               <button onClick={handleSave} className="bg-[#4154F1] hover:bg-blue-700 font-sans font-bold text-white flex items-center gap-2 px-4 py-2 text-[13px] rounded shadow cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Lưu bản in
               </button>
            </div>
          </div>

          <div className="flex-1 bg-[#E1EDFA] relative border border-slate-200 rounded">
             <div className="flex justify-end items-center p-4">
                <h3 className="font-bold text-slate-800 text-[13px] font-sans">Xem trước mẫu in</h3>
             </div>
             
             <div className="p-4 pt-0 w-full flex justify-center pb-20">
               <div className="w-full max-w-[420px] p-6 font-mono text-[12px] text-slate-800">
                  {getTemplateLayout(true)}
               </div>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
