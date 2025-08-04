const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: ['Food', 'Water', 'Medical Supplies', 'Shelter', 'Rescue', 'Volunteers', 'Equipment', 'Transportation', 'Other'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters long']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Location address is required']
        },
        latitude: { type: Number, required: [true, 'Latitude is required'] },
        longitude: { type: Number, required: [true, 'Longitude is required'] }
    },
    // Quantity is now truly optional (no default)
    quantity: {
        type: Number,
        min: [1, 'Quantity must be at least 1'],
        // default: 1 // <--- REMOVED THIS LINE
        required: false // Explicitly state it's not required
    },
    unit: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Received', 'In Progress', 'Fulfilled', 'Cancelled', 'Rejected'],
        default: 'Pending'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    adminNotes: {
        type: String,
        default: ''
    },
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update `updatedAt` field on save
HelpRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);
