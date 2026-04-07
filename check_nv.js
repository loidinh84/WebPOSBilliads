const { poolPromise } = require("./backend/config/db");

async function check() {
  try {
    const pool = await poolPromise;
    console.log("--- ALL EMPLOYEES ---");
    const result = await pool.request().query("SELECT MANVIEN, TENNGUOIDUNG, DAXOA FROM NHANVIEN");
    console.table(result.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
