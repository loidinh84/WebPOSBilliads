const { sql, poolPromise } = require('../config/db'); 

const ActionHistoryModel = {
    // Hàm 1: Lấy danh sách lịch sử thao tác (hiển thị lên Frontend)
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

    // Hàm 2: Ghi log thao tác mới (để gọi ở các Controller khác)
    insertActionLog: async (maNhanVien, hanhDong, maDoiTuong, chiTiet) => {
        try {
            const pool = await poolPromise;
            
            // Tự động tính ID mới nhất (MAX + 1) để tránh lỗi NULL Khóa chính
            const query = `
                INSERT INTO LichSuThaoTac (MATHAOTAC, MANVIEN, THOIGIAN, HANHDONG, MADOITUONG, CHITIETTHAYDOI)
                SELECT 
                    ISNULL(MAX(MATHAOTAC), 0) + 1, 
                    @MANVIEN, GETDATE(), @HANHDONG, @MADOITUONG, @CHITIET
                FROM LichSuThaoTac
            `;

            await pool.request()
                .input('MANVIEN', sql.VarChar, maNhanVien)
                .input('HANHDONG', sql.NVarChar, hanhDong)
                .input('MADOITUONG', sql.VarChar, maDoiTuong)
                .input('CHITIET', sql.NVarChar, chiTiet)
                .query(query);
            return true;
        } catch (error) {
            console.error("Lỗi ghi log thao tác:", error);
            return false; // Không crash app nếu ghi log thất bại
        }
    }
};

module.exports = ActionHistoryModel;