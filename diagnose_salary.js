const { sql, poolPromise } = require("./backend/config/db");

async function diagnose() {
  try {
    const pool = await poolPromise;
    console.log("--- NHANVIEN status ---");
    const nv = await pool.request().query("SELECT MANVIEN, TENNGUOIDUNG, DAXOA FROM NHANVIEN");
    console.table(nv.recordset);

    console.log("\n--- Calculated Payroll (Month 4, 2026) ---");
    const month = 4, year = 2026;
    const calc = await pool.request()
      .input("month", sql.Int, month)
      .input("year", sql.Int, year)
      .query(`
          SELECT 
            nv.MANVIEN, 
            nv.TENNGUOIDUNG, 
            nv.CHUCVU,
            SUM(ISNULL(cc.TONGGIO, 0)) as TotalHours
          FROM NHANVIEN nv
          LEFT JOIN CHAMCONG cc ON nv.MANVIEN = cc.MANVIEN 
            AND MONTH(cc.NGAY) = @month 
            AND YEAR(cc.NGAY) = @year
            AND cc.TRANGTHAI = N'Đã duyệt'
          WHERE (nv.DAXOA = 0 OR nv.DAXOA IS NULL)
          GROUP BY nv.MANVIEN, nv.TENNGUOIDUNG, nv.CHUCVU
      `);
    console.table(calc.recordset);
    
    console.log("\n--- Existing Payroll (Month 04/2026) ---");
    const exist = await pool.request()
      .input("ky", sql.NVarChar, "Tháng 04/2026")
      .query("SELECT * FROM LUONG WHERE KYTRALUONG = @ky");
    console.table(exist.recordset);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnose();
