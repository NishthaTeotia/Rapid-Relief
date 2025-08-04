import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getAllHelpRequests, // Renamed from fetchHelpRequests
    updateHelpRequestStatus,
    deleteHelpRequest,
    assignHelpRequest, // New
    addHelpRequestAdminNotes // New
} from '../api/helpRequestsApi'; // Corrected import path
import { getAllUsers } from '../api/userApi';

import io from 'socket.io-client';

const AdminHelpRequestPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [resourceRequests, setResourceRequests] = useState([]); // Renamed state for clarity
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for Request Details Modal
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State for Admin Notes Modal
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentRequestForNotes, setCurrentRequestForNotes] = useState(null);
    const [notesContent, setNotesContent] = useState('');

    const [availableAssignees, setAvailableAssignees] = useState([]);

    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

    const fetchResourceRequests = useCallback(async () => {
        if (authLoading || !user || user.role !== 'Admin') {
            setLoading(false);
            setError("You are not authorized to view this page.");
            return;
        }
        try {
            setLoading(true);
            const data = await getAllHelpRequests(); // Use the new function name
            setResourceRequests(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching resource requests:', err);
            setError(err.message || 'Failed to fetch resource requests.');
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    const fetchAssignees = useCallback(async () => {
        if (authLoading || !user || user.role !== 'Admin') return;
        try {
            const usersData = await getAllUsers();
            const assignees = usersData.filter(u => (u.role === 'Volunteer' || u.role === 'NGO') && u.isApproved && !u.isBlocked);
            setAvailableAssignees(assignees);
        } catch (err) {
            console.error('Error fetching assignable users:', err);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchResourceRequests();
        fetchAssignees();

        // Socket.IO listeners for Resource Requests
        socket.on('newHelpRequest', (newRequest) => { // Event name from helpRequestsController
            console.log('Socket: New resource request received:', newRequest);
            setResourceRequests((prevRequests) => [newRequest, ...prevRequests]);
        });

        socket.on('helpRequestUpdated', (updatedRequest) => { // Event name from helpRequestsController
            console.log('Socket: Resource request updated:', updatedRequest);
            setResourceRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request._id === updatedRequest._id ? updatedRequest : request
                )
            );
            if (selectedRequest && selectedRequest._id === updatedRequest._id) {
                setSelectedRequest(updatedRequest);
            }
            if (currentRequestForNotes && currentRequestForNotes._id === updatedRequest._id) {
                setCurrentRequestForNotes(updatedRequest);
                setNotesContent(updatedRequest.adminNotes || '');
            }
        });

        socket.on('helpRequestDeleted', (deletedRequestId) => { // Event name from helpRequestsController
            console.log('Socket: Resource request deleted:', deletedRequestId);
            setResourceRequests((prevRequests) =>
                prevRequests.filter((request) => request._id !== deletedRequestId)
            );
            if (selectedRequest && selectedRequest._id === deletedRequestId) {
                setIsDetailModalOpen(false);
                setSelectedRequest(null);
            }
            if (currentRequestForNotes && currentRequestForNotes._id === deletedRequestId) {
                setIsNotesModalOpen(false);
                setCurrentRequestForNotes(null);
                setNotesContent('');
            }
        });

        socket.on('connect', () => console.log('Socket.IO connected for Help Requests'));
        socket.on('disconnect', () => console.log('Socket.IO disconnected for Help Requests'));
        socket.on('connect_error', (err) => console.error('Socket.IO connection error for Help Requests:', err));

        return () => {
            socket.disconnect();
        };
    }, [fetchResourceRequests, fetchAssignees, selectedRequest, currentRequestForNotes]);

    // --- Request Details Modal Handlers ---
    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
    };

    // --- Admin Notes Modal Handlers ---
    const handleOpenNotesModal = (request) => {
        setCurrentRequestForNotes(request);
        setNotesContent(request.adminNotes || '');
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setCurrentRequestForNotes(null);
        setNotesContent('');
    };

    const handleSaveAdminNotes = async () => {
        if (!currentRequestForNotes) return;

        try {
            setLoading(true);
            await addHelpRequestAdminNotes(currentRequestForNotes._id, notesContent); // Use new API function
            setSuccessMessage(`Admin notes for resource request ${currentRequestForNotes._id.substring(0, 8)}... updated!`);
            handleCloseNotesModal();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error saving admin notes:', err);
            setError(err.message || 'Failed to save admin notes.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (requestId, currentStatus, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status of resource request ${requestId.substring(0, 8)}... from "${currentStatus}" to "${newStatus}"?`)) {
            return;
        }
        try {
            setLoading(true);
            await updateHelpRequestStatus(requestId, newStatus); // Use existing API function
            setSuccessMessage(`Resource request ${requestId.substring(0, 8)}... status updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating resource request status:', err);
            setError(err.message || 'Failed to update resource request status.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRequest = async (requestId, assigneeId, assigneeName) => {
        if (!window.confirm(`Are you sure you want to assign resource request ${requestId.substring(0, 8)}... to ${assigneeName}?`)) {
            return;
        }
        try {
            setLoading(true);
            await assignHelpRequest(requestId, assigneeId); // Use new API function
            setSuccessMessage(`Resource request ${requestId.substring(0, 8)}... assigned to ${assigneeName}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error assigning resource request:', err);
            setError(err.message || 'Failed to assign resource request.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm(`Are you sure you want to DELETE resource request ${requestId.substring(0, 8)}...? This action cannot be undone.`)) {
            return;
        }
        try {
            setLoading(true);
            await deleteHelpRequest(requestId); // Use existing API function
            setSuccessMessage(`Resource request ${requestId.substring(0, 8)}... deleted successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting resource request:', err);
            setError(err.message || 'Failed to delete resource request.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="container mt-5 text-center">Loading resource requests...</div>;
    }

    if (error) {
        return (
            <div className="container mt-5 alert alert-danger text-center" role="alert">
                <h3>Error!</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!user || user.role !== 'Admin') {
        return (
            <div className="container mt-5 alert alert-warning text-center">
                <h3>Access Denied!</h3>
                <p>You must be logged in as an Administrator to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">Admin Dashboard - Resource Requests Oversight</h2>

            {successMessage && (
                <div className="alert alert-success text-center" role="alert">
                    {successMessage}
                </div>
            )}
            {resourceRequests.length === 0 && !loading && !error ? (
                <div className="alert alert-info text-center">No resource requests found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Requested By</th>
                                <th>Assigned To</th>
                                <th>Location</th>
                                <th>Requested At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resourceRequests.map((request) => (
                                <tr key={request._id}>
                                    <td>{request._id.substring(0, 8)}...</td>
                                    <td>{request.type}</td>
                                    <td>{request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''}</td>
                                    <td>{request.quantity} {request.unit}</td>
                                    <td>
                                        <span className={`badge ${
                                            request.status === 'Pending' ? 'bg-secondary' :
                                            request.status === 'Received' ? 'bg-primary' :
                                            request.status === 'In Progress' ? 'bg-warning text-dark' :
                                            request.status === 'Fulfilled' ? 'bg-success' :
                                            request.status === 'Cancelled' || request.status === 'Rejected' ? 'bg-danger' :
                                            'bg-info text-dark'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>{request.requestedBy ? `${request.requestedBy.username} (${request.requestedBy.role})` : 'N/A'}</td>
                                    <td>{request.assignedTo ? `${request.assignedTo.username} (${request.assignedTo.role})` : 'Unassigned'}</td>
                                    <td>{request.location.address || `Lat: ${request.location.latitude}, Lng: ${request.location.longitude}`}</td>
                                    <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2 mb-1"
                                            onClick={() => handleViewDetails(request)}
                                        >
                                            View
                                        </button>
                                        <div className="dropdown d-inline-block me-2 mb-1">
                                            <button
                                                className="btn btn-sm btn-secondary dropdown-toggle"
                                                type="button"
                                                id={`dropdownStatus${request._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                Status
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${request._id}`}>
                                                {['Pending', 'Received', 'In Progress', 'Fulfilled', 'Cancelled', 'Rejected'].map(statusOption => (
                                                    <li key={statusOption}>
                                                        <a
                                                            className={`dropdown-item ${request.status === statusOption ? 'active' : ''}`}
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleChangeStatus(request._id, request.status, statusOption);
                                                            }}
                                                        >
                                                            {statusOption}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="dropdown d-inline-block me-2 mb-1">
                                            <button
                                                className="btn btn-sm btn-info dropdown-toggle"
                                                type="button"
                                                id={`dropdownAssign${request._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                disabled={availableAssignees.length === 0}
                                            >
                                                Assign
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownAssign${request._id}`}>
                                                {availableAssignees.length === 0 ? (
                                                    <li><span className="dropdown-item-text text-muted">No Volunteers/NGOs available</span></li>
                                                ) : (
                                                    <>
                                                        {request.assignedTo && (
                                                            <li>
                                                                <a
                                                                    className="dropdown-item text-danger"
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignRequest(request._id, null, 'Unassigned');
                                                                    }}
                                                                >
                                                                    Unassign
                                                                </a>
                                                            </li>
                                                        )}
                                                        {availableAssignees.map(assignee => (
                                                            <li key={assignee._id}>
                                                                <a
                                                                    className={`dropdown-item ${request.assignedTo && request.assignedTo._id === assignee._id ? 'active' : ''}`}
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignRequest(request._id, assignee._id, assignee.username);
                                                                    }}
                                                                >
                                                                    {assignee.username} ({assignee.role})
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-secondary mb-1"
                                            onClick={() => handleOpenNotesModal(request)}
                                        >
                                            Add Notes
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger ms-2 mb-1"
                                            onClick={() => handleDeleteRequest(request._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Request Detail Modal */}
            {isDetailModalOpen && selectedRequest && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Resource Request Details: {selectedRequest._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetailModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Requested By:</strong> {selectedRequest.requestedBy ? `${selectedRequest.requestedBy.username} (${selectedRequest.requestedBy.role})` : 'N/A'}</p>
                                <p><strong>Type:</strong> {selectedRequest.type}</p>
                                <p><strong>Description:</strong> {selectedRequest.description}</p>
                                <p><strong>Quantity:</strong> {selectedRequest.quantity} {selectedRequest.unit}</p>
                                <p><strong>Status:</strong> <span className={`badge ${
                                            selectedRequest.status === 'Pending' ? 'bg-secondary' :
                                            selectedRequest.status === 'Received' ? 'bg-primary' :
                                            selectedRequest.status === 'In Progress' ? 'bg-warning text-dark' :
                                            selectedRequest.status === 'Fulfilled' ? 'bg-success' :
                                            selectedRequest.status === 'Cancelled' || selectedRequest.status === 'Rejected' ? 'bg-danger' :
                                            'bg-info text-dark'
                                        }`}>{selectedRequest.status}</span></p>
                                <p><strong>Location:</strong> {selectedRequest.location.address || `Lat: ${selectedRequest.location.latitude}, Lng: ${selectedRequest.location.longitude}`}</p>
                                <p><strong>Contact Info:</strong> {selectedRequest.contactInfo.name} {selectedRequest.contactInfo.phone ? `(${selectedRequest.contactInfo.phone})` : ''} {selectedRequest.contactInfo.email ? `(${selectedRequest.contactInfo.email})` : ''}</p>
                                <p><strong>Assigned To:</strong> {selectedRequest.assignedTo ? `${selectedRequest.assignedTo.username} (${selectedRequest.assignedTo.role})` : 'Unassigned'}</p>
                                <p><strong>Admin Notes:</strong> {selectedRequest.adminNotes || 'None'}</p>
                                <p><strong>Requested At:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notes Modal */}
            {isNotesModalOpen && currentRequestForNotes && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Admin Notes for Resource Request: {currentRequestForNotes._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseNotesModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="adminNotesTextarea" className="form-label">Notes:</label>
                                    <textarea
                                        className="form-control"
                                        id="adminNotesTextarea"
                                        rows="5"
                                        value={notesContent}
                                        onChange={(e) => setNotesContent(e.target.value)}
                                        placeholder="Add or edit admin notes here..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseNotesModal}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveAdminNotes} disabled={loading}>Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHelpRequestPage;

