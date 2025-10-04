import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getAllHelpRequests,
    updateHelpRequestStatus,
    deleteHelpRequest,
    assignHelpRequest,
    addHelpRequestAdminNotes
} from '../api/helpRequestsApi';
import { getAllUsers } from '../api/userApi';
import io from 'socket.io-client';

const AdminHelpRequestPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [resourceRequests, setResourceRequests] = useState([]);
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
            const data = await getAllHelpRequests();
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
        socket.on('newHelpRequest', (newRequest) => {
            console.log('Socket: New resource request received:', newRequest);
            setResourceRequests((prevRequests) => [newRequest, ...prevRequests]);
        });

        socket.on('helpRequestUpdated', (updatedRequest) => {
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

        socket.on('helpRequestDeleted', (deletedRequestId) => {
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
            await addHelpRequestAdminNotes(currentRequestForNotes._id, notesContent);
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
            await updateHelpRequestStatus(requestId, newStatus);
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
            await assignHelpRequest(requestId, assigneeId);
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
            await deleteHelpRequest(requestId);
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
        return <div className="container mt-5 text-center" style={{ color: '#ffffff' }}>Loading tasks...</div>;
    }

    if (error) {
        return (
            <div className="container mt-5 alert alert-danger text-center" role="alert" style={{ backgroundColor: '#2d1a1a', borderColor: '#4e2a2a', color: '#ffcccc', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Error!</h3>
                <p style={{ margin: '0' }}>{error}</p>
            </div>
        );
    }

    if (!user || user.role !== 'Admin') {
        return (
            <div className="container mt-5 alert alert-warning text-center" style={{ backgroundColor: '#2d2d1a', borderColor: '#4e4e2a', color: '#ffffcc', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Access Denied!</h3>
                <p style={{ margin: '0' }}>You must be logged in as an Administrator to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container mt-5" style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', padding: '20px', borderRadius: '10px' }}>
            <h2 className="mb-4 text-center" style={{ color: '#ffffff', borderBottom: '2px solid #555', paddingBottom: '10px' }}>Admin Dashboard - Resource Requests Oversight</h2>

            {successMessage && (
                <div className="alert alert-success text-center" role="alert" style={{ backgroundColor: '#1a2d1a', borderColor: '#2a4e2a', color: '#ccffcc', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                    {successMessage}
                </div>
            )}
            {resourceRequests.length === 0 && !loading && !error ? (
                <div className="alert alert-info text-center" style={{ backgroundColor: '#1a2d2d', borderColor: '#2a4e4e', color: '#ccffff', borderRadius: '8px', padding: '12px' }}>No resource requests found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', color: '#ffffff', backgroundColor: '#1e1e1e', border: '1px solid #444' }}>
                        <thead style={{ backgroundColor: '#2a2a2a' }}>
                            <tr>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>ID</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Type</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Quantity</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Status</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Requested By</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Assigned To</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Location</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Requested At</th>
                                <th style={{ padding: '12px', border: '1px solid #444', whiteSpace: 'nowrap' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resourceRequests.map((request) => (
                                <tr key={request._id} style={{ transition: 'background-color 0.3s ease', borderBottom: '1px solid #444' }}>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.type}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.quantity} {request.unit}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>
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
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.requestedBy ? `${request.requestedBy.username} (${request.requestedBy.role})` : 'N/A'}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.assignedTo ? `${request.assignedTo.username} (${request.assignedTo.role})` : 'Unassigned'}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{request.location.address || `Lat: ${request.location.latitude}, Lng: ${request.location.longitude}`}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{new Date(request.requestedAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
                                            <button
                                                className="btn btn-sm btn-primary me-2 mb-1"
                                                onClick={() => handleViewDetails(request)}
                                                style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginRight: '8px' }}
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
                                                    style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                    Status
                                                </button>
                                                <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${request._id}`} style={{ backgroundColor: '#333', color: '#ffffff', border: '1px solid #555' }}>
                                                    {['Pending', 'Received', 'In Progress', 'Fulfilled', 'Cancelled', 'Rejected'].map(statusOption => (
                                                        <li key={statusOption}>
                                                            <a
                                                                className={`dropdown-item ${request.status === statusOption ? 'active' : ''}`}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleChangeStatus(request._id, request.status, statusOption);
                                                                }}
                                                                style={{ color: '#ffffff', backgroundColor: request.status === statusOption ? '#0d6efd' : 'transparent' }}
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
                                                    style={{ backgroundColor: '#0dcaf0', color: '#212529', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: availableAssignees.length === 0 ? '0.65' : '1' }}
                                                >
                                                    Assign
                                                </button>
                                                <ul className="dropdown-menu" aria-labelledby={`dropdownAssign${request._id}`} style={{ backgroundColor: '#333', color: '#ffffff', border: '1px solid #555' }}>
                                                    {availableAssignees.length === 0 ? (
                                                        <li><span className="dropdown-item-text text-muted" style={{ color: '#999' }}>No Volunteers/NGOs available</span></li>
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
                                                                        style={{ color: '#dc3545', backgroundColor: 'transparent' }}
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
                                                                        style={{ color: '#ffffff', backgroundColor: request.assignedTo && request.assignedTo._id === assignee._id ? '#0dcaf0' : 'transparent' }}
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
                                                style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginRight: '8px' }}
                                            >
                                                Add Notes
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger ms-2 mb-1"
                                                onClick={() => handleDeleteRequest(request._id)}
                                                style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Backdrop and Blur Effect */}
            {(isDetailModalOpen || isNotesModalOpen) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 1040 }}></div>
            )}

            {/* Request Detail Modal */}
            {isDetailModalOpen && selectedRequest && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{ width: '90%', maxWidth: '800px' }}>
                        <div className="modal-content" style={{ backgroundColor: '#2a2a2a', color: '#ffffff', borderRadius: '10px', border: '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #444', padding: '15px 20px' }}>
                                <h5 className="modal-title" style={{ margin: '0' }}>Resource Request Details: {selectedRequest._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetailModal} aria-label="Close" style={{ filter: 'invert(1)', opacity: '0.8' }}></button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Requested By:</strong> {selectedRequest.requestedBy ? `${selectedRequest.requestedBy.username} (${selectedRequest.requestedBy.role})` : 'N/A'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Type:</strong> {selectedRequest.type}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Description:</strong> {selectedRequest.description}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Quantity:</strong> {selectedRequest.quantity} {selectedRequest.unit}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Status:</strong> <span className={`badge ${
                                            selectedRequest.status === 'Pending' ? 'bg-secondary' :
                                            selectedRequest.status === 'Received' ? 'bg-primary' :
                                            selectedRequest.status === 'In Progress' ? 'bg-warning text-dark' :
                                            selectedRequest.status === 'Fulfilled' ? 'bg-success' :
                                            selectedRequest.status === 'Cancelled' || selectedRequest.status === 'Rejected' ? 'bg-danger' :
                                            'bg-info text-dark'
                                        }`} style={{
                                            padding: '5px 10px',
                                            borderRadius: '12px',
                                            backgroundColor:
                                                selectedRequest.status === 'Pending' ? '#6c757d' :
                                                selectedRequest.status === 'Received' ? '#0d6efd' :
                                                selectedRequest.status === 'In Progress' ? '#ffc107' :
                                                selectedRequest.status === 'Fulfilled' ? '#198754' :
                                                '#dc3545',
                                            color: selectedRequest.status === 'In Progress' ? '#212529' : '#ffffff'
                                        }}>{selectedRequest.status}</span></p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Location:</strong> {selectedRequest.location.address || `Lat: ${selectedRequest.location.latitude}, Lng: ${selectedRequest.location.longitude}`}</p>
                                {/* THIS LINE IS THE FIX */}
                                <p style={{ margin: '0 0 10px 0' }}><strong>Contact Info:</strong> {selectedRequest.contactInfo?.name} {selectedRequest.contactInfo?.phone ? `(${selectedRequest.contactInfo.phone})` : ''} {selectedRequest.contactInfo?.email ? `(${selectedRequest.contactInfo.email})` : ''}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Assigned To:</strong> {selectedRequest.assignedTo ? `${selectedRequest.assignedTo.username} (${selectedRequest.assignedTo.role})` : 'Unassigned'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Admin Notes:</strong> {selectedRequest.adminNotes || 'None'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Requested At:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #444', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notes Modal */}
            {isNotesModalOpen && currentRequestForNotes && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ width: '90%', maxWidth: '500px' }}>
                        <div className="modal-content" style={{ backgroundColor: '#2a2a2a', color: '#ffffff', borderRadius: '10px', border: '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #444', padding: '15px 20px' }}>
                                <h5 className="modal-title" style={{ margin: '0' }}>Admin Notes for Resource Request: {currentRequestForNotes._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseNotesModal} aria-label="Close" style={{ filter: 'invert(1)', opacity: '0.8' }}></button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                                <div className="mb-3" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="adminNotesTextarea" className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Notes:</label>
                                    <textarea
                                        className="form-control"
                                        id="adminNotesTextarea"
                                        rows="5"
                                        value={notesContent}
                                        onChange={(e) => setNotesContent(e.target.value)}
                                        placeholder="Add or edit admin notes here..."
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#333', border: '1px solid #555', color: '#ffffff', borderRadius: '5px' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #444', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseNotesModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', marginRight: '10px' }}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveAdminNotes} disabled={loading} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', opacity: loading ? '0.65' : '1' }}>Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHelpRequestPage;