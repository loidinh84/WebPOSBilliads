const { sql, poolPromise } = require("./backend/config/db");

async function diagnose() {
  try {
    const pool = await poolPromise;
    console.log("Checking NHANVIEN columns...");
    const nhanvienCols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NHANVIEN'");
    console.table(nhanvienCols.recordset);

    console.log("Checking TAIKHOAN columns...");
    const taikhoanCols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TAIKHOAN'");
    console.table(taikhoanCols.recordset);

    process.exit(0);
  } catch (err) {
    console.error("Diagnosis failed:", err);
    process.exit(1);
  }
}

diagnose();
