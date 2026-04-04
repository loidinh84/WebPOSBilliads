import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import Swal from "sweetalert2";
import axios from "axios";

export default function Discount() {
  const [discounts, setDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    MAKHUYENMAI: "",
    MACHITETKHOAN: "",
    NGAYBATDAU: "",
    NGAYKETTHUC: "",
    TRANGTHAI: true
  });

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/discounts");
      if (res.data.success) {
        setDiscounts(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setEditingId(discount.MAKHUYENMAI);
      setFormData({
        MAKHUYENMAI: discount.MAKHUYENMAI || "",
        MACHITETKHOAN: discount.MACHITETKHOAN || discount.MACHITIETKHUYENMAI || "",
        NGAYBATDAU: discount.NGAYBATDAU ? discount.NGAYBATDAU.split('T')[0] : "",
        NGAYKETTHUC: discount.NGAYKETTHUC ? discount.NGAYKETTHUC.split('T')[0] : "",
        TRANGTHAI: discount.TRANGTHAI !== undefined ? discount.TRANGTHAI : true
      });
    } else {
      setEditingId(null);
      setFormData({
        MAKHUYENMAI: "",
        MACHITETKHOAN: "",
        NGAYBATDAU: "",
        NGAYKETTHUC: "",
        TRANGTHAI: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/discounts/${editingId}`, formData);
        Swal.fire("Thành công", "Đã cập nhật khuyến mãi!", "success");
      } else {
        await axios.post("http://localhost:5000/api/discounts", formData);
        Swal.fire("Thành công", "Đã thêm khuyến mãi mới!", "success");
      }
      setShowModal(false);
      fetchDiscounts();
    } catch (error) {
      Swal.fire("Lỗi", "Không thể lưu. Kiểm tra kết nối hoặc cơ sở dữ liệu.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn xóa?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/discounts/${id}`);
        Swal.fire("Đã xóa", "Chương trình khuyến mãi đã được xóa.", "success");
        fetchDiscounts();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa khuyến mãi.", "error");
      }
    }
  };

  const toggleStatus = async (discount) => {
    try {
      const updatedData = { ...discount, TRANGTHAI: !discount.TRANGTHAI };
      // Xử lý ngày tháng nếu format có vấn đề
      if(updatedData.NGAYBATDAU) updatedData.NGAYBATDAU = updatedData.NGAYBATDAU.split('T')[0];
      if(updatedData.NGAYKETTHUC) updatedData.NGAYKETTHUC = updatedData.NGAYKETTHUC.split('T')[0];
      
      await axios.put(`http://localhost:5000/api/discounts/${discount.MAKHUYENMAI}`, updatedData);
      fetchDiscounts();
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    (d.MAKHUYENMAI?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (d.MACHITETKHOAN?.toLowerCase().includes(searchTerm.toLowerCase()) || d.MACHITIETKHUYENMAI?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <DashboardHeader storeName="Billiards Lục Lọi" />
      <DashboardNav activeTab="Thiết lập" />

      <main className="flex-1 overflow-y-auto px-8 py-6 bg-white min-h-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Danh sách khuyến mãi</h1>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-[#4154F1] hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-all"
          >
            + Thêm khuyến mãi
          </button>
        </div>

        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Tìm kiếm mã hoặc nội dung..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4154F1]"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F8] text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold">Mã</th>
                <th className="p-4 font-bold">Chi tiết</th>
                <th className="p-4 font-bold">Ngày bắt đầu</th>
                <th className="p-4 font-bold">Ngày kết thúc</th>
                <th className="p-4 font-bold">Trạng thái</th>
                <th className="p-4 font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((item, index) => {
                  const isActive = item.TRANGTHAI;
                  const detail = item.MACHITETKHOAN || item.MACHITIETKHUYENMAI;
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-[#4154F1]">{item.MAKHUYENMAI}</td>
                      <td className="p-4">{detail}</td>
                      <td className="p-4">{item.NGAYBATDAU ? new Date(item.NGAYBATDAU).toLocaleDateString("vi-VN") : "N/A"}</td>
                      <td className="p-4">{item.NGAYKETTHUC ? new Date(item.NGAYKETTHUC).toLocaleDateString("vi-VN") : "N/A"}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleStatus(item)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                        >
                          {isActive ? 'Đang hoạt động' : 'Đã tắt'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 font-medium mr-4">Sửa</button>
                        <button onClick={() => handleDelete(item.MAKHUYENMAI)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Không tìm thấy dữ liệu khuyến mãi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mã khuyến mãi <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    readOnly={!!editingId}
                    value={formData.MAKHUYENMAI} 
                    onChange={e => setFormData({...formData, MAKHUYENMAI: e.target.value})}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4154F1] ${editingId ? 'bg-slate-100' : ''}`}
                    placeholder="VD: KM10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Chi tiết <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={formData.MACHITETKHOAN} 
                    onChange={e => setFormData({...formData, MACHITETKHOAN: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4154F1]"
                    placeholder="VD: Giảm 10% tổng hóa đơn"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      required
                      value={formData.NGAYBATDAU} 
                      onChange={e => setFormData({...formData, NGAYBATDAU: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4154F1]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      required
                      value={formData.NGAYKETTHUC} 
                      onChange={e => setFormData({...formData, NGAYKETTHUC: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4154F1]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="checkbox-status"
                    checked={formData.TRANGTHAI} 
                    onChange={e => setFormData({...formData, TRANGTHAI: e.target.checked})}
                    className="w-4 h-4 text-[#4154F1] rounded cursor-pointer"
                  />
                  <label htmlFor="checkbox-status" className="text-sm font-bold text-slate-700 cursor-pointer">Kích hoạt ngay</label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">Hủy</button>
                <button type="submit" className="px-5 py-2 text-white bg-[#4154F1] hover:bg-blue-700 rounded-lg font-medium shadow transition-colors">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
