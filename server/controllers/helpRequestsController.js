// server/src/controllers/helpRequestsController.js
const HelpRequest = require('../models/HelpRequest');

// Get all help requests
exports.getHelpRequests = async (req, res) => {
    try {
        const requests = await HelpRequest.find().sort({ requestedAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error in getHelpRequests:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single help request by ID
exports.getHelpRequestById = async (req, res) => {
    try {
        const request = await HelpRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Help request not found' });
        }
        res.json(request);
    } catch (error) {
        console.error('Error in getHelpRequestById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new help request
exports.createHelpRequest = async (req, res, io) => { // 'io' is passed from server.js
    const { type, description, location, contactInfo } = req.body;

    if (!type || !description || !location || !location.latitude || !location.longitude || !contactInfo || !contactInfo.name) {
        return res.status(400).json({ message: 'Missing required help request fields.' });
    }

    try {
        const newRequest = new HelpRequest({
            type,
            description,
            location,
            contactInfo
        });

        const savedRequest = await newRequest.save();
        io.emit('newHelpRequest', savedRequest); // Emit real-time update
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error('Error in createHelpRequest:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update a help request (general update, not just status)
exports.updateHelpRequest = async (req, res, io) => { // 'io' is passed from server.js
    const { type, description, location, contactInfo, status } = req.body;

    try {
        const updatedRequest = await HelpRequest.findByIdAndUpdate(
            req.params.id,
            { type, description, location, contactInfo, status },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Help request not found.' });
        }

        io.emit('helpRequestUpdated', updatedRequest); // Emit real-time update
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error in updateHelpRequest:', error);
        res.status(400).json({ message: error.message });
    }
};


// Update help request status (specific route for this)
exports.updateHelpRequestStatus = async (req, res, io) => { // 'io' is passed from server.js
    try {
        const { id } = req.params;
        const { status } = req.body; // status must be 'Open', 'In Progress', or 'Fulfilled'

        if (!['Open', 'In Progress', 'Fulfilled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const updatedRequest = await HelpRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Help request not found.' });
        }

        io.emit('helpRequestUpdated', updatedRequest); // Emit update to trigger re-render on clients
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error in updateHelpRequestStatus:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a help request
exports.deleteHelpRequest = async (req, res, io) => { // 'io' is passed from server.js
    try {
        const { id } = req.params;
        const deletedRequest = await HelpRequest.findByIdAndDelete(id);

        if (!deletedRequest) {
            return res.status(404).json({ message: 'Help request not found.' });
        }

        io.emit('helpRequestDeleted', deletedRequest._id); // Emit ID of deleted request
        res.json({ message: 'Help request deleted successfully.', id: deletedRequest._id });
    } catch (error) {
        console.error('Error in deleteHelpRequest:', error);
        res.status(500).json({ message: error.message });
    }
};