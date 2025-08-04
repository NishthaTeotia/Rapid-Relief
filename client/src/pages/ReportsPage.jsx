// client/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
// Removed useNavigate as it's no longer needed on this page
// Removed ReportForm import as it's no longer on this page
import ReportCard from '../components/ReportCard';
import MapView from '../components/MapView';
import { getPublicReports } from '../api/reportsApi'; // This import is correct and necessary for display
import { io } from 'socket.io-client';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed successMessage state as form submission is moved
    // Removed navigate initialization as it's no longer needed on this page

    // Function to fetch reports from the API
    const loadReports = async () => {
        try {
            const response = await getPublicReports(); // This call is correct for fetching public reports
            if (Array.isArray(response)) {
                setReports(response);
            } else if (response && Array.isArray(response.reports)) {
                setReports(response.reports);
            } else {
                console.error("API response for reports was not an array or expected object:", response);
                setError("Received invalid data format for reports.");
                setReports([]);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error loading reports:", err);
            setError('Failed to fetch reports. Please check backend connection and ensure the /api/reports/public route is correctly implemented and accessible.');
            setLoading(false);
        }
    };

    // Initialize fetching and Socket.IO connection on component mount
    useEffect(() => {
        loadReports();

        const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server for real-time updates');
        });

        // Listen for new reports broadcasted by the backend
        socket.on('newReport', (newReport) => {
            console.log('Received new report via Socket.IO:', newReport);
            // Only add if it matches public criteria (e.g., status is 'Pending', 'Received', 'Assigned', 'In Progress')
            if (newReport && typeof newReport === 'object' && !Array.isArray(newReport) &&
                ['Pending', 'Received', 'Assigned', 'In Progress'].includes(newReport.status)) {
                setReports(prevReports => [newReport, ...prevReports]);
            } else {
                console.warn("Received invalid or non-public newReport object via Socket.IO:", newReport);
            }
        });

        // Listen for updated reports
        socket.on('reportUpdated', (updatedReport) => {
            console.log('Received updated report via Socket.IO:', updatedReport);
            setReports(prevReports => {
                if (!['Pending', 'Received', 'Assigned', 'In Progress'].includes(updatedReport.status)) {
                    return prevReports.filter(report => report._id !== updatedReport._id);
                }
                const exists = prevReports.some(report => report._id === updatedReport._id);
                if (exists) {
                    return prevReports.map(report =>
                        report._id === updatedReport._id ? updatedReport : report
                    );
                } else {
                    return [updatedReport, ...prevReports];
                }
            });
        });

        // Listen for deleted reports
        socket.on('reportDeleted', (deletedReportId) => {
            console.log('Received deleted report ID via Socket.IO:', deletedReportId);
            setReports(prevReports => prevReports.filter(report => report._id !== deletedReportId));
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Removed handleReportSubmitted as form submission is moved to SubmitReportPage.jsx

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading reports...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Disaster Reports & Live Map</h1>

            {/* Removed successMessage display as form submission is moved */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Map View Section - Now takes full width on large screens */}
                <div className="lg:col-span-2">
                    <section className="mb-10 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Incident Map</h2>
                        <div className="h-[400px] w-full rounded-lg overflow-hidden">
                            <MapView reports={reports} />
                        </div>
                    </section>
                </div>

                {/* Reports List Section - Now takes 1/3 width on large screens */}
                <div className="lg:col-span-1">
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Public Reports</h2>
                        <div className="grid grid-cols-1 gap-8"> {/* Changed to single column for better fit */}
                            {Array.isArray(reports) && reports.length > 0 ? (
                                reports.map(report => (
                                    <ReportCard key={report._id} report={report} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No disaster reports available yet.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;





