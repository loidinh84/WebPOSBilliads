const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE,
  },
};

// Khởi tạo kết nối dạng Promise để tái sử dụng ở các Controller
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Đã kết nối cơ sở dữ liệu SQL Server thành công!");
    return pool;
  })
  .catch((err) => {
    console.log("Lỗi kết nối CSDL: ", err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
