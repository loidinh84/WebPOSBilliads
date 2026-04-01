import React, { useState, useEffect } from "react";
import * as Icons from "../../assets/icons/index";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import Swal from "sweetalert2";

function Product() {
  // =========================================================================
  // 1. STATE DỮ LIỆU (Mock data & DB)
  // =========================================================================
  const [categories, setCategories] = useState([{ id: "ALL", name: "Tất cả" }]);

  const [products, setProducts] = useState([]);

  // Tự động fetch dữ liệu từ Database khi load trang
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([{ MADANHMUC: "ALL", TENDANHMUC: "Tất cả" }, ...data]);
      }
    } catch (error) {
      console.error("Lỗi fetch danh mục:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((item) => ({
          ...item,
          GIABAN: item.DONGIABAN || 0,
          TONKHO: item.SOLUONGTONKHO || 0,
          NHOMHANG: item.NHOMHANG || "Khác",
        }));
        setProducts(mappedData);
      }
    } catch (error) {
      console.error("Chưa kết nối API, dùng dữ liệu mẫu", error);
    }
  };

  // =========================================================================
  // 2. STATE GIAO DIỆN & LỌC
  // =========================================================================
  const [expandedRows, setExpandedRows] = useState({});
  const [isTypeExpanded, setIsTypeExpanded] = useState(true);
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(true);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedInventory, setSelectedInventory] = useState("all");

  // =========================================================================
  // 3. STATE COMBO
  // =========================================================================
  const [isAddingCombo, setIsAddingCombo] = useState(false);
  const [selectedItemsForCombo, setSelectedItemsForCombo] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [comboName, setComboName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [comboPrice, setComboPrice] = useState("");

  // =========================================================================
  // 4. STATE MODAL THÊM/SỬA
  // =========================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    MAHANGHOA: "",
    TENHANGHOA: "",
    LOAIHANG: "",
    NHOMHANG: "ĐỒ ĂN",
    DINHMUCTON_DUOI: 0,
    DINHMUCTON_TREN: 999,
    GIABAN: "",
    GIANIEMYET: "",
    TONKHO: "",
    MOTA: "",
    HINHANH: null,
  });

  // =========================================================================
  // 5. CÁC HÀM XỬ LÝ LOGIC
  // =========================================================================

  const generateNextId = () => {
    if (products.length === 0) return "HH00001";
    const ids = products
      .map((p) => {
        const match = p.MAHANGHOA.match(/^HH(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((id) => id > 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;

    return `HH${String(maxId + 1).padStart(5, "0")}`;
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTypeFilterChange = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Tên nhóm hàng không được để trống!",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const newId = "DM" + Date.now().toString().slice(-4);

      const res = await fetch("http://localhost:5000/api/products/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          MADANHMUC: newId,
          TENDANHMUC: newCategoryName.trim().toUpperCase(),
        }),
      });

      if (res.ok) {
        setNewCategoryName("");
        setIsAddingCategory(false);
        fetchCategories();
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Đã thêm nhóm hàng mới!",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        const errData = await res.json();
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text:
            "Lỗi từ server: " +
            (errData.message || "Không thể thêm nhóm hàng."),
        });
      }
    } catch (err) {
      console.error("Lỗi thêm nhóm hàng:", err);
    }
  };

  const handleAddCategory = async () => {
    setIsAddingCategory(true);
    setNewCategoryName("");
  };

  const handleUpdateCategory = async (id, currentName) => {
    const { value: newName } = await Swal.fire({
      title: "Chỉnh sửa tên nhóm",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      inputValidator: (value) => {
        if (!value) return "Tên nhóm không được để trống!";
      },
    });

    if (newName && newName !== currentName) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/products/categories/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              TENDANHMUC: newName.trim().toUpperCase(),
              TRANGTHAI: 1,
            }),
          },
        );

        if (res.ok) {
          fetchCategories();
          Swal.fire("Thành công", "Đã cập nhật tên nhóm!", "success");
        }
      } catch (err) {
        console.error("Lỗi cập nhật:", err);
      }
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa nhóm hàng "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/products/categories/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Đã xóa!",
            text: data.message,
            timer: 1500,
            showConfirmButton: false,
          });
          fetchCategories();
        } else {
          Swal.fire({
            icon: "error",
            title: "Không thể xóa",
            text: data.message || "Có lỗi xảy ra khi xóa nhóm hàng.",
          });
        }
      } catch (err) {
        console.error("Lỗi xóa nhóm:", err);
        Swal.fire("Lỗi!", "Không thể kết nối đến máy chủ.", "error");
      }
    }
  };

  const openModal = (product = null, defaultType = "") => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });

      if (product.LOAIHANG === "Combo, gọi món") {
        const savedItems = {};
        if (product.DANHSACH_ID_MON && Array.isArray(product.DANHSACH_ID_MON)) {
          product?.DANHSACH_ID_MON?.forEach((id) => {
            savedItems[id] = true;
          });
        } else {
          console.warn("Sản phẩm này chưa có danh sách món gộp trong DB");
        }

        setSelectedItemsForCombo(savedItems);
      } else {
        setSelectedItemsForCombo({});
      }
    } else {
      setEditingProduct(null);
      setSelectedItemsForCombo({});
      setFormData({
        MAHANGHOA: generateNextId(),
        TENHANGHOA: "",
        LOAIHANG: defaultType,
        MADANHMUC: defaultType === "Dịch vụ" ? "DM002" : "DM001",
        NHOMHANG: defaultType === "Dịch vụ" ? "Khác" : "ĐỒ UỐNG",
        DONVITINH: defaultType === "Combo, gọi món" ? "Combo" : "Cái",
        DINHMUCTON_DUOI: 0,
        DINHMUCTON_TREN: 999,
        GIABAN: "",
        GIANIEMYET: "",
        TONKHO: "",
        MOTA: "",
        HINHANH: null,
      });
    }
    setIsModalOpen(true);
  };

  const openAddModalWithFixedType = (type) => {
    openModal(null, type);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Ảnh quá lớn",
          text: "Vui lòng chọn ảnh dưới 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, HINHANH: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveModal = async () => {
    if (!formData.TENHANGHOA) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Tên hàng hóa không thể trống!",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const dataToSave = {
      ...formData,
      DONGIABAN: Number(formData.GIABAN || 0),
      NHOMHANG: formData.NHOMHANG || "Khác",
      GIANIEMYET: Number(formData.GIANIEMYET || 0),
      SOLUONGTONKHO: Number(formData.TONKHO || 0),
      DONVITINH:
        formData.DONVITINH && formData.DONVITINH.trim() !== ""
          ? formData.DONVITINH
          : "Cái",
      HINHANH: formData.HINHANH?.startsWith("data:image")
        ? formData.HINHANH
        : null,
      DINHMUCTON_DUOI: Number(formData.DINHMUCTON_DUOI || 0),
      DINHMUCTON_TREN: Number(formData.DINHMUCTON_TREN || 999),
    };

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `http://localhost:5000/api/products/${formData.MAHANGHOA}`
        : `http://localhost:5000/api/products`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Dữ liệu đã được lưu lại!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProducts();
        setIsModalOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Lỗi: " + result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể kết nối đến máy chủ!",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Hủy",
      confirmButtonText: "Xóa",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const resultData = await res.json();

        if (res.ok && resultData.success) {
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Xóa hàng hóa thành công!",
            timer: 1500,
            showConfirmButton: false,
          });
          setProducts(products.filter((p) => p.MAHANGHOA !== id));
        } else {
          if (resultData.message.includes("REFERENCE constraint")) {
            Swal.fire({
              title: "Không thể xóa!",
              text: "Mặt hàng này đã có trong hóa đơn cũ. Bạn nên chuyển sang trạng thái 'Ngừng kinh doanh' để ẩn nó đi thay vì xóa hẳn.",
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "Chuyển trạng thái ngay",
              cancelButtonText: "Để sau",
            }).then((res) => {
              if (res.isConfirmed) handleToggleStatus(id);
            });
          } else {
            Swal.fire("Lỗi!", resultData.message, "error");
          }
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Lỗi kết nối đến máy chủ!",
        });
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const product = products.find((p) => p.MAHANGHOA === id);
    const currentStatus = Number(product.TRANGTHAI);
    const newStatus = currentStatus === 0 ? 1 : 0;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ TRANGTHAI: newStatus }),
        },
      );

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setProducts((prev) =>
            prev.map((p) =>
              p.MAHANGHOA === id ? { ...p, TRANGTHAI: newStatus } : p,
            ),
          );
        }
      } else {
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Lỗi từ server: " + (errorData.message || "Không thể cập nhật"),
        });
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể kết nối đến máy chủ!",
      });
    }
  };

  // Logic Combo
  const toggleComboMode = () => {
    setIsAddingCombo(!isAddingCombo);
    if (isAddingCombo) {
      setSelectedItemsForCombo({});
      setComboName("");
      setComboPrice("");
      setEditingProduct(null);
    }
  };

  const handleItemComboCheck = (id) => {
    // Tìm sản phẩm đang được tick
    const product = products.find((p) => p.MAHANGHOA === id);

    // Nếu là Combo thì chặn lại và thông báo
    if (product && product.LOAIHANG === "Combo, gọi món") {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không được phép thêm Combo vào trong một Combo khác!",
      });
      return;
    }

    setSelectedItemsForCombo((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalOriginalPrice = Object.keys(selectedItemsForCombo).reduce(
    (sum, itemId) => {
      if (selectedItemsForCombo[itemId]) {
        const product = products.find((p) => p.MAHANGHOA === itemId);
        if (product) sum += Number(product.GIABAN || 0);
      }
      return sum;
    },
    0,
  );

  // Lọc dữ liệu hiển thị
  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;

    // 1. Kiểm tra tìm kiếm
    const tenHang = p.TENHANGHOA ? String(p.TENHANGHOA).toLowerCase() : "";
    const maHang = p.MAHANGHOA ? String(p.MAHANGHOA).toLowerCase() : "";
    const search = searchQuery ? String(searchQuery).toLowerCase() : "";

    const matchSearch = tenHang.includes(search) || maHang.includes(search);

    // 2. Kiểm tra Nhóm hàng
    const matchCategory =
      !selectedCategory ||
      selectedCategory === "Tất cả" ||
      selectedCategory === "ALL"
        ? true
        : (p.NHOMHANG && String(p.NHOMHANG) === String(selectedCategory)) ||
          (p.MADANHMUC && String(p.MADANHMUC) === String(selectedCategory));

    // 3. Kiểm tra Loại hàng
    const matchType =
      !selectedTypes ||
      selectedTypes.length === 0 ||
      (p.LOAIHANG && selectedTypes.includes(p.LOAIHANG));

    // 4. Kiểm tra Tồn kho
    let matchInventory = true;
    const tonKho = Number(p.TONKHO || p.SOLUONGTONKHO || 0);
    const dinhMucDuoi = Number(p.DINHMUCTON_DUOI || 0);
    const dinhMucTren = Number(p.DINHMUCTON_TREN || 999999);

    if (selectedInventory === "con_hang") matchInventory = tonKho > 0;
    else if (selectedInventory === "het_hang") matchInventory = tonKho <= 0;
    else if (selectedInventory === "duoi")
      matchInventory = tonKho < dinhMucDuoi;
    else if (selectedInventory === "vuot")
      matchInventory = tonKho > dinhMucTren;

    // 5. Kiểm tra lồng Combo
    const isNotNestedCombo = !(
      isAddingCombo && p.LOAIHANG === "Combo, gọi món"
    );

    return (
      matchSearch &&
      matchCategory &&
      matchType &&
      matchInventory &&
      isNotNestedCombo
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter text-gray-900 pb-32 relative">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Hàng hóa" />

      <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-4">
          {/* Lọc: Tìm kiếm */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold mb-3 text-gray-700">Tìm kiếm</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Theo mã, tên hàng"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Loại hàng</h3>
              <img
                src={Icons.ArrowDown}
                alt="mũi tên"
                className={`cursor-pointer transition-transform ${isTypeExpanded ? "" : "rotate-180"}`}
                onClick={() => setIsTypeExpanded(!isTypeExpanded)}
              />
            </div>
            {isTypeExpanded && (
              <div className="space-y-2 text-sm">
                {[
                  "Hàng thường",
                  "Hàng chế biến",
                  "Combo, gọi món",
                  "Dịch vụ",
                ].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeFilterChange(type)}
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Nhóm hàng</h3>
              <img
                src={Icons.Add}
                alt="add"
                className="cursor-pointer"
                onClick={handleAddCategory}
              />
            </div>

            {/* Khung nhập Nhóm hàng / hoặc Tìm kiếm */}
            {isAddingCategory ? (
              <div className="mb-3 bg-gray-50 p-2 rounded border border-gray-200 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-blue-600 mb-2">
                  Thêm nhóm hàng mới
                </p>
                <input
                  type="text"
                  placeholder="Tên nhóm mới..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 rounded py-1 text-xs font-bold hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveNewCategory}
                    className="flex-1 bg-blue-600 text-white rounded py-1 text-xs font-bold hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src={Icons.Search}
                    alt="Tìm kiếm"
                    className="h-4 w-4 text-gray-400 opacity-50"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhóm hàng"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <ul className="mt-4 space-y-1 max-h-[400px] overflow-y-auto">
              <li
                className={`p-2 rounded text-sm cursor-pointer hover:bg-blue-50 ${selectedCategory === null ? "bg-blue-100 text-blue-700 font-bold" : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </li>

              {categories &&
                categories
                  .filter((cat) => {
                    // Bảo vệ dữ liệu tránh lỗi toLowerCase
                    const tenNhom = cat.TENDANHMUC
                      ? String(cat.TENDANHMUC).toLowerCase()
                      : "";
                    const search = groupSearchQuery
                      ? String(groupSearchQuery).toLowerCase()
                      : "";
                    return tenNhom.includes(search) && cat.MADANHMUC !== "ALL";
                  })
                  .map((cat) => (
                    <li
                      key={cat.MADANHMUC}
                      className={`group flex items-center justify-between p-2 rounded text-sm cursor-pointer hover:bg-blue-50 transition-all ${
                        selectedCategory === cat.MADANHMUC
                          ? "bg-blue-100 text-blue-700 font-bold"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(cat.MADANHMUC)}
                    >
                      <span className="truncate">{cat.TENDANHMUC}</span>

                      {/* Nhóm nút Sửa/Xóa hiện khi hover */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateCategory(cat.MADANHMUC, cat.TENDANHMUC);
                          }}
                          className="p-1 hover:text-blue-600 text-gray-400"
                          title="Sửa tên nhóm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.MADANHMUC, cat.TENDANHMUC);
                          }}
                          className="p-1 hover:text-red-600 text-gray-400"
                          title="Xóa nhóm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Lọc: Tồn kho */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Tồn kho</h3>
              <img
                src={Icons.ArrowDown}
                alt="mũi tên"
                className={`cursor-pointer transition-transform ${isInventoryExpanded ? "" : "rotate-180"}`}
                onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}
              />
            </div>
            {isInventoryExpanded && (
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inventory"
                    checked={selectedInventory === "all"}
                    onChange={() => setSelectedInventory("all")}
                  />{" "}
                  Tất cả
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inventory"
                    checked={selectedInventory === "duoi"}
                    onChange={() => setSelectedInventory("duoi")}
                  />{" "}
                  Dưới định mức tồn
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inventory"
                    checked={selectedInventory === "vuot"}
                    onChange={() => setSelectedInventory("vuot")}
                  />{" "}
                  Vượt định mức tồn
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inventory"
                    checked={selectedInventory === "con_hang"}
                    onChange={() => setSelectedInventory("con_hang")}
                  />{" "}
                  Còn hàng trong kho
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inventory"
                    checked={selectedInventory === "het_hang"}
                    onChange={() => setSelectedInventory("het_hang")}
                  />{" "}
                  Hết hàng trong kho
                </label>
              </div>
            )}
          </div>
        </aside>
        <section className="col-span-9 space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-t-lg border-b border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {isAddingCombo
                ? editingProduct
                  ? "Cập nhật Combo"
                  : "Tạo Combo mới"
                : "Danh sách hàng hóa"}
            </h2>

            {!isAddingCombo && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAddModalWithFixedType("Hàng thường")}
                  className="flex items-center gap-1 cursor-pointer bg-[#00B050] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 transition-all shadow-sm"
                >
                  <img
                    src={Icons.Add}
                    alt="Thêm món"
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span>Thêm món</span>
                </button>

                <button
                  onClick={() => openAddModalWithFixedType("Hàng chế biến")}
                  className="flex items-center gap-1 cursor-pointer bg-[#00B050] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 transition-all shadow-sm"
                >
                  <img
                    src={Icons.Add}
                    alt="Hàng chế biến"
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span>Thêm hàng chế biến</span>
                </button>

                <button
                  onClick={() => openModal(null, "Combo, gọi món")}
                  className="flex items-center gap-1 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                >
                  <img
                    src={Icons.Add}
                    alt="Combo"
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span>Combo, gọi món</span>
                </button>

                <button
                  onClick={() => openAddModalWithFixedType("Dịch vụ")}
                  className="flex items-center gap-1 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                >
                  <img
                    src={Icons.Add}
                    alt="Dịch vụ"
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span>Dịch vụ</span>
                </button>
              </div>
            )}

            {isAddingCombo && (
              <button
                onClick={toggleComboMode}
                className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              >
                Hủy tạo Combo
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#E8EBF3] text-gray-700 font-bold border-b border-gray-300">
                <tr>
                  {isAddingCombo && (
                    <th className="p-3 border-b border-gray-300 w-10 text-center">
                      Chọn
                    </th>
                  )}
                  <th className="p-3 border-b border-gray-300">Mã hàng</th>
                  <th className="p-3 border-b border-gray-300">Tên hàng</th>
                  <th className="p-3 border-b border-gray-300 text-center">
                    Loại hàng
                  </th>
                  <th className="p-3 border-b border-gray-300 text-right">
                    Nhóm hàng
                  </th>
                  <th className="p-3 border-b border-gray-300 text-right">
                    Giá bán
                  </th>
                  <th className="p-3 border-b border-gray-300 text-right">
                    Giá niêm yết
                  </th>
                  <th className="p-3 border-b border-gray-300 text-right">
                    Tồn kho
                  </th>
                  <th className="p-3 border-b border-gray-300 text-right">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white font-bold border-b border-blue-500 text-blue-600">
                  {isAddingCombo && <td className="p-3"></td>}
                  <td colSpan="4" className="p-3 text-right"></td>
                  <td className="p-3 text-right">0</td>
                  <td className="p-3 text-right">0</td>
                  <td className="p-3 text-right">
                    {filteredProducts.reduce(
                      (sum, p) => sum + Number(p.TONKHO),
                      0,
                    )}
                  </td>
                </tr>

                {filteredProducts.map((p) => (
                  <React.Fragment key={p.MAHANGHOA}>
                    <tr
                      className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${expandedRows[p.MAHANGHOA] ? "bg-blue-50" : ""}`}
                      onClick={() => !isAddingCombo && toggleRow(p.MAHANGHOA)}
                    >
                      {isAddingCombo && (
                        <td
                          className="p-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={!!selectedItemsForCombo[p.MAHANGHOA]}
                            onChange={() => handleItemComboCheck(p.MAHANGHOA)}
                          />
                        </td>
                      )}
                      <td className="p-3 font-medium text-blue-700">
                        {p.MAHANGHOA}
                      </td>
                      <td className="p-3 font-medium">
                        {p.TENHANGHOA}{" "}
                        <span className="text-xs text-gray-400 font-normal ml-1 italic">
                          ({p.DONVITINH})
                        </span>
                      </td>
                      <td className="p-3 text-center">{p.LOAIHANG}</td>
                      <td className="p-3 text-right">{p.NHOMHANG}</td>
                      <td className="p-3 text-right">
                        {Number(p.GIABAN).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-400">
                        {Number(p.GIANIEMYET).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold">{p.TONKHO}</td>
                      <td className="p-3 text-end">
                        {p.TRANGTHAI === 0 || p.TRANGTHAI === false ? (
                          <span className=" text-green-700 px-2 py-1 text-[13px] font-bold">
                            Đang bán
                          </span>
                        ) : (
                          <span className=" text-red-700 px-2 py-1  text-[13px] font-bold">
                            Ngừng bán
                          </span>
                        )}
                      </td>
                    </tr>

                    {expandedRows[p.MAHANGHOA] && (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-6 bg-white border-b border-gray-200"
                        >
                          <div className="flex gap-8">
                            <div className="w-48 h-48 border border-gray-300 rounded p-2 flex items-center justify-center bg-white overflow-hidden">
                              {p.HINHANH ? (
                                <img
                                  src={p.HINHANH}
                                  alt={p.TENHANGHOA}
                                  className="max-h-full object-contain"
                                />
                              ) : (
                                <img
                                  src={p.HINHANH}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150";
                                  }}
                                  alt={p.TENHANGHOA}
                                  className="max-h-full object-contain opacity-50"
                                />
                              )}
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-y-3 text-[14px]">
                              <div className="text-gray-500">Mã hàng hóa:</div>
                              <div className="font-bold text-gray-800">
                                {p.MAHANGHOA}
                              </div>
                              <div className="text-gray-500">Nhóm hàng:</div>
                              <div className="text-gray-800">{p.NHOMHANG}</div>

                              <div className="text-gray-500">Loại hàng:</div>
                              <div className="text-gray-800">{p.LOAIHANG}</div>

                              <div className="text-gray-500">Định mức tồn:</div>
                              <div className="text-gray-800">
                                {p.DINHMUCTON_DUOI || 0} -{" "}
                                {p.DINHMUCTON_TREN || 0}
                              </div>
                              <div className="text-gray-500">Giá bán:</div>
                              <div className="font-bold text-blue-600">
                                {Number(p.GIABAN).toLocaleString()} đ
                              </div>
                              <div className="text-gray-500">Giá niêm yết:</div>
                              <div className="text-gray-800">
                                {Number(p.GIANIEMYET).toLocaleString()} đ
                              </div>
                              <div className="text-gray-500">Trạng thái:</div>
                              <div
                                className={
                                  p.TRANGTHAI === 0 || p.TRANGTHAI === false
                                    ? "text-[#10B981] font-bold"
                                    : "text-[#EF4444] font-bold"
                                }
                              >
                                {p.TRANGTHAI === 0 || p.TRANGTHAI === false
                                  ? "Đang hoạt động"
                                  : "Ngừng hoạt động"}
                              </div>
                            </div>

                            <div className="flex-1 justify-end flex-col hidden lg:flex w-full">
                              <p className="text-gray-500 mb-2">Mô tả</p>
                              <p className="text-sm italic text-gray-400">
                                {p.MOTA || "Chưa có mô tả"}
                              </p>

                              <div className="mt-12 flex gap-2 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(p);
                                  }}
                                  className="flex items-center justify-center gap-2 cursor-pointer bg-[#F97316] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#EA580C] transition-all shadow-sm whitespace-nowrap"
                                >
                                  <img
                                    src={Icons.Pen}
                                    alt="Chỉnh sửa"
                                    className="h-4 w-4 brightness-0 invert"
                                  />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(p.MAHANGHOA);
                                  }}
                                  className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer transition-all shadow-sm whitespace-nowrap text-sm font-semibold"
                                >
                                  <img
                                    src={Icons.Block}
                                    alt="Khóa"
                                    className="h-4 w-4 brightness-0 invert"
                                  />
                                  <span>
                                    {p.TRANGTHAI === 0 || p.TRANGTHAI === false
                                      ? "Ngừng hoạt động"
                                      : "Mở hoạt động"}
                                  </span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(p.MAHANGHOA);
                                  }}
                                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer transition-all shadow-sm whitespace-nowrap text-sm font-semibold"
                                >
                                  <img
                                    src={Icons.Delete}
                                    alt="Xóa"
                                    className="h-4 w-4 brightness-0 invert"
                                  />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ================= MODAL THÊM / SỬA HÀNG HÓA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct
                  ? "Chỉnh sửa hàng hóa"
                  : `Thêm mới - ${formData.LOAIHANG}`}
              </h2>
            </div>

            {/* Body Modal (Có Scroll nếu nội dung dài) */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* VÙNG 1: ẢNH VÀ TÊN  */}
              <div className="flex gap-4 mb-2">
                <div className="w-32 h-32 flex-shrink-0 border border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group">
                  {formData.HINHANH ? (
                    <img
                      src={formData.HINHANH}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-[10px]">
                      Thêm ảnh
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mã hàng hóa
                    </label>
                    <input
                      type="text"
                      value={formData.MAHANGHOA}
                      disabled
                      className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tên hàng hóa *
                    </label>
                    <input
                      type="text"
                      value={formData.TENHANGHOA}
                      onChange={(e) =>
                        setFormData({ ...formData, TENHANGHOA: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* VÙNG 2: DÀNH RIÊNG CHO DỊCH VỤ */}
              {formData.LOAIHANG === "Dịch vụ" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Giá bán
                    </label>
                    <input
                      type="number"
                      value={formData.GIABAN}
                      onChange={(e) =>
                        setFormData({ ...formData, GIABAN: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Đơn vị tính
                    </label>
                    <input
                      type="text"
                      value={formData.DONVITINH}
                      onChange={(e) =>
                        setFormData({ ...formData, DONVITINH: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* VÙNG 3: DÀNH RIÊNG CHO COMBO */}
              {formData.LOAIHANG === "Combo, gọi món" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Giá Combo
                      </label>
                      <input
                        type="number"
                        value={formData.GIABAN}
                        onChange={(e) =>
                          setFormData({ ...formData, GIABAN: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold text-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Đơn vị
                      </label>
                      <input
                        type="text"
                        value={formData.DONVITINH}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            DONVITINH: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 mb-2">
                      Thành phần món:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {products
                        .filter(
                          (p) =>
                            p.LOAIHANG !== "Combo, gọi món" &&
                            p.LOAIHANG !== "Dịch vụ",
                        )
                        .map((p) => (
                          <label
                            key={p.MAHANGHOA}
                            className="flex items-center justify-between bg-white p-2 rounded text-xs cursor-pointer border border-transparent hover:border-blue-300"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!selectedItemsForCombo[p.MAHANGHOA]}
                                onChange={() =>
                                  handleItemComboCheck(p.MAHANGHOA)
                                }
                              />
                              <span>{p.TENHANGHOA}</span>
                            </div>
                            <span className="text-gray-400">
                              {Number(p.GIABAN).toLocaleString()}đ
                            </span>
                          </label>
                        ))}
                    </div>
                    <div className="mt-2 text-right text-xs font-bold text-blue-800">
                      Tổng gốc: {totalOriginalPrice.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              )}

              {/* VÙNG 4: DÀNH RIÊNG CHO HÀNG THƯỜNG / CHẾ BIẾN */}
              {formData.LOAIHANG !== "Dịch vụ" &&
                formData.LOAIHANG !== "Combo, gọi món" && (
                  <div className="space-y-4">
                    {/* Hàng 1: Nhóm hàng & ĐVT */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nhóm hàng
                        </label>
                        <select
                          value={formData.MADANHMUC}
                          onChange={(e) => {
                            const selectedCat = categories.find(
                              (c) => c.id === e.target.value,
                            );
                            setFormData({
                              ...formData,
                              MADANHMUC: e.target.value,
                              NHOMHANG: selectedCat
                                ? selectedCat.TENDANHMUC
                                : "",
                            });
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                          {categories
                            .filter(
                              (c) =>
                                c.MADANHMUC !== "ALL" &&
                                c.MADANHMUC !== "Tất cả",
                            )
                            .map((cat) => (
                              <option key={cat.MADANHMUC} value={cat.MADANHMUC}>
                                {cat.TENDANHMUC}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Đơn vị tính
                        </label>
                        <input
                          type="text"
                          value={formData.DONVITINH}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              DONVITINH: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {/* Hàng 2: Giá bán & Giá niêm yết */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Giá bán
                        </label>
                        <input
                          type="number"
                          value={formData.GIABAN}
                          onChange={(e) =>
                            setFormData({ ...formData, GIABAN: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-green-600 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Giá niêm yết
                        </label>
                        <input
                          type="number"
                          value={formData.GIANIEMYET}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              GIANIEMYET: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Hàng 3: Tồn kho & Định mức tồn */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Tồn kho hiện tại
                        </label>
                        <input
                          type="number"
                          value={formData.TONKHO}
                          onChange={(e) =>
                            setFormData({ ...formData, TONKHO: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-gray-700">
                          Định mức tồn (Dưới - Trên)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={formData.DINHMUCTON_DUOI}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                DINHMUCTON_DUOI: e.target.value,
                              })
                            }
                            className="w-1/2 border border-gray-300 rounded px-2 py-2 text-sm"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={formData.DINHMUCTON_TREN}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                DINHMUCTON_TREN: e.target.value,
                              })
                            }
                            className="w-1/2 border border-gray-300 rounded px-2 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* VÙNG 5: MÔ TẢ (Chung) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.MOTA}
                  onChange={(e) =>
                    setFormData({ ...formData, MOTA: e.target.value })
                  }
                  rows="2"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded font-bold text-sm hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveModal}
                className="px-6 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;
