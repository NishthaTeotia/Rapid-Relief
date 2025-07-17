// client/src/components/VolunteerCard.jsx
import React from 'react';

const VolunteerCard = ({ volunteer, isAdmin = false, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-200">
            <div className="p-6">
                <h3 className="text-xl font-bold text-dark mb-2">{volunteer.name}</h3>
                <p className="text-gray-600 text-sm mb-3">Availability: <span className="font-semibold text-blue-700">{volunteer.availability}</span></p>
                
                <div className="text-xs text-gray-500 space-y-2 mb-4">
                    <p>
                        <i className="fas fa-envelope mr-2 text-gray-600"></i> 
                        {volunteer.contactInfo.email}
                    </p>
                    {volunteer.contactInfo.phone && (
                        <p>
                            <i className="fas fa-phone mr-2 text-gray-600"></i> 
                            {volunteer.contactInfo.phone}
                        </p>
                    )}
                    {volunteer.location && volunteer.location.latitude && volunteer.location.longitude && (
                        <p>
                            <i className="fas fa-map-marker-alt mr-2 text-gray-600"></i> 
                            Lat: {volunteer.location.latitude.toFixed(4)}, Lon: {volunteer.location.longitude.toFixed(4)}
                        </p>
                    )}
                    <p>
                        <i className="far fa-calendar-alt mr-2 text-gray-600"></i> 
                        Registered: {new Date(volunteer.registeredAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                        {volunteer.skills.map(skill => (
                            <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {isAdmin && (
                    <div className="mt-4">
                        <button
                            onClick={() => onDelete(volunteer._id)}
                            className="w-full bg-red-500 text-white py-2 px-4 rounded-md text-sm hover:bg-red-600 transition duration-200"
                        >
                            Delete Volunteer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerCard;