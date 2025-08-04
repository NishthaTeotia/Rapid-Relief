// client/src/components/HelpRequestList.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { fetchHelpRequests, updateHelpRequest, deleteHelpRequest } from '../api/helpRequestsApi'; // No longer needed if data is passed as prop
import HelpRequestCard from './HelpRequestCard';
import socket from '../utils/socket'; // Still needed for real-time updates

// IMPORTANT: Destructure helpRequests, onStatusChange, onDelete from props
const HelpRequestList = ({ helpRequests: propHelpRequests, isAdmin = false, onStatusChange, onDelete }) => {
    // If propHelpRequests is provided, use it. Otherwise, manage internal state.
    // This makes the component more flexible.
    const [internalHelpRequests, setInternalHelpRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determine the source of truth for help requests
    const currentHelpRequests = propHelpRequests !== undefined ? propHelpRequests : internalHelpRequests;


    // This effect handles internal data fetching if no prop is provided
    // and also handles socket updates for both cases.
    useEffect(() => {
        let isMounted = true; // To prevent state updates on unmounted component

        const loadInternalHelpRequests = async () => {
            if (propHelpRequests === undefined) { // Only fetch if data is NOT provided by parent
                setLoading(true);
                try {
                    // Removed actual fetchHelpRequests call here.
                    // If you wanted HelpRequestList to ever fetch on its own,
                    // you'd re-add: const data = await fetchHelpRequests();
                    // and then setInternalHelpRequests(Array.isArray(data) ? data : []);
                    setLoading(false); // If no internal fetch, set loading false immediately
                } catch (err) {
                    if (isMounted) {
                        console.error('Error fetching internal help requests:', err);
                        setError('Failed to load help requests. Please try again later.');
                        setInternalHelpRequests([]);
                    }
                    setLoading(false);
                }
            } else {
                setLoading(false); // If prop data is available, no internal loading needed
            }
        };

        loadInternalHelpRequests(); // Call internal load logic

        // Socket.IO listeners (These should *always* update the state that drives the list)
        // If propHelpRequests is defined, the parent (AdminDashboard) handles the socket updates
        // to its own helpRequests state, which then gets passed down.
        // If propHelpRequests is NOT defined, this component needs to handle its own socket updates.
        // For simplicity when passing data down from AdminDashboard, we can often rely on the parent
        // to handle the socket updates and pass the fresh data.
        // However, if HelpRequestList can be used independently (e.g., in a public 'view all' page),
        // it still needs its own socket listeners for the 'internalHelpRequests' state.

        // For this specific AdminDashboard use case where data is passed down,
        // we can simplify the socket logic within HelpRequestList to largely react to prop changes
        // or ensure the parent handles all real-time updates.

        // Let's assume for the AdminDashboard case, the parent's socket listeners
        // for 'helpRequestUpdated' and 'helpRequestDeleted' are sufficient.
        // If you use this component elsewhere where it fetches its own data,
        // you'd need more complex conditional socket handling.

        // For now, removing direct socket listeners here to avoid double-handling
        // when data is passed from AdminDashboard which also has socket listeners.
        // We trust the parent (AdminDashboard) to keep propHelpRequests updated via its sockets.

        return () => {
            isMounted = false;
            // No socket.off needed here if we rely on parent's socket listeners
        };
    }, [propHelpRequests]); // Re-run effect if propHelpRequests changes

    // These handlers are now received as props and called directly
    // from the HelpRequestCard, which calls back to this component,
    // which then calls the handler passed from AdminDashboardPage.
    // We remove the internal API calls here because the parent provides them.


    if (loading && propHelpRequests === undefined) { // Only show loading if internal data is being fetched
        return <div className="text-center py-10 text-gray-600">Loading help requests...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    // IMPORTANT: Use currentHelpRequests for mapping
    return (
        <div className="space-y-6">
            {currentHelpRequests.length > 0 ? (
                currentHelpRequests.map(request => (
                    <HelpRequestCard
                        key={request._id}
                        request={request}
                        isAdmin={isAdmin}
                        onStatusChange={onStatusChange} // Pass prop handler
                        onDelete={onDelete} // Pass prop handler
                    />
                ))
            ) : (
                <p className="text-center text-gray-500 italic py-10">No help requests found.</p>
            )}
        </div>
    );
};

export default HelpRequestList;