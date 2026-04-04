const khuyenmaiModel = require("../models/khuyenmaiModel");

const khuyenmaiController = {
  getDiscounts: async (req, res) => {
    try {
      const data = await khuyenmaiModel.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  createDiscount: async (req, res) => {
    try {
      await khuyenmaiModel.create(req.body);
      res.status(201).json({ success: true, message: "Tạo khuyến mãi thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateDiscount: async (req, res) => {
    try {
      await khuyenmaiModel.update(req.params.id, req.body);
      res.status(200).json({ success: true, message: "Cập nhật khuyến mãi thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteDiscount: async (req, res) => {
    try {
      await khuyenmaiModel.delete(req.params.id);
      res.status(200).json({ success: true, message: "Xóa khuyến mãi thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = khuyenmaiController;
