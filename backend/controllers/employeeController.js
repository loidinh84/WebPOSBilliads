const Employee = require("../models/employeeModel");

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.getById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const result = await Employee.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 'EREQUEST' && error.message.includes('PRIMARY KEY')) {
      return res.status(400).json({ message: "Mã nhân viên hoặc tên đăng nhập đã tồn tại!" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    await Employee.update(req.params.id, req.body);
    res.json({ message: "Cập nhật nhân viên thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query; // Assuming username is passed to delete account
    await Employee.delete(id, username);
    res.json({ message: "Xóa nhân viên thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
