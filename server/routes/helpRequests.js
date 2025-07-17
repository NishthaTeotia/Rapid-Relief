// server/src/routes/helpRequests.js
const express = require('express');
const router = express.Router();
const helpRequestsController = require('../controllers/helpRequestsController');

module.exports = (io) => { // Accept `io` as an argument
 // GET all help requests
 router.get('/', helpRequestsController.getHelpRequests);

 // GET a single help request by ID
 router.get('/:id', helpRequestsController.getHelpRequestById); // ADDED THIS

 // POST a new help request
 router.post('/', (req, res) => helpRequestsController.createHelpRequest(req, res, io)); // Pass io
 // PUT (general update) a help request by ID
 router.put('/:id', (req, res) => helpRequestsController.updateHelpRequest(req, res, io)); // ADDED THIS & pass io

// PUT (status update) a help request by ID
 router.put('/:id/status', (req, res) => helpRequestsController.updateHelpRequestStatus(req, res, io)); // Pass io

 // DELETE a help request by ID
 router.delete('/:id', (req, res) => helpRequestsController.deleteHelpRequest(req, res, io)); // Pass io

 return router;
};