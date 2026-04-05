import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import * as Icons from "../assets/icons/index";

function Cashier() {
  const [leftTab, setLeftTab] = useState("tables");
  const [tableFilter, setTableFilter] = useState("all"); // 'all', 'occupied', 'empty'
  const [openMenuOnSelect, setOpenMenuOnSelect] = useState(false);

  // --- LOGIC THỜI GIAN REAL-TIME ---
  const [startTimeByTable, setStartTimeByTable] = useState({}); // { tableId: "HH:mm" }
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // 1s cập nhật 1 lần cho chuẩn xác tuyệt đối
    return () => clearInterval(timer);
  }, []);

  // Hàm format chuỗi giờ bắt đầu thành HH:mm:ss để hiển thị và xử lý
  const formatStartTime = (timeStr) => {
    if (!timeStr) return "";
    // Nếu là định dạng ISO (ví dụ: 1900-01-01T15:30:00.000Z)
    if (timeStr.includes("T")) {
      const timePart = timeStr.split("T")[1]; // lấy "15:30:00.000Z"
      return timePart.split(".")[0]; // lấy "15:30:00"
    }
    // Nếu là HH:mm, thêm :00 vào cuối
    if (timeStr.length === 5) return timeStr + ":00";
    return timeStr.slice(0, 8); // HH:mm:ss
  };

  // Hàm tính số giây đã chơi
  const getDurationInSeconds = (startTimeStr) => {
    if (!startTimeStr) return 0;
    const cleanTime = formatStartTime(startTimeStr);
    const [h, m, s] = cleanTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    
    const start = new Date(currentTime);
    start.setHours(h, m, s || 0, 0);

    if (start > currentTime) {
      const diffHours = (start - currentTime) / 3600000;
      if (diffHours > 12) {
        start.setDate(start.getDate() - 1);
      } else {
        return 0;
      }
    }

    return Math.floor((currentTime - start) / 1000);
  };

  // Hàm format số giây thành "H:mm:ss"
  const formatDuration = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Bảng danh sách bàn (trạng thái khởi đầu: tất cả trống - sẽ được cậ nhật từ DB)
  const [tables, setTables] = useState([
    { id: 1, name: "Bàn 1", maban: "B001", status: "empty" },
    { id: 2, name: "Bàn 2", maban: "B002", status: "empty" },
    { id: 3, name: "Bàn 3", maban: "B003", status: "empty" },
    { id: 4, name: "Bàn 4", maban: "B004", status: "empty" },
    { id: 5, name: "Bàn 5", maban: "B005", status: "empty" },
    { id: 6, name: "Bàn 6", maban: "B006", status: "empty" },
    { id: 7, name: "Bàn 7", maban: "B007", status: "empty" },
    { id: 8, name: "Bàn 8", maban: "B008", status: "empty" },
    { id: 9, name: "Bàn 9", maban: "B009", status: "empty" },
    { id: 10, name: "Bàn 10", maban: "B010", status: "empty" },
    { id: 11, name: "Bàn 11", maban: "B011", status: "empty" },
    { id: 12, name: "Bàn 12", maban: "B012", status: "empty" },
    { id: 13, name: "Bàn 13", maban: "B013", status: "empty" },
  ]);

  const menuCategories = [
    "Tất cả",
    "Hàng hóa",
    "Thức ăn",
    "Đồ uống",
    "Thuốc lá",
    "Dịch vụ",
  ];
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const [menuItems, setMenuItems] = useState([]);

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // --- LOGIC KHUYẾN MÃI ---
  const [discountsList, setDiscountsList] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountByTable, setDiscountByTable] = useState({});

  // --- LOGIC CHUYỂN BÀN ---
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetTableId, setTargetTableId] = useState(null);

  // --- LOGIC HÓA ĐƠN (DB) ---
  const [billIdByTable, setBillIdByTable] = useState({}); // { tableId: 'HD001' }

  useEffect(() => {
    // Load cả danh sách KM và các hóa đơn đang chơi
    const init = async () => {
      try {
        // 1. Lấy khuyến mãi
        const discRes = await axios.get("http://localhost:5000/api/discounts");
        if (discRes.data.success) {
          setDiscountsList(discRes.data.data.filter((d) => d.TRANGTHAI));
        }

        // 1b. Lấy danh sách hàng hóa từ CSDL
        const prodRes = await axios.get("http://localhost:5000/api/products");
        let mappedItems = [];
        if (Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          mappedItems = prodRes.data.map(item => ({
            id: item.MAHANGHOA,
            name: item.TENHANGHOA,
            price: item.DONGIABAN,
            category: item.NHOMHANG || "Hàng hóa",
            image: item.HINHANH || ""
          }));
        } else {
          mappedItems = [
            { id: "HH001", name: "Nước suối Lavie 500ml", price: 10000, category: "Hàng hóa", image: "" },
            { id: "HH002", name: "Coca Cola lon 330ml", price: 15000, category: "Hàng hóa", image: "" },
            { id: "HH003", name: "Bia Tiger lon 330ml", price: 25000, category: "Hàng hóa", image: "" },
            { id: "HH004", name: "Snack Pringles", price: 35000, category: "Hàng hóa", image: "" },
            { id: "108", name: "Bàn lỗ (Giờ)", price: 55000, category: "Dịch vụ", image: "" },
          ];
        }
        setMenuItems(mappedItems);

        // 2. Phục hồi các phiên bàn đang chơi từ DB
        const activeRes = await axios.get("http://localhost:5000/api/bills/active");
        if (activeRes.data.success && activeRes.data.data.length > 0) {
          const activeBills = activeRes.data.data;
          const newOrders = {};
          const newBillIds = {};
          const newOpenTabs = [];
          const newDiscounts = {};
          const newStartTimes = {};

          activeBills.forEach(bill => {
            // Tìm bàn tương ứng theo MABAN (B001, B002...)
            const tableNum = parseInt(bill.MABAN.replace('B', ''), 10);
            newOrders[tableNum] = (bill.items || []).map(item => ({
              id: item.MAHANGHOA,
              name: item.TENHANGHOA || item.MAHANGHOA,
              qty: item.SOLUONG,
              price: Number(item.DONGIA),
            }));
            newBillIds[tableNum] = bill.MAHOADON;
            newStartTimes[tableNum] = bill.GIOBATDAU;
            newOpenTabs.push({ id: tableNum, name: `Bàn ${tableNum}` });
            if (bill.MAKHUYENMAI) {
              const km = discRes.data.data.find(d => d.MAKHUYENMAI === bill.MAKHUYENMAI);
              if (km) newDiscounts[tableNum] = km;
            }
          });

          // Cập nhật trạng thái bàn dựa trên danh sách billIds đã lọc
          setTables(prev => prev.map(t => ({
            ...t,
            status: newBillIds[t.id] ? 'occupied' : 'empty'
          })));

          setOrdersByTable(prev => ({ ...prev, ...newOrders }));
          setBillIdByTable(newBillIds);
          setStartTimeByTable(newStartTimes);
          setOpenTabs(newOpenTabs);
          if (Object.keys(newDiscounts).length > 0) setDiscountByTable(newDiscounts);
          if (newOpenTabs.length > 0) setActiveTabId(newOpenTabs[0].id);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo Cashier:", error);
      }
    };
    init();
  }, []);

  const handleApplyDiscount = (discount) => {
    if (!activeTabId) return;
    setDiscountByTable((prev) => ({ ...prev, [activeTabId]: discount }));
    setShowDiscountModal(false);
  };

  const clearDiscount = () => {
    if (!activeTabId) return;
    setDiscountByTable((prev) => {
      const clone = { ...prev };
      delete clone[activeTabId];
      return clone;
    });
  };

  const handleTableClick = async (table) => {
    const isAlreadyOpen = openTabs.find((t) => t.id === table.id);
    if (!isAlreadyOpen) {
      setOpenTabs([...openTabs, { id: table.id, name: table.name }]);
      // Tạo hóa đơn mới trong DB nếu chưa có
      if (!billIdByTable[table.id]) {
        try {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
          const res = await axios.post("http://localhost:5000/api/bills/open", {
            MABAN: table.maban || `B${String(table.id).padStart(3, "0")}`,
            GIOBATDAU: null, // ĐỂ TRỐNG GIỜ KHI MỚI MỞ BÀN
            NGAY: now.toISOString().slice(0, 10),
          });
          if (res.data.success) {
            setBillIdByTable((prev) => ({
              ...prev,
              [table.id]: res.data.MAHOADON,
            }));
            // KHÔNG setStartTimeByTable ở ĐÂY NỮA
            
            // CẬP NHẬT TRẠNG THÁI BÀN TRÊN SƠ ĐỒ
            setTables((prev) =>
              prev.map((t) =>
                t.id === table.id ? { ...t, status: "occupied" } : t,
              ),
            );
          } else {
            alert(
              "Không thể tạo hóa đơn trên DB: " +
                (res.data.message || "Lỗi không xác định"),
            );
          }
        } catch (err) {
          console.error("Lỗi tạo hóa đơn:", err);
          alert("Lỗi kết nối server khi mở bàn. Vui lòng kiểm tra lại backend!");
        }
      }
    }
    setActiveTabId(table.id);
    if (openMenuOnSelect) {
      setLeftTab("menu");
    }
  };

  const handleTransferTable = async () => {
    if (!activeTabId || !targetTableId) return;

    // Lấy ID hóa đơn hiện tại
    const billId = billIdByTable[activeTabId];
    if (!billId) {
      alert("Không tìm thấy thông tin hóa đơn cho bàn này để chuyển!");
      return;
    }

    const sourceId = activeTabId;
    const destId = targetTableId;
    const targetTableObj = tables.find((t) => t.id === destId);

    if (!targetTableObj) {
      alert("Không tìm thấy thông tin bàn đích!");
      return;
    }

    try {
      // 1. Cập nhật DB trước: Đổi MABAN trong HOADON
      const newMaban = targetTableObj.maban || `B${String(destId).padStart(3, '0')}`;
      const res = await axios.put(`http://localhost:5000/api/bills/${billId}/transfer`, { MABAN: newMaban });
      
      if (!res.data.success) {
        throw new Error("Backend không cho phép chuyển bàn");
      }

      // 2. Cập nhật State Frontend sau khi DB đã OK
      
      // Chuyển Orders
      setOrdersByTable((prev) => {
        const next = { ...prev };
        next[destId] = prev[sourceId] || [];
        delete next[sourceId];
        return next;
      });

      // Chuyển Khuyến Mãi
      setDiscountByTable((prev) => {
        const next = { ...prev };
        if (prev[sourceId]) {
          next[destId] = prev[sourceId];
          delete next[sourceId];
        }
        return next;
      });

      // Chuyển Bill ID
      setBillIdByTable((prev) => {
        const next = { ...prev };
        next[destId] = billId;
        delete next[sourceId];
        return next;
      });

      // Chuyển Start Time
      setStartTimeByTable((prev) => {
        const next = { ...prev };
        if (prev[sourceId]) {
          next[destId] = prev[sourceId];
          delete next[sourceId];
        }
        return next;
      });

      // Đổi trạng thái hiển thị của các bàn trên sơ đồ
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === sourceId) return { ...t, status: "empty" };
          if (t.id === destId) return { ...t, status: "occupied" };
          return t;
        }),
      );

      // Cập nhật danh sách Tab
      setOpenTabs((prev) =>
        prev.map((tab) =>
          tab.id === sourceId
            ? { id: destId, name: targetTableObj.name }
            : tab,
        ),
      );

      // Chuyển tiêu điểm sang bàn mới
      setActiveTabId(destId);
      
      alert(`Đã chuyển thành công từ Bàn ${sourceId} sang ${targetTableObj.name}`);

    } catch (err) {
      console.error('Lỗi chuyển bàn:', err);
      alert('Lỗi khi chuyển bàn: ' + (err.response?.data?.message || err.message));
    } finally {
      setShowTransferModal(false);
      setTargetTableId(null);
    }
  };

  const handleCloseTab = (e, tableId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((t) => t.id !== tableId);
    setOpenTabs(newTabs);
    if (activeTabId === tableId) {
      setActiveTabId(
        newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
      );
    }
  };

  const [ordersByTable, setOrdersByTable] = useState({});

  // Sync món ăn xuống DB mỗi khi thay đổi
  const syncItemsToDB = async (tableId, updatedItems) => {
    const billId = billIdByTable[tableId];
    if (!billId) return;
    try {
      await axios.put(`http://localhost:5000/api/bills/${billId}/items`, { items: updatedItems });
    } catch (err) {
      console.error('Lỗi sync món:', err);
    }
  };

  const currentOrderItems = ordersByTable[activeTabId] || [];

  const handleDeleteItem = (itemId) => {
    const updated = (ordersByTable[activeTabId] || []).filter((item) => item.id !== itemId);
    setOrdersByTable((prev) => ({ ...prev, [activeTabId]: updated }));
    syncItemsToDB(activeTabId, updated);
  };

  const updateQuantity = (itemId, delta) => {
    const updated = (ordersByTable[activeTabId] || []).map((item) => {
      if (item.id === itemId) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setOrdersByTable((prev) => ({ ...prev, [activeTabId]: updated }));
    syncItemsToDB(activeTabId, updated);
  };

  const handleAddItemToBill = (item) => {
    if (!activeTabId) {
      alert("Vui lòng chọn bàn ở tab 'Phòng bàn' trước khi gọi món!");
      return;
    }

    const currentOrders = ordersByTable[activeTabId] || [];
    const existingItem = currentOrders.find((i) => i.id === item.id);
    let updated;
    
    // Nếu là món Bàn lỗ (Giờ), hiện giá 55k ở Menu nhưng vào Hóa đơn thì ép về 0đ 
    // để hệ thống chỉ tính tiền theo thời gian chơi thực tế (Tiền giờ).
    const finalItem = String(item.id) === "108" ? { ...item, price: 0 } : item;

    if (existingItem) {
      updated = currentOrders.map((i) => i.id === finalItem.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      updated = [...currentOrders, { ...finalItem, qty: 1 }];
    }
    setOrdersByTable((prev) => ({ ...prev, [activeTabId]: updated }));
    syncItemsToDB(activeTabId, updated);
    setTables(
      tables.map((t) => (t.id === activeTabId ? { ...t, status: "occupied" } : t)),
    );

    // KÍCH HOẠT GIỜ NẾU CHỌN MÓN "BÀN LỖ (GIỜ)" (Mã 108)
    if (String(item.id) === "108" && !startTimeByTable[activeTabId]) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
      setStartTimeByTable((prev) => ({ ...prev, [activeTabId]: timeStr }));

      // Đồng bộ giờ bắt đầu lên DB
      const billId = billIdByTable[activeTabId];
      if (billId) {
        axios
          .patch(`http://localhost:5000/api/bills/${billId}/start`, {
            GIOBATDAU: timeStr,
          })
          .catch((err) => console.error("Lỗi kích hoạt giờ:", err));
      }
    }
  };

  const handleCheckout = async () => {
    const billId = billIdByTable[activeTabId];
    if (!billId || currentOrderItems.length === 0) return;
    if (!window.confirm(`Xác nhận thanh toán bàn này?\nTổng tiền: ${finalTotal.toLocaleString()}đ`)) return;
    try {
      const now = new Date();
      await axios.put(`http://localhost:5000/api/bills/${billId}/checkout`, {
        GIOKETTHUC: now.toTimeString().slice(0, 5),
        TONGTIENGIO: timePrice,
        TONGTIENHANG: rawTotal,
        MAKHUYENMAI: discountByTable[activeTabId]?.MAKHUYENMAI || null,
        TONGTHANHTOAN: finalTotal,
      });
      // Reset trạng thái bàn
      setTables((prev) => prev.map((t) => t.id === activeTabId ? { ...t, status: 'empty' } : t));
      setOrdersByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setBillIdByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setDiscountByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setStartTimeByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      // Đóng tab
      const newTabs = openTabs.filter(t => t.id !== activeTabId);
      setOpenTabs(newTabs);
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      alert('Thanh toán thành công!');
    } catch (err) {
      console.error('Lỗi thanh toán:', err);
      alert('Thanh toán thất bại. Vui lòng thử lại!');
    }
  };

  const handleCancelTable = async () => {
    const billId = billIdByTable[activeTabId];
    if (!billId) return;

    if (!window.confirm(`Xác nhận HỦY BÀN này? Thao tác này sẽ xóa mọi dữ liệu món ăn hiện tại và không thể hoàn tác.`)) return;

    try {
      await axios.put(`http://localhost:5000/api/bills/${billId}/cancel`);
      
      // Reset trạng thái bàn về trống
      setTables((prev) => prev.map((t) => t.id === activeTabId ? { ...t, status: 'empty' } : t));
      
      // Xóa dữ liệu session
      setOrdersByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setBillIdByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setDiscountByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });
      setStartTimeByTable((prev) => { const c = { ...prev }; delete c[activeTabId]; return c; });

      // Đóng tab bàn hiện tại
      const newTabs = openTabs.filter(t => t.id !== activeTabId);
      setOpenTabs(newTabs);
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);

      alert('Đã hủy bàn thành công!');
    } catch (err) {
      console.error('Lỗi hủy bàn:', err);
      alert('Có lỗi xảy ra khi hủy bàn!');
    }
  };

  const getDiscountAmount = (rawTotal) => {
    if (!activeTabId || !discountByTable[activeTabId]) return 0;
    const discount = discountByTable[activeTabId];
    // Đọc hiểu câu chữ theo yêu cầu (Regex trích xuất số đi kèm dấu %)
    const detail = discount.MACHITETKHOAN || discount.MACHITIETKHUYENMAI || "";
    const percentMatch = detail.match(/(\d+)\s*%/);
    if (percentMatch) {
      const percentage = parseInt(percentMatch[1], 10);
      return (rawTotal * percentage) / 100;
    }
    return 0; // Nếu không có % thì giảm 0đ (Các trường hợp "Tặng 1 nước")
  };

  const rawTotal = currentOrderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  // Tính tiền giờ (55.000 / 60 phút)
  const activeStartTime = startTimeByTable[activeTabId];
  const durationSeconds = getDurationInSeconds(activeStartTime);
  const hourlyRate = 55000;
  const timePrice = Math.round(((durationSeconds / 60) / 60) * hourlyRate);

  const discountAmount = getDiscountAmount(rawTotal + timePrice);
  const finalTotal = rawTotal + timePrice - discountAmount;

  const isTableEmpty = currentOrderItems.length === 0;

  // Tính toán số lượng bàn cho UI
  const totalTablesCount = tables.length;
  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;
  const emptyTablesCount = tables.filter(t => t.status === 'empty').length;

  // Lọc danh sách bàn để hiển thị
  const displayTables = tables.filter(t => {
    if (tableFilter === 'occupied') return t.status === 'occupied';
    if (tableFilter === 'empty') return t.status === 'empty';
    return true;
  });

  const filteredMenuItems =
    activeCategory === "Tất cả"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="h-screen flex flex-col font-sans text-[13px] bg-[#e9ecf4] overflow-hidden">
      {/* ---------------- HEADER ---------------- */}
      <header className="h-12 bg-[#2a3f85] flex justify-between items-center px-4 shrink-0 text-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="logo"
            className="w-12 h-12 object-contain shrink-0"
          />
          <span className="font-bold text-[18px] uppercase tracking-wide">
            Billiards Lục Lợi
          </span>
        </div>
        <div className="flex items-center">
          <span className="cursor-pointer hover:text-gray-200 flex items-center gap-2 font-medium bg-[#1e2d61] px-4 py-1.5 rounded-full transition-colors">
            <img
              src={Icons.User}
              alt="user"
              className="w-5 h-5 filter brightness-0 invert"
            />
            [Tên Tài Khoản]
          </span>
        </div>
      </header>

      {/* ---------------- MAIN WORKSPACE ---------------- */}
      <main className="flex-1 flex overflow-hidden">
        {/* --- CỘT TRÁI: ĐỘNG (PHÒNG BÀN / THỰC ĐƠN) --- */}
        <section className="flex-[5.5] flex flex-col h-full border-r border-gray-300 bg-white">
          {/* SỬA LẠI Ở ĐÂY: Thêm thanh Search theo hình */}
          <div className="flex justify-between items-end bg-[#0066ff] px-2 pt-2 shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => setLeftTab("tables")}
                className={`font-bold px-6 py-2 rounded-t-lg transition-colors cursor-pointer ${leftTab === "tables" ? "bg-white text-[#0066ff]" : "text-white hover:bg-blue-600"}`}
              >
                Phòng bàn
              </button>
              <button
                onClick={() => setLeftTab("menu")}
                className={`font-bold px-6 py-2 rounded-t-lg transition-colors cursor-pointer ${leftTab === "menu" ? "bg-white text-[#0066ff]" : "text-white hover:bg-blue-600"}`}
              >
                Thực đơn
              </button>
            </div>

            {/* THANH SEARCH */}
            <div className="relative mb-1.5 mr-2">
              <input
                type="text"
                className="bg-transparent border border-white/50 text-white rounded pr-8 pl-3 py-1 text-xs outline-none focus:border-white w-[250px] transition-colors placeholder-white/60"
              />
              <img
                src={Icons.Search}
                alt="search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 filter brightness-0 invert opacity-80"
              />
            </div>
          </div>

          <div className="p-4 flex flex-col h-full bg-[#f4f6f8]">
            {leftTab === "tables" ? (
              /* ====== CHẾ ĐỘ 1: PHÒNG BÀN ====== */
              <>
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setTableFilter('all')}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors ${tableFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Tất cả ({totalTablesCount})
                    </button>
                    <button 
                      onClick={() => setTableFilter('occupied')}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors ${tableFilter === 'occupied' ? 'bg-[#ff922b] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Đang sử dụng ({occupiedTablesCount})
                    </button>
                    <button 
                      onClick={() => setTableFilter('empty')}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors ${tableFilter === 'empty' ? 'bg-[#20c997] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Còn trống ({emptyTablesCount})
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={openMenuOnSelect}
                      onChange={(e) => setOpenMenuOnSelect(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    Mở thực đơn khi chọn bàn
                  </label>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                  <div className="grid grid-cols-4 gap-6">
                    {displayTables.map((table) => {
                      const isSelected = table.id === activeTabId;
                      const isOccupied = table.status === "occupied";
                      let bgClass = "bg-white text-black border-gray-400";
                      if (isSelected)
                        bgClass =
                          "bg-[#0066ff] text-white border-blue-700 shadow-blue-500/50";
                      else if (isOccupied)
                        bgClass = "bg-[#4dabf7] text-black border-blue-400";

                      return (
                        <div
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`relative w-full aspect-[4/3] rounded-3xl flex items-center justify-center font-bold text-[15px] cursor-pointer shadow-sm border-2 transition-all hover:scale-105 ${bgClass}`}
                        >
                          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-1 h-1/2 border-l-2 border-dashed border-gray-400"></div>
                          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-1 h-1/2 border-r-2 border-dashed border-gray-400"></div>
                          {table.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* ====== CHẾ ĐỘ 2: THỰC ĐƠN ====== */
              <div className="flex flex-col h-full">
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 shrink-0 pb-2 border-b border-gray-200">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-colors border shadow-sm cursor-pointer
                        ${activeCategory === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
                      `}
                    >
                      {cat}
                    </button>
                  ))}

                  <div className="ml-auto flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 shadow-sm">
                    <img
                      src={Icons.Search}
                      alt="search"
                      className="w-3 h-3 opacity-50"
                    />
                    <input
                      type="text"
                      placeholder="Tìm tên món..."
                      className="ml-2 outline-none text-xs w-[120px]"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddItemToBill(item)}
                        className="bg-white rounded-xl p-2 flex flex-col items-center cursor-pointer shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all active:scale-95 group"
                      >
                        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs overflow-hidden relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="opacity-50">Chưa có ảnh</span>
                          )}
                          <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg">
                              +
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800 text-center w-full truncate mb-1">
                          {item.name}
                        </span>
                        <span className="text-blue-600 font-bold">
                          {item.price.toLocaleString()}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- CỘT PHẢI: BILL THANH TOÁN --- */}
        <section className="flex-[4.5] bg-white flex flex-col h-full border-l-4 border-[#2a3f85]">
          {openTabs.length === 0 ? (
            <div className="flex-1 bg-[#f4f6f8] flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 mb-4 opacity-30">
                <img
                  src={Icons.Search}
                  alt="empty"
                  className="w-full h-full filter grayscale"
                />
              </div>
              <p className="text-base font-medium">
                Vui lòng chọn bàn để xem chi tiết
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end bg-[#0066ff] pt-2 px-2 shrink-0 overflow-x-auto no-scrollbar gap-1">
                {openTabs.map((tab) => {
                  const isActive = activeTabId === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`group flex items-center justify-between px-4 py-2 rounded-t-lg cursor-pointer min-w-[100px] max-w-[150px] transition-colors
                        ${isActive ? "bg-white text-[#0066ff] font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.05)]" : "bg-[#2a3f85] text-white hover:bg-blue-600"}
                      `}
                    >
                      <span className="truncate text-[13px]">{tab.name}</span>
                      <button
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className={`ml-2 w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold transition-opacity
                          ${isActive ? "text-gray-400 hover:bg-red-100 hover:text-red-500" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"}
                        `}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 p-3 bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="flex items-center gap-1 bg-[#ffc107] hover:bg-yellow-500 text-black font-bold px-3 py-1.5 rounded text-xs shadow-sm cursor-pointer transition-colors"
                >
                  <img
                    src={Icons.Discount}
                    alt="discount"
                    className="w-3 h-3"
                  />{" "}
                  Giảm giá
                </button>
                <button 
                  onClick={handleCancelTable}
                  disabled={!billIdByTable[activeTabId]}
                  className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${!billIdByTable[activeTabId] ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#ff6b6b] hover:bg-red-600 text-white cursor-pointer'}`}
                >
                  <img
                    src={Icons.Delete}
                    alt="cancel"
                    className="w-3 h-3 filter brightness-0 invert"
                  />{" "}
                  Hủy bàn
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="border-b-2 border-gray-300">
                      <th className="p-3 font-bold text-gray-800">Tên món</th>
                      <th className="p-3 font-bold text-gray-800 text-center w-24">
                        Số lượng
                      </th>
                      <th className="p-3 font-bold text-gray-800 text-right">
                        Đơn giá
                      </th>
                      <th className="p-3 font-bold text-gray-800 text-right pr-8">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrderItems.map((item) => (
                      <tr
                        key={item.id}
                        className="group border-b border-gray-200 cursor-pointer transition-colors hover:bg-[#d6e4ff]"
                      >
                        <td className="p-3 text-black font-medium">
                          {item.name}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, -1);
                              }}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-600 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-4 text-center">{item.qty}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, 1);
                              }}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-600 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {item.price.toLocaleString()}đ
                        </td>
                        <td className="p-3 text-right font-bold text-black relative pr-8">
                          {(item.price * item.qty).toLocaleString()}đ
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded cursor-pointer"
                            title="Xóa món"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {[...Array(Math.max(4, 6 - currentOrderItems.length))].map(
                      (_, i) => (
                        <tr
                          key={`empty-${i}`}
                          className="border-b border-gray-200 h-11"
                        >
                          <td colSpan="4"></td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-2 text-[14px]">
                <div className="flex justify-between text-gray-700">
                  <span>Giờ bắt đầu</span>
                  <span className="flex items-center gap-1">
                    <img
                      src={Icons.Clock}
                      alt="time"
                      className="w-4 h-4 opacity-70"
                    />
                    {formatStartTime(activeStartTime) || "--:--"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tổng giờ chơi</span>
                  <span className="font-medium text-[#0066ff]">
                    {activeStartTime ? formatDuration(durationSeconds) : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between text-blue-800 font-medium">
                  <span>Tiền giờ (55k/h)</span>
                  <span>{timePrice.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tổng món</span>
                  <span className="font-medium">
                    {currentOrderItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span className="flex items-center gap-2">
                    Giảm giá
                    {discountByTable[activeTabId] && (
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold border border-yellow-300">
                        {discountByTable[activeTabId].MAKHUYENMAI}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-500">
                      -{discountAmount.toLocaleString()}đ
                    </span>
                    {discountByTable[activeTabId] && (
                      <button
                        onClick={clearDiscount}
                        className="text-gray-400 hover:text-red-500 font-bold ml-1 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between font-bold text-[18px] text-black pt-2 border-t mt-2">
                  <span>Tổng tiền</span>
                  <div className="flex flex-col items-end">
                    {discountAmount > 0 && (
                      <span className="text-[12px] text-gray-400 line-through font-normal">
                        {rawTotal.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-blue-600">
                      {finalTotal.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white grid grid-cols-3 gap-2 shrink-0">
                <button
                  className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] ${isTableEmpty ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#4dabf7] hover:bg-blue-600 text-white cursor-pointer"}`}
                >
                  Báo bếp
                </button>
                <button
                  onClick={() => {
                    if (!isTableEmpty) setShowTransferModal(true);
                  }}
                  className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] ${isTableEmpty ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff922b] hover:bg-orange-600 text-white cursor-pointer"}`}
                >
                  Chuyển bàn
                </button>
                <button
                  onClick={handleCheckout}
                  className={`font-bold py-3.5 rounded-md shadow-sm transition-colors text-[14px] uppercase tracking-wide ${isTableEmpty ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#20c997] hover:bg-green-600 text-white cursor-pointer"}`}
                >
                  Thanh Toán
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      {/* --- MODAL CHỌN MÃ KHUYẾN MÃI --- */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden zoom-in-95">
            <div className="bg-[#2a3f85] px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Chọn Mã Khuyến Mãi</h2>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-white/70 hover:text-white font-bold text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {discountsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-medium">
                  Hiện không có chương trình khuyến mãi nào.
                </div>
              ) : (
                <div className="grid gap-3">
                  {discountsList.map((discount) => {
                    const detail =
                      discount.MACHITETKHOAN || discount.MACHITIETKHUYENMAI;
                    const isSelected =
                      discountByTable[activeTabId]?.MAKHUYENMAI ===
                      discount.MAKHUYENMAI;
                    return (
                      <div
                        key={discount.MAKHUYENMAI}
                        onClick={() => handleApplyDiscount(discount)}
                        className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md
                          ${isSelected ? "bg-blue-50 border-[#0066ff]" : "bg-white border-gray-200 hover:border-blue-300"}
                        `}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-300">
                              {discount.MAKHUYENMAI}
                            </span>
                            <span className="text-xs text-gray-500 border border-gray-200 px-2 rounded-full">
                              Đến{" "}
                              {new Date(
                                discount.NGAYKETTHUC,
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="font-bold text-[15px] text-gray-800">
                            {detail}
                          </p>
                        </div>

                        <div className="ml-4 shrink-0">
                          {isSelected ? (
                            <div className="bg-[#0066ff] text-white px-4 py-1.5 rounded-full text-xs font-bold">
                              Đang dùng
                            </div>
                          ) : (
                            <button className="border-2 border-[#0066ff] text-[#0066ff] hover:bg-[#0066ff] hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
                              Áp dụng
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHUYỂN BÀN --- */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#ff922b] px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Chuyển Bàn</h2>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTargetTableId(null);
                }}
                className="text-white/70 hover:text-white font-bold text-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Đang chuyển từ{" "}
                <span className="font-bold text-black">
                  {tables.find((t) => t.id === activeTabId)?.name}
                </span>{" "}
                sang bàn mới:
              </p>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chọn Bàn Đích{" "}
                  <span className="text-gray-400 font-normal">
                    (Chỉ hiển thị bàn trống)
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {tables.filter(
                    (t) => t.status === "empty" && t.id !== activeTabId,
                  ).length === 0 ? (
                    <div className="col-span-4 text-center text-red-500 text-sm py-4 bg-red-50 rounded-lg border border-red-200">
                      Hiện không còn bàn trống nào!
                    </div>
                  ) : (
                    tables
                      .filter(
                        (t) => t.status === "empty" && t.id !== activeTabId,
                      )
                      .map((table) => (
                        <button
                          key={table.id}
                          onClick={() => setTargetTableId(table.id)}
                          className={`py-3 px-1 text-center font-bold text-[12px] rounded-lg border-2 transition-all ${targetTableId === table.id ? "bg-[#ff922b] text-white border-[#ff922b] shadow-md scale-105" : "bg-white text-gray-700 border-gray-200 hover:border-[#ff922b] hover:text-[#ff922b]"}`}
                        >
                          {table.name}
                        </button>
                      ))
                  )}
                </div>
              </div>
              {targetTableId && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-800 font-medium">
                  Sẽ chuyển sang{" "}
                  <strong>
                    {tables.find((t) => t.id === targetTableId)?.name}
                  </strong>
                  . Toàn bộ món ăn và mã giảm giá (nếu có) sẽ được chuyển theo.
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTargetTableId(null);
                  }}
                  className="px-5 py-2 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleTransferTable}
                  disabled={!targetTableId}
                  className={`px-5 py-2 font-bold rounded-lg transition-colors shadow-sm ${!targetTableId ? "bg-orange-200 text-white cursor-not-allowed" : "bg-[#ff922b] hover:bg-orange-600 text-white cursor-pointer"}`}
                >
                  Xác nhận chuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cashier;
