const { sql, poolPromise } = require("./backend/config/db");

async function diagnose() {
  try {
    const pool = await poolPromise;
    console.log("--- EMPLOYEES AND ROLES ---");
    const result = await pool.request().query("SELECT MANVIEN, TENNGUOIDUNG, CHUCVU FROM NHANVIEN");
    console.table(result.recordset);
    
    console.log("--- DISTRICT ROLES IN DB ---");
    const result2 = await pool.request().query("SELECT DISTINCT CHUCVU FROM NHANVIEN");
    console.table(result2.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnose();
