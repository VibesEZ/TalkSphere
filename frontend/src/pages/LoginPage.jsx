import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import { toast } from "react-toastify";
import "../styles/login.css";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { googleLoginUser } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });
      login(data);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Logged in successfully!");
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
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
    <div className="min-h-screen">
      <div className="login-container">
        <div className="logo-container">
          <div className="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="logo-text">TalkSphere</span>
        </div>

        <h2 className="page-title">Login</h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <div className="checkbox-container">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="checkbox-label">
              Remember me
            </label>
          </div>

          <div>
            <button type="submit" className="btn">
              Login
            </button>
          </div>

          <div>
            <NavLink to="/forgot-password" className="btn">
              Forgot Password?
            </NavLink>
          </div>

          <div className="google-login-container" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>Or sign in with</p><br />
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google login failed.");
              }}
            />
          </div>

          <div className="signup-link-container">
            Don't have an account?
            <NavLink to="/register" className="signup-link">
              Sign up
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;