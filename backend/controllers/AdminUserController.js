const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");

const NhanVienController = {
  // 1. Lấy toàn bộ danh sách nhân viên và tài khoản
  getAllUsers: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          TK.TENDANGNHAP as username, 
          NV.TENNGUOIDUNG as fullname, 
          TK.QUYENHAN as role, 
          TK.TRANGTHAI as status,
          NV.SDT as phone, 
          NV.EMAIL as email,
          NV.MANVIEN as manvien,
          NV.DIACHI as address
        FROM TAIKHOAN TK
        JOIN NHANVIEN NV ON TK.TENDANGNHAP = NV.TENDANGNHAP
        WHERE TK.DAXOA = 0 OR TK.DAXOA IS NULL
      `);
      res.json(result.recordset);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi lấy danh sách nhân viên", error: err.message });
    }
  },

  // 2. Thêm mới nhân viên và tài khoản
  createUser: async (req, res) => {
    const { username, fullname, password, role, phone, email, address } =
      req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const checkUser = await transaction
        .request()
        .input("u", sql.VarChar, username)
        .query("SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = @u");

      if (checkUser.recordset.length > 0) {
        throw new Error("Tên đăng nhập đã tồn tại!");
      }

      const lastNV = await transaction
        .request()
        .query(
          "SELECT TOP 1 MANVIEN FROM NHANVIEN WHERE MANVIEN LIKE 'NV%' ORDER BY MANVIEN DESC",
        );

      let newMaNV = "NV000001";
      if (lastNV.recordset.length > 0) {
        const lastCode = lastNV.recordset[0].MANVIEN;
        const lastNumber = parseInt(lastCode.replace("NV", ""), 10);
        newMaNV = "NV" + (lastNumber + 1).toString().padStart(6, "0");
      }

      // HASH MẬT KHẨU
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //  Chèn vào bảng TAIKHOAN
      await transaction
        .request()
        .input("user", sql.VarChar, username)
        .input("pass", sql.VarChar, hashedPassword)
        .input("role", sql.NVarChar, role)
        .input("status", sql.Bit, 1).query(`
          INSERT INTO TAIKHOAN (TENDANGNHAP, MATKHAU, QUYENHAN, TRANGTHAI)
          VALUES (@user, @pass, @role, @status)
        `);

      // 2c. Chèn vào bảng NHANVIEN
      await transaction
        .request()
        .input("ma", sql.NVarChar, newMaNV)
        .input("user", sql.NVarChar, username)
        .input("ten", sql.NVarChar, fullname)
        .input("sdt", sql.VarChar, phone)
        .input("mail", sql.VarChar, email)
        .input("dc", sql.NVarChar, address).query(`
          INSERT INTO NHANVIEN (MANVIEN, TENDANGNHAP, TENNGUOIDUNG, SDT, EMAIL, DIACHI)
          VALUES (@ma, @user, @ten, @sdt, @mail, @dc)
        `);

      await transaction.commit();
      res.json({ success: true, message: "Thêm người dùng thành công!" });
    } catch (err) {
      if (transaction) await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 3. chỉnh sửa nhân vien và tài khoản
  updateUser: async (req, res) => {
    const {
      username,
      fullname,
      password,
      role,
      phone,
      email,
      address,
      status,
    } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Cập nhật bảng TAIKHOAN
      let updateAccountQuery = `
      UPDATE TAIKHOAN 
      SET QUYENHAN = @role, TRANGTHAI = @status
    `;

      const accountRequest = transaction
        .request()
        .input("user", sql.VarChar, username)
        .input("role", sql.NVarChar, role)
        .input("status", sql.Int, status === "Đang hoạt động" ? 0 : 1);

      // Nếu có nhập mật khẩu mới thì mới cập nhật mật khẩu
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateAccountQuery += ", MATKHAU = @pass";
        accountRequest.input("pass", sql.VarChar, hashedPassword);
      }

      updateAccountQuery += " WHERE TENDANGNHAP = @user";
      await accountRequest.query(updateAccountQuery);

      // 2. Cập nhật bảng NHANVIEN
      await transaction
        .request()
        .input("user", sql.VarChar, username)
        .input("ten", sql.NVarChar, fullname)
        .input("sdt", sql.VarChar, phone)
        .input("mail", sql.VarChar, email)
        .input("dc", sql.NVarChar, address).query(`
        UPDATE NHANVIEN 
        SET TENNGUOIDUNG = @ten, SDT = @sdt, EMAIL = @mail, DIACHI = @dc
        WHERE TENDANGNHAP = @user
      `);

      await transaction.commit();
      res.json({ success: true, message: "Cập nhật thông tin thành công!" });
    } catch (err) {
      if (transaction) await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Chuyển trạng thái
  toggleStatus: async (req, res) => {
    const { username, currentStatus } = req.body;
    try {
      const pool = await poolPromise;
      const newStatus = currentStatus === "Ngừng hoạt động" ? 1 : 0;

      await pool
        .request()
        .input("user", sql.VarChar, username)
        .input("status", sql.Int, newStatus)
        .query(
          "UPDATE TAIKHOAN SET TRANGTHAI = @status WHERE TENDANGNHAP = @user",
        );

      res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    const { username } = req.params;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      // 1. Đánh dấu xóa trong TAIKHOAN
      await transaction
        .request()
        .input("u", sql.VarChar, username)
        .query("UPDATE TAIKHOAN SET DAXOA = 1 WHERE TENDANGNHAP = @u");

      // 2. Đánh dấu xóa trong NHANVIEN
      await transaction
        .request()
        .input("u", sql.VarChar, username)
        .query("UPDATE NHANVIEN SET DAXOA = 1 WHERE TENDANGNHAP = @u");

      await transaction.commit();
      res.json({ success: true, message: "Đã xóa người dùng thành công!" });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error("Lỗi xóa user:", err);
      res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
  },

  // 6. Lấy cài đặt thời gian truy cập của 1 user
  getAccessTime: async (req, res) => {
    const { username } = req.params;
    try {
      const pool = await poolPromise;

      // Lấy trạng thái công tắc bật/tắt
      const accountStatus = await pool
        .request()
        .input("u", sql.NVarChar, username)
        .query("SELECT GIOIHAN_TRUYCAP FROM TAIKHOAN WHERE TENDANGNHAP = @u");

      // Lấy danh sách 7 ngày
      const accessTimes = await pool
        .request()
        .input("u", sql.NVarChar, username)
        .query(
          "SELECT THU, GIO_BATDAU, GIO_KETTHUC FROM THOIGIAN_TRUYCAP WHERE TENDANGNHAP = @u",
        );

      res.json({
        success: true,
        isLimitActive: accountStatus.recordset[0]?.GIOIHAN_TRUYCAP === 1,
        schedule: accessTimes.recordset,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 7. Lưu cài đặt thời gian truy cập
  saveAccessTime: async (req, res) => {
    const { username, isLimitActive, schedule } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Cập nhật công tắc ở bảng TAIKHOAN
      await transaction
        .request()
        .input("limit", sql.Int, isLimitActive ? 1 : 0)
        .input("u", sql.NVarChar, username)
        .query(
          "UPDATE TAIKHOAN SET GIOIHAN_TRUYCAP = @limit WHERE TENDANGNHAP = @u",
        );

      // Xóa lịch cũ đi để nạp lịch mới
      await transaction
        .request()
        .input("u", sql.NVarChar, username)
        .query("DELETE FROM THOIGIAN_TRUYCAP WHERE TENDANGNHAP = @u");

      // Chèn 7 ngày mới vào
      for (const item of schedule) {
        await transaction
          .request()
          .input("u", sql.NVarChar, username)
          .input("thu", sql.NVarChar, item.day)
          .input("bd", sql.VarChar, item.start)
          .input("kt", sql.VarChar, item.end).query(`
            INSERT INTO THOIGIAN_TRUYCAP (TENDANGNHAP, THU, GIO_BATDAU, GIO_KETTHUC)
            VALUES (@u, @thu, @bd, @kt)
          `);
      }

      await transaction.commit();
      res.json({ success: true, message: "Lưu cài đặt giờ thành công!" });
    } catch (err) {
      if (transaction) await transaction.rollback();
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = NhanVienController;
