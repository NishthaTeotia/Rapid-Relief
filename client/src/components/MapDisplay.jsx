// client/src/components/MapDisplay.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 

// Fix for default marker icon issues with Webpack/Vite
delete L.Icon.Default.prototype._get  ;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Access direct LocationIQ configuration for Map Tiles
const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_MAP_TILES_BASE_URL = import.meta.env.VITE_LOCATIONIQ_MAP_TILES_BASE_URL;
const LOCATIONIQ_MAP_TILES_STYLE = import.meta.env.VITE_LOCATIONIQ_MAP_TILES_STYLE || 'streets'; 

// Basic configuration check
if (!LOCATIONIQ_API_KEY || !LOCATIONIQ_MAP_TILES_BASE_URL) {
    console.error("LocationIQ Map Tiles configuration incomplete. Check your .env file.");
}

const MapDisplay = ({ latitude, longitude, address, zoom = 13, markers = [] }) => {
    // If config is missing, return fallback div
    if (!LOCATIONIQ_API_KEY || !LOCATIONIQ_MAP_TILES_BASE_URL) {
        return <div className="text-red-500 text-center py-4">Interactive Map not configured.</div>;
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return <div className="text-gray-500 text-center py-4">Invalid coordinates for map.</div>;
    }

    // Construct the tile URL for direct LocationIQ tiles
    const tileUrl = `${LOCATIONIQ_MAP_TILES_BASE_URL}/${LOCATIONIQ_MAP_TILES_STYLE}/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`;
    const attribution = '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    const allMarkers = [
        ...(latitude && longitude ? [{ lat: latitude, lon: longitude, popupText: address || 'Report Location' }] : []),
        ...markers
    ];

    return (
        <MapContainer 
            center={[latitude, longitude]} 
            zoom={zoom} 
            scrollWheelZoom={true} 
            className="w-full h-96 rounded-lg shadow-md"
        >
            <TileLayer
                attribution={attribution}
                url={tileUrl}
            />
            {allMarkers.map((marker, index) => (
                <Marker key={index} position={[marker.lat, marker.lon]}>
                    {marker.popupText && <Popup>{marker.popupText}</Popup>}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapDisplay;