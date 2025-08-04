// server/models/Report.js
// server/models/reports.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
            required: [true, 'Report must have a reporter'], // Ensure a reporter is linked
        },
        type: {
            type: String,
            required: [true, 'Please specify the type of emergency'],
            enum: ['Flood', 'Earthquake', 'Fire', 'Medical Emergency', 'Accident', 'Missing Person', 'Other'],
            default: 'Other',
        },
        description: {
            type: String,
            required: [true, 'Please add a description of the emergency'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters long'],
        },
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        location: {
            // Keeping your existing structured location
            latitude: { type: Number, required: [true, 'Latitude is required'] },
            longitude: { type: Number, required: [true, 'Longitude is required'] },
            address: { type: String, trim: true }, // Address can be optional or required based on your needs
        },
        images: [ // Changed from imageUrl to images (array of strings) for multiple images
            {
                type: String, // Store URLs of images
            },
        ],
        status: {
            type: String,
            enum: ['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
            default: 'Pending', // Initial status when a report is submitted
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId, // Optional: Reference to a User (Volunteer/NGO)
            ref: 'User',
            default: null, // No one assigned initially
        },
        adminNotes: {
            type: String,
            default: '', // For administrators to add internal notes
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        // Removed reportedAt as timestamps.createdAt will serve the same purpose
    }
);

module.exports = mongoose.model('Report', ReportSchema);