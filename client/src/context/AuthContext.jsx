import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Removed: console.log("DEBUG: AuthContext - Parsed user from localStorage:", parsedUser);

                    setUser({
                        id: parsedUser._id, // Explicitly map _id to id
                        username: parsedUser.username,
                        role: parsedUser.role,
                        isApproved: parsedUser.isApproved !== undefined ? parsedUser.isApproved : true,
                        isBlocked: parsedUser.isBlocked !== undefined ? parsedUser.isBlocked : false,
                        blockReason: parsedUser.blockReason || ''
                    });
                } catch (error) {
                    console.error("Failed to parse user data from local storage:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);

            const data = await loginUser(username, password);
            // Removed: console.log("DEBUG: AuthContext - Data received from loginUser API:", data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                username: data.username,
                role: data.role,
                isApproved: data.isApproved,
                isBlocked: data.isBlocked,
                blockReason: data.blockReason
            }));

            setUser({
                id: data._id,
                username: data.username,
                role: data.role,
                isApproved: data.isApproved,
                isBlocked: data.isBlocked,
                blockReason: data.blockReason
            });

            return data;
        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (error && error.isBlocked) {
                throw new Error(`Your account has been blocked. Reason: ${error.blockReason || 'No reason provided.'}`);
            } else if (error && error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Login failed. Please check credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password, role) => {
        setLoading(true);
        try {
            const data = await registerUser(username, password, role);
            console.log("Registration successful in AuthContext:", data); // Keep this for registration success feedback if desired
            return data;
        } catch (error) {
            console.error("Registration failed in AuthContext:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log("User logged out."); // Keep this for logout feedback if desired
    };

    const authContextValue = {
        user,
        loading,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
