import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createReport } from '../api/reportsApi';
import { geocodeAddress, getAutocompleteSuggestions } from '../utils/geocode';

const ReportForm = ({ onReportSubmitted }) => { // onReportSubmitted prop received here
    const [formData, setFormData] = useState({
        type: 'Fire',
        description: '',
        address: '',
        imageUrl: '',
        severity: 'Medium', // Added severity field
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // const [success, setSuccess] = useState(false); // Removed, handled by parent now
    const [suggestions, setSuggestions] = useState([]);
    const [selectedAddressCoords, setSelectedAddressCoords] = useState(null);
    const debounceTimeoutRef = useRef(null);

    const debouncedGetSuggestions = useCallback((query) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(async () => {
            if (query.length > 2) {
                const results = await getAutocompleteSuggestions(query);
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        }, 300);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSelectedAddressCoords(null);

        if (name === 'address') {
            debouncedGetSuggestions(value);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({ ...prev, address: suggestion.formattedAddress }));
        setSelectedAddressCoords({
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
            address: suggestion.formattedAddress
        });
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        // setSuccess(false); // Removed

        let finalLocation = selectedAddressCoords;

        try {
            if (!formData.address) {
                setError('Please enter a location address.');
                setLoading(false);
                return;
            }

            if (!finalLocation) {
                const geoResult = await geocodeAddress(formData.address);

                if (!geoResult) {
                    setError('Could not find coordinates for the provided address. Please be more specific or try another address.');
                    setLoading(false);
                    return;
                }
                finalLocation = geoResult;
            }

            const reportData = {
                type: formData.type,
                description: formData.description,
                location: finalLocation,
                images: formData.imageUrl ? [formData.imageUrl] : [], // Ensure images is an array
                severity: formData.severity, // Include severity
            };

            const response = await createReport(reportData); // Capture response to get message
            // setSuccess(true); // Removed, parent handles success message
            
            // Call the parent's callback function with a success message
            if (onReportSubmitted) {
                onReportSubmitted(response.message || 'Report submitted successfully!');
            }

            // Reset form fields after successful submission
            setFormData({
                type: 'Fire',
                description: '',
                address: '',
                imageUrl: '',
                severity: 'Medium',
            });
            setSelectedAddressCoords(null);
            setSuggestions([]);

        } catch (err) {
            setError('Failed to submit report. ' + (err.message || err.response?.data?.message || 'Please try again.'));
            console.error("Error submitting report:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a New Disaster Report</h2>
            
            {/* Removed local success message display, parent handles it */}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Disaster Type</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option>Fire</option>
                        <option>Flood</option>
                        <option>Earthquake</option>
                        <option>Medical Emergency</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                        id="severity"
                        name="severity"
                        value={formData.severity}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Describe the incident and severity."
                ></textarea>
            </div>

            {/* Address Input with Autocomplete */}
            <div className="mt-6 relative">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Location Address</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Connaught Place, New Delhi"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    autoComplete="off"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {suggestions.map((s) => (
                            <li 
                                key={s.placeId} 
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleSuggestionClick(s)}
                            >
                                {s.formattedAddress}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-6">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Link to image of the incident"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-primary text-white py-3 px-6 rounded-md font-semibold hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </form>
    );
};

export default ReportForm;
