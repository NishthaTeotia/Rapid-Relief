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

    if (authLoading) {
        return <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading authentication status...</div>;
    }

    if (loading && !successMessage && !error && !isEditModalOpen && !isBlockModalOpen) {
        return <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading user data...</div>;
    }

    if (!user || user.role !== 'Admin') {
        return (
            <div style={{ padding: '20px', margin: '20px auto', maxWidth: '800px', backgroundColor: '#2c3034', color: '#f9fafb', borderRadius: '8px' }}>
                <h3 style={{ textAlign: 'center' }}>Access Denied!</h3>
                <p style={{ textAlign: 'center' }}>{error || "You must be logged in as an Administrator to view this page."}</p>
            </div>
        );
    }

    const renderUserTable = (title, userList, isPending = false) => (
        <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#f9fafb' }}>{title} ({userList.length})</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1f2937', color: '#f9fafb', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ backgroundColor: '#111827' }}>
                        <tr>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>ID</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Username</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Role</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Created At</th>
                            {isPending && <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Status</th>}
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Account Status</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #374151' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan={isPending ? "7" : "6"} style={{ textAlign: 'center', color: '#6b7280', padding: '10px' }}>No {title.toLowerCase()} found.</td>
                            </tr>
                        ) : (
                            userList.map((u, index) => (
                                <tr key={u._id} style={{ borderBottom: index === userList.length - 1 ? 'none' : '1px solid #374151' }}>
                                    <td style={{ padding: '10px 15px' }}>{u._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '10px 15px' }}>{u.username}</td>
                                    <td style={{ padding: '10px 15px' }}>{u.role}</td>
                                    <td style={{ padding: '10px 15px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    {isPending && <td style={{ padding: '10px 15px' }}>Pending Approval</td>}
                                    <td style={{ padding: '10px 15px' }}>
                                        {u.isBlocked ? (
                                            <span style={{ backgroundColor: '#dc2626', color: '#f9fafb', padding: '4px 8px', borderRadius: '4px' }}>Blocked</span>
                                        ) : (
                                            <span style={{ backgroundColor: '#16a34a', color: '#f9fafb', padding: '4px 8px', borderRadius: '4px' }}>Active</span>
                                        )}
                                        {u.isBlocked && u.blockReason && (
                                            <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }} title={u.blockReason}>(Reason)</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 15px', whiteSpace: 'nowrap' }}>
                                        {isPending ? (
                                            <>
                                                <button style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }} onClick={() => handleApprove(u._id, u.username)} disabled={loading}>Approve</button>
                                                <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleReject(u._id, u.username)} disabled={loading}>Reject</button>
                                            </>
                                        ) : (
                                            <>
                                                {user && user._id !== u._id ? (
                                                    <>
                                                        <button style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', marginBottom: '4px' }} onClick={() => handleEdit(u)} disabled={loading}>Edit</button>
                                                        <button style={{ backgroundColor: u.isBlocked ? '#fbbf24' : '#6b7280', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', marginBottom: '4px' }} onClick={() => handleOpenBlockModal(u)} disabled={loading}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
                                                        <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }} onClick={() => handleDelete(u._id, u.username)} disabled={loading}>Delete</button>
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>(You)</span>
                                                )}
                                            </>
                                        )}
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
        <div style={{ padding: '1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>User Management</h2>

            {successMessage && (
                <div style={{ backgroundColor: '#15803d', color: '#f0fdf4', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '15px' }}>
                    {successMessage}
                </div>
            )}
            {error && (
                <div style={{ backgroundColor: '#b91c1c', color: '#fef2f2', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '15px' }}>
                    {error}
                </div>
            )}

            {(pendingVolunteers.length > 0 || pendingNgos.length > 0) && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Pending Registrations</h3>
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
                <div style={{ backgroundColor: '#60a5fa', color: '#e0e7ff', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>No users registered in the system.</div>
            )}

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                userToEdit={currentUserToEdit}
                onSave={handleUpdateUser}
            />

            <BlockUserModal
                isOpen={isBlockModalOpen}
                onClose={handleCloseBlockModal}
                userToBlockUnblock={userToBlockUnblock}
                blockReasonInput={blockReasonInput}
                setBlockReasonInput={setBlockReasonInput}
                onSave={handleBlockUnblockUser}
                loading={loading}
            />
        </div>
    );
};

export default AdminUserPage;