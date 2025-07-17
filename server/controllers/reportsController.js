// server/src/controllers/reportsController.js
const Report = require('../models/Report');

// Get all reports
exports.getReports = async (req, res) => {
    try {
        // We're returning all reports without complex server-side pagination for simplicity,
        // as per the frontend's current expectation.
        const reports = await Report.find().sort({ createdAt: -1 }); // Using 'createdAt' from your schema
        res.json(reports); // Sends direct array
    } catch (error) {
        console.error('Error in getReports:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        console.error('Error in getReportById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new report
exports.createReport = async (req, res, io) => { // 'io' is passed from server.js
    const { type, description, location, status, severity } = req.body; // imageUrl is removed based on your context

    // Basic validation
    if (!type || !description || !location || !location.latitude || !location.longitude) {
        return res.status(400).json({ message: 'Missing required fields (type, description, location).' });
    }

    try {
        const newReport = new Report({
            type,
            description,
            location,
            status: status || 'Pending', // Default status
            severity: severity || 'Medium' // Default severity
        });

        const savedReport = await newReport.save();

        // Emit the new report in real-time
        io.emit('newReport', savedReport);

        res.status(201).json(savedReport);
    } catch (error) {
        console.error('Error in createReport:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update an existing report
exports.updateReport = async (req, res, io) => { // 'io' is passed from server.js
    const { type, description, location, status, severity } = req.body;

    try {
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { type, description, location, status, severity },
            { new: true, runValidators: true } // Return updated document, run schema validators
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        io.emit('reportUpdated', updatedReport); // Emit real-time update

        res.json(updatedReport);
    } catch (error) {
        console.error('Error in updateReport:', error);
        res.status(400).json({ message: error.message });
    }
};

// Add a comment to a report
exports.addComment = async (req, res, io) => { // 'io' is passed from server.js
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.comments.push({ text, createdAt: new Date() });
        const savedReport = await report.save();

        io.emit('reportUpdated', savedReport); // Emit update as report content changed

        res.status(201).json(savedReport.comments[savedReport.comments.length - 1]); // Return the newly added comment
    } catch (error) {
        console.error('Error in addComment:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a report
exports.deleteReport = async (req, res, io) => { // 'io' is passed from server.js
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        io.emit('reportDeleted', deletedReport._id); // Emit ID of deleted report

        res.json({ message: 'Report deleted successfully', id: deletedReport._id });
    } catch (error) {
        console.error('Error in deleteReport:', error);
        res.status(500).json({ message: error.message });
    }
};