// client/src/components/StaticMapImage.jsx
import React from 'react';

// Access direct LocationIQ configuration for Static Maps
const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_STATIC_MAP_BASE_URL = import.meta.env.VITE_LOCATIONIQ_STATIC_MAP_BASE_URL;

// Basic configuration check
if (!LOCATIONIQ_API_KEY || !LOCATIONIQ_STATIC_MAP_BASE_URL) {
    console.error("LocationIQ Static Map API configuration incomplete. Check your .env file.");
}

const StaticMapImage = ({ latitude, longitude, width = 600, height = 400, zoom = 14, style = 'streets', markerText = '' }) => {
    // If config is missing, return fallback div
    if (!LOCATIONIQ_API_KEY || !LOCATIONIQ_STATIC_MAP_BASE_URL) {
        return <div className="text-red-500 text-center py-4">Static Map not configured.</div>;
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return <div className="text-gray-500 text-center py-4">Invalid coordinates to display map.</div>;
    }

    const markers = `icon:small-red-cutout|${latitude},${longitude}`; 
    
    // Construct the full URL for the static map image using direct LocationIQ
    const mapImageUrl = `${LOCATIONIQ_STATIC_MAP_BASE_URL}?` +
                        `key=${LOCATIONIQ_API_KEY}&` + // Direct key usage
                        `center=${latitude},${longitude}&` +
                        `zoom=${zoom}&` +
                        `size=${width}x${height}&` +
                        `format=png&` + 
                        `maptype=${style}&` +
                        `markers=${encodeURIComponent(markers)}`;

    return (
        <img 
            src={mapImageUrl} 
            alt={`Map of ${markerText || 'location'}`} 
            className="w-full h-auto rounded-lg shadow-md"
            style={{ maxWidth: `${width}px` }} 
        />
    );
};

export default StaticMapImage;