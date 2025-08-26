// frontend/src/components/NavBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoChatbubblesSharp, IoPersonCircleSharp, IoSettingsSharp, IoLogoReact, IoSunny, IoMoon, IoShieldCheckmarkSharp } from "react-icons/io5";
import { useTheme } from '../context/ThemeContext';
import '../styles/NavBar.css'; // Assuming you have a CSS file for stylings
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="main-nav" >
      <div className="nav-logo" onClick={() => navigate('/chats')}>
        <IoLogoReact size={32} />
      </div>
      < ul className="nav-list" >
        <li>
          <div
            className={`nav-item ${location.pathname === '/chats' ? 'active' : ''}`}
            onClick={() => navigate('/chats')}
          >
            <IoChatbubblesSharp size={24} />
            < span > Chats </span>
          </div>
        </li>
        {/* <li>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <IoPersonCircleSharp size={24} />
            < span > Profile </span>
          </div>
        </li> */}
        {
          user && user.role === 'admin' && (
            <li>
              <div
                className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={() => navigate('/admin')
                }
              >
                <IoShieldCheckmarkSharp size={24} />
                < span > Admin </span>
              </div>
            </li>
          )}
      </ul>
      < div className="nav-footer" >
        <button onClick={toggleTheme} className="theme-toggle" >
          {theme === 'light' ? <IoMoon size={22} /> : <IoSunny size={22} />}
        </button>
        < div
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <IoSettingsSharp size={24} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;