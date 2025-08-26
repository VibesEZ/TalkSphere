import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    const handleLogoutClick = () => setShowLogoutConfirm(true);
    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false);
        logout();
    };
    const handleLogoutCancel = () => setShowLogoutConfirm(false);

    return (
        <div className="chat-container">
            <NavBar onLogout={handleLogoutClick} />
            <Outlet context={{ handleLogoutClick }} /> {/* Pass down logout function if needed */}

            {showLogoutConfirm && (
                <div className="logout-confirm-overlay">
                    <div className="logout-confirm-modal">
                        <p>Are you sure you want to logout?</p>
                        <button onClick={handleLogoutConfirm}>Yes</button>
                        <button onClick={handleLogoutCancel}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;