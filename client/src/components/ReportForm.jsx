import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createReport } from '../api/reportsApi';
import { geocodeAddress, getAutocompleteSuggestions } from '../utils/geocode';

// ReportForm component now accepts style props from its parent
const ReportForm = ({ onReportSubmitted, inputStyle, textareaStyle, labelStyle, submitButtonStyle }) => {
    const [formData, setFormData] = useState({
        type: 'Fire',
        description: '',
        address: '',
        imageUrl: '',
        severity: 'Medium',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
                images: formData.imageUrl ? [formData.imageUrl] : [],
                severity: formData.severity,
            };

            const response = await createReport(reportData);

            if (onReportSubmitted) {
                onReportSubmitted(response.message || 'Report submitted successfully!');
            }

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

    // Define hover styles for buttons and list items
    const submitButtonHoverStyle = {
        backgroundColor: '#0a58ca', // Darker blue on hover
    };

    const suggestionItemHoverStyle = {
        backgroundColor: '#333', // Darker background on hover for suggestions
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                backgroundColor: 'transparent', // Parent handles the card background
                padding: '0', // Parent handles the card padding
                borderRadius: '0.5rem',
                boxShadow: 'none',
                borderTop: 'none',
            }}
        >
            <h2
                style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '1rem',
                }}
            >
                Submit a New Disaster Report
            </h2>

            {error && (
                <div
                    style={{
                        backgroundColor: '#dc3545', // Darker red for error background
                        color: '#fff',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        marginBottom: '1rem',
                        textAlign: 'center',
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr', // Default for small screens
                    gap: '1.5rem',
                    marginBottom: '1.5rem', // Added for spacing
                }}
            >
                {/* Responsive grid for larger screens */}
                <style>
                    {`
                    @media (min-width: 768px) { /* md breakpoint */
                        form > div:nth-child(2) { /* Targeting the grid container */
                            grid-template-columns: 1fr 1fr;
                        }
                    }
                    `}
                </style>

                <div>
                    <label htmlFor="type" style={labelStyle}>Disaster Type</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="Fire">Fire</option>
                        <option value="Flood">Flood</option>
                        <option value="Earthquake">Earthquake</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="severity" style={labelStyle}>Severity</label>
                    <select
                        id="severity"
                        name="severity"
                        value={formData.severity}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}> {/* Adjusted margin-top to match other fields */}
                <label htmlFor="description" style={labelStyle}>Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    style={textareaStyle}
                    placeholder="Describe the incident and severity."
                ></textarea>
            </div>

            {/* Address Input with Autocomplete */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}> {/* Adjusted margin-top */}
                <label htmlFor="address" style={labelStyle}>Location Address</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Connaught Place, New Delhi"
                    autoComplete="off"
                    style={inputStyle}
                />
                {suggestions.length > 0 && (
                    <ul
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            width: '100%',
                           // Dark theme background
                            border: '1px solid #444',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            marginTop: '0.25rem',
                            maxHeight: '15rem', // max-h-60
                            overflowY: 'auto',
                            listStyle: 'none', // Remove bullet points
                            padding: '0', // Remove default padding
                            color: '#fff', // Ensure text is visible
                        }}
                    >
                        {suggestions.map((s) => (
                            <li
                                key={s.placeId}
                                style={{
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: '#fff', // Ensure text is visible
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = suggestionItemHoverStyle.backgroundColor}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                onClick={() => handleSuggestionClick(s)}
                            >
                                {s.formattedAddress}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}> {/* Adjusted margin-top */}
                <label htmlFor="imageUrl" style={labelStyle}>Image URL (Optional)</label>
                <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Link to image of the incident"
                    style={inputStyle}
                />
            </div>

            <div style={{ marginTop: '2rem' }}> {/* Adjusted margin-top for button */}
                <button
                    type="submit"
                    disabled={loading}
                    style={loading ? { ...submitButtonStyle, opacity: 0.7 } : submitButtonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = submitButtonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = submitButtonStyle.backgroundColor}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </form>
    );
};

export default ReportForm;
