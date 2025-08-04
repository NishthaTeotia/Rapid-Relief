import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';

import AdminNavbar from './components/AdminSidebar'; // Admin Navbar
// Corrected AuthContext import path based on previous successful fix
import { useAuth } from './context/AuthContext'; 

// General Pages
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import HelpPage from './pages/HelpPage';
import VolunteersPage from './pages/VolunteersPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// User Dashboard Page
import UserDashboardPage from './pages/UserDashboardPage';

// NEW: Dedicated Submission Pages
import SubmitReportPage from './pages/SubmitReportPage'; // Import the new SubmitReportPage
import SubmitResourceRequestPage from './pages/SubmitResourceRequestPage'; // Import the new SubmitResourceRequestPage

// NEW: Logout Confirmation Page
import LogoutConfirmationPage from './pages/LogoutConfirmationPage'; 

// Admin Dashboard Specific Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminHelpRequestPage from './pages/AdminHelpRequestPage';
import AdminAssignTasksPage from './pages/AdminAssignTasksPage';
import AdminUserPage from './pages/AdminUserPage';

// Route Protectors
import AdminRoute from './components/AdminRoute';
import AdminSidebar from './components/AdminSidebar';

// ProtectedRoute component for general authenticated users
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Rely on body's black background, ensure text is white
        return <div className="flex items-center justify-center min-h-screen text-white">Loading authentication...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};


// A simple layout component for Admin Dashboard pages
const AdminLayout = () => {
     const location = useLocation();
  const showNavbar =
    location.pathname.startsWith('/admin') &&
    location.pathname !== '/admin' 
    return (
        // Rely on body's black background, ensure text is white
        <div className="flex text-white bg-gray-900 min-h-screen">
            {/* The AdminNavbar will now automatically stretch to the height of the main content. */}
            {showNavbar && (
                <div className="flex-none w-64  bg-gray-800 ">
                    <AdminSidebar />
                </div>
            )}
            {/* The main content area will take the remaining width and define the overall height of the page. */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet /> {/* This is where nested routes will render */}
            </main>
        </div>
    );
};

// Main App Component
const App = () => {
   
    // Determine if the current path is an admin path, a user dashboard path, OR the logout confirmation path


    return (
        // Remove any background color from this div.
        // The body in index.css will provide the black background.
        // Keep min-h-screen and text-white for layout and default text color.
        <div className="min-h-screen text-white">
            

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/volunteers" element={<VolunteersPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />

                {/* New route for logout confirmation page */}
                <Route path="/logout-confirm" element={<LogoutConfirmationPage />} /> 

                {/* Protected Routes for authenticated users */}
                <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
                <Route path="/submit-report" element={<ProtectedRoute><SubmitReportPage /></ProtectedRoute>} />
                <Route path="/submit-resource-request" element={<ProtectedRoute><SubmitResourceRequestPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUserPage />} />
                   
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="requests" element={<AdminHelpRequestPage />} />
                    <Route path="assign-tasks" element={<AdminAssignTasksPage />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;
