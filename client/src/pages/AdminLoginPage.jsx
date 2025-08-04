import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();

    // Proactive Session Check on component mount
    useEffect(() => {
        if (user) {
            if (user.role !== 'Admin') {
                // If a non-admin user is already logged in, prevent admin login
                setError("A general user is currently logged in. Please log out of the user session to log in as an administrator.");
            } else {
                // If an Admin is already logged in, redirect them to the admin dashboard
                navigate('/admin');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (user && user.role !== 'Admin') {
            setError("A general user is currently logged in. Please log out of the user session to log in as an administrator.");
            return;
        }
        if (user && user.role === 'Admin') {
            setError("You are already logged in as an administrator.");
            return;
        }

        setLoading(true);

        try {
            const userData = await login(username, password);
            console.log('Admin Login successful:', userData);

            if (userData.role !== 'Admin') {
                setError("Access Denied: Only administrators can log in here.");
                logout();
                setTimeout(() => navigate('/login'), 2000);
            } else {
                navigate('/admin');
            }
        } catch (err) {
            console.error('Admin Login failed:', err);
            setError(err.message || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    const formDisabled = user && user.role !== 'Admin';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
           // Black background
            padding: '24px'
        }}>
            <div style={{
                backgroundColor: '#222222', // Dark gray card background
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                width: '100%',
                maxWidth: '448px'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff', // White text
                    marginBottom: '40px'
                }}>Administrator Login</h2>
                {error && (
                    <div style={{
                        backgroundColor: '#4b1a1a', // Dark red background for error
                        color: '#ff9898', // Light red text
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        border: '1px solid #7b2121',
                        fontSize: '0.9rem'
                    }} role="alert">
                        <span style={{ display: 'block' }}>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label htmlFor="username" style={{
                            display: 'block',
                            color: '#aaaaaa', // Light gray label text
                            fontSize: '1rem',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Username:
                        </label>
                        <input
                            type="text"
                            id="username"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: '#333333', // Darker gray input field
                                color: '#ffffff', // White input text
                                outline: 'none',
                                fontSize: '1rem',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={formDisabled}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label htmlFor="password" style={{
                            display: 'block',
                            color: '#aaaaaa',
                            fontSize: '1rem',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: '#333333',
                                color: '#ffffff',
                                outline: 'none',
                                fontSize: '1rem',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={formDisabled}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 48px',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading || formDisabled ? 'not-allowed' : 'pointer',
                                fontSize: '1.1rem',
                                textTransform: 'uppercase',
                                background: loading || formDisabled ? '#555' : 'linear-gradient(to bottom, #d32f2f, #a32424)',
                                boxShadow: loading || formDisabled ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.4)',
                                opacity: loading || formDisabled ? '0.7' : '1'
                            }}
                            disabled={loading || formDisabled}
                        >
                            {loading ? 'Logging In...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
