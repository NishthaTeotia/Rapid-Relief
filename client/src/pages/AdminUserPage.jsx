// client/src/pages/AdminUserPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUser, updateUser, approveUser, rejectUser } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

import EditUserModal from '../components/EditUserModal';
import BlockUserModal from '../components/BlockUserModal';

const AdminUserPage = () => {
    const { user, loading: authLoading } = useAuth();

    const [allUsers, setAllUsers] = useState([]);
    const [publicUsers, setPublicUsers] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [pendingVolunteers, setPendingVolunteers] = useState([]);
    const [pendingNgos, setPendingNgos] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [userToBlockUnblock, setUserToBlockUnblock] = useState(null);
    const [blockReasonInput, setBlockReasonInput] = useState('');

    const isModalOpen = isEditModalOpen || isBlockModalOpen;

    const refreshUserLists = useCallback(async () => {
        if (authLoading) return;
        if (!user || user.role !== 'Admin') {
            setLoading(false);
            setError("You are not authorized to view this page. Please log in as an Admin.");
            return;
        }
        try {
            setLoading(true);
            const data = await getAllUsers();
            setAllUsers(data);

            const publicList = [];
            const volunteerList = [];
            const ngoList = [];
            const adminList = [];
            const pendingVolunteerList = [];
            const pendingNgoList = [];
            const blockedList = [];

            data.forEach(u => {
                if (u.isBlocked) {
                    blockedList.push(u);
                } else if (u.role === 'Volunteer' && u.isApproved === false) {
                    pendingVolunteerList.push(u);
                } else if (u.role === 'NGO' && u.isApproved === false) {
                    pendingNgoList.push(u);
                } else {
                    switch (u.role) {
                        case 'Public': publicList.push(u); break;
                        case 'Volunteer': volunteerList.push(u); break;
                        case 'NGO': ngoList.push(u); break;
                        case 'Admin': adminList.push(u); break;
                        default: console.warn(`User with unknown role: ${u.role}`, u);
                    }
                }
            });

            setPublicUsers(publicList);
            setVolunteers(volunteerList);
            setNgos(ngoList);
            setAdmins(adminList);
            setPendingVolunteers(pendingVolunteerList);
            setPendingNgos(pendingNgoList);
            setBlockedUsers(blockedList);

            setError(null);
        } catch (err) {
            console.error('Failed to fetch and categorize users:', err);
            setError(err.message || 'Error fetching users. Check console for details.');
        } finally {
            setLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        refreshUserLists();
    }, [refreshUserLists]);

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}" (ID: ${userId})? This action cannot be undone.`)) {
            return;
        }
        try {
            setLoading(true);
            await deleteUser(userId);
            setSuccessMessage(`User "${username}" deleted successfully!`);
            await refreshUserLists();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error deleting user ${username}:`, err);
            setError(err.message || `Failed to delete user "${username}". Please try again.`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to APPROVE user "${username}" (ID: ${userId})?`)) {
            return;
        }
        try {
            setLoading(true);
            await approveUser(userId);
            setSuccessMessage(`User "${username}" approved successfully!`);
            await refreshUserLists();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error approving user ${username}:`, err);
            setError(err.message || `Failed to approve user "${username}". Please try again.`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to REJECT (delete) user "${username}" (ID: ${userId})? This will permanently remove their account.`)) {
            return;
        }
        try {
            setLoading(true);
            await rejectUser(userId);
            setSuccessMessage(`User "${username}" rejected and deleted successfully!`);
            await refreshUserLists();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error rejecting user ${username}:`, err);
            setError(err.message || `Failed to reject user "${username}". Please try again.`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (userToEdit) => {
        setCurrentUserToEdit(userToEdit);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentUserToEdit(null);
    };

    const handleUpdateUser = async (userId, updatedData) => {
        try {
            setLoading(true);
            await updateUser(userId, updatedData);
            setSuccessMessage(`User "${updatedData.username}" updated successfully!`);
            await refreshUserLists();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error updating user ${userId}:`, err);
            setError(err.message || `Failed to update user "${updatedData.username}".`);
            setTimeout(() => setError(null), 5000);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBlockModal = (user) => {
        setUserToBlockUnblock(user);
        setBlockReasonInput(user.blockReason || '');
        setIsBlockModalOpen(true);
    };

    const handleCloseBlockModal = () => {
        setIsBlockModalOpen(false);
        setUserToBlockUnblock(null);
        setBlockReasonInput('');
    };

    const handleBlockUnblockUser = async (userId, isBlockedStatus, reason) => {
        try {
            setLoading(true);
            await updateUser(userId, { isBlocked: isBlockedStatus, blockReason: reason });
            setSuccessMessage(`User updated: ${isBlockedStatus ? 'Blocked' : 'Unblocked'}!`);
            handleCloseBlockModal();
            await refreshUserLists();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error ${isBlockedStatus ? 'blocking' : 'unblocking'} user ${userId}:`, err);
            setError(err.message || `Failed to ${isBlockedStatus ? 'block' : 'unblock'} user.`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        page: {
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto',
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            color: '#e0e0e0',
            backgroundColor: '#1a1a1a',
            minHeight: '100vh',
            // No direct filter on this element. We will apply it conditionally to the main content.
        },
        mainContent: {
            transition: 'filter 0.3s ease-in-out',
        },
        pageBlurred: {
            filter: 'blur(5px)',
            pointerEvents: 'none',
            userSelect: 'none',
        },
        // This is the new, standalone overlay for the entire page
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // A solid, semi-transparent layer
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999, // Lower than the modal but higher than the page content
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
            color: '#f0f0f0',
            fontSize: '2.5rem',
            fontWeight: '600',
        },
        sectionHeader: {
            marginBottom: '20px',
            fontSize: '1.8rem',
            fontWeight: '500',
            borderBottom: '2px solid #555',
            paddingBottom: '10px',
            color: '#00bfff',
        },
        listTitle: {
            fontSize: '1.5rem',
            fontWeight: '400',
            marginBottom: '15px',
            color: '#f0f0f0',
        },
        message: {
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: '1rem',
        },
        success: {
            backgroundColor: '#2e7d32',
            color: '#e8f5e9',
        },
        error: {
            backgroundColor: '#c62828',
            color: '#ffebee',
        },
        deniedAccess: {
            padding: '40px',
            margin: '40px auto',
            maxWidth: '800px',
            backgroundColor: '#2c2c2c',
            color: '#e57373',
            borderRadius: '10px',
            border: '1px solid #c62828',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
        tableContainer: {
            marginBottom: '40px',
            backgroundColor: '#2c2c2c',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
        },
        thead: {
            backgroundColor: '#424242',
            color: '#f0f0f0',
        },
        th: {
            padding: '15px',
            textAlign: 'left',
            fontWeight: '600',
            borderBottom: '2px solid #555',
        },
        td: {
            padding: '15px',
            borderBottom: '1px solid #333',
            verticalAlign: 'middle',
            color: '#e0e0e0',
            fontSize: '0.95rem',
        },
        trEven: {
            backgroundColor: '#2c2c2c',
            '&:hover': {
                backgroundColor: '#383838',
            }
        },
        trOdd: {
            backgroundColor: '#212121',
            '&:hover': {
                backgroundColor: '#383838',
            }
        },
        buttonGroup: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
        },
        button: {
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            minWidth: '90px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.85rem',
        },
        approveButton: {
            backgroundColor: '#4caf50',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#66bb6a',
            }
        },
        rejectButton: {
            backgroundColor: '#f44336',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#ef5350',
            }
        },
        editButton: {
            backgroundColor: '#2196f3',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#42a5f5',
            }
        },
        blockButton: {
            backgroundColor: '#ffc107',
            color: '#212121',
            '&:hover': {
                backgroundColor: '#ffca28',
            }
        },
        unblockButton: {
            backgroundColor: '#757575',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#9e9e9e',
            }
        },
        deleteButton: {
            backgroundColor: '#e53935',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#ef5350',
            }
        },
        statusBadge: {
            padding: '6px 12px',
            borderRadius: '15px',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
            display: 'inline-block',
        },
        activeBadge: {
            backgroundColor: '#4caf50',
        },
        blockedBadge: {
            backgroundColor: '#e53935',
        },
        reasonText: {
            fontSize: '11px',
            color: '#9e9e9e',
            fontStyle: 'italic',
            marginTop: '5px',
            display: 'block',
        },
        infoText: {
            color: '#9e9e9e',
            fontSize: '12px',
        },
    };

    const renderUserTable = (title, userList, isPending = false) => (
        <div style={styles.tableContainer}>
            <h3 style={styles.listTitle}>{title} ({userList.length})</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Created At</th>
                            {isPending && <th style={styles.th}>Approval Status</th>}
                            <th style={styles.th}>Account Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan={isPending ? "7" : "6"} style={{ ...styles.td, textAlign: 'center', color: '#9e9e9e' }}>No {title.toLowerCase()} found.</td>
                            </tr>
                        ) : (
                            userList.map((u, index) => (
                                <tr key={u._id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={styles.td}>{u._id.substring(0, 8)}...</td>
                                    <td style={styles.td}>{u.username}</td>
                                    <td style={styles.td}>{u.role}</td>
                                    <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    {isPending && <td style={styles.td}>Pending</td>}
                                    <td style={styles.td}>
                                        {u.isBlocked ? (
                                            <span style={{...styles.statusBadge, ...styles.blockedBadge}}>Blocked</span>
                                        ) : (
                                            <span style={{...styles.statusBadge, ...styles.activeBadge}}>Active</span>
                                        )}
                                        {u.isBlocked && u.blockReason && (
                                            <span style={styles.reasonText} title={u.blockReason}>Reason</span>
                                        )}
                                    </td>
                                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                                        <div style={styles.buttonGroup}>
                                            {isPending ? (
                                                <>
                                                    <button style={{...styles.button, ...styles.approveButton}} onClick={() => handleApprove(u._id, u.username)} disabled={loading}>Approve</button>
                                                    <button style={{...styles.button, ...styles.rejectButton}} onClick={() => handleReject(u._id, u.username)} disabled={loading}>Reject</button>
                                                </>
                                            ) : (
                                                <>
                                                    {user && user._id !== u._id ? (
                                                        <>
                                                            <button style={{...styles.button, ...styles.editButton}} onClick={() => handleEdit(u)} disabled={loading}>Edit</button>
                                                            <button
                                                                style={{...styles.button, ...(u.isBlocked ? styles.unblockButton : styles.blockButton)}}
                                                                onClick={() => handleOpenBlockModal(u)}
                                                                disabled={loading}
                                                            >
                                                                {u.isBlocked ? 'Unblock' : 'Block'}
                                                            </button>
                                                            <button style={{...styles.button, ...styles.deleteButton}} onClick={() => handleDelete(u._id, u.username)} disabled={loading}>Delete</button>
                                                        </>
                                                    ) : (
                                                        <span style={styles.infoText}>(You)</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={{...styles.mainContent, ...(isModalOpen && styles.pageBlurred)}}>
                <h2 style={styles.header}>User Management</h2>

                {successMessage && <div style={{...styles.message, ...styles.success}}>{successMessage}</div>}
                {error && <div style={{...styles.message, ...styles.error}}>{error}</div>}

                {(pendingVolunteers.length > 0 || pendingNgos.length > 0) && (
                    <div>
                        <h3 style={styles.sectionHeader}>Pending Registrations</h3>
                        {renderUserTable("Pending Volunteers", pendingVolunteers, true)}
                        {renderUserTable("Pending NGOs", pendingNgos, true)}
                    </div>
                )}

                {renderUserTable("Blocked Users", blockedUsers)}
                {renderUserTable("Administrators", admins)}
                {renderUserTable("Approved NGOs", ngos)}
                {renderUserTable("Approved Volunteers", volunteers)}
                {renderUserTable("Public Users", publicUsers)}

                {allUsers.length === 0 && !loading && !error && (
                    <div style={{...styles.message, backgroundColor: '#212121', color: '#9e9e9e'}}>No users registered in the system.</div>
                )}
            </div>

            {isModalOpen && <div style={styles.modalOverlay} />}

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                userToEdit={currentUserToEdit}
                onSave={handleUpdateUser}
                isDarkTheme={true}
            />

            <BlockUserModal
                isOpen={isBlockModalOpen}
                onClose={handleCloseBlockModal}
                userToBlockUnblock={userToBlockUnblock}
                blockReasonInput={blockReasonInput}
                setBlockReasonInput={setBlockReasonInput}
                onSave={handleBlockUnblockUser}
                loading={loading}
                isDarkTheme={true}
            />
        </div>
    );
};

export default AdminUserPage;