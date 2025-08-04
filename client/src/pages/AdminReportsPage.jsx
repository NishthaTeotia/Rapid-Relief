import React, { useState, useEffect, useCallback } from 'react'; // ONLY ONE REACT IMPORT HERE
import { useAuth } from '../context/AuthContext';
import { getAllReports, updateReportStatus, deleteReport, assignReport, addAdminNotes } from '../api/reportsApi';
import { getAllUsers } from '../api/userApi';

import io from 'socket.io-client';

const AdminReportsPage = () => { // Renamed component to AdminReportsPage
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for Report Details Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State for Admin Notes Modal
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentReportForNotes, setCurrentReportForNotes] = useState(null);
    const [notesContent, setNotesContent] = useState('');

    const [availableAssignees, setAvailableAssignees] = useState([]);

    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

    const fetchReports = useCallback(async () => {
        if (authLoading || !user || user.role !== 'Admin') {
            setLoading(false);
            setError("You are not authorized to view this page.");
            return;
        }
        try {
            setLoading(true);
            const data = await getAllReports();
            setReports(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message || 'Failed to fetch reports.');
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    const fetchAssignees = useCallback(async () => {
        if (authLoading || !user || user.role !== 'Admin') return;
        try {
            const usersData = await getAllUsers();
            const assignees = usersData.filter(u => (u.role === 'Volunteer' || u.role === 'NGO') && u.isApproved && !u.isBlocked); // Only approved, non-blocked
            setAvailableAssignees(assignees);
        } catch (err) {
            console.error('Error fetching assignable users:', err);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchReports();
        fetchAssignees();

        socket.on('newReport', (newReport) => {
            console.log('Socket: New report received:', newReport);
            setReports((prevReports) => [newReport, ...prevReports]);
        });

        socket.on('reportUpdated', (updatedReport) => {
            console.log('Socket: Report updated:', updatedReport);
            setReports((prevReports) =>
                prevReports.map((report) =>
                    report._id === updatedReport._id ? updatedReport : report
                )
            );
            if (selectedReport && selectedReport._id === updatedReport._id) {
                setSelectedReport(updatedReport);
            }
            if (currentReportForNotes && currentReportForNotes._id === updatedReport._id) {
                setCurrentReportForNotes(updatedReport);
                setNotesContent(updatedReport.adminNotes || '');
            }
        });

        socket.on('reportDeleted', (deletedReportId) => {
            console.log('Socket: Report deleted:', deletedReportId);
            setReports((prevReports) =>
                prevReports.filter((report) => report._id !== deletedReportId)
            );
            if (selectedReport && selectedReport._id === deletedReportId) {
                setIsDetailModalOpen(false);
                setSelectedReport(null);
            }
            if (currentReportForNotes && currentReportForNotes._id === deletedReportId) {
                setIsNotesModalOpen(false);
                setCurrentReportForNotes(null);
                setNotesContent('');
            }
        });

        socket.on('connect', () => console.log('Socket.IO connected'));
        socket.on('disconnect', () => console.log('Socket.IO disconnected'));
        socket.on('connect_error', (err) => console.error('Socket.IO connection error:', err));

        return () => {
            socket.disconnect();
        };
    }, [fetchReports, fetchAssignees, selectedReport, currentReportForNotes]);

    // --- Report Details Modal Handlers ---
    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReport(null);
    };

    // --- Admin Notes Modal Handlers ---
    const handleOpenNotesModal = (report) => {
        setCurrentReportForNotes(report);
        setNotesContent(report.adminNotes || '');
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setCurrentReportForNotes(null);
        setNotesContent('');
    };

    const handleSaveAdminNotes = async () => {
        if (!currentReportForNotes) return;

        try {
            setLoading(true);
            await addAdminNotes(currentReportForNotes._id, notesContent);
            setSuccessMessage(`Admin notes for report ${currentReportForNotes._id.substring(0, 8)}... updated!`);
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

    const handleChangeStatus = async (reportId, currentStatus, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status of report ${reportId.substring(0, 8)}... from "${currentStatus}" to "${newStatus}"?`)) {
            return;
        }
        try {
            setLoading(true);
            await updateReportStatus(reportId, newStatus);
            setSuccessMessage(`Report ${reportId.substring(0, 8)}... status updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating report status:', err);
            setError(err.message || 'Failed to update report status.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignReport = async (reportId, assigneeId, assigneeName) => {
        if (!window.confirm(`Are you sure you want to assign report ${reportId.substring(0, 8)}... to ${assigneeName}?`)) {
            return;
        }
        try {
            setLoading(true);
            await assignReport(reportId, assigneeId);
            setSuccessMessage(`Report ${reportId.substring(0, 8)}... assigned to ${assigneeName}!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error assigning report:', err);
            setError(err.message || 'Failed to assign report.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm(`Are you sure you want to DELETE report ${reportId.substring(0, 8)}...? This action cannot be undone.`)) {
            return;
        }
        try {
            setLoading(true);
            await deleteReport(reportId);
            setSuccessMessage(`Report ${reportId.substring(0, 8)}... deleted successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting report:', err);
            setError(err.message || 'Failed to delete report.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="container mt-5 text-center">Loading emergency reports...</div>;
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
            <h2 className="mb-4 text-center">Admin Dashboard - Emergency Reports Oversight</h2>

            {successMessage && (
                <div className="alert alert-success text-center" role="alert">
                    {successMessage}
                </div>
            )}
            {reports.length === 0 && !loading && !error ? (
                <div className="alert alert-info text-center">No emergency reports found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Reporter</th>
                                <th>Assigned To</th>
                                <th>Location</th>
                                <th>Reported At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id}>
                                    <td>{report._id.substring(0, 8)}...</td>
                                    <td>{report.type}</td>
                                    <td>
                                        <span className={`badge ${
                                            report.severity === 'Critical' ? 'bg-danger' :
                                            report.severity === 'High' ? 'bg-warning text-dark' :
                                            report.severity === 'Medium' ? 'bg-info text-dark' :
                                            'bg-secondary'
                                        }`}>
                                            {report.severity}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            report.status === 'Pending' ? 'bg-secondary' :
                                            report.status === 'Received' ? 'bg-primary' :
                                            report.status === 'Assigned' ? 'bg-info text-dark' :
                                            report.status === 'In Progress' ? 'bg-warning text-dark' :
                                            report.status === 'Resolved' ? 'bg-success' :
                                            report.status === 'Closed' ? 'bg-dark' :
                                            'bg-danger'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td>{report.reporter ? `${report.reporter.username} (${report.reporter.role})` : 'N/A'}</td>
                                    <td>{report.assignedTo ? `${report.assignedTo.username} (${report.assignedTo.role})` : 'Unassigned'}</td>
                                    <td>{report.location.address || `Lat: ${report.location.latitude}, Lng: ${report.location.longitude}`}</td>
                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2 mb-1"
                                            onClick={() => handleViewDetails(report)}
                                        >
                                            View
                                        </button>
                                        <div className="dropdown d-inline-block me-2 mb-1">
                                            <button
                                                className="btn btn-sm btn-secondary dropdown-toggle"
                                                type="button"
                                                id={`dropdownStatus${report._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                Status
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${report._id}`}>
                                                {['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(statusOption => (
                                                    <li key={statusOption}>
                                                        <a
                                                            className={`dropdown-item ${report.status === statusOption ? 'active' : ''}`}
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleChangeStatus(report._id, report.status, statusOption);
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
                                                id={`dropdownAssign${report._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                disabled={availableAssignees.length === 0}
                                            >
                                                Assign
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownAssign${report._id}`}>
                                                {availableAssignees.length === 0 ? (
                                                    <li><span className="dropdown-item-text text-muted">No Volunteers/NGOs available</span></li>
                                                ) : (
                                                    <>
                                                        {report.assignedTo && (
                                                            <li>
                                                                <a
                                                                    className="dropdown-item text-danger"
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignReport(report._id, null, 'Unassigned');
                                                                    }}
                                                                >
                                                                    Unassign
                                                                </a>
                                                            </li>
                                                        )}
                                                        {availableAssignees.map(assignee => (
                                                            <li key={assignee._id}>
                                                                <a
                                                                    className={`dropdown-item ${report.assignedTo && report.assignedTo._id === assignee._id ? 'active' : ''}`}
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignReport(report._id, assignee._id, assignee.username);
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
                                            onClick={() => handleOpenNotesModal(report)}
                                        >
                                            Add Notes
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger ms-2 mb-1"
                                            onClick={() => handleDeleteReport(report._id)}
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

            {/* Report Detail Modal */}
            {isDetailModalOpen && selectedReport && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Report Details: {selectedReport._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetailModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Reporter:</strong> {selectedReport.reporter ? `${selectedReport.reporter.username} (${selectedReport.reporter.role})` : 'N/A'}</p>
                                <p><strong>Type:</strong> {selectedReport.type}</p>
                                <p><strong>Severity:</strong> <span className={`badge ${
                                            selectedReport.severity === 'Critical' ? 'bg-danger' :
                                            selectedReport.severity === 'High' ? 'bg-warning text-dark' :
                                            selectedReport.severity === 'Medium' ? 'bg-info text-dark' :
                                            'bg-secondary'
                                        }`}>{selectedReport.severity}</span></p>
                                <p><strong>Status:</strong> <span className={`badge ${
                                            selectedReport.status === 'Pending' ? 'bg-secondary' :
                                            selected.status === 'Received' ? 'bg-primary' :
                                            selectedReport.status === 'Assigned' ? 'bg-info text-dark' :
                                            selectedReport.status === 'In Progress' ? 'bg-warning text-dark' :
                                            selectedReport.status === 'Resolved' ? 'bg-success' :
                                            selectedReport.status === 'Closed' ? 'bg-dark' :
                                            'bg-danger'
                                        }`}>{selectedReport.status}</span></p>
                                <p><strong>Description:</strong> {selectedReport.description}</p>
                                <p><strong>Location:</strong> {selectedReport.location.address || `Lat: ${selectedReport.location.latitude}, Lng: ${selectedReport.location.longitude}`}</p>
                                <p><strong>Assigned To:</strong> {selectedReport.assignedTo ? `${selectedReport.assignedTo.username} (${selectedReport.assignedTo.role})` : 'Unassigned'}</p>
                                <p><strong>Admin Notes:</strong> {selectedReport.adminNotes || 'None'}</p>
                                <p><strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                {selectedReport.images && selectedReport.images.length > 0 && (
                                    <div>
                                        <strong>Images:</strong>
                                        <div className="d-flex flex-wrap mt-2">
                                            {selectedReport.images.map((img, index) => (
                                                <img key={index} src={img} alt={`Report Image ${index + 1}`} className="img-thumbnail me-2 mb-2" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }} />
                                            ))}
                                        </div>
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
            {isNotesModalOpen && currentReportForNotes && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Admin Notes for Report: {currentReportForNotes._id.substring(0, 8)}...</h5>
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

export default AdminReportsPage;
