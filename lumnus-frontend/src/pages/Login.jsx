import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const BACKGROUND_CARDS = [
  { name: 'Divya Sharma', role: 'SDE at Google', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Aarav Patel', role: 'Product Manager', location: 'Mumbai', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Priya Nair', role: 'UX Designer', location: 'San Francisco', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Vikram Singh', role: 'Founder', location: 'Delhi', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Ananya Rao', role: 'Software Engineer', location: 'Seattle', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Kabir Mehta', role: 'Data Scientist', location: 'London', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Sneha Reddy', role: 'Architect', location: 'Hyderabad', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Rohan Gupta', role: 'iOS Engineer', location: 'New York', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Amit Patel', role: 'Engineering Lead', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Neha Joshi', role: 'Consultant', location: 'Singapore', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Karan Malhotra', role: 'VP Engineering', location: 'Pune', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Riya Sen', role: 'HR Manager', location: 'Chennai', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
];

export default function Login() {
  const { login, loginWithGoogle, loginWithGoogleAndRole, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // login | forgot
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Role selection modal state (for new Google users)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingFirebaseToken, setPendingFirebaseToken] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [batchInput, setBatchInput] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/directory');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/directory');
    } catch (err) {
      if (err.needsRole) {
        // New Google user — show role selection modal
        setPendingFirebaseToken(err.firebaseIdToken);
        setSelectedRole(null);
        setBatchInput('');
        setShowRoleModal(true);
        setLoading(false);
        return;
      }
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleConfirm = async () => {
    if (!selectedRole) return;
    if (selectedRole === 'alumni' && !batchInput.trim()) return;
    setRoleLoading(true);
    try {
      await loginWithGoogleAndRole(pendingFirebaseToken, selectedRole, selectedRole === 'alumni' ? batchInput.trim() : '');
      navigate('/directory');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not complete sign-up.');
      setShowRoleModal(false);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="airbnb-login-wrap">
      {/* Background Mosaic Grid */}
      <div className="login-bg-grid">
        {BACKGROUND_CARDS.map((card, idx) => (
          <div key={idx} className="login-bg-card">
            <img src={card.img} alt={card.name} className="login-bg-card-avatar" />
            <div className="login-bg-card-info">
              <span className="login-bg-card-name">{card.name}</span>
              <span className="login-bg-card-role">{card.role}</span>
              <span className="login-bg-card-loc">{card.location}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="login-overlay"></div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="role-modal-backdrop">
          <div className="role-modal-card">
            <div className="role-modal-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>lumnus</span>
            </div>

            <h2 className="role-modal-title">Welcome! Who are you?</h2>
            <p className="role-modal-subtitle">Let us know how you'd like to join the community so we can personalise your experience.</p>

            <div className="role-tab-group">
              <button
                type="button"
                id="role-tab-student"
                className={`role-tab-card ${selectedRole === 'student' ? 'role-tab-card--active' : ''}`}
                onClick={() => { setSelectedRole('student'); setBatchInput(''); }}
              >
                <div className="role-tab-icon">🎓</div>
                <div className="role-tab-info">
                  <span className="role-tab-label">Student</span>
                  <span className="role-tab-desc">Currently enrolled at LPU</span>
                </div>
                <div className={`role-tab-check ${selectedRole === 'student' ? 'role-tab-check--visible' : ''}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </button>

              <button
                type="button"
                id="role-tab-alumni"
                className={`role-tab-card ${selectedRole === 'alumni' ? 'role-tab-card--active' : ''}`}
                onClick={() => setSelectedRole('alumni')}
              >
                <div className="role-tab-icon">🏆</div>
                <div className="role-tab-info">
                  <span className="role-tab-label">Alumni</span>
                  <span className="role-tab-desc">Graduated from LPU</span>
                </div>
                <div className={`role-tab-check ${selectedRole === 'alumni' ? 'role-tab-check--visible' : ''}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </button>

              {selectedRole === 'alumni' && (
                <div className="role-batch-field">
                  <label htmlFor="role-batch-input" className="role-batch-label">Graduation batch year</label>
                  <input
                    id="role-batch-input"
                    type="text"
                    className="role-batch-input"
                    placeholder="e.g. 2022"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    maxLength={4}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              id="role-confirm-btn"
              className="airbnb-continue-btn"
              disabled={!selectedRole || (selectedRole === 'alumni' && !batchInput.trim()) || roleLoading}
              onClick={handleRoleConfirm}
            >
              {roleLoading ? 'Setting up your account...' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Center Airbnb styled card */}
      <div className="airbnb-login-card">
        <div className="airbnb-login-logo">
          <svg className="login-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>lumnus</span>
        </div>

        {mode === 'login' ? (
          <>
            <h2 className="airbnb-login-title">Log in or sign up</h2>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="airbnb-login-form">
              <div className="stacked-input-group">
                <input
                  className="stacked-input stacked-top"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  className="stacked-input stacked-bottom"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="forgot-password-link-container">
                <button type="button" className="forgot-password-btn" onClick={() => { setError(''); setMode('forgot'); }}>
                  Forgot password?
                </button>
              </div>

              <button className="airbnb-continue-btn" type="submit" disabled={loading}>
                {loading ? 'Continuing...' : 'Continue'}
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="social-login-actions">
              <button type="button" className="social-login-btn" onClick={handleGoogleLogin} disabled={loading}>
                <svg className="social-svg-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="airbnb-login-footer">
              New to lumnus? <Link to="/register">Create an account</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="airbnb-login-title">Reset password</h2>
            
            {error && <div className="auth-error">{error}</div>}
            
            {resetSuccess ? (
              <div className="reset-success-container">
                <p className="reset-success-text">
                  We&apos;ve sent a password reset link to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
                <button type="button" className="airbnb-continue-btn" onClick={() => { setResetSuccess(false); setResetEmail(''); setMode('login'); }}>
                  Back to log in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="airbnb-login-form">
                <p className="reset-help-text">
                  Enter the email address associated with your account, and we&apos;ll email you a link to reset your password.
                </p>
                <div className="stacked-input-group">
                  <input
                    className="stacked-input"
                    type="email"
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="airbnb-continue-btn" type="submit" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
                <button type="button" className="reset-back-btn" onClick={() => { setError(''); setMode('login'); }}>
                  Back to log in
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
