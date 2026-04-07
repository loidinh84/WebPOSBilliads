const express = require('express');
const router = express.Router();
const actionHistoryController = require('../controllers/actionHistoryController');

// Khai báo route GET
router.get('/', actionHistoryController.getActionHistory);

module.exports = router;