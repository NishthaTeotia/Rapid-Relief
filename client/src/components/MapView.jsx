// client/src/components/MapView.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ reports }) => {
    // Default center of the map (e.g., center of a relevant area or user's location)
    const center = [28.6139, 77.2090]; // Example: New Delhi, India

    return (
        <div className="h-[450px] rounded-lg shadow-lg overflow-hidden border-2 border-gray-100">
            <MapContainer 
                center={center} 
                zoom={6} 
                scrollWheelZoom={false} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {reports.map((report) => (
                    <Marker 
                        key={report._id} 
                        position={[report.location.latitude, report.location.longitude]}
                    >
                        <Popup>
                            <h3 className="font-bold text-lg">{report.type}</h3>
                            <p className="text-sm">{report.description}</p>
                            <p className="text-xs text-gray-500 mt-2">Status: {report.status}</p>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;