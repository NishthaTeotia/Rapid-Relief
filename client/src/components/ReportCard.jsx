// client/src/components/ReportCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import StaticMapImage from './StaticMapImage'; // Component to display a static map image
import moment from 'moment'; // For formatting dates

const ReportCard = ({ report }) => {
    // Check if location data is valid to decide whether to show the map
    const hasLocation = report.location && typeof report.location.latitude === 'number' && typeof report.location.longitude === 'number';

    return (
        // Wrap the entire card in a Link component to navigate to the individual report details page
        <Link to={`/reports/${report._id}`} className="block">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-200 h-full flex flex-col">
                {/* Image display section REMOVED as per user request */}
                {/* {report.imageUrl && (
                    <img src={report.imageUrl} alt={report.type} className="w-full h-48 object-cover" />
                )} */}
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-primary">{report.type}</h3>
                        {/* Status badge with dynamic styling based on report status */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            report.status === 'False Report' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700' // Default styling
                        }`}>
                            {report.status}
                        </span>
                    </div>
                    {/* Report description, truncated to 3 lines */}
                    <p className="text-gray-700 mb-2 text-sm leading-relaxed line-clamp-3">{report.description}</p>
                    {/* Additional report details */}
                    <div className="text-gray-600 text-xs mt-auto"> {/* mt-auto pushes this block to the bottom */}
                        <p className="font-semibold mb-1">
                            Severity:
                            {/* Severity text with dynamic color based on severity level */}
                            <span className={`ml-1 font-bold ${
                                report.severity === 'Critical' ? 'text-red-600' :
                                report.severity === 'High' ? 'text-orange-500' :
                                'text-gray-600' // Default color for Low/Medium
                            }`}>
                                {report.severity}
                            </span>
                        </p>
                        <p><strong>Location:</strong> {report.location?.address || 'N/A'}</p>
                        {/* Formatted creation date using moment.js */}
                        <p><strong>Submitted:</strong> {moment(report.createdAt).format('MMM Do, YYYY h:mm A')}</p>
                    </div>

                    {/* Display Static Map if location data is available */}
                    {hasLocation && (
                        <div className="mt-4">
                            <h4 className="text-md font-medium text-gray-800 mb-2">Location Snapshot:</h4>
                            <StaticMapImage
                                latitude={report.location.latitude}
                                longitude={report.location.longitude}
                                address={report.location.address}
                                zoom={15} // Zoom level for the static map
                                width={500} // Width of the static map image
                                height={300} // Height of the static map image
                                markerText={report.location.address} // Text for the map marker
                                style="streets" // Map style
                            />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ReportCard;