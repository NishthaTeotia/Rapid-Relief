// server/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Fire', 'Flood', 'Earthquake', 'Medical Emergency', 'Other']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        // We use an object to store coordinates
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String }
    },
    imageUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Resolved'],
        default: 'Pending'
    },
    reportedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);