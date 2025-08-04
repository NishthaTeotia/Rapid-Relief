// client/src/components/Admin/VolunteerCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
// NO 'unassignVolunteer' IMPORT HERE - this is the fix!

const VolunteerCard = ({ volunteer, isAdmin, onStatusChange, onDelete, statusOptions }) => {
    const getBorderColor = (status) => {
        switch (status) {
            case 'Pending': return 'border-yellow-500';
            case 'Approved': return 'border-green-500';
            case 'Rejected': return 'border-red-500';
            default: return 'border-gray-300';
        }
    };

    const handleStatusChange = (e) => {
        onStatusChange(volunteer._id, e.target.value);
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${getBorderColor(volunteer.status)} transition-shadow duration-300 hover:shadow-xl`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{volunteer.contactInfo?.name || 'N/A'}</h3>
            <p className="text-gray-700 mb-3 text-sm">
                <span className="font-medium">Skills:</span> {volunteer.skills?.join(', ') || 'None specified'}
            </p>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Contact:</span> {volunteer.contactInfo?.phone || volunteer.contactInfo?.email || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Availability:</span> {volunteer.availability || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Registered:</span> {formatDistanceToNow(new Date(volunteer.createdAt))} ago
            </div>

            <div className="flex items-center mt-4">
                <label htmlFor={`status-vol-${volunteer._id}`} className="block text-gray-700 text-sm font-bold mr-2">Status:</label>
                {isAdmin ? (
                    <select
                        id={`status-vol-${volunteer._id}`}
                        value={volunteer.status}
                        onChange={handleStatusChange}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        volunteer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        volunteer.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        volunteer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {volunteer.status}
                    </span>
                )}
            </div>

            {isAdmin && (
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => onDelete(volunteer._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default VolunteerCard;