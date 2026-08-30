import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="landing__footer">
      <div className="landing__footer-top">
        <div className="landing__footer-tagline">
          Experience lumnus
        </div>
        <div className="landing__footer-nav-grid">
          <div className="landing__footer-col">
            <Link to="/directory">Directory</Link>
            <Link to="/mentorship">Mentorship</Link>
            <Link to="/events">Events</Link>
            <Link to="/opportunities">Opportunities</Link>
          </div>
          <div className="landing__footer-col">
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      {/* Massive Antigravity style Wordmark */}
      <div className="landing__footer-wordmark">
        lumnus
      </div>

      <div className="landing__footer-bottom">
        <div className="landing__footer-logo">
          <svg className="footer-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>lumnus</span>
        </div>
        <div className="landing__footer-legal">
          <Link to="/about">About lumnus</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
