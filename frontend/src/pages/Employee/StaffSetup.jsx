import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import SetupModel from "../../components/SetupModel";
import * as Icons from "../../assets/icons/index";

function StaffSetup() {
  const [openModalId, setOpenModalId] = useState(null);
  const [subModal, setSubModal] = useState(null); 
  const [nestedModal, setNestedModal] = useState(null); 
  const [currentStep, setCurrentStep] = useState(1);

  // 1. STATE ĐỒNG BỘ MẢNG TRỐNG: Không gán cứng tên NV nữa
  const [employees, setEmployees] = useState([]);
  
  // 2. STATE CA LÀM VIỆC MẶC ĐỊNH
  const [shifts, setShifts] = useState([
    { name: "Ca sáng", in: "08:00", out: "12:00", total: "4h" },
    { name: "Ca chiều", in: "13:00", out: "17:00", total: "4h" },
    { name: "Ca tối", in: "18:00", out: "22:00", total: "4h" }
  ]);

  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [employeeConfigs, setEmployeeConfigs] = useState({});
  const [attendance, setAttendance] = useState({ fingerprint: false, qr: false });

  const setupSteps = [
    { id: 1, title: "Thêm nhân viên", desc: "Bắt đầu thêm hồ sơ của nhân viên để quản lý hiệu quả.", btnText: "Thêm nhân viên" },
    { id: 2, title: "Tạo ca làm việc", desc: "Tạo các ca làm việc trong cửa hàng ( ví dụ : Ca sáng 8:00 - 12:00 ).", btnText: "Tạo ca" },
    { id: 3, title: "Xếp lịch làm việc", desc: "Xếp lịch làm việc cho nhân viên, tự động tạo lịch và hỗ trợ lập tuần.", btnText: "Xếp lịch" },
    { id: 4, title: "Hình thức chấm công", desc: "Chọn hình thức chấm công của cửa hàng (Dấu vân tay, Mã QR).", btnText: "Thiết lập" },
    { id: 5, title: "Thiết lập lương", desc: "Cấu hình các mục được ghi nhận lương, thưởng, phụ cấp.", btnText: "Thiết lập" },
    { id: 6, title: "Thiết lập bảng lương", desc: "Theo dõi chính xác và tự động tính lương của nhân viên.", btnText: "Tạo bảng lương" },
  ];
  
  const handleAddSchedule = (newSchedule) => {
    setSchedules([...schedules, newSchedule]);
    setSubModal(null); 
  };

  const handleUpdateSetting = (nvId, type, data) => {
    setEmployeeConfigs(prev => ({
      ...prev,
      [nvId]: { ...prev[nvId], [type]: data }
    }));
    setSubModal(null); 
  };

  // --- LOGIC BƯỚC 1: XỬ LÝ THÊM NHÂN VIÊN ---
  const handleAddNewEmployee = () => {
    if (newEmpName.trim() !== "") {
      const newId = "NV" + Math.floor(100000 + Math.random() * 900000).toString().substring(1);
      setEmployees([...employees, { id: newId, name: newEmpName }]);
      setNewEmpName("");
      setNewEmpPhone("");
    }
  };

  const handleSaveStep1 = () => {
    // Nếu đang nhập dở mà bấm Lưu thì tự động thêm luôn
    if (newEmpName.trim() !== "") {
      handleAddNewEmployee();
    }
    handleCompleteStep(1);
  };

  // --- LOGIC BƯỚC 2: XỬ LÝ CA LÀM VIỆC ĐỘNG ---
  const handleAddShift = () => {
    setShifts([...shifts, { name: "Ca mới", in: "00:00", out: "00:00", total: "0h" }]);
  };

  const handleShiftChange = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  const handleDeleteShift = (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    setShifts(updatedShifts);
  };

  const handleCompleteStep = (stepId) => {
    if (stepId === currentStep && currentStep <= 6) {
      setCurrentStep(currentStep + 1);
    }
    setOpenModalId(null);
  };

  const renderSalaryCell = (nv, typeKey) => {
    const config = employeeConfigs[nv.id]?.[typeKey];
    if (config) {
      return (
        <td className="p-3" onClick={() => setSubModal({ type: typeKey, nv })}>
          <div className="cursor-pointer group">
            <div className="text-[13px] text-gray-800 font-medium group-hover:text-blue-600">{config.title}</div>
            <div className="text-[12px] text-gray-500 group-hover:text-blue-500">{config.subtitle}</div>
          </div>
        </td>
      );
    }
    return (
      <td 
        className="p-3 text-center text-gray-400 hover:text-blue-600 cursor-pointer font-bold text-lg" 
        onClick={() => setSubModal({ type: typeKey, nv })}
      >
        +
      </td>
    );
  };

  const renderModalContent = () => {
    switch (openModalId) {
      case 1:
        return (
          <>
            <div className="p-6">
              {/* Hiển thị danh sách nhân viên đã thêm để dễ theo dõi */}
              {employees.length > 0 && (
                <div className="mb-4">
                  <div className="text-[13px] font-bold text-gray-700 mb-2">Danh sách đã thêm:</div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                    {employees.map(emp => (
                      <div key={emp.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-md">
                        <span className="text-[13px] font-medium text-gray-800">{emp.name}</span>
                        <span className="text-[12px] text-gray-500">{emp.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
                <h3 className="font-bold text-gray-800 text-[14px] mb-4">Nhập thông tin nhân viên mới</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-medium">Tên nhân viên</label>
                    <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Nhập họ và tên..." className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 bg-white text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-medium">Số điện thoại</label>
                    <input type="text" value={newEmpPhone} onChange={e => setNewEmpPhone(e.target.value)} placeholder="Nhập SĐT..." className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 bg-white text-[13px]" />
                  </div>
                </div>
              </div>
              <button onClick={handleAddNewEmployee} className="text-blue-600 hover:text-blue-800 font-medium text-[13px] flex items-center gap-1 cursor-pointer">
                + Thêm nhân viên
              </button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setOpenModalId(null)} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer text-[13px] font-medium">Bỏ qua</button>
              <button onClick={handleSaveStep1} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Lưu và Tiếp tục</button>
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="p-6 bg-white">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr><th className="p-3 rounded-tl-md">Tên ca</th><th className="p-3">Giờ vào</th><th className="p-3">Giờ ra</th><th className="p-3">Tổng giờ làm</th><th className="p-3 rounded-tr-md"></th></tr>
                </thead>
                <tbody>
                  {/* Render mảng shifts và liên kết value với onChange */}
                  {shifts.map((shift, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 pr-3">
                        <input type="text" value={shift.name} onChange={(e) => handleShiftChange(idx, 'name', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                      </td>
                      <td className="py-3 pr-3">
                        <input type="time" value={shift.in} onChange={(e) => handleShiftChange(idx, 'in', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                      </td>
                      <td className="py-3 pr-3">
                        <input type="time" value={shift.out} onChange={(e) => handleShiftChange(idx, 'out', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                      </td>
                      <td className="py-3 text-gray-700">{shift.total}</td>
                      <td className="py-3 text-right">
                        <img src={Icons.Delete} onClick={() => handleDeleteShift(idx)} alt="delete" className="w-5 h-5 inline-block opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleAddShift} className="text-blue-600 hover:text-blue-800 font-medium text-[13px] flex items-center gap-1 mt-4 cursor-pointer">
                + Thêm ca
              </button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => handleCompleteStep(2)} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Lưu và Tiếp tục</button>
            </div>
          </>
        );

      case 3:
        const days = ["Thứ hai 30", "Thứ ba 31", "Thứ tư 1", "Thứ năm 2", "Thứ sáu 3", "Thứ bảy 4", "Chủ nhật 5"];
        return (
          <>
            <div className="p-6 overflow-x-auto bg-white min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 border border-gray-300 w-max rounded-md bg-white">
                <button className="px-2 py-1.5 hover:bg-gray-100 border-r border-gray-300 cursor-pointer">&lt;</button>
                <span className="px-3 text-[13px] font-medium">Tuần 5 - Th. 3 2026</span>
                <button className="px-2 py-1.5 hover:bg-gray-100 border-l border-gray-300 cursor-pointer">&gt;</button>
              </div>
              <table className="w-full text-left border-collapse border border-gray-200 text-[13px]">
                <thead className="bg-white text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="p-4 border-r font-semibold min-w-[120px]">Nhân viên</th>
                    {days.map((day, idx) => {
                      const parts = day.split(" ");
                      const number = parts.pop(); 
                      const dayName = parts.join(" "); 
                      return (
                        <th key={idx} className="p-4 border-r text-center font-normal">
                          <span className="text-gray-500 mr-2">{dayName}</span>
                          <span className="text-gray-800 font-bold">{number}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 italic">Chưa có dữ liệu nhân viên. Vui lòng quay lại Bước 1 để thêm.</td>
                    </tr>
                  ) : (
                    employees.map((nv) => (
                      <tr key={nv.id} className="border-b border-gray-200 h-[72px]">
                        <td className="p-4 border-r">
                          <div className="font-bold text-gray-800">{nv.name}</div>
                          <div className="text-gray-500 text-xs">{nv.id}</div>
                        </td>
                        {days.map((day, idx) => {
                          const hasSchedule = schedules.find(s => s.nvId === nv.id && s.date === day);
                          return (
                            <td key={idx} className="p-4 border-r align-top text-center group transition-colors hover:bg-gray-50">
                              {hasSchedule ? (
                                <div className="bg-[#ffe5f4] text-[#d63384] text-[13px] font-bold px-3 py-2 rounded-md text-left w-full shadow-sm cursor-pointer">
                                  {hasSchedule.shiftName}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setSubModal({ type: 'them_lich', nv: nv, date: day })}
                                  className="text-blue-600 hover:text-blue-800 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity font-medium cursor-pointer w-full h-full min-h-[40px]"
                                >
                                  + Thêm lịch
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => handleCompleteStep(3)} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Xong</button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
                <input 
                  type="checkbox" 
                  checked={attendance.fingerprint} 
                  onChange={(e) => setAttendance({...attendance, fingerprint: e.target.checked})} 
                  className="w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer" 
                />
                <div>
                  <div className="font-bold text-gray-800 text-[14px]">Chấm công bằng Dấu vân tay</div>
                  <div className="text-gray-500 text-[13px]">Hệ thống sẽ ghi nhận dữ liệu chấm công qua thiết bị quét vân tay tại cửa hàng.</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
                <input 
                  type="checkbox" 
                  checked={attendance.qr} 
                  onChange={(e) => setAttendance({...attendance, qr: e.target.checked})} 
                  className="w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer" 
                />
                <div>
                  <div className="font-bold text-gray-800 text-[14px]">Chấm công bằng Mã QR</div>
                  <div className="text-gray-500 text-[13px]">Nhân viên sử dụng điện thoại để quét mã QR định danh dán tại cửa hàng để điểm danh.</div>
                </div>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => handleCompleteStep(4)} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Lưu</button>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <div className="p-6 min-h-[300px]">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input type="text" placeholder="Tìm kiếm nhân viên" className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                  <img src={Icons.Search} alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                </div>
                <select className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-[13px] outline-none bg-white"><option>Chọn chi nhánh</option></select>
                <select className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-[13px] outline-none bg-white"><option>Tất cả loại lương</option></select>
              </div>
              <div className="border border-gray-200 rounded-md overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-center">STT</th>
                      <th className="p-3">Nhân viên</th>
                      <th className="p-3 w-[16%]">Lương chính</th>
                      <th className="p-3 w-[16%]">Làm thêm</th>
                      <th className="p-3 w-[16%]">Thưởng</th>
                      <th className="p-3 w-[16%]">Phụ cấp</th>
                      <th className="p-3 w-[16%]">Giảm trừ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-500 italic">Chưa có dữ liệu. Vui lòng thêm nhân viên ở bước 1.</td></tr>
                    ) : (
                      employees.map((nv, idx) => (
                        <tr key={nv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-center">{idx + 1}</td>
                          <td className="p-3">
                            <div className="text-gray-800 font-medium">{nv.name}</div>
                            <div className="text-gray-400 text-xs">{nv.id}</div>
                          </td>
                          {renderSalaryCell(nv, 'luong_chinh')}
                          {renderSalaryCell(nv, 'lam_them')}
                          {renderSalaryCell(nv, 'thuong')}
                          {renderSalaryCell(nv, 'phu_cap')}
                          {renderSalaryCell(nv, 'giam_tru')}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => handleCompleteStep(5)} className="px-6 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Xong</button>
            </div>
          </>
        );

      case 6:
        return (
          <>
            <div className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-1 block text-xs font-bold text-gray-700 mb-1.5">
                  Ngày bắt đầu kỳ lương hàng tháng 
                  <img src={Icons.Delete} alt="info" className="w-3.5 h-3.5 opacity-50" />
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 bg-white text-[13px]"><option>Ngày 1</option><option>Ngày 5</option></select>
              </div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Kỳ hạn trả lương</label><select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 bg-white text-[13px]"><option>Hàng tháng</option><option>Hàng tuần</option></select></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Kỳ làm việc</label><select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 bg-white text-[13px]"><option>01/04/2026 - 30/04/2026</option></select></div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => handleCompleteStep(6)} className="px-5 py-2 bg-[#0066ff] hover:bg-blue-600 text-white rounded-md cursor-pointer text-[13px] font-bold shadow-sm">Tạo bảng lương</button>
            </div>
          </>
        );

      default: return null;
    }
  };

  const progressPercent = Math.min(((currentStep - 1) / 6) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[13px]">
      <DashboardHeader />
      <DashboardNav activeTab="Nhân viên" />

      <main className="max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Thiết lập nhân viên</h1>

        <section className="w-full bg-white rounded-lg shadow-sm min-h-[500px] p-0">
          <div className="animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Khởi tạo</h2>
                <p className="text-gray-500 text-[13px]">Chỉ vài bước cài đặt để quản lý nhân viên hiệu quả, tối ưu vận hành và tính lương chính xác</p>
              </div>
              <div className="flex items-center gap-3 w-40">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0066ff] transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="text-gray-400 font-bold text-sm">{Math.min(currentStep - 1, 6)}/6</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {setupSteps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isLocked = step.id > currentStep;

                return (
                  <div key={step.id} className={`flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0 transition-opacity duration-300 ${isLocked ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                    <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full mt-0.5 text-xs font-bold transition-colors ${isCompleted ? 'bg-white border-2 border-green-500 text-green-500' : isCurrent ? 'bg-[#0066ff] text-white' : 'bg-gray-300 text-white'}`}>
                      {isCompleted ? '✓' : step.id}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-[14px] ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>{step.title}</h3>
                      <p className="text-gray-500 text-[13px] mt-0.5">{step.desc}</p>
                    </div>
                    <button onClick={() => setOpenModalId(step.id)} disabled={isLocked} className={`px-4 py-1.5 border rounded-md font-bold text-[13px] shadow-sm transition-colors ${isCompleted ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer' : isCurrent ? 'border-[#0066ff] text-[#0066ff] bg-white hover:bg-blue-50 cursor-pointer' : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'}`}>
                      {step.btnText}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {openModalId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{setupSteps.find(s => s.id === openModalId)?.title}</h2>
              <button onClick={() => setOpenModalId(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none font-bold cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="overflow-y-auto bg-gray-50/50 relative">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT SETUP MODEL */}
      <SetupModel 
        subModal={subModal} 
        setSubModal={setSubModal} 
        nestedModal={nestedModal} 
        setNestedModal={setNestedModal} 
        onAddSchedule={handleAddSchedule}
        onUpdateSetting={handleUpdateSetting}
        shifts={shifts}
      />

    </div>
  );
}

export default StaffSetup;