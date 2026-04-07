const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
const storeSettingsRoutes = require("./routes/storeSettingsRoutes.js");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const tableRoutes = require("./routes/tableRoutes");
const templateRoutes = require("./routes/templateRoutes");
const billRoutes = require("./routes/billRoutes");
const importRoutes = require("./routes/importRoutes");
const discountRoutes = require("./routes/discountRoutes");
const returnImportRoutes = require("./routes/returnImportRoutes.js");
const exportRoutes = require("./routes/exportRoutes.js");
const adminUserRoutes = require("./routes/AdminUserRoutes.js");
const actionHistoryRoutes = require("./routes/actionHistoryRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes.js");
const scheduleRoutes = require("./routes/scheduleRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRoutes = require("./routes/salaryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/store-settings", storeSettingsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", productRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/imports", importRoutes);
app.use("/api/return-imports", returnImportRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/transactions/exports", exportRoutes);
app.use("/api/users", adminUserRoutes);
app.use("/api/action-history", actionHistoryRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
