import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi'; // Import the registerUser API function

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // New state for success message
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setSuccessMessage(null); // Clear previous success messages
        setLoading(true); // Indicate loading state

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // Call the registerUser API function
            // Assuming registerUser only registers the user and doesn't automatically log them in
            await registerUser(username, password, 'Public'); // Default new users to 'Public' role

            console.log('Registration successful!');
            setSuccessMessage('Registration successful! You can now log in.');
            
            // Redirect to login page after successful registration
            navigate('/login'); // <--- CHANGED: Redirect to login page
        } catch (err) {
            console.error('Registration failed:', err);
            // Check for specific error messages from backend for more user-friendly feedback
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'An unexpected error occurred during registration.');
            }
        } finally {
            setLoading(false); // End loading state
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
           
            color: '#ffffff', // White text
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: '#2c2c2c', // Card background
                padding: '2rem',
                borderRadius: '15px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                width: '600px',
                minHeight: '400px', // Adjusted minHeight as image is removed
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}>
                <h2 style={{
                    fontSize: '2.25rem', // text-3xl
                    fontWeight: 'bold', // font-bold
                    textAlign: 'center', // text-center
                    color: '#ffffff', // text-white
                    marginBottom: '1.5rem' // mb-6
                }}>Register</h2> {/* Changed heading to Register */}
                {error && (
                    <div style={{
                        backgroundColor: '#8b0000', // bg-red-900
                        color: '#fca5a5', // text-red-300
                        padding: '0.75rem 1rem', // px-4 py-3
                        borderRadius: '0.25rem', // rounded
                        position: 'relative',
                        marginBottom: '1rem', // mb-4
                        border: '1px solid #dc2626ff' // border border-red-700
                    }} role="alert">
                        <span style={{ display: 'block' }}>{error}</span>
                    </div>
                )}
                {successMessage && ( // Display success message
                    <div style={{
                        backgroundColor: '#166534', // bg-green-900 (darker green)
                        color: '#a7f3d0', // text-green-300 (lighter green)
                        padding: '0.75rem 1rem',
                        borderRadius: '0.25rem',
                        position: 'relative',
                        marginBottom: '1rem',
                        border: '1px solid #22c55e' // border border-green-700
                    }} role="alert">
                        <span style={{ display: 'block' }}>{successMessage}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{
                    width: '100%',
                    paddingLeft: '3rem',
                    paddingRight: '3rem'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="username" style={{
                            display: 'block',
                            color: '#d1d5db',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                        }}>
                            Username:
                        </label>
                        <input
                            type="text"
                            id="username"
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                appearance: 'none',
                                border: 'none',
                                borderRadius: '0.375rem',
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                color: '#f3f4f6',
                                lineHeight: '1.25',
                                outline: 'none',
                                backgroundColor: '#3a3a3a',
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
                            onBlur={(e) => e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                        <label htmlFor="password" style={{
                            display: 'block',
                            color: '#d1d5db',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                        }}>
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                appearance: 'none',
                                border: 'none',
                                borderRadius: '0.375rem',
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                color: '#f3f4f6',
                                lineHeight: '1.25',
                                outline: 'none',
                                backgroundColor: '#3a3a3a',
                                marginBottom: '0',
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
                            onBlur={(e) => e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginTop: '1.5rem', marginBottom: '0' }}> {/* Added margin for confirm password */}
                        <label htmlFor="confirmPassword" style={{
                            display: 'block',
                            color: '#d1d5db',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                        }}>
                            Confirm Password:
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                appearance: 'none',
                                border: 'none',
                                borderRadius: '0.375rem',
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                color: '#f3f4f6',
                                lineHeight: '1.25',
                                outline: 'none',
                                backgroundColor: '#3a3a3a',
                                marginBottom: '0',
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
                            onBlur={(e) => e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        alignItems: 'center',
                        marginTop: '2rem'
                    }}>
                        <button
                            type="submit"
                            style={{
                                backgroundColor: '#690707ff', // Red button color from LoginPage
                                color: '#ffffff',
                                fontWeight: 'bold',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '9999px',
                                outline: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                transitionProperty: 'background-color, transform',
                                transitionDuration: '300ms, 200ms',
                                fontSize: '1.125rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#690707ff'}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                        
                    </div>
                </form>

                {/* Removed the image at the bottom of the login card */}
            </div>
        </div>
    );
};

export default RegisterPage;
