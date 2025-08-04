const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User'); // Import User model for population and assignee validation
const asyncHandler = require('express-async-handler'); // For consistent error handling

// Helper function to populate common fields for HelpRequests
const populateHelpRequestFields = async (helpRequest) => {
    return await helpRequest.populate([
        { path: 'requestedBy', select: 'username email role' },
        { path: 'assignedTo', select: 'username email role' }
    ]);
};

// @desc    Get all public help/resource requests
// @route   GET /api/help-requests/public
// @access  Public
const getPublicHelpRequests = asyncHandler(async (req, res) => {
    const publicStatuses = ['Pending', 'Received', 'In Progress'];
    const helpRequests = await HelpRequest.find({ status: { $in: publicStatuses } })
        .select('-requestedBy -assignedTo -adminNotes -contactInfo.email -contactInfo.phone') // Exclude sensitive fields
        .sort({ requestedAt: -1 });

    res.json(helpRequests);
});

// @desc    Get all help/resource requests (Admin view)
// @route   GET /api/help-requests
// @access  Admin
const getAllHelpRequests = asyncHandler(async (req, res) => {
    const helpRequests = await HelpRequest.find({})
        .populate('requestedBy', 'username role')
        .populate('assignedTo', 'username role')
        .sort({ requestedAt: -1 });

    res.json(helpRequests);
});

// @desc    Get help/resource requests relevant to the authenticated user (requested by or assigned to)
// @route   GET /api/help-requests/my
// @access  Private (Authenticated users: Public, Volunteer, NGO, Admin)
const getMyHelpRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const helpRequests = await HelpRequest.find({
        $or: [
            { requestedBy: userId }, // Requests submitted by the user
            { assignedTo: userId }   // Requests assigned to the user
        ]
    })
    .populate('requestedBy', 'username email role')
    .populate('assignedTo', 'username email role')
    .sort({ requestedAt: -1 }); // Sort by most recent

    res.status(200).json(helpRequests);
});

// @desc    Get a single help/resource request by ID
// @route   GET /api/help-requests/:id
// @access  Admin or Assigned Volunteer/NGO or Requester
const getHelpRequestById = asyncHandler(async (req, res) => {
    const helpRequest = await HelpRequest.findById(req.params.id)
        .populate('requestedBy', 'username role')
        .populate('assignedTo', 'username role');

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found');
    }

    const isAuthorized = req.user.role === 'Admin' ||
                         (helpRequest.requestedBy && helpRequest.requestedBy._id.toString() === req.user.id) ||
                         (helpRequest.assignedTo && helpRequest.assignedTo._id.toString() === req.user.id);

    if (isAuthorized) {
        res.json(helpRequest);
    } else {
        res.status(403);
        throw new Error('Not authorized to view this help request');
    }
});

// @desc    Create a new help/resource request
// @route   POST /api/help-requests
// @access  Private (Authenticated users can create)
const createHelpRequest = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const { type, description, location, quantity, unit, contactInfo } = req.body;

    if (!type || !description || !location || !location.address || !location.latitude || !location.longitude) {
        res.status(400);
        throw new Error('Please include all required fields: type, description, location (address, latitude, longitude).');
    }

    const newRequest = await HelpRequest.create({
        type,
        description,
        location,
        quantity: quantity,
        unit: unit,
        requestedBy: req.user.id,
        contactInfo: contactInfo || { name: req.user.username, email: req.user.email || '', phone: '' },
        status: 'Pending'
    });

    const populatedRequest = await populateHelpRequestFields(newRequest);
    
    if (populatedRequest) {
        res.status(201).json(populatedRequest);
        io.emit('newHelpRequest', populatedRequest); // Emit socket event
    } else {
        res.status(400);
        throw new Error('Invalid help request data provided.');
    }
});

// @desc    Update a help request (general update for Admin or requester/assigned)
// @route   PUT /api/help-requests/:id
// @access  Private (Admin or requester/assigned)
const updateHelpRequest = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const { type, description, location, quantity, unit, status, assignedTo, adminNotes, contactInfo } = req.body;

    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found.');
    }

    // Authorization check: Admin, or the user who requested it, or the assigned user
    const isAuthorized = req.user.role === 'Admin' ||
                         (helpRequest.requestedBy && helpRequest.requestedBy._id.toString() === req.user.id) ||
                         (helpRequest.assignedTo && helpRequest.assignedTo._id.toString() === req.user.id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this help request');
    }

    // Only Admin can change assignedTo, status to 'Fulfilled', 'Cancelled', 'Rejected', or adminNotes
    if (req.user.role !== 'Admin') {
        if (assignedTo !== undefined && assignedTo !== helpRequest.assignedTo?.toString()) {
            res.status(403);
            throw new Error('Only administrators can assign/unassign help requests.');
        }
        if (status && ['Fulfilled', 'Cancelled', 'Rejected'].includes(status) && status !== helpRequest.status) {
            res.status(403);
            throw new Error('Only administrators can set this status.');
        }
        if (adminNotes !== undefined) {
            res.status(403);
            throw new Error('Only administrators can add/update admin notes.');
        }
    }

    if (type) helpRequest.type = type;
    if (description) helpRequest.description = description;
    if (location) {
        if (location.address) helpRequest.location.address = location.address;
        if (location.latitude) helpRequest.location.latitude = location.latitude;
        if (location.longitude) helpRequest.location.longitude = location.longitude;
    }
    if (quantity !== undefined) helpRequest.quantity = quantity;
    if (unit !== undefined) helpRequest.unit = unit;

    if (status) helpRequest.status = status; // This will be handled by authorization above

    if (assignedTo !== undefined) helpRequest.assignedTo = assignedTo;
    if (adminNotes !== undefined) helpRequest.adminNotes = adminNotes;
    if (contactInfo) {
        if (contactInfo.name) helpRequest.contactInfo.name = contactInfo.name;
        if (contactInfo.phone) helpRequest.contactInfo.phone = contactInfo.phone;
        if (contactInfo.email) helpRequest.contactInfo.email = contactInfo.email;
    }

    const updatedRequest = await helpRequest.save();

    const populatedRequest = await populateHelpRequestFields(updatedRequest);
    io.emit('helpRequestUpdated', populatedRequest); // Emit real-time update

    res.json(populatedRequest);
});

// @desc    Update help request status (specific route for this - Admin or assigned user)
// @route   PUT /api/help-requests/status/:id
// @access  Private (Admin or assigned user)
const updateHelpRequestStatus = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const { status } = req.body;

    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found.');
    }

    // Authorization check: Admin, or the assigned user
    const isAuthorized = req.user.role === 'Admin' ||
                         (helpRequest.assignedTo && helpRequest.assignedTo._id.toString() === req.user.id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to change status of this help request.');
    }

    // Define allowed status transitions for assigned users (Volunteers/NGOs)
    const allowedStatusesForAssigned = ['Received', 'In Progress', 'Fulfilled'];

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

    if (!['Pending', 'Received', 'In Progress', 'Fulfilled', 'Cancelled', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided.');
    }

    helpRequest.status = status;
    const updatedRequest = await helpRequest.save();

    const populatedRequest = await populateHelpRequestFields(updatedRequest);
    io.emit('helpRequestUpdated', populatedRequest); // Emit update to trigger re-render on clients

    res.json(populatedRequest);
});

// @desc    Assign a help/resource request to a Volunteer/NGO
// @route   PUT /api/help-requests/assign/:id
// @access  Admin
const assignHelpRequest = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const { assigneeId } = req.body;

    if (assigneeId === undefined) { // Allow unassigning by sending assigneeId as null
        res.status(400);
        throw new Error('Please provide a user ID to assign the help request to, or null to unassign.');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found');
    }

    let assignee = null;
    if (assigneeId) {
        assignee = await User.findById(assigneeId);
        if (!assignee) {
            res.status(404);
            throw new Error('Assignee user not found');
        }
        if (!['Volunteer', 'NGO'].includes(assignee.role)) {
            res.status(400);
            throw new Error('Help requests can only be assigned to users with "Volunteer" or "NGO" roles.');
        }
    }

    helpRequest.assignedTo = assigneeId || null;
    if (helpRequest.assignedTo && (helpRequest.status === 'Pending' || helpRequest.status === 'Received')) {
        helpRequest.status = 'In Progress'; // Automatically set to 'In Progress' if assigned
    } else if (!helpRequest.assignedTo && helpRequest.status === 'In Progress') {
        helpRequest.status = 'Pending'; // If unassigned, revert status
    }

    const updatedHelpRequest = await helpRequest.save();

    const populatedRequest = await populateHelpRequestFields(updatedHelpRequest);
    io.emit('helpRequestUpdated', populatedRequest); // Use same event as status update

    res.json(populatedRequest);
});

// @desc    Add/Update admin notes for a help/resource request
// @route   PUT /api/help-requests/notes/:id
// @access  Admin
const addHelpRequestAdminNotes = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const { adminNotes } = req.body;

    if (adminNotes === undefined || adminNotes === null) {
        res.status(400);
        throw new Error('Please provide notes content');
    }

    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found');
    }

    helpRequest.adminNotes = adminNotes;
    const updatedHelpRequest = await helpRequest.save();

    const populatedRequest = await populateHelpRequestFields(updatedHelpRequest);
    io.emit('helpRequestUpdated', populatedRequest); // Use same event as status update

    res.json(populatedRequest);
});

// @desc    Delete a help request
// @route   DELETE /api/help-requests/:id
// @access  Admin
const deleteHelpRequest = asyncHandler(async (req, res, io) => { // Added io for socket emission
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
        res.status(404);
        throw new Error('Help request not found.');
    }

    await helpRequest.deleteOne();
    io.emit('helpRequestDeleted', helpRequest._id); // Emit socket event
    res.json({ message: 'Help request removed successfully.', id: helpRequest._id });
});

module.exports = {
    getPublicHelpRequests,
    getAllHelpRequests,
    getMyHelpRequests, // Corrected export
    getHelpRequestById,
    createHelpRequest,
    updateHelpRequest,
    updateHelpRequestStatus,
    assignHelpRequest,
    addHelpRequestAdminNotes,
    deleteHelpRequest,
};


