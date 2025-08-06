import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUp, ADMIN_EMAIL } = useAuth();

  // Check if admin account exists (simplified check)
  const isAdminSetup = !!ADMIN_EMAIL && ADMIN_EMAIL !== 'your-email@example.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Only allow sign-up for admin email
        if (email !== ADMIN_EMAIL) {
          setError('Sign-up is restricted. Contact admin for access.');
          setLoading(false);
          return;
        }
        await signUp(email, password);
        setError('Check your email for confirmation link!');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">
            {isSignUp ? '🚀 Create Account' : '🔐 Admin Login'}
          </h2>
          <p className="login-subtitle">
            {isSignUp 
              ? 'Create an admin account to manage creations' 
              : 'Sign in to add, edit, and delete creations'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {error && (
            <div className={`auth-message ${error.includes('Check your email') ? 'success' : 'error'}`}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : (isSignUp ? '🚀 Create Account' : '🔓 Sign In')}
          </button>
        </form>

        {/* Hide sign-up toggle if admin is already set up */}
        {!isAdminSetup && (
          <div className="auth-toggle">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="toggle-btn"
            >
              {isSignUp 
                ? '👈 Already have an account? Sign in' 
                : '➡️ Need an account? Sign up'
              }
            </button>
          </div>
        )}

        {/* Show admin setup message */}
        {isAdminSetup && !isSignUp && (
          <div className="admin-info">
            <p>🔒 Admin access only. Sign in with your admin account.</p>
          </div>
        )}

        <div className="guest-notice">
          <p>💡 <strong>Tip:</strong> Guests can view all creations without logging in</p>
        </div>
      </div>
    </div>
  );
}

export default Login;