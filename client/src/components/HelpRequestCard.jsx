// client/src/components/HelpRequestCard.jsx
import React from 'react';

const HelpRequestCard = ({ request, isAdmin = false, onStatusChange, onDelete }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-700';
            case 'Fulfilled':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-red-100 text-red-700'; // Open/Urgent
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-dark">{request.type}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                    </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{request.description}</p>
                
                <div className="text-xs text-gray-500 space-y-2 mb-4">
                    <p>
                        <i className="fas fa-map-marker-alt mr-2 text-primary"></i> 
                        Lat: {request.location.latitude.toFixed(4)}, Lon: {request.location.longitude.toFixed(4)}
                    </p>
                    <p>
                        <i className="far fa-clock mr-2 text-secondary"></i> 
                        Requested: {new Date(request.requestedAt).toLocaleString()}
                    </p>
                    {request.contactInfo && (
                        <>
                            <p>
                                <i className="fas fa-user mr-2 text-gray-600"></i> 
                                {request.contactInfo.name}
                            </p>
                            {request.contactInfo.phone && (
                                <p>
                                    <i className="fas fa-phone mr-2 text-gray-600"></i> 
                                    {request.contactInfo.phone}
                                </p>
                            )}
                            {request.contactInfo.email && (
                                <p>
                                    <i className="fas fa-envelope mr-2 text-gray-600"></i> 
                                    {request.contactInfo.email}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {isAdmin && (
                    <div className="flex flex-col gap-2 mt-4">
                        <select
                            value={request.status}
                            onChange={(e) => onStatusChange(request._id, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-sm"
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Fulfilled">Fulfilled</option>
                        </select>
                        <button
                            onClick={() => onDelete(request._id)}
                            className="bg-red-500 text-white py-2 px-4 rounded-md text-sm hover:bg-red-600 transition duration-200"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpRequestCard;