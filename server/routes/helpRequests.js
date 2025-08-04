// server/routes/helpRequests.js
const express = require('express');
const router = express.Router();
const helpRequestsController = require('../controllers/helpRequestsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// PUBLIC ROUTE: Get all public help requests (e.g., 'Open' or 'In Progress')
router.get('/public', helpRequestsController.getPublicHelpRequests);

// PROTECTED ROUTES (Admin only unless specified otherwise)

// @desc    Get all help requests (Admin view - includes all statuses, populated fields)
// @route   GET /api/help-requests
// @access  Admin
router.get('/', protect, authorizeRoles('Admin'), helpRequestsController.getAllHelpRequests);

// @desc    Get help/resource requests relevant to the authenticated user (requested by or assigned to)
// @route   GET /api/help-requests/my
// @access  Private (Authenticated users: Public, Volunteer, NGO, Admin)
router.get('/my', protect, helpRequestsController.getMyHelpRequests); // NEW ROUTE

// @desc    Get a single help request by ID (Admin, Assigned Volunteer/NGO, or Requester)
// @route   GET /api/help-requests/:id
// @access  Private (Authenticated users) - Authorization logic is inside controller
router.get('/:id', protect, helpRequestsController.getHelpRequestById);

// @desc    POST a new help request (Authenticated users - Public, Volunteer, NGO, Admin)
// @route   POST /api/help-requests
// @access  Private (Authenticated users)
router.post('/', protect, (req, res) => helpRequestsController.createHelpRequest(req, res, req.app.get('io')));

// @desc    PUT (general update) a help request by ID (Admin or requester/assigned)
// @route   PUT /api/help-requests/:id
// @access  Private (Authenticated users) - Authorization logic is inside controller
router.put('/:id', protect, (req, res) => helpRequestsController.updateHelpRequest(req, res, req.app.get('io')));

// @desc    PUT (status update) a help request by ID (Admin or assigned user)
// @route   PUT /api/help-requests/:id/status
// @access  Private (Authenticated users) - Authorization logic is inside controller
router.put('/:id/status', protect, (req, res) => helpRequestsController.updateHelpRequestStatus(req, res, req.app.get('io')));

// @desc    PUT (assign) a help request by ID (Admin only)
// @route   PUT /api/help-requests/:id/assign
// @access  Admin
router.put('/:id/assign', protect, authorizeRoles('Admin'), (req, res) => helpRequestsController.assignHelpRequest(req, res, req.app.get('io')));

// @desc    PUT (admin notes) a help request by ID (Admin only)
// @route   PUT /api/help-requests/:id/notes
// @access  Admin
router.put('/:id/notes', protect, authorizeRoles('Admin'), (req, res) => helpRequestsController.addHelpRequestAdminNotes(req, res, req.app.get('io')));

// @desc    DELETE a help request by ID (Admin only)
// @route   DELETE /api/help-requests/:id
// @access  Admin
router.delete('/:id', protect, authorizeRoles('Admin'), (req, res) => helpRequestsController.deleteHelpRequest(req, res, req.app.get('io')));

module.exports = router;

