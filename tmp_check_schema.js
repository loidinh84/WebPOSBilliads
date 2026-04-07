const { sql, poolPromise } = require("./backend/config/db");

async function checkSchema() {
  try {
    const pool = await poolPromise;
    const tables = ["NHAPKHO", "CHITIETNHAPKHO"];
    
    for (const table of tables) {
      const res = await pool.request().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${table}'
      `);
      console.log(`${table} Columns:`, res.recordset.map(r => r.COLUMN_NAME).join(", "));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
