const { sql, poolPromise } = require("./backend/config/db");

async function checkEmployees() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MAX(MANVIEN) as lastMV, MAX(MACCH) as lastMCC FROM NHANVIEN");
    console.log(JSON.stringify(result.recordset[0]));
    process.exit(0);
  } catch (err) {
    console.error("Lỗi:", err);
    process.exit(1);
  }
}

checkEmployees();
