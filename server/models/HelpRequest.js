// server/models/HelpRequest.js
const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Food', 'Water', 'Medical', 'Shelter', 'Rescue', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Fulfilled'],
        default: 'Open'
    },
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);