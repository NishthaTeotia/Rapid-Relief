// src/pages/LogoutConfirmationPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { LogOut } from 'lucide-react'; // Re-importing LogOut icon

const LogoutConfirmationPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after successful logout
  };

  const handleCancelLogout = () => { // Re-adding the cancel function
    navigate('/user-dashboard'); // Navigate back to the dashboard if canceled
  };

  return (
    // Outer container: Full screen, centered, with background color from u18.png's body CSS
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1f1f1f] text-white p-4">
      {/* This is the "card" container, styled to match u18.png's .logout-card CSS */}
      {/* Added hover:scale-105 and transition for a subtle card hover effect */}
      {/* Adjusted padding to pb-[60px] to create space below the button */}
      <div 
        className="bg-[#2c2c2c] pt-10 px-10 pb-[60px] rounded-[15px] shadow-[0_5px_25px_rgba(0,0,0,0.5)] text-center w-[90%] max-w-[450px] flex flex-col gap-5
                   transition-transform duration-200 hover:scale-[1.02]" // Subtle scale on hover for the card
        // Tailwind classes:
        // bg-[#2c2c2c]: Custom background color for the card (from .logout-card CSS)
        // pt-10 px-10 pb-[60px]: Custom padding (40px top/left/right, 60px bottom)
        // rounded-[15px]: Custom border-radius 15px (from .logout-card CSS)
        // shadow-[0_5px_25px_rgba(0,0,0,0.5)]: Custom box-shadow (from .logout-card CSS)
        // text-center: Text alignment
        // w-[90%]: Width 90%
        // max-w-[450px]: Max-width 450px (from .logout-card CSS)
        // flex flex-col gap-5: Display flex, column direction, gap 20px (from .logout-card CSS)
        // transition-transform duration-200 hover:scale-[1.02]: Added for card hover effect
      > 
        
        {/* Re-adding the LogOut icon */}
        <div className="flex justify-center mb-6">
          <LogOut className="w-16 h-16 text-red-500" />
        </div>
        
        {/* Title - styled to match u18.png's .logout-card h2 CSS */}
        <h2 className="text-3xl font-bold text-white">Logout</h2>
        
        {/* Description - styled to match u18.png's .logout-card p CSS */}
        <p className="text-[#ccc] text-base leading-relaxed"> {/* text-[#ccc] for color, text-base for 1em font, leading-relaxed for 1.6 line-height */}
          Are you sure you want to logout from RapidRelief? You will need to log in again to access your account.
        </p>
        
        {/* Action Buttons - now a flex column to stack them, with space below the last button */}
        {/* Added items-center to horizontally center the buttons within this flex container */}
        <div className="flex flex-col space-y-4 items-center"> 
          <button
            onClick={handleConfirmLogout}
            // Forced red background and white text with inline styles for maximum specificity
            style={{ backgroundColor: '#800606ff', color: '#ffffff' }} 
            // Changed rounded-lg to rounded-full for a rounder button shape
            // Changed font-black to font-extrabold and text-lg to text-xl for bolder appearance
            className="border-none font-extrabold py-3 px-6 rounded-full text-xl shadow-lg transition-colors duration-300 transition-transform duration-200 hover:bg-[#c0392b] hover:-translate-y-1"
            // Tailwind classes:
            // border-none: Explicitly removes any borders
            // font-extrabold: Changed from font-black for a bolder appearance (as font-black is max)
            // py-3 px-6: Padding 12px 25px (approx. from .confirm-logout-btn CSS)
            // rounded-full: Changed from rounded-lg for a fully round shape
            // text-xl: Increased font size from text-lg for a bolder visual
            // shadow-lg: Added for visual depth, similar to u18.png
            // transition-colors duration-300: For smooth hover background color
            // transition-transform duration-200 hover:-translate-y-1: For more noticeable smooth hover lift effect
          >
            Confirm Logout
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationPage;