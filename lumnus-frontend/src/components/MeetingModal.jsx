import { useState } from 'react';
import './MeetingModal.css';

export default function MeetingModal({ mentorshipId, existingLink, onClose, onSave }) {
  const [meetingUrl, setMeetingUrl] = useState(existingLink || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generateJitsiLink = () => {
    const roomName = `LUMNUS-Session-${mentorshipId ? mentorshipId.slice(-6) : Math.floor(Math.random()*10000)}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    setMeetingUrl(jitsiUrl);
  };

  const handleOpenGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const handleOpenZoom = () => {
    window.open('https://zoom.us/start/videomeeting', '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingUrl.trim()) {
      setError('Please provide or generate a meeting link.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(meetingUrl.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save meeting link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-card" onClick={(e) => e.stopPropagation()}>
        <div className="mm-header">
          <div className="mm-title-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" className="mm-header-icon">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <h2>Arrange Live Video Meeting</h2>
          </div>
          <button className="mm-close-btn" onClick={onClose}>&times;</button>
        </div>

        <p className="mm-subtitle">
          Generate an instant video room or connect your Google Meet / Zoom link for your live mentorship session.
        </p>

        {error && <div className="mm-error">⚠ {error}</div>}

        <div className="mm-quick-presets">
          <label className="mm-preset-label">QUICK INSTANT GENERATORS</label>
          <div className="mm-preset-grid">
            {/* Jitsi Instant */}
            <button type="button" className="mm-preset-btn jitsi" onClick={generateJitsiLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span>Instant Jitsi Room (No Login)</span>
            </button>

            {/* Google Meet */}
            <button type="button" className="mm-preset-btn meet" onClick={handleOpenGoogleMeet}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M15 10l5-3v10l-5-3v-4z"/><rect x="2" y="6" width="13" height="12" rx="2"/>
              </svg>
              <span>+ New Google Meet</span>
            </button>

            {/* Zoom */}
            <button type="button" className="mm-preset-btn zoom" onClick={handleOpenZoom}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <span>+ New Zoom Meeting</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-field">
            <label className="mm-label">Meeting URL Link</label>
            <input
              type="url"
              className="mm-input"
              placeholder="https://meet.google.com/abc-defg-hij or https://meet.jit.si/..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              required
            />
            <span className="mm-hint">Paste your Google Meet, Zoom, MS Teams, or Jitsi meeting link above.</span>
          </div>

          <div className="mm-actions">
            <button type="button" className="mm-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="mm-btn save" disabled={saving}>
              {saving ? 'Saving...' : 'Save & Attach Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
