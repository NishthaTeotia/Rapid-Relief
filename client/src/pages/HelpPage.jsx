// client/src/pages/HelpPage.jsx
import React, { useState, useEffect } from 'react';
import HelpForm from '../components/HelpForm';
import HelpRequestCard from '../components/HelpRequestCard';
import MapView from '../components/MapView'; // Reusing MapView to show help requests
import { fetchHelpRequests } from '../api/helpRequestsApi'; // Correct import
import { io } from 'socket.io-client'; // Correct import

const HelpPage = () => {
    const [helpRequests, setHelpRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHelpRequests = async () => {
        try {
            const response = await fetchHelpRequests();
            // Ensure response.data is an array before setting state
            if (Array.isArray(response.data)) {
                setHelpRequests(response.data);
            } else {
                console.error("API response for help requests was not an array:", response.data);
                setError("Received invalid data format for help requests.");
                setHelpRequests([]); // Fallback to empty array
            }
            setLoading(false);
        } catch (err) {
            console.error('Error loading help requests:', err);
            setError('Failed to fetch help requests.');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHelpRequests();

        const socket = io(import.meta.env.VITE_BACKEND_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket server for help requests');
        });

        socket.on('newHelpRequest', (newRequest) => {
            console.log('Received new help request via Socket.IO:', newRequest);
            // Ensure newRequest is a single object before adding
            if (newRequest && typeof newRequest === 'object' && !Array.isArray(newRequest)) {
                setHelpRequests(prevRequests => [newRequest, ...prevRequests]);
            } else {
                console.warn("Received invalid newHelpRequest object via Socket.IO:", newRequest);
            }
        });

        socket.on('helpRequestUpdated', (updatedRequest) => {
            console.log('Received updated help request via Socket.IO:', updatedRequest);
            setHelpRequests(prevRequests => prevRequests.map(request =>
                request._id === updatedRequest._id ? updatedRequest : request
            ));
        });

        socket.on('helpRequestDeleted', (deletedRequestId) => {
            console.log('Received deleted help request ID via Socket.IO:', deletedRequestId);
            setHelpRequests(prevRequests => prevRequests.filter(request => request._id !== deletedRequestId));
        });


        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        return () => {
            socket.disconnect();
        };
    }, []); // Removed loadHelpRequests from dependencies for single run

    const handleHelpRequestSubmitted = () => {
        console.log('Help request submitted. Awaiting real-time update.');
    };

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
        <div className="min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-dark mb-8">Help Requests & Coordination</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Map View Section for Help Requests */}
                <div className="lg:col-span-2">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Help Requests Map</h2>
                        <MapView reports={mapItems} /> {/* Reuse MapView component */}
                    </section>

                    {/* Help Requests List Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Help Request Board</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                {/* Submit Help Request Section */}
                <div>
                    <section>
                        <HelpForm onHelpRequestSubmitted={handleHelpRequestSubmitted} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;