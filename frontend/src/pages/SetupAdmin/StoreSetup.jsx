import React, { useEffect, useState, useRef } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardNav from "../../components/DashboardNav";
import * as Icons from "../../assets/icons/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToggleSwitch = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    className={`w-11 h-6 rounded-full flex items-center cursor-pointer transition-colors duration-300 flex-shrink-0 ${checked ? "bg-[#00a651]" : "bg-gray-300"}`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </div>
);

function StoreSetup() {
  // State quản lý Tab đang được chọn ở Menu trái
  const [activeTab, setActiveTab] = useState("hang-hoa");

  // State lưu trữ cấu hình
  const [settings, setSettings] = useState({
    giaVonTrungBinh: true,
    hangHoaThuocTinh: false,
    dinhLuongNguyenLieu: true,
    nhanGoiMon: true,
    khoaThoiGianGiaoDich: true,
    blockTinhGio: false,
    lamTronTien: false,
    khuyenMai: true,
    datBanTruoc: true,
  });

  const [subSettings, setSubSettings] = useState({
    soPhutBlock: 15,
    kieuLamTron: "round",
  });

  const [qrInfo, setQrInfo] = useState({
    bankBin: "970436",
    accountNumber: "",
    accountName: "",
  });

  const [storeInfo, setStoreInfo] = useState({
    diaChiTruyCap: "",
    tenCuaHang: "",
    dienThoai: "",
    diaChi: "",
    email: "",
  });

  const logoInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      setLogoPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setStoreInfo((prev) => ({ ...prev, anhDaiDien: reader.result }));
      };
    }
  };

  const API_URL = "http://localhost:5000/api/store-settings";

  const fetchStoreSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success) {
        const db = result.data;
        setSettings({
          giaVonTrungBinh: db.GIAVON_TRUNGBINH,
          hangHoaThuocTinh: db.HANGHOA_THUOCTHINH,
          dinhLuongNguyenLieu: db.DINHLUONG_NGUYENLIEU,
          nhanGoiMon: db.NHAN_GOIMON,
          khoaThoiGianGiaoDich: db.KHOA_THOIGIAN_GIAODICH,
          blockTinhGio: db.BLOCK_TINHGIO,
          lamTronTien: db.LAMTRON_TIEN,
          khuyenMai: db.KHUYENMAI,
          datBanTruoc: db.DATBAN_TRUOC,
        });

        // Bơm dữ liệu vào Dropdown
        setSubSettings({
          soPhutBlock: db.SOPHUT_BLOCK,
          kieuLamTron: db.KIEU_LAMTRON,
        });

        // Bơm dữ liệu QR
        setQrInfo({
          bankBin: db.NGANHANG_BIN || "970436",
          accountNumber: db.SOTAIKHOAN || "",
          accountName: db.TENTAIKHOAN || "",
        });

        // Bơm thông tin cửa hàng
        setStoreInfo({
          diaChiTruyCap: db.DIACHI_TRUYCAP || "",
          tenCuaHang: db.TENCUAHANG || "",
          dienThoai: db.SDT || "",
          diaChi: db.DIACHI || "",
          email: db.EMAIL || "",
        });

        if (db.ANHDAIDIEN) {
          setLogoPreview(db.ANHDAIDIEN);
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ khi lấy dữ liệu!", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchStoreSettings();
  }, []);

  // 2. LƯU DỮ LIỆU XUỐNG DATABASE KHI BẤM NÚT
  const handleSaveSettings = async () => {
    const id = toast.loading("Đang lưu cấu hình...");
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...settings,
        ...subSettings,
        ...qrInfo,
        ...storeInfo,
      };

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        toast.update(id, {
          render: "Lỗi Server, vui lòng liên hệ Admin!",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      const result = await response.json();
      if (result.success) {
        toast.update(id, {
          render: "Đã lưu thông tin cửa hàng!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(id, {
          render: "Lỗi: " + result.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(
        id,
        {
          render: "Không thể kết nối đến máy chủ!",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        },
        error,
      );
    }
  };

  // Hàm đổi trạng thái công tắc (Toggle)
  const handleToggle = async (key) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...settings,
        ...subSettings,
        ...qrInfo,
        ...storeInfo,
        [key]: newValue,
      };

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error("Lỗi khi lưu tự động: " + result.message);
        // Nếu lỗi thì gạt công tắc trả về vị trí cũ
        setSettings((prev) => ({ ...prev, [key]: !newValue }));
      } else {
        toast.success("Đã lưu", {
          position: "bottom-right",
          autoClose: 1000,
          hideProgressBar: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Lỗi auto-save:", error);
      toast.error("Mất kết nối! Không thể lưu cài đặt.");
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      <ToastContainer position="top-right" />
      <DashboardHeader />
      <DashboardNav />
      <div className="flex flex-1 overflow-hidden justify-center p-4 md:p-6 lg:p-8">
        <div className="flex w-full max-w-[1600px] bg-white rounded-md shadow-sm border border-gray-200 h-full overflow-hidden">
          {/* CỘT TRÁI: SIDEBAR MENU */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col pt-4 overflow-y-auto shrink-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
            {/* Nhóm Thiết lập quản lý */}
            <div className="mb-4">
              <h3 className="px-5 text-xl font-bold text-gray-700 mb-2">
                Thiết lập quản lý
              </h3>
              <ul>
                <li
                  className={`px-2 py-2.5 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${
                    activeTab === "hang-hoa"
                      ? "border-[#00a651] bg-green-50 text-[#00a651] font-medium"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("hang-hoa")}
                >
                  <i className="fa-solid fa-box w-5 text-center"></i>
                  Hàng hóa
                </li>
                <li
                  className={`px-2 py-2.5 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${
                    activeTab === "giao-dich"
                      ? "border-[#00a651] bg-green-50 text-[#00a651] font-medium"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("giao-dich")}
                >
                  <i className="fa-solid fa-cart-shopping w-5 text-center"></i>
                  Giao dịch
                </li>
              </ul>
            </div>

            {/* Nhóm Tích hợp thanh toán */}
            <div className="mb-4">
              <h3 className="px-5 text-xl font-bold text-gray-700 mb-2">
                Tích hợp thanh toán
              </h3>
              <ul>
                <li
                  className={`px-2 py-2.5 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${activeTab === "qr-code" ? "border-[#00a651] bg-green-50 text-[#00a651] font-medium" : "border-transparent text-gray-600 hover:bg-gray-50"}`}
                  onClick={() => setActiveTab("qr-code")}
                >
                  <i className="fa-solid fa-qrcode w-5 text-center"></i>
                  Thanh toán QR code
                </li>
              </ul>
            </div>

            {/* Nhóm Thiết lập cửa hàng */}
            <div className="mb-4">
              <h3 className="px-5 text-xl font-bold text-gray-700  mb-2">
                Thiết lập cửa hàng
              </h3>
              <ul>
                <li
                  className={`px-2 py-2.5 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${
                    activeTab === "thong-tin"
                      ? "border-[#00a651] bg-green-50 text-[#00a651] font-medium"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("thong-tin")}
                >
                  <i className="fa-solid fa-store w-5 text-center"></i>
                  Thông tin cửa hàng
                </li>
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG THIẾT LẬP */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 w-full min-h-full">
              {/* TAB 1: HÀNG HÓA */}
              {activeTab === "hang-hoa" && (
                <div className="animate-fadeIn">
                  <div className="text-xl p-4 border-b border-gray-200 font-bold text-gray-800">
                    Hàng hóa
                  </div>
                  <div className="p-0">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-tag text-[#00a651] text-lg w-6 text-center"></i>
                        <div>
                          <p className="font-medium text-gray-700">
                            Giá vốn trung bình
                          </p>
                          <p className="text-xs text-gray-400">
                            Giá vốn được tính theo phương pháp trung bình tỷ
                            trọng
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={settings.giaVonTrungBinh}
                        onChange={() => handleToggle("giaVonTrungBinh")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-layer-group text-[#00a651] text-lg w-6 text-center"></i>
                        <p className="font-medium text-gray-700">
                          Hàng hóa có thuộc tính (Size, Màu...)
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={settings.hangHoaThuocTinh}
                        onChange={() => handleToggle("hangHoaThuocTinh")}
                      />
                    </div>
                    {/* TÍNH NĂNG MỚI BỔ SUNG CHO BIDA */}
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-blender text-[#00a651] text-lg w-6 text-center"></i>
                        <div>
                          <p className="font-medium text-gray-700">
                            Quản lý định lượng nguyên vật liệu
                          </p>
                          <p className="text-xs text-gray-400">
                            Cho phép trừ kho nguyên liệu khi bán món pha chế/nấu
                            ăn
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={settings.dinhLuongNguyenLieu}
                        onChange={() => handleToggle("dinhLuongNguyenLieu")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GIAO DỊCH */}
              {activeTab === "giao-dich" && (
                <div className="animate-fadeIn">
                  <div className="text-xl p-4 border-b border-gray-200 font-bold text-gray-800">
                    Giao dịch
                  </div>
                  <div className="p-0">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-bell-concierge text-[#00a651] text-lg w-6 text-center"></i>
                        <p className="font-medium text-gray-700">
                          Nhận gọi món
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={settings.nhanGoiMon}
                        onChange={() => handleToggle("nhanGoiMon")}
                      />
                    </div>

                    {/* LOGIC BLOCK TÍNH GIỜ */}
                    <div
                      className={`p-4 border-b border-gray-100 transition-colors ${settings.blockTinhGio ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-stopwatch text-[#00a651] text-lg w-6 text-center"></i>
                          <p className="font-medium text-gray-700">
                            Tùy chỉnh Block tính giờ tự động
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.blockTinhGio}
                          onChange={() => handleToggle("blockTinhGio")}
                        />
                      </div>
                      {/* HIỂN THỊ CHI TIẾT NẾU ĐƯỢC BẬT */}
                      {settings.blockTinhGio && (
                        <div className="mt-4 ml-9 p-3 border-l-2 border-[#00a651] bg-white rounded-sm shadow-sm flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Thời gian 1 Block:
                          </span>
                          <select
                            className="border border-gray-300 rounded outline-none p-1 text-sm text-gray-700"
                            value={subSettings.soPhutBlock}
                            onChange={(e) =>
                              setSubSettings({
                                ...subSettings,
                                soPhutBlock: e.target.value,
                              })
                            }
                          >
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút</option>
                            <option value={60}>60 phút</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* LOGIC LÀM TRÒN TIỀN */}
                    <div
                      className={`p-4 border-b border-gray-100 transition-colors ${settings.lamTronTien ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-coins text-[#00a651] text-lg w-6 text-center"></i>
                          <p className="font-medium text-gray-700">
                            Làm tròn tiền thanh toán
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.lamTronTien}
                          onChange={() => handleToggle("lamTronTien")}
                        />
                      </div>
                      {settings.lamTronTien && (
                        <div className="mt-4 ml-9 p-3 border-l-2 border-[#00a651] bg-white rounded-sm shadow-sm flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Quy tắc làm tròn (Đến hàng nghìn):
                          </span>
                          <select
                            className="border border-gray-300 rounded outline-none p-1 text-sm text-gray-700"
                            value={subSettings.kieuLamTron}
                            onChange={(e) =>
                              setSubSettings({
                                ...subSettings,
                                kieuLamTron: e.target.value,
                              })
                            }
                          >
                            <option value="round">
                              Tự động (= 500đ làm tròn lên)
                            </option>
                            <option value="ceil">Luôn làm tròn lên</option>
                            <option value="floor">
                              Luôn làm tròn xuống (Cắt bỏ)
                            </option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-calendar-check text-[#00a651] text-lg w-6 text-center"></i>
                        <p className="font-medium text-gray-700">
                          Đặt bàn trước
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={settings.datBanTruoc}
                        onChange={() => handleToggle("datBanTruoc")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: THANH TOÁN QR CODE */}
              {activeTab === "qr-code" && (
                <div className="animate-fadeIn">
                  <div className=" text-xl p-4 border-b border-gray-200 font-bold text-gray-800 flex justify-between items-center">
                    <span>Thanh toán QR Code</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">
                      Auto Generate
                    </span>
                  </div>
                  <div className="p-6 flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-1/2">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngân hàng thụ hưởng:
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-sm px-3 py-2 outline-none focus:border-[#00a651] bg-white appearance-none"
                          value={qrInfo.bankBin}
                          onChange={(e) =>
                            setQrInfo({ ...qrInfo, bankBin: e.target.value })
                          }
                        >
                          <option value="970436">Vietcombank</option>
                          <option value="970422">MB Bank</option>
                          <option value="970415">VietinBank</option>
                          <option value="970407">Techcombank</option>
                          <option value="970416">ACB</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số tài khoản:
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập số tài khoản..."
                          className="w-full border border-gray-300 rounded-sm px-3 py-2 outline-none focus:border-[#00a651]"
                          value={qrInfo.accountNumber}
                          onChange={(e) =>
                            setQrInfo({
                              ...qrInfo,
                              accountNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên chủ tài khoản:
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tên tài khoản"
                          className="w-full border border-gray-300 rounded-sm px-3 py-2 outline-none focus:border-[#00a651]"
                          value={qrInfo.accountName}
                          onChange={(e) =>
                            setQrInfo({
                              ...qrInfo,
                              accountName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button
                        onClick={handleSaveSettings}
                        className="bg-[#00a651] hover:bg-[#008d45] text-white px-6 py-2 rounded-sm font-medium transition-colors"
                      >
                        Cập nhật VietQR
                      </button>
                    </div>

                    {/* Hiển thị tự động QR Code mà không cần upload */}
                    <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {qrInfo.accountNumber.length > 4 ? (
                        <div className="text-center">
                          <img
                            src={`https://img.vietqr.io/image/${qrInfo.bankBin}-${qrInfo.accountNumber}-compact2.png?accountName=${qrInfo.accountName}`}
                            alt="VietQR"
                            className="w-56 h-56 object-contain rounded-md bg-white border shadow-sm mx-auto"
                          />
                          <p className="text-xs text-gray-500 mt-3">
                            Mã QR tự động cập nhật theo thông tin nhập
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <i className="fa-solid fa-qrcode text-6xl mb-2"></i>
                          <p className="text-sm">
                            Vui lòng nhập Số tài khoản
                            <br />
                            để tạo mã QR
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: THÔNG TIN CỬA HÀNG */}
              {activeTab === "thong-tin" && (
                <div className="animate-fadeIn">
                  <div className="text-xl p-4 border-b border-gray-200 font-bold text-gray-800">
                    Thông tin cửa hàng
                  </div>
                  <div className="p-8 flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-1/4 flex flex-col items-center">
                      {/* THẺ INPUT FILE ĐƯỢC GIẤU ĐI */}
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                      />

                      <div
                        onClick={() => logoInputRef.current.click()}
                        className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-3 overflow-hidden relative group"
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <i className="fa-regular fa-image text-gray-400 text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <span className="text-[#00a651] text-sm font-medium">
                              Tải ảnh lên
                            </span>
                          </>
                        )}
                        {logoPreview && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-camera text-white text-2xl mb-1"></i>
                            <span className="text-white text-xs">Đổi Logo</span>
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-700 mb-1">
                        Logo cửa hàng
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        Lưu ý: Ảnh không được vượt quá 2MB
                      </span>
                    </div>

                    {/* Cột Form */}
                    <div className="w-full md:w-3/4">
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <label className="w-32 text-sm text-gray-700 font-medium shrink-0">
                            Địa chỉ truy cập
                          </label>
                          <input
                            type="text"
                            value={storeInfo.diaChiTruyCap}
                            readOnly
                            title="Không thể tự đổi địa chỉ truy cập"
                            className="flex-1 border border-gray-300 rounded-sm px-3 py-2 outline-none focus:border-[#00a651] bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="w-32 text-sm text-gray-700 font-medium shrink-0">
                            Tên cửa hàng
                          </label>
                          <input
                            type="text"
                            value={storeInfo.tenCuaHang}
                            onChange={(e) =>
                              setStoreInfo({
                                ...storeInfo,
                                tenCuaHang: e.target.value,
                              })
                            }
                            className="flex-1 border border-gray-300 rounded-sm px-3 py-1.5 outline-none focus:border-[#00a651]"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="w-32 text-sm text-gray-700 font-medium shrink-0">
                            Điện thoại
                          </label>
                          <input
                            type="text"
                            value={storeInfo.dienThoai}
                            onChange={(e) =>
                              setStoreInfo({
                                ...storeInfo,
                                dienThoai: e.target.value,
                              })
                            }
                            className="flex-1 border border-gray-300 rounded-sm px-3 py-1.5 outline-none focus:border-[#00a651]"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="w-32 text-sm text-gray-700 font-medium shrink-0">
                            Email liên hệ
                          </label>
                          <input
                            type="email"
                            value={storeInfo.email}
                            onChange={(e) =>
                              setStoreInfo({
                                ...storeInfo,
                                email: e.target.value,
                              })
                            }
                            className="flex-1 border border-gray-300 rounded-sm px-3 py-1.5 outline-none focus:border-[#00a651]"
                          />
                        </div>
                        <div className="flex items-start gap-4">
                          <label className="w-32 text-sm text-gray-700 font-medium shrink-0 pt-2">
                            Địa chỉ cửa hàng
                          </label>
                          <textarea
                            rows="2"
                            value={storeInfo.diaChi}
                            onChange={(e) =>
                              setStoreInfo({
                                ...storeInfo,
                                diaChi: e.target.value,
                              })
                            }
                            className="flex-1 border border-gray-300 rounded-sm px-3 py-2 outline-none focus:border-[#00a651] resize-none"
                          ></textarea>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveSettings}
                          className="bg-[#4d70d6] hover:bg-blue-600 text-white px-4 py-2 rounded-sm font-medium transition-colors text-sm flex justify-center items-center gap-2 text-[16px]"
                        >
                          <img
                            src={Icons.Save}
                            alt="Lưu"
                            className="w-6 h-6 brightness-0 invert"
                          />{" "}
                          Lưu thông tin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSetup;
