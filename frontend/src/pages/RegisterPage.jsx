import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, googleLoginUser } from '../services/api';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import "../styles/register.css";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!name || !email || !password) {
            return toast.error("Please fill out all fields.");
        }

        try {
            const { data } = await registerUser({ name, email, password });
            login(data);
            toast.success('Registered successfully!');
            navigate('/chats');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register. Please try again.');
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const { data } = await googleLoginUser({ token: response.credential });
            login(data);
            toast.success("Logged in successfully with Google!");
            navigate("/chats");
        } catch (error) {
            toast.error(error.response?.data?.message || "Google login failed.");
        }
    };

    return (
        <>
            <div className="min-h-screen">
                <form className="register-form form" onSubmit={handleSubmit}>
                    <div className="logo-container">
                        <div className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="logo-text">TalkSphere</span>
                    </div>
                    <h2 className="page-title">Register for TalkSphere</h2>

                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your Name"
                            required
                            className="form-input"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            required
                            className="form-input"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            required
                            className="form-input"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>

                    <button type="submit" className="btn">Register</button>

                    <div className="google-login-container" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p>Or sign up with</p> <br />
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                toast.error("Google login failed.");
                            }}
                        />
                    </div>

                    <p className="login-link-container">
                        Already have an account?
                        <NavLink to="/login" className="login-link">Login</NavLink>
                    </p>
                </form>
            </div>

            <div id="toast" className="toast"></div>

        </>
    );
};

export default RegisterPage;