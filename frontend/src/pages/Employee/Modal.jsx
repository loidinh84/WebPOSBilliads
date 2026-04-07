import React, { useState, useEffect } from "react";
import * as Icons from "../../assets/icons/index";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

/**
 * EmployeeModal - Modal trung tâm cho tất cả các hành động quản lý nhân viên.
 * @param {boolean} isOpen - Trạng thái hiển thị của modal
 * @param {function} onClose - Hàm gọi khi đóng modal
 * @param {string} type - Loại modal ('ADD', 'EDIT', 'APPROVE_REQUESTS', 'IMPORT', 'EXPORT', 'VIEW_BY_SHIFT', 'APPROVE_ATTENDANCE', 'SALARY', 'VIEW_BY_EMPLOYEE')
 * @param {object} data - Dữ liệu ban đầu cho modal (ví dụ: đối tượng nhân viên)
 */
const EmployeeModal = ({
  isOpen,
  onClose,
  type,
  data,
  onAddEmployee,
  onUpdateEmployee,
  requests,
  onApproveRequest,
  onRejectRequest,
  onSave,
  onSaveSuccess,
}) => {
  const [modalType, setModalType] = useState(type);

  useEffect(() => {
    setModalType(type);
  }, [type]);



  if (!isOpen) return null;

  // Logic hiển thị tiêu đề header dựa trên loại modal
  const getHeaderTitle = () => {
    switch (modalType) {
      case "ADD":
        return "Thêm nhân viên mới";
      case "EDIT":
        return `Chỉnh sửa: ${data?.name || "Nhân viên"}`;
      case "APPROVE_REQUESTS":
        return "Duyệt yêu cầu nhân viên";
      case "VIEW_BY_EMPLOYEE":
        return `Hồ sơ: ${data?.name || ""}`;
      case "VIEW_BY_SHIFT":
        return "Xem theo ca làm việc";
      case "APPROVE_ATTENDANCE":
        return "Duyệt chấm công";
      case "SALARY":
        return "Bảng tính lương chi tiết";
      case "MANUAL_ATTENDANCE":
        return "Chấm công thủ công";
      case "EDIT_SHIFT":
        return `Sửa lịch làm: ${data?.name || ""}`;
      case "EDIT_SALARY":
        return `Cập nhật lương: ${data?.name || ""}`;
      default:
        return "Thông tin nhân viên";
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Phần đầu Modal (Header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {getHeaderTitle()}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Thân Modal (Content Body) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {renderModalContent(
            modalType,
            data,
            onClose,
            onAddEmployee,
            onUpdateEmployee,
            setModalType,
            requests,
            onApproveRequest,
            onRejectRequest,
            onSave,
            onSaveSuccess
          )}
        </div>

        {/* Footer chung - Chỉ hiện cho các loại không tự quản lý nút */}
        {modalType !== "SALARY" &&
          modalType !== "VIEW_BY_SHIFT" &&
          modalType !== "MANUAL_ATTENDANCE" &&
          modalType !== "ADD" &&
          modalType !== "EDIT_SHIFT" &&
          modalType !== "EDIT_SALARY" &&
          modalType !== "EDIT" && (
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
              >
                Đóng
              </button>
              {/* Nút Chỉnh sửa - chỉ hiện khi đang xem hồ sơ */}
              {modalType === "VIEW_BY_EMPLOYEE" && (
                <button
                  onClick={() => setModalType("EDIT")}
                  className="px-6 py-2.5 rounded-lg bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-md active:scale-95"
                >
                  Chỉnh sửa
                </button>
              )}
              {modalType === "APPROVE_ATTENDANCE" && (
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
const renderModalContent = (
  type,
  data,
  onClose,
  onAddEmployee,
  onUpdateEmployee,
  setModalType,
  requests,
  onApproveRequest,
  onRejectRequest,
  onSave,
  onSaveSuccess
) => {
  switch (type) {
    case "ADD":
      return <AddEmployeeForm onAdd={onAddEmployee} onClose={onClose} />;
    case "EDIT":
      return (
        <EditEmployeeForm
          data={data}
          onSave={onUpdateEmployee}
          onClose={onClose}
          onBack={() => setModalType("VIEW_BY_EMPLOYEE")}
        />
      );
    case "APPROVE_REQUESTS":
      return (
        <ApproveRequestsContent
          requests={requests}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
        />
      );

    case "VIEW_BY_SHIFT":
      return <ViewByShiftContent onRefresh={onSaveSuccess} />;
    case "APPROVE_ATTENDANCE":
      return <ApproveAttendanceContent onRefresh={onSaveSuccess} />;
    case "MANUAL_ATTENDANCE":
      return <ManualAttendanceContent data={data} onRefresh={onSaveSuccess} onClose={onClose} />;
    case "SALARY":
      return (
        <SalarySheetContent
          data={data}
          onClose={onClose}
          onSaveSuccess={onSaveSuccess}
        />
      );
    case "VIEW_BY_EMPLOYEE":
      return <ViewByEmployeeContent data={data} />;
    case "EDIT_SHIFT":
      return <EditShiftContent data={data} onSave={onSave} onClose={onClose} />;
    case "EDIT_SALARY":
      return <EditSalaryContent data={data} onSave={onSave} onClose={onClose} />;
    default:
      return (
        <div className="p-10 text-center text-gray-400">
          Đang cập nhật tính năng...
        </div>
      );
  }
};

/* --- CÁC THÀNH PHẦN CON TRONG MODAL --- */

/**
 * Biểu mẫu THÊM MỚI nhân viên - có state và submit handler
 */
const AddEmployeeForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
    dob: "",
    idCard: "",
    role: "",
  });
  const [errors, setErrors] = useState({});

  // Cập nhật giá trị trường nhập liệu
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi gõ
  };

  // Xác thực và gọi callback thêm nhân viên
  const handleSubmit = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!form.idCard.trim()) newErrors.idCard = "Vui lòng nhập số CMND/CCCD";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Gọi callback để thêm vào danh sách
    if (onAdd) onAdd(form);
    if (onClose) onClose();
  };

  const fields = [
    { label: "Họ và tên", name: "name", placeholder: "Nhập họ và tên" },
    { label: "Số điện thoại", name: "phone", placeholder: "Nhập số điện thoại" },
    { label: "Email", name: "email", placeholder: "Nhập email" },
    { label: "Địa chỉ", name: "address", placeholder: "Nhập địa chỉ" },
    { label: "Số CMND/CCCD", name: "idCard", placeholder: "Nhập số định danh" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phần tải ảnh đại diện */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-[#5D5FEF]/40 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group hover:border-[#5D5FEF] transition-all">
            <span className="text-4xl mb-1">+</span>
            <span className="text-[12px]">Tải ảnh lên</span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-[13px] text-gray-500 text-center">
            Định dạng JPG, PNG. <br /> Tối đa 2MB.
          </p>
        </div>

        {/* Các trường nhập liệu */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                {field.label} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`w-full bg-white border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:ring-2 transition-all ${
                  errors[field.name]
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#5D5FEF] focus:ring-[#5D5FEF]/10"
                }`}
              />
              {errors[field.name] && (
                <p className="text-red-400 text-[12px] mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Chức vụ
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/10 transition-all text-gray-600"
            >
              <option value="">-- Chọn chức vụ --</option>
              <option value="Admin">Admin</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Nhà bếp">Nhà bếp</option>
              <option value="Thu ngân">Thu ngân</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 transition-all">
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Ngày sinh</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer nút bấm của form ADD */}
      <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
        >
          Đóng
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-lg bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-md active:scale-95"
        >
          Thêm nhân viên
        </button>
      </div>
    </div>
  );
};

/**
 * Biểu mẫu chỉnh sửa thông tin nhân viên - có state và submit handler
 */
const EditEmployeeForm = ({ data, onSave, onClose, onBack }) => {
  const [form, setForm] = useState({
    name: data?.name || data?.TENNGUOIDUNG || "",
    phone: data?.phone || data?.SDT || "",
    email: data?.email || data?.EMAIL || "",
    address: data?.address || data?.DIACHI || "",
    gender: data?.gender || data?.GIOITINH || "",
    dob: data?.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
    idCard: data?.idCard || data?.CCCD || "",
    checkInId: data?.checkInId || data?.MACCH || "",
    role: data?.role || data?.CHUCVU || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Gọi callback lưu với dữ liệu mới + giữ nguyên các field không đổi
    if (onSave) onSave({ ...data, ...form });
    if (onClose) onClose();
  };

  const fields = [
    { label: "Họ và tên", name: "name", placeholder: "Nhập họ và tên" },
    { label: "Số điện thoại", name: "phone", placeholder: "Nhập số điện thoại" },
    { label: "Email", name: "email", placeholder: "Nhập email" },
    { label: "Địa chỉ", name: "address", placeholder: "Nhập địa chỉ" },
    { label: "Số CMND/CCCD", name: "idCard", placeholder: "Nhập số định danh" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ảnh đại diện */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group hover:border-[#5D5FEF] transition-all">
            <img
              src={Icons.Person}
              className="w-12 h-12 opacity-20"
              alt="avatar"
            />
            <span className="text-[12px] mt-2">Tải ảnh lên</span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-center">
            <p className="text-[13px] text-gray-500">
              Định dạng JPG, PNG. Tối đa 2MB.
            </p>
          </div>
        </div>

        {/* Các trường nhập liệu */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Mã nhân viên
              </label>
              <input
                type="text"
                value={data?.staffId || data?.MANVIEN}
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none text-gray-500 cursor-not-allowed font-mono"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Mã chấm công
              </label>
              <input
                type="text"
                value={form.checkInId}
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none text-gray-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                {field.label} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`w-full bg-white border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:ring-2 transition-all ${
                  errors[field.name]
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#5D5FEF] focus:ring-[#5D5FEF]/10"
                }`}
              />
              {errors[field.name] && (
                <p className="text-red-400 text-[12px] mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Chức vụ
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/10 transition-all text-gray-600"
            >
              <option value="">-- Chọn chức vụ --</option>
              <option value="Admin">Admin</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Nhà bếp">Nhà bếp</option>
              <option value="Thu ngân">Thu ngân</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 transition-all">
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Ngày sinh</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#5D5FEF] focus:ring-2 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer nút bấm của form EDIT */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-[13px] text-gray-500 hover:text-[#5D5FEF] font-medium transition-colors flex items-center gap-1"
        >
          ← Quay lại hồ sơ
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-lg bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-md active:scale-95"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

/**
 * Nội dung giao diện Duyệt yêu cầu (nghỉ phép, tăng ca...)
 */
const ApproveRequestsContent = ({ requests = [], onApprove, onReject }) => (
  <div className="space-y-4">
    {/* Hiển thị trạng thái trống nếu không có yêu cầu nào */}
    {requests.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
          <img src={Icons.Person} className="w-8 h-8 opacity-20" alt="empty" />
        </div>
        <p className="text-[14px] font-medium">
          Không có yêu cầu nào đang chờ duyệt.
        </p>
      </div>
    ) : (
      requests.map((req) => (
        <div
          key={req.id}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#5D5FEF] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <img
                src={Icons.Person}
                className="w-5 h-5 grayscale opacity-50"
                alt="user"
              />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{req.name}</h4>
              <p className="text-[12px] text-gray-500">{req.reason}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onReject && onReject(req.id)}
              className="px-4 py-1.5 rounded-lg text-red-500 bg-red-50 text-[13px] font-bold hover:bg-red-100 transition-all active:scale-95"
            >
              Từ chối
            </button>
            <button
              onClick={() => onApprove && onApprove(req.id)}
              className="px-4 py-1.5 rounded-lg text-white bg-[#5D5FEF] text-[13px] font-bold hover:bg-[#4B4DDB] transition-all active:scale-95"
            >
              Duyệt
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

/**
 * Giao diện Import dữ liệu từ file Excel
 */
const ImportDataContent = ({ onImportExcel, onDownloadTemplate, isImporting }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4">
    {/* Vùng kéo thả file */}
    <div 
      onClick={() => !isImporting && document.getElementById("excel-upload")?.click()}
      className={`w-full max-w-lg p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-white hover:border-[#5D5FEF]/50 transition-all text-center group cursor-pointer ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <img
          src={Icons.insertPage}
          className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity"
          alt="upload"
        />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        {isImporting ? "Đang xử lý dữ liệu..." : "Click để tải lên tệp excel"}
      </h3>
      <p className="text-gray-500 text-[14px]">Hoặc kéo và thả tệp vào đây</p>
    </div>

    {/* Phần tải file mẫu */}
    <div className="mt-8 flex items-center gap-4 text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100 w-full max-w-lg">
      <img
        src={Icons.SaveFile}
        className="w-6 h-6 grayscale opacity-40"
        alt="download"
      />
      <div className="text-left flex-1">
        <p className="text-[14px] font-bold text-blue-900">Chưa có tệp mẫu?</p>
        <p className="text-[12px] text-blue-700/70">
          Tải xuống tệp mẫu .xlsx để bắt đầu nhập liệu nhanh chóng
        </p>
      </div>
      <button 
        onClick={onDownloadTemplate}
        className="text-[#5D5FEF] font-bold text-[14px] hover:underline underline-offset-4"
      >
        Tải mẫu
      </button>
    </div>
  </div>
);

/**
 * Giao diện cấu hình Xuất file báo cáo
 */
const ExportDataContent = ({ onExport, format, setFormat }) => (
  <div className="space-y-6">
    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
        <img src={Icons.SaveFile} className="w-6 h-6 text-blue-600" alt="export" />
      </div>
      <div>
        <h4 className="text-[16px] font-bold text-blue-900">Sẵn sàng xuất lịch làm việc</h4>
        <p className="text-[13px] text-blue-700/70">Tất cả dữ liệu lịch làm việc trong tuần sẽ được đóng gói vào file {format.toUpperCase()}.</p>
      </div>
      <button 
        onClick={onExport}
        className="ml-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-[13px] hover:bg-blue-700 transition-all shadow-md active:scale-95"
      >
        Tải xuống ngay
      </button>
    </div>

    {/* Chọn loại dữ liệu (Placeholder UI) */}
    <div>
      <h4 className="text-[15px] font-bold text-gray-800 mb-4">
        Định dạng file
      </h4>
      <div className="flex gap-4">
        {["xlsx", "pdf"].map((f, idx) => (
          <label
            key={idx}
            className={`flex-1 flex items-center justify-center gap-3 p-4 bg-white border rounded-xl cursor-pointer transition-all ${
              format === f ? "border-[#5D5FEF] ring-2 ring-[#5D5FEF]/5" : "border-gray-100"
            }`}
          >
            <input
              type="radio"
              name="format"
              className="w-5 h-5 text-[#5D5FEF]"
              checked={format === f}
              onChange={() => setFormat(f)}
            />
            <span className="text-[14px] font-bold text-gray-700 uppercase">
              {f === "xlsx" ? "Excel (.xlsx)" : "PDF (.pdf)"}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Chế độ xem danh sách nhân viên theo ca làm việc (Kết nối Backend)
 */
const ViewByShiftContent = () => {
  const [activeShift, setActiveShift] = useState({ label: "Ca sáng" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const shifts = [
    { label: "Ca sáng", range: [4, 12] },
    { label: "Ca chiều", range: [12, 18] },
    { label: "Ca tối", range: [18, 28] }, // 28 để bao phủ qua đêm
    { label: "Full-day", range: [0, 24] },
  ];

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    console.log(`[DEBUG] Fetching for DATE: ${selectedDate}`);
    setAllSchedules([]); // Clear cũ để đảm bảo không bị cache
    try {
      const response = await axios.get(`http://localhost:5000/api/schedule/by-shift`, {
        params: { date: selectedDate }
      });
      console.log(`[DEBUG] Data received:`, response.data.length, "rows");
      setAllSchedules(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách ca:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSchedules = () => {
    if (activeShift.label === "Full-day") return allSchedules;
    
    const currentShift = shifts.find(s => s.label === activeShift.label);
    if (!currentShift) return [];

    return allSchedules.filter(s => {
      if (!s.startTime) return false;
      const startHour = parseInt(s.startTime.split(":")[0]);
      // Nếu giờ bắt đầu nằm trong khoảng của ca đó
      return startHour >= currentShift.range[0] && startHour < currentShift.range[1];
    });
  };

  const filteredEmployees = getFilteredSchedules();

  return (
    <div className="space-y-6">
      {/* Bộ lọc Ngày và Ca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/50 rounded-lg">
              <img src={Icons.Calendar} className="w-5 h-5 text-[#5D5FEF]" alt="calendar" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Ngày xem ca</p>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-[15px] font-bold text-gray-800 outline-none bg-transparent cursor-pointer hover:text-[#5D5FEF] transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-end">
            {shifts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveShift(s)}
                className={`px-5 py-2 rounded-xl font-bold text-[12px] whitespace-nowrap transition-all border ${
                  activeShift.label === s.label
                    ? "bg-[#5D5FEF] text-white border-[#5D5FEF] shadow-lg shadow-[#5D5FEF]/20"
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách nhân viên trong ca */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[100px_1fr_120px_100px] bg-gray-50/50 p-4 border-b border-gray-100 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Mã NV</span>
          <span>Tên nhân viên</span>
          <span>Vai trò</span>
          <span className="text-right">Giờ làm</span>
        </div>
        
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <div className="w-10 h-10 border-4 border-[#5D5FEF]/20 border-t-[#5D5FEF] rounded-full animate-spin mb-4"></div>
              <p className="text-[13px] font-medium">Đang tìm kiếm nhân viên...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredEmployees.map((staff, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[100px_1fr_120px_100px] p-4 text-[14px] text-gray-700 items-center hover:bg-[#5D5FEF]/5 transition-colors border-l-4 border-transparent hover:border-[#5D5FEF]"
                >
                  <span className="font-mono text-gray-400 text-[13px]">{staff.id}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{staff.name}</span>
                    <span className="text-[11px] text-gray-400 md:hidden">{staff.startTime} - {staff.endTime}</span>
                  </div>
                  <span>
                    <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md uppercase border border-gray-200">
                      {staff.role}
                    </span>
                  </span>
                  <span className="text-right font-bold text-[#5D5FEF] text-[13px]">
                    {staff.startTime} - {staff.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 px-10 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <img src={Icons.Person} className="w-10 h-10 opacity-10" alt="no-data" />
              </div>
              <h3 className="text-[15px] font-bold text-gray-700 mb-2">Không tìm thấy ai trong ca này</h3>
              <p className="text-[13px] leading-relaxed max-w-[280px]">
                Hãy thử chọn ngày khác hoặc chuyển sang **"Full-day"** để xem tất cả nhân viên làm việc trong ngày {selectedDate}.
              </p>
              <button 
                onClick={() => setActiveShift({ label: "Full-day" })}
                className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-[#5D5FEF] hover:bg-blue-50 transition-all shadow-sm"
              >
                Xem tất cả trong ngày
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Giao diện Duyệt chấm công chi tiết
 */
const ApproveAttendanceContent = ({ onRefresh }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/attendance/pending");
      setRecords(response.data.map(r => ({ ...r, isEditing: false, isApproved: false })));
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chờ duyệt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    setRecords(records.map(r => r.id === id ? { ...r, isEditing: !r.isEditing } : r));
  };

  const handleApprove = async (id) => {
    try {
      await axios.post("http://localhost:5000/api/attendance/approve", { id });
      setRecords(records.map(r => r.id === id ? { ...r, isApproved: true, isEditing: false } : r));
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi khi duyệt:", error);
      alert("Không thể duyệt bản ghi này.");
    }
  };

  const handleChangeTime = (id, newTime) => {
    setRecords(records.map(r => r.id === id ? { ...r, time: newTime } : r));
  };

  const handleSaveEdit = async (record) => {
    try {
      // Split time string "HH:mm - HH:mm"
      const times = record.time.split("-").map(t => t.trim());
      await axios.post("http://localhost:5000/api/attendance/update", {
        MACHAMCONG: record.id,
        GIOVAO: times[0],
        GIORA: times[1] === "--:--" ? null : times[1],
        TRANGTHAI: "Đã duyệt"
      });
      setRecords(records.map(r => r.id === record.id ? { ...r, isApproved: true, isEditing: false } : r));
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Lỗi khi cập nhật giờ làm.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-gray-500 mb-4 italic">
        Xác nhận các bản ghi chấm công có sai sót hoặc cần duyệt thủ công.
      </p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[12px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-gray-100">Nhân viên</th>
              <th className="px-6 py-4 border-b border-gray-100">Ngày</th>
              <th className="px-6 py-4 border-b border-gray-100">Vào/Ra</th>
              <th className="px-6 py-4 border-b border-gray-100">Lý do</th>
              <th className="px-6 py-4 text-center border-b border-gray-100">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Không có bản ghi nào chờ duyệt.</td>
              </tr>
            ) : (
              records.map((item) => (
                <tr
                  key={item.id}
                  className={`text-[14px] transition-colors ${
                    item.isApproved ? "bg-green-50/30" : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      {item.isApproved && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      )}
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    {item.isEditing ? (
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => handleChangeTime(item.id, e.target.value)}
                        className="w-full bg-blue-50 border border-[#5D5FEF] rounded-md px-3 py-1.5 text-[13px] outline-none font-medium focus:ring-2 focus:ring-[#5D5FEF]/10"
                        autoFocus
                      />
                    ) : (
                      <span className={`${item.isApproved ? "text-green-700 font-medium" : "text-gray-500"}`}>
                        {item.time}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
                      {item.note}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      {item.isEditing ? (
                        <button 
                          onClick={() => handleSaveEdit(item)}
                          className="text-[12px] font-bold text-[#5D5FEF] underline"
                        >
                          Lưu
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEdit(item.id)}
                          className="text-[12px] font-bold text-gray-400 hover:text-[#5D5FEF]"
                        >
                          Sửa
                        </button>
                      )}
                      <button 
                        onClick={() => handleApprove(item.id)}
                        disabled={item.isApproved}
                        className={`text-[12px] font-bold transition-all px-3 py-1 rounded-md ${
                          item.isApproved 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {item.isApproved ? "Đã duyệt" : "Duyệt"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


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
        <h3 className="text-2xl font-bold text-gray-800">
          {data?.name || "N/A"}
        </h3>
        <p className="text-[#5D5FEF] font-medium">{data?.staffId || "NV000"}</p>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2 text-[13px]">
            {/* Chấm trạng thái: xanh = đang làm việc, đỏ = đang nghỉ */}
            <div
              className={`w-2 h-2 rounded-full ${
                data?.status === "off" ? "bg-red-500" : "bg-green-500"
              }`}
            ></div>
            <span
              className={
                data?.status === "off"
                  ? "text-red-500 font-medium"
                  : "text-gray-500"
              }
            >
              {data?.status === "off" ? "Đang nghỉ" : "Đang làm việc"}
            </span>
          </div>
          <div className="text-[13px] text-gray-400">Tham gia: 01/01/2026</div>
        </div>
      </div>
    </div>

    {/* Lưới thông tin chi tiết */}
    <div className="grid grid-cols-2 gap-4">
      {/* Cột 1: Thông tin liên hệ */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Thông tin liên hệ
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-500">Điện thoại</span>
            <span className="font-bold text-gray-800">
              {data?.phone || "-"}
            </span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-500">Số CCCD</span>
            <span className="font-bold text-gray-800">
              {data?.idCard || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Cột 2: Thông tin công việc */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Công việc
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-500">Bộ phận</span>
            <span className="font-bold text-gray-800">{data?.department || "Dịch vụ"}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-500">Chức vụ</span>
            <span className="font-bold text-gray-800">{data?.role || data?.CHUCVU || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Giao diện sửa Giờ làm việc (Ca làm)
 */
const EditShiftContent = ({ data, onSave, onClose }) => {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isOff, setIsOff] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const val = data?.value;
      const timeStr = typeof val === "object" && val !== null ? val?.time : val;
      const completed = typeof val === "object" && val !== null ? !!val?.isCompleted : false;

      setIsCompleted(completed);

      if (timeStr && typeof timeStr === "string" && timeStr !== "OFF" && timeStr.includes("-")) {
        const parts = timeStr.split("-").map(p => p.trim());
        if (parts.length === 2) {
          setStartTime(parts[0]);
          setEndTime(parts[1]);
          setIsOff(false);
          return;
        }
      }
      
      if (timeStr === "OFF") {
        setIsOff(true);
      } else {
        // Mặc định nếu không phân tích được
        setStartTime("08:00");
        setEndTime("17:00");
        setIsOff(false);
      }
    } catch (err) {
      console.error("Lỗi parse dữ liệu ca:", err);
      setIsOff(true);
    }
  }, [data]);

  const updateShift = (newStart, newEnd, off) => {
    const finalVal = off ? "OFF" : `${newStart} - ${newEnd}`;
    if (onSave) onSave(finalVal);
  };

  const handleToggleOff = () => {
    if (isCompleted) return;
    setIsOff(!isOff);
  };

  const handleQuickSelect = (start, end) => {
    if (isCompleted) return;
    setStartTime(start);
    setEndTime(end);
    setIsOff(false);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Thông báo trạng thái Hoàn thành */}
      {!!isCompleted && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl font-bold">
            ✓
          </div>
          <div>
            <p className="text-[14px] font-bold text-green-800">Ca làm việc đã hoàn thành</p>
            <p className="text-[12px] text-green-600 font-medium">Lịch sử chấm công đã được ghi nhận. Không thể thay đổi kế hoạch ban đầu.</p>
          </div>
        </div>
      )}

      <div className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between ${isCompleted ? "opacity-60" : ""}`}>
        <div>
          <p className="text-[14px] font-bold text-gray-800">Trạng thái nhân viên</p>
          <p className="text-[12px] text-gray-500">Chọn "Đang nghỉ" nếu không đi làm ngày này</p>
        </div>
        <button 
          onClick={handleToggleOff}
          disabled={!!isCompleted}
          className={`px-6 py-2 rounded-lg font-bold text-[13px] transition-all shadow-sm ${
            isOff ? "bg-red-50 text-red-500 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
          }`}
        >
          {isOff ? "Đang nghỉ (OFF)" : "Đang làm việc"}
        </button>
      </div>

      {!isOff && (
        <div className={`space-y-6 ${isCompleted ? "opacity-50 pointer-events-none" : ""}`}>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-4 uppercase tracking-wider">
              Thời gian làm việc cụ thể
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[12px] text-gray-400 font-medium tracking-tight">Bắt đầu</span>
                <input 
                  type="time"
                  value={startTime || "08:00"}
                  readOnly={!!isCompleted}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    setStartTime(val);
                    updateShift(val, endTime, false);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[16px] font-bold text-[#5D5FEF] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[12px] text-gray-400 font-medium tracking-tight">Kết thúc</span>
                <input 
                  type="time"
                  value={endTime || "17:00"}
                  readOnly={!!isCompleted}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    setEndTime(val);
                    updateShift(startTime, val, false);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[16px] font-bold text-[#5D5FEF] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-3">Chọn nhanh ca làm</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Ca Sáng", start: "08:00", end: "17:00" },
                { label: "Ca Chiều", start: "14:00", end: "22:00" },
                { label: "Ca Tối", start: "22:00", end: "06:00" },
                { label: "Full-day", start: "08:00", end: "22:00" },
              ].map((shift, idx) => (
                <button
                  key={idx}
                  disabled={!!isCompleted}
                  onClick={() => handleQuickSelect(shift.start, shift.end)}
                  className="px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-[#5D5FEF] rounded-lg text-[13px] font-medium text-gray-600 hover:text-[#5D5FEF] transition-all disabled:opacity-50"
                >
                  {shift.label} ({shift.start}-{shift.end})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          Đóng
        </button>
        {!isCompleted && (
          <button
            onClick={() => updateShift(startTime, endTime, isOff)}
            className="px-8 py-3 rounded-xl bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-lg active:scale-95"
          >
            Lưu thay đổi
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Giao diện sửa Lương dự kiến
 */
const EditSalaryContent = ({ data, onSave, onClose }) => {
  const [salary, setSalary] = useState(data?.value?.replace(/[^0-9]/g, "") || "");

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setSalary(val);
    // Format lại hiển thị khi gửi về
    const formatted = new Intl.NumberFormat("vi-VN").format(val || 0);
    if (onSave) onSave(formatted);
  };

  return (
    <div className="py-6 space-y-4">
      <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider">
        Lương dự kiến (VNĐ)
      </label>
      <div className="relative group">
        <input 
          type="text"
          value={salary}
          onChange={handleChange}
          placeholder="Nhập số tiền..."
          className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-xl font-bold text-[#5D5FEF] outline-none focus:border-[#5D5FEF] focus:ring-4 focus:ring-[#5D5FEF]/5 transition-all"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
          VNĐ
        </div>
      </div>
      <p className="text-[13px] text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
        Lưu ý: Đây là lương dự kiến tính theo lịch trình, chưa bao gồm thưởng/phạt thực tế.
      </p>
    </div>
  );
};

/**
 * Giao diện Chấm công thủ công (Manual Attendance)
 */
const ManualAttendanceContent = ({ data, onRefresh, onClose }) => {
  const [form, setForm] = useState({
    mnv: data?.staffId || "",
    name: data?.staffName || "",
    ngay: data?.date || "",
    vao: "08:00",
    ra: "17:00",
    note: ""
  });

  useEffect(() => {
    if (data) {
      setForm(prev => ({
        ...prev,
        mnv: data.staffId || "",
        name: data.staffName || "",
        ngay: data.date || ""
      }));

      if (data.dayData?.planned) {
        const parts = data.dayData.planned.split("-").map(p => p.trim());
        if (parts.length === 2) {
          setForm(prev => ({ ...prev, vao: parts[0], ra: parts[1] }));
        }
      }
    }
  }, [data]);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "--/--/----";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Ngày không hợp lệ" : d.toLocaleDateString("vi-VN");
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/attendance/update", {
        MANVIEN: form.mnv,
        NGAY: form.ngay,
        GIOVAO: form.vao,
        GIORA: form.ra,
        TRANGTHAI: "Đã duyệt",
        GHICHU: form.note || "Quản lý chấm công hộ"
      });
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (error) {
      console.error("Lỗi chấm công thủ công:", error);
      const msg = error.response?.data?.message || "Không thể lưu chấm công. Vui lòng thử lại.";
      alert(msg);
    }
  };

  return (
    <div className="py-4 space-y-6">
      <div className="p-4 bg-[#5D5FEF]/5 rounded-xl border border-[#5D5FEF]/10 flex justify-between items-center">
        <div>
          <p className="text-[12px] text-gray-500 font-bold uppercase">Nhân viên</p>
          <p className="text-[16px] font-bold text-gray-800">{form.name} ({form.mnv})</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-gray-500 font-bold uppercase">Ngày chấm công</p>
          <p className="text-[16px] font-bold text-[#5D5FEF]">{formatDateLabel(form.ngay)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-gray-700">Giờ vào</label>
          <input 
            type="time"
            value={form.vao}
            onChange={(e) => setForm({ ...form, vao: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[18px] font-bold text-[#5D5FEF] outline-none focus:ring-4 focus:ring-[#5D5FEF]/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-gray-700">Giờ ra</label>
          <input 
            type="time"
            value={form.ra}
            onChange={(e) => setForm({ ...form, ra: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[18px] font-bold text-[#5D5FEF] outline-none focus:ring-4 focus:ring-[#5D5FEF]/5 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-bold text-gray-700">Ghi chú</label>
        <textarea 
          placeholder="Lý do chấm công hộ (quên thẻ, máy lỗi...)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#5D5FEF] h-24 transition-all"
        />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
        >
          Hủy
        </button>
        <button 
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-lg bg-[#5D5FEF] text-white font-bold hover:bg-[#4B4DDB] transition-all shadow-lg active:scale-95"
        >
          Lưu chấm công
        </button>
      </div>
    </div>
  );
};

/**
 * Giao diện chi tiết Bảng lương & Thanh toán
 */
const SalarySheetContent = ({ data, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      // Cập nhật trạng thái 'Đã thanh toán'
      const updatedData = { 
        ...data, 
        TRANGTHAI: "Đã thanh toán",
        CONCANTRA: 0 
      };
      
      await axios.post("http://localhost:5000/api/salary/finalize", { payrolls: [updatedData] });
      
      Swal.fire({
        title: "Đã thanh toán!",
        text: `Đã xác nhận thanh toán lương cho ${data.TENNGUOIDUNG}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      if (onSaveSuccess) onSaveSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái thanh toán.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <div className="py-4 space-y-6">
      <div className="p-4 bg-[#5D5FEF]/5 rounded-xl border border-[#5D5FEF]/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[12px] text-gray-500 font-bold uppercase">Nhân viên</p>
            <p className="text-[18px] font-bold text-gray-800">{data.TENNGUOIDUNG}</p>
            <p className="text-[13px] text-gray-400 font-medium">Mã NV: {data.MANVIEN}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-500 font-bold uppercase">Kỳ trả lương</p>
            <p className="text-[18px] font-bold text-[#5D5FEF]">{data.KYTRALUONG}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[12px] text-gray-400 font-bold uppercase mb-1">Tổng giờ làm</p>
          <p className="text-[20px] font-extrabold text-[#5D5FEF]">{data.TONGGIOLAM}h</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[12px] text-gray-400 font-bold uppercase mb-1">Trạng thái</p>
          <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${data.TRANGTHAI === "Đã thanh toán" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {data.TRANGTHAI}
          </span>
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-[15px]">
          <span className="text-gray-500 font-medium">Tổng tiền lương:</span>
          <span className="font-bold text-gray-800 text-[18px]">{new Intl.NumberFormat("vi-VN").format(data.TONGLUONG)}đ</span>
        </div>
        <div className="flex justify-between items-center text-[15px] pt-4 border-t border-gray-100">
          <span className="text-gray-900 font-bold">Số tiền cần thanh toán:</span>
          <span className="font-extrabold text-red-600 text-[24px]">{new Intl.NumberFormat("vi-VN").format(data.CONCANTRA)}đ</span>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
        >
          Đóng
        </button>
        {data.TRANGTHAI !== "Đã thanh toán" && (
          <button 
            onClick={handlePay}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
