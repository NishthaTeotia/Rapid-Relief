import React from 'react';

const BlockUserModal = ({
    isOpen,
    onClose,
    userToBlockUnblock,
    blockReasonInput,
    setBlockReasonInput,
    onSave, // This will be handleBlockUnblockUser from parent
    loading // From parent, to disable buttons
}) => {
    if (!isOpen || !userToBlockUnblock) return null;

    const isBlocked = userToBlockUnblock.isBlocked;

    const handleSave = () => {
        // Pass the user's ID, the new blocked status, and the reason
        onSave(userToBlockUnblock._id, !isBlocked, blockReasonInput);
    };

    
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
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
        },
        modalContent: {
            // Updated background color to match the image
            backgroundColor: '#2c2c2c',
            color: '#e0e0e0',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
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
        text: {
            fontSize: '1rem',
            lineHeight: '1.5',
        },
        strong: {
            color: isBlocked ? '#f44336' : '#4caf50',
        },
        formGroup: {
            marginTop: '15px',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        textarea: {
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #555',
            backgroundColor: '#3a3a3a',
            color: '#e0e0e0',
            fontSize: '1rem',
            resize: 'vertical',
            minHeight: '100px',
            opacity: isBlocked ? 0.7 : 1,
            cursor: isBlocked ? 'not-allowed' : 'text',
        },
        smallText: {
            color: '#9e9e9e',
            fontSize: '0.8rem',
            marginTop: '5px',
            display: 'block',
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
        confirmBlockButton: {
            backgroundColor: '#e53935',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#ef5350',
            },
            '&:disabled': {
                backgroundColor: '#b71c1c',
                cursor: 'not-allowed',
            }
        },
        confirmUnblockButton: {
            backgroundColor: '#4caf50',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#66bb6a',
            },
            '&:disabled': {
                backgroundColor: '#1b5e20',
                cursor: 'not-allowed',
            }
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h5 style={styles.modalTitle}>
                        {isBlocked ? 'Unblock User' : 'Block User'}: {userToBlockUnblock.username}
                    </h5>
                    <button type="button" style={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div style={styles.modalBody}>
                    <p style={styles.text}>
                        Are you sure you want to <strong style={styles.strong}>{isBlocked ? 'unblock' : 'block'}</strong> this user?
                    </p>
                    <div style={styles.formGroup}>
                        <label htmlFor="blockReason" style={styles.label}>
                            {isBlocked ? 'Current Block Reason:' : 'Reason for Blocking:'}
                        </label>
                        <textarea
                            style={styles.textarea}
                            id="blockReason"
                            rows="3"
                            value={blockReasonInput}
                            onChange={(e) => setBlockReasonInput(e.target.value)}
                            placeholder={isBlocked ? 'No reason provided.' : 'e.g., "Misuse of platform", "Violation of terms"'}
                            disabled={isBlocked}
                        ></textarea>
                    </div>
                    {!isBlocked && (
                        <small style={styles.smallText}>This reason will be shown to the user if they try to log in.</small>
                    )}
                </div>
                <div style={styles.modalFooter}>
                    <button type="button" style={{...styles.button, ...styles.cancelButton}} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        style={{
                            ...styles.button,
                            ...(isBlocked ? styles.confirmUnblockButton : styles.confirmBlockButton)
                        }}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {isBlocked ? 'Confirm Unblock' : 'Confirm Block'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockUserModal;
