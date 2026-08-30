import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Directory', path: '/directory' },
  { label: 'Mentorship', path: '/mentorship' },
  { label: 'Events', path: '/events' },
  { label: 'Opportunities', path: '/opportunities' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const defaultAvatar = `https://ui-avatars.com/api/?background=0052cc&color=fff&size=64&bold=true&name=${encodeURIComponent(user?.name || 'User')}`;
  const avatarSrc = user?.avatarUrl || defaultAvatar;

  return (
    <nav className={`navbar ${location.pathname === '/' && !scrolled ? 'navbar--transparent' : ''}`}>
      <div className="navbar__top-row">
        <Link to="/" className="navbar__brand">
          <svg className="navbar__brand-icon" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>lumnus</span>
        </Link>

        {/* Desktop Links */}
        {user && (
          <div className="navbar__links navbar__links--desktop">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`pill navbar__pill ${location.pathname === item.path ? 'pill-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <div className="navbar__actions">
          {user ? (
            <>
              <Link
                to="/profile"
                className={`navbar__profile-pill ${location.pathname === '/profile' ? 'navbar__profile-pill--active' : ''}`}
                title="View Profile"
              >
                <img src={avatarSrc} alt={user.name || 'User'} className="navbar__avatar" />
                <span className="navbar__username">{user.name || 'Profile'}</span>
              </Link>
              <button className="btn-ghost navbar__logout" onClick={handleLogout} title="Log out">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="pill navbar__pill">
                Log in
              </Link>
              <Link to="/register" className="btn-primary navbar__cta">
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Links Scroll Bar */}
      {user && (
        <div className="navbar__links navbar__links--mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`pill navbar__pill ${location.pathname === item.path ? 'pill-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
