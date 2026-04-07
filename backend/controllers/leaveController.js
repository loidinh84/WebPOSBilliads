const LeaveRequest = require("../models/leaveModel");

const getAllPendingRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.getAllPending();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LeaveRequest.approve(id);
    res.json({ message: "Đã duyệt yêu cầu và cập nhật trạng thái nhân viên!", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LeaveRequest.reject(id);
    res.json({ message: "Đã từ chối yêu cầu nghỉ phép!", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPendingRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};
