// server/src/controllers/volunteersController.js
const Volunteer = require('../models/Volunteer');

// Get all volunteers
exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ registeredAt: -1 });
        res.json(volunteers);
    } catch (error) {
        console.error('Error in getVolunteers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Register a new volunteer
exports.registerVolunteer = async (req, res) => {
    const { name, contactInfo, skills, availability, location } = req.body;

    if (!name || !contactInfo || !contactInfo.email || !skills || skills.length === 0 || !availability) {
        return res.status(400).json({ message: 'Missing required volunteer registration fields.' });
    }

    try {
        const newVolunteer = new Volunteer({
            name,
            contactInfo,
            skills,
            availability,
            location // Assuming location might be optional or null
        });

        const savedVolunteer = await newVolunteer.save();
        // You might want to emit a Socket.IO event here if you want real-time volunteer list updates
        // io.emit('newVolunteer', savedVolunteer);
        res.status(201).json(savedVolunteer);
    } catch (error) {
        console.error('Error in registerVolunteer:', error);
        // Handle duplicate email error
        if (error.code === 11000 && error.keyPattern && error.keyPattern['contactInfo.email']) {
            return res.status(409).json({ message: 'Email already registered as a volunteer.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// Update an existing volunteer
exports.updateVolunteer = async (req, res) => {
    const { name, contactInfo, skills, availability, location } = req.body;
    try {
        const updatedVolunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { name, contactInfo, skills, availability, location },
            { new: true, runValidators: true }
        );

        if (!updatedVolunteer) {
            return res.status(404).json({ message: 'Volunteer not found.' });
        }
        res.json(updatedVolunteer);
    } catch (error) {
        console.error('Error in updateVolunteer:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a volunteer (Admin/Moderator function)
exports.deleteVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVolunteer = await Volunteer.findByIdAndDelete(id);

        if (!deletedVolunteer) {
            return res.status(404).json({ message: 'Volunteer not found.' });
        }
        res.json({ message: 'Volunteer deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteVolunteer:', error);
        res.status(500).json({ message: error.message });
    }
};