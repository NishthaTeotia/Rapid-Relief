// client/src/components/VolunteerList.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { fetchVolunteers, deleteVolunteer } from '../api/volunteersApi'; // No longer needed if data is passed as prop
import VolunteerCard from './VolunteerCard';
import socket from '../utils/socket';

// IMPORTANT: Destructure volunteers, onDelete from props
const VolunteerList = ({ volunteers: propVolunteers, isAdmin = false, onDelete }) => {
    const [internalVolunteers, setInternalVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentVolunteers = propVolunteers !== undefined ? propVolunteers : internalVolunteers;

    useEffect(() => {
        let isMounted = true;

        const loadInternalVolunteers = async () => {
            if (propVolunteers === undefined) { // Only fetch if data is NOT provided by parent
                setLoading(true);
                try {
                    // Re-add fetchVolunteers() here if you want this component
                    // to be able to fetch its own data when used standalone.
                    setLoading(false);
                } catch (err) {
                    if (isMounted) {
                        console.error('Error fetching internal volunteers:', err);
                        setError('Failed to load volunteers. Please try again later.');
                        setInternalVolunteers([]);
                    }
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadInternalVolunteers();

        // Similar to HelpRequestList, relying on AdminDashboard's socket listeners
        // to update the propVolunteers for this usage.
        // If used standalone, this component would need its own socket listeners.

        return () => {
            isMounted = false;
        };
    }, [propVolunteers]); // Re-run effect if propVolunteers changes


    if (loading && propVolunteers === undefined) {
        return <div className="text-center py-10 text-gray-600">Loading volunteers...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {currentVolunteers.length > 0 ? (
                currentVolunteers.map(volunteer => (
                    <VolunteerCard
                        key={volunteer._id}
                        volunteer={volunteer}
                        isAdmin={isAdmin}
                        onDelete={onDelete} // Pass prop handler
                        // Add onStatusChange if VolunteerCard has status changes
                    />
                ))
            ) : (
                <p className="text-center text-gray-500 italic py-10">No volunteers found.</p>
            )}
        </div>
    );
};

export default VolunteerList;