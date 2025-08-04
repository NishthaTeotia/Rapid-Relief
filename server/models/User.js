// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['Public', 'Volunteer', 'NGO', 'Admin'], // Define allowed roles
        default: 'Public', // Default role for new users
        required: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    // --- NEW: Blocking Fields ---
    isBlocked: {
        type: Boolean,
        default: false // False by default, user is not blocked
    },
    blockReason: {
        type: String,
        default: '' // Reason for blocking, empty if not blocked
    },
    // --- End NEW Fields ---
    createdAt: {
        type: Date,
        default: Date.now
    }
    // If you want 'updatedAt' field automatically, you can add { timestamps: true }
    // to the schema options instead of manually defining createdAt.
    // For now, keeping createdAt as is and just adding new fields.
});

// Middleware to hash the password before saving the user document
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;