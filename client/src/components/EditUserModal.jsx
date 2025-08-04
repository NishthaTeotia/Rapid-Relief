// client/src/components/EditUserModal.jsx
import React, { useState, useEffect } from 'react';

// Basic Bootstrap modal structure
const EditUserModal = ({ isOpen, onClose, userToEdit, onSave }) => {
    // State to hold the form data
    const [editedUsername, setEditedUsername] = useState('');
    const [editedRole, setEditedRole] = useState('');
    const [error, setError] = useState(null); // For local form validation/error display

    // Populate form fields when userToEdit changes (e.g., modal opens for a new user)
    useEffect(() => {
        if (userToEdit) {
            setEditedUsername(userToEdit.username);
            setEditedRole(userToEdit.role);
            setError(null); // Clear previous errors when a new user is loaded
        } else {
            // Reset form if no user is being edited (e.g., modal is closing)
            setEditedUsername('');
            setEditedRole('');
        }
    }, [userToEdit]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // Basic validation
        if (!editedUsername.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        // Prepare data to send
        const updatedData = {
            username: editedUsername,
            role: editedRole,
            // You might add other fields here later (e.g., password, if you allow changing it here)
        };

        try {
            // Call the onSave prop, which will handle the API call in AdminDashboardPage
            await onSave(userToEdit._id, updatedData);
            onClose(); // Close modal on successful save
        } catch (err) {
            // Error handling from the onSave (API call)
            setError(err.message || 'Failed to update user. Please try again.');
        }
    };

    // If modal is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        // Basic Bootstrap modal classes
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit User: {userToEdit ? userToEdit.username : ''}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    value={editedUsername}
                                    onChange={(e) => setEditedUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    id="role"
                                    value={editedRole}
                                    onChange={(e) => setEditedRole(e.target.value)}
                                    required
                                >
                                    <option value="Public">Public</option>
                                    <option value="Volunteer">Volunteer</option>
                                    <option value="NGO">NGO</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;