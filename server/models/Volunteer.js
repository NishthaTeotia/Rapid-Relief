// server/models/Volunteer.js
const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactInfo: {
        email: { type: String, required: true, unique: true },
        phone: { type: String }
    },
    skills: [{
        type: String,
        enum: ['Medical', 'Search & Rescue', 'Logistics', 'Food Distribution', 'Shelter Management', 'First Aid', 'IT Support', 'Other'],
        required: true
    }],
    availability: {
        type: String, // e.g., 'Full-time', 'Weekends', 'Evenings'
        required: true
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);