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
        <>
            <style>
                {`
                /* Global styles for the page container to match the image's dark theme */
                .page-container {
                    min-height: 100vh;
                    padding: 1.5rem;
                    background-color: #121212; /* Darker background from the image */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                }

                /* Container for the main content to constrain its width */
                .content-container {
                    width: 100%;
                    max-width: 42rem;
                }

                /* Main heading style to match the image */
                .main-heading {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #fff;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                /* Success message alert box */
                .success-message {
                    background-color: #C53030; /* Dark red background from the image */
                    color: #fff;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    position: relative;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                /* The card section containing the form */
                .report-card {
                    background-color: #1C1C1C; /* Dark gray background from the image */
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                /* Sub-heading for the form */
                .form-heading {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                /* Styling for all input, select, and textarea elements within the form */
                input, select, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #C53030; /* Red border from the image */
                    background-color: #2A2A2A; /* Match card background */
                    color: #fff;
                    outline: none;
                }
                
                /* Styling for the textarea */
                textarea {
                    resize: vertical;
                }

                /* Styling for placeholder text */
                ::placeholder {
                    color: #A0A0A0;
                }
                
                /* Styling for the label */
                label {
                    color: #fff;
                    margin-bottom: 0.5rem;
                    display: block;
                }

                /* Submit button styles, assuming it's part of the form */
                  button[type="submit"] {
                    width: 100%;
                    padding: 1rem;
                    background-color: #C53030; /* Red button */
                    color: #fff;
                    font-weight: bold;
                    font-size: 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-top: 1rem;
                }
                `}
            </style>
            
            <div className="page-container">
                <div className="content-container">
                    <h1 className="main-heading">Submit Resource Request</h1>

                    {successMessage && (
                        <div className="success-message">
                            <span className="block sm:inline">{successMessage}</span>
                        </div>
                    )}

                    <section className="report-card">
                        <h2 className="form-heading">Request New Resources</h2>
                        {/* Render the HelpForm and pass the success handler */}
                        {/* Assuming HelpForm contains the input and select fields that will be styled */}
                        <HelpForm onHelpRequestSubmitted={handleHelpRequestSubmitted} />
                    </section>
                </div>
            </div>
        </>
    );
};

export default SubmitResourceRequestPage;
