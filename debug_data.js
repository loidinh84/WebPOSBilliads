const { sql, poolPromise } = require("./backend/config/db");

async function debugData() {
    try {
        const pool = await poolPromise;
        const date = "2026-04-06";
        const result = await pool.request()
            .input("date", sql.Date, date)
            .query("SELECT * FROM LICHLAMVIEC WHERE NGAY = @date");
        
        console.log("Shifts for 2026-04-06:", result.recordset);
        
        const allResult = await pool.request()
            .query("SELECT TOP 5 * FROM LICHLAMVIEC");
        console.log("Any shifts in DB:", allResult.recordset);
    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        process.exit();
    }
}

debugData();
