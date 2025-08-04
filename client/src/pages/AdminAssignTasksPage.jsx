import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllReports, updateReportStatus, assignReport, addAdminNotes as addReportAdminNotes } from '../api/reportsApi';
import { getAllHelpRequests, updateHelpRequestStatus, assignHelpRequest, addHelpRequestAdminNotes } from '../api/helpRequestsApi';
import { getAllUsers } from '../api/userApi';

import io from 'socket.io-client';

const AdminAssignTasksPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState([]); // Unified state for all tasks (reports + help requests)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All'); // Filter tasks by status
    const [filterType, setFilterType] = useState('All');     // Filter tasks by type (Report/Resource)
    const [filterAssignee, setFilterAssignee] = useState('All'); // Filter tasks by assigned user

    const [availableAssignees, setAvailableAssignees] = useState([]);

    // State for Task Details Modal
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State for Admin Notes Modal
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentTaskForNotes, setCurrentTaskForNotes] = useState(null);
    const [notesContent, setNotesContent] = useState('');

    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

    const fetchTasks = useCallback(async () => {
        if (authLoading || !user || user.role !== 'Admin') {
            setLoading(false);
            setError("You are not authorized to view this page.");
            return;
        }
        try {
            setLoading(true);
            const [reportsData, helpRequestsData] = await Promise.all([
                getAllReports(),
                getAllHelpRequests()
            ]);

            // Combine and normalize data
            const combinedTasks = [
                ...reportsData.map(report => ({ ...report, taskType: 'Report' })),
                ...helpRequestsData.map(request => ({ ...request, taskType: 'Resource Request' }))
            ];

            // Filter for assigned tasks
            const assignedTasks = combinedTasks.filter(task => task.assignedTo !== null);

            setTasks(assignedTasks);
            setError(null);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message || 'Failed to fetch tasks.');
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
        fetchTasks();
        fetchAssignees();

        // Socket.IO listeners for reports
        socket.on('newReport', (newReport) => {
            if (newReport.assignedTo) { // Only add if it's an assigned report
                setTasks(prevTasks => [{ ...newReport, taskType: 'Report' }, ...prevTasks]);
            }
        });
        socket.on('reportUpdated', (updatedReport) => {
            setTasks(prevTasks => {
                const updated = prevTasks.map(task =>
                    task._id === updatedReport._id && task.taskType === 'Report' ? { ...updatedReport, taskType: 'Report' } : task
                );
                // If a report was unassigned, remove it from this list
                if (updatedReport.assignedTo === null && updated.some(task => task._id === updatedReport._id && task.taskType === 'Report')) {
                    return updated.filter(task => task._id !== updatedReport._id);
                }
                // If a report was newly assigned and wasn't in the list, add it
                if (updatedReport.assignedTo && !prevTasks.some(task => task._id === updatedReport._id && task.taskType === 'Report')) {
                    return [{ ...updatedReport, taskType: 'Report' }, ...updated];
                }
                return updated;
            });
            if (selectedTask && selectedTask._id === updatedReport._id && selectedTask.taskType === 'Report') {
                setSelectedTask({ ...updatedReport, taskType: 'Report' });
            }
            if (currentTaskForNotes && currentTaskForNotes._id === updatedReport._id && currentTaskForNotes.taskType === 'Report') {
                setCurrentTaskForNotes({ ...updatedReport, taskType: 'Report' });
                setNotesContent(updatedReport.adminNotes || '');
            }
        });
        socket.on('reportDeleted', (deletedReportId) => {
            setTasks(prevTasks => prevTasks.filter(task => !(task._id === deletedReportId && task.taskType === 'Report')));
            if (selectedTask && selectedTask._id === deletedReportId && selectedTask.taskType === 'Report') {
                setIsDetailModalOpen(false);
                setSelectedTask(null);
            }
            if (currentTaskForNotes && currentTaskForNotes._id === deletedReportId && currentTaskForNotes.taskType === 'Report') {
                setIsNotesModalOpen(false);
                setCurrentTaskForNotes(null);
                setNotesContent('');
            }
        });

        // Socket.IO listeners for help requests
        socket.on('newHelpRequest', (newRequest) => {
            if (newRequest.assignedTo) { // Only add if it's an assigned request
                setTasks(prevTasks => [{ ...newRequest, taskType: 'Resource Request' }, ...prevTasks]);
            }
        });
        socket.on('helpRequestUpdated', (updatedRequest) => {
            setTasks(prevTasks => {
                const updated = prevTasks.map(task =>
                    task._id === updatedRequest._id && task.taskType === 'Resource Request' ? { ...updatedRequest, taskType: 'Resource Request' } : task
                );
                // If a request was unassigned, remove it from this list
                if (updatedRequest.assignedTo === null && updated.some(task => task._id === updatedRequest._id && task.taskType === 'Resource Request')) {
                    return updated.filter(task => task._id !== updatedRequest._id);
                }
                // If a request was newly assigned and wasn't in the list, add it
                if (updatedRequest.assignedTo && !prevTasks.some(task => task._id === updatedRequest._id && task.taskType === 'Resource Request')) {
                    return [{ ...updatedRequest, taskType: 'Resource Request' }, ...updated];
                }
                return updated;
            });
            if (selectedTask && selectedTask._id === updatedRequest._id && selectedTask.taskType === 'Resource Request') {
                setSelectedTask({ ...updatedRequest, taskType: 'Resource Request' });
            }
            if (currentTaskForNotes && currentTaskForNotes._id === updatedRequest._id && currentTaskForNotes.taskType === 'Resource Request') {
                setCurrentTaskForNotes({ ...updatedRequest, taskType: 'Resource Request' });
                setNotesContent(updatedRequest.adminNotes || '');
            }
        });
        socket.on('helpRequestDeleted', (deletedRequestId) => {
            setTasks(prevTasks => prevTasks.filter(task => !(task._id === deletedRequestId && task.taskType === 'Resource Request')));
            if (selectedTask && selectedTask._id === deletedRequestId && selectedTask.taskType === 'Resource Request') {
                setIsDetailModalOpen(false);
                setSelectedTask(null);
            }
            if (currentTaskForNotes && currentTaskForNotes._id === deletedRequestId && currentTaskForNotes.taskType === 'Resource Request') {
                setIsNotesModalOpen(false);
                setCurrentTaskForNotes(null);
                setNotesContent('');
            }
        });

        socket.on('connect', () => console.log('Socket.IO connected for Admin Tasks'));
        socket.on('disconnect', () => console.log('Socket.IO disconnected for Admin Tasks'));
        socket.on('connect_error', (err) => console.error('Socket.IO connection error for Admin Tasks:', err));

        return () => {
            socket.disconnect();
        };
    }, [fetchTasks, fetchAssignees, selectedTask, currentTaskForNotes]);

    // Filtered tasks for display
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesType = filterType === 'All' || task.taskType === filterType;
        const matchesAssignee = filterAssignee === 'All' || (task.assignedTo && task.assignedTo._id === filterAssignee);
        return matchesStatus && matchesType && matchesAssignee;
    }).sort((a, b) => new Date(b.createdAt || b.requestedAt) - new Date(a.createdAt || a.requestedAt)); // Sort by most recent

    // --- Task Details Modal Handlers ---
    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTask(null);
    };

    // --- Admin Notes Modal Handlers ---
    const handleOpenNotesModal = (task) => {
        setCurrentTaskForNotes(task);
        setNotesContent(task.adminNotes || '');
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setCurrentTaskForNotes(null);
        setNotesContent('');
    };

    const handleSaveAdminNotes = async () => {
        if (!currentTaskForNotes) return;

        try {
            setLoading(true);
            if (currentTaskForNotes.taskType === 'Report') {
                await addReportAdminNotes(currentTaskForNotes._id, notesContent);
            } else if (currentTaskForNotes.taskType === 'Resource Request') {
                await addHelpRequestAdminNotes(currentTaskForNotes._id, notesContent);
            }
            setSuccessMessage(`Admin notes for task ${currentTaskForNotes._id.substring(0, 8)}... updated!`);
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

    const handleChangeStatus = async (taskId, taskType, currentStatus, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status of ${taskType} ${taskId.substring(0, 8)}... from "${currentStatus}" to "${newStatus}"?`)) {
            return;
        }
        try {
            setLoading(true);
            if (taskType === 'Report') {
                await updateReportStatus(taskId, newStatus);
            } else if (taskType === 'Resource Request') {
                await updateHelpRequestStatus(taskId, newStatus);
            }
            setSuccessMessage(`${taskType} ${taskId.substring(0, 8)}... status updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating task status:', err);
            setError(err.message || 'Failed to update task status.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTask = async (taskId, taskType, assigneeId, assigneeName) => {
        if (!window.confirm(`Are you sure you want to assign ${taskType} ${taskId.substring(0, 8)}... to ${assigneeName}?`)) {
            return;
        }
        try {
            setLoading(true);
            if (taskType === 'Report') {
                await assignReport(taskId, assigneeId);
            } else if (taskType === 'Resource Request') {
                await assignHelpRequest(taskId, assigneeId);
            }
            setSuccessMessage(`${taskType} ${taskId.substring(0, 8)}... assigned to ${assigneeName}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error assigning task:', err);
            setError(err.message || 'Failed to assign task.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId, taskType) => {
        if (!window.confirm(`Are you sure you want to DELETE ${taskType} ${taskId.substring(0, 8)}...? This action cannot be undone.`)) {
            return;
        }
        try {
            setLoading(true);
            if (taskType === 'Report') {
                await deleteReport(taskId);
            } else if (taskType === 'Resource Request') {
                await deleteHelpRequest(taskId);
            }
            setSuccessMessage(`${taskType} ${taskId.substring(0, 8)}... deleted successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting task:', err);
            setError(err.message || 'Failed to delete task.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="container mt-5 text-center">Loading assigned tasks...</div>;
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

    // Determine all possible statuses across both types for filter dropdown
    const allPossibleStatuses = [
        'All',
        'Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected', // Report statuses
        'Fulfilled', 'Cancelled' // Help Request specific statuses
    ].filter((value, index, self) => self.indexOf(value) === index); // Deduplicate

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">Admin Dashboard - Assigned Tasks Overview</h2>

            {successMessage && (
                <div className="alert alert-success text-center" role="alert">
                    {successMessage}
                </div>
            )}

            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div className="d-flex gap-3">
                    {/* Filter by Status */}
                    <div className="form-group">
                        <label htmlFor="filterStatus" className="form-label visually-hidden">Filter by Status</label>
                        <select
                            id="filterStatus"
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            {allPossibleStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter by Type */}
                    <div className="form-group">
                        <label htmlFor="filterType" className="form-label visually-hidden">Filter by Type</label>
                        <select
                            id="filterType"
                            className="form-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Report">Emergency Report</option>
                            <option value="Resource Request">Resource Request</option>
                        </select>
                    </div>

                    {/* Filter by Assignee */}
                    <div className="form-group">
                        <label htmlFor="filterAssignee" className="form-label visually-hidden">Filter by Assignee</label>
                        <select
                            id="filterAssignee"
                            className="form-select"
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                        >
                            <option value="All">All Assignees</option>
                            {availableAssignees.map(assignee => (
                                <option key={assignee._id} value={assignee._id}>{assignee.username} ({assignee.role})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredTasks.length === 0 && !loading && !error ? (
                <div className="alert alert-info text-center">No assigned tasks found matching the current filters.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Category</th> {/* Report type or Resource type */}
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Requester/Reporter</th>
                                <th>Location</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task._id}>
                                    <td>{task._id.substring(0, 8)}...</td>
                                    <td>
                                        <span className={`badge ${
                                            task.taskType === 'Report' ? 'bg-danger' : 'bg-info text-dark'
                                        }`}>
                                            {task.taskType}
                                        </span>
                                    </td>
                                    <td>{task.type}</td> {/* This is the specific type (e.g., Flood, Food) */}
                                    <td>
                                        <span className={`badge ${
                                            task.status === 'Pending' || task.status === 'Received' ? 'bg-secondary' :
                                            task.status === 'Assigned' ? 'bg-primary' :
                                            task.status === 'In Progress' ? 'bg-warning text-dark' :
                                            task.status === 'Resolved' || task.status === 'Fulfilled' ? 'bg-success' :
                                            task.status === 'Closed' || task.status === 'Cancelled' || task.status === 'Rejected' ? 'bg-dark' :
                                            'bg-danger'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td>{task.assignedTo ? `${task.assignedTo.username} (${task.assignedTo.role})` : 'Unassigned'}</td>
                                    <td>{task.requestedBy ? `${task.requestedBy.username} (${task.requestedBy.role})` : task.reporter ? `${task.reporter.username} (${task.reporter.role})` : 'N/A'}</td>
                                    <td>{task.location.address || `Lat: ${task.location.latitude}, Lng: ${task.location.longitude}`}</td>
                                    <td>{new Date(task.createdAt || task.requestedAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2 mb-1"
                                            onClick={() => handleViewDetails(task)}
                                        >
                                            View
                                        </button>
                                        <div className="dropdown d-inline-block me-2 mb-1">
                                            <button
                                                className="btn btn-sm btn-secondary dropdown-toggle"
                                                type="button"
                                                id={`dropdownStatus${task._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                Status
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${task._id}`}>
                                                {/* Status options vary by task type */}
                                                {task.taskType === 'Report' ? (
                                                    ['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(statusOption => (
                                                        <li key={statusOption}>
                                                            <a
                                                                className={`dropdown-item ${task.status === statusOption ? 'active' : ''}`}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleChangeStatus(task._id, task.taskType, task.status, statusOption);
                                                                }}
                                                            >
                                                                {statusOption}
                                                            </a>
                                                        </li>
                                                    ))
                                                ) : ( // Resource Request
                                                    ['Pending', 'Received', 'In Progress', 'Fulfilled', 'Cancelled', 'Rejected'].map(statusOption => (
                                                        <li key={statusOption}>
                                                            <a
                                                                className={`dropdown-item ${task.status === statusOption ? 'active' : ''}`}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleChangeStatus(task._id, task.taskType, task.status, statusOption);
                                                                }}
                                                            >
                                                                {statusOption}
                                                            </a>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                        <div className="dropdown d-inline-block me-2 mb-1">
                                            <button
                                                className="btn btn-sm btn-info dropdown-toggle"
                                                type="button"
                                                id={`dropdownAssign${task._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                disabled={availableAssignees.length === 0}
                                            >
                                                Assign
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownAssign${task._id}`}>
                                                {availableAssignees.length === 0 ? (
                                                    <li><span className="dropdown-item-text text-muted">No Volunteers/NGOs available</span></li>
                                                ) : (
                                                    <>
                                                        {task.assignedTo && (
                                                            <li>
                                                                <a
                                                                    className="dropdown-item text-danger"
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignTask(task._id, task.taskType, null, 'Unassigned');
                                                                    }}
                                                                >
                                                                    Unassign
                                                                </a>
                                                            </li>
                                                        )}
                                                        {availableAssignees.map(assignee => (
                                                            <li key={assignee._id}>
                                                                <a
                                                                    className={`dropdown-item ${task.assignedTo && task.assignedTo._id === assignee._id ? 'active' : ''}`}
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignTask(task._id, task.taskType, assignee._id, assignee.username);
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
                                            onClick={() => handleOpenNotesModal(task)}
                                        >
                                            Add Notes
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger ms-2 mb-1"
                                            onClick={() => handleDeleteTask(task._id, task.taskType)}
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

            {/* Task Detail Modal */}
            {isDetailModalOpen && selectedTask && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedTask.taskType} Details: {selectedTask._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetailModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Type:</strong> {selectedTask.type}</p>
                                <p><strong>Status:</strong> <span className={`badge ${
                                            selectedTask.status === 'Pending' || selectedTask.status === 'Received' ? 'bg-secondary' :
                                            selectedTask.status === 'Assigned' ? 'bg-primary' :
                                            selectedTask.status === 'In Progress' ? 'bg-warning text-dark' :
                                            selectedTask.status === 'Resolved' || selectedTask.status === 'Fulfilled' ? 'bg-success' :
                                            selectedTask.status === 'Closed' || selectedTask.status === 'Cancelled' || selectedTask.status === 'Rejected' ? 'bg-dark' :
                                            'bg-danger'
                                        }`}>{selectedTask.status}</span></p>
                                <p><strong>Description:</strong> {selectedTask.description}</p>
                                {selectedTask.severity && <p><strong>Severity:</strong> <span className={`badge ${
                                            selectedTask.severity === 'Critical' ? 'bg-danger' :
                                            selectedTask.severity === 'High' ? 'bg-warning text-dark' :
                                            selectedTask.severity === 'Medium' ? 'bg-info text-dark' :
                                            'bg-secondary'
                                        }`}>{selectedTask.severity}</span></p>}
                                {selectedTask.quantity && <p><strong>Quantity:</strong> {selectedTask.quantity} {selectedTask.unit}</p>}
                                <p><strong>Location:</strong> {selectedTask.location.address || `Lat: ${selectedTask.location.latitude}, Lng: ${selectedTask.location.longitude}`}</p>
                                <p><strong>Requested By:</strong> {selectedTask.requestedBy ? `${selectedTask.requestedBy.username} (${selectedTask.requestedBy.role})` : selectedTask.reporter ? `${selectedTask.reporter.username} (${selectedTask.reporter.role})` : 'N/A'}</p>
                                <p><strong>Assigned To:</strong> {selectedTask.assignedTo ? `${selectedTask.assignedTo.username} (${selectedTask.assignedTo.role})` : 'Unassigned'}</p>
                                <p><strong>Admin Notes:</strong> {selectedTask.adminNotes || 'None'}</p>
                                <p><strong>Date:</strong> {new Date(selectedTask.createdAt || selectedTask.requestedAt).toLocaleString()}</p>
                                {selectedTask.images && selectedTask.images.length > 0 && (
                                    <div>
                                        <strong>Images:</strong>
                                        <div className="d-flex flex-wrap mt-2">
                                            {selectedTask.images.map((img, index) => (
                                                <img key={index} src={img} alt={`Task Image ${index + 1}`} className="img-thumbnail me-2 mb-2" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedTask.contactInfo && (
                                    <div>
                                        <strong>Contact Info:</strong>
                                        <p>{selectedTask.contactInfo.name} {selectedTask.contactInfo.phone ? `(${selectedTask.contactInfo.phone})` : ''} {selectedTask.contactInfo.email ? `(${selectedTask.contactInfo.email})` : ''}</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notes Modal */}
            {isNotesModalOpen && currentTaskForNotes && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Admin Notes for {currentTaskForNotes.taskType}: {currentTaskForNotes._id.substring(0, 8)}...</h5>
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

export default AdminAssignTasksPage;
