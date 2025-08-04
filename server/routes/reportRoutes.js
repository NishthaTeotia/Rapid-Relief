const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createReport,
    getReports,
    getMyReports,
    getPublicReports, // NEW: Import the new getPublicReports function
    getReportById,
    updateReport,
    updateReportStatus,
    assignReport,
    addAdminNotes,
    deleteReport,
} = require('../controllers/reportsController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// IMPORTANT: Order matters! Static routes should come before dynamic routes
// to prevent them from being caught by the dynamic parameter.

// @desc    Get reports relevant to the authenticated user (submitted by or assigned to)
// @route   GET /api/reports/my
// @access  Private (Authenticated users: Public, Volunteer, NGO, Admin)
router.get('/my', protect, (req, res) => getMyReports(req, res, req.app.get('io')));

// @desc    Get all public reports (for public display on ReportsPage)
// @route   GET /api/reports/public
// @access  Public (no authentication required)
router.get('/public', (req, res) => getPublicReports(req, res, req.app.get('io'))); // NEW PUBLIC ROUTE - placed before /:id

// Route for creating a report (accessible by any authenticated user)
router.post('/', protect, (req, res) => createReport(req, res, req.app.get('io')));

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private (Admin only)
router.get('/', protect, authorizeRoles('Admin'), (req, res) => getReports(req, res, req.app.get('io')));

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (Admin or reporter of the report or assigned user)
// NOTE: Authorization for getReportById, updateReport, updateReportStatus, assignReport, addAdminNotes
// and deleteReport is now handled directly within the controller functions based on role/ownership.
// The route middleware here ensures only authenticated users can hit these, then controller refines.
router.get('/:id', protect, (req, res) => getReportById(req, res, req.app.get('io')));

// @desc    Update an existing report (General update, can be used by reporter or admin)
// @route   PUT /api/reports/:id
// @access  Private (Admin or reporter of the report or assigned user)
router.put('/:id', protect, (req, res) => updateReport(req, res, req.app.get('io')));

// @desc    Update emergency report status (Admin or assigned user)
// @route   PUT /api/reports/status/:id
// @access  Private (Admin or assigned user)
router.put('/status/:id', protect, (req, res) => updateReportStatus(req, res, req.app.get('io')));

// @desc    Assign an emergency report to a user (Volunteer/NGO) (Admin only)
// @route   PUT /api/reports/assign/:id
// @access  Private (Admin only) - Still Admin-only, but protect ensures auth
router.put('/assign/:id', protect, authorizeRoles('Admin'), (req, res) => assignReport(req, res, req.app.get('io')));

// @desc    Add/Update admin notes for a report (Admin only)
// @route   PUT /api/reports/notes/:id
// @access  Private (Admin only) - Still Admin-only, but protect ensures auth
router.put('/notes/:id', protect, authorizeRoles('Admin'), (req, res) => addAdminNotes(req, res, req.app.get('io')));

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Admin only) - Still Admin-only, but protect ensures auth
router.delete('/:id', protect, authorizeRoles('Admin'), (req, res) => deleteReport(req, res, req.app.get('io')));

module.exports = router;


