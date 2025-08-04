// client/src/pages/VolunteerSignupPage.jsx
import React from 'react';
import VolunteerForm from '../components/VolunteerForm'; // Import the VolunteerForm component
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const VolunteerSignupPage = () => {
    const navigate = useNavigate(); // Initialize the navigate hook

    // This function will be called by VolunteerForm upon successful registration
    const handleVolunteerRegistered = () => {
        // You can show a toast message, an alert, or simply redirect
        alert('Thank you! Your volunteer registration was successful.');
        // Redirect the user to the volunteers list page or the home page
        navigate('/volunteers');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Render the VolunteerForm component */}
                {/* Pass the onVolunteerRegistered prop, which the form will call on success */}
                <VolunteerForm onVolunteerRegistered={handleVolunteerRegistered} />
            </div>
        </div>
    );
};

export default VolunteerSignupPage;