const { sql, poolPromise } = require("./backend/config/db");
const fs = require("fs");

async function check() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MANVIEN, TENNGUOIDUNG, CHUCVU FROM NHANVIEN");
    fs.writeFileSync("db_check_result.json", JSON.stringify(result.recordset, null, 2));
    console.log("Results written to db_check_result.json");
    process.exit(0);
  } catch (err) {
    fs.writeFileSync("db_check_error.txt", err.message);
    process.exit(1);
  }
}

check();
