import React, { useState, useEffect } from 'react';
// Removed useNavigate as it's no longer needed on this page
// Removed HelpForm import as it's no longer on this page
import HelpRequestCard from '../components/HelpRequestCard';
import MapView from '../components/MapView';
import { getPublicHelpRequests } from '../api/helpRequestsApi'; // This import is correct and necessary for display
import { io } from 'socket.io-client';

const HelpPage = () => {
    const [helpRequests, setHelpRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed successMessage state as form submission is moved
    // Removed navigate initialization as it's no longer needed on this page

    const loadHelpRequests = async () => {
        try {
            const response = await getPublicHelpRequests();
            if (Array.isArray(response)) {
                setHelpRequests(response);
            } else {
                console.error("API response for public help requests was not an array:", response);
                setError("Received invalid data format for help requests.");
                setHelpRequests([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error loading public help requests:', err);
            setError('Failed to fetch public help requests. Please ensure the backend is running and the public endpoint is accessible.');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHelpRequests();

        const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server for help requests');
        });

        socket.on('newHelpRequest', (newRequest) => {
            console.log('Received new help request via Socket.IO:', newRequest);
            if (newRequest && typeof newRequest === 'object' && !Array.isArray(newRequest)) {
                // For public view, only add if it matches public criteria (e.g., status is 'Pending', 'In Progress', 'Received')
                if (['Pending', 'Received', 'In Progress'].includes(newRequest.status)) {
                    setHelpRequests(prevRequests => [newRequest, ...prevRequests]);
                }
            } else {
                console.warn("Received invalid newHelpRequest object via Socket.IO:", newRequest);
            }
        });

        socket.on('helpRequestUpdated', (updatedRequest) => {
            console.log('Received updated help request via Socket.IO:', updatedRequest);
            setHelpRequests(prevRequests => {
                // If the updated request is no longer public, remove it from the list
                if (!['Pending', 'Received', 'In Progress'].includes(updatedRequest.status)) {
                    return prevRequests.filter(request => request._id !== updatedRequest._id);
                }
                // Otherwise, update or add it
                const exists = prevRequests.some(request => request._id === updatedRequest._id);
                if (exists) {
                    return prevRequests.map(request =>
                        request._id === updatedRequest._id ? updatedRequest : request
                    );
                } else {
                    return [updatedRequest, ...prevRequests]; // Add if it's new and public-facing
                }
            });
        });

        socket.on('helpRequestDeleted', (deletedRequestId) => {
            console.log('Received deleted help request ID via Socket.IO:', deletedRequestId);
            setHelpRequests(prevRequests => prevRequests.filter(request => request._id !== deletedRequestId));
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('connect_error', (err) => console.error('Socket.IO connection error for HelpPage:', err));

        return () => {
            socket.disconnect();
        };
    }, []);

    // Removed handleHelpRequestSubmitted as form submission is moved to SubmitResourceRequestPage.jsx

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading help requests...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    // Transform help requests for MapView (MapView expects 'reports' array with 'location' object structure)
    const mapItems = Array.isArray(helpRequests) ? helpRequests.map(req => ({
        _id: req._id,
        type: req.type + ' Request', // Differentiate on map
        description: req.description,
        location: req.location,
        status: req.status, // Use status for color if MapView supports it
        imageUrl: null // No images for help requests in this model
    })) : [];

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Help Requests & Coordination</h1>

            {/* Removed successMessage display as form submission is moved */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Map View Section for Help Requests - Now takes full width on large screens */}
                <div className="lg:col-span-2">
                    <section className="mb-10 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Resource Request Map</h2>
                        <div className="h-[400px] w-full rounded-lg overflow-hidden">
                            <MapView reports={mapItems} /> {/* Reuse MapView component */}
                        </div>
                    </section>
                </div>

                {/* Help Requests List Section - Now takes 1/3 width on large screens */}
                <div className="lg:col-span-1">
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Public Resource Requests</h2>
                        <div className="grid grid-cols-1 gap-8"> {/* Changed to single column for better fit */}
                            {Array.isArray(helpRequests) && helpRequests.length > 0 ? (
                                helpRequests.map(request => (
                                    <HelpRequestCard key={request._id} request={request} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No help requests available yet. Be the first to ask!</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;

