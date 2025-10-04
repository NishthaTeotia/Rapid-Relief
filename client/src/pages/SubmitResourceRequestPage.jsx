import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpForm from '../components/HelpForm'; // Import the HelpForm component

const SubmitResourceRequestPage = () => {
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    // This function is passed to the HelpForm and called upon successful submission
    const handleHelpRequestSubmitted = (message) => {
        setSuccessMessage(message); // Set the success message
        setTimeout(() => {
            setSuccessMessage(null); // Clear message after 3 seconds
            navigate('/user-dashboard'); // Redirect to user dashboard
        }, 3000); // Wait 3 seconds before redirecting
    };

    return (
        <div
            className="page-container"
            style={{
                minHeight: '100vh',
                padding: '1.5rem',
                backgroundColor: '#121212', // Darker background from the image
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
            }}
        >
            <div
                className="content-container"
                style={{
                    width: '100%',
                    maxWidth: '42rem',
                }}
            >
                <h1
                    className="main-heading"
                    style={{
                        fontSize: '2.25rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginBottom: '2rem',
                        textAlign: 'center',
                    }}
                >
                    Submit Resource Request
                </h1>

                {successMessage && (
                    <div
                        className="success-message"
                        style={{
                            backgroundColor: '#C53030', // Dark red background from the image
                            color: '#fff',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            position: 'relative',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                <section
                    className="report-card"
                    style={{
                        backgroundColor: '#1C1C1C', // Dark gray background from the image
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <h2
                        className="form-heading"
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#fff',
                            marginBottom: '1rem',
                        }}
                    >
                        Request New Resources
                    </h2>
                    {/* Render the HelpForm and pass the success handler */}
                    {/* HelpForm now contains its own inline styles */}
                    <HelpForm onHelpRequestSubmitted={handleHelpRequestSubmitted} />
                </section>
            </div>
        </div>
    );
};

export default SubmitResourceRequestPage;
