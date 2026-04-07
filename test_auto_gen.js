const { sql, poolPromise } = require("./backend/config/db");
const Employee = require("./backend/models/employeeModel");

async function testCreateEmployee() {
  try {
    const testData = {
      TENNGUOIDUNG: "Test Employee " + Date.now(),
      SDT: "0123456789",
      CHUCVU: "Nhân viên bàn",
    };

    console.log("Adding employee with data:", testData);
    const result = await Employee.create(testData);
    console.log("Result:", result);

    const pool = await poolPromise;
    const check = await pool.request()
      .input("manvien", sql.NVarChar, result.manvien)
      .query("SELECT MANVIEN, MACCH, TENNGUOIDUNG FROM NHANVIEN WHERE MANVIEN = @manvien");
    
    console.log("Database entry:", check.recordset[0]);
    
    // Cleanup
    // await pool.request().input("manvien", sql.NVarChar, result.manvien).query("DELETE FROM NHANVIEN WHERE MANVIEN = @manvien");
    // console.log("Cleanup done.");

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testCreateEmployee();
