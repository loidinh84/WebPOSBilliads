const { sql, poolPromise } = require("./backend/config/db");

async function checkSchema() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'CHAMCONG'
    `);
    console.log("SCHEMA CHAMCONG:");
    console.table(result.recordset);
    
    // Thử chèn bản ghi lỗi để xem Error Message chi tiết
    console.log("\nTHỬ NGHIỆM CHI TIẾT (INSERT TEST):");
    try {
        await pool.request()
            .input("ma", sql.NVarChar, "TEST_" + Date.now())
            .input("mnv", sql.NVarChar, "NV001")
            .input("ngay", sql.Date, "2026-04-06")
            .input("vao", sql.Time, "07:00")
            .input("ra", sql.Time, "17:00")
            .input("tong", sql.Decimal(5, 2), 10.0)
            .input("status", sql.NVarChar, "Đã duyệt")
            .query(`
                INSERT INTO CHAMCONG (MACHAMCONG, MANVIEN, NGAY, GIOVAO, GIORA, TONGGIO, TRANGTHAI)
                VALUES (@ma, @mnv, @ngay, @vao, @ra, @tong, @status)
            `);
        console.log("-> TEST INSERT: SUCCESS (Hệ thống vẫn insert bình thường)");
    } catch (e) {
        console.log("-> TEST INSERT: FAILED!");
        console.log("Lỗi chi tiết từ SQL Server:", e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("Lỗi script:", err);
    process.exit(1);
  }
}

checkSchema();
