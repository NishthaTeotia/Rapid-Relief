// server/routes/volunteers.js
const express = require('express');
const router = express.Router();
const volunteersController = require('../controllers/volunteersController');

router.get('/', volunteersController.getVolunteers);
router.post('/', volunteersController.registerVolunteer);

// Admin routes - can be protected by authentication middleware later
router.delete('/:id', volunteersController.deleteVolunteer);

module.exports = router;