import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function AddTableModal({ isOpen, onSave, onCancel, tables }) {
  const [formData, setFormData] = useState({
    MABAN: "",
    TENBAN: "",
    KHUVUC: "",
    MAHANGHOA: "",
    GHICHU: "",
    TRANGTHAI: "Hoạt động",
  });

  const [serviceProducts, setServiceProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      // eslint-disable-next-line react-hooks/exhaustive-deps

      let nextCode = "B001";

      if (tables && tables.length > 0) {
        const numericParts = tables
          .map((t) => parseInt(t.MABAN.replace("B", "")))
          .filter((n) => !isNaN(n));

        if (numericParts.length > 0) {
          const maxNum = Math.max(...numericParts);
          nextCode = "B" + (maxNum + 1).toString().padStart(3, "0");
        }
      }

      setFormData((prev) => ({
        ...prev,
        MABAN: nextCode,
        TENBAN: "",
        MAHANGHOA: "",
        GHICHU: "",
        KHUVUC: "",
        TRANGTHAI: "Hoạt động",
      }));
    }
  }, [isOpen, tables]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const filteredServices = data.filter(
        (item) =>
          item.NHOMHANG?.toUpperCase() === "LOẠI BÀN" ||
          item.TENDANHMUC?.toUpperCase() === "LOẠI BÀN",
      );

      setServiceProducts(filteredServices);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách loại bàn:", err);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.TENBAN.trim() || !formData.MAHANGHOA) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ Tên bàn, Loại bàn.",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-6 bg-gray-50/50 rounded-t-lg">
          <h2 className="text-xl font-extrabold text-[#5D5FEF]">
            Thêm bàn mới
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mã bàn
            </label>
            <input
              type="text"
              value={formData.MABAN}
              readOnly
              className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-500 outline-none cursor-not-allowed"
            />
          </div>

          {/* 2. Tên bàn */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên bàn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="TENBAN"
              value={formData.TENBAN}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 outline-none font-medium"
            />
          </div>

          {/* 3. Loại bàn */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Loại bàn (giá giờ) <span className="text-red-500">*</span>
            </label>
            <select
              name="MAHANGHOA"
              value={formData.MAHANGHOA}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#5D5FEF] outline-none cursor-pointer bg-white font-medium"
            >
              <option value="">-- Chọn loại bàn --</option>
              {serviceProducts.map((p) => (
                /* Sửa thành p.MAHANGHOA và p.TENHANGHOA */
                <option key={p.MAHANGHOA} value={p.MAHANGHOA}>
                  {p.TENHANGHOA} ({Number(p.DONGIABAN).toLocaleString()}đ/h)
                </option>
              ))}
            </select>
          </div>

          {/* 4. Ghi chú */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              name="GHICHU"
              value={formData.GHICHU}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#5D5FEF] resize-none outline-none"
              rows="2"
            />
          </div>

          {/* 5. Khu vực */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Khu vực
              </label>
              <input
                type="text"
                name="KHUVUC"
                placeholder="VD: Lầu 1"
                value={formData.KHUVUC}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#5D5FEF] focus:ring-1 focus:ring-[#5D5FEF]/30 outline-none font-medium"
              />
            </div>

            {/* 6. Trạng thái */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="TRANGTHAI"
                value={formData.TRANGTHAI}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white font-medium outline-none cursor-pointer"
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          {/* Nút bấm */}
          <div className="border-t border-gray-200 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-[#5D5FEF] hover:bg-[#4b4ce6] text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md flex items-center gap-2"
            >
              Thêm bàn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTableModal;
