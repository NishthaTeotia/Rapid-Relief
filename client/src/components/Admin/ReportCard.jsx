// client/src/components/Admin/ReportCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ReportCard = ({ report, isAdmin, onStatusChange, onDelete, statusOptions }) => {
    // Determine card border color based on status or severity (example)
    const getBorderColor = (status) => {
        switch (status) {
            case 'Pending': return 'border-yellow-500';
            case 'Active': return 'border-blue-500';
            case 'Resolved': return 'border-green-500';
            case 'Archived': return 'border-gray-500';
            default: return 'border-gray-300';
        }
    };

    const handleStatusChange = (e) => {
        onStatusChange(report._id, e.target.value);
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${getBorderColor(report.status)} transition-shadow duration-300 hover:shadow-xl`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.type}</h3>
            <p className="text-gray-700 mb-3 line-clamp-3">{report.description}</p>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Location:</span> {report.location?.formattedAddress || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Severity:</span> <span className="capitalize">{report.severity}</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Reported:</span> {formatDistanceToNow(new Date(report.createdAt))} ago
            </div>

            <div className="flex items-center mt-4">
                <label htmlFor={`status-${report._id}`} className="block text-gray-700 text-sm font-bold mr-2">Status:</label>
                {isAdmin ? (
                    <select
                        id={`status-${report._id}`}
                        value={report.status}
                        onChange={handleStatusChange}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {report.status}
                    </span>
                )}
            </div>

            {isAdmin && (
                <div className="mt-4 flex justify-end space-x-2">
                    {/* Add other admin actions if needed, e.g., "View Details" button */}
                    <button
                        onClick={() => onDelete(report._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportCard;