// client/src/utils/geocode.js
import axios from 'axios';

// Access direct LocationIQ configuration from environment variables
const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY; 
const LOCATIONIQ_GEOCODING_BASE_URL = import.meta.env.VITE_LOCATIONIQ_GEOCODING_BASE_URL;

// Construct full URLs for direct LocationIQ endpoints
const LOCATIONIQ_AUTOCOMPLETE_URL = `${LOCATIONIQ_GEOCODING_BASE_URL}/autocomplete.php`;
const LOCATIONIQ_GEOCODING_URL = `${LOCATIONIQ_GEOCODING_BASE_URL}/search.php`;

// --- Added Debugging Logs ---
console.log("Geocode Debug: LOCATIONIQ_API_KEY:", LOCATIONIQ_API_KEY ? "Present" : "MISSING!");
console.log("Geocode Debug: LOCATIONIQ_GEOCODING_BASE_URL:", LOCATIONIQ_GEOCODING_BASE_URL);
console.log("Geocode Debug: Constructed Autocomplete URL:", LOCATIONIQ_AUTOCOMPLETE_URL);
console.log("Geocode Debug: Constructed Geocoding URL:", LOCATIONIQ_GEOCODING_URL);
// ----------------------------

// Basic configuration check (important, this is where your original error came from)
if (!LOCATIONIQ_API_KEY || !LOCATIONIQ_GEOCODING_BASE_URL) {
    const missingParts = [];
    if (!LOCATIONIQ_API_KEY) missingParts.push("LocationIQ API Key (VITE_LOCATIONIQ_API_KEY)");
    if (!LOCATIONIQ_GEOCODING_BASE_URL) missingParts.push("LocationIQ Geocoding Base URL (VITE_LOCATIONIQ_GEOCODING_BASE_URL)");
    
    console.error(`LocationIQ Geocoding/Autocomplete service not configured: ${missingParts.join(', ')} missing.`);
    throw new Error("Geocoding/Autocomplete service configuration incomplete. Please check your .env file.");
}

// Function for Autocomplete suggestions
export const getAutocompleteSuggestions = async (query) => {
    if (query.length < 3) { 
        return [];
    }

    try {
        const response = await axios.get(LOCATIONIQ_AUTOCOMPLETE_URL, { // <--- Request goes to this URL
            params: {
                key: LOCATIONIQ_API_KEY, 
                q: query,
                format: 'json',
                limit: 5, 
                countrycodes: 'in', 
                dedupe: 1 
            }
        });

        if (response.data && Array.isArray(response.data)) {
            return response.data.map(item => ({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                formattedAddress: item.display_name,
                placeId: item.place_id 
            }));
        } else {
            return [];
        }
    } catch (error) {
        // --- Added Debugging Log ---
        console.error("Autocomplete Axios request failed.", error.config?.url, error.response?.status, error.response?.data, error.message);
        // --------------------------
        console.error("Autocomplete error:", error.response?.data || error.message);
        return []; 
    }
};

// Function for full Geocoding
export const geocodeAddress = async (address) => {
    try {
        const response = await axios.get(LOCATIONIQ_GEOCODING_URL, { // <--- Request goes to this URL
            params: {
                key: LOCATIONIQ_API_KEY, 
                q: address,
                format: 'json',
                limit: 1, 
                countrycodes: 'in' 
            }
        });

        if (response.data && response.data.length > 0) {
            const { lat, lon, display_name } = response.data[0];
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                formattedAddress: display_name
            };
        } else {
            return null; 
        }
    } catch (error) {
        // --- Added Debugging Log ---
        console.error("Geocoding Axios request failed.", error.config?.url, error.response?.status, error.response?.data, error.message);
        // --------------------------
        console.error("Geocoding error:", error.response?.data || error.message);
        let errorMessage = "Failed to convert address to coordinates. Please try a more specific address or check network.";
        if (error.response?.status === 429) {
            errorMessage = "Geocoding quota exceeded. Please try again later or check your LocationIQ plan.";
        }
        throw new Error(errorMessage);
    }
};