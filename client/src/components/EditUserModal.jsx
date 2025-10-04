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

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modalContent: {
            // Updated background color to match the image
            backgroundColor: '#2c2c2c',
            color: '#e0e0e0',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            border: '1px solid #444', // Added a subtle border
        },
        modalHeader: {
            padding: '20px',
            borderBottom: '1px solid #444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        modalTitle: {
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
        },
        closeButton: {
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            color: '#e0e0e0',
            cursor: 'pointer',
            transition: 'color 0.2s',
            '&:hover': {
                color: '#fff',
            }
        },
        modalBody: {
            padding: '20px',
        },
        formGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #555',
            backgroundColor: '#3a3a3a',
            color: '#e0e0e0',
            fontSize: '1rem',
        },
        select: {
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #555',
            backgroundColor: '#3a3a3a',
            color: '#e0e0e0',
            fontSize: '1rem',
            cursor: 'pointer',
        },
        modalFooter: {
            padding: '20px',
            borderTop: '1px solid #444',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
        },
        button: {
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
        },
        cancelButton: {
            backgroundColor: '#555',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#666',
            }
        },
        saveButton: {
            backgroundColor: '#2196f3',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#42a5f5',
            }
        },
        errorAlert: {
            backgroundColor: '#c62828',
            color: '#ffebee',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center',
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h5 style={styles.modalTitle}>Edit User: {userToEdit ? userToEdit.username : ''}</h5>
                    <button type="button" style={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div style={styles.modalBody}>
                    {error && <div style={styles.errorAlert}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label htmlFor="username" style={styles.label}>Username</label>
                            <input
                                type="text"
                                style={styles.input}
                                id="username"
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label htmlFor="role" style={styles.label}>Role</label>
                            <select
                                style={styles.select}
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
                        <div style={styles.modalFooter}>
                            <button type="button" style={{...styles.button, ...styles.cancelButton}} onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" style={{...styles.button, ...styles.saveButton}}>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;