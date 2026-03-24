-- ============================================================
-- HỆ THỐNG POS QUẢN LÝ BILLIARDS
-- Database: SQL Server
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BilliardsPOS')
    DROP DATABASE BilliardsPOS;
GO

CREATE DATABASE BilliardsPOS
    COLLATE Vietnamese_CI_AS;
GO

USE BilliardsPOS;
GO

-- ============================================================
-- 1. DANHMUC - Danh mục hàng hóa
-- ============================================================
CREATE TABLE DANHMUC (
    MADANHMUC       NVARCHAR(20)    NOT NULL,
    TENDANHMUC      NVARCHAR(100)   NOT NULL,
    MOTA            NVARCHAR(500)   NULL,
    THUTU           INT             NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_DANHMUC PRIMARY KEY (MADANHMUC)
);
GO

-- ============================================================
-- 2. NHACUNGCAP - Nhà cung cấp
-- ============================================================
CREATE TABLE NHACUNGCAP (
    MANCC           NVARCHAR(20)    NOT NULL,
    TENNCC          NVARCHAR(150)   NOT NULL,
    SDT             NVARCHAR(15)    NULL,
    DIACHI          NVARCHAR(300)   NULL,
    EMAIL           NVARCHAR(150)   NULL,
    CONSTRAINT PK_NHACUNGCAP PRIMARY KEY (MANCC)
);
GO

-- ============================================================
-- 3. HANGHOA - Hàng hóa (nước, thức ăn, phụ kiện...)
-- ============================================================
CREATE TABLE HANGHOA (
    MAHANGHOA       NVARCHAR(20)    NOT NULL,
    MANCC           NVARCHAR(20)    NULL,
    MADANHMUC       NVARCHAR(20)    NULL,
    TENHANGHOA      NVARCHAR(150)   NOT NULL,
    DONGIABAN       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    SOLUONGTONKHO   INT             NOT NULL DEFAULT 0,
    DONVITINH       NVARCHAR(30)    NULL,
    HINHANH         NVARCHAR(300)   NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_HANGHOA PRIMARY KEY (MAHANGHOA),
    CONSTRAINT FK_HANGHOA_NCC      FOREIGN KEY (MANCC)      REFERENCES NHACUNGCAP(MANCC),
    CONSTRAINT FK_HANGHOA_DANHMUC  FOREIGN KEY (MADANHMUC)  REFERENCES DANHMUC(MADANHMUC)
);
GO

-- ============================================================
-- 4. XUATHUY - Phiếu xuất hủy hàng hóa
-- ============================================================
CREATE TABLE XUATHUY (
    MAXUATHUY       NVARCHAR(20)    NOT NULL,
    NGAYXUATHUY     DATETIME        NOT NULL DEFAULT GETDATE(),
    LYDO            NVARCHAR(500)   NULL,
    TONGTIEN        DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_XUATHUY PRIMARY KEY (MAXUATHUY)
);
GO

-- ============================================================
-- 5. CHITETXUATHUY - Chi tiết phiếu xuất hủy
-- ============================================================
CREATE TABLE CHITETXUATHUY (
    MACHITETXUATHUY NVARCHAR(20)    NOT NULL,
    MAHANGHOA       NVARCHAR(20)    NOT NULL,
    MAXUATHUY       NVARCHAR(20)    NOT NULL,
    SOLUONG         INT             NOT NULL DEFAULT 0,
    GIATRITHETHAI   DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_CHITETXUATHUY PRIMARY KEY (MACHITETXUATHUY),
    CONSTRAINT FK_CTXUATHUY_HH  FOREIGN KEY (MAHANGHOA)  REFERENCES HANGHOA(MAHANGHOA),
    CONSTRAINT FK_CTXUATHUY_XH  FOREIGN KEY (MAXUATHUY)  REFERENCES XUATHUY(MAXUATHUY)
);
GO

-- ============================================================
-- 6. KIEMKHO - Phiếu kiểm kho
-- ============================================================
CREATE TABLE KIEMKHO (
    MAKIEMKHO           NVARCHAR(20)    NOT NULL,
    THOIGIAN            DATETIME        NOT NULL DEFAULT GETDATE(),
    NGAYCANBANG         DATETIME        NULL,
    TRANGTHAI           NVARCHAR(30)    NOT NULL DEFAULT N'Chờ duyệt',
    TONGCHENHLECH       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    SOLUONGLECHTANG     INT             NOT NULL DEFAULT 0,
    SOLUONGLECHGIAM     INT             NOT NULL DEFAULT 0,
    GHICHU              NVARCHAR(500)   NULL,
    CONSTRAINT PK_KIEMKHO PRIMARY KEY (MAKIEMKHO)
);
GO

-- ============================================================
-- 7. CHITETKIEMKHO - Chi tiết kiểm kho
-- ============================================================
CREATE TABLE CHITETKIEMKHO (
    MACHITETKIEMKHO     NVARCHAR(20)    NOT NULL,
    MAHANGHOA           NVARCHAR(20)    NOT NULL,
    MAKIEMKHO           NVARCHAR(20)    NOT NULL,
    TONKHO              INT             NOT NULL DEFAULT 0,
    SOLUONGCHENHLECH    INT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_CHITETKIEMKHO PRIMARY KEY (MACHITETKIEMKHO),
    CONSTRAINT FK_CTKIEMKHO_HH  FOREIGN KEY (MAHANGHOA)  REFERENCES HANGHOA(MAHANGHOA),
    CONSTRAINT FK_CTKIEMKHO_KK  FOREIGN KEY (MAKIEMKHO)  REFERENCES KIEMKHO(MAKIEMKHO)
);
GO

-- ============================================================
-- 8. NHAPKHO - Phiếu nhập kho
-- ============================================================
CREATE TABLE NHAPKHO (
    MAPHEUNHAP      NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    MANCC           NVARCHAR(20)    NOT NULL,
    THOIGIAN        DATETIME        NOT NULL DEFAULT GETDATE(),
    TONGTEN         DECIMAL(18,0)   NOT NULL DEFAULT 0,
    GHICHU          NVARCHAR(500)   NULL,
    SOLUONG         INT             NOT NULL DEFAULT 0,
    TRANG           NVARCHAR(30)    NOT NULL DEFAULT N'Chờ duyệt',
    CANTRANCC       NVARCHAR(300)   NULL,
    CONSTRAINT PK_NHAPKHO PRIMARY KEY (MAPHEUNHAP),
    CONSTRAINT FK_NHAPKHO_NCC   FOREIGN KEY (MANCC)   REFERENCES NHACUNGCAP(MANCC)
    -- FK_NHAPKHO_NV added after NHANVIEN table
);
GO

-- ============================================================
-- 9. CHITIETNHAPKHO - Chi tiết phiếu nhập kho
-- ============================================================
CREATE TABLE CHITIETNHAPKHO (
    MACHITETNHAPKHO NVARCHAR(20)    NOT NULL,
    MAHANGHOA       NVARCHAR(20)    NOT NULL,
    MAPHEUNHAP      NVARCHAR(20)    NOT NULL,
    SOLUONGNHAP     INT             NOT NULL DEFAULT 0,
    DONGIA          DECIMAL(18,0)   NOT NULL DEFAULT 0,
    THANHTIEN       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_CHITIETNHAPKHO PRIMARY KEY (MACHITETNHAPKHO),
    CONSTRAINT FK_CTNHAPKHO_HH  FOREIGN KEY (MAHANGHOA)   REFERENCES HANGHOA(MAHANGHOA),
    CONSTRAINT FK_CTNHAPKHO_NK  FOREIGN KEY (MAPHEUNHAP)  REFERENCES NHAPKHO(MAPHEUNHAP)
);
GO

-- ============================================================
-- 10. PHIEUTRAHANGNHAP - Phiếu trả hàng nhập
-- ============================================================
CREATE TABLE PHIEUTRAHANGNHAP (
    MAPHIEUTRAHANGNHAP  NVARCHAR(20)    NOT NULL,
    MANCC               NVARCHAR(20)    NOT NULL,
    MANVIEN             NVARCHAR(20)    NOT NULL,
    THOIGIAN            DATETIME        NOT NULL DEFAULT GETDATE(),
    TONGTENHANGTHANG    DECIMAL(18,0)   NOT NULL DEFAULT 0,
    NCCCANTRA           NVARCHAR(300)   NULL,
    GIAMGIA             DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_PHIEUTRAHANGNHAP PRIMARY KEY (MAPHIEUTRAHANGNHAP),
    CONSTRAINT FK_PTHN_NCC FOREIGN KEY (MANCC) REFERENCES NHACUNGCAP(MANCC)
    -- FK_PTHN_NV added after NHANVIEN
);
GO

-- ============================================================
-- 11. CHITIETTRAHANGNHAP - Chi tiết phiếu trả hàng nhập
-- ============================================================
CREATE TABLE CHITIETTRAHANGNHAP (
    MACHITIETTRAHANGNHAP    NVARCHAR(20)    NOT NULL,
    MAPHIEUTRAHANGNHAP      NVARCHAR(20)    NOT NULL,
    MAHANGHOA               NVARCHAR(20)    NOT NULL,
    LYDOTRA                 NVARCHAR(300)   NULL,
    SOLUONG                 INT             NOT NULL DEFAULT 0,
    DONGIATRA               DECIMAL(18,0)   NOT NULL DEFAULT 0,
    THANHTIEN               DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_CHITIETTRAHANGNHAP PRIMARY KEY (MACHITIETTRAHANGNHAP),
    CONSTRAINT FK_CTTRAHN_PTHN  FOREIGN KEY (MAPHIEUTRAHANGNHAP) REFERENCES PHIEUTRAHANGNHAP(MAPHIEUTRAHANGNHAP),
    CONSTRAINT FK_CTTRAHN_HH    FOREIGN KEY (MAHANGHOA)           REFERENCES HANGHOA(MAHANGHOA)
);
GO

-- ============================================================
-- 12. MAUIN - Mẫu in hóa đơn / template
-- ============================================================
CREATE TABLE MAUIN (
    MAMAU           NVARCHAR(20)    NOT NULL,
    TENMAU          NVARCHAR(100)   NOT NULL,
    LOAMAU          NVARCHAR(50)    NULL,
    NOIDUNGHTML     NVARCHAR(MAX)   NULL,
    KICHTHUOC       NVARCHAR(50)    NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_MAUIN PRIMARY KEY (MAMAU)
);
GO

-- ============================================================
-- 13. THIETLAPCUAHANG - Thông tin cửa hàng
-- ============================================================
CREATE TABLE THIETLAPCUAHANG (
    MACUAHANG       NVARCHAR(20)    NOT NULL,
    TENCUAHANG      NVARCHAR(150)   NOT NULL,
    SDT             NVARCHAR(15)    NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    ANHDAIEN        NVARCHAR(300)   NULL,
    TENTAIKHOAN     NVARCHAR(100)   NULL,
    SOTAIKHOAN      NVARCHAR(50)    NULL,
    CONSTRAINT PK_THIETLAPCUAHANG PRIMARY KEY (MACUAHANG)
);
GO

-- ============================================================
-- 14. TAIKHOAN - Tài khoản đăng nhập hệ thống
-- ============================================================
CREATE TABLE TAIKHOAN (
    TENDANGNHAP     NVARCHAR(50)    NOT NULL,
    MATKHAU         NVARCHAR(256)   NOT NULL,
    QUYENHAN        NVARCHAR(50)    NOT NULL DEFAULT N'Nhân viên',
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    QUENMATKHAU     NVARCHAR(256)   NULL,
    DUYTRIDANGNHAP  NVARCHAR(256)   NULL,
    CONSTRAINT PK_TAIKHOAN PRIMARY KEY (TENDANGNHAP)
);
GO

-- ============================================================
-- 15. NHANVIEN - Nhân viên
-- ============================================================
CREATE TABLE NHANVIEN (
    MANVIEN         NVARCHAR(20)    NOT NULL,
    TENDANGNHAP     NVARCHAR(50)    NULL,
    TENNGUOIDUNG    NVARCHAR(100)   NOT NULL,
    MATKHAU         NVARCHAR(256)   NULL,
    SDT             NVARCHAR(15)    NULL,
    GMAIL           NVARCHAR(150)   NULL,
    CHUCVU          NVARCHAR(50)    NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_NHANVIEN PRIMARY KEY (MANVIEN),
    CONSTRAINT FK_NHANVIEN_TK FOREIGN KEY (TENDANGNHAP) REFERENCES TAIKHOAN(TENDANGNHAP)
);
GO

-- Thêm FK cho NHAPKHO và PHIEUTRAHANGNHAP sau khi có NHANVIEN
ALTER TABLE NHAPKHO
    ADD CONSTRAINT FK_NHAPKHO_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN);
GO

ALTER TABLE PHIEUTRAHANGNHAP
    ADD CONSTRAINT FK_PTHN_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN);
GO

-- ============================================================
-- 16. LUONG - Lương nhân viên
-- ============================================================
CREATE TABLE LUONG (
    MALUONG         NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    KYTRALUONG      NVARCHAR(30)    NULL,
    TONGGIOLAM      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    TONGLUONG       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONCANTRA       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_LUONG PRIMARY KEY (MALUONG),
    CONSTRAINT FK_LUONG_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 17. LICHLAMVIEC - Lịch làm việc
-- ============================================================
CREATE TABLE LICHLAMVIEC (
    MALICH          NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    CALAM           NVARCHAR(50)    NULL,
    NGAY            DATE            NOT NULL,
    GIOBATDAU       TIME            NULL,
    GIOKETTHUC      TIME            NULL,
    CONSTRAINT PK_LICHLAMVIEC PRIMARY KEY (MALICH),
    CONSTRAINT FK_LICHLAMVIEC_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 18. LICHSUTHAOTAC - Lịch sử thao tác hệ thống
-- ============================================================
CREATE TABLE LICHSUTHAOTAC (
    MATHAOTAC       NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    THOIGIAN        DATETIME        NOT NULL DEFAULT GETDATE(),
    HANHDONG        NVARCHAR(200)   NULL,
    CHITIETTHAYDOI  NVARCHAR(MAX)   NULL,
    CONSTRAINT PK_LICHSUTHAOTAC PRIMARY KEY (MATHAOTAC),
    CONSTRAINT FK_LSTT_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 19. CHAMCONG - Chấm công nhân viên
-- ============================================================
CREATE TABLE CHAMCONG (
    MACHAMCONG      NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    NGAY            DATE            NOT NULL,
    GIOVAO          TIME            NULL,
    GIORA           TIME            NULL,
    TONGGIO         DECIMAL(5,2)    NULL,
    GHICHU          NVARCHAR(300)   NULL,
    CONSTRAINT PK_CHAMCONG PRIMARY KEY (MACHAMCONG),
    CONSTRAINT FK_CHAMCONG_NV FOREIGN KEY (MANVIEN) REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 20. KHUYENMAI - Khuyến mãi
-- ============================================================
CREATE TABLE KHUYENMAI (
    MAKHUYENMAI     NVARCHAR(20)    NOT NULL,
    NGAYBATDAU      DATE            NOT NULL,
    NGAYKETTHUC     DATE            NOT NULL,
    MACHITETKHOAN   NVARCHAR(200)   NULL,
    TRANGTHAI       BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_KHUYENMAI PRIMARY KEY (MAKHUYENMAI)
);
GO

-- ============================================================
-- 21. BAN - Bàn billiards
-- ============================================================
CREATE TABLE BAN (
    MABAN           NVARCHAR(20)    NOT NULL,
    TENBAN          NVARCHAR(50)    NOT NULL,
    KHUVUC          NVARCHAR(50)    NULL,
    TRANGTHAI       NVARCHAR(30)    NOT NULL DEFAULT N'Trống',
        -- N'Trống' | N'Đang chơi' | N'Bảo trì' | N'Đặt trước'
    LOAIBAN         NVARCHAR(50)    NULL,
        -- N'Bàn 8 bi' | N'Bàn 9 bi' | N'Snooker' | N'Carom'
    GIAGIO          DECIMAL(18,0)   NOT NULL DEFAULT 0,
    GHICHU          NVARCHAR(300)   NULL,
    CONSTRAINT PK_BAN PRIMARY KEY (MABAN)
);
GO

-- ============================================================
-- 22. DATBAN - Đặt bàn trước  *** BẢNG BỔ SUNG ***
-- ============================================================
CREATE TABLE DATBAN (
    MADATBAN        NVARCHAR(20)    NOT NULL,
    MABAN           NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NULL,           -- NV tiếp nhận đặt bàn
    TENKHACHHANG    NVARCHAR(100)   NOT NULL,
    SDTKHACHHANG    NVARCHAR(15)    NULL,
    THOIGIANDATBAN  DATETIME        NOT NULL DEFAULT GETDATE(),
    THOIGIANDEN     DATETIME        NOT NULL,        -- Giờ dự kiến đến
    THOIGIANKET     DATETIME        NULL,            -- Giờ dự kiến kết thúc
    SODATCHOI       INT             NOT NULL DEFAULT 1,
    TIENCOC         DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TRANGTHAI       NVARCHAR(30)    NOT NULL DEFAULT N'Chờ xác nhận',
        -- N'Chờ xác nhận' | N'Đã xác nhận' | N'Đã đến' | N'Huỷ' | N'Hoàn thành'
    GHICHU          NVARCHAR(500)   NULL,
    CONSTRAINT PK_DATBAN PRIMARY KEY (MADATBAN),
    CONSTRAINT FK_DATBAN_BAN FOREIGN KEY (MABAN)    REFERENCES BAN(MABAN),
    CONSTRAINT FK_DATBAN_NV  FOREIGN KEY (MANVIEN)  REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 23. HOADON - Hóa đơn bán hàng
-- ============================================================
CREATE TABLE HOADON (
    MAHOADON        NVARCHAR(20)    NOT NULL,
    MABAN           NVARCHAR(20)    NOT NULL,
    MANVIEN         NVARCHAR(20)    NOT NULL,
    MAKHUYENMAI     NVARCHAR(20)    NULL,
    MADATBAN        NVARCHAR(20)    NULL,            -- Liên kết với đặt bàn (nếu có)
    NGAY            DATETIME        NOT NULL DEFAULT GETDATE(),
    GIOBATDAU       DATETIME        NULL,
    GIOKETTHUC      DATETIME        NULL,
    TONGTIENGIO     DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TONGTIENHANG    DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TONGTIENGIO_    DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TONGTHANHTOAN   DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TRANGTHAI       NVARCHAR(30)    NOT NULL DEFAULT N'Đang chơi',
        -- N'Đang chơi' | N'Chờ thanh toán' | N'Đã thanh toán' | N'Huỷ'
    CONSTRAINT PK_HOADON PRIMARY KEY (MAHOADON),
    CONSTRAINT FK_HOADON_BAN    FOREIGN KEY (MABAN)       REFERENCES BAN(MABAN),
    CONSTRAINT FK_HOADON_NV     FOREIGN KEY (MANVIEN)     REFERENCES NHANVIEN(MANVIEN),
    CONSTRAINT FK_HOADON_KM     FOREIGN KEY (MAKHUYENMAI) REFERENCES KHUYENMAI(MAKHUYENMAI),
    CONSTRAINT FK_HOADON_DB     FOREIGN KEY (MADATBAN)    REFERENCES DATBAN(MADATBAN)
);
GO

-- ============================================================
-- 24. THANHTOAN - Thanh toán hóa đơn  *** BẢNG BỔ SUNG ***
-- ============================================================
CREATE TABLE THANHTOAN (
    MATHANHTOAN         NVARCHAR(20)    NOT NULL,
    MAHOADON            NVARCHAR(20)    NOT NULL,
    MANVIEN             NVARCHAR(20)    NOT NULL,
    THOIGIAN            DATETIME        NOT NULL DEFAULT GETDATE(),
    PHUONGTHUC          NVARCHAR(50)    NOT NULL DEFAULT N'Tiền mặt',
        -- N'Tiền mặt' | N'Chuyển khoản' | N'Thẻ ngân hàng' | N'Ví điện tử' | N'Kết hợp'
    SOTIENTHANHTOAN     DECIMAL(18,0)   NOT NULL DEFAULT 0,
    TIENKHACHANGUA      DECIMAL(18,0)   NOT NULL DEFAULT 0,  -- Tiền khách đưa (tiền mặt)
    TIENTHOI            DECIMAL(18,0)   NOT NULL DEFAULT 0,  -- Tiền thối lại
    TIENCOCKHAUAN       DECIMAL(18,0)   NOT NULL DEFAULT 0,  -- Trừ tiền cọc đặt bàn
    MAGIAODICH          NVARCHAR(100)   NULL,                -- Mã giao dịch ngân hàng/ví
    TRANGTHAI           NVARCHAR(30)    NOT NULL DEFAULT N'Thành công',
        -- N'Thành công' | N'Thất bại' | N'Hoàn tiền'
    GHICHU              NVARCHAR(500)   NULL,
    CONSTRAINT PK_THANHTOAN PRIMARY KEY (MATHANHTOAN),
    CONSTRAINT FK_TT_HOADON FOREIGN KEY (MAHOADON) REFERENCES HOADON(MAHOADON),
    CONSTRAINT FK_TT_NV     FOREIGN KEY (MANVIEN)  REFERENCES NHANVIEN(MANVIEN)
);
GO

-- ============================================================
-- 25. CHITIETHOADON - Chi tiết hàng hóa trong hóa đơn
-- ============================================================
CREATE TABLE CHITIETHOADON (
    MAHANGHOA       NVARCHAR(20)    NOT NULL,
    MAHOADON        NVARCHAR(20)    NOT NULL,
    MACHITETHOADON  NVARCHAR(20)    NOT NULL,
    SOLUONG         INT             NOT NULL DEFAULT 1,
    DONGIA          DECIMAL(18,0)   NOT NULL DEFAULT 0,
    THANHTIEN       DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_CHITIETHOADON PRIMARY KEY (MACHITETHOADON),
    CONSTRAINT FK_CTHD_HH   FOREIGN KEY (MAHANGHOA) REFERENCES HANGHOA(MAHANGHOA),
    CONSTRAINT FK_CTHD_HD   FOREIGN KEY (MAHOADON)  REFERENCES HOADON(MAHOADON)
);
GO

-- ============================================================
-- 26. CHITIETPHIEUNHAP - Chi tiết phiếu nhập (alias bảng NHAPKHO detail)
-- ============================================================
CREATE TABLE CHITIETPHIEUNHAP (
    MACHITIETPHIEUNHAP  NVARCHAR(20)    NOT NULL,
    MAPHEUNHAP          NVARCHAR(20)    NOT NULL,
    MAHANGHOA           NVARCHAR(20)    NOT NULL,
    SOLUONGNHAP         INT             NOT NULL DEFAULT 0,
    DONGIA              DECIMAL(18,0)   NOT NULL DEFAULT 0,
    THANHTIEN           DECIMAL(18,0)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_CHITIETPHIEUNHAP PRIMARY KEY (MACHITIETPHIEUNHAP),
    CONSTRAINT FK_CTPN_NK FOREIGN KEY (MAPHEUNHAP) REFERENCES NHAPKHO(MAPHEUNHAP),
    CONSTRAINT FK_CTPN_HH FOREIGN KEY (MAHANGHOA)  REFERENCES HANGHOA(MAHANGHOA)
);
GO

-- ============================================================
-- INDEX hỗ trợ tìm kiếm nhanh
-- ============================================================
CREATE INDEX IX_HOADON_MABAN         ON HOADON(MABAN);
CREATE INDEX IX_HOADON_MANVIEN       ON HOADON(MANVIEN);
CREATE INDEX IX_HOADON_NGAY          ON HOADON(NGAY);
CREATE INDEX IX_HOADON_TRANGTHAI     ON HOADON(TRANGTHAI);
CREATE INDEX IX_THANHTOAN_MAHOADON   ON THANHTOAN(MAHOADON);
CREATE INDEX IX_THANHTOAN_THOIGIAN   ON THANHTOAN(THOIGIAN);
CREATE INDEX IX_DATBAN_MABAN         ON DATBAN(MABAN);
CREATE INDEX IX_DATBAN_THOIGIANDEN   ON DATBAN(THOIGIANDEN);
CREATE INDEX IX_DATBAN_TRANGTHAI     ON DATBAN(TRANGTHAI);
CREATE INDEX IX_BAN_TRANGTHAI        ON BAN(TRANGTHAI);
CREATE INDEX IX_HANGHOA_MADANHMUC    ON HANGHOA(MADANHMUC);
GO

-- ============================================================
-- DỮ LIỆU MẪU - DEMO
-- ============================================================

-- Danh mục hàng hóa
INSERT INTO DANHMUC VALUES
(N'DM001', N'Nước uống',      N'Các loại nước giải khát', 1, 1),
(N'DM002', N'Thức ăn nhẹ',    N'Snack, bánh kẹo',         2, 1),
(N'DM003', N'Phụ kiện',       N'Cơ, phấn, găng tay...',   3, 1),
(N'DM004', N'Thuốc lá',       N'Thuốc lá các loại',        4, 1);
GO

-- Nhà cung cấp
INSERT INTO NHACUNGCAP VALUES
(N'NCC001', N'Công ty TNHH Thức uống ABC', N'0901234567', N'123 Lê Lợi, Q1, TP.HCM', N'abc@email.com'),
(N'NCC002', N'Nhà phân phối XYZ',          N'0987654321', N'456 Nguyễn Huệ, Q1',     N'xyz@email.com');
GO

-- Hàng hóa
INSERT INTO HANGHOA (MAHANGHOA, MANCC, MADANHMUC, TENHANGHOA, DONGIABAN, SOLUONGTONKHO, DONVITINH) VALUES
(N'HH001', N'NCC001', N'DM001', N'Nước suối Lavie 500ml',  10000,  100, N'Chai'),
(N'HH002', N'NCC001', N'DM001', N'Coca Cola lon 330ml',    15000,   80, N'Lon'),
(N'HH003', N'NCC001', N'DM001', N'Bia Tiger lon 330ml',    25000,   60, N'Lon'),
(N'HH004', N'NCC002', N'DM002', N'Snack Pringles',         35000,   40, N'Hộp'),
(N'HH005', N'NCC002', N'DM003', N'Phấn billiards Master',   5000,  200, N'Viên'),
(N'HH006', N'NCC002', N'DM003', N'Cơ billiards loại A',  500000,   10, N'Cây');
GO

-- Tài khoản
INSERT INTO TAIKHOAN (TENDANGNHAP, MATKHAU, QUYENHAN) VALUES
(N'admin',   N'$2a$12$hashedpassword1', N'Quản lý'),
(N'nv01',    N'$2a$12$hashedpassword2', N'Nhân viên'),
(N'nv02',    N'$2a$12$hashedpassword3', N'Nhân viên');
GO

-- Nhân viên
INSERT INTO NHANVIEN (MANVIEN, TENDANGNHAP, TENNGUOIDUNG, SDT, CHUCVU) VALUES
(N'NV001', N'admin', N'Nguyễn Văn Quản Lý', N'0901111111', N'Quản lý'),
(N'NV002', N'nv01',  N'Trần Thị Thu',        N'0902222222', N'Nhân viên'),
(N'NV003', N'nv02',  N'Lê Văn Hùng',         N'0903333333', N'Nhân viên');
GO

-- Bàn billiards
INSERT INTO BAN (MABAN, TENBAN, KHUVUC, TRANGTHAI, LOAIBAN, GIAGIO) VALUES
(N'B001', N'Bàn 1', N'Tầng 1', N'Trống', N'Bàn 9 bi',  80000),
(N'B002', N'Bàn 2', N'Tầng 1', N'Trống', N'Bàn 9 bi',  80000),
(N'B003', N'Bàn 3', N'Tầng 1', N'Trống', N'Bàn 8 bi',  70000),
(N'B004', N'Bàn 4', N'Tầng 2', N'Trống', N'Snooker',   120000),
(N'B005', N'Bàn 5', N'Tầng 2', N'Trống', N'Carom',     100000);
GO

-- Khuyến mãi
INSERT INTO KHUYENMAI (MAKHUYENMAI, NGAYBATDAU, NGAYKETTHUC, MACHITETKHOAN) VALUES
(N'KM001', '2026-01-01', '2026-06-30', N'Giảm 10% tổng hóa đơn'),
(N'KM002', '2026-03-01', '2026-03-31', N'Tặng 1 nước khi chơi từ 2 giờ');
GO

-- Đặt bàn mẫu
INSERT INTO DATBAN (MADATBAN, MABAN, MANVIEN, TENKHACHHANG, SDTKHACHHANG,
                    THOIGIANDEN, THOIGIANKET, SODATCHOI, TIENCOC, TRANGTHAI) VALUES
(N'DB001', N'B001', N'NV002', N'Nguyễn Minh Khoa', N'0912345678',
 '2026-03-25 18:00:00', '2026-03-25 20:00:00', 2, 100000, N'Đã xác nhận'),
(N'DB002', N'B004', N'NV002', N'Trần Quốc Bảo',    N'0987654321',
 '2026-03-25 19:00:00', NULL, 3, 50000, N'Chờ xác nhận');
GO

-- Hóa đơn mẫu
INSERT INTO HOADON (MAHOADON, MABAN, MANVIEN, NGAY, GIOBATDAU, GIOKETTHUC,
                    TONGTIENGIO, TONGTIENHANG, TONGTHANHTOAN, TRANGTHAI) VALUES
(N'HD001', N'B002', N'NV002',
 '2026-03-24 14:00:00', '2026-03-24 14:00:00', '2026-03-24 16:00:00',
 160000, 50000, 210000, N'Đã thanh toán'),
(N'HD002', N'B003', N'NV003',
 '2026-03-24 15:30:00', '2026-03-24 15:30:00', NULL,
 0, 30000, 0, N'Đang chơi');
GO

-- Chi tiết hóa đơn mẫu
INSERT INTO CHITIETHOADON (MAHANGHOA, MAHOADON, MACHITETHOADON, SOLUONG, DONGIA, THANHTIEN) VALUES
(N'HH002', N'HD001', N'CTHD001', 2, 15000, 30000),
(N'HH001', N'HD001', N'CTHD002', 2, 10000, 20000),
(N'HH003', N'HD002', N'CTHD003', 1, 25000, 25000);
GO

-- Thanh toán mẫu
INSERT INTO THANHTOAN (MATHANHTOAN, MAHOADON, MANVIEN, THOIGIAN,
                       PHUONGTHUC, SOTIENTHANHTOAN, TIENKHACHANGUA, TIENTHOI, TRANGTHAI) VALUES
(N'TT001', N'HD001', N'NV002', '2026-03-24 16:05:00',
 N'Tiền mặt', 210000, 220000, 10000, N'Thành công');
GO

-- ============================================================
-- VIEW hữu ích
-- ============================================================

-- View hóa đơn đang mở (đang chơi hoặc chờ thanh toán)
CREATE VIEW V_HOADON_DANMO AS
SELECT
    HD.MAHOADON,
    B.TENBAN,
    B.LOAIBAN,
    NV.TENNGUOIDUNG     AS TENNHANVIEN,
    HD.GIOBATDAU,
    DATEDIFF(MINUTE, HD.GIOBATDAU, GETDATE()) AS SOGIOPHUT,
    HD.TONGTIENGIO,
    HD.TONGTIENHANG,
    HD.TRANGTHAI
FROM HOADON HD
JOIN BAN     B  ON HD.MABAN    = B.MABAN
JOIN NHANVIEN NV ON HD.MANVIEN = NV.MANVIEN
WHERE HD.TRANGTHAI IN (N'Đang chơi', N'Chờ thanh toán');
GO

-- View đặt bàn hôm nay
CREATE VIEW V_DATBAN_HOMNAY AS
SELECT
    DB.MADATBAN,
    B.TENBAN,
    B.LOAIBAN,
    DB.TENKHACHHANG,
    DB.SDTKHACHHANG,
    DB.THOIGIANDEN,
    DB.THOIGIANKET,
    DB.SODATCHOI,
    DB.TIENCOC,
    DB.TRANGTHAI
FROM DATBAN DB
JOIN BAN B ON DB.MABAN = B.MABAN
WHERE CAST(DB.THOIGIANDEN AS DATE) = CAST(GETDATE() AS DATE);
GO

-- View doanh thu theo ngày
CREATE VIEW V_DOANHTHU_NGAY AS
SELECT
    CAST(TT.THOIGIAN AS DATE)   AS NGAY,
    COUNT(TT.MATHANHTOAN)       AS SOHOADON,
    SUM(TT.SOTIENTHANHTOAN)     AS TONGDOANHTHU,
    SUM(CASE WHEN TT.PHUONGTHUC = N'Tiền mặt'      THEN TT.SOTIENTHANHTOAN ELSE 0 END) AS TIENMAT,
    SUM(CASE WHEN TT.PHUONGTHUC = N'Chuyển khoản'  THEN TT.SOTIENTHANHTOAN ELSE 0 END) AS CHUYENKHOAN,
    SUM(CASE WHEN TT.PHUONGTHUC = N'Ví điện tử'    THEN TT.SOTIENTHANHTOAN ELSE 0 END) AS VIDIENTU
FROM THANHTOAN TT
WHERE TT.TRANGTHAI = N'Thành công'
GROUP BY CAST(TT.THOIGIAN AS DATE);
GO

PRINT N'Tạo database BilliardsPOS thành công!';
GO