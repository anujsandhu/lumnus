import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import lottie from 'lottie-web';
import './NotFound.css';

export default function NotFound() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let anim = null;
    if (containerRef.current) {
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/3b59adb3-d7df-4d7e-9590-67c1b78ebf02/aLySg8Km8f.json',
      });

      anim.addEventListener('DOMLoaded', () => {
        setLoading(false);
      });
      anim.addEventListener('data_failed', () => {
        setLoading(false);
      });
    }

    return () => {
      if (anim) anim.destroy();
    };
  }, []);

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        {/* Lottie Animation Wrapper */}
        <div className="notfound-animation-wrapper">
          {loading && (
            <div className="notfound-skeleton">
              <div className="notfound-spinner"></div>
            </div>
          )}
          <div ref={containerRef} className="notfound-lottie" />
        </div>

        {/* Content Section */}
        <div className="notfound-content">
          <span className="notfound-badge">404 ERROR</span>
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-subtitle">
            Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>

          {/* Action Buttons */}
          <div className="notfound-actions">
            <Link to="/" className="notfound-btn primary">
              <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return Home
            </Link>
            <button onClick={() => navigate(-1)} className="notfound-btn secondary">
              <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Helpful quick links */}
          <div className="notfound-quicklinks">
            <span className="quicklinks-label">Popular Destinations:</span>
            <div className="quicklinks-list">
              <Link to="/directory">Alumni Directory</Link>
              <span className="dot">•</span>
              <Link to="/mentorship">Mentorship</Link>
              <span className="dot">•</span>
              <Link to="/events">Events</Link>
              <span className="dot">•</span>
              <Link to="/opportunities">Opportunities</Link>
              <span className="dot">•</span>
              <Link to="/contact">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
