// client/src/components/AdminRoute.jsx
import React from 'react'; // Removed useContext, will use useAuth hook
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- CORRECTED IMPORT: Use the useAuth hook

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth(); // <--- CORRECTED USAGE: Use the useAuth hook

    // While authentication status is being determined, show a loading state.
    if (loading) {
        return <div className="container mt-5 text-center">Checking administrator access...</div>;
    }

    // If user is not logged in, redirect to the dedicated admin login page for security.
    // This ensures that even if a non-admin is logged in, they are forced to re-authenticate as an admin.
    if (!user) {
        console.log("AdminRoute: No user logged in, redirecting to /admin-login");
        return <Navigate to="/admin-login" replace />; // Redirect to admin-specific login
    }

    // If user is logged in but their role is not 'Admin', redirect to home page.
    // This handles cases where a Public/Volunteer/NGO user tries to access /admin directly.
    if (user.role !== 'Admin') {
        console.log(`AdminRoute: User "${user.username}" (Role: ${user.role}) is not an Admin, redirecting to /`);
        return <Navigate to="/" replace />; // Redirect to general homepage
    }

    // If user is logged in and is an Admin, render the children components.
    console.log(`AdminRoute: User "${user.username}" (Role: ${user.role}) is authorized as Admin.`);
    return children;
};

export default AdminRoute;