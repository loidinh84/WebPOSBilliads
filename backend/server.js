const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
app.use("/api/categories", productRoutes);

const tableRoutes = require("./routes/tableRoutes");
app.use("/api/tables", tableRoutes);

const templateRoutes = require("./routes/templateRoutes");
app.use("/api/templates", templateRoutes);

const billRoutes = require("./routes/billRoutes");
app.use("/api/bills", billRoutes);

const importRoutes = require("./routes/importRoutes");
app.use("/api/imports", importRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
