import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createHelpRequest } from '../api/helpRequestsApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HelpForm = ({ onHelpRequestSubmitted }) => {
    const { user, loading: authLoading } = useAuth();

    const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

    const [formData, setFormData] = useState({
        type: 'Food',
        description: '',
        quantity: '',
        unit: '',
        location: {
            address: '',
            latitude: '',
            longitude: ''
        },
        name: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionListRef = useRef(null);

    const isFormEnabled = !authLoading && user;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionListRef.current && !suggestionListRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'address') {
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    address: value
                }
            }));

            if (value.length > 2 && LOCATIONIQ_API_KEY) {
                try {
                    const response = await fetch(`https://us1.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${value}&limit=5&dedupe=1`);
                    const data = await response.json();
                    if (response.ok && Array.isArray(data)) {
                        setSuggestions(data);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                        console.error('LocationIQ Autocomplete error:', data.error || 'Unknown error');
                    }
                } catch (err) {
                    console.error('Error fetching autocomplete suggestions:', err);
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } else if (name === 'latitude' || name === 'longitude') {
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [name]: value
                }
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            location: {
                address: suggestion.display_name,
                latitude: suggestion.lat,
                longitude: suggestion.lon
            }
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const latitude = parseFloat(formData.location.latitude);
            const longitude = parseFloat(formData.location.longitude);

            if (isNaN(latitude) || isNaN(longitude) || !formData.location.address) {
                throw new Error('Please select a valid location from the autocomplete suggestions.');
            }
            if (!formData.description) {
                throw new Error('Description of need is required.');
            }

            const requestData = {
                type: formData.type,
                description: formData.description,
                quantity: formData.quantity,
                unit: formData.unit,
                location: {
                    address: formData.location.address,
                    latitude: latitude,
                    longitude: longitude
                },
                contactInfo: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email
                }
            };

            Object.keys(requestData.contactInfo).forEach(key => {
                if (requestData.contactInfo[key] === '') {
                    delete requestData.contactInfo[key];
                }
            });

            const response = await createHelpRequest(requestData);

            if (onHelpRequestSubmitted) {
                onHelpRequestSubmitted(response.message || 'Your request has been submitted successfully!');
            }

            setFormData({
                type: 'Food',
                description: '',
                quantity: '',
                unit: '',
                location: {
                    address: '',
                    latitude: '',
                    longitude: ''
                },
                name: '',
                phone: '',
                email: ''
            });
            setSuggestions([]);
            setShowSuggestions(false);

        } catch (err) {
            console.error("HelpForm submission error:", err);
            setError(err.message || err.response?.data?.message || 'Failed to submit help request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Inline Styles ---
    const formContainerStyle = {
        backgroundColor: '#1C1C1C', // Dark gray background from the image
        padding: '2rem', // p-8
        borderRadius: '0.5rem', // rounded-lg
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-xl
        borderTop: '4px solid #0d6efd', // border-t-4 border-secondary (using blue from primary button)
        color: '#ffffff', // Default text color for the form
    };

    const headingStyle = {
        fontSize: '1.5rem', // text-2xl
        fontWeight: 'bold', // font-bold
        color: '#ffffff', // text-gray-800 changed to white
        marginBottom: '1.5rem', // mb-6
    };

    const errorBoxStyle = {
        backgroundColor: '#dc3545', // bg-red-100 changed to a darker red
        color: '#ffffff', // text-red-700 changed to white
        padding: '0.75rem', // p-3
        borderRadius: '0.25rem', // rounded
        marginBottom: '1rem', // mb-4
    };

    const infoBoxStyle = {
        backgroundColor: '#0d6efd', // bg-blue-100 changed to a darker blue
        color: '#ffffff', // text-blue-700 changed to white
        padding: '1rem', // p-4
        borderRadius: '0.375rem', // rounded-md
        marginBottom: '1.5rem', // mb-6
        textAlign: 'center', // text-center
    };

    const labelStyle = {
        display: 'block', // block
        fontSize: '0.875rem', // text-sm
        fontWeight: '500', // font-medium
        color: '#ffffff', // text-gray-700 changed to white
        marginBottom: '0.5rem', // Added for spacing
    };

    const inputFieldStyle = {
        display: 'block', // block
        width: '100%', // w-full
        padding: '0.75rem 1rem', // px-4 py-2
        border: '1px solid #444', // border border-gray-300 changed to darker border
        borderRadius: '0.375rem', // rounded-md
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
        backgroundColor: '#2A2A2A', // Match form background
        color: '#ffffff', // Ensure text is visible
        outline: 'none', // Remove default outline
        transition: 'border-color 0.2s, box-shadow 0.2s', // For focus effect
    };

    const inputFieldFocusStyle = {
        borderColor: '#0d6efd', // focus:border-secondary (using blue)
        boxShadow: '0 0 0 3px rgba(13, 110, 253, 0.25)', // focus:ring-secondary (using blue with alpha)
    };

    const textareaStyle = {
        ...inputFieldStyle,
        resize: 'vertical', // resize-y
        minHeight: '6rem', // rows-4 (approx)
    };

    const submitButtonStyle = {
        width: '100%', // w-full
        backgroundColor: '#0d6efd', // bg-secondary (using blue)
        color: '#ffffff', // text-white
        padding: '0.75rem 1.5rem', // py-3 px-6
        borderRadius: '0.375rem', // rounded-md
        fontWeight: '600', // font-semibold
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s, opacity 0.3s', // transition duration-300
        opacity: loading || !isFormEnabled ? 0.5 : 1, // disabled:opacity-50
        // focus styles handled by onFocus/onBlur if needed, or directly in JSX if simple
    };

    const submitButtonHoverStyle = {
        backgroundColor: '#0a58ca', // hover:bg-blue-700
    };

    const linkStyle = {
        color: '#60a5fa', // text-blue-600
        textDecoration: 'none',
        transition: 'text-decoration 0.2s',
    };

    const linkHoverStyle = {
        textDecoration: 'underline', // hover:underline
    };

    const suggestionListStyle = {
        position: 'absolute', // absolute
        zIndex: 10, // z-10
        width: '100%', // w-full
        backgroundColor: '#2A2A2A', // bg-white changed to dark
        border: '1px solid #444', // border border-gray-300 changed to dark
        borderRadius: '0.375rem', // rounded-md
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
        marginTop: '0.25rem', // mt-1
        maxHeight: '15rem', // max-h-60
        overflowY: 'auto', // overflow-y-auto
        listStyle: 'none', // Remove bullet points
        padding: '0', // Remove default padding
        color: '#ffffff', // Ensure text is visible
    };

    const suggestionItemStyle = {
        padding: '0.5rem 1rem', // px-4 py-2
        cursor: 'pointer', // cursor-pointer
        fontSize: '0.875rem', // text-sm
        color: '#ffffff', // Ensure text is visible
        transition: 'background-color 0.2s',
    };

    const suggestionItemHoverStyle = {
        backgroundColor: '#333', // hover:bg-gray-100 changed to darker hover
    };

    return (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
            <h2 style={headingStyle}>Request Help</h2>

            {error && <div style={errorBoxStyle}>{error}</div>}

            {!isFormEnabled && (
                <div style={infoBoxStyle}>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Please log in or register to submit a help request.</p>
                    <Link
                        to="/login"
                        style={linkStyle}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = linkHoverStyle.textDecoration}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Login
                    </Link>
                    <span style={{ margin: '0 0.5rem' }}> | </span>
                    <Link
                        to="/register"
                        style={linkStyle}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = linkHoverStyle.textDecoration}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Register
                    </Link>
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '1.5rem', // gap-6
                    marginBottom: '1.5rem', // Added for consistency
                }}
            >
                {/* Responsive grid for larger screens */}
                <style>
                    {`
                    @media (min-width: 768px) { /* md breakpoint */
                        form > div:nth-child(4) { /* Targeting the first grid container */
                            grid-template-columns: 1fr 1fr;
                        }
                        form > div:nth-child(6) { /* Targeting the second grid container for quantity/unit */
                            grid-template-columns: 1fr 1fr;
                        }
                        form > div:nth-child(8) > div:nth-child(2) { /* Targeting the contact info grid */
                            grid-template-columns: 1fr 1fr;
                        }
                    }
                    `}
                </style>

                <div>
                    <label htmlFor="type" style={labelStyle}>Type of Help Needed</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        style={inputFieldStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                        disabled={!isFormEnabled}
                    >
                        <option>Food</option>
                        <option>Water</option>
                        <option>Medical Supplies</option>
                        <option>Shelter</option>
                        <option>Rescue</option>
                        <option>Volunteers</option>
                        <option>Equipment</option>
                        <option>Transportation</option>
                        <option>Other</option>
                    </select>
                </div>

                {/* Location Address with Autocomplete */}
                <div style={{ position: 'relative' }} ref={suggestionListRef}>
                    <label htmlFor="address" style={labelStyle}>Location Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.location.address}
                        onChange={handleChange}
                        onFocus={() => formData.location.address.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                        required
                        style={inputFieldStyle}
                        onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                        placeholder="e.g., 123 Main St, City"
                        disabled={!isFormEnabled}
                        autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul style={suggestionListStyle}>
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.place_id}
                                    style={suggestionItemStyle}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = suggestionItemHoverStyle.backgroundColor}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '1.5rem', // gap-6
                    marginTop: '1.5rem', // mt-6
                    marginBottom: '1.5rem', // Added for consistency
                }}
            >
                <div>
                    <label htmlFor="quantity" style={labelStyle}>Quantity (Optional)</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        style={inputFieldStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                        placeholder="e.g., 100"
                        disabled={!isFormEnabled}
                    />
                </div>
                <div>
                    <label htmlFor="unit" style={labelStyle}>Unit (Optional)</label>
                    <input
                        type="text"
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        style={inputFieldStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                        placeholder="e.g., liters, people, units"
                        disabled={!isFormEnabled}
                    />
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}> {/* mt-6 */}
                <label htmlFor="description" style={labelStyle}>Description of Need</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    style={textareaStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                    placeholder="Describe what kind of help you need and your situation."
                    disabled={!isFormEnabled}
                ></textarea>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}> {/* mt-6 border-t pt-6 border-gray-200 */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>Contact Information (Optional for logged-in users)</h3>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1.5rem', // gap-6
                    }}
                >
                    <div>
                        <label htmlFor="name" style={labelStyle}>Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={inputFieldStyle}
                            onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                            onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                            placeholder="Full Name"
                            disabled={!isFormEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" style={labelStyle}>Phone Number (Optional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={inputFieldStyle}
                            onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                            onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                            placeholder="e.g., +1234567890"
                            disabled={!isFormEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" style={labelStyle}>Email (Optional)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputFieldStyle}
                            onFocus={e => Object.assign(e.currentTarget.style, inputFieldFocusStyle)}
                            onBlur={e => Object.assign(e.currentTarget.style, inputFieldStyle)}
                            placeholder="your@example.com"
                            disabled={!isFormEnabled}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}> {/* mt-8 */}
                <button
                    type="submit"
                    style={submitButtonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = submitButtonHoverStyle.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = submitButtonStyle.backgroundColor}
                    disabled={loading || !isFormEnabled}
                >
                    {loading ? 'Submitting...' : 'Submit Help Request'}
                </button>
            </div>
        </form>
    );
};

export default HelpForm;
