// server/src/utils/socketEvents.js

let io; // This variable will hold the Socket.IO server instance

/**
 * Initializes the Socket.IO server instance.
 * This function should be called once, typically in your main server file (e.g., server/index.js),
 * after the Socket.IO server has been set up.
 * @param {object} socketIoInstance The initialized Socket.IO server instance.
 */
const initializeSocket = (socketIoInstance) => {
    io = socketIoInstance;
    console.log('Socket.IO initialized and ready for emitting events.');
};

// --- Emitters for Help Request events ---
/**
 * Emits a 'newHelpRequest' event to all connected clients.
 * @param {object} helpRequest The newly created help request object.
 */
const emitNewHelpRequest = (helpRequest) => {
    if (io) {
        io.emit('newHelpRequest', helpRequest);
        console.log('Emitted newHelpRequest:', helpRequest._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit newHelpRequest.');
    }
};

/**
 * Emits a 'helpRequestUpdated' event to all connected clients.
 * @param {object} helpRequest The updated help request object.
 */
const emitHelpRequestUpdated = (helpRequest) => {
    if (io) {
        io.emit('helpRequestUpdated', helpRequest);
        console.log('Emitted helpRequestUpdated:', helpRequest._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit helpRequestUpdated.');
    }
};

/**
 * Emits a 'helpRequestDeleted' event to all connected clients.
 * @param {string} helpRequestId The ID of the deleted help request.
 */
const emitHelpRequestDeleted = (helpRequestId) => {
    if (io) {
        io.emit('helpRequestDeleted', helpRequestId);
        console.log('Emitted helpRequestDeleted:', helpRequestId);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit helpRequestDeleted.');
    }
};

// --- Emitters for Volunteer events ---
/**
 * Emits a 'newVolunteer' event to all connected clients.
 * @param {object} volunteer The newly created volunteer object.
 */
const emitNewVolunteer = (volunteer) => {
    if (io) {
        io.emit('newVolunteer', volunteer);
        console.log('Emitted newVolunteer:', volunteer._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit newVolunteer.');
    }
};

/**
 * Emits a 'volunteerUpdated' event to all connected clients.
 * @param {object} volunteer The updated volunteer object.
 */
const emitVolunteerUpdated = (volunteer) => {
    if (io) {
        io.emit('volunteerUpdated', volunteer);
        console.log('Emitted volunteerUpdated:', volunteer._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit volunteerUpdated.');
    }
};

/**
 * Emits a 'volunteerDeleted' event to all connected clients.
 * @param {string} volunteerId The ID of the deleted volunteer.
 */
const emitVolunteerDeleted = (volunteerId) => {
    if (io) {
        io.emit('volunteerDeleted', volunteerId);
        console.log('Emitted volunteerDeleted:', volunteerId);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit volunteerDeleted.');
    }
};

// --- Emitters for Report events (if you have them) ---
// Assuming these exist from previous steps or you'll add them later
const emitNewReport = (report) => {
    if (io) {
        io.emit('newReport', report);
        console.log('Emitted newReport:', report._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit newReport.');
    }
};
const emitReportUpdated = (report) => {
    if (io) {
        io.emit('reportUpdated', report);
        console.log('Emitted reportUpdated:', report._id);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit reportUpdated.');
    }
};
const emitReportDeleted = (reportId) => {
    if (io) {
        io.emit('reportDeleted', reportId);
        console.log('Emitted reportDeleted:', reportId);
    } else {
        console.warn('Socket.IO not initialized. Cannot emit reportDeleted.');
    }
};


module.exports = {
    initializeSocket,
    emitNewHelpRequest,
    emitHelpRequestUpdated,
    emitHelpRequestDeleted,
    emitNewVolunteer,
    emitVolunteerUpdated,
    emitVolunteerDeleted,
    emitNewReport, // Include if your reports controller uses this
    emitReportUpdated, // Include if your reports controller uses this
    emitReportDeleted // Include if your reports controller uses this
};