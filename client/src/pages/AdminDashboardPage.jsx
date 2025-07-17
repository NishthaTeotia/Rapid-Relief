// client/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import ReportCard from '../components/ReportCard';
import HelpRequestCard from '../components/HelpRequestCard';
import VolunteerCard from '../components/VolunteerCard';
import { fetchReports, updateReport } from '../api/reportsApi'; // Import updateReport
import { fetchHelpRequests, updateHelpRequestStatus, deleteHelpRequest } from '../api/helpRequestsApi';
import { fetchVolunteers, deleteVolunteer } from '../api/volunteersApi';
import { io } from 'socket.io-client'; // Import socket.io

const AdminDashboardPage = () => {
    const [reports, setReports] = useState([]);
    const [helpRequests, setHelpRequests] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAllData = useCallback(async () => { // Wrapped in useCallback
        setLoading(true);
        setError(null);
        try {
            const [reportsRes, helpRes, volRes] = await Promise.all([
                fetchReports(),
                fetchHelpRequests(),
                fetchVolunteers()
            ]);

            // Ensure data is array before setting state
            setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
            setHelpRequests(Array.isArray(helpRes.data) ? helpRes.data : []);
            setVolunteers(Array.isArray(volRes.data) ? volRes.data : []);

            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard data. Please check backend connection.');
            setLoading(false);
            console.error(err);
        }
    }, []); // Empty dependency array

    useEffect(() => {
        loadAllData();

        const socket = io(import.meta.env.VITE_BACKEND_URL);

        // Socket.IO listeners for real-time updates
        socket.on('newReport', (newReport) => {
            console.log('Admin: New report via Socket.IO:', newReport);
            setReports(prev => [newReport, ...prev]);
        });
        socket.on('reportUpdated', (updatedReport) => {
            console.log('Admin: Report updated via Socket.IO:', updatedReport);
            setReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r));
        });
        socket.on('reportDeleted', (deletedReportId) => {
            console.log('Admin: Report deleted via Socket.IO:', deletedReportId);
            setReports(prev => prev.filter(r => r._id !== deletedReportId));
        });

        socket.on('newHelpRequest', (newRequest) => {
            console.log('Admin: New help request via Socket.IO:', newRequest);
            setHelpRequests(prev => [newRequest, ...prev]);
        });
        socket.on('helpRequestUpdated', (updatedRequest) => {
            console.log('Admin: Help request updated via Socket.IO:', updatedRequest);
            setHelpRequests(prev => prev.map(hr => hr._id === updatedRequest._id ? updatedRequest : hr));
        });
        socket.on('helpRequestDeleted', (deletedRequestId) => {
            console.log('Admin: Help request deleted via Socket.IO:', deletedRequestId);
            setHelpRequests(prev => prev.filter(hr => hr._id !== deletedRequestId));
        });

        // Add similar listeners for volunteers if you implement real-time updates for them
        // socket.on('newVolunteer', (newVolunteer) => { ... });
        // socket.on('volunteerDeleted', (deletedVolunteerId) => { ... });


        socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error on Admin Dashboard:', err.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [loadAllData]); // Depend on loadAllData


    const handleReportStatusChange = async (id, newStatus) => {
        try {
            // Assuming the status field is part of the report document
            await updateReport(id, { status: newStatus });
            // Socket.IO will handle updating the state, so no need to loadAllData() immediately
            console.log(`Report ${id} status updated to ${newStatus}. Waiting for Socket.IO update.`);
        } catch (err) {
            setError('Failed to update report status.');
            console.error(err);
        }
    };

    const handleHelpRequestStatusChange = async (id, newStatus) => {
        try {
            await updateHelpRequestStatus(id, newStatus);
            // Socket.IO will handle updating the state
            console.log(`Help request ${id} status updated to ${newStatus}. Waiting for Socket.IO update.`);
        } catch (err) {
            setError('Failed to update help request status.');
            console.error(err);
        }
    };

    const handleDeleteHelpRequest = async (id) => {
        if (window.confirm('Are you sure you want to delete this help request?')) {
            try {
                await deleteHelpRequest(id);
                // Socket.IO will handle updating the state
                console.log(`Help request ${id} deleted. Waiting for Socket.IO update.`);
            } catch (err) {
                setError('Failed to delete help request.');
                console.error(err);
            }
        }
    };

    const handleDeleteVolunteer = async (id) => {
        if (window.confirm('Are you sure you want to remove this volunteer?')) {
            try {
                await deleteVolunteer(id);
                // No Socket.IO for volunteers deletion yet, so manual reload
                loadAllData();
            } catch (err) {
                setError('Failed to delete volunteer.');
                console.error(err);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading admin dashboard...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-dark mb-8">Admin Dashboard</h1>
            <p className="text-red-600 font-semibold mb-6">WARNING: This page is for demonstration purposes. In a real application, it must be secured with proper authentication and authorization!</p>

            {/* Reports Management */}
            <section className="mb-10 bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Disaster Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reports.length > 0 ? (
                        reports.map(report => (
                            <ReportCard
                                key={report._id}
                                report={report}
                                isAdmin={true}
                                onStatusChange={handleReportStatusChange}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic col-span-full">No disaster reports to manage.</p>
                    )}
                </div>
            </section>

            {/* Help Requests Management */}
            <section className="mb-10 bg-white p-6 rounded-lg shadow-lg border-t-4 border-secondary">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Help Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {helpRequests.length > 0 ? (
                        helpRequests.map(request => (
                            <HelpRequestCard
                                key={request._id}
                                request={request}
                                isAdmin={true}
                                onStatusChange={handleHelpRequestStatusChange}
                                onDelete={handleDeleteHelpRequest}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic col-span-full">No help requests to manage.</p>
                    )}
                </div>
            </section>

            {/* Volunteers Management */}
            <section className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Volunteers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {volunteers.length > 0 ? (
                        volunteers.map(volunteer => (
                            <VolunteerCard
                                key={volunteer._id}
                                volunteer={volunteer}
                                isAdmin={true}
                                onDelete={handleDeleteVolunteer}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic col-span-full">No volunteers to manage.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;