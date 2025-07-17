// server/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const io = require('../server').io; // Access the Socket.IO instance

// --- WARNING ---
// These routes are CURRENTLY UNPROTECTED as per your request.
// This means ANYONE can modify or delete reports if they know the API endpoint.
// For a real application, you MUST implement authentication and authorization
// for PUT, POST (comments), and DELETE routes.
// ---------------

// @desc    Get all reports with filtering, sorting, and pagination
// @route   GET /api/reports
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Destructure query parameters with default values
        const {
            status,
            type,
            severity,
            sortBy = 'createdAt', // Default sort by creation date
            sortOrder = 'desc',   // Default descending order ('asc' for ascending)
            page = 1,             // Default page number
            limit = 10            // Default reports per page
        } = req.query;

        // Build query object based on provided filters
        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (severity) query.severity = severity;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1; // -1 for descending, 1 for ascending

        // Calculate skip and limit for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const parsedLimit = parseInt(limit);

        // Fetch reports from the database
        const reports = await Report.find(query)
                                    .sort(sort)
                                    .skip(skip)
                                    .limit(parsedLimit);

        // Get total count of reports matching the filters for pagination metadata
        const totalReports = await Report.countDocuments(query);

        // Send response with reports AND pagination info in an object
        // THIS IS THE CORRECTED STRUCTURE for the frontend to work with pagination
        res.status(200).json({
            reports, // The array of reports
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReports / parsedLimit),
            totalReports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id); // Find report by ID from URL parameters
        if (!report) {
            return res.status(404).json({ message: 'Report not found' }); // If report doesn't exist
        }
        res.status(200).json(report); // Send the found report
    }
    catch (error) {
        console.error('Error fetching single report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Create a new report
// @route   POST /api/reports
// @access  Public (currently unprotected)
router.post('/', async (req, res) => {
    try {
        // Destructure fields from request body (imageUrl is removed)
        const { type, description, location, status, severity } = req.body;

        // Basic validation for required fields
        if (!type || !description || !location || !location.address || !location.latitude || !location.longitude) {
            return res.status(400).json({ message: 'Missing required report fields (type, description, location, etc.)' });
        }

        // Create a new Report instance
        const newReport = new Report({
            type,
            description,
            location: {
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
            },
            // imageUrl is intentionally REMOVED
            status: status || 'Pending', // Use provided status or default to 'Pending'
            severity: severity || 'Medium' // Use provided severity or default to 'Medium'
        });

        const savedReport = await newReport.save(); // Save the new report to MongoDB

        // Emit 'newReport' event via Socket.IO to all connected clients for real-time update
        io.emit('newReport', savedReport);

        res.status(201).json(savedReport); // Respond with the created report and 201 status
    } catch (error) {
        console.error('Error creating report:', error);
        // Handle Mongoose validation errors or other server errors
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Update an existing report
// @route   PUT /api/reports/:id
// @access  Public (currently unprotected)
router.put('/:id', async (req, res) => {
    try {
        // Destructure fields from request body (imageUrl is removed)
        const { type, description, location, status, severity } = req.body;

        // Find and update the report by ID
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id, // ID of the report to update
            // Update object: only include fields that are allowed to be updated
            { type, description, location, status, severity },
            { new: true, runValidators: true } // `new: true` returns the updated document; `runValidators: true` runs schema validators on update
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' }); // If report not found
        }

        // Emit 'reportUpdated' event via Socket.IO for global update
        io.emit('reportUpdated', updatedReport);

        res.status(200).json(updatedReport); // Respond with the updated report
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Add a comment to a report
// @route   POST /api/reports/:id/comments
// @access  Public (currently unprotected)
router.post('/:id/comments', async (req, res) => {
    try {
        const { text } = req.body; // Expecting { text: "Some comment" }

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        const report = await Report.findById(req.params.id); // Find the report
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Add the new comment to the comments array
        report.comments.push({ text, createdAt: new Date() });
        const savedReport = await report.save(); // Save the updated report

        // Emit 'reportUpdated' event via Socket.IO to notify clients
        io.emit('reportUpdated', savedReport);

        res.status(201).json(savedReport); // Respond with the updated report
    } catch (error) {
        console.error('Error adding comment to report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Public (currently unprotected)
router.delete('/:id', async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id); // Find and delete by ID
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Emit 'reportDeleted' event via Socket.IO to notify clients
        io.emit('reportDeleted', deletedReport._id); // Send the ID of the deleted report

        res.status(200).json({ message: 'Report deleted successfully', id: deletedReport._id });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;