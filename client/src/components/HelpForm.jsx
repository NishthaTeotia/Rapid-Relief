// client/src/components/HelpForm.jsx
import React, { useState } from 'react';
import { createHelpRequest } from '../api/helpRequestsApi';

const HelpForm = ({ onHelpRequestSubmitted }) => {
    const [formData, setFormData] = useState({
        type: 'Food',
        description: '',
        latitude: '',
        longitude: '',
        name: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const latitude = parseFloat(formData.latitude) || 28.6139; // Default if empty
            const longitude = parseFloat(formData.longitude) || 77.2090; // Default if empty

            const requestData = {
                type: formData.type,
                description: formData.description,
                location: { latitude, longitude },
                contactInfo: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email
                }
            };

            await createHelpRequest(requestData);
            setSuccess(true);
            setFormData({
                type: 'Food',
                description: '',
                latitude: '',
                longitude: '',
                name: '',
                phone: '',
                email: ''
            });
            if (onHelpRequestSubmitted) {
                onHelpRequestSubmitted();
            }
        } catch (err) {
            setError('Failed to submit help request. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-secondary">
            <h2 className="text-2xl font-bold text-dark mb-6">Request Help</h2>
            
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">Help request submitted successfully!</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type of Help Needed</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                    >
                        <option>Food</option>
                        <option>Water</option>
                        <option>Medical</option>
                        <option>Shelter</option>
                        <option>Rescue</option>
                        <option>Other</option>
                    </select>
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
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Your Location (Latitude)</label>
                    <input
                        type="number"
                        step="any"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 28.6139"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                    />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Your Location (Longitude)</label>
                    <input
                        type="number"
                        step="any"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 77.2090"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                    />
                </div>
            </div>

            <div className="mt-6 border-t pt-6 border-gray-200">
                <h3 className="text-lg font-bold text-dark mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
                            placeholder="Full Name"
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
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-secondary text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Help Request'}
                </button>
            </div>
        </form>
    );
};

export default HelpForm;