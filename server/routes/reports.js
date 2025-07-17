// server/routes/reports.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

module.exports = (io) => {
    router.get('/', reportsController.getReports);
    router.post('/', (req, res) => reportsController.createReport(req, res, io));
    
    // Add other routes (GET by ID, PUT, DELETE) as needed
    
    return router;
};