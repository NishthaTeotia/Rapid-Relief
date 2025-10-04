import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home as HomeIcon, Users as UsersIcon, FileText as FileTextIcon, LogOut as LogOutIcon, HelpCircle as HelpIcon, ClipboardList as ClipboardListIcon } from 'lucide-react';

// A reusable component for the side navigation
const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Modified handleLogout to redirect to the logout confirmation page
    const handleLogout = () => {
        navigate('/logout-confirm'); // Redirect to the logout confirmation page
    };

    const navLinks = [
        { to: '/admin', name: 'Dashboard', icon: <HomeIcon size={20} /> },
        { to: '/admin/users', name: 'Users', icon: <UsersIcon size={20} /> },
        { to: '/admin/reports', name: 'Reports', icon: <FileTextIcon size={20} /> },
        { to: '/admin/requests', name: 'Help Requests', icon: <HelpIcon size={20} /> },
        { to: '/admin/assign-tasks', name: 'Assign Tasks', icon: <ClipboardListIcon size={20} /> },
    ];

    const styles = {
        aside: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '16rem',
            backgroundColor: '#222222',
            color: '#f9fafb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '1rem'
        },
        titleContainer: {
            marginBottom: '2rem'
        },
        titleLink: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#f9fafb',
            transition: 'color 300ms ease-in-out',
            textDecoration: 'none'
        },
        nav: {
            flex: 1
        },
        navList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        navLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'background-color 200ms ease-in-out, color 200ms ease-in-out',
            textDecoration: 'none',
            color: '#d1d5db'
        },
        navLinkHover: {
            backgroundColor: '#333333',
            color: '#ffffff'
        },
        navLinkActive: {
            backgroundColor: '#2563eb',
            color: '#ffffff'
        },
        userInfoContainer: {
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #374151'
        },
        userInfo: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem'
        },
        welcomeText: {
            color: '#d1d5db',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        username: {
            fontWeight: '600',
            color: '#ffffff'
        },
        role: {
            color: '#60a5fa',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        logoutButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            justifyContent: 'center',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 300ms ease-in-out'
        },
        logoutButtonHover: {
            backgroundColor: '#b91c1c'
        },
        notAuthorized: {
            color: '#6b7280',
            fontSize: '0.875rem'
        },
        mainLayout: {
            display: 'flex',
        },
        mainContent: {
            flex: 1,
            padding: '2rem',
            overflowY: 'auto'
        }
    };

    return (
        <aside style={styles.aside}>
            {/* Admin Dashboard Title / Home Link */}
            <div style={styles.titleContainer}>
                <Link to="/admin" style={styles.titleLink}>
                    Admin Dashboard
                </Link>
            </div>

            {/* Admin Navigation Links */}
            <nav style={styles.nav}>
                <ul style={styles.navList}>
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                style={({ isActive }) => ({
                                    ...styles.navLink,
                                    ...(isActive ? styles.navLinkActive : {}),
                                    ...(!isActive ? { '&:hover': styles.navLinkHover } : {})
                                })}
                                onMouseEnter={e => {
                                    if (!window.location.pathname.startsWith(link.to)) {
                                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                                        e.currentTarget.style.color = styles.navLinkHover.color;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!window.location.pathname.startsWith(link.to)) {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.color = styles.navLink.color;
                                    }
                                }}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Admin User Info and Logout */}
            <div style={styles.userInfoContainer}>
                {user && user.role === 'Admin' ? (
                    <div style={styles.userInfo}>
                        <span style={styles.welcomeText}>
                            Welcome, <span style={styles.username}>{user.username}</span>
                        </span>
                        <span style={styles.role}>{user.role}</span>
                        <button
                            onClick={handleLogout} // This now redirects to /logout-confirm
                            style={styles.logoutButton}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.logoutButtonHover.backgroundColor}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.logoutButton.backgroundColor}
                        >
                            <LogOutIcon size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <span style={styles.notAuthorized}>Not Authorized</span>
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
