import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import * as Icons from "../assets/icons/index";
import Swal from "sweetalert2";
import PrintBillModal from "../components/PrintBillModal";

function Cashier() {
  const navigate = useNavigate();
  const [leftTab, setLeftTab] = useState("tables");
  const [tableFilter, setTableFilter] = useState("all");
  const [openMenuOnSelect, setOpenMenuOnSelect] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBillData, setPrintBillData] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isManagerOrAdmin =
    currentUser.QUYENHAN === "Admin" || currentUser.QUYENHAN === "Quản lý";

  // --- LOGIC THỜI GIAN REAL-TIME ---
  const [startTimeByTable, setStartTimeByTable] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatStartTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("T")) {
      const timePart = timeStr.split("T")[1];
      return timePart.split(".")[0];
    }
    if (timeStr.length === 5) return timeStr + ":00";
    return timeStr.slice(0, 8);
  };

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

  const formatDuration = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const [storeSettings, setStoreSettings] = useState(null);
  const [tables, setTables] = useState([]);

  const [categories, setCategories] = useState(["Tất cả"]);

  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [menuItems, setMenuItems] = useState([]);
  const [searchMenuQuery, setSearchMenuQuery] = useState("");

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [ordersByTable, setOrdersByTable] = useState({});
  const [billIdByTable, setBillIdByTable] = useState({});
  const [discountsList, setDiscountsList] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountByTable, setDiscountByTable] = useState({});
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetTableId, setTargetTableId] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [customerPaid, setCustomerPaid] = useState("");
  const currentTableInfo = tables.find((t) => t.id === activeTabId);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [setRes, discRes, prodRes, catRes, tablesRes, activeRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/store-settings", config),
            axios.get("http://localhost:5000/api/discounts", config),
            axios.get("http://localhost:5000/api/products", config),
            axios.get("http://localhost:5000/api/products/categories", config),
            axios.get("http://localhost:5000/api/tables", config),
            axios.get("http://localhost:5000/api/bills/active", config),
          ]);

        // --- 1. XỬ LÝ CÀI ĐẶT CỬA HÀNG ---
        if (setRes.data.success) setStoreSettings(setRes.data.data);

        // --- 2. XỬ LÝ KHUYẾN MÃI ---
        let fetchedDiscounts = [];
        if (discRes.data.success) {
          fetchedDiscounts = discRes.data.data.filter((d) => d.TRANGTHAI);
          setDiscountsList(fetchedDiscounts);
        }

        // --- 3. XỬ LÝ DANH SÁCH MÓN ĂN ---
        if (Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          const mappedItems = prodRes.data.map((item) => ({
            id: item.MAHANGHOA,
            name: item.TENHANGHOA,
            price: item.DONGIABAN,
            category: item.NHOMHANG || "Hàng hóa",
            image: item.HINHANH || "",
            tonKho: item.SOLUONGTONKHO || 0,
          }));
          setMenuItems(mappedItems);
        }

        // --- 4. XỬ LÝ DANH MỤC ---
        if (
          Array.isArray(catRes.data) ||
          (catRes.data && Array.isArray(catRes.data.data))
        ) {
          const rawCategories = Array.isArray(catRes.data)
            ? catRes.data
            : catRes.data.data;
          const catNames = rawCategories
            .map((c) => c.TENDANHMUC)
            .filter((name) => name !== "Tất cả" && name !== "ALL");
          setCategories(["Tất cả", ...catNames]);
        }

        // --- 5. XỬ LÝ SƠ ĐỒ BÀN  ---
        let baseTables = [];
        const rawTables = tablesRes.data.data || tablesRes.data;
        if (Array.isArray(rawTables) && rawTables.length > 0) {
          baseTables = rawTables.map((t) => ({
            id: t.MABAN ? parseInt(t.MABAN.replace(/\D/g, ""), 10) : t.id,
            name: t.TENBAN || t.name,
            maban: t.MABAN || t.maban,
            MAHANGHOA: t.MAHANGHOA,
            status: "empty", // Mặc định khởi tạo là Trống
          }));
        }

        // --- 6. PHỤC HỒI BÀN ĐANG CHƠI VÀ GHI ĐÈ TRẠNG THÁI ---
        if (activeRes.data.success && activeRes.data.data.length > 0) {
          const activeBills = activeRes.data.data;
          const newOrders = {};
          const newBillIds = {};
          const newOpenTabs = [];
          const newDiscounts = {};
          const newStartTimes = {};

          activeBills.forEach((bill) => {
            const tableNum =
              parseInt(bill.MABAN.replace(/\D/g, ""), 10) || bill.MABAN;

            newOrders[tableNum] = (bill.items || []).map((item) => ({
              id: item.MAHANGHOA,
              name: item.TENHANGHOA || item.MAHANGHOA,
              qty: item.SOLUONG,
              price: Number(item.DONGIA),
            }));
            newBillIds[tableNum] = bill.MAHOADON;
            newStartTimes[tableNum] = bill.GIOBATDAU;
            newOpenTabs.push({ id: tableNum, name: `Bàn ${tableNum}` });

            if (bill.MAKHUYENMAI) {
              const km = fetchedDiscounts.find(
                (d) => d.MAKHUYENMAI === bill.MAKHUYENMAI,
              );
              if (km) newDiscounts[tableNum] = km;
            }
          });

          // Ghi đè trạng thái của những bàn có Hóa đơn thành 'occupied' (Đang chơi)
          baseTables = baseTables.map((t) => ({
            ...t,
            status: newBillIds[t.id] ? "occupied" : "empty",
          }));

          setOrdersByTable((prev) => ({ ...prev, ...newOrders }));
          setBillIdByTable(newBillIds);
          setStartTimeByTable(newStartTimes);
          setOpenTabs(newOpenTabs);
          if (Object.keys(newDiscounts).length > 0)
            setDiscountByTable(newDiscounts);
          if (newOpenTabs.length > 0) setActiveTabId(newOpenTabs[0].id);
        }

        // Cuối cùng: Đẩy danh sách bàn (đã trộn trạng thái Đang chơi) lên màn hình 1 LẦN DUY NHẤT
        setTables(baseTables);
      } catch (error) {
        console.error("Lỗi khởi tạo Cashier:", error);
      }
    };

    init();
  }, []);

  const handleTableClick = async (table) => {
    const isAlreadyOpen = openTabs.find((t) => t.id === table.id);
    if (!isAlreadyOpen) {
      setOpenTabs([
        ...openTabs,
        {
          id: table.id,
          name: table.name,
          maban: table.maban,
          mahanghoa: table.MAHANGHOA,
        },
      ]);
    }
    setActiveTabId(table.id);
    if (openMenuOnSelect) setLeftTab("menu");
  };

  const handleOpenTable = async () => {
    if (!activeTabId) return;

    // Tìm thông tin bàn đang được chọn
    const currentTable = tables.find((t) => t.id === activeTabId);
    if (!currentTable) return;

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });

      // 1. Gọi API mở hóa đơn (Kèm luôn Giờ bắt đầu)
      const res = await axios.post("http://localhost:5000/api/bills/open", {
        MABAN: currentTable.maban,
        GIOBATDAU: timeStr,
        NGAY: now.toISOString().slice(0, 10),
      });

      if (res.data.success) {
        const newBillId = res.data.MAHOADON;

        // 2. Cập nhật state trên React
        setBillIdByTable((prev) => ({ ...prev, [activeTabId]: newBillId }));
        setStartTimeByTable((prev) => ({ ...prev, [activeTabId]: timeStr }));
        setTables((prev) =>
          prev.map((t) =>
            t.id === activeTabId ? { ...t, status: "occupied" } : t,
          ),
        );

        // 3. Tự động nạp món Dịch vụ (Tiền giờ) vào hóa đơn dựa trên MAHANGHOA của bàn
        // Nếu bàn có MAHANGHOA, tìm thông tin món đó trong menuItems để add vào
        if (currentTable.MAHANGHOA) {
          const serviceItem = menuItems.find(
            (item) => item.id === currentTable.MAHANGHOA,
          );
          if (serviceItem) {
            // Ép giá về 0 trên bill để hiển thị (tiền giờ tính riêng ở tổng kết)
            const finalItem = { ...serviceItem, price: 0, qty: 1 };
            setOrdersByTable((prev) => ({
              ...prev,
              [activeTabId]: [finalItem],
            }));
            // Sync xuống DB
            await axios.put(
              `http://localhost:5000/api/bills/${newBillId}/items`,
              { items: [finalItem] },
            );
          }
        }

        Swal.fire({
          icon: "success",
          title: "Đã mở bàn!",
          text: `Bắt đầu tính giờ từ ${timeStr}`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể kết nối server để mở bàn!", "error");
    }
  };

  const handleCloseTab = (e, tableId) => {
    e.stopPropagation();
    if (billIdByTable[tableId]) {
      Swal.fire({
        title: "Bàn đang có hóa đơn!",
        text: "Hóa đơn vẫn còn đang chạy. Bạn vẫn muốn đóng tab này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Vẫn đóng",
        cancelButtonText: "Không",
      }).then((result) => {
        if (result.isConfirmed) {
          const newTabs = openTabs.filter((t) => t.id !== tableId);
          setOpenTabs(newTabs);
          if (activeTabId === tableId) {
            setActiveTabId(
              newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
            );
          }
        }
      });
      return;
    }
    const newTabs = openTabs.filter((t) => t.id !== tableId);
    setOpenTabs(newTabs);
    if (activeTabId === tableId) {
      setActiveTabId(
        newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
      );
    }
  };

  // TÍNH NĂNG: GỌI MÓN
  const handleAddItemToBill = (item) => {
    if (!activeTabId) {
      Swal.fire(
        "Thông báo",
        "Vui lòng chọn bàn đang hoạt động trước khi gọi món!",
        "info",
      );
      return;
    }

    // Lấy trạng thái công tắc
    const choPhepBanAm = storeSettings?.NHAN_GOI_MON === true;

    // Kiểm tra tồn kho nếu không phải Dịch vụ
    if (item.category !== "Dịch vụ" && item.tonKho <= 0 && !choPhepBanAm) {
      Swal.fire({
        icon: "warning",
        title: "Đã hết hàng!",
        text: `Món "${item.name}" đã hết tồn kho. Hãy bật 'Cho phép bán khi hết hàng' trong Thiết lập để tiếp tục.`,
      });
      return;
    }

    const currentOrders = ordersByTable[activeTabId] || [];
    const existingItem = currentOrders.find((i) => i.id === item.id);
    let updated;

    const tableServiceId = currentTableInfo?.MAHANGHOA;
    const isServiceItem =
      tableServiceId && String(item.id) === String(tableServiceId);
    const finalItem = isServiceItem ? { ...item, price: 0 } : item;

    if (existingItem) {
      updated = currentOrders.map((i) =>
        i.id === finalItem.id ? { ...i, qty: i.qty + 1 } : i,
      );
    } else {
      updated = [...currentOrders, { ...finalItem, qty: 1 }];
    }

    setOrdersByTable((prev) => ({ ...prev, [activeTabId]: updated }));
    syncItemsToDB(activeTabId, updated);

    if (isServiceItem && !startTimeByTable[activeTabId]) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
      setStartTimeByTable((prev) => ({ ...prev, [activeTabId]: timeStr }));
      const billId = billIdByTable[activeTabId];
      if (billId) {
        axios.patch(`http://localhost:5000/api/bills/${billId}/start`, {
          GIOBATDAU: timeStr,
        });
      }
    }
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

  const handleDeleteItem = (itemId) => {
    const updated = (ordersByTable[activeTabId] || []).filter(
      (item) => item.id !== itemId,
    );
    setOrdersByTable((prev) => ({ ...prev, [activeTabId]: updated }));
    syncItemsToDB(activeTabId, updated);
  };

  const syncItemsToDB = async (tableId, updatedItems) => {
    const billId = billIdByTable[tableId];
    if (!billId) return;
    try {
      await axios.put(`http://localhost:5000/api/bills/${billId}/items`, {
        items: updatedItems,
      });
    } catch (err) {
      console.error("Lỗi sync món:", err);
    }
  };

  const handleOpenCheckout = () => {
    if (!billIdByTable[activeTabId]) return;
    const currentFinalTotal = finalTotal;
    setCheckoutData({
      timePrice: timePrice,
      hourlyRate: hourlyRate,
      rawTotal: rawTotal,
      discountAmount: discountAmount,
      finalTotal: finalTotal,
      durationSeconds: durationSeconds,
      endTime: new Date().toTimeString().slice(0, 5),
    });

    if (storeSettings?.SOTAIKHOAN) {
      const bank = storeSettings.NGANHANG_BIN || storeSettings.NGANHANG || "";
      const acc = storeSettings.SOTAIKHOAN || "";
      const name = encodeURIComponent(
        storeSettings.TENTAIKHOAN || storeSettings.TENCHUTAIKHOAN || "",
      );
      const info = `THANHTOAN_${billIdByTable[activeTabId]}`;

      const url = `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${currentFinalTotal}&addInfo=${info}&accountName=${name}`;
      setQrUrl(url);
    }

    setCustomerPaid(currentFinalTotal.toString());
    setShowCheckoutModal(true);
  };

  const confirmCheckout = async () => {
    const billId = billIdByTable[activeTabId];
    if (!billId || !checkoutData) return;

    const paidAmount = Number(customerPaid || 0);
    if (paymentMethod === "Tiền mặt" && paidAmount < checkoutData.finalTotal) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tiền!",
        text: `Khách cần trả ${checkoutData.finalTotal.toLocaleString()}đ nhưng mới đưa ${paidAmount.toLocaleString()}đ`,
      });
      return;
    }

    if (paymentMethod === "Kết hợp" && paidAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa nhập số tiền!",
        text: "Vui lòng nhập số tiền khách thanh toán.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/bills/${billId}/checkout`,
        {
          GIOKETTHUC: checkoutData.endTime,
          TONGTIENGIO: checkoutData.timePrice,
          TONGTIENHANG: checkoutData.rawTotal,
          MAKHUYENMAI: discountByTable[activeTabId]?.MAKHUYENMAI || null,
          TONGTHANHTOAN: checkoutData.finalTotal,
          TENKHACHHANG: customerName.trim() !== "" ? customerName : null,
          PHUONGTHUCTHANHTOAN: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Thanh toán thành công!",
        text: "Bạn có muốn in hóa đơn không?",
        showCancelButton: true,
        confirmButtonColor: "#169c4e",
        cancelButtonColor: "#6b7280",
        confirmButtonText: '<i class="fa-solid fa-print"></i> In Hóa Đơn',
        cancelButtonText: "Đóng",
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          setPrintBillData({
            billId: billId,
            tableName: tables.find((t) => t.id === activeTabId)?.name || "",
            items: currentOrderItems.filter((i) => i.price > 0),
            timePrice: checkoutData.timePrice,
            rawTotal: checkoutData.rawTotal,
            discountAmount: checkoutData.discountAmount,
            finalTotal: checkoutData.finalTotal,
            startTime: formatStartTime(activeStartTime),
            endTime: checkoutData.endTime,
            durationSeconds: checkoutData.durationSeconds,
            storeSettings: storeSettings,
            customerName: customerName,
            paymentMethod: paymentMethod,
            discountCode: discountByTable[activeTabId]?.MAKHUYENMAI || "",
            cashierName: currentUser.TENNGUOIDUNG || currentUser.HOTEN || "",
          });
          setShowPrintModal(true);
        }

        setTables((prev) =>
          prev.map((t) =>
            t.id === activeTabId ? { ...t, status: "empty" } : t,
          ),
        );
        setOrdersByTable((p) => {
          const c = { ...p };
          delete c[activeTabId];
          return c;
        });
        setBillIdByTable((p) => {
          const c = { ...p };
          delete c[activeTabId];
          return c;
        });
        setDiscountByTable((p) => {
          const c = { ...p };
          delete c[activeTabId];
          return c;
        });
        setStartTimeByTable((p) => {
          const c = { ...p };
          delete c[activeTabId];
          return c;
        });

        const newTabs = openTabs.filter((t) => t.id !== activeTabId);
        setOpenTabs(newTabs);
        setActiveTabId(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
        );

        setShowCheckoutModal(false);
        setCustomerName("");
        setCustomerPaid("");
        setPaymentMethod("Tiền mặt");
        setCheckoutData(null);
      });
    } catch (err) {
      Swal.fire("Lỗi", "Thanh toán thất bại. Vui lòng thử lại!", "error");
    }
  };

  const getDiscountAmount = (rawTotal) => {
    if (!activeTabId || !discountByTable[activeTabId]) return 0;
    const discount = discountByTable[activeTabId];
    const detail = discount.MACHITETKHOAN || discount.MACHITIETKHUYENMAI || "";
    const percentMatch = detail.match(/(\d+)\s*%/);
    if (percentMatch) {
      const percentage = parseInt(percentMatch[1], 10);
      return (rawTotal * percentage) / 100;
    }
    return 0;
  };

  const currentOrderItems = ordersByTable[activeTabId] || [];
  const rawTotal = currentOrderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const tableServiceItem = menuItems.find(
    (item) => item.id === currentTableInfo?.MAHANGHOA,
  );
  const hourlyRate = tableServiceItem?.price || 0;
  const activeStartTime = startTimeByTable[activeTabId];
  const durationSeconds = getDurationInSeconds(activeStartTime);
  const timePrice = Math.round((durationSeconds / 60 / 60) * hourlyRate);
  const discountAmount = getDiscountAmount(rawTotal + timePrice);
  const finalTotal = rawTotal + timePrice - discountAmount;

  const displayTables = tables.filter((t) => {
    if (tableFilter === "occupied") return t.status === "occupied";
    if (tableFilter === "empty") return t.status === "empty";
    return true;
  });

  const filteredMenuItems = menuItems.filter((item) => {
    const matchCat =
      activeCategory === "Tất cả" || item.category === activeCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchMenuQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // --- 1. HÀM HỦY BÀN ---
  const handleCancelTable = () => {
    const billId = billIdByTable[activeTabId];
    if (!billId) return;

    Swal.fire({
      title: "Xác nhận hủy bàn?",
      text: "Thao tác này sẽ xóa mọi món ăn hiện tại và không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Đồng ý Hủy",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:5000/api/bills/${billId}/cancel`);
          // Xóa sạch dữ liệu của bàn này
          setTables((prev) =>
            prev.map((t) =>
              t.id === activeTabId ? { ...t, status: "empty" } : t,
            ),
          );
          setOrdersByTable((p) => {
            const c = { ...p };
            delete c[activeTabId];
            return c;
          });
          setBillIdByTable((p) => {
            const c = { ...p };
            delete c[activeTabId];
            return c;
          });
          setDiscountByTable((p) => {
            const c = { ...p };
            delete c[activeTabId];
            return c;
          });
          setStartTimeByTable((p) => {
            const c = { ...p };
            delete c[activeTabId];
            return c;
          });

          // Đóng tab
          const newTabs = openTabs.filter((t) => t.id !== activeTabId);
          setOpenTabs(newTabs);
          setActiveTabId(
            newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
          );

          Swal.fire("Đã hủy!", "Hủy bàn thành công.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi hủy bàn!", "error");
        }
      }
    });
  };

  // --- 2. HÀM XÓA KHUYẾN MÃI ---
  const clearDiscount = () => {
    if (!activeTabId) return;
    setDiscountByTable((prev) => {
      const clone = { ...prev };
      delete clone[activeTabId];
      return clone;
    });
  };

  // --- 3. HÀM ÁP DỤNG KHUYẾN MÃI ---
  const handleApplyDiscount = (discount) => {
    if (!activeTabId) return;

    if (discountByTable[activeTabId]?.MAKHUYENMAI === discount.MAKHUYENMAI) {
      clearDiscount();
    } else {
      setDiscountByTable((prev) => ({ ...prev, [activeTabId]: discount }));
    }
    setShowDiscountModal(false);
  };

  const handleNotifyKitchen = () => {
    if (!billIdByTable[activeTabId]) return;
    Swal.fire({
      icon: "success",
      title: "Đã báo bếp!",
      text: "Bếp đã nhận được yêu cầu.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleTransferTable = () => {
    if (!billIdByTable[activeTabId]) return;
    setShowTransferModal(true);
  };

  return (
    <div className="h-screen flex flex-col font-sans text-[13px] bg-[#1e2d61] px-3 py-5 gap-2 overflow-hidden">
      {/* --- WORKSPACE --- */}
      <main className="flex-1 flex overflow-hidden">
        {/* --- CỘT TRÁI --- */}
        <section className="flex-[6] flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* TAB ĐIỀU HƯỚNG BÊN TRÁI */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-200 shrink-0 gap-2">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
              <button
                onClick={() => setLeftTab("tables")}
                className={`flex items-center gap-2 font-bold px-5 py-1.5 rounded-full transition-all text-sm cursor-pointer ${leftTab === "tables" ? "bg-[#3b53ab] text-white shadow-md" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"}`}
              >
                <i className="fa-solid fa-table-cells-large"></i> Sơ đồ bàn
              </button>
              <button
                onClick={() => setLeftTab("menu")}
                className={`flex items-center gap-2 font-bold px-5 py-1.5 rounded-full transition-all text-sm cursor-pointer ${leftTab === "menu" ? "bg-[#3b53ab] text-white shadow-md" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"}`}
              >
                <i className="fa-solid fa-utensils"></i> Thực đơn
              </button>
            </div>

            {/* Cụm Tìm kiếm & Option gộp chung */}
            <div className="flex items-center gap-3">
              {leftTab === "tables" && (
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={openMenuOnSelect}
                    onChange={(e) => setOpenMenuOnSelect(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#344fb1] rounded cursor-pointer"
                  />
                  Mở thực đơn khi chọn
                </label>
              )}
              {leftTab === "menu" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm món..."
                    value={searchMenuQuery}
                    onChange={(e) => setSearchMenuQuery(e.target.value)}
                    className="bg-gray-100 border border-gray-200 text-gray-700 rounded-full pr-8 pl-4 py-1.5 text-sm outline-none focus:border-[#324db0] focus:bg-white w-[200px] transition-all shadow-inner "
                  />
                  <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>
              )}
            </div>
          </div>

          {/* NỘI DUNG CỘT TRÁI */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {leftTab === "tables" ? (
              <div className="flex flex-col h-full p-4">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                    <button
                      onClick={() => setTableFilter("all")}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${tableFilter === "all" ? "bg-[#5D5FEF] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      Tất cả ({tables.length})
                    </button>
                    <button
                      onClick={() => setTableFilter("occupied")}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${tableFilter === "occupied" ? "bg-[#5D5FEF] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      Đang sử dụng (
                      {tables.filter((t) => t.status === "occupied").length})
                    </button>
                    <button
                      onClick={() => setTableFilter("empty")}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${tableFilter === "empty" ? "bg-[#5D5FEF]  text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      Còn trống (
                      {tables.filter((t) => t.status === "empty").length})
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayTables.map((table) => {
                      const isSelected = table.id === activeTabId;
                      const isOccupied = table.status === "occupied";
                      let bgClass =
                        "bg-white border-gray-200 text-gray-700 hover:border-gray-400";
                      if (isSelected)
                        bgClass =
                          "bg-[#5D5FEF] border-[#5D5FEF] text-white shadow-[0_4px_15px_rgba(93,95,239,0.4)]";
                      else if (isOccupied)
                        bgClass =
                          "bg-orange-50 border-orange-400 text-orange-800 shadow-sm";

                      return (
                        <div
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`relative aspect-[4/3] rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${bgClass}`}
                        >
                          <span className="font-bold text-lg">
                            {table.name}
                          </span>
                          {isOccupied && !isSelected && (
                            <span className="text-[10px] font-bold mt-1 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                              Đang chơi
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-bold mt-1 bg-white/20 px-2 py-0.5 rounded-full">
                              Đang chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* MENU CATEGORIES */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full font-bold text-[13px]  tracking-wider whitespace-nowrap transition-all border cursor-pointer
                        ${activeCategory === cat ? "bg-[#3b53ab] text-white border-gray-400 shadow-md" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* MENU ITEMS GRID */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredMenuItems.map((item) => {
                      const isOutOfStock =
                        item.category !== "Dịch vụ" && item.tonKho <= 0;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleAddItemToBill(item)}
                          className={`bg-white rounded-xl p-2.5 flex flex-col items-center cursor-pointer border-2 transition-all active:scale-95 group relative
                            ${isOutOfStock ? "border-red-100 hover:border-red-300 opacity-80" : "border-transparent shadow-sm hover:border-[#5D5FEF] hover:shadow-md"}
                          `}
                        >
                          {isOutOfStock && (
                            <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                              Hết hàng
                            </div>
                          )}
                          <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center text-gray-300 text-xs overflow-hidden relative border border-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={Icons.Dinner}
                                alt="Hình ảnh"
                                className="w-10 h-10 brightness-200 invert"
                              />
                            )}
                          </div>
                          <span className="font-bold text-gray-800 text-center w-full truncate mb-0.5 text-[13px]">
                            {item.name}
                          </span>
                          <span className="text-[#5D5FEF] font-bold text-[14px]">
                            {item.price.toLocaleString()}đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- CỘT PHẢI: BILL THANH TOÁN --- */}
        <section className="flex-[4] flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden relative ml-2">
          {openTabs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <img
                src={Icons.Timekeep}
                alt="empty"
                className="w-16 h-16 mb-4 opacity-20 filter grayscale"
              />
              <p className="text-sm font-bold tracking-wide">
                CHƯA CÓ HÓA ĐƠN NÀO
              </p>
              <p className="text-xs mt-1">
                Vui lòng chọn bàn bên trái để bắt đầu
              </p>
            </div>
          ) : (
            <>
              {/* TABS HÓA ĐƠN */}
              <div className="flex items-end bg-gray-100 pt-2 px-0 shrink-0 overflow-x-auto gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {openTabs.map((tab) => {
                  const isActive = activeTabId === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`group flex items-center justify-between px-3 py-3  rounded-t-lg cursor-pointer min-w-[100px] max-w-[140px] transition-all
                        ${isActive ? "bg-white text-gray-600 font-bold border-gray-200 relative top-[1px]" : "bg-gray-200 text-gray-600 border-transparent"}
                      `}
                    >
                      <span className="truncate text-[16px] tracking-wide">
                        {tab.name}
                      </span>
                      <button
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className={`ml-2 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold transition-all cursor-pointer
                          ${isActive ? "text-gray-400 hover:bg-red-100 hover:text-red-600" : "text-transparent group-hover:text-gray-500 hover:!text-red-500 hover:bg-white/50"}
                        `}
                      >
                        <img
                          src={Icons.Close}
                          alt="Đóng"
                          className="w-5 h-5 brightness-200 invert"
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {billIdByTable[activeTabId] ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* TOOLBAR BILL */}
                  <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100 shrink-0">
                    <div className="text-xl font-bold text-gray-600 tracking-wide flex items-center gap-1">
                      <i className="fa-solid fa-receipt"></i> Hóa đơn chi tiết
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="flex items-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold px-3 py-1.5 rounded-md text-[14px] transition-colors"
                      >
                        <i className="fa-solid fa-tags"></i> Khuyến mãi
                      </button>
                      <button
                        onClick={handleCancelTable}
                        disabled={!billIdByTable[activeTabId]}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3 py-1.5 rounded-md text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fa-solid fa-trash-can"></i> Hủy bàn
                      </button>
                    </div>
                  </div>

                  {/* DANH SÁCH MÓN TRONG BILL */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white shadow-sm z-10 text-[12px] text-gray-600 tracking-wider">
                        <tr>
                          <th className="p-3 font-bold border-b border-gray-200">
                            Tên món
                          </th>
                          <th className="p-3 font-bold border-b border-gray-200 text-center w-35">
                            SL
                          </th>
                          <th className="p-3 font-bold border-b border-gray-200 text-right w-33">
                            Đơn giá
                          </th>
                          <th className="p-3 font-bold border-b border-gray-200 text-right whitespace-nowrap">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrderItems.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-10 text-gray-400 italic text-xs"
                            >
                              Chưa có món nào được gọi
                            </td>
                          </tr>
                        ) : (
                          currentOrderItems.map((item) => (
                            <tr
                              key={item.id}
                              className="group border-b border-gray-100 bg-white hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="p-3 text-gray-800 font-bold text-[13px]">
                                {item.name}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 w-fit mx-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, -1);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center"
                                  >
                                    <img
                                      src={Icons.Minus}
                                      alt="Trừ"
                                      className="w-4 h-4 brightness-200"
                                    />
                                  </button>
                                  <span className="w-6 text-center text-xs font-bold bg-white h-6 flex items-center justify-center border-l border-r border-gray-200">
                                    {item.qty}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, 1);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center ml-2"
                                  >
                                    <img
                                      src={Icons.Add}
                                      alt="Cộng"
                                      className="w-4 h-4 brightness-200"
                                    />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right text-gray-700 text-[16px] font-medium">
                                {item.price.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-medium text-gray-700 text-[16px] relative pr-6">
                                {(item.price * item.qty).toLocaleString()}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id);
                                  }}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <img
                                    src={Icons.Delete}
                                    alt="Xóa món"
                                    className="cursor-pointer brightness-200 invert-20"
                                  />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* TỔNG KẾT BILL */}
                  <div className="bg-white border-t border-gray-200 shrink-0 z-10 px-4 py-2.5">
                    <div className="space-y-3 mb-2">
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <i className="fa-regular fa-clock"></i> Giờ bắt đầu
                        </span>
                        <div className="flex items-center gap-3">
                          <img
                            src={Icons.Clock}
                            alt="Chỉnh giờ"
                            className="w-6 h-6 brightness-200 invert-2"
                          />
                          <span className="font-bold text-gray-700">
                            {activeStartTime
                              ? formatStartTime(activeStartTime)
                              : "--:--:--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <i className="fa-regular fa-clock"></i> Tổng tiền chơi
                          ({hourlyRate.toLocaleString()}đ/h)
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">
                            {activeStartTime
                              ? formatDuration(durationSeconds)
                              : "--:--:--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <i className="fa-solid fa-mug-hot text-[11px]"></i>{" "}
                          Tổng tiền món (
                          {currentOrderItems.reduce((acc, i) => acc + i.qty, 0)}
                          )
                        </span>
                        <span className="font-bold text-sm text-gray-700">
                          {rawTotal.toLocaleString()}đ
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <i className="fa-solid fa-mug-hot text-[11px]"></i>{" "}
                          Giảm giá
                        </span>
                        <span className="font-bold text-gray-700 text-sm">
                          -{discountAmount.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-300 flex justify-between items-center mb-4 pl-2">
                      <span className="text-[20px] font-bold  text-gray-800">
                        Tổng tiền
                      </span>
                      <span className="text-[20px] font-bold text-red-500">
                        {finalTotal.toLocaleString()}đ
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={handleNotifyKitchen}
                        className="bg-[#5D5FEF] hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer text-[16px] tracking-wide border border-gray-300"
                      >
                        Báo Bếp
                      </button>
                      <button
                        onClick={handleTransferTable}
                        className="hover:bg-[#ba9d47] bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors text-[16px] tracking-wide border border-gray-300 cursor-pointer"
                      >
                        Chuyển bàn
                      </button>
                      <button
                        onClick={handleOpenCheckout}
                        className="bg-[#169c4e] hover:bg-[#12b862] text-white font-bold py-4 rounded-xl transition-all text-[16px] tracking-wide cursor-pointer"
                      >
                        Thanh Toán
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* NẾU BÀN TRỐNG -> HIỆN NÚT MỞ BÀN TO ĐÙNG */
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                  <h3 className="text-xl font-bold text-gray-700 mb-2 tracking-wide">
                    Bàn Đang Trống
                  </h3>
                  <p className="text-sm mb-8 text-gray-500">
                    Bấm nút bên dưới để tính giờ.
                  </p>

                  <button
                    onClick={handleOpenTable}
                    className="flex items-center gap-3 bg-[#5D5FEF] hover:bg-blue-600 text-white font-bold px-10 py-4 rounded-full transition-all cursor-pointer"
                  >
                    <span className="text-lg tracking-wider">Mở bàn</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* MODAL KHUYẾN MÃI */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden zoom-in-95 border border-gray-100">
            <div className="bg-[#f8f9fc] px-5 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-700  tracking-wide">
                Chọn Khuyến Mãi
              </h2>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar bg-gray-50">
              {discountsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium italic">
                  Không có mã giảm giá nào.
                </div>
              ) : (
                <div className="space-y-3">
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
                        className={`flex flex-col border-2 rounded-xl p-3 cursor-pointer transition-all bg-white ${isSelected ? "border-[#5D5FEF] shadow-md relative" : "border-gray-200 hover:border-[#5D5FEF]/50"}`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-[#5D5FEF] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                            Đang chọn
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-yellow-100 text-yellow-800 text-[11px] font-black px-2 py-0.5 rounded">
                            {discount.MAKHUYENMAI}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                            HSD:{" "}
                            {new Date(discount.NGAYKETTHUC).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        <p className="font-bold text-[13px] text-gray-800">
                          {detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex justify-end transition-opacity ">
          <div className="w-full max-w-[900px] h-full bg-[#f4f6f8] shadow-[[-10px_0_20px_rgba(0,0,0,0.2)]] flex flex-col animate-in slide-in-from-right duration-400 rounded-l-3xl overflow-hidden border-l border-gray-300">
            {/* Header Modal */}
            <div className="h-14 bg-white flex justify-between items-center px-6 border-b border-gray-200 shrink-0 ">
              <h2 className="text-lg font-bold text-gray-800">
                Thanh toán • {tables.find((t) => t.id === activeTabId)?.name}
              </h2>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-500 hover:bg-gray-100 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <img src={Icons.Close} alt="Đóng" />
              </button>
            </div>

            {/* Body Modal chia 2 cột */}
            <div className="flex-1 flex overflow-hidden">
              {/* CỘT TRÁI: CHI TIẾT MÓN */}
              <div className="flex-[5.5] bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2 border border-gray-300 rounded overflow-hidden w-full max-w-[250px] bg-white px-2 py-1.5">
                    <i className="fa-solid fa-user text-gray-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Nhập tên khách hàng..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full outline-none text-[14px] bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead className="bg-white sticky top-0 border-b border-gray-200 text-gray-500 uppercase text-[11px]">
                      <tr>
                        <th className="p-3 font-bold">Mặt hàng</th>
                        <th className="p-3 font-bold text-center w-16">SL</th>
                        <th className="p-3 font-bold text-right w-24">
                          Đơn giá
                        </th>
                        <th className="p-3 font-bold text-right w-28">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Tiền giờ Bida */}
                      {(checkoutData?.timePrice || 0) > 0 && (
                        <tr className="border-b border-dashed border-gray-200 bg-blue-50/30">
                          <td className="p-3 text-blue-800 font-bold flex flex-col">
                            <span>Tiền giờ chơi</span>
                            <span className="text-[11px] font-normal text-gray-500">
                              Từ {formatStartTime(activeStartTime)} đến{" "}
                              {checkoutData?.endTime} (
                              {formatDuration(
                                checkoutData?.durationSeconds || 0,
                              )}
                              )
                            </span>
                          </td>
                          <td className="p-3 text-center text-gray-800">1</td>
                          <td className="p-3 text-right text-gray-600">
                            {(checkoutData?.timePrice || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-gray-800">
                            {(checkoutData?.timePrice || 0).toLocaleString()}
                          </td>
                        </tr>
                      )}
                      {/* Các món ăn */}
                      {currentOrderItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b border-dashed border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-3 text-gray-800 font-medium">
                            <span className="text-gray-400 mr-2">
                              {idx + 1}.
                            </span>
                            {item.name}
                          </td>
                          <td className="p-3 text-center text-gray-800">
                            {item.qty}
                          </td>
                          <td className="p-3 text-right text-gray-600">
                            {item.price.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-gray-800">
                            {(item.price * item.qty).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                  <span className="font-bold text-gray-600">
                    Tổng tiền hàng{" "}
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-1">
                      {currentOrderItems.reduce((acc, i) => acc + i.qty, 0)}
                    </span>
                  </span>
                  <span className="font-bold text-lg text-gray-800">
                    {(
                      (checkoutData?.rawTotal || 0) +
                      (checkoutData?.timePrice || 0)
                    ).toLocaleString()}
                    đ
                  </span>
                </div>
              </div>

              {/* CỘT PHẢI: CHI TIẾT THANH TOÁN */}
              <div className="flex-[4.5] bg-white flex flex-col h-full">
                <div className="p-5 flex-1 overflow-y-auto">
                  <h3 className="font-bold text-[15px] text-gray-800 mb-6 tracking-wide">
                    Chi tiết giao dịch
                  </h3>

                  <div className="space-y-4 mb-8 text-[13px]">
                    <div className="flex justify-between text-gray-600">
                      <span>Tổng tiền hàng</span>
                      <span className="font-bold text-gray-800">
                        {(
                          (checkoutData?.rawTotal || 0) +
                          (checkoutData?.timePrice || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Giảm giá</span>
                      <div className="flex flex-col items-end">
                        {discountByTable[activeTabId] && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded font-bold mb-1">
                            {discountByTable[activeTabId].MAKHUYENMAI}
                          </span>
                        )}
                        <span className="font-bold text-gray-800">
                          -
                          {(checkoutData?.discountAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[#5D5FEF] font-bold border-t border-gray-200 pt-4">
                      <span>Khách cần trả</span>
                      <span className="text-lg">
                        {(checkoutData?.finalTotal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-800 font-bold">
                      <span>Khách thanh toán</span>
                      <div className="relative w-32">
                        <input
                          type="text"
                          value={
                            customerPaid === ""
                              ? ""
                              : Number(customerPaid).toLocaleString()
                          }
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCustomerPaid(val);
                          }}
                          className="w-full text-right font-bold text-lg outline-none focus:border-blue-700 pb-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chọn phương thức thanh toán */}
                  <div className="border border-gray-200 rounded-xl p-1 flex bg-gray-50 mb-6">
                    {["Tiền mặt", "Chuyển khoản", "Kết hợp"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${paymentMethod === method ? "bg-white shadow text-[#5D5FEF]" : "text-gray-500 hover:text-gray-800"}`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? "border-[#5D5FEF]" : "border-gray-400"}`}
                        >
                          {paymentMethod === method && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#5D5FEF]"></div>
                          )}
                        </div>
                        {method}
                      </button>
                    ))}
                  </div>

                  {/* Nút Gợi ý tiền nhanh */}
                  {paymentMethod === "Tiền mặt" && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[finalTotal, 50000, 100000, 200000, 500000].map(
                        (amt, i) => {
                          if (amt < (checkoutData?.finalTotal || 0) && i !== 0)
                            return null;
                          return (
                            <button
                              key={i}
                              onClick={() => setCustomerPaid(amt.toString())}
                              className="px-3 py-1.5 border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:border-[#5D5FEF] hover:text-[#5D5FEF] transition-colors"
                            >
                              {amt.toLocaleString()}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {paymentMethod === "Chuyển khoản" && (
                    <div className="flex flex-col items-center justify-center mb-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-[12px] font-bold text-green-800 mb-3 uppercase tracking-wide">
                        Quét mã để thanh toán
                      </p>

                      {storeSettings?.SOTAIKHOAN ? (
                        <img
                          src={qrUrl}
                          alt="QR Code"
                          className="w-full max-w-[240px] aspect-square object-contain rounded-md shadow-sm border border-gray-200 bg-white"
                        />
                      ) : (
                        <div className="w-44 h-44 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-center p-4">
                          <i className="fa-solid fa-qrcode text-3xl mb-2"></i>
                          <span className="text-xs font-bold">
                            Chưa cấu hình QR
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-600 text-[13px] border-t border-gray-200 pt-4">
                    <span>Tiền thừa trả khách</span>
                    <span className="font-bold text-gray-800">
                      {customerPaid &&
                      Number(customerPaid) > (checkoutData?.finalTotal || 0)
                        ? (
                            Number(customerPaid) -
                            (checkoutData?.finalTotal || 0)
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex gap-3">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-[3] bg-gray-300 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-[16px] cursor-pointer"
                  >
                    Trở về
                  </button>
                  <button
                    onClick={confirmCheckout}
                    className="flex-[7] bg-[#169c4e] hover:bg-[#12b862] text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(22,156,78,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 text-[16px] cursor-pointer tracking-wider"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-700">Chuyển bàn</h2>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTargetTableId(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">
                Chọn bàn trống để chuyển đến:
              </p>
              <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                {tables
                  .filter((t) => t.status === "empty" && t.id !== activeTabId)
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setTargetTableId(t.id)}
                      className={`aspect-square rounded-xl flex items-center justify-center font-bold cursor-pointer border-2 transition-all
                  ${
                    targetTableId === t.id
                      ? "bg-amber-500 border-amber-500 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-amber-400"
                  }`}
                    >
                      {t.name}
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTargetTableId(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl"
              >
                Hủy
              </button>
              <button
                disabled={!targetTableId}
                onClick={async () => {
                  if (!targetTableId) return;
                  const billId = billIdByTable[activeTabId];
                  const targetTable = tables.find(
                    (t) => t.id === targetTableId,
                  );
                  try {
                    await axios.put(
                      `http://localhost:5000/api/bills/${billId}/transfer`,
                      {
                        MABAN_MOI: targetTable.maban,
                      },
                    );
                    // Cập nhật state
                    setTables((prev) =>
                      prev.map((t) => {
                        if (t.id === activeTabId)
                          return { ...t, status: "empty" };
                        if (t.id === targetTableId)
                          return { ...t, status: "occupied" };
                        return t;
                      }),
                    );
                    setOrdersByTable((prev) => {
                      const clone = { ...prev };
                      clone[targetTableId] = clone[activeTabId];
                      delete clone[activeTabId];
                      return clone;
                    });
                    setBillIdByTable((prev) => {
                      const clone = { ...prev };
                      clone[targetTableId] = clone[activeTabId];
                      delete clone[activeTabId];
                      return clone;
                    });
                    setStartTimeByTable((prev) => {
                      const clone = { ...prev };
                      clone[targetTableId] = clone[activeTabId];
                      delete clone[activeTabId];
                      return clone;
                    });
                    setDiscountByTable((prev) => {
                      const clone = { ...prev };
                      if (clone[activeTabId]) {
                        clone[targetTableId] = clone[activeTabId];
                        delete clone[activeTabId];
                      }
                      return clone;
                    });
                    setOpenTabs((prev) =>
                      prev.map((t) =>
                        t.id === activeTabId
                          ? {
                              ...t,
                              id: targetTableId,
                              name: targetTable.name,
                            }
                          : t,
                      ),
                    );
                    setActiveTabId(targetTableId);
                    setShowTransferModal(false);
                    setTargetTableId(null);
                    Swal.fire({
                      icon: "success",
                      title: `Đã chuyển sang ${targetTable.name}!`,
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  } catch {
                    Swal.fire("Lỗi", "Chuyển bàn thất bại!", "error");
                  }
                }}
                className="flex-[2] bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
              >
                Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL IN HÓA ĐƠN */}
      {showPrintModal && printBillData && (
        <PrintBillModal
          billData={printBillData}
          onClose={() => {
            setShowPrintModal(false);
            setPrintBillData(null);
          }}
        />
      )}
    </div>
  );
}

export default Cashier;
