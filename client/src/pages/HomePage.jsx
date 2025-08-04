import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    // State for the three main info cards
    const [hoverCard1, setHoverCard1] = useState(false);
    const [hoverCard2, setHoverCard2] = useState(false);
    const [hoverCard3, setHoverCard3] = useState(false);

    // State for the three call-to-action sections
    const [hoverVolunteerSection, setHoverVolunteerSection] = useState(false);
    const [hoverNgoSection, setHoverNgoSection] = useState(false);
    const [hoverAdminSection, setHoverAdminSection] = useState(false);

    // Style objects for buttons to apply hover effects
    const [hoverGetStarted, setHoverGetStarted] = useState(false);
    const [hoverVolunteerButton, setHoverVolunteerButton] = useState(false);
    const [hoverNgoButton, setHoverNgoButton] = useState(false);
    const [hoverAdminButton, setHoverAdminButton] = useState(false);
    

    const cardBaseStyle = {
        backgroundColor: '#222222', // gray-800
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        border: '1px solid #374151',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer'
    };

    // Style objects for buttons to apply hover effects
    const getStartedButtonStyle = {
        display: 'inline-block',
        backgroundColor: hoverGetStarted ? '#780606ff' : '#780606ff', // green-600 on hover
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '1rem 2.5rem',
        borderRadius: '9999px',
        fontSize: '1.25rem',
        textDecoration: 'none',
        boxShadow: hoverGetStarted ? '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)' : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        border: '2px solid #780606ff',
        transition: 'all 0.3s ease-in-out',
        transform: hoverGetStarted ? 'scale(1.05)' : 'scale(1)'
    };

    const volunteerButtonStyle = {
        display: 'inline-block',
        backgroundColor: hoverVolunteerButton ? '#1d4ed8' : '#2563eb', // blue-700 on hover
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '0.75rem 2rem',
        borderRadius: '9999px',
        fontSize: '1.125rem',
        textDecoration: 'none',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease-in-out',
        transform: hoverVolunteerButton ? 'scale(1.05)' : 'scale(1)'
    };

    const ngoButtonStyle = {
        display: 'inline-block',
        backgroundColor: hoverNgoButton ? '#5b21b6' : '#7c3aed', // purple-700 on hover
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '0.75rem 2rem',
        borderRadius: '9999px',
        fontSize: '1.125rem',
        textDecoration: 'none',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease-in-out',
        transform: hoverNgoButton ? 'scale(1.05)' : 'scale(1)'
    };

    const adminButtonStyle = {
        display: 'inline-block',
        backgroundColor: hoverAdminButton ? '#a16207' : '#ca8a04', // yellow-700 on hover
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '0.75rem 2rem',
        borderRadius: '9999px',
        fontSize: '1.125rem',
        textDecoration: 'none',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease-in-out',
        transform: hoverAdminButton ? 'scale(1.05)' : 'scale(1)'
    };
    
    return (
        <div style={{
            minHeight: '100vh',
         
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '0rem',
            paddingBottom: '2.5rem'
        }}>
            {/* Hero Section with Image Background */}
            <section style={{
                textAlign: 'center',
                paddingTop: '5rem',
                paddingBottom: '5rem',
                color: '#ffffff',
                width: '100%',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/home.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '3rem',
                borderRadius: '0.5rem',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '3.75rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Rapid<span style={{ color: '#fcd34d' }}>Relief</span>
                    </h1>
                    <p style={{
                        fontSize: '1.5rem',
                        marginBottom: '2.5rem',
                        maxWidth: '48rem',
                        margin: 'auto',
                        fontWeight: '300'
                    }}>
                        Connecting communities, volunteers, and aid organizations to respond swiftly and effectively during crises.
                    </p>
                    <div>
                        <div
                            onMouseEnter={() => setHoverGetStarted(true)}
                            onMouseLeave={() => setHoverGetStarted(false)}
                            onClick={() => navigate('/login')}
                            style={getStartedButtonStyle}
                        >
                            Get Started
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works / Value Proposition Sections */}
            <div style={{
                maxWidth: '80rem',
                margin: 'auto',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                marginBottom: '3rem'
            }}>
                {/* Card 1: Report Incidents */}
                <div
                    onMouseEnter={() => setHoverCard1(true)}
                    onMouseLeave={() => setHoverCard1(false)}
                    style={{ ...cardBaseStyle, ... (hoverCard1 && { transform: 'translateY(-8px)', border: '1px solid #ef4444' }) }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </span>
                        <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff' }}>
                            Report Incidents
                        </h3>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '1.125rem', textAlign: 'center' }}>
                        Quickly and accurately report emergencies, disasters, or critical situations from anywhere. Your reports provide vital real-time information.
                    </p>
                </div>

                {/* Card 2: Request Resources */}
                <div
                    onMouseEnter={() => setHoverCard2(true)}
                    onMouseLeave={() => setHoverCard2(false)}
                    style={{ ...cardBaseStyle, ... (hoverCard2 && { transform: 'translateY(-8px)', border: '1px solid #10b981' }) }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}>
                            <i className="fas fa-hands-helping"></i>
                        </span>
                        <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff' }}>
                            Request Resources
                        </h3>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '1.125rem', textAlign: 'center' }}>
                        Submit requests for essential resources like food, water, medical supplies, or shelter directly to aid organizations.
                    </p>
                </div>

                {/* Card 3: Volunteer & Coordinate */}
                <div
                    onMouseEnter={() => setHoverCard3(true)}
                    onMouseLeave={() => setHoverCard3(false)}
                    style={{ ...cardBaseStyle, ... (hoverCard3 && { transform: 'translateY(-8px)', border: '1px solid #fcd34d' }) }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '3rem', color: '#fcd34d', marginBottom: '1rem' }}>
                            <i className="fas fa-users-cog"></i>
                        </span>
                        <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff' }}>
                            Volunteer & Coordinate
                        </h3>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '1.125rem', textAlign: 'center' }}>
                        If you're a volunteer or an NGO, join our network to be assigned tasks and coordinate relief efforts efficiently.
                    </p>
                </div>
            </div>

            {/* Call to Action Sections */}
            <div style={{
                maxWidth: '80rem',
                margin: 'auto',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                marginBottom: '3rem'
            }}>
                {/* Join as a Volunteer Section */}
                <section
                    onMouseEnter={() => setHoverVolunteerSection(true)}
                    onMouseLeave={() => setHoverVolunteerSection(false)}
                    onClick={() => navigate('/register')}
                    style={{
                        backgroundColor: '#222222',
                        padding: '2rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        border: hoverVolunteerSection ? '1px solid #60a5fa' : '1px solid #374151',
                        textAlign: 'center',
                        transition: 'all 0.3s ease-in-out',
                        transform: hoverVolunteerSection ? 'translateY(-8px)' : 'translateY(0)',
                        cursor: 'pointer'
                    }}
                >
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '1rem' }}>
                        Join as a Volunteer
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem' }}>
                        Lend a hand during emergencies. Register as a volunteer to help those in need and make a real difference.
                    </p>
                    <div
                        onMouseEnter={() => setHoverVolunteerButton(true)}
                        onMouseLeave={() => setHoverVolunteerButton(false)}
                        style={volunteerButtonStyle}
                    >
                        Become a Volunteer
                    </div>
                </section>

                {/* Register as NGO Section */}
                <section
                    onMouseEnter={() => setHoverNgoSection(true)}
                    onMouseLeave={() => setHoverNgoSection(false)}
                    onClick={() => navigate('/register')}
                    style={{
                        backgroundColor: '#222222',
                        padding: '2rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        border: hoverNgoSection ? '1px solid #c084fc' : '1px solid #374151',
                        textAlign: 'center',
                        transition: 'all 0.3s ease-in-out',
                        transform: hoverNgoSection ? 'translateY(-8px)' : 'translateY(0)',
                        cursor: 'pointer'
                    }}
                >
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '1rem' }}>
                        Register as an NGO
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem' }}>
                        Are you an NGO? Partner with us to streamline your disaster response efforts and reach more people in crisis.
                    </p>
                    <div
                        onMouseEnter={() => setHoverNgoButton(true)}
                        onMouseLeave={() => setHoverNgoButton(false)}
                        style={ngoButtonStyle}
                    >
                        Register as NGO
                    </div>
                </section>
            </div>

            {/* Are you an Administrator Section */}
            <section
                onMouseEnter={() => setHoverAdminSection(true)}
                onMouseLeave={() => setHoverAdminSection(false)}
                onClick={() => navigate('/admin-login')}
                style={{
                    textAlign: 'center',
                    padding: '2.5rem',
                    backgroundColor: '#222222',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    border: hoverAdminSection ? '1px solid #fcd34d' : '1px solid #374151',
                    width: '100%',
                    maxWidth: '48rem',
                    margin: 'auto',
                    transition: 'all 0.3s ease-in-out',
                    transform: hoverAdminSection ? 'translateY(-8px)' : 'translateY(0)',
                    cursor: 'pointer'
                }}
            >
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#fcd34d', marginBottom: '1rem' }}>
                    Are you an Administrator?
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem', maxWidth: '48rem', margin: 'auto' }}>
                    Access the administrator dashboard to manage reports, help requests, users, and volunteers in real-time.
                </p>
                <div
                    onMouseEnter={() => setHoverAdminButton(true)}
                    onMouseLeave={() => setHoverAdminButton(false)}
                    style={adminButtonStyle}
                >
                    Admin Login
                </div>
            </section>
        </div>
    );
};

export default HomePage;
