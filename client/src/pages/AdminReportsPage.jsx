import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllReports, updateReportStatus, deleteReport, assignReport, addAdminNotes } from '../api/reportsApi';
import { getAllUsers } from '../api/userApi';
import io from 'socket.io-client';

const AdminReportsPage = () => {
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
            const assignees = usersData.filter(u => (u.role === 'Volunteer' || u.role === 'NGO') && u.isApproved && !u.isBlocked);
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
        return <div className="container mt-5 text-center" style={{ color: '#ffffff' }}>Loading emergency reports...</div>;
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
            <h2 className="mb-4 text-center" style={{ color: '#ffffff', borderBottom: '2px solid #555', paddingBottom: '10px' }}>Admin Dashboard - Emergency Reports Oversight</h2>

            {successMessage && (
                <div className="alert alert-success text-center" role="alert" style={{ backgroundColor: '#1a2d1a', borderColor: '#2a4e2a', color: '#ccffcc', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                    {successMessage}
                </div>
            )}
            {reports.length === 0 && !loading && !error ? (
                <div className="alert alert-info text-center" style={{ backgroundColor: '#1a2d2d', borderColor: '#2a4e4e', color: '#ccffff', borderRadius: '8px', padding: '12px' }}>No emergency reports found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered" style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', color: '#ffffff', backgroundColor: '#1e1e1e' }}>
                        <thead className="table-dark" style={{ backgroundColor: '#2a2a2a' }}>
                            <tr>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>ID</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Type</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Severity</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Status</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Reporter</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Assigned To</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Location</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Reported At</th>
                                <th style={{ padding: '12px', border: '1px solid #444' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id} style={{ transition: 'background-color 0.3s ease', borderBottom: '1px solid #444' }}>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{report._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{report.type}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>
                                        <span className={`badge ${
                                            report.severity === 'Critical' ? 'bg-danger' :
                                            report.severity === 'High' ? 'bg-warning text-dark' :
                                            report.severity === 'Medium' ? 'bg-info text-dark' :
                                            'bg-secondary'
                                        }`} style={{
                                            padding: '5px 10px',
                                            borderRadius: '12px',
                                            backgroundColor:
                                                report.severity === 'Critical' ? '#dc3545' :
                                                report.severity === 'High' ? '#ffc107' :
                                                report.severity === 'Medium' ? '#0dcaf0' :
                                                '#6c757d',
                                            color: report.severity === 'High' || report.severity === 'Medium' ? '#212529' : '#ffffff'
                                        }}>
                                            {report.severity}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>
                                        <span className={`badge ${
                                            report.status === 'Pending' ? 'bg-secondary' :
                                            report.status === 'Received' ? 'bg-primary' :
                                            report.status === 'Assigned' ? 'bg-info text-dark' :
                                            report.status === 'In Progress' ? 'bg-warning text-dark' :
                                            report.status === 'Resolved' ? 'bg-success' :
                                            report.status === 'Closed' ? 'bg-dark' :
                                            'bg-danger'
                                        }`} style={{
                                            padding: '5px 10px',
                                            borderRadius: '12px',
                                            backgroundColor:
                                                report.status === 'Pending' ? '#6c757d' :
                                                report.status === 'Received' ? '#0d6efd' :
                                                report.status === 'Assigned' ? '#0dcaf0' :
                                                report.status === 'In Progress' ? '#ffc107' :
                                                report.status === 'Resolved' ? '#198754' :
                                                report.status === 'Closed' ? '#343a40' :
                                                '#dc3545',
                                            color: report.status === 'Assigned' || report.status === 'In Progress' ? '#212529' : '#ffffff'
                                        }}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{report.reporter ? `${report.reporter.username} (${report.reporter.role})` : 'N/A'}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{report.assignedTo ? report.assignedTo.username : 'Unassigned'}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{report.location.address || `Lat: ${report.location.latitude}, Lng: ${report.location.longitude}`}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444' }}>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', border: '1px solid #444', whiteSpace: 'nowrap' }}>
                                        <button
                                            className="btn btn-sm btn-primary me-2 mb-1"
                                            onClick={() => handleViewDetails(report)}
                                            style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginRight: '8px' }}
                                        >
                                            View
                                        </button>
                                        {/* Status Dropdown */}
                                        <div className="dropdown d-inline-block me-2 mb-1" style={{ position: 'relative' }}>
                                            <button
                                                className="btn btn-sm btn-secondary dropdown-toggle"
                                                type="button"
                                                id={`dropdownStatus${report._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                Status
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${report._id}`} style={{ position: 'absolute', top: '100%', left: '0', zIndex: '1000', float: 'left', minWidth: '10rem', padding: '0.5rem 0', margin: '0.125rem 0 0', fontSize: '1rem', color: '#ffffff', textAlign: 'left', listStyle: 'none', backgroundColor: '#333', backgroundClip: 'padding-box', border: '1px solid rgba(0,0,0,.15)', borderRadius: '0.25rem' }}>
                                                {['Pending', 'Received', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(statusOption => (
                                                    <li key={statusOption}>
                                                        <a
                                                            className={`dropdown-item ${report.status === statusOption ? 'active' : ''}`}
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleChangeStatus(report._id, report.status, statusOption);
                                                            }}
                                                            style={{ display: 'block', width: '100%', padding: '0.25rem 1rem', clear: 'both', fontWeight: '400', color: report.status === statusOption ? '#fff' : '#ffffff', textAlign: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap', backgroundColor: report.status === statusOption ? '#0d6efd' : '#333', border: '0' }}
                                                        >
                                                            {statusOption}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Assign Dropdown */}
                                        <div className="dropdown d-inline-block me-2 mb-1" style={{ position: 'relative' }}>
                                            <button
                                                className="btn btn-sm btn-info dropdown-toggle"
                                                type="button"
                                                id={`dropdownAssign${report._id}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                disabled={availableAssignees.length === 0}
                                                style={{ backgroundColor: '#0dcaf0', color: '#212529', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: availableAssignees.length === 0 ? '0.65' : '1' }}
                                            >
                                                Assign
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby={`dropdownAssign${report._id}`} style={{ position: 'absolute', top: '100%', left: '0', zIndex: '1000', float: 'left', minWidth: '10rem', padding: '0.5rem 0', margin: '0.125rem 0 0', fontSize: '1rem', color: '#ffffff', textAlign: 'left', listStyle: 'none', backgroundColor: '#333', backgroundClip: 'padding-box', border: '1px solid rgba(0,0,0,.15)', borderRadius: '0.25rem' }}>
                                                {availableAssignees.length === 0 ? (
                                                    <li><span className="dropdown-item-text text-muted" style={{ display: 'block', padding: '0.25rem 1rem', color: '#999' }}>No Volunteers/NGOs available</span></li>
                                                ) : (
                                                    <>
                                                        <li>
                                                            <a
                                                                className={`dropdown-item ${!report.assignedTo ? 'active' : ''}`}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleAssignReport(report._id, null, 'Unassigned');
                                                                }}
                                                                style={{ display: 'block', width: '100%', padding: '0.25rem 1rem', clear: 'both', fontWeight: '400', color: !report.assignedTo ? '#fff' : '#ffffff', textAlign: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap', backgroundColor: !report.assignedTo ? '#0d6efd' : '#333', border: '0' }}
                                                            >
                                                                Unassigned
                                                            </a>
                                                        </li>
                                                        {availableAssignees.map(assignee => (
                                                            <li key={assignee._id}>
                                                                <a
                                                                    className={`dropdown-item ${report.assignedTo && report.assignedTo._id === assignee._id ? 'active' : ''}`}
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAssignReport(report._id, assignee._id, assignee.username);
                                                                    }}
                                                                    style={{ display: 'block', width: '100%', padding: '0.25rem 1rem', clear: 'both', fontWeight: '400', color: report.assignedTo && report.assignedTo._id === assignee._id ? '#fff' : '#ffffff', textAlign: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap', backgroundColor: report.assignedTo && report.assignedTo._id === assignee._id ? '#0dcaf0' : '#333', border: '0' }}
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
                                            style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginRight: '8px' }}
                                        >
                                            Add Notes
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger ms-2 mb-1"
                                            onClick={() => handleDeleteReport(report._id)}
                                            style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
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

            {/* Modal Backdrop and Blur Effect */}
            {(isDetailModalOpen || isNotesModalOpen) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 1040 }}></div>
            )}

            {/* Report Detail Modal */}
            {isDetailModalOpen && selectedReport && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{ width: '90%', maxWidth: '800px' }}>
                        <div className="modal-content" style={{ backgroundColor: '#2a2a2a', color: '#ffffff', borderRadius: '10px', border: '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #444', padding: '15px 20px' }}>
                                <h5 className="modal-title" style={{ margin: '0' }}>Report Details: {selectedReport._id.substring(0, 8)}...</h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetailModal} aria-label="Close" style={{ filter: 'invert(1)', opacity: '0.8' }}></button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Reporter:</strong> {selectedReport.reporter ? `${selectedReport.reporter.username} (${selectedReport.reporter.role})` : 'N/A'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Type:</strong> {selectedReport.type}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Severity:</strong> <span className={`badge ${
                                    selectedReport.severity === 'Critical' ? 'bg-danger' :
                                    selectedReport.severity === 'High' ? 'bg-warning text-dark' :
                                    selectedReport.severity === 'Medium' ? 'bg-info text-dark' :
                                    'bg-secondary'
                                }`} style={{
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    backgroundColor:
                                        selectedReport.severity === 'Critical' ? '#dc3545' :
                                        selectedReport.severity === 'High' ? '#ffc107' :
                                        selectedReport.severity === 'Medium' ? '#0dcaf0' :
                                        '#6c757d',
                                    color: selectedReport.severity === 'High' || selectedReport.severity === 'Medium' ? '#212529' : '#ffffff'
                                }}>{selectedReport.severity}</span></p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Status:</strong> <span className={`badge ${
                                    selectedReport.status === 'Pending' ? 'bg-secondary' :
                                    selectedReport.status === 'Received' ? 'bg-primary' :
                                    selectedReport.status === 'Assigned' ? 'bg-info text-dark' :
                                    selectedReport.status === 'In Progress' ? 'bg-warning text-dark' :
                                    selectedReport.status === 'Resolved' ? 'bg-success' :
                                    selectedReport.status === 'Closed' ? 'bg-dark' :
                                    'bg-danger'
                                }`} style={{
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    backgroundColor:
                                        selectedReport.status === 'Pending' ? '#6c757d' :
                                        selectedReport.status === 'Received' ? '#0d6efd' :
                                        selectedReport.status === 'Assigned' ? '#0dcaf0' :
                                        selectedReport.status === 'In Progress' ? '#ffc107' :
                                        selectedReport.status === 'Resolved' ? '#198754' :
                                        selectedReport.status === 'Closed' ? '#343a40' :
                                        '#dc3545',
                                    color: selectedReport.status === 'Assigned' || selectedReport.status === 'In Progress' ? '#212529' : '#ffffff'
                                }}>{selectedReport.status}</span></p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Description:</strong> {selectedReport.description}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Location:</strong> {selectedReport.location.address || `Lat: ${selectedReport.location.latitude}, Lng: ${selectedReport.location.longitude}`}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Assigned To:</strong> {selectedReport.assignedTo ? `${selectedReport.assignedTo.username} (${selectedReport.assignedTo.role})` : 'Unassigned'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Admin Notes:</strong> {selectedReport.adminNotes || 'None'}</p>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                {selectedReport.images && selectedReport.images.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <strong style={{ display: 'block', marginBottom: '10px' }}>Images:</strong>
                                        <div className="d-flex flex-wrap mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {selectedReport.images.map((img, index) => (
                                                <img key={index} src={img} alt={`Report Image ${index + 1}`} className="img-thumbnail me-2 mb-2" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #444' }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #444', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notes Modal */}
            {isNotesModalOpen && currentReportForNotes && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ width: '90%', maxWidth: '500px' }}>
                        <div className="modal-content" style={{ backgroundColor: '#2a2a2a', color: '#ffffff', borderRadius: '10px', border: '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #444', padding: '15px 20px' }}>
                                <h5 className="modal-title" style={{ margin: '0' }}>Admin Notes for Report: {currentReportForNotes._id.substring(0, 8)}...</h5>
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

export default AdminReportsPage;