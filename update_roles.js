const { sql, poolPromise } = require("./backend/config/db");

async function updateRoles() {
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    console.log("--- Bắt đầu cập nhật Chức vụ ---");

    // 1. Cập nhật Nhà bếp
    const res1 = await transaction.request().query(`
      UPDATE NHANVIEN 
      SET CHUCVU = N'Nhà bếp (30k)' 
      WHERE CHUCVU = N'Nhà bếp'
    `);
    console.log(`Đã cập nhật ${res1.rowsAffected[0]} nhân viên Nhà bếp.`);

    // 2. Cập nhật Thu ngân
    const res2 = await transaction.request().query(`
      UPDATE NHANVIEN 
      SET CHUCVU = N'Thu ngân (30k)' 
      WHERE CHUCVU = N'Thu ngân'
    `);
    console.log(`Đã cập nhật ${res2.rowsAffected[0]} nhân viên Thu ngân.`);

    // 3. Cập nhật Quản lý
    const res3 = await transaction.request().query(`
      UPDATE NHANVIEN 
      SET CHUCVU = N'Quản lý (40k)' 
      WHERE CHUCVU = N'Quản lý'
    `);
    console.log(`Đã cập nhật ${res3.rowsAffected[0]} nhân viên Quản lý.`);

    await transaction.commit();
    console.log("--- Cập nhật thành công! ---");
    process.exit(0);
  } catch (err) {
    console.error("Lỗi cập nhật CSDL: ", err);
    process.exit(1);
  }
}

updateRoles();
