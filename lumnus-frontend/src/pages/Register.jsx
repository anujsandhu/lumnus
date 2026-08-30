import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const BACKGROUND_CARDS = [
  { name: 'Divya Sharma', role: 'VP Product', location: 'San Francisco', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Rohan Gupta', role: 'Staff Engineer', location: 'Hyderabad', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Priya Nair', role: 'UX Director', location: 'London', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Vikram Singh', role: 'Founder', location: 'Delhi', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Ananya Rao', role: 'Data Scientist', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Kabir Mehta', role: 'Design Lead', location: 'Mumbai', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Sneha Reddy', role: 'PM at Google', location: 'Seattle', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Arjun Patel', role: 'CTO', location: 'Austin', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
];

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = credentials, 2 = details
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    batch: '',
    branch: '',
    company: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/directory');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/directory');
    } catch (err) {
      setError(err.message || 'Google sign-up failed.');
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

      {/* Center Airbnb styled card */}
      <div className="airbnb-login-card register-card">
        <div className="airbnb-login-logo">
          <svg className="login-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>lumnus</span>
        </div>

        <h2 className="airbnb-login-title">Create your account</h2>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <>
            <form onSubmit={handleStep1} className="airbnb-login-form">
              <div className="stacked-input-group stacked-triple">
                <input
                  className="stacked-input stacked-top"
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="stacked-input stacked-mid"
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
                  placeholder="Password (min 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>

              <button className="airbnb-continue-btn" type="submit">
                Continue
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="social-login-actions">
              <button type="button" className="social-login-btn" onClick={handleGoogleRegister} disabled={loading}>
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
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="airbnb-login-form">
              <p className="register-step-label">Almost there! Tell us a bit more about yourself.</p>

              <div className="register-role-toggle">
                {['student', 'alumni'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={`register-role-btn ${form.role === r ? 'register-role-btn--active' : ''}`}
                    onClick={() => setForm({ ...form, role: r })}
                  >
                    {r === 'student' ? (
                      <>
                        <svg className="register-role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        <span>I'm a student</span>
                      </>
                    ) : (
                      <>
                        <svg className="register-role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        <span>I'm an alumnus</span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="register-details-row">
                <input
                  className="stacked-input"
                  name="batch"
                  placeholder="Batch year (e.g. 2022)"
                  value={form.batch}
                  onChange={handleChange}
                />
                <input
                  className="stacked-input"
                  name="branch"
                  placeholder="Branch (e.g. CSE)"
                  value={form.branch}
                  onChange={handleChange}
                />
              </div>

              {form.role === 'alumni' && (
                <input
                  className="stacked-input"
                  name="company"
                  placeholder="Current company"
                  value={form.company}
                  onChange={handleChange}
                />
              )}

              <div className="register-step-actions">
                <button type="button" className="register-back-btn" onClick={() => { setError(''); setStep(1); }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button className="airbnb-continue-btn register-submit-btn" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
