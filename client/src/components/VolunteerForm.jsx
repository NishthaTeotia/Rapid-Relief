// client/src/components/VolunteerForm.jsx
import React, { useState } from 'react';
import { registerVolunteer } from '../api/volunteersApi';

const VolunteerForm = ({ onVolunteerRegistered }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        skills: [],
        availability: 'Full-time',
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const availableSkills = ['Medical', 'Search & Rescue', 'Logistics', 'Food Distribution', 'Shelter Management', 'First Aid', 'IT Support', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            skills: checked
                ? [...prev.skills, value]
                : prev.skills.filter(skill => skill !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (formData.skills.length === 0) {
                setError('Please select at least one skill.');
                setLoading(false);
                return;
            }

            const latitude = parseFloat(formData.latitude) || null;
            const longitude = parseFloat(formData.longitude) || null;

            const volunteerData = {
                name: formData.name,
                contactInfo: {
                    email: formData.email,
                    phone: formData.phone
                },
                skills: formData.skills,
                availability: formData.availability,
                location: (latitude && longitude) ? { latitude, longitude } : undefined // Only include if both are provided
            };

            await registerVolunteer(volunteerData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                skills: [],
                availability: 'Full-time',
                latitude: '',
                longitude: ''
            });
            if (onVolunteerRegistered) {
                onVolunteerRegistered();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register volunteer. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-dark mb-6">Become a Volunteer</h2>
            
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">You've successfully registered as a volunteer!</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john.doe@example.com"
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
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1234567890"
                    />
                </div>
                <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                    <select
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Weekends</option>
                        <option>Evenings</option>
                        <option>On-call</option>
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSkills.map(skill => (
                        <div key={skill} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`skill-${skill}`}
                                name="skills"
                                value={skill}
                                checked={formData.skills.includes(skill)}
                                onChange={handleSkillChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`skill-${skill}`} className="ml-2 text-sm text-gray-700">{skill}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Your Current Latitude (Optional)</label>
                    <input
                        type="number"
                        step="any"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="e.g., 28.6139"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Your Current Longitude (Optional)</label>
                    <input
                        type="number"
                        step="any"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., 77.2090"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register as Volunteer'}
                </button>
            </div>
        </form>
    );
};

export default VolunteerForm;