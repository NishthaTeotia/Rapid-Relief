// src/pages/UserDashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyReports, updateReportStatus } from '../api/reportsApi';
import { getMyHelpRequests, updateHelpRequestStatus } from '../api/helpRequestsApi';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import io from 'socket.io-client';
import './UserDashboardPage.css'; // Assuming you have a CSS file for styles
import{
    LayoutDashboard,
   

   
    Layout,
    AlertCircle,
    LogOutIcon,
} from 'lucide-react';
// Helper function for status badge colors (can be reused)
const getStatusColorClass = (status) => {
    switch (status) {
        case 'Pending': return 'status-pending';
        case 'Received': return 'status-received';
        case 'Assigned': return 'status-assigned';
        case 'In Progress': return 'status-in-progress';
        case 'Resolved':
        case 'Fulfilled': return 'status-resolved';
        case 'Closed': return 'status-closed';
        case 'Cancelled':
        case 'Rejected': return 'status-cancelled';
        case 'Critical': return 'status-critical';
        case 'High': return 'status-high';
        case 'Medium': return 'status-medium';
        case 'Low': return 'status-low';
        default: return 'status-default';
    }
};

// Helper for sidebar items
const SidebarItem = ({ section, icon: Icon, label, activeSection, setActiveSection }) => (
    <li>
        <button
            onClick={() => setActiveSection(section)}
            className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
        >
            <Icon className="sidebar-icon" />
            <span>{label}</span>
        </button>
    </li>
);

// Card component for dashboard overview
const DashboardCard = ({ title, description, imageSrc, linkTo, status, priority }) => (
    <Link
        to={linkTo}
        className="dashboard-card-link"
    >
        <div className="dashboard-card">
            <div className="dashboard-card-image-container">
                <img src={imageSrc || "https://placehold.co/150x100/282828/fff?text=AI"} alt="AI" className="dashboard-card-image" />
                {priority && (
                    <div className="dashboard-card-priority">
                        {priority}
                    </div>
                )}
            </div>
            <div className="dashboard-card-content">
                <div>
                    <h3 className="dashboard-card-title">{title}</h3>
                    <p className="dashboard-card-description">{description}</p>
                </div>
                <div className="dashboard-card-status-container">
                    <span>{status}</span>
                    {status && (
                        <span className="dashboard-card-status-badge">
                            {status}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </Link>
);


const UserDashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [myReports, setMyReports] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');

    const socketRef = useRef(null);

    const fetchUserTasks = useCallback(async () => {
        if (authLoading || !user) {
            setLoading(false);
            setError("Please log in to view your dashboard.");
            return;
        }

        try {
            setLoading(true);
            const [allMyRelatedReports, allMyRelatedHelpRequests] = await Promise.all([
                getMyReports(),
                getMyHelpRequests()
            ]);

            const userSubmittedReports = allMyRelatedReports.filter(report => {
                return report.reporter && report.reporter._id.toString() === user.id;
            });
            setMyReports(userSubmittedReports);

            const userSubmittedRequests = allMyRelatedHelpRequests.filter(request => {
                return request.requestedBy && request.requestedBy._id.toString() === user.id;
            });
            setMyRequests(userSubmittedRequests);

            if (user.role === 'Volunteer' || user.role === 'NGO') {
                const assignedReports = allMyRelatedReports.filter(report =>
                    report.assignedTo && report.assignedTo._id.toString() === user.id
                );
                const assignedRequests = allMyRelatedHelpRequests.filter(request =>
                    request.assignedTo && request.assignedTo._id.toString() === user.id
                );

                const combinedAssigned = [
                    ...assignedReports.map(task => ({ ...task, taskType: 'Report' })),
                    ...assignedRequests.map(task => ({ ...task, taskType: 'Resource Request' }))
                ].sort((a, b) => new Date(b.createdAt || b.requestedAt) - new Date(a.createdAt || a.requestedAt));

                setAssignedTasks(combinedAssigned);
            } else {
                setAssignedTasks([]);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching user dashboard data:', err);
            setError(err.message || 'Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchUserTasks();

        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
            socketRef.current.on('connect', () => console.log('Socket.IO connected for User Dashboard'));
            socketRef.current.on('disconnect', () => console.log('Socket.IO disconnected for User Dashboard'));
            socketRef.current.on('connect_error', (err) => console.error('Socket.IO connection error for User Dashboard:', err));
        }

        const socket = socketRef.current;

        return () => {
            if (socketRef.current) {
                socketRef.current.off('newReport');
                socketRef.current.off('reportUpdated');
                socketRef.current.off('reportDeleted');
                socketRef.current.off('newHelpRequest');
                socketRef.current.off('helpRequestUpdated');
                socketRef.current.off('helpRequestDeleted');
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [fetchUserTasks, user]);

    const handleChangeAssignedTaskStatus = async (taskId, taskType, currentStatus, newStatus) => {
        console.log(`Attempting to change status of ${taskType} ${taskId.substring(0, 8)}... from "${currentStatus}" to "${newStatus}"...`);

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

    const handleLogout = () => {
        navigate('/logout-confirm');
    };


    if (authLoading || loading) {
        return (
            <div className="loading-container">
                Loading your dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h3 className="error-title">Error!</h3>
                    <p className="error-message">{error}</p>
                    <Link to="/login" className="login-link">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="access-denied-container">
                <div className="access-denied-card">
                    <h3 className="access-denied-title">Access Denied!</h3>
                    <p className="access-denied-message">You must be logged in to view your dashboard.</p>
                    <Link to="/login" className="login-link">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    const allUserRelatedMapItems = [
        ...myReports.map(item => ({
            _id: item._id,
            type: item.type + ' (My Report)',
            description: item.description,
            location: item.location,
            status: item.status,
            severity: item.severity,
            taskType: 'Report'
        })),
        ...myRequests.map(item => ({
            _id: item._id,
            type: item.type + ' (My Request)',
            description: item.description,
            location: item.location,
            status: item.status,
            taskType: 'Resource Request'
        })),
        ...(user.role === 'Volunteer' || user.role === 'NGO' ? assignedTasks.map(item => ({
            _id: item._id,
            type: item.type + ' (Assigned)',
            description: item.description,
            location: item.location,
            status: item.status,
            severity: item.severity,
            taskType: item.taskType
        })) : [])
    ];

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">RapidRelief</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        <SidebarItem section="dashboard" icon={LayoutDashboard} label="Dashboard" activeSection={activeSection} setActiveSection={setActiveSection} />
                        <SidebarItem section="my-reports" icon={AlertCircle} label="My Reports" activeSection={activeSection} setActiveSection={setActiveSection} />
                        <SidebarItem section="my-requests" icon={Layout} label="My Resource Requests" activeSection={activeSection} setActiveSection={setActiveSection} />
                        
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        <LogOutIcon className="sidebar-icon" />
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1 className="main-title">Dashboard</h1>
                    
                </header>

                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                <>
                    {activeSection === 'dashboard' && (
                        <section>
                            <div className="dashboard-cards-container">
                                <DashboardCard
                                    title="Submit a Report"
                                    description="Report a new emergency incident."
                                    imageSrc="/r1.avif"
                                    linkTo="/submit-report"
                                    
                                    
                                />
                                <DashboardCard
                                    title="Submit a Resource Request"
                                    description="Request essential resources like food, water, or medical aid."
                                    imageSrc="/resource.png"
                                    linkTo="/submit-resource-request"
                                   
                                   
                                />
                            </div>

                            <div className="map-view-container">
                                <div className="map-view-header">
                                    <h2 className="map-view-title">Overview Map of Your Activities</h2>
                                    <div className="map-view-map">
                                        <MapView reports={allUserRelatedMapItems} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'my-reports' && (
                        <section>
                            {myReports.length === 0 ? (
                                <div className="empty-state-message">
                                    <p>You have not submitted any emergency reports yet.</p>
                                    <Link to="/submit-report" className="cta-button">
                                        Submit a Report
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead className="table-header">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Type</th>
                                                    <th>Severity</th>
                                                    <th>Status</th>
                                                    <th>Location</th>
                                                    <th>Reported At</th>
                                                    <th>Assigned To</th>
                                                </tr>
                                            </thead>
                                            <tbody className="table-body">
                                                {myReports.map(report => (
                                                    <tr key={report._id} className="table-row">
                                                        <td>{report._id.substring(0, 8)}...</td>
                                                        <td>{report.type}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusColorClass(report.severity)}`}>
                                                                {report.severity}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusColorClass(report.status)}`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td>{report.location.address || `Lat: ${report.location.latitude.toFixed(4)}, Lng: ${report.location.longitude.toFixed(4)}`}</td>
                                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                                        <td>{report.assignedTo ? `${report.assignedTo.username} (${report.assignedTo.role})` : 'Unassigned'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeSection === 'my-requests' && (
                        <section>
                            {myRequests.length === 0 ? (
                                <div className="empty-state-message">
                                    <p>You have not submitted any resource requests yet.</p>
                                    <Link to="/submit-resource-request" className="cta-button">
                                        Submit a Resource Request
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead className="table-header">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Type</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Location</th>
                                                    <th>Requested At</th>
                                                    <th>Assigned To</th>
                                                </tr>
                                            </thead>
                                            <tbody className="table-body">
                                                {myRequests.map(request => (
                                                    <tr key={request._id} className="table-row">
                                                        <td>{request._id.substring(0, 8)}...</td>
                                                        <td>{request.type}</td>
                                                        <td>{request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusColorClass(request.status)}`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                        <td>{request.location.address || `Lat: ${request.location.latitude.toFixed(4)}, Lng: ${request.location.longitude.toFixed(4)}`}</td>
                                                        <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                                                        <td>{request.assignedTo ? `${request.assignedTo.username} (${request.assignedTo.role})` : 'Unassigned'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeSection === 'assigned-tasks' && (user.role === 'Volunteer' || user.role === 'NGO') && (
                        <section>
                            {assignedTasks.length === 0 ? (
                                <div className="empty-state-message">
                                    <p>No tasks are currently assigned to you.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead className="table-header">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Category</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Location</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="table-body">
                                                {assignedTasks.map(task => (
                                                    <tr key={task._id} className="table-row">
                                                        <td>{task._id.substring(0, 8)}...</td>
                                                        <td>{task.taskType}</td>
                                                        <td>{task.type}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusColorClass(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td>{task.location.address || `Lat: ${task.location.latitude.toFixed(4)}, Lng: ${task.location.longitude.toFixed(4)}`}</td>
                                                        <td>{new Date(task.createdAt || task.requestedAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <select
                                                                onChange={(e) => handleChangeAssignedTaskStatus(task._id, task.taskType, task.status, e.target.value)}
                                                                value={task.status}
                                                                className="status-dropdown"
                                                            >
                                                                <option value="Assigned">Assigned</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Resolved">Resolved</option>
                                                                <option value="Fulfilled">Fulfilled</option>
                                                                <option value="Rejected">Rejected</option>
                                                                <option value="Closed">Closed</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </>
            </main>
        </div>
    );
};

export default UserDashboardPage;