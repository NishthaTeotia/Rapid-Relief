// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="text-3xl font-bold text-primary hover:text-dark transition duration-300">
                        Rapid<span className="text-secondary">Relief</span>
                    </Link>
                </div>
                <div className="flex space-x-4">
                    <NavLink to="/reports">Reports</NavLink>
                    <NavLink to="/help">Help Requests</NavLink>
                    <NavLink to="/volunteers">Volunteers</NavLink>
                    {/* <NavLink to="/admin">Dashboard</NavLink> */}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children }) => (
    <Link 
        to={to} 
        className="text-gray-600 hover:text-primary transition duration-300 font-medium px-3 py-2 rounded-md"
    >
        {children}
    </Link>
);

export default Navbar;