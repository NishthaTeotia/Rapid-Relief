// client/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import ReportForm from '../components/ReportForm';
import ReportCard from '../components/ReportCard';
import MapView from '../components/MapView';
import { fetchReports } from '../api/reportsApi'; // Correct import
import { io } from 'socket.io-client'; // Correct import

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch reports from the API
    const loadReports = async () => {
        try {
            const response = await fetchReports();
            // --- FIX APPLIED HERE ---
            // Ensure response.data is an array before setting state
            if (Array.isArray(response.data)) {
                setReports(response.data);
            } else {
                console.error("API response for reports was not an array:", response.data);
                setError("Received invalid data format for reports.");
                setReports([]); // Fallback to empty array
            }
            // --- END FIX ---
            setLoading(false);
        } catch (err) {
            console.error("Error loading reports:", err); // More detailed error logging
            setError('Failed to fetch reports. Please check backend connection.');
            setLoading(false);
        }
    };

    // Initialize fetching and Socket.IO connection on component mount
    useEffect(() => {
        loadReports();

        // Connect to WebSocket server
        const socket = io(import.meta.env.VITE_BACKEND_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket server for real-time updates');
        });

        // Listen for new reports broadcasted by the backend
        socket.on('newReport', (newReport) => {
            console.log('Received new report via Socket.IO:', newReport);
            // Ensure newReport is a single object before adding
            if (newReport && typeof newReport === 'object' && !Array.isArray(newReport)) {
                setReports(prevReports => [newReport, ...prevReports]);
            } else {
                console.warn("Received invalid newReport object via Socket.IO:", newReport);
            }
        });

        // Listen for updated reports
        socket.on('reportUpdated', (updatedReport) => {
            console.log('Received updated report via Socket.IO:', updatedReport);
            setReports(prevReports => prevReports.map(report =>
                report._id === updatedReport._id ? updatedReport : report
            ));
        });

        // Listen for deleted reports
        socket.on('reportDeleted', (deletedReportId) => {
            console.log('Received deleted report ID via Socket.IO:', deletedReportId);
            setReports(prevReports => prevReports.filter(report => report._id !== deletedReportId));
        });


        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Clean up socket connection on unmount
        return () => {
            socket.disconnect();
        };
    }, []); // Empty dependency array means this runs once on mount

    // Handle report submission success (re-fetches data or relies on Socket.IO)
    const handleReportSubmitted = () => {
        // Socket.IO should handle the update for new submissions
        // If Socket.IO fails, a full reload might be desired as fallback: loadReports();
        console.log('Report submitted. Awaiting real-time update via Socket.IO.');
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading reports...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-dark mb-8">Disaster Reports & Live Map</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Map View Section */}
                <div className="lg:col-span-2">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Incident Map</h2>
                        <MapView reports={reports} /> {/* Pass the reports array */}
                    </section>

                    {/* Reports List Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Reports</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* --- FIX APPLIED HERE --- */}
                            {Array.isArray(reports) && reports.length > 0 ? (
                                reports.map(report => (
                                    <ReportCard key={report._id} report={report} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No disaster reports available yet.</p>
                            )}
                            {/* --- END FIX --- */}
                        </div>
                    </section>
                </div>

                {/* Submit Report Section */}
                <div>
                    <section>
                        <ReportForm onReportSubmitted={handleReportSubmitted} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;