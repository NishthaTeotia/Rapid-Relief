import React, { useState, useEffect, useRef } from 'react';
import { createHelpRequest } from '../api/helpRequestsApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HelpForm = ({ onHelpRequestSubmitted }) => { // onHelpRequestSubmitted prop received here
    const { user, loading: authLoading } = useAuth();

    const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

    const [formData, setFormData] = useState({
        type: 'Food',
        description: '',
        quantity: '', // Added quantity field
        unit: '',     // Added unit field
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
    // const [success, setSuccess] = useState(false); // Removed, handled by parent now
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
            // For other form fields (type, description, quantity, unit, contactInfo fields)
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
        // setSuccess(false); // Removed

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
                quantity: formData.quantity, // Include quantity
                unit: formData.unit,         // Include unit
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

            // Remove empty contactInfo fields before sending
            Object.keys(requestData.contactInfo).forEach(key => {
                if (requestData.contactInfo[key] === '') {
                    delete requestData.contactInfo[key];
                }
            });

            const response = await createHelpRequest(requestData); // Capture response to get message
            // setSuccess(true); // Removed, parent handles success message

            // Call the parent's callback function with a success message
            if (onHelpRequestSubmitted) {
                onHelpRequestSubmitted(response.message || 'Your request has been submitted successfully!');
            }

            // Reset form fields after successful submission
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

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-secondary">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Help</h2>

            {/* Removed local success message display, parent handles it */}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {!isFormEnabled && (
                <div className="bg-blue-100 text-blue-700 p-4 rounded-md mb-6 text-center">
                    <p className="font-semibold mb-2">Please log in or register to submit a help request.</p>
                    <Link to="/login" className="text-blue-600 hover:underline mr-4">Login</Link>
                    <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type of Help Needed</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
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
                <div className="relative" ref={suggestionListRef}>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Location Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.location.address}
                        onChange={handleChange}
                        onFocus={() => formData.location.address.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                        placeholder="e.g., 123 Main St, City"
                        disabled={!isFormEnabled}
                        autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <li 
                                    key={suggestion.place_id} 
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Optional)</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                        placeholder="e.g., 100"
                        disabled={!isFormEnabled}
                    />
                </div>
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit (Optional)</label>
                    <input
                        type="text"
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                        placeholder="e.g., liters, people, units"
                        disabled={!isFormEnabled}
                    />
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description of Need</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                    placeholder="Describe what kind of help you need and your situation."
                    disabled={!isFormEnabled}
                ></textarea>
            </div>

            <div className="mt-6 border-t pt-6 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information (Optional for logged-in users)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                            placeholder="Full Name"
                            disabled={!isFormEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                            placeholder="e.g., +1234567890"
                            disabled={!isFormEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                            placeholder="your@example.com"
                            disabled={!isFormEnabled}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-secondary text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
                    disabled={loading || !isFormEnabled}
                >
                    {loading ? 'Submitting...' : 'Submit Help Request'}
                </button>
            </div>
        </form>
    );
};

export default HelpForm;

