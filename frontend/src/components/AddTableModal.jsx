import React, { useState } from "react";

function AddTableModal({ isOpen, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    note: "",
    area: "Tầng trệt",
    status: "Trống",
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave({ ...formData, id: Date.now() });
    setFormData({
      name: "",
      note: "",
      area: "Tầng trệt",
      status: "Trống",
    });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData({
      name: "",
      note: "",
      area: "Tầng trệt",
      status: "Trống",
    });
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-6 bg-gray-50/50 rounded-t-lg">
          <h2 className="text-xl font-extrabold text-[#5D5FEF]">Thêm bàn mới</h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên bàn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 transition-all font-medium"
              placeholder="Ví dụ: Bàn 4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 transition-all resize-none"
              rows="3"
              placeholder="Loại bàn, vị trí chi tiết..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Khu vực
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 transition-all cursor-pointer bg-white"
            >
              <option>Tầng trệt</option>
              <option>Lầu 1</option>
              <option>Lầu 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 transition-all cursor-pointer bg-white"
            >
              <option>Trống</option>
              <option>Đang chơi</option>
              <option>Bảo trì</option>
              <option>Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end items-center bg-gray-50/50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer shadow-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                formData.name.trim() 
                  ? "bg-[#5D5FEF] hover:bg-[#4b4ce6] text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thay mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTableModal;
