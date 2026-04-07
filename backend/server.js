const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- KHAI BÁO CÁC ROUTES ---

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const employeeRoutes = require("./routes/employeeRoutes");
app.use("/api/employees", employeeRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
app.use("/api/categories", productRoutes);

const tableRoutes = require("./routes/tableRoutes");
app.use("/api/tables", tableRoutes);

// SỬA LỖI TẠI ĐÂY: Xóa chữ require dư thừa
const templateRoutes = require("./routes/templateRoutes");
app.use("/api/templates", templateRoutes);

const billRoutes = require("./routes/billRoutes");
app.use("/api/bills", billRoutes);

const importRoutes = require("./routes/importRoutes");
app.use("/api/imports", importRoutes);

const returnImportRoutes = require("./routes/returnImportRoutes.js");
app.use("/api/return-imports", returnImportRoutes);

const discountRoutes = require("./routes/discountRoutes");
app.use("/api/discounts", discountRoutes);

const exportRoutes = require("./routes/exportRoutes.js");
app.use("/api/transactions/exports", exportRoutes);

const adminUserRoutes = require("./routes/AdminUserRoutes.js");
app.use("/api/users", adminUserRoutes);

const storeSettingsRoutes = require("./routes/storeSettingsRoutes.js");
app.use("/api/store-settings", storeSettingsRoutes);

const actionHistoryRoutes = require("./routes/actionHistoryRoutes");
app.use("/api/action-history", actionHistoryRoutes);

const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api/inventory", inventoryRoutes);

// --- LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang "bay" tại cổng ${PORT}`));
