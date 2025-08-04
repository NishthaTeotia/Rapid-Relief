const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');

// Helper function to populate common fields
const populateReportFields = async (report) => {
    return await report.populate([
        { path: 'reporter', select: 'username email role' },
        { path: 'assignedTo', select: 'username email role' }
    ]);
};

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private (Admin only)
const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({})
        .populate('reporter', 'username email role')
        .populate('assignedTo', 'username email role')
        .sort({ createdAt: -1 });

    res.status(200).json(reports);
});

// @desc    Get public reports (for public display on ReportsPage)
// @route   GET /api/reports/public
// @access  Public (no authentication required)
const getPublicReports = asyncHandler(async (req, res) => {
    // Only fetch reports with specific public-facing statuses
    // Assuming 'Pending', 'Received', 'Assigned', 'In Progress' are public statuses.
    // Adjust these statuses based on your application's public visibility rules.
    const publicStatuses = ['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Fulfilled']; // Added Resolved/Fulfilled for public view
    
    const reports = await Report.find({ status: { $in: publicStatuses } })
        .populate('reporter', 'username email role')
        .populate('assignedTo', 'username email role')
        .sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json(reports);
});


// @desc    Get reports relevant to the authenticated user (submitted by or assigned to)
// @route   GET /api/reports/my
// @access  Private (Authenticated users: Public, Volunteer, NGO, Admin)
const getMyReports = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const reports = await Report.find({
        $or: [
            { reporter: userId }, // Reports submitted by the user
            { assignedTo: userId } // Reports assigned to the user
        ]
    })
    .populate('reporter', 'username email role')
    .populate('assignedTo', 'username email role')
    .sort({ createdAt: -1 });

    res.status(200).json(reports);
});


// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (Admin or reporter of the report or assigned user)
const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('reporter', 'username email role')
        .populate('assignedTo', 'username email role');

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    // Authorization check: Admin, or the user who reported it, or the assigned user
    const isAuthorized = req.user.role === 'Admin' ||
                         (report.reporter && report.reporter._id.toString() === req.user.id) ||
                         (report.assignedTo && report.assignedTo._id.toString() === req.user.id);

    if (isAuthorized) {
        res.status(200).json(report);
    } else {
        res.status(403);
        throw new Error('Not authorized to view this report');
    }
});

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private (Users: Public, Volunteer, NGO, Admin)
const createReport = asyncHandler(async (req, res, io) => {
    const { type, description, location, severity, images } = req.body;

    if (!type || !description || !location || !location.latitude || !location.longitude) {
        res.status(400);
        throw new Error('Please include all required fields: type, description, location (latitude, longitude).');
    }

    const reporterId = req.user._id;

    const newReport = await Report.create({
        reporter: reporterId,
        type,
        description,
        severity: severity || 'Medium',
        location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address || ''
        },
        images: images || [],
        status: 'Pending',
    });

    if (newReport) {
        const populatedReport = await populateReportFields(newReport);
        io.emit('newReport', populatedReport);

        res.status(201).json({
            message: 'Emergency report submitted successfully',
            report: populatedReport,
        });
    } else {
        res.status(400);
        throw new Error('Invalid report data');
    }
});

// @desc    Update an existing report (General update, can be used by reporter or admin)
// @route   PUT /api/reports/:id
// @access  Private (Admin or reporter of the report or assigned user)
const updateReport = asyncHandler(async (req, res, io) => {
    const { type, description, location, status, severity, assignedTo, adminNotes, images } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    // Authorization check for update: Admin, or the user who reported it, or the assigned user
    const isAuthorized = req.user.role === 'Admin' ||
                         (report.reporter && report.reporter._id.toString() === req.user.id) ||
                         (report.assignedTo && report.assignedTo._id.toString() === req.user.id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this report');
    }

    // Only Admin can change assignedTo, status to 'Assigned', 'Resolved', 'Closed', 'Rejected'
    if (req.user.role !== 'Admin') {
        if (assignedTo !== undefined && assignedTo !== report.assignedTo?.toString()) {
            res.status(403);
            throw new Error('Only administrators can assign/unassign reports.');
        }
        if (status && ['Assigned', 'Resolved', 'Closed', 'Rejected'].includes(status) && status !== report.status) {
            res.status(403);
            throw new Error('Only administrators can set this status.');
        }
        if (adminNotes !== undefined) {
             res.status(403);
             throw new Error('Only administrators can add/update admin notes.');
        }
    }

    if (type) report.type = type;
    if (description) report.description = description;
    if (location) report.location = location;
    if (status) report.status = status;
    if (severity) report.severity = severity;
    if (assignedTo !== undefined) report.assignedTo = assignedTo;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (images) report.images = images;

    const updatedReport = await report.save();

    const populatedReport = await populateReportFields(updatedReport);
    io.emit('reportUpdated', populatedReport);

    res.status(200).json(populatedReport);
});

// @desc    Update emergency report status (Admin or assigned user)
// @route   PUT /api/reports/status/:id
// @access  Private (Admin or assigned user)
const updateReportStatus = asyncHandler(async (req, res, io) => {
    const { status } = req.body;

    if (!status) {
        res.status(400);
        throw new Error('Please provide a status to update');
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    // Authorization check: Admin, or the assigned user
    const isAuthorized = req.user.role === 'Admin' ||
                         (report.assignedTo && report.assignedTo._id.toString() === req.user.id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to change status of this report.');
    }

    // Define allowed status transitions for assigned users (Volunteers/NGOs)
    const allowedStatusesForAssigned = ['Received', 'In Progress', 'Resolved', 'Closed'];

    if (req.user.role !== 'Admin') {
        if (!allowedStatusesForAssigned.includes(status)) {
            res.status(403);
            throw new Error(`As a ${req.user.role}, you can only set status to: ${allowedStatusesForAssigned.join(', ')}`);
        }
        // Prevent assigned users from setting status to 'Rejected' or 'Cancelled'
        if (status === 'Rejected' || status === 'Cancelled') {
            res.status(403);
            throw new Error('Only administrators can set status to Rejected or Cancelled.');
        }
    }

    if (!['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status value provided');
    }

    report.status = status;
    const updatedReport = await report.save();

    const populatedReport = await populateReportFields(updatedReport);
    io.emit('reportUpdated', populatedReport);

    res.status(200).json({
        message: `Report ${report._id} status updated to ${status}`,
        report: populatedReport,
    });
});

// @desc    Assign an emergency report to a user (Volunteer/NGO) (Admin only)
// @route   PUT /api/reports/assign/:id
// @access  Private (Admin only)
const assignReport = asyncHandler(async (req, res, io) => {
    const { assignedToId } = req.body;

    if (assignedToId === undefined) {
        res.status(400);
        throw new Error('Please provide a user ID to assign the report to, or null to unassign.');
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    let assignee = null;
    if (assignedToId) {
        assignee = await User.findById(assignedToId);
        if (!assignee) {
            res.status(404);
            throw new Error('Assigned user not found');
        }
        if (!['Volunteer', 'NGO'].includes(assignee.role)) {
            res.status(400);
            throw new Error('Reports can only be assigned to users with "Volunteer" or "NGO" roles.');
        }
    }

    report.assignedTo = assignedToId || null;
    if (report.assignedTo && (report.status === 'Pending' || report.status === 'Received')) {
        report.status = 'Assigned';
    } else if (!report.assignedTo && report.status === 'Assigned') {
        report.status = 'Pending';
    }

    const updatedReport = await report.save();

    const populatedReport = await populateReportFields(updatedReport);
    io.emit('reportUpdated', populatedReport);

    res.status(200).json({
        message: `Report ${report._id} assigned to ${assignee ? assignee.username : 'nobody'}`,
        report: populatedReport,
    });
});

// @desc    Add/Update admin notes for a report (Admin only)
// @route   PUT /api/reports/notes/:id
// @access  Private (Admin only)
const addAdminNotes = asyncHandler(async (req, res, io) => {
    const { adminNotes } = req.body;

    if (adminNotes === undefined || adminNotes === null) {
        res.status(400);
        throw new Error('Please provide notes content');
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    report.adminNotes = adminNotes;
    const updatedReport = await report.save();

    const populatedReport = await populateReportFields(updatedReport);
    io.emit('reportUpdated', populatedReport);

    res.status(200).json({
        message: `Admin notes for report ${report._id} updated`,
        report: populatedReport,
    });
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Admin only)
const deleteReport = asyncHandler(async (req, res, io) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    await report.deleteOne();

    io.emit('reportDeleted', req.params.id);

    res.status(200).json({ message: `Report ${req.params.id} removed`, id: req.params.id });
});

module.exports = {
    getReports,
    getPublicReports, // Ensure this is exported
    getMyReports,
    getReportById,
    createReport,
    updateReport,
    updateReportStatus,
    assignReport,
    addAdminNotes,
    deleteReport,
};



