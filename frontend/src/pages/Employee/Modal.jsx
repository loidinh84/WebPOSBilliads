import React, { useState, useEffect } from "react";
import * as Icons from "../../assets/icons/index";

/**
 * EmployeeModal - Modal trung tâm cho tất cả các hành động quản lý nhân viên.
 * @param {boolean} isOpen - Trạng thái hiển thị của modal
 * @param {function} onClose - Hàm gọi khi đóng modal
 * @param {string} type - Loại modal ('EDIT', 'APPROVE_REQUESTS', 'IMPORT', 'EXPORT', 'VIEW_BY_SHIFT', 'APPROVE_ATTENDANCE', 'SALARY', 'VIEW_BY_EMPLOYEE')
 * @param {object} data - Dữ liệu ban đầu cho modal (ví dụ: đối tượng nhân viên)
 */
const EmployeeModal = ({ isOpen, onClose, type, data }) => {
  const [modalType, setModalType] = useState(type);

  useEffect(() => {
    setModalType(type);
  }, [type]);

  if (!isOpen) return null;

  // Logic hiển thị tiêu đề header dựa trên loại modal
  const getHeaderTitle = () => {
    switch (modalType) {
      case "EDIT": return "Chỉnh sửa nhân viên";
      case "APPROVE_REQUESTS": return "Duyệt yêu cầu nhân viên";
      case "VIEW_BY_EMPLOYEE": return `Chi tiết nhân viên: ${data?.name || ""}`;
      case "IMPORT": return "Import danh sách nhân viên";
      case "EXPORT": return "Xuất file dữ liệu";
      case "VIEW_BY_SHIFT": return "Xem theo ca làm việc";
      case "APPROVE_ATTENDANCE": return "Duyệt chấm công";
      case "SALARY": return "Bảng tính lương chi tiết";
      default: return "Thông tin nhân viên";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ (Backdrop) */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Khung chứa Modal (Modal Container) */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Phần đầu Modal (Header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">{getHeaderTitle()}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Thân Modal (Content Body) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {renderModalContent(modalType, data, onClose)}
        </div>

        {/* Phần chân Modal chung (Generic Footer) */}
        {modalType !== "SALARY" && modalType !== "VIEW_BY_SHIFT" && (
           <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
              >
                Đóng
              </button>
              {(modalType === "EDIT" || modalType === "IMPORT" || modalType === "APPROVE_ATTENDANCE") && (
                <button className="px-6 py-2.5 rounded-lg bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-md active:scale-95">
                  Lưu thay đổi
                </button>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hàm hỗ trợ render nội dung cụ thể dựa trên chế độ (mode)
 */
const renderModalContent = (type, data, onClose) => {
  switch (type) {
    case "EDIT":
      return <EditEmployeeForm data={data} />;
    case "APPROVE_REQUESTS":
      return <ApproveRequestsContent />;
    case "IMPORT":
      return <ImportDataContent />;
    case "EXPORT":
      return <ExportDataContent />;
    case "VIEW_BY_SHIFT":
      return <ViewByShiftContent />;
    case "APPROVE_ATTENDANCE":
      return <ApproveAttendanceContent />;
    case "SALARY":
      return <SalarySheetContent />;
    case "VIEW_BY_EMPLOYEE":
      return <ViewByEmployeeContent data={data} />;
    default:
      return <div className="p-10 text-center text-gray-400">Đang cập nhật tính năng...</div>;
  }
};

/* --- CÁC THÀNH PHẦN CON TRONG MODAL --- */

/**
 * Biểu mẫu chỉnh sửa thông tin nhân viên
 */
const EditEmployeeForm = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Phần tải ảnh đại diện */}
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
        <img src={Icons.Person} className="w-12 h-12 opacity-20" alt="avatar" />
        <span className="text-[12px] mt-2">Tải ảnh lên</span>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
      <p className="text-[13px] text-gray-500 text-center">Định dạng JPG, PNG. <br/> Tối đa 2MB.</p>
    </div>
    
    {/* Các trường nhập liệu thông tin */}
    <div className="space-y-4">
      {[
        { label: "Mã nhân viên", value: data?.staffId || "NV001", disabled: true },
        { label: "Họ và tên", value: data?.name || "", placeholder: "Nhập họ tên" },
        { label: "Số điện thoại", value: data?.phone || "", placeholder: "Nhập số điện thoại" },
        { label: "Số CMND/CCCD", value: data?.idCard || "", placeholder: "Nhập số định danh" },
        { label: "Mã chấm công", value: data?.checkInId || "", placeholder: "Nhập mã chấm công" },
      ].map((field, idx) => (
        <div key={idx}>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">{field.label}</label>
          <input 
            type="text" 
            defaultValue={field.value}
            disabled={field.disabled}
            placeholder={field.placeholder}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/10 transition-all disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Nội dung giao diện Duyệt yêu cầu (nghỉ phép, tăng ca...)
 */
const ApproveRequestsContent = () => (
  <div className="space-y-4">
    {/* Mục yêu cầu 1 */}
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#5D5FEF] transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#5D5FEF]">
          <img src={Icons.Person} className="w-5 h-5 grayscale opacity-50" alt="user" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">Trần Thanh Khang</h4>
          <p className="text-[12px] text-gray-500">Gửi yêu cầu nghỉ phép: 05/04/2026</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-1.5 rounded-lg text-red-500 bg-red-50 text-[13px] font-bold hover:bg-red-100 transition-all">Từ chối</button>
        <button className="px-4 py-1.5 rounded-lg text-white bg-[#5D5FEF] text-[13px] font-bold hover:bg-[#4B4DDB] transition-all">Duyệt</button>
      </div>
    </div>
    
    {/* Mục yêu cầu 2 */}
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#5D5FEF] transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <img src={Icons.Person} className="w-5 h-5 grayscale opacity-50" alt="user" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">Nguyễn Văn An</h4>
          <p className="text-[12px] text-gray-500">Gửi yêu cầu tăng ca: 03/04/2026 (2 giờ)</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-1.5 rounded-lg text-red-500 bg-red-50 text-[13px] font-bold hover:bg-red-100 transition-all">Từ chối</button>
        <button className="px-4 py-1.5 rounded-lg text-white bg-[#5D5FEF] text-[13px] font-bold hover:bg-[#4B4DDB] transition-all">Duyệt</button>
      </div>
    </div>
  </div>
);

/**
 * Giao diện Import dữ liệu từ file Excel
 */
const ImportDataContent = () => (
  <div className="flex flex-col items-center justify-center py-10 px-4">
    {/* Vùng kéo thả file */}
    <div className="w-full max-w-lg p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-white hover:border-[#5D5FEF]/50 transition-all text-center group cursor-pointer">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <img src={Icons.insertPage} className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" alt="upload" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Click để tải lên tệp excel</h3>
      <p className="text-gray-500 text-[14px]">Hoặc kéo và thả tệp vào đây</p>
    </div>
    
    {/* Phần tải file mẫu */}
    <div className="mt-8 flex items-center gap-4 text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
      <img src={Icons.SaveFile} className="w-6 h-6 grayscale opacity-40" alt="download" />
      <div className="text-left">
        <p className="text-[14px] font-bold text-blue-900">Chưa có tệp mẫu?</p>
        <p className="text-[12px] text-blue-700/70">Tải xuống tệp mẫu .xlsx để bắt đầu nhập liệu nhanh chóng</p>
      </div>
      <button className="ml-auto text-[#5D5FEF] font-bold text-[14px] hover:underline underline-offset-4">Tải mẫu</button>
    </div>
  </div>
);

/**
 * Giao diện cấu hình Xuất file báo cáo
 */
const ExportDataContent = () => (
  <div className="space-y-6">
    {/* Chọn loại dữ liệu */}
    <div>
      <h4 className="text-[15px] font-bold text-gray-800 mb-4">Loại dữ liệu muốn xuất</h4>
      <div className="grid grid-cols-2 gap-4">
        {["Danh sách nhân viên", "Bảng chấm công", "Bảng tính lương", "Lịch làm việc"].map((item, idx) => (
          <label key={idx} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#5D5FEF] transition-all group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]" />
            <span className="text-[14px] font-medium text-gray-700 group-hover:text-[#5D5FEF]">{item}</span>
          </label>
        ))}
      </div>
    </div>
    
    {/* Chọn định dạng file */}
    <div>
      <h4 className="text-[15px] font-bold text-gray-800 mb-4">Định dạng file</h4>
      <div className="flex gap-4">
        {["Excel (.xlsx)", "PDF (.pdf)"].map((format, idx) => (
          <label key={idx} className="flex-1 flex items-center justify-center gap-3 p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#5D5FEF] transition-all">
            <input type="radio" name="format" className="w-5 h-5 text-[#5D5FEF]" defaultChecked={idx === 0} />
            <span className="text-[14px] font-bold text-gray-700">{format}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Chế độ xem danh sách nhân viên theo ca làm việc
 */
const ViewByShiftContent = () => (
   <div className="space-y-6">
     {/* Bộ lọc chọn ca */}
     <div className="flex gap-4 items-center mb-2">
       <button className="flex-1 py-2 bg-[#5D5FEF] text-white rounded-lg font-bold text-[14px] shadow-sm shadow-[#5D5FEF]/20">Ca sáng (06:00 - 14:00)</button>
       <button className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold text-[14px] hover:bg-gray-50">Ca chiều (14:00 - 22:00)</button>
       <button className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold text-[14px] hover:bg-gray-50">Ca tối (22:00 - 06:00)</button>
     </div>
     
     {/* Danh sách nhân viên trong ca */}
     <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
       <div className="grid grid-cols-3 bg-gray-50 p-4 border-b border-gray-100 text-[13px] font-bold text-gray-600">
         <span>Mã nhân viên</span>
         <span>Tên nhân viên</span>
         <span>Vai trò</span>
       </div>
       <div className="p-4 space-y-4">
         {[
           { id: "NV001", name: "Trần Thanh Khang", role: "Quản lý" },
           { id: "NV005", name: "Nguyễn Thị Mai", role: "PV Bàn" },
           { id: "NV012", name: "Lê Văn Tám", role: "Bảo vệ" },
         ].map((staff, idx) => (
           <div key={idx} className="grid grid-cols-3 text-[14px] text-gray-700 items-center">
             <span className="font-medium text-gray-400">{staff.id}</span>
             <span className="font-bold">{staff.name}</span>
             <span className="text-[12px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full w-fit">{staff.role}</span>
           </div>
         ))}
       </div>
     </div>
   </div>
);

/**
 * Giao diện Duyệt chấm công chi tiết
 */
const ApproveAttendanceContent = () => (
  <div className="space-y-4">
    <p className="text-[14px] text-gray-500 mb-4 italic">Xác nhận các bản ghi chấm công có sai sót hoặc cần duyệt thủ công.</p>
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-[12px] font-bold text-gray-600 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Nhân viên</th>
            <th className="px-6 py-4">Ngày</th>
            <th className="px-6 py-4">Vào/Ra</th>
            <th className="px-6 py-4 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {[
             { name: "Phạm Văn Đức", date: "31/03/2026", time: "08:15 - 17:05 (Muộn 15p)" },
             { name: "Hoàng Minh Thu", date: "31/03/2026", time: "07:55 - --:-- (Quên out)" },
          ].map((item, idx) => (
            <tr key={idx} className="text-[14px] text-gray-700 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-bold">{item.name}</td>
              <td className="px-6 py-4">{item.date}</td>
              <td className="px-6 py-4 text-gray-500">{item.time}</td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-3">
                  <button className="text-[12px] font-bold text-[#5D5FEF] hover:underline">Sửa</button>
                  <button className="text-[12px] font-bold text-green-600 hover:underline">Duyệt</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Giao diện chi tiết Bảng tính lương dự tính
 */
const SalarySheetContent = () => (
  <div className="space-y-6">
    {/* Thống kê nhanh */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-[#5D5FEF]/5 p-4 rounded-xl border border-[#5D5FEF]/10">
        <p className="text-[12px] text-gray-500 mb-1">Tổng lương chi trả</p>
        <p className="text-xl font-bold text-[#5D5FEF]">125.400.000đ</p>
      </div>
      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
        <p className="text-[12px] text-gray-500 mb-1">Đã chi trả</p>
        <p className="text-xl font-bold text-green-600">80.000.000đ</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <p className="text-[12px] text-gray-500 mb-1">Còn lại</p>
        <p className="text-xl font-bold text-orange-600">45.400.000đ</p>
      </div>
    </div>
    
    {/* Bảng chi tiết từng nhân viên */}
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h4 className="font-bold text-gray-800">Chi tiết bảng lương tháng 03/2026</h4>
        <button className="flex items-center gap-2 text-[13px] font-bold text-[#5D5FEF] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
           <img src={Icons.SaveFile} className="w-4 h-4" alt="calc" />
           Tính lại lương
        </button>
      </div>
      <div className="p-4 space-y-3">
        {[
          { name: "Trần Thanh Khang", base: "15,000,000", bonus: "2,500,000", fine: "0", total: "17,500,000" },
          { name: "Nguyễn Văn An", base: "12,000,000", bonus: "1,200,000", fine: "200,000", total: "13,000,000" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-white hover:shadow-md transition-all group">
            <div className="flex-1">
              <p className="font-bold text-gray-800 group-hover:text-[#5D5FEF] transition-colors">{item.name}</p>
              <div className="flex gap-4 mt-1">
                <span className="text-[12px] text-gray-500">Lương cứng: {item.base}</span>
                <span className="text-[12px] text-green-600">Thưởng: {item.bonus}</span>
                <span className="text-[12px] text-red-500">Phạt: {item.fine}</span>
              </div>
            </div>
            <p className="text-[15px] font-bold text-gray-900">{item.total}đ</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Giao diện xem Hồ sơ chi tiết của một nhân viên
 */
const ViewByEmployeeContent = ({ data }) => (
  <div className="space-y-6">
    {/* Thẻ thông tin cá nhân */}
    <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
        <img src={Icons.Person} className="w-12 h-12 opacity-20" alt="avatar" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{data?.name || "N/A"}</h3>
        <p className="text-[#5D5FEF] font-medium">{data?.staffId || "NV000"}</p>
        <div className="flex gap-4 mt-2">
           <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Đang làm việc
           </div>
           <div className="text-[13px] text-gray-400">Tham gia: 01/01/2026</div>
        </div>
      </div>
    </div>
    
    {/* Lưới thông tin chi tiết */}
    <div className="grid grid-cols-2 gap-4">
      {/* Cột 1: Thông tin liên hệ */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Thông tin liên hệ</h4>
        <div className="space-y-3">
           <div className="flex justify-between text-[14px]">
             <span className="text-gray-500">Điện thoại</span>
             <span className="font-bold text-gray-800">{data?.phone || "-"}</span>
           </div>
           <div className="flex justify-between text-[14px]">
             <span className="text-gray-500">Số CCCD</span>
             <span className="font-bold text-gray-800">{data?.idCard || "-"}</span>
           </div>
        </div>
      </div>
      
      {/* Cột 2: Thông tin công việc */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Công việc</h4>
        <div className="space-y-3">
           <div className="flex justify-between text-[14px]">
             <span className="text-gray-500">Bộ phận</span>
             <span className="font-bold text-gray-800">Dịch vụ</span>
           </div>
           <div className="flex justify-between text-[14px]">
             <span className="text-gray-500">Chức vụ</span>
             <span className="font-bold text-gray-800">Nhân viên bàn</span>
           </div>
        </div>
      </div>
    </div>
  </div>
)

export default EmployeeModal;
