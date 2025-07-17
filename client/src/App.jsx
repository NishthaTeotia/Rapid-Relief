// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ReportsPage from './pages/ReportsPage';
import HelpPage from './pages/HelpPage'; // Import new page
import VolunteersPage from './pages/VolunteersPage'; // Import new page
import AdminDashboardPage from './pages/AdminDashboardPage'; // Import new pages

const App = () => {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<ReportsPage />} /> 
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/help" element={<HelpPage />} /> {/* New route */}
                        <Route path="/volunteers" element={<VolunteersPage />} /> {/* New route */}
                        <Route path="/admin" element={<AdminDashboardPage />} /> {/* New route */}
                       
                    </Routes>
                </main>
                {/* Optional: Add a Footer component here */}
            </div>
        </Router>
    );
};

// client/src/pages/NotFoundPage.jsx
const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 text-dark">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-2xl mb-8">Page Not Found</p>
            <p className="text-lg text-gray-600">The page you're looking for doesn't exist.</p>
            <a href="/" className="mt-8 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-blue-600 transition duration-300">
                Go to Homepage
            </a>
        </div>
    );
};


export default App;