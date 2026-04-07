const { sql, poolPromise } = require('../config/db'); 

const ActionHistoryModel = {
    // Hàm 1: Lấy danh sách lịch sử thao tác
    getAllActionHistory: async () => {
        try {
            const pool = await poolPromise;
            const query = `
                SELECT 
                    ls.MATHAOTAC AS id,
                    ls.HANHDONG AS action,
                    FORMAT(ls.THOIGIAN, 'yyyy/MM/dd HH:mm') AS time,
                    ls.MADOITUONG AS target,
                    nv.TENNGUOIDUNG + ' - ' + nv.CHUCVU AS [user],
                    ls.CHITIETTHAYDOI AS details
                FROM 
                    LichSuThaoTac ls
                LEFT JOIN 
                    NHANVIEN nv ON ls.MANVIEN = nv.MANVIEN
                ORDER BY 
                    ls.THOIGIAN DESC;
            `;
            const result = await pool.request().query(query);
            return result.recordset; 
        } catch (error) {
            throw error;
        }
    },

    // Hàm 2: Ghi log thao tác mới
    insertActionLog: async (maNhanVien, hanhDong, maDoiTuong, chiTiet) => {
        try {
            const pool = await poolPromise;
            
            // Tự động tạo mã thao tác (LOG001, LOG002...)
            const maxIdResult = await pool.request().query("SELECT TOP 1 MATHAOTAC FROM LichSuThaoTac ORDER BY MATHAOTAC DESC");
            let newId = "LOG001";
            if (maxIdResult.recordset.length > 0) {
                const lastId = maxIdResult.recordset[0].MATHAOTAC;
                const lastNum = parseInt(lastId.replace(/\D/g, ""), 10);
                newId = "LOG" + String(lastNum + 1).padStart(3, "0");
            }

            const query = `
                INSERT INTO LichSuThaoTac (MATHAOTAC, MANVIEN, THOIGIAN, HANHDONG, MADOITUONG, CHITIETTHAYDOI)
                VALUES (@ID, @MANVIEN, GETDATE(), @HANHDONG, @MADOITUONG, @CHITIET);
            `;
            
            await pool.request()
                .input('ID', sql.VarChar, newId)
                .input('MANVIEN', sql.VarChar, maNhanVien)
                .input('HANHDONG', sql.NVarChar, hanhDong)
                .input('MADOITUONG', sql.VarChar, maDoiTuong)
                .input('CHITIET', sql.NVarChar, chiTiet)
                .query(query);
            return true;
        } catch (error) {
            console.error("Lỗi ghi log thao tác:", error);
            return false; 
        }
    }
};

module.exports = ActionHistoryModel;