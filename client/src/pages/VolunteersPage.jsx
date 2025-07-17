// client/src/pages/VolunteersPage.jsx
import React, { useState, useEffect } from 'react';
import VolunteerForm from '../components/VolunteerForm';
import VolunteerCard from '../components/VolunteerCard';
import { fetchVolunteers } from '../api/volunteersApi'; // Correct import

const VolunteersPage = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadVolunteers = async () => {
        try {
            const response = await fetchVolunteers();
            // Ensure response.data is an array before setting state
            if (Array.isArray(response.data)) {
                setVolunteers(response.data);
            } else {
                console.error("API response for volunteers was not an array:", response.data);
                setError("Received invalid data format for volunteers.");
                setVolunteers([]); // Fallback to empty array
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch volunteers.');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVolunteers();
        // You can add Socket.IO for real-time volunteer updates here if desired, similar to ReportsPage
        // const socket = io(import.meta.env.VITE_BACKEND_URL);
        // socket.on('newVolunteer', (newVolunteer) => { setVolunteers(prev => [newVolunteer, ...prev]); });
        // return () => { socket.disconnect(); };
    }, []);

    const handleVolunteerRegistered = () => {
        loadVolunteers(); // Re-fetch volunteers after a new one is registered
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading volunteers...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-dark mb-8">Volunteers</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Volunteer Registration Section */}
                <div>
                    <section>
                        <VolunteerForm onVolunteerRegistered={handleVolunteerRegistered} />
                    </section>
                </div>

                {/* List of Registered Volunteers */}
                <div className="lg:col-span-2">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Volunteers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Array.isArray(volunteers) && volunteers.length > 0 ? (
                                volunteers.map(volunteer => (
                                    <VolunteerCard key={volunteer._id} volunteer={volunteer} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No volunteers registered yet. Be the first to help!</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default VolunteersPage;