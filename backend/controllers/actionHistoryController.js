const ActionHistoryModel = require('../models/actionHistoryModel');

const actionHistoryController = {
    // API lấy toàn bộ lịch sử thao tác
    getActionHistory: async (req, res) => {
        try {
            const logs = await ActionHistoryModel.getAllActionHistory();
            
            res.status(200).json({
                success: true,
                message: "Lấy lịch sử thao tác thành công",
                data: logs
            });
        } catch (error) {
            console.error("Lỗi tại actionHistoryController.getActionHistory:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ nội bộ khi lấy lịch sử thao tác"
            });
        }
    }
};

module.exports = actionHistoryController;