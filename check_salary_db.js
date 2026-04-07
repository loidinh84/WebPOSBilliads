const { sql, poolPromise } = require("./backend/config/db");

async function checkSalaryTable() {
  try {
    const pool = await poolPromise;
    console.log("Checking LUONG table schema...");
    const result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LUONG'");
    console.table(result.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSalaryTable();
