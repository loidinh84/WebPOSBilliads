import React, { useEffect, useState } from "react";
import * as Icons from "../assets/icons";

function EditTableModal({ isOpen, table, onSave, onCancel, onDelete }) {
  const [edits, setEdits] = useState({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [serviceProducts, setServiceProducts] = useState([]);
  const formData = table ? { ...table, ...edits } : {};

  useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:5000/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          // Lọc các mặt hàng thuộc nhóm Loại bàn
          const filtered = data.filter((item) => item.MADANHMUC === "DM8227");
          setServiceProducts(filtered);
        } catch (err) {
          console.error("Lỗi lấy loại bàn:", err);
        }
      };
      fetchServices();
    }
  }, [isOpen]);

  if (!isOpen || !table) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEdits((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
    setEdits({});
    setIsConfirmingDelete(false);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEdits({});
    setIsConfirmingDelete(false);
    onCancel();
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
    setEdits({});
    setIsConfirmingDelete(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {isConfirmingDelete ? (
          /* ==========================================
            GIAO DIỆN 1: BẢNG XÁC NHẬN XÓA
             ========================================== */
          <div className="p-8 text-center animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Xác nhận xóa bàn
            </h3>
            <p className="text-gray-600 mb-8">
              Bạn có chắc chắn muốn xóa bàn{" "}
              <span className="font-bold text-gray-900">
                {formData.TENBAN || "này"}
              </span>{" "}
              không?
              <br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsConfirmingDelete(false);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium transition-all"
              >
                Trở lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-all shadow-md"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================
            GIAO DIỆN 2: FORM CHỈNH SỬA (Mặc định)
             ========================================== */
          <>
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa bàn</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bàn
                </label>
                <input
                  type="text"
                  name="TENBAN"
                  value={formData.TENBAN || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  placeholder="Nhập tên bàn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bàn (Giá giờ)
                </label>
                <select
                  name="MAHANGHOA"
                  value={formData.MAHANGHOA || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 pr-10 cursor-pointer focus:ring-1 focus:ring-blue-200"
                >
                  <option value="">-- Chọn loại bàn --</option>
                  {serviceProducts.map((p) => (
                    <option key={p.MAHANGHOA} value={p.MAHANGHOA}>
                      {p.TENHANGHOA} ({Number(p.DONGIABAN).toLocaleString()}đ/h)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="GHICHU"
                  value={formData.GHICHU || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
                  rows="3"
                  placeholder="Nhập ghi chú"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khu vực
                </label>
                <input
                  name="KHUVUC"
                  value={formData.KHUVUC || ""}
                  onChange={handleInputChange}
                  placeholder="VD: Lầu 1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="TRANGTHAI"
                  value={formData.TRANGTHAI || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                >
                  <option>Trống</option>
                  <option>Đang chơi</option>
                  <option>Bảo trì</option>
                  <option>Ngừng hoạt động</option>
                </select>
                <p className="text-xs text-gray-500 mt-1 italic">
                  *Trạng thái bàn không thể thay đổi ở đây.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end items-center">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#10B981] hover:bg-green-700 text-white px-4 py-2 rounded font-medium text-sm transition-all shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditTableModal;
