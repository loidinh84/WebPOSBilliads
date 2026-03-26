import React, { useState, useEffect } from "react";
import * as Icons from "../../assets/icons/index";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";

function Product() {
  // =========================================================================
  // 1. STATE DỮ LIỆU (Mock data & DB)
  // =========================================================================
  const [categories, setCategories] = useState([
    { id: "ALL", name: "Tất cả" },
    { id: "DO_AN", name: "ĐỒ ĂN" },
    { id: "DO_UONG", name: "ĐỒ UỐNG" },
    { id: "THUOC_LA", name: "THUỐC LÁ" },
    { id: "LOAI_BAN", name: "LOẠI BÀN" },
  ]);

  const [products, setProducts] = useState([
    {
      MAHANGHOA: "SP000012",
      TENHANGHOA: "Snack tôm cay (Lớn)",
      LOAIHANG: "Hàng thường",
      NHOMHANG: "Khác",
      DINHMUCTON: "0 > 1,000",
      GIABAN: 15000,
      GIANIEMYET: 9000,
      TONKHO: 236,
      MOTA: "Chưa có mô tả",
      HINHANH: null,
      TRANGTHAI: 1, // 1: Đang hoạt động, 0: Ngừng hoạt động
    },
    {
        MAHANGHOA: "SP000013",
        TENHANGHOA: "Bia Tiger Lon 330ml",
        LOAIHANG: "Hàng thường",
        NHOMHANG: "ĐỒ UỐNG",
        DINHMUCTON: "0 > 500",
        GIABAN: 25000,
        GIANIEMYET: 20000,
        TONKHO: 150,
        MOTA: "Chưa có mô tả",
        HINHANH: null,
        TRANGTHAI: 1,
    }
  ]);

  // Tự động fetch dữ liệu từ Database khi load trang
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (res.ok) {
        const data = await res.json();
        if(data.length > 0) setProducts(data);
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
  const [comboName, setComboName] = useState("");
  const [comboPrice, setComboPrice] = useState("");

  // =========================================================================
  // 4. STATE MODAL THÊM/SỬA
  // =========================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    MAHANGHOA: "", TENHANGHOA: "", LOAIHANG: "", NHOMHANG: "ĐỒ ĂN", 
    DINHMUCTON: "", GIABAN: "", GIANIEMYET: "", TONKHO: "", MOTA: "", HINHANH: null
  });

  // =========================================================================
  // 5. CÁC HÀM XỬ LÝ LOGIC
  // =========================================================================

  const generateNextId = () => {
    if (products.length === 0) return "SP000001";
    const ids = products.map(p => parseInt(p.MAHANGHOA.replace("SP", ""), 10)).filter(id => !isNaN(id));
    const maxId = Math.max(...ids, 0);
    return `SP${String(maxId + 1).padStart(6, '0')}`;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTypeFilterChange = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { id: `NEW_${Date.now()}`, name: newCategoryName.trim().toUpperCase() }]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const openModal = (product = null, defaultType = "") => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        MAHANGHOA: generateNextId(),
        TENHANGHOA: "",
        LOAIHANG: defaultType, 
        NHOMHANG: categories.length > 1 ? categories[1].name : "",
        DINHMUCTON: "",
        GIABAN: "",
        GIANIEMYET: "",
        TONKHO: "",
        MOTA: "",
        HINHANH: null
      });
    }
    setIsModalOpen(true);
  };

  const openAddModalWithFixedType = (type) => {
    openModal(null, type);
  };

  // Xử lý upload ảnh ảo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, HINHANH: imageUrl });
    }
  };

  const handleSaveModal = async () => {
    if (!formData.TENHANGHOA) {
      alert("Vui lòng nhập tên hàng hóa!");
      return;
    }

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${formData.MAHANGHOA}` 
        : `http://localhost:5000/api/products`;

      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      // Load lại Database sau khi lưu
      fetchProducts();
    } catch (error) {
      console.error("Lưu API thất bại, lưu tạm vào State:", error);
    } finally {
      // Cơ chế dự phòng (Cập nhật UI ngay cả khi API lỗi)
      if (editingProduct) {
        setProducts(products.map(p => p.MAHANGHOA === formData.MAHANGHOA ? { ...formData, TRANGTHAI: p.TRANGTHAI } : p));
      } else {
        setProducts([{ ...formData, TRANGTHAI: 1 }, ...products]);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hàng hóa này?")) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" });
      } catch (err) {}
      setProducts(products.filter(p => p.MAHANGHOA !== id));
    }
  };

  const handleToggleStatus = async (id) => {
    const product = products.find(p => p.MAHANGHOA === id);
    const newStatus = product.TRANGTHAI === 1 ? 0 : 1;
    try {
      await fetch(`http://localhost:5000/api/products/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TRANGTHAI: newStatus })
      });
    } catch (err) {}
    setProducts(products.map(p => p.MAHANGHOA === id ? { ...p, TRANGTHAI: newStatus } : p));
  };

  // Logic Combo
  const toggleComboMode = () => {
    setIsAddingCombo(!isAddingCombo);
    if (isAddingCombo) {
        setSelectedItemsForCombo({});
        setComboName("");
        setComboPrice("");
    }
  };

  const handleItemComboCheck = (id) => {
    setSelectedItemsForCombo(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalOriginalPrice = Object.keys(selectedItemsForCombo).reduce((sum, itemId) => {
    if (selectedItemsForCombo[itemId]) {
        const product = products.find(p => p.MAHANGHOA === itemId);
        if (product) sum += Number(product.GIABAN);
    }
    return sum;
  }, 0);

  const handleConfirmCombo = async () => {
    if (!comboName || !comboPrice) {
        alert("Vui lòng nhập tên combo và giá bán combo!");
        return;
    }
    
    const newComboProduct = {
      MAHANGHOA: generateNextId(),
      TENHANGHOA: comboName,
      LOAIHANG: "Combo, gọi món",
      NHOMHANG: "Khác", 
      DINHMUCTON: "",
      GIABAN: Number(comboPrice),
      GIANIEMYET: totalOriginalPrice,
      TONKHO: 100,
      MOTA: "Combo bao gồm các món đã chọn",
      HINHANH: null,
      TRANGTHAI: 1
    };

    try {
      await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComboProduct)
      });
    } catch(err) {}

    setProducts([newComboProduct, ...products]);
    toggleComboMode();
  };

  // Lọc dữ liệu hiển thị
  const filteredProducts = products.filter(p => {
    const matchSearch = p.TENHANGHOA.toLowerCase().includes(searchQuery.toLowerCase()) || p.MAHANGHOA.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "Tất cả" || p.NHOMHANG === selectedCategory;
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.LOAIHANG);
    let matchInventory = true;
    if (selectedInventory === "con_hang") matchInventory = p.TONKHO > 0;
    if (selectedInventory === "het_hang") matchInventory = p.TONKHO <= 0;

    return matchSearch && matchCategory && matchType && matchInventory;
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
                {["Hàng thường", "Hàng chế biến", "Combo, gọi món", "Dịch vụ"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeFilterChange(type)}
                    /> {type}
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
                onClick={() => setIsAddingCategory(!isAddingCategory)} 
              />
            </div>
            
            {/* Khung nhập Nhóm hàng / hoặc Tìm kiếm */}
            {isAddingCategory ? (
              <div className="mb-3 bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-xs font-bold text-blue-600 mb-2">Thêm nhóm hàng mới</p>
                <input
                  type="text"
                  placeholder="Tên nhóm mới..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingCategory(false)} className="flex-1 bg-gray-200 text-gray-700 rounded py-1 text-xs font-bold">Hủy</button>
                  <button onClick={handleSaveNewCategory} className="flex-1 bg-blue-600 text-white rounded py-1 text-xs font-bold">Lưu</button>
                </div>
              </div>
            ) : (
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={Icons.Search} alt="Tìm kiếm" className="h-4 w-4 text-gray-400" style={{ filter: "grayscale(1) opacity(0.5)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhóm hàng"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            )}

            <ul className="text-sm space-y-2 text-gray-600 max-h-40 overflow-y-auto">
              {categories.filter(c => c.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(cat => (
                <li 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`cursor-pointer hover:text-blue-600 ${selectedCategory === cat.name ? "font-bold text-blue-600" : ""}`}
                >
                  {cat.name}
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
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="inventory" checked={selectedInventory === "all"} onChange={() => setSelectedInventory("all")} /> Tất cả</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="inventory" checked={selectedInventory === "duoi"} onChange={() => setSelectedInventory("duoi")} /> Dưới định mức tồn</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="inventory" checked={selectedInventory === "vuot"} onChange={() => setSelectedInventory("vuot")} /> Vượt định mức tồn</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="inventory" checked={selectedInventory === "con_hang"} onChange={() => setSelectedInventory("con_hang")} /> Còn hàng trong kho</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="inventory" checked={selectedInventory === "het_hang"} onChange={() => setSelectedInventory("het_hang")} /> Hết hàng trong kho</label>
              </div>
            )}
          </div>
        </aside>
        <section className="col-span-9 space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-t-lg border-b border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {isAddingCombo ? "Tạo Combo mới" : "Danh sách hàng hóa"}
            </h2>
            
            {!isAddingCombo && (
              <div className="flex items-center gap-3">
                <button onClick={() => openAddModalWithFixedType("Hàng thường")} className="flex items-center gap-1 cursor-pointer bg-[#00B050] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 transition-all shadow-sm">
                    <img src={Icons.Add} alt="Thêm món" className="h-4 w-4 brightness-0 invert" />
                    <span>Thêm món</span>
                </button>

                <button onClick={() => openAddModalWithFixedType("Hàng chế biến")} className="flex items-center gap-1 cursor-pointer bg-[#00B050] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 transition-all shadow-sm">
                    <img src={Icons.Add} alt="Hàng chế biến" className="h-4 w-4 brightness-0 invert" />
                    <span>Thêm hàng chế biến</span>
                </button>

                <button onClick={toggleComboMode} className="flex items-center gap-1 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer">
                    <img src={Icons.Add} alt="Combo" className="h-4 w-4 brightness-0 invert" />
                    <span>Combo, gọi món</span>
                </button>

                <button onClick={() => openAddModalWithFixedType("Dịch vụ")} className="flex items-center gap-1 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer">
                    <img src={Icons.Add} alt="Dịch vụ" className="h-4 w-4 brightness-0 invert" />
                    <span>Dịch vụ</span>
                </button>
              </div>
            )}
            
            {isAddingCombo && (
                <button onClick={toggleComboMode} className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors cursor-pointer">
                    Hủy tạo Combo
                </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#E8EBF3] text-gray-700 font-bold border-b border-gray-300">
                <tr>
                  {isAddingCombo && <th className="p-3 border-b border-gray-300 w-10 text-center">Chọn</th>}
                  <th className="p-3 border-b border-gray-300">Mã hàng</th>
                  <th className="p-3 border-b border-gray-300">Tên hàng</th>
                  <th className="p-3 border-b border-gray-300 text-center">Loại hàng</th>
                  <th className="p-3 border-b border-gray-300 text-right">Nhóm hàng</th>
                  <th className="p-3 border-b border-gray-300 text-right">Giá bán</th>
                  <th className="p-3 border-b border-gray-300 text-right">Giá niêm yết</th>
                  <th className="p-3 border-b border-gray-300 text-right">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white font-bold border-b border-blue-500 text-blue-600">
                  {isAddingCombo && <td className="p-3"></td>}
                  <td colSpan="4" className="p-3 text-right"></td>
                  <td className="p-3 text-right">0</td>
                  <td className="p-3 text-right">0</td>
                  <td className="p-3 text-right">{filteredProducts.reduce((sum, p) => sum + Number(p.TONKHO), 0)}</td>
                </tr>

                {filteredProducts.map((p) => (
                  <React.Fragment key={p.MAHANGHOA}>
                    <tr
                      className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${expandedRows[p.MAHANGHOA] ? "bg-blue-50" : ""}`}
                      onClick={() => !isAddingCombo && toggleRow(p.MAHANGHOA)}
                    >
                      {isAddingCombo && (
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 cursor-pointer"
                                checked={!!selectedItemsForCombo[p.MAHANGHOA]} 
                                onChange={() => handleItemComboCheck(p.MAHANGHOA)} 
                            />
                        </td>
                      )}
                      <td className="p-3 font-medium text-blue-700">{p.MAHANGHOA}</td>
                      <td className="p-3 font-medium">{p.TENHANGHOA}</td>
                      <td className="p-3 text-center">{p.LOAIHANG}</td>
                      <td className="p-3 text-right">{p.NHOMHANG}</td>
                      <td className="p-3 text-right">{Number(p.GIABAN).toLocaleString()}</td>
                      <td className="p-3 text-right text-gray-400">{Number(p.GIANIEMYET).toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">{p.TONKHO}</td>
                    </tr>
                    
                    {expandedRows[p.MAHANGHOA] && !isAddingCombo && (
                      <tr>
                        <td colSpan="8" className="p-6 bg-white border-b border-gray-200">
                          <div className="flex gap-8">
                            <div className="w-48 h-48 border border-gray-300 rounded p-2 flex items-center justify-center bg-white overflow-hidden">
                              {p.HINHANH ? (
                                <img src={p.HINHANH} alt={p.TENHANGHOA} className="max-h-full object-contain" />
                              ) : (
                                <img src="https://via.placeholder.com/150" alt={p.TENHANGHOA} className="max-h-full object-contain opacity-50" />
                              )}
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-y-3 text-[14px]">
                              <div className="text-gray-500">Mã hàng hóa:</div><div className="font-bold text-gray-800">{p.MAHANGHOA}</div>
                              <div className="text-gray-500">Nhóm hàng:</div><div className="text-gray-800">{p.NHOMHANG}</div>
                              <div className="text-gray-500">Loại hàng:</div><div className="text-gray-800">{p.LOAIHANG}</div>
                              <div className="text-gray-500">Định mức tồn:</div><div className="text-gray-800">{p.DINHMUCTON || "0 > 1,000"}</div>
                              <div className="text-gray-500">Giá bán:</div><div className="font-bold text-blue-600">{Number(p.GIABAN).toLocaleString()} đ</div>
                              <div className="text-gray-500">Giá niêm yết:</div><div className="text-gray-800">{Number(p.GIANIEMYET).toLocaleString()} đ</div>
                              <div className="text-gray-500">Trạng thái:</div>
                              <div className={p.TRANGTHAI === 1 ? "text-[#10B981] font-bold" : "text-[#EF4444] font-bold"}>
                                {p.TRANGTHAI === 1 ? "Đang hoạt động" : "Ngừng hoạt động"}
                              </div>
                            </div>

                            <div className="flex-1 justify-end flex-col hidden lg:flex w-full">
                              <p className="text-gray-500 mb-2">Mô tả</p>
                              <p className="text-sm italic text-gray-400">{p.MOTA || "Chưa có mô tả"}</p>

                              <div className="mt-12 flex gap-2 justify-end">
                                <button onClick={(e) => { e.stopPropagation(); openModal(p); }} className="flex items-center justify-center gap-2 cursor-pointer bg-[#F97316] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#EA580C] transition-all shadow-sm whitespace-nowrap">
                                  <img src={Icons.Pen} alt="Chỉnh sửa" className="h-4 w-4 brightness-0 invert" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(p.MAHANGHOA); }} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer transition-all shadow-sm whitespace-nowrap text-sm font-semibold">
                                  <img src={Icons.Block} alt="Khóa" className="h-4 w-4 brightness-0 invert" />
                                  <span>{p.TRANGTHAI === 1 ? "Ngừng hoạt động" : "Mở hoạt động"}</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(p.MAHANGHOA); }} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer transition-all shadow-sm whitespace-nowrap text-sm font-semibold">
                                  <img src={Icons.Delete} alt="Xóa" className="h-4 w-4 brightness-0 invert" />
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

      {/* ================= THANH TẠO COMBO (Fixed Bottom) ================= */}
      {isAddingCombo && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <div className="max-w-[1440px] mx-auto grid grid-cols-4 gap-4 items-center pl-[25%]">
            <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-600 mb-1">Tên combo <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={comboName} 
                    onChange={(e) => setComboName(e.target.value)} 
                    placeholder="Ví dụ: Combo Nhậu Đêm" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                />
            </div>
            <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-600 mb-1">Tổng giá gốc các sản phẩm</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={totalOriginalPrice.toLocaleString() + " đ"} 
                        disabled 
                        className="w-full border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed font-bold" 
                    />
                </div>
            </div>
            <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-600 mb-1">Giá bán combo <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    value={comboPrice} 
                    onChange={(e) => setComboPrice(e.target.value)} 
                    placeholder="Giá bán thực tế" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-bold text-blue-600" 
                />
            </div>
            <div className="col-span-1 flex justify-end gap-3 mt-4">
                <button onClick={toggleComboMode} className="bg-white border border-gray-300 text-gray-700 rounded px-5 py-2 text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Hủy
                </button>
                <button onClick={handleConfirmCombo} className="bg-[#2563EB] text-white rounded px-5 py-2 text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                    Xác nhận
                </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA HÀNG HÓA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? "Chỉnh sửa hàng hóa" : `Thêm mới - ${formData.LOAIHANG}`}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* VÙNG CHỌN ẢNH VÀ MÃ/TÊN HÀNG */}
              <div className="flex gap-4 mb-2">
                {/* Ô Upload Ảnh */}
                <div className="w-32 h-32 flex-shrink-0 border border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative cursor-pointer hover:bg-gray-100 transition-colors group">
                  {formData.HINHANH ? (
                    <>
                      <img src={formData.HINHANH} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-semibold">Đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 text-xs flex flex-col items-center">
                      <span className="text-2xl block leading-none mb-1 text-gray-400">+</span>
                      Thêm ảnh
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>

                {/* Mã và Tên */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mã hàng hóa <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.MAHANGHOA} disabled className="w-full border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tên hàng hóa <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.TENHANGHOA} onChange={(e) => setFormData({ ...formData, TENHANGHOA: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Snack khoai tây..." />
                  </div>
                </div>
              </div>

              {/* CÁC THÔNG TIN KHÁC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nhóm hàng</label>
                  <select value={formData.MADANHMUC} onChange={(e) => setFormData({ ...formData, MADANHMUC: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500">
                    <option value="DM001">ĐỒ UỐNG</option>
                    <option value="DM002">THỨC ĂN NHẸ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Giá bán</label>
                  <input type="number" value={formData.GIABAN} onChange={(e) => setFormData({ ...formData, GIABAN: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Định mức tồn</label>
                  <input type="text" value={formData.DINHMUCTON} onChange={(e) => setFormData({ ...formData, DINHMUCTON: e.target.value })} placeholder="VD: 0 > 1000" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Giá niêm yết</label>
                  <input type="number" value={formData.GIANIEMYET} onChange={(e) => setFormData({ ...formData, GIANIEMYET: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tồn kho ban đầu</label>
                <input type="number" value={formData.TONKHO} onChange={(e) => setFormData({ ...formData, TONKHO: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                <textarea value={formData.MOTA} onChange={(e) => setFormData({ ...formData, MOTA: e.target.value })} rows="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"></textarea>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
                Hủy
              </button>
              <button onClick={handleSaveModal} className="px-6 py-2 bg-[#2563EB] text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
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