import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, login, logout, loading: authLoading } = useAuth(); // Destructure loading from useAuth

    // Proactive Session Check on component mount
    useEffect(() => {
        // Only attempt to redirect if authentication state has finished loading
        if (!authLoading && user) { // Added !authLoading condition
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/user-dashboard');
            }
        }
    }, [user, navigate, authLoading]); // Added authLoading to dependency array

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // Prevent login if a conflicting user is already logged in (as determined by useEffect)
        if (user) {
            if (user.role === 'Admin') {
                setError("An administrator is currently logged in. Please log out of the administrator session to log in as a general user.");
            } else {
                setError("You are already logged in as a general user. Please log out to switch accounts.");
            }
            return; // Stop form submission
        }

        setLoading(true); // Indicate loading state

        try {
            const userData = await login(username, password); // Use the login function from AuthContext
            console.log('Login successful:', userData);

            // Role-based redirection logic AFTER successful login
            if (userData.role === 'Admin') {
                setError("Admins must log in via the 'Admin Login' button on the homepage.");
                // Immediately log out the admin session established by login()
                logout();
                // No immediate navigate, let them read the error, then they can use the Admin Login button
            } else if (userData.isApproved === false) {
                // If NGO or Volunteer is not approved
                setError("Your account is pending approval. Please wait for an administrator to approve it.");
                logout(); // Log out the unapproved session
            } else {
                // For Public, Volunteer, NGO (who are approved)
                navigate('/user-dashboard'); // Redirect to User Dashboard
            }
        } catch (err) {
            console.error('Login failed:', err);
            // Display a specific message for unregistered users if the error message from backend is generic
            if (err.message && err.message.includes("Invalid credentials")) {
                setError("Invalid username or password. If you're not registered, please register first.");
            } else if (err.message && err.message.includes("pending approval")) {
                setError(err.message); // Use the specific message from the backend
            }
            else {
                setError(err.message || 'Login failed. Please check your credentials.'); // More user-friendly message
            }
        } finally {
            setLoading(false); // End loading state
        }
    };

    // If an admin is logged in, disable the form
    const formDisabled = user && user.role === 'Admin';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        
            color: '#ffffff',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: '#2c2c2c',
                padding: '2rem',
                borderRadius: '15px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                width: '600px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}>
                <h2 style={{
                    fontSize: '2.25rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff',
                    marginBottom: '1.5rem'
                }}>User Login</h2>
                {error && (
                    <div style={{
                        backgroundColor: '#8b0000',
                        color: '#fca5a5',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.25rem',
                        position: 'relative',
                        marginBottom: '1rem',
                        border: '1px solid #dc2626'
                    }} role="alert">
                        <span style={{ display: 'block' }}>{error}</span>
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
                                // Placeholder color is not directly set via inline style for input
                                // It's usually done via ::placeholder pseudo-element in CSS
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
                            onBlur={(e) => e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading || formDisabled}
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
                                // Placeholder color is not directly set via inline style for input
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
                            onBlur={(e) => e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || formDisabled}
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
                                backgroundColor: '#690707ff',
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
                            disabled={loading || formDisabled}
                        >
                            {loading ? 'Logging In...' : 'Login'}
                        </button>
                        <Link to="/register" style={{
                            
                            textAlign: 'center',
                            
                            color: '#ffffff',
                            fontWeight: 'bold',
                            padding: '0.75rem 1.5rem',
                            
                            
                            
                        
                        }}

                        >
                            Don't have an account? Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;