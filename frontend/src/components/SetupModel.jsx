import React, { useState } from "react";
import * as Icons from "../assets/icons/index"; 

function SetupModel({ subModal, setSubModal, nestedModal, setNestedModal, onAddSchedule, onUpdateSetting, shifts }) {
  
  const formatComma = (val) => {
    if (!val) return "";
    let rawValue = val.toString().replace(/[^0-9]/g, "");
    if (rawValue) {
      return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return "";
  };

  const [luongChinh, setLuongChinh] = useState("1,000,000");
  const [selectedShift, setSelectedShift] = useState(null);
  const [thuongVal, setThuongVal] = useState("0");
  const [thuongType, setThuongType] = useState("% Doanh thu");
  const [showThuongPopover, setShowThuongPopover] = useState(false);

  const [phuCap, setPhuCap] = useState("500,000");
  const [giamTru, setGiamTru] = useState("50,000");

  const [phuCapList, setPhuCapList] = useState([]);
  const [giamTruList, setGiamTruList] = useState([]);

  const [newPhuCapName, setNewPhuCapName] = useState("");
  const [newPhuCapType, setNewPhuCapType] = useState("Phụ cấp hàng tháng cố định");
  const [newPhuCapAmount, setNewPhuCapAmount] = useState("");
  const [newPhuCapFormat, setNewPhuCapFormat] = useState("VND");

  const [newGiamTruName, setNewGiamTruName] = useState("");
  const [newGiamTruType, setNewGiamTruType] = useState("Đi muộn");
  const [newGiamTruAmount, setNewGiamTruAmount] = useState("");

  const handleSaveNewPhuCap = () => {
    const newRow = {
      id: Date.now(),
      name: newPhuCapName || "Phụ cấp mới",
      type: newPhuCapType,
      amount: newPhuCapAmount || "0",
      format: newPhuCapFormat
    };
    setPhuCapList([...phuCapList, newRow]);
    setNestedModal(null);
    setNewPhuCapName("");
    setNewPhuCapAmount("");
  };

  const handleSaveNewGiamTru = () => {
    const newRow = {
      id: Date.now(),
      name: newGiamTruName || "Giảm trừ mới",
      type: newGiamTruType,
      amount: newGiamTruAmount || "0"
    };
    setGiamTruList([...giamTruList, newRow]);
    setNestedModal(null);
    setNewGiamTruName("");
    setNewGiamTruAmount("");
  };

  return (
    <>
      {/* 1.1. THÊM LỊCH LÀM VIỆC */}
      {subModal?.type === 'them_lich' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Thêm lịch làm việc</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">{subModal.nv?.name || "Nhân viên"} <span className="mx-2 text-gray-300">|</span> {subModal.date || "Ngày"}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-[14px] text-gray-800">Chọn ca làm việc</h3>
                  <button onClick={() => setNestedModal('them_ca')} className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer">+</button>
                </div>
                
                <div className="bg-gray-50/50 border border-gray-200 rounded-md p-4 grid grid-cols-2 gap-y-4 gap-x-6 max-h-[200px] overflow-y-auto shadow-inner">
                  {(shifts || []).map((shift, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="ca_lam" 
                        onChange={() => setSelectedShift(shift)}
                        className="w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer rounded border-gray-300" 
                      />
                      <div>
                        <div className="font-medium text-[13px] text-gray-800 group-hover:text-blue-600 transition-colors">{shift.name}</div>
                        <div className="text-[12px] text-gray-500">{shift.in} - {shift.out}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button onClick={() => setSubModal(null)} className="px-5 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-[13px] hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
              <button 
                onClick={() => {
                  if (onAddSchedule && subModal?.nv && subModal?.date) {
                    onAddSchedule({
                      nvId: subModal.nv.id,
                      date: subModal.date,
                      shiftName: selectedShift ? selectedShift.name : (shifts?.[0]?.name || "Ca sáng")
                    });
                  }
                }} 
                className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md font-bold text-[13px] shadow-sm cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1.2. LƯƠNG CHÍNH */}
      {subModal?.type === 'luong_chinh' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Lương chính</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">Nhân viên: {subModal.nv.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <label className="w-24 text-[13px] font-medium text-gray-700">Loại lương</label>
                <div className="flex-1 flex items-center gap-2">
                  <select className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px] bg-white cursor-pointer">
                    <option>Theo ca làm việc</option>
                    <option>Theo tháng</option>
                  </select>
                  <img src={Icons.InfoIcon} alt="info" className="w-4 h-4 opacity-50 cursor-help" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-[13px] font-medium text-gray-700">Mức lương</label>
                <div className="flex-[0.5] flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500">
                  <input 
                    type="text" 
                    value={luongChinh}
                    onChange={(e) => setLuongChinh(formatComma(e.target.value))}
                    placeholder="Nhập mức lương"
                    className="w-full px-3 py-2 outline-none text-[13px] text-right" 
                  />
                  <span className="bg-gray-50 px-3 py-2 text-[13px] text-gray-500 border-l border-gray-300">/ ca</span>
                </div>
                <div className="flex-1 flex justify-end items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-[13px] text-gray-700">Thiết lập hệ số lương ngày nghỉ, lễ tết</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button className="text-blue-600 flex items-center gap-1 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">
                <img src={Icons.Delete} alt="delete" className="w-4 h-4 mr-1" /> Hủy thiết lập
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSubModal(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
                <button 
                  onClick={() => {
                    if (onUpdateSetting) {
                      onUpdateSetting(subModal.nv.id, 'luong_chinh', {
                        title: `${luongChinh || "0"} / ca`,
                        subtitle: 'Theo ca làm việc'
                      });
                    }
                  }} 
                  className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.3. LÀM THÊM GIỜ */}
      {subModal?.type === 'lam_them' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Lương làm thêm giờ</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">Nhân viên: {subModal.nv.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
                <div className="flex text-[13px] font-bold text-gray-700 px-4 py-2 border-b border-gray-200">
                  <div className="flex-1">Ngày làm việc</div>
                  <div className="flex-1">Hệ số lương trên giờ</div>
                </div>
                {[
                  { label: "Ngày thường", val: "150%" },
                  { label: "Thứ 7", val: "200%" },
                  { label: "Chủ nhật", val: "200%" },
                  { label: "Ngày nghỉ", val: "200%" },
                  { label: "Ngày lễ tết", val: "300%" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center px-4 py-2.5 border-b border-gray-100 last:border-0">
                    <div className="flex-1 text-[13px] text-gray-700">{row.label}</div>
                    <div className="flex-1">
                      <input type="text" defaultValue={row.val} className="w-full border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-blue-500 text-[13px] bg-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button className="text-blue-600 flex items-center gap-1 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">
                <img src={Icons.Delete} alt="delete" className="w-4 h-4 mr-1" /> Hủy thiết lập
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSubModal(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
                <button 
                  onClick={() => {
                    if (onUpdateSetting) {
                      onUpdateSetting(subModal.nv.id, 'lam_them', { title: '5 mức', subtitle: 'Ngày thường, Thứ 7...' });
                    }
                  }} 
                  className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.4. THƯỞNG */}
      {subModal?.type === 'thuong' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setShowThuongPopover(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Thưởng</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">Nhân viên: {subModal.nv.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1.5">Loại thưởng</label>
                  <select className="w-full border border-blue-500 rounded-md px-3 py-2 outline-none text-[13px] bg-white cursor-pointer text-blue-600 font-medium">
                    <option>Theo doanh thu cá nhân</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[13px] text-gray-700 mb-1.5">Hình thức <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px] bg-white cursor-pointer">
                    <option>Tính theo mức tổng doanh thu</option>
                    <option>Tính theo nấc bậc thang tổng doanh thu</option>
                    <option>Tính theo mức vượt doanh thu tối thiểu</option>
                  </select>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-visible">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-1/3">Loại hình</th>
                      <th className="p-3 w-1/3 flex items-center gap-1">Doanh thu <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50" /></th>
                      <th className="p-3">Thưởng</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3">Tư vấn bán hàng</td>
                      <td className="p-3">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500">
                          <span className="bg-gray-50 px-2 text-gray-500 border-r border-gray-300 h-full flex items-center">Từ</span>
                          <input type="text" defaultValue="0" className="w-full px-2 py-1.5 outline-none text-right" />
                        </div>
                      </td>
                      <td className="p-3 relative">
                        <div 
                          className="flex items-center border border-blue-400 rounded-md overflow-hidden cursor-pointer"
                          onClick={() => setShowThuongPopover(!showThuongPopover)}
                        >
                          <input 
                            type="text" 
                            readOnly 
                            value={`${thuongVal} ${thuongType}`} 
                            className="w-full px-2 py-1.5 outline-none cursor-pointer bg-white text-blue-600 font-medium" 
                          />
                        </div>

                        {showThuongPopover && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-[280px] z-[100]">
                            <div className="text-[13px] text-gray-700 font-medium mb-2">Hình thức thưởng</div>
                            <div className="flex items-center gap-4 mb-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={thuongType === 'VND'} onChange={() => setThuongType('VND')} className="accent-blue-600" />
                                <span className="text-[13px]">VND</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={thuongType === '% Doanh thu'} onChange={() => setThuongType('% Doanh thu')} className="accent-blue-600" />
                                <span className="text-[13px]">% Doanh thu</span>
                              </label>
                            </div>
                            <div className="text-[13px] text-gray-700 font-medium mb-1">Thưởng</div>
                            <input
                              type="text"
                              value={thuongVal}
                              onChange={(e) => setThuongVal(formatComma(e.target.value))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-4 outline-none focus:border-blue-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setShowThuongPopover(false)} className="px-4 py-1.5 border rounded-md text-gray-700 bg-white text-[13px] hover:bg-gray-50 cursor-pointer">Bỏ qua</button>
                              <button onClick={() => setShowThuongPopover(false)} className="px-4 py-1.5 bg-[#0066ff] text-white rounded-md text-[13px] font-medium hover:bg-blue-600 cursor-pointer">Xong</button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center"><button className="text-gray-400 hover:text-red-500 cursor-pointer"><img src={Icons.Delete} alt="delete" className="w-5 h-5 mx-auto" /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="text-blue-600 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">+ Thêm thưởng</button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 mt-10">
              <button className="text-blue-600 flex items-center gap-1 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">
                <img src={Icons.Delete} alt="delete" className="w-4 h-4 mr-1" /> Hủy thiết lập
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSubModal(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
                <button 
                  onClick={() => {
                    if (onUpdateSetting) {
                      onUpdateSetting(subModal.nv.id, 'thuong', {
                        title: `${thuongVal} ${thuongType}`,
                        subtitle: 'Theo doanh thu cá nhân'
                      });
                    }
                  }} 
                  className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.5. PHỤ CẤP */}
      {subModal?.type === 'phu_cap' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Phụ cấp</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">Nhân viên: {subModal.nv.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-1/4">Tên phụ cấp</th>
                      <th className="p-3 w-2/5">Loại phụ cấp</th>
                      <th className="p-3">Phụ cấp thụ hưởng</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1. Dòng form mặc định để ở trên cùng */}
                    <tr>
                      <td className="p-3">
                        <select 
                          onChange={(e) => { 
                            if(e.target.value === 'add') {
                              setNestedModal('add_phu_cap');
                              e.target.value = ''; 
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white cursor-pointer"
                        >
                          <option value="">Chọn Loại phụ cấp...</option>
                          <option value="add" className="text-blue-600 font-bold">+ Thêm loại phụ cấp</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <select className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white cursor-pointer">
                            <option>Phụ cấp cố định theo ngày</option>
                          </select>
                          <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" />
                        </div>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={phuCap}
                          onChange={(e) => setPhuCap(formatComma(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-right" 
                        />
                      </td>
                      <td className="p-3 text-center"><button className="text-gray-400 hover:text-red-500 cursor-pointer"><img src={Icons.Delete} alt="delete" className="w-5 h-5 mx-auto" /></button></td>
                    </tr>

                    {/* 2. Render các dòng phụ cấp đã thêm xếp xuống bên dưới */}
                    {phuCapList.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 bg-gray-50/30">
                        <td className="p-3 font-medium text-gray-800">{item.name}</td>
                        <td className="p-3 text-gray-600">{item.type}</td>
                        <td className="p-3 text-right font-medium text-gray-800">
                          {item.amount} {item.format === 'VND' ? 'đ' : '%'}
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => setPhuCapList(phuCapList.filter(p => p.id !== item.id))} className="text-gray-400 hover:text-red-500 cursor-pointer">
                            <img src={Icons.Delete} alt="delete" className="w-5 h-5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-blue-600 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">+ Thêm phụ cấp</button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button className="text-blue-600 flex items-center gap-1 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">
                <img src={Icons.Delete} alt="delete" className="w-4 h-4 mr-1" /> Hủy thiết lập
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSubModal(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
                <button 
                  onClick={() => {
                    if (onUpdateSetting) {
                      const finalAmount = phuCapList.length > 0 ? phuCapList[phuCapList.length - 1].amount : phuCap;
                      const finalTitle = phuCapList.length > 0 ? phuCapList[phuCapList.length - 1].name : 'Phụ cấp đi lại';

                      onUpdateSetting(subModal.nv.id, 'phu_cap', {
                        title: `${finalAmount || "0"} / tháng`,
                        subtitle: finalTitle
                      });
                    }
                  }} 
                  className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.6. GIẢM TRỪ */}
      {subModal?.type === 'giam_tru' && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Giảm trừ</h2>
                <p className="text-gray-500 text-[13px] mt-0.5">Nhân viên: {subModal.nv.name}</p>
              </div>
              <button onClick={() => setSubModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-1/4">Tên giảm trừ</th>
                      <th className="p-3 w-1/3">Loại giảm trừ</th>
                      <th className="p-3"></th>
                      <th className="p-3 w-1/4">Khoản giảm trừ</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1. Dòng form mặc định trên cùng */}
                    <tr>
                      <td className="p-3">
                        <select 
                          onChange={(e) => { 
                            if(e.target.value === 'add') {
                              setNestedModal('add_giam_tru');
                              e.target.value = ''; 
                            }
                          }}
                          className="w-full border border-blue-500 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white cursor-pointer text-blue-600 font-medium"
                        >
                          <option value="">Chọn Loại giảm...</option>
                          <option value="add" className="font-bold">+ Thêm loại giảm trừ</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white cursor-pointer">
                          <option>Đi muộn</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white cursor-pointer">
                          <option>Theo số lần</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={giamTru}
                          onChange={(e) => setGiamTru(formatComma(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-right" 
                        />
                      </td>
                      <td className="p-3 text-center"><button className="text-gray-400 hover:text-red-500 cursor-pointer"><img src={Icons.Delete} alt="delete" className="w-5 h-5 mx-auto" /></button></td>
                    </tr>

                    {/* 2. Render các dòng giảm trừ đã thêm xếp xuống bên dưới */}
                    {giamTruList.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 bg-gray-50/30">
                        <td className="p-3 font-medium text-gray-800">{item.name}</td>
                        <td className="p-3 text-gray-600">{item.type}</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right font-medium text-gray-800">{item.amount} đ</td>
                        <td className="p-3 text-center">
                          <button onClick={() => setGiamTruList(giamTruList.filter(g => g.id !== item.id))} className="text-gray-400 hover:text-red-500 cursor-pointer">
                            <img src={Icons.Delete} alt="delete" className="w-5 h-5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-blue-600 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">+ Thêm giảm trừ</button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button className="text-blue-600 flex items-center gap-1 font-medium text-[13px] hover:text-blue-800 transition-colors cursor-pointer">
                <img src={Icons.Delete} alt="delete" className="w-4 h-4 mr-1" /> Hủy thiết lập
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSubModal(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 shadow-sm cursor-pointer">Bỏ qua</button>
                <button 
                  onClick={() => {
                    if (onUpdateSetting) {
                      const finalAmount = giamTruList.length > 0 ? giamTruList[giamTruList.length - 1].amount : giamTru;
                      const finalTitle = giamTruList.length > 0 ? giamTruList[giamTruList.length - 1].name : 'Đi Trễ';

                      onUpdateSetting(subModal.nv.id, 'giam_tru', {
                        title: `${finalAmount || "0"} / lần`,
                        subtitle: finalTitle
                      });
                    }
                  }} 
                  className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RENDER NESTED MODAL (CẤP 3: Thêm mới phụ cấp / giảm trừ nằm trên cùng) */}
      {/* ========================================================================= */}

      {/* 2.1. THÊM CA LÀM VIỆC */}
      {nestedModal === 'them_ca' && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold text-gray-900">Thêm ca làm việc</h2>
              <button onClick={() => setNestedModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <label className="w-40 text-[13px] text-gray-700 font-medium">Tên</label>
                <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px]" />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-[13px] text-gray-700 font-medium flex items-center gap-1">Giờ làm việc <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="time" className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-[13px] flex-1" />
                  <span className="text-[13px] text-gray-500">Đến</span>
                  <input type="time" className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-[13px] flex-1" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-[13px] text-gray-700 font-medium flex items-center gap-1">Giờ cho phép chấm công <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="time" className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-[13px] flex-1" />
                  <span className="text-[13px] text-gray-500">Đến</span>
                  <input type="time" className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 text-[13px] flex-1" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setNestedModal(null)} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium text-[13px] cursor-pointer shadow-sm">Bỏ qua</button>
              <button onClick={() => setNestedModal(null)} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md font-bold text-[13px] cursor-pointer shadow-sm">Lưu</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 2.2. THÊM MỚI PHỤ CẤP */}
      {nestedModal === 'add_phu_cap' && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold text-gray-900">Thêm mới loại phụ cấp</h2>
              <button onClick={() => setNestedModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tên phụ cấp</label>
                <input 
                  type="text" 
                  value={newPhuCapName}
                  onChange={(e) => setNewPhuCapName(e.target.value)}
                  placeholder="Nhập tên phụ cấp" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px]" 
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Loại phụ cấp</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newPhuCapType === 'Phụ cấp cố định theo ngày'} onChange={() => setNewPhuCapType('Phụ cấp cố định theo ngày')} className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">Phụ cấp cố định theo ngày <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newPhuCapType === 'Phụ cấp hàng tháng cố định'} onChange={() => setNewPhuCapType('Phụ cấp hàng tháng cố định')} className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">Phụ cấp hàng tháng cố định <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newPhuCapType === 'Phụ cấp hàng tháng tính trên số ngày công chuẩn'} onChange={() => setNewPhuCapType('Phụ cấp hàng tháng tính trên số ngày công chuẩn')} className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">Phụ cấp hàng tháng tính trên số ngày công chuẩn <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phụ cấp thụ hưởng</label>
                  <input 
                    type="text" 
                    value={newPhuCapAmount}
                    onChange={(e) => setNewPhuCapAmount(formatComma(e.target.value))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px] text-right" 
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Hình thức thụ hưởng</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={newPhuCapFormat === 'VND'} onChange={() => setNewPhuCapFormat('VND')} className="w-4 h-4 accent-blue-600" />
                      <span className="text-[13px] text-gray-700">VND</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={newPhuCapFormat === '% Lương chính'} onChange={() => setNewPhuCapFormat('% Lương chính')} className="w-4 h-4 accent-blue-600" />
                      <span className="text-[13px] text-gray-700">% Lương chính</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setNestedModal(null)} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium text-[13px] cursor-pointer">Bỏ qua</button>
              <button onClick={handleSaveNewPhuCap} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md font-bold text-[13px] cursor-pointer">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* 2.3. THÊM LOẠI GIẢM TRỪ */}
      {nestedModal === 'add_giam_tru' && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold text-gray-900">Thêm loại giảm trừ</h2>
              <button onClick={() => setNestedModal(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tên loại giảm trừ</label>
                <input 
                  type="text" 
                  value={newGiamTruName}
                  onChange={(e) => setNewGiamTruName(e.target.value)}
                  placeholder="Nhập tên loại giảm trừ" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px]" 
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Loại giảm trừ</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newGiamTruType === 'Đi muộn'} onChange={() => setNewGiamTruType('Đi muộn')} className="w-4 h-4 accent-blue-600" />
                    <span className="text-[13px] text-gray-700">Đi muộn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newGiamTruType === 'Về sớm'} onChange={() => setNewGiamTruType('Về sớm')} className="w-4 h-4 accent-blue-600" />
                    <span className="text-[13px] text-gray-700">Về sớm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newGiamTruType === 'Cố định'} onChange={() => setNewGiamTruType('Cố định')} className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">Cố định <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Điều kiện</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dk" defaultChecked className="w-4 h-4 accent-blue-600" />
                    <span className="text-[13px] text-gray-700">Theo số lần</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dk" className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">
                      Theo block 
                      <input type="text" defaultValue="1" className="w-12 border border-gray-300 rounded px-2 py-1 outline-none text-[13px] text-center ml-1 mr-1" />
                      phút <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help ml-1" />
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dk" className="w-4 h-4 accent-blue-600" />
                    <span className="flex items-center gap-1 text-[13px] text-gray-700">Theo hệ số lương <img src={Icons.InfoIcon} alt="info" className="w-3.5 h-3.5 opacity-50 cursor-help" /></span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Khoản giảm trừ</label>
                <input 
                  type="text" 
                  value={newGiamTruAmount}
                  onChange={(e) => setNewGiamTruAmount(formatComma(e.target.value))}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 text-[13px] text-right" 
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setNestedModal(null)} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium text-[13px] cursor-pointer">Bỏ qua</button>
              <button onClick={handleSaveNewGiamTru} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md font-bold text-[13px] cursor-pointer">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SetupModel;