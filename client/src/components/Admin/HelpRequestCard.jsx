// client/src/components/Admin/HelpRequestCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const HelpRequestCard = ({ request, isAdmin, onStatusChange, onDelete, statusOptions }) => {
    const getBorderColor = (status) => {
        switch (status) {
            case 'New': return 'border-indigo-500';
            case 'Assigned': return 'border-purple-500';
            case 'In Progress': return 'border-orange-500';
            case 'Completed': return 'border-green-500';
            case 'Canceled': return 'border-red-500';
            default: return 'border-gray-300';
        }
    };

    const handleStatusChange = (e) => {
        onStatusChange(request._id, e.target.value);
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${getBorderColor(request.status)} transition-shadow duration-300 hover:shadow-xl`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.type}</h3>
            <p className="text-gray-700 mb-3 line-clamp-3">{request.description}</p>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Requester:</span> {request.requesterContact?.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Contact:</span> {request.requesterContact?.phone || request.requesterContact?.email || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Location:</span> {request.location?.formattedAddress || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Requested:</span> {formatDistanceToNow(new Date(request.createdAt))} ago
            </div>

            <div className="flex items-center mt-4">
                <label htmlFor={`status-req-${request._id}`} className="block text-gray-700 text-sm font-bold mr-2">Status:</label>
                {isAdmin ? (
                    <select
                        id={`status-req-${request._id}`}
                        value={request.status}
                        onChange={handleStatusChange}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'New' ? 'bg-indigo-100 text-indigo-800' :
                        request.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                        request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'Canceled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {request.status}
                    </span>
                )}
            </div>

            {isAdmin && (
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => onDelete(request._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default HelpRequestCard;