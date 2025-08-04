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

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {isBlocked ? 'Unblock User' : 'Block User'}: {userToBlockUnblock.username}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {isBlocked ? (
                            <p>Are you sure you want to **unblock** this user? Their current block reason is:</p>
                        ) : (
                            <p>Are you sure you want to **block** this user? Please provide a reason:</p>
                        )}
                        <div className="mb-3">
                            <label htmlFor="blockReason" className="form-label">
                                {isBlocked ? 'Current Block Reason:' : 'Reason for Blocking:'}
                            </label>
                            <textarea
                                className="form-control"
                                id="blockReason"
                                rows="3"
                                value={blockReasonInput}
                                onChange={(e) => setBlockReasonInput(e.target.value)}
                                placeholder={isBlocked ? 'No reason provided.' : 'e.g., "Misuse of platform", "Violation of terms", "Temporary suspension"'}
                                disabled={isBlocked} // Disable textarea if unblocking
                            ></textarea>
                        </div>
                        {!isBlocked && (
                            <small className="text-muted">This reason will be shown to the user if they try to log in.</small>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`btn ${isBlocked ? 'btn-success' : 'btn-danger'}`}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {isBlocked ? 'Confirm Unblock' : 'Confirm Block'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockUserModal;
