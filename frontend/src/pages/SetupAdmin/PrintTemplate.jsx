import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import Swal from "sweetalert2";

const TABS = ['Hóa đơn', 'Trả hàng', 'Nhập hàng', 'Phiếu thu', 'Phiếu chi', 'Phiếu bàn giao ca'];

const DEFAULT_LABELS = {
  'Hóa đơn': {
    title: "HÓA ĐƠN THANH TOÁN",
    lblTableName: "{Ten_Ban}",
    lblStoreName: "{Ten_Cua_Hang}",
    lblAddress: "{Dia_Chi}",
    lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Hóa đơn:", lblInvoiceVal: "{Ma_Hoa_Don}",
    lblDate: "Ngày:", lblDateVal: "{Ngay_Thang_Hien_Tai}",
    lblTime: "Giờ:", lblTimeVal: "{Gio_Hien_Tai}",
    lblCashier: "Thu ngân:", lblCashierVal: "{Ten_Nhan_Vien}",
    lblTimeIn: "Giờ vào:", lblTimeInVal: "{Gio_Vao}",
    lblTimeOut: "Giờ ra:", lblTimeOutVal: "{Gio_Ra}",
    lblPlayTime: "Giờ chơi:", lblPlayTimeVal: "{Gio_Choi}",
    lblItem: "Tên hàng", lblQty: "SL", lblPrice: "Đơn giá", lblTotalItem: "Thành tiền",
    lblItemVal: "{Ten_hang_hoa}", lblQtyVal: "{So_Luong}", lblPriceVal: "{Don_Gia}", lblTotalItemVal: "{Thanh_Tien}",
    qrText: "Quét QR để thanh toán!",
    lblTotalRaw: "Tổng tiền:", lblTotalRawVal: "{Tong_Tien}",
    lblTotalGoods: "Dịch vụ:", lblTotalGoodsVal: "{Tong_Dich_Vu}",
    lblDiscount: "Giảm giá:", lblDiscountVal: "{Giam_gia}",
    lblGrandTotal: "Tổng cộng:", lblGrandTotalVal: "{Tong_Cong}",
    footerMsg: "Cảm ơn quý khách đã chơi!"
  },
  'Trả hàng': {
    title: "PHIẾU TRẢ HÀNG",
    lblStoreName: "{Ten_Cua_Hang}", lblAddress: "{Dia_Chi}", lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Phiếu trả:", lblInvoiceVal: "{Ma_Hoa_Don}",
    lblDate: "Ngày:", lblDateVal: "{Ngay_Thang_Hien_Tai}",
    lblTime: "Giờ:", lblTimeVal: "{Gio_Hien_Tai}",
    lblCashier: "Nhân viên:", lblCashierVal: "{Ten_Nhan_Vien}",
    lblItem: "Tên hàng", lblQty: "SL trả", lblPrice: "Đơn giá", lblTotalItem: "Thành tiền",
    lblItemVal: "{Ten_hang_hoa}", lblQtyVal: "{So_Luong}", lblPriceVal: "{Don_Gia}", lblTotalItemVal: "{Thanh_Tien}",
    lblTotalRaw: "Tiền trả lại:", lblTotalRawVal: "{Tong_Cong}",
    footerMsg: "Cảm ơn quý khách!"
  },
  'Nhập hàng': {
    title: "PHIẾU NHẬP HÀNG",
    lblStoreName: "{Ten_Cua_Hang}", lblAddress: "{Dia_Chi}", lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Mã phiếu:", lblInvoiceVal: "{Ma_Phieu}",
    lblDate: "Ngày nhập:", lblDateVal: "{Ngay_Thang}",
    lblCashier: "Người lập:", lblCashierVal: "{Nguoi_Lap}",
    lblSupplier: "NCC:", lblSupplierVal: "{Nha_Cung_Cap}",
    lblItem: "Tên hàng", lblQty: "SL", lblPrice: "Đơn giá", lblTotalItem: "Thành tiền",
    lblItemVal: "{Ten_hang}", lblQtyVal: "{So_Luong}", lblPriceVal: "{Don_Gia}", lblTotalItemVal: "{Thanh_Tien}",
    lblTotalRaw: "Tổng tiển:", lblTotalRawVal: "{Tong_Tien}",
    lblPaid: "Đã trả:", lblPaidVal: "{Da_Tra}",
    lblDebt: "Công nợ:", lblDebtVal: "{Cong_No}",
    footerMsg: "Phiếu lưu nội bộ"
  },
  'Phiếu thu': {
    title: "PHIẾU THU TIỀN",
    lblStoreName: "{Ten_Cua_Hang}", lblAddress: "{Dia_Chi}", lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Mã phiếu:", lblInvoiceVal: "{Ma_Phieu}",
    lblDate: "Ngày:", lblDateVal: "{Ngay_Thang}",
    lblCashier: "Người lập:", lblCashierVal: "{Nguoi_Lap}",
    lblTarget: "Người nộp:", lblTargetVal: "{Doi_Tuong}",
    lblReason: "Lý do:", lblReasonVal: "{Ly_Do}",
    lblAmount: "Số tiền:", lblAmountVal: "{So_Tien}",
    lblAmountText: "Bằng chữ:", lblAmountTextVal: "{So_Tien_Chu}",
    lblSign1: "Người nộp", lblSign2: "Người lập phiếu"
  },
  'Phiếu chi': {
    title: "PHIẾU CHI TIỀN",
    lblStoreName: "{Ten_Cua_Hang}", lblAddress: "{Dia_Chi}", lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Mã phiếu:", lblInvoiceVal: "{Ma_Phieu}",
    lblDate: "Ngày:", lblDateVal: "{Ngay_Thang}",
    lblCashier: "Người lập:", lblCashierVal: "{Nguoi_Lap}",
    lblTarget: "Người nhận:", lblTargetVal: "{Doi_Tuong}",
    lblReason: "Lý do:", lblReasonVal: "{Ly_Do}",
    lblAmount: "Số tiền:", lblAmountVal: "{So_Tien}",
    lblAmountText: "Bằng chữ:", lblAmountTextVal: "{So_Tien_Chu}",
    lblSign1: "Người nhận", lblSign2: "Người lập phiếu"
  },
  'Phiếu bàn giao ca': {
    title: "PHIẾU BÀN GIAO CA",
    lblStoreName: "{Ten_Cua_Hang}", lblAddress: "{Dia_Chi}", lblPhone: "{So_Dien_Thoai}",
    lblInvoice: "Mã phiếu:", lblInvoiceVal: "{Ma_Phieu}",
    lblDate: "Thời gian:", lblDateVal: "{Ngay_Thang}",
    lblShift: "Ca làm việc:", lblShiftVal: "{Ca_Lam}",
    lblHandover: "Người giao:", lblHandoverVal: "{Nguoi_Giao}",
    lblReceiver: "Người nhận:", lblReceiverVal: "{Nguoi_Nhan}",
    lblStartCash: "Tiền đầu ca:", lblStartCashVal: "{Tien_Đau_Ca}",
    lblTotalRevenue: "Tổng thu:", lblTotalRevenueVal: "{Tong_Thu}",
    lblTotalExpense: "Tổng chi:", lblTotalExpenseVal: "{Tong_Chi}",
    lblRealCash: "Tiền mặt thực tế:", lblRealCashVal: "{Tien_Thuc_Te}",
    lblDiff: "Chênh lệch:", lblDiffVal: "{Chenh_Lech}",
    lblSign1: "Người giao", lblSign2: "Người nhận"
  }
};

const MOCK_DATA_MAP = {
  'Hóa đơn': {
    Ten_Ban: "Bàn 4", Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Hoa_Don: "HD12345", Ngay_Thang_Hien_Tai: "05/03/2026", Gio_Hien_Tai: "21:35", Ten_Nhan_Vien: "Thành Lợi",
    Gio_Vao: "20:30", Gio_Ra: "21:35", Gio_Choi: "01:05:35",
    items: [
      { Ten_hang_hoa: "Bàn lỗ", So_Luong: 1, Don_Gia: "55,000", Thanh_Tien: "60,000" },
      { Ten_hang_hoa: "Mì Xào", So_Luong: 2, Don_Gia: "20,000", Thanh_Tien: "40,000" }
    ],
    Tong_Tien: "100,000đ", Tong_Dich_Vu: "40,000đ", Giam_gia: "0", Tong_Cong: "100,000đ"
  },
  'Trả hàng': {
    Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Hoa_Don: "TH12345", Ngay_Thang_Hien_Tai: "05/03/2026", Gio_Hien_Tai: "21:35", Ten_Nhan_Vien: "Thành Lợi",
    items: [
      { Ten_hang_hoa: "Mì Xào (Lỗi)", So_Luong: 1, Don_Gia: "20,000", Thanh_Tien: "20,000" }
    ],
    Tong_Cong: "20,000đ"
  },
  'Nhập hàng': {
    Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Phieu: "PN00123", Ngay_Thang: "05/03/2026 09:15", Nguoi_Lap: "Thành Lợi", Nha_Cung_Cap: "Đại lý bia Tiger",
    items: [
      { Ten_hang: "Bia Tiger", So_Luong: 2, Don_Gia: "350,000", Thanh_Tien: "700,000" },
      { Ten_hang: "Bia Heineken", So_Luong: 1, Don_Gia: "420,000", Thanh_Tien: "420,000" }
    ],
    Tong_Tien: "1,120,000đ", Da_Tra: "1,120,000đ", Cong_No: "0đ"
  },
  'Phiếu thu': {
    Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Phieu: "PT00124", Ngay_Thang: "05/03/2026 21:00", Nguoi_Lap: "Thành Lợi", Doi_Tuong: "Nguyễn Văn A",
    Ly_Do: "Thu nợ hóa đơn tháng trước", So_Tien: "500,000đ", So_Tien_Chu: "Năm trăm nghìn đồng chẵn."
  },
  'Phiếu chi': {
    Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Phieu: "PC00125", Ngay_Thang: "05/03/2026 10:30", Nguoi_Lap: "Thành Lợi", Doi_Tuong: "Cô Lan tạp vụ",
    Ly_Do: "Thanh toán tiền lương tuần", So_Tien: "300,000đ", So_Tien_Chu: "Ba trăm nghìn đồng chẵn."
  },
  'Phiếu bàn giao ca': {
    Ten_Cua_Hang: "Billiards Lục Lọi", Dia_Chi: "123 Đường Số 1, TP.HCM", So_Dien_Thoai: "0901234567",
    Ma_Phieu: "BGC001", Ngay_Thang: "05/03/2026 22:00", Ca_Lam: "Ca tối (18:00 - 22:00)", Nguoi_Giao: "Thành Lợi", Nguoi_Nhan: "Thanh Khang",
    Tien_Đau_Ca: "1,000,000đ", Tong_Thu: "4,500,000đ", Tong_Chi: "200,000đ", Tien_Thuc_Te: "5,300,000đ", Chenh_Lech: "0đ"
  }
};

const parseTemplate = (templateStr, dataObj) => {
    if (!templateStr) return "";
    return templateStr.replace(/\{(\w+)\}/g, (match, key) => {
       return dataObj[key] !== undefined ? dataObj[key] : match;
    });
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

  useEffect(() => {
    const defaultForTab = DEFAULT_LABELS[activeTab];
    const savedForTab = localStorage.getItem(`print_labels_${activeTab}`);
    if (savedForTab) {
      try {
        const parsed = JSON.parse(savedForTab);
        setLabels({ ...defaultForTab, ...parsed });
      } catch (e) {
        setLabels(defaultForTab);
      }
    } else {
      setLabels(defaultForTab);
    }
  }, [activeTab]);

  const handleLabelChange = (key, text) => {
    setLabels(prev => ({ ...prev, [key]: text }));
  };

  const handleSave = () => {
    localStorage.setItem(`print_labels_${activeTab}`, JSON.stringify(labels));
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu!',
      text: 'Bản in đã được lưu thành công.',
      confirmButtonColor: '#4154F1'
    });
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
    }).then((result) => {
      if (result.isConfirmed) {
        setLabels(DEFAULT_LABELS[activeTab]);
        localStorage.removeItem(`print_labels_${activeTab}`);
      }
    });
  };

  const mockData = MOCK_DATA_MAP[activeTab] || MOCK_DATA_MAP['Hóa đơn'];

  // Template renderers based on activeTab
  const renderHeader = (isPreview = false) => (
    <div className="relative text-center mb-6 leading-relaxed flex flex-col gap-1 items-center">
      {labels.lblTableName && !isPreview && <div className="absolute left-0 top-0 font-sans whitespace-nowrap text-blue-800/80"><EditableSpan value={labels.lblTableName} onChange={(v)=>handleLabelChange('lblTableName',v)} /></div>}
      {labels.lblTableName && isPreview && <div className="absolute left-0 top-0 font-sans whitespace-nowrap text-black font-bold">{parseTemplate(labels.lblTableName, mockData)}</div>}
      
      <div className={`text-[13px] font-sans font-medium ${isPreview?'text-black':'text-blue-800/80'}`}>
         {isPreview ? parseTemplate(labels.lblStoreName, mockData) : <EditableSpan value={labels.lblStoreName} onChange={(v)=>handleLabelChange('lblStoreName',v)} />}
      </div>
      <div className={`font-sans text-[11px] ${isPreview?'opacity-80 text-black':'opacity-80 text-blue-800/80'}`}>
         {isPreview ? parseTemplate(labels.lblAddress, mockData) : <EditableSpan value={labels.lblAddress} onChange={(v)=>handleLabelChange('lblAddress',v)} />}
      </div>
      <div className={`font-sans text-[11px] ${isPreview?'opacity-80 text-black':'opacity-80 text-blue-800/80'}`}>
         {isPreview ? parseTemplate(labels.lblPhone, mockData) : <EditableSpan value={labels.lblPhone} onChange={(v)=>handleLabelChange('lblPhone',v)} />}
      </div>
    </div>
  );

  const renderTitle = (isPreview = false) => (
    <div className="text-center font-bold text-[18px] mb-4 font-sans text-black">
      {isPreview ? parseTemplate(labels.title, mockData) : <EditableSpan value={labels.title} onChange={(v)=>handleLabelChange('title',v)} className="w-full text-center" />}
    </div>
  );

  // Layouts
  const renderInvoiceAndReturn = (isPreview) => (
    <>
      {renderHeader(isPreview)}
      {renderTitle(isPreview)}
      
      <div className="text-center text-[13px] font-bold font-sans text-black mb-4 flex items-center justify-center gap-1">
        {isPreview ? <span className="whitespace-nowrap">{parseTemplate(labels.lblInvoice, mockData)}</span> : <EditableSpan value={labels.lblInvoice} onChange={(v)=>handleLabelChange('lblInvoice',v)} className="whitespace-nowrap" />}
        <span className={isPreview?"font-normal":"text-blue-800/80 font-normal"}>
          {isPreview ? parseTemplate(labels.lblInvoiceVal, mockData) : <EditableSpan value={labels.lblInvoiceVal} onChange={(v)=>handleLabelChange('lblInvoiceVal',v)} />}
        </span>
      </div>
      
      <div className="grid grid-cols-[1fr_min-content_1fr] gap-x-2 gap-y-1 mb-5 text-[11px] font-sans">
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
            {isPreview ? <span className="text-right">{parseTemplate(labels.lblDate, mockData)}</span> : <EditableSpan value={labels.lblDate} onChange={(v)=>handleLabelChange('lblDate',v)} className="opacity-80 text-right" />}
            <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblDateVal, mockData) : <EditableSpan value={labels.lblDateVal} onChange={(v)=>handleLabelChange('lblDateVal',v)} className="inline-block" />}
            </span>
          </div>
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
            {isPreview ? <span className="text-right">{parseTemplate(labels.lblTime, mockData)}</span> : <EditableSpan value={labels.lblTime} onChange={(v)=>handleLabelChange('lblTime',v)} className="opacity-80 text-right" />}
            <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblTimeVal, mockData) : <EditableSpan value={labels.lblTimeVal} onChange={(v)=>handleLabelChange('lblTimeVal',v)} className="inline-block" />}
            </span>
          </div>
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
            {isPreview ? <span className="text-right">{parseTemplate(labels.lblCashier, mockData)}</span> : <EditableSpan value={labels.lblCashier} onChange={(v)=>handleLabelChange('lblCashier',v)} className="opacity-80 text-right" />}
            <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblCashierVal, mockData) : <EditableSpan value={labels.lblCashierVal} onChange={(v)=>handleLabelChange('lblCashierVal',v)} className="inline-block" />}
            </span>
          </div>
        </div>
        <div className="w-1"></div>
        {labels.lblTimeIn && (
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
            {isPreview ? <span className="text-right">{parseTemplate(labels.lblTimeIn, mockData)}</span> : <EditableSpan value={labels.lblTimeIn} onChange={(v)=>handleLabelChange('lblTimeIn',v)} className="opacity-80 text-right" />}
            <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblTimeInVal, mockData) : <EditableSpan value={labels.lblTimeInVal} onChange={(v)=>handleLabelChange('lblTimeInVal',v)} className="inline-block" />}
            </span>
          </div>
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
             {isPreview ? <span className="text-right">{parseTemplate(labels.lblTimeOut, mockData)}</span> : <EditableSpan value={labels.lblTimeOut} onChange={(v)=>handleLabelChange('lblTimeOut',v)} className="opacity-80 text-right" />}
             <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblTimeOutVal, mockData) : <EditableSpan value={labels.lblTimeOutVal} onChange={(v)=>handleLabelChange('lblTimeOutVal',v)} className="inline-block" />}
            </span>
          </div>
          <div className="grid grid-cols-[min-content_1fr] items-center whitespace-nowrap gap-2">
             {isPreview ? <span className="text-right">{parseTemplate(labels.lblPlayTime, mockData)}</span> : <EditableSpan value={labels.lblPlayTime} onChange={(v)=>handleLabelChange('lblPlayTime',v)} className="opacity-80 text-right" />}
             <span className={isPreview?"text-black font-medium":"text-blue-800/80 w-full"}>
              {isPreview ? parseTemplate(labels.lblPlayTimeVal, mockData) : <EditableSpan value={labels.lblPlayTimeVal} onChange={(v)=>handleLabelChange('lblPlayTimeVal',v)} className="inline-block" />}
            </span>
          </div>
        </div>)}
      </div>
      
      {labels.lblItem && (
      <div className="border-t border-b border-slate-200 py-2 mb-3">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] font-bold font-sans text-[11px] mb-2 text-center text-black">
          <div className="text-left">{isPreview ? parseTemplate(labels.lblItem, mockData) : <EditableSpan value={labels.lblItem} onChange={(v)=>handleLabelChange('lblItem',v)} />}</div>
          <div>{isPreview ? parseTemplate(labels.lblQty, mockData) : <EditableSpan value={labels.lblQty} onChange={(v)=>handleLabelChange('lblQty',v)} />}</div>
          <div>{isPreview ? parseTemplate(labels.lblPrice, mockData) : <EditableSpan value={labels.lblPrice} onChange={(v)=>handleLabelChange('lblPrice',v)} />}</div>
          <div className="text-right">{isPreview ? parseTemplate(labels.lblTotalItem, mockData) : <EditableSpan value={labels.lblTotalItem} onChange={(v)=>handleLabelChange('lblTotalItem',v)} />}</div>
        </div>
        
        <div className={`text-[11px] font-sans text-center items-center ${isPreview?'text-black':'text-blue-800/80'}`}>
          {isPreview ? mockData.items.map((item, idx) => (
             <div key={idx} className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] mb-1">
               <div className="text-left font-sans truncate pr-1">{parseTemplate(labels.lblItemVal, item)}</div>
               <div className="truncate">{parseTemplate(labels.lblQtyVal, item)}</div>
               <div className="truncate">{parseTemplate(labels.lblPriceVal, item)}</div>
               <div className="text-right truncate">{parseTemplate(labels.lblTotalItemVal, item)}</div>
             </div>
          )) : (
             <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] mb-1 text-center">
               <div className="text-left"><EditableSpan value={labels.lblItemVal} onChange={(v)=>handleLabelChange('lblItemVal',v)} className="truncate block" /></div>
               <div><EditableSpan value={labels.lblQtyVal} onChange={(v)=>handleLabelChange('lblQtyVal',v)} className="truncate block" /></div>
               <div><EditableSpan value={labels.lblPriceVal} onChange={(v)=>handleLabelChange('lblPriceVal',v)} className="truncate block" /></div>
               <div className="text-right"><EditableSpan value={labels.lblTotalItemVal} onChange={(v)=>handleLabelChange('lblTotalItemVal',v)} className="truncate block" /></div>
             </div>
          )}
        </div>
      </div>
      )}

      <div className="flex justify-between items-start pt-2">
         {labels.qrText ? (
           <div className={`w-20 h-20 bg-white border border-dashed rounded flex flex-col items-center justify-center p-2 text-center mt-2 shadow-sm ${isPreview?'border-slate-200':'border-slate-300 hover:bg-slate-50'}`}>
              <svg className="w-5 h-5 mb-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-[7px] text-slate-400 font-sans leading-tight">
                 {isPreview ? parseTemplate(labels.qrText, mockData) : <EditableSpan value={labels.qrText} onChange={(v)=>handleLabelChange('qrText', v)} className="block w-full text-center" />}
              </span>
           </div>
         ) : <div></div>}
         
         <div className="flex-1 ml-4 text-[11px] font-sans text-black flex flex-col items-end">
            <div className="grid grid-cols-[1fr_min-content] gap-2 mb-1 justify-items-end text-right w-full items-center">
              <span className="font-bold text-right whitespace-nowrap">{isPreview ? parseTemplate(labels.lblTotalRaw, mockData) : <EditableSpan value={labels.lblTotalRaw} onChange={(v)=>handleLabelChange('lblTotalRaw',v)} />}</span>
              <span className={isPreview?"min-w-[60px] font-medium text-right":"text-blue-800/80"}>
                {isPreview ? parseTemplate(labels.lblTotalRawVal, mockData) : <EditableSpan value={labels.lblTotalRawVal} onChange={(v)=>handleLabelChange('lblTotalRawVal',v)} className="whitespace-nowrap block" />}
              </span>
            </div>
            {labels.lblTotalGoods && (
              <div className="grid grid-cols-[1fr_min-content] gap-2 mb-1 justify-items-end text-right w-full items-center">
                <span className="font-bold text-right whitespace-nowrap">{isPreview ? parseTemplate(labels.lblTotalGoods, mockData) : <EditableSpan value={labels.lblTotalGoods} onChange={(v)=>handleLabelChange('lblTotalGoods',v)} />}</span>
                <span className={isPreview?"min-w-[60px] font-medium text-right":"text-blue-800/80"}>
                  {isPreview ? parseTemplate(labels.lblTotalGoodsVal, mockData) : <EditableSpan value={labels.lblTotalGoodsVal} onChange={(v)=>handleLabelChange('lblTotalGoodsVal',v)} className="whitespace-nowrap block" />}
                </span>
              </div>
            )}
            {labels.lblDiscount && (
              <div className="grid grid-cols-[1fr_min-content] gap-2 mb-1 justify-items-end text-right w-full items-center">
                <span className="font-bold text-right whitespace-nowrap">{isPreview ? parseTemplate(labels.lblDiscount, mockData) : <EditableSpan value={labels.lblDiscount} onChange={(v)=>handleLabelChange('lblDiscount',v)} />}</span>
                <span className={isPreview?"min-w-[60px] font-medium text-right":"text-blue-800/80"}>
                  {isPreview ? parseTemplate(labels.lblDiscountVal, mockData) : <EditableSpan value={labels.lblDiscountVal} onChange={(v)=>handleLabelChange('lblDiscountVal',v)} className="whitespace-nowrap block" />}
                </span>
              </div>
            )}
            {labels.lblGrandTotal && (
              <div className="grid grid-cols-[1fr_min-content] gap-2 mt-2 pt-2 border-t border-slate-800 font-bold text-[13px] justify-items-end text-right w-full items-center">
                <span className="text-right whitespace-nowrap max-w-[100px]">{isPreview ? parseTemplate(labels.lblGrandTotal, mockData) : <EditableSpan value={labels.lblGrandTotal} onChange={(v)=>handleLabelChange('lblGrandTotal',v)} />}</span>
                <span className={isPreview?"min-w-[60px] text-right":"text-blue-800/80"}>
                  {isPreview ? parseTemplate(labels.lblGrandTotalVal, mockData) : <EditableSpan value={labels.lblGrandTotalVal} onChange={(v)=>handleLabelChange('lblGrandTotalVal',v)} className="whitespace-nowrap block" />}
                </span>
              </div>
            )}
         </div>
      </div>
      
      <div className="text-center italic mt-10 text-[10px] text-black font-sans opacity-70">
          {isPreview ? parseTemplate(labels.footerMsg, mockData) : <EditableSpan value={labels.footerMsg} onChange={(v)=>handleLabelChange('footerMsg',v)} className="w-full text-center" />}
      </div>
    </>
  );

  const renderSimpleReceipt = (isPreview) => (
    <>
      {renderHeader(isPreview)}
      {renderTitle(isPreview)}
      
      <div className="text-center text-[13px] font-bold font-sans text-black mb-6 flex items-center justify-center gap-1">
        {isPreview ? <span>{parseTemplate(labels.lblInvoice, mockData)}</span> : <EditableSpan value={labels.lblInvoice} onChange={(v)=>handleLabelChange('lblInvoice',v)} />}
        <span className={isPreview?"font-normal":"text-blue-800/80 font-normal"}>
          {isPreview ? parseTemplate(labels.lblInvoiceVal, mockData) : <EditableSpan value={labels.lblInvoiceVal} onChange={(v)=>handleLabelChange('lblInvoiceVal',v)} />}
        </span>
      </div>

      <div className="flex flex-col gap-3 text-[12px] font-sans mb-10 w-full">
         <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <span className="font-bold opacity-80">{isPreview ? parseTemplate(labels.lblDate, mockData) : <EditableSpan value={labels.lblDate} onChange={(v)=>handleLabelChange('lblDate',v)} />}</span> 
            <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>
              {isPreview ? parseTemplate(labels.lblDateVal, mockData) : <EditableSpan value={labels.lblDateVal} onChange={(v)=>handleLabelChange('lblDateVal',v)} />}
            </span>
         </div>
         <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <span className="font-bold opacity-80">{isPreview ? parseTemplate(labels.lblCashier, mockData) : <EditableSpan value={labels.lblCashier} onChange={(v)=>handleLabelChange('lblCashier',v)} />}</span> 
            <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>
              {isPreview ? parseTemplate(labels.lblCashierVal, mockData) : <EditableSpan value={labels.lblCashierVal} onChange={(v)=>handleLabelChange('lblCashierVal',v)} />}
            </span>
         </div>
         {labels.lblTarget && (
         <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <span className="font-bold opacity-80">{isPreview ? parseTemplate(labels.lblTarget, mockData) : <EditableSpan value={labels.lblTarget} onChange={(v)=>handleLabelChange('lblTarget',v)} />}</span> 
            <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>
              {isPreview ? parseTemplate(labels.lblTargetVal, mockData) : <EditableSpan value={labels.lblTargetVal} onChange={(v)=>handleLabelChange('lblTargetVal',v)} />}
            </span>
         </div>)}
         {labels.lblShift && (
         <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <span className="font-bold opacity-80">{isPreview ? parseTemplate(labels.lblShift, mockData) : <EditableSpan value={labels.lblShift} onChange={(v)=>handleLabelChange('lblShift',v)} />}</span> 
            <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>
              {isPreview ? parseTemplate(labels.lblShiftVal, mockData) : <EditableSpan value={labels.lblShiftVal} onChange={(v)=>handleLabelChange('lblShiftVal',v)} />}
            </span>
         </div>)}
         {labels.lblReason && (
         <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <span className="font-bold opacity-80">{isPreview ? parseTemplate(labels.lblReason, mockData) : <EditableSpan value={labels.lblReason} onChange={(v)=>handleLabelChange('lblReason',v)} />}</span> 
            <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>
              {isPreview ? parseTemplate(labels.lblReasonVal, mockData) : <EditableSpan value={labels.lblReasonVal} onChange={(v)=>handleLabelChange('lblReasonVal',v)} />}
            </span>
         </div>)}
         
         {/* Phieu Chi / Thu */}
         {labels.lblAmount && (
         <>
           <div className="grid grid-cols-[100px_1fr] items-start gap-2 mt-2">
              <span className="font-bold text-[14px]">{isPreview ? parseTemplate(labels.lblAmount, mockData) : <EditableSpan value={labels.lblAmount} onChange={(v)=>handleLabelChange('lblAmount',v)} />}</span> 
              <span className={isPreview?"text-black font-bold text-[14px]":"text-blue-800/80 font-bold text-[14px]"}>
                {isPreview ? parseTemplate(labels.lblAmountVal, mockData) : <EditableSpan value={labels.lblAmountVal} onChange={(v)=>handleLabelChange('lblAmountVal',v)} />}
              </span>
           </div>
           <div className="grid grid-cols-[100px_1fr] items-start gap-2 italic">
              <span className="opacity-80">{isPreview ? parseTemplate(labels.lblAmountText, mockData) : <EditableSpan value={labels.lblAmountText} onChange={(v)=>handleLabelChange('lblAmountText',v)} />}</span> 
              <span className={isPreview?"text-black":"text-blue-800/80"}>
                {isPreview ? parseTemplate(labels.lblAmountTextVal, mockData) : <EditableSpan value={labels.lblAmountTextVal} onChange={(v)=>handleLabelChange('lblAmountTextVal',v)} />}
              </span>
           </div>
         </>)}

         {/* Ban Giao Ca */}
         {labels.lblTotalRevenue && (
           <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
             <div className="flex justify-between items-center">
                <span className="font-bold">{isPreview ? parseTemplate(labels.lblStartCash, mockData) : <EditableSpan value={labels.lblStartCash} onChange={(v)=>handleLabelChange('lblStartCash',v)} />}</span> 
                <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>{isPreview ? parseTemplate(labels.lblStartCashVal, mockData) : <EditableSpan value={labels.lblStartCashVal} onChange={(v)=>handleLabelChange('lblStartCashVal',v)} />}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="font-bold">{isPreview ? parseTemplate(labels.lblTotalRevenue, mockData) : <EditableSpan value={labels.lblTotalRevenue} onChange={(v)=>handleLabelChange('lblTotalRevenue',v)} />}</span> 
                <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>{isPreview ? parseTemplate(labels.lblTotalRevenueVal, mockData) : <EditableSpan value={labels.lblTotalRevenueVal} onChange={(v)=>handleLabelChange('lblTotalRevenueVal',v)} />}</span>
             </div>
             <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-300">
                <span className="font-bold">{isPreview ? parseTemplate(labels.lblTotalExpense, mockData) : <EditableSpan value={labels.lblTotalExpense} onChange={(v)=>handleLabelChange('lblTotalExpense',v)} />}</span> 
                <span className={isPreview?"text-black font-medium":"text-blue-800/80"}>{isPreview ? parseTemplate(labels.lblTotalExpenseVal, mockData) : <EditableSpan value={labels.lblTotalExpenseVal} onChange={(v)=>handleLabelChange('lblTotalExpenseVal',v)} />}</span>
             </div>
             <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-[14px]">{isPreview ? parseTemplate(labels.lblRealCash, mockData) : <EditableSpan value={labels.lblRealCash} onChange={(v)=>handleLabelChange('lblRealCash',v)} />}</span> 
                <span className={isPreview?"text-black font-bold text-[14px]":"text-blue-800/80 font-bold"}>{isPreview ? parseTemplate(labels.lblRealCashVal, mockData) : <EditableSpan value={labels.lblRealCashVal} onChange={(v)=>handleLabelChange('lblRealCashVal',v)} />}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="font-bold italic opacity-80">{isPreview ? parseTemplate(labels.lblDiff, mockData) : <EditableSpan value={labels.lblDiff} onChange={(v)=>handleLabelChange('lblDiff',v)} />}</span> 
                <span className={isPreview?"text-black italic":"text-blue-800/80 italic"}>{isPreview ? parseTemplate(labels.lblDiffVal, mockData) : <EditableSpan value={labels.lblDiffVal} onChange={(v)=>handleLabelChange('lblDiffVal',v)} />}</span>
             </div>
           </div>
         )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center mt-6 pt-6 font-sans text-[12px] font-bold pb-10">
         <div>
            {isPreview ? parseTemplate(labels.lblSign1, mockData) : <EditableSpan value={labels.lblSign1} onChange={(v)=>handleLabelChange('lblSign1',v)} />}
            <div className="font-normal italic text-[10px] mt-1 opacity-70">(Ký, ghi rõ họ tên)</div>
         </div>
         <div>
            {isPreview ? parseTemplate(labels.lblSign2, mockData) : <EditableSpan value={labels.lblSign2} onChange={(v)=>handleLabelChange('lblSign2',v)} />}
            <div className="font-normal italic text-[10px] mt-1 opacity-70">(Ký, ghi rõ họ tên)</div>
         </div>
      </div>
    </>
  );

  const getTemplateLayout = (isPreview) => {
    if (activeTab === 'Hóa đơn' || activeTab === 'Trả hàng' || activeTab === 'Nhập hàng') {
       return renderInvoiceAndReturn(isPreview);
    } 
    return renderSimpleReceipt(isPreview);
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
