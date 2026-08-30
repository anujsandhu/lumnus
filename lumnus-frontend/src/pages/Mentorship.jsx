import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Mentorship.css';
import FaqSection from '../components/FaqSection';
import MeetingModal from '../components/MeetingModal';

// ─── Mentor Sign-Up Form (Alumni only) ───────────────────────────────────────
function MentorSignUpModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    phone: '',
    company: user?.company || '',
    designation: user?.designation || '',
    expertiseTags: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.phone.trim() || !form.company.trim() || !form.designation.trim()) {
      setErr('Phone, company and role are required.');
      return;
    }
    setSaving(true);
    try {
      const tags = form.expertiseTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await api.put('/users/me', {
        isMentor: true,
        phone: form.phone.trim(),
        company: form.company.trim(),
        designation: form.designation.trim(),
        mentorExpertise: tags,
      });
      onSuccess();
    } catch (error) {
      setErr(error.response?.data?.message || 'Could not register as mentor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ms-modal-overlay" onClick={onClose}>
      <div className="ms-modal ms-modal--signup" onClick={(e) => e.stopPropagation()}>
        <button className="ms-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="ms-modal__header">
          <div className="ms-signup-icon">🎓</div>
          <div>
            <h3 className="ms-modal__name">Sign up as a Mentor</h3>
            <p className="ms-modal__sub">Share your experience with students</p>
          </div>
        </div>

        {err && <div className="ms-error">{err}</div>}

        <form onSubmit={handleSubmit} className="ms-modal__form">
          <div className="ms-form-group">
            <label>Phone number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ms-form-group">
            <label>Current company *</label>
            <input
              type="text"
              name="company"
              placeholder="e.g. Google, Microsoft…"
              value={form.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ms-form-group">
            <label>Your role / designation *</label>
            <input
              type="text"
              name="designation"
              placeholder="e.g. Senior Software Engineer"
              value={form.designation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ms-form-group">
            <label>Expertise areas <span className="ms-form-hint">(comma-separated)</span></label>
            <input
              type="text"
              name="expertiseTags"
              placeholder="e.g. System Design, Career Guidance, ML"
              value={form.expertiseTags}
              onChange={handleChange}
            />
          </div>

          <div className="ms-modal__footer">
            <button type="button" className="ms-btn ms-btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="ms-btn ms-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : '🚀 Become a mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Request Modal (Student → Mentor) ────────────────────────────────────────
function RequestModal({ mentor, onClose, onSuccess }) {
  const [form, setForm] = useState({ expertiseArea: mentor.mentorExpertise?.[0] || '', message: '' });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr('');
    try {
      await api.post('/mentorships', {
        mentor: mentor._id,
        expertiseArea: form.expertiseArea,
        message: form.message,
      });
      onSuccess();
    } catch (error) {
      setErr(error.response?.data?.message || 'Could not send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ms-modal-overlay" onClick={onClose}>
      <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ms-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div className="ms-modal__header">
          <div className="ms-modal__avatar">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} />
            ) : (
              <span>{mentor.name?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div>
            <h3 className="ms-modal__name">Request mentorship</h3>
            <p className="ms-modal__sub">with {mentor.name}</p>
          </div>
        </div>

        {err && <div className="ms-error">{err}</div>}

        <form onSubmit={handleSubmit} className="ms-modal__form">
          <div className="ms-form-group">
            <label>Area of interest</label>
            <input
              type="text"
              placeholder="e.g. System Design, Career Guidance..."
              value={form.expertiseArea}
              onChange={(e) => setForm({ ...form, expertiseArea: e.target.value })}
              required
            />
          </div>
          <div className="ms-form-group">
            <label>Your message</label>
            <textarea
              placeholder="Introduce yourself and explain what you'd like help with..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="ms-modal__footer">
            <button type="button" className="ms-btn ms-btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="ms-btn ms-btn--primary" disabled={sending}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/>
              </svg>
              {sending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Mentorship() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAlumni = user?.role === 'alumni';

  const [mentors, setMentors] = useState([]);
  const [myMentorships, setMyMentorships] = useState([]);
  const [view, setView] = useState(isAlumni ? 'requests' : 'find');
  const [requestModal, setRequestModal] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [meetingModalTarget, setMeetingModalTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMentor, setIsMentor] = useState(user?.isMentor || false);

  const handleSaveMeetingLink = async (meetingUrl) => {
    if (!meetingModalTarget) return;
    await api.put(`/mentorships/${meetingModalTarget._id}/meeting`, { meetingLink: meetingUrl });
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, mineRes] = await Promise.all([
        api.get('/users/mentors'),
        api.get('/mentorships/me'),
      ]);
      setMentors(mentorsRes.data.filter((m) => m._id !== user?._id));
      setMyMentorships(mineRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh isMentor status from user profile
  const refreshMentorStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      setIsMentor(res.data?.isMentor || false);
    } catch (_) { /* silent */ }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (requestModal || showSignUp || meetingModalTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [requestModal, showSignUp, meetingModalTarget]);

  const filteredMentors = mentors.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.designation?.toLowerCase().includes(q) ||
      (m.mentorExpertise || []).some((e) => e.toLowerCase().includes(q))
    );
  });

  // ── Student derived state ──
  const activeMentorship = myMentorships.find(
    (m) => !isAlumni && m.status === 'active'
  );
  const pendingMentorship = myMentorships.find(
    (m) => !isAlumni && m.status === 'pending'
  );
  const canFindMentor = !activeMentorship && !pendingMentorship;

  // ── Alumni derived state ──
  const incomingRequests = isAlumni
    ? myMentorships.filter((m) => String(m.mentor?._id) === user?._id && m.status === 'pending')
    : [];
  const activeAsMentor = isAlumni
    ? myMentorships.filter((m) => String(m.mentor?._id) === user?._id && m.status === 'active')
    : [];
  const releaseRequests = isAlumni
    ? activeAsMentor.filter((m) => m.releaseRequest === 'pending')
    : [];

  const pendingCount = incomingRequests.length;
  const activeCount = activeAsMentor.length;

  const handleAccept = async (id) => {
    try {
      await api.put(`/mentorships/${id}/status`, { status: 'active' });
      loadData();
      showToast('Mentorship request accepted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not accept request', 'error');
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.put(`/mentorships/${id}/status`, { status: 'declined' });
      loadData();
      showToast('Mentorship request declined.', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not decline request', 'error');
    }
  };

  const handleRequestRelease = async (id) => {
    if (!window.confirm('Send a request to your mentor to release you so you can find a new mentor?')) return;
    try {
      await api.put(`/mentorships/${id}/release`);
      loadData();
      showToast('Release request sent to your mentor!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send release request', 'error');
    }
  };

  const handleAcceptRelease = async (id) => {
    if (!window.confirm('Accept this release request? The student will be freed to find a new mentor.')) return;
    try {
      await api.put(`/mentorships/${id}/release/accept`);
      loadData();
      showToast('Student successfully released from mentorship!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not accept release', 'error');
    }
  };

  const handleWithdrawMentorship = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this mentorship request?')) return;
    try {
      await api.delete(`/mentorships/${id}`);
      loadData();
      showToast('Mentorship request withdrawn successfully.', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not withdraw mentorship request', 'error');
    }
  };

  return (
    <div className="ms-page">
      {/* ── Hero ── */}
      <section className="ms-hero">
        <div className="ms-hero__content">
          <h1 className="ms-hero__title">
            {isAlumni ? 'Mentor Dashboard' : 'Find your mentor'}
          </h1>
          <p className="ms-hero__sub">
            {isAlumni
              ? 'Manage your mentees, review requests and make an impact.'
              : 'Connect with experienced alumni who are ready to guide your career journey.'}
          </p>
        </div>
        <div className="ms-hero__stats">
          {isAlumni ? (
            <>
              <div className="ms-stat">
                <span className="ms-stat__number">{activeCount}</span>
                <span className="ms-stat__label">Active mentees</span>
              </div>
              <div className="ms-stat">
                <span className="ms-stat__number">{pendingCount}</span>
                <span className="ms-stat__label">Pending requests</span>
              </div>
            </>
          ) : (
            <>
              <div className="ms-stat">
                <span className="ms-stat__number">{mentors.length}</span>
                <span className="ms-stat__label">Mentors available</span>
              </div>
              <div className="ms-stat">
                <span className="ms-stat__number">{activeMentorship ? 1 : 0}</span>
                <span className="ms-stat__label">Active mentor</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Toolbar ── */}
      <section className="ms-toolbar">
        <div className="ms-tabs">
          {isAlumni ? (
            <>
              <button className={`ms-tab ${view === 'requests' ? 'ms-tab--active' : ''}`} onClick={() => setView('requests')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/>
                </svg>
                Requests
                {pendingCount > 0 && <span className="ms-tab__badge">{pendingCount}</span>}
              </button>
              <button className={`ms-tab ${view === 'mentees' ? 'ms-tab--active' : ''}`} onClick={() => setView('mentees')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Active Mentees
                {activeCount > 0 && <span className="ms-tab__badge ms-tab__badge--green">{activeCount}</span>}
              </button>
            </>
          ) : (
            <>
              <button className={`ms-tab ${view === 'find' ? 'ms-tab--active' : ''}`} onClick={() => setView('find')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Explore mentors
              </button>
              <button className={`ms-tab ${view === 'mine' ? 'ms-tab--active' : ''}`} onClick={() => setView('mine')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                My mentor
                {activeMentorship && <span className="ms-tab__badge ms-tab__badge--green">1</span>}
                {pendingMentorship && !activeMentorship && <span className="ms-tab__badge">1</span>}
              </button>
            </>
          )}
        </div>

        <div className="ms-toolbar__right">
          {/* Alumni — "Become a Mentor" CTA */}
          {isAlumni && !isMentor && (
            <button
              id="become-mentor-btn"
              className="ms-become-mentor-btn"
              onClick={() => setShowSignUp(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Become a mentor
            </button>
          )}
          {isAlumni && isMentor && (
            <span className="ms-mentor-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
              </svg>
              Mentor
            </span>
          )}
          {/* Student — search when exploring */}
          {!isAlumni && view === 'find' && (
            <div className="ms-search-wrap">
              <svg className="ms-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="ms-search"
                type="text"
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="ms-content">
        {loading ? (
          <div className="ms-loading">
            <div className="ms-spinner"></div>
            <p>Loading…</p>
          </div>
        ) : isAlumni ? (
          // ════════════════════════ ALUMNI VIEWS ════════════════════════
          view === 'requests' ? (
            incomingRequests.length === 0 ? (
              <div className="ms-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                  <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/>
                </svg>
                <h3>No pending requests</h3>
                <p>Student mentorship requests will appear here.</p>
              </div>
            ) : (
              <div className="ms-my-list">
                {incomingRequests.map((m) => (
                  <div key={m._id} className="ms-session ms-session--pending">
                    <div className="ms-session__left">
                      <div className="ms-session__avatar">
                        {m.mentee?.avatarUrl ? (
                          <img src={m.mentee.avatarUrl} alt={m.mentee?.name} />
                        ) : (
                          <span>{m.mentee?.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="ms-session__info">
                        <h4 className="ms-session__name">{m.mentee?.name || 'Student'}</h4>
                        <p className="ms-session__meta">
                          {m.mentee?.branch || 'LPU'} · Batch {m.mentee?.batch || '—'}
                        </p>
                        <p className="ms-session__area">
                          <strong>Topic:</strong> {m.expertiseArea}
                        </p>
                        {m.message && <p className="ms-session__msg">"{m.message}"</p>}
                      </div>
                    </div>
                    <div className="ms-session__right">
                      <div className="ms-session__actions">
                        <button className="ms-btn ms-btn--accept" onClick={() => handleAccept(m._id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20 6 9 17l-5-5"/></svg>
                          Accept
                        </button>
                        <button className="ms-btn ms-btn--decline" onClick={() => handleDecline(m._id)}>
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Active Mentees tab
            activeAsMentor.length === 0 ? (
              <div className="ms-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <h3>No active mentees</h3>
                <p>Accept pending requests to start mentoring students.</p>
              </div>
            ) : (
              <div className="ms-my-list">
                {activeAsMentor.map((m) => (
                  <div key={m._id} className="ms-session ms-session--active">
                    <div className="ms-session__left">
                      <div className="ms-session__avatar">
                        {m.mentee?.avatarUrl ? (
                          <img src={m.mentee.avatarUrl} alt={m.mentee?.name} />
                        ) : (
                          <span>{m.mentee?.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="ms-session__info">
                        <h4 className="ms-session__name">{m.mentee?.name || 'Student'}</h4>
                        <p className="ms-session__meta">
                          LPU · {m.mentee?.branch || 'Engineering'} · Batch {m.mentee?.batch || '—'}
                        </p>
                        <p className="ms-session__area"><strong>Topic:</strong> {m.expertiseArea}</p>
                        <p className="ms-session__contact">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          {m.mentee?.email}
                        </p>

                        {/* Live Video Meeting Arrangement Card */}
                        <div className="ms-meeting-card">
                          <div className="ms-meeting-info">
                            <div className="ms-meeting-icon">🎥</div>
                            <div>
                              <h4 className="ms-meeting-title">Live Video Meeting Arrangement</h4>
                              <p className="ms-meeting-sub">
                                {m.meetingLink ? 'Meeting link is set up for your student session.' : 'Set up a Google Meet, Zoom, or instant Jitsi room for your session.'}
                              </p>
                            </div>
                          </div>
                          <div className="ms-meeting-actions">
                            {m.meetingLink ? (
                              <>
                                <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn--join-meeting">
                                  🚀 JOIN LIVE MEETING
                                </a>
                                <button type="button" className="ms-btn ms-btn--outline-sm" onClick={() => setMeetingModalTarget(m)}>
                                  Edit Link
                                </button>
                              </>
                            ) : (
                              <button type="button" className="ms-btn ms-btn--arrange-meeting" onClick={() => setMeetingModalTarget(m)}>
                                🎥 Arrange Live Meeting
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ms-session__right">
                      <span className="ms-status ms-status--active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        Active
                      </span>
                      {m.releaseRequest === 'pending' && (
                        <button
                          className="ms-btn ms-btn--release-accept"
                          title="Student wants to change mentor — accept release"
                          onClick={() => handleAcceptRelease(m._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Release student
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )
        ) : (
          // ════════════════════════ STUDENT VIEWS ════════════════════════
          view === 'find' ? (
            <>
              {/* If student already has pending / active mentorship, show notice */}
              {!canFindMentor && (
                <div className="ms-notice">
                  {pendingMentorship && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      Your request to <strong>{pendingMentorship.mentor?.name}</strong> is pending. Switch to "My Mentor" to view details.
                    </>
                  )}
                  {activeMentorship && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                      You already have an active mentor. Go to "My Mentor" to view your session.
                    </>
                  )}
                </div>
              )}

              {filteredMentors.length === 0 ? (
                <div className="ms-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <h3>No mentors found</h3>
                  <p>{search ? 'Try adjusting your search terms.' : 'No alumni have signed up as mentors yet. Check back soon!'}</p>
                </div>
              ) : (
                <div className="ms-grid">
                  {filteredMentors.map((m) => (
                    <div key={m._id} className="ms-card">
                      <div className="ms-card__header">
                        <div className="ms-card__avatar">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} />
                          ) : (
                            <span>{m.name?.[0]?.toUpperCase() || '?'}</span>
                          )}
                        </div>
                        <div className="ms-card__info">
                          <h3 className="ms-card__name">{m.name}</h3>
                          <p className="ms-card__role">
                            {m.designation || 'Alumni'}{m.company ? ` at ${m.company}` : ''}
                          </p>
                          {m.location && (
                            <span className="ms-card__location">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              {m.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {(m.mentorExpertise || []).length > 0 && (
                        <div className="ms-card__expertise">
                          <span className="ms-card__expertise-label">Expertise</span>
                          <div className="ms-card__tags">
                            {m.mentorExpertise.map((tag) => (
                              <span key={tag} className="ms-tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        className="ms-card__cta"
                        disabled={!canFindMentor}
                        onClick={() => canFindMentor && setRequestModal(m)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/>
                        </svg>
                        {canFindMentor ? 'Request mentorship' : 'Already mentored'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // ── "My Mentor" tab ──
            !activeMentorship && !pendingMentorship ? (
              <div className="ms-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                  <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/>
                </svg>
                <h3>No active mentor yet</h3>
                <p>Browse available mentors and send your first request.</p>
                <button className="ms-empty__cta" onClick={() => setView('find')}>Find a mentor</button>
              </div>
            ) : pendingMentorship ? (
              // Pending state
              <div className="ms-mentor-detail-card ms-mentor-detail-card--pending">
                <div className="ms-mdc__header">
                  <div className="ms-mdc__avatar">
                    {pendingMentorship.mentor?.avatarUrl ? (
                      <img src={pendingMentorship.mentor.avatarUrl} alt={pendingMentorship.mentor?.name} />
                    ) : (
                      <span>{pendingMentorship.mentor?.name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="ms-mdc__name">{pendingMentorship.mentor?.name}</h3>
                    <p className="ms-mdc__role">{pendingMentorship.mentor?.designation} at {pendingMentorship.mentor?.company}</p>
                  </div>
                </div>
                <div className="ms-mdc__pending-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <div style={{ flex: 1 }}>
                    <strong>Request pending</strong>
                    <p>Waiting for {pendingMentorship.mentor?.name} to accept your request.</p>
                  </div>
                  <button
                    type="button"
                    className="ms-btn ms-btn--outline"
                    onClick={() => handleWithdrawMentorship(pendingMentorship._id)}
                    style={{ color: '#e11d48', borderColor: '#fecdd3', background: '#fff1f2' }}
                  >
                    Withdraw Request
                  </button>
                </div>
              </div>
            ) : (
              // Active mentor — show full details
              <div className="ms-mentor-detail-card">
                <div className="ms-mdc__badge">Active Mentor</div>
                <div className="ms-mdc__header">
                  <div className="ms-mdc__avatar">
                    {activeMentorship.mentor?.avatarUrl ? (
                      <img src={activeMentorship.mentor.avatarUrl} alt={activeMentorship.mentor?.name} />
                    ) : (
                      <span>{activeMentorship.mentor?.name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="ms-mdc__name">{activeMentorship.mentor?.name}</h3>
                    <p className="ms-mdc__role">{activeMentorship.mentor?.designation} at {activeMentorship.mentor?.company}</p>
                  </div>
                </div>

                <div className="ms-mdc__contacts">
                  <a className="ms-mdc__contact-item" href={`mailto:${activeMentorship.mentor?.email}`}>
                    <div className="ms-mdc__contact-icon ms-mdc__contact-icon--email">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <span className="ms-mdc__contact-label">Email</span>
                      <span className="ms-mdc__contact-value">{activeMentorship.mentor?.email}</span>
                    </div>
                  </a>
                  {activeMentorship.mentor?.phone && (
                    <a className="ms-mdc__contact-item" href={`tel:${activeMentorship.mentor.phone}`}>
                      <div className="ms-mdc__contact-icon ms-mdc__contact-icon--phone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.4 2 2 0 0 1 3.69 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <div>
                        <span className="ms-mdc__contact-label">Phone</span>
                        <span className="ms-mdc__contact-value">{activeMentorship.mentor.phone}</span>
                      </div>
                    </a>
                  )}
                  {activeMentorship.mentor?.linkedinUrl && (
                    <a className="ms-mdc__contact-item" href={activeMentorship.mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <div className="ms-mdc__contact-icon ms-mdc__contact-icon--linkedin">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </div>
                      <div>
                        <span className="ms-mdc__contact-label">LinkedIn</span>
                        <span className="ms-mdc__contact-value">View profile</span>
                      </div>
                    </a>
                  )}
                </div>

                {/* Live Video Meeting Arrangement Box */}
                <div className="ms-meeting-card">
                  <div className="ms-meeting-info">
                    <div className="ms-meeting-icon">🎥</div>
                    <div>
                      <h4 className="ms-meeting-title">Live Video Meeting Arrangement</h4>
                      <p className="ms-meeting-sub">
                        {activeMentorship.meetingLink ? 'Your live mentorship video meeting link is ready.' : 'No meeting link set yet. Click below to generate or add a Google Meet, Zoom, or Jitsi link.'}
                      </p>
                    </div>
                  </div>
                  <div className="ms-meeting-actions">
                    {activeMentorship.meetingLink ? (
                      <>
                        <a href={activeMentorship.meetingLink} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn--join-meeting">
                          🚀 JOIN LIVE MEETING
                        </a>
                        <button type="button" className="ms-btn ms-btn--outline-sm" onClick={() => setMeetingModalTarget(activeMentorship)}>
                          Edit Link
                        </button>
                      </>
                    ) : (
                      <button type="button" className="ms-btn ms-btn--arrange-meeting" onClick={() => setMeetingModalTarget(activeMentorship)}>
                        🎥 Arrange Live Meeting
                      </button>
                    )}
                  </div>
                </div>

                {/* Change Mentor button */}
                <div className="ms-mdc__footer">
                  {activeMentorship.releaseRequest === 'none' && (
                    <button
                      id="change-mentor-btn"
                      className="ms-btn ms-btn--change"
                      onClick={() => handleRequestRelease(activeMentorship._id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                      Change mentor
                    </button>
                  )}
                  {activeMentorship.releaseRequest === 'pending' && (
                    <div className="ms-release-pending">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      Release request sent — waiting for {activeMentorship.mentor?.name} to confirm.
                    </div>
                  )}
                </div>
              </div>
            )
          )
        )}
      </section>

      {/* Meeting Modal */}
      {meetingModalTarget && (
        <MeetingModal
          mentorshipId={meetingModalTarget._id}
          existingLink={meetingModalTarget.meetingLink}
          onClose={() => setMeetingModalTarget(null)}
          onSave={handleSaveMeetingLink}
        />
      )}

      <FaqSection
        title="Mentorship FAQs"
        faqs={[
          {
            question: "How do I request a mentorship session?",
            answer: "Browse available mentors on the 'Explore Mentors' tab, click 'Request Mentorship' on a mentor's card, and send a message. The mentor's contact details are revealed after they accept."
          },
          {
            question: "How do we connect for the actual mentorship?",
            answer: "Once the mentor accepts your request, their phone number and email are shown on your 'My Mentor' tab so you can reach out directly."
          },
          {
            question: "Who can become a mentor?",
            answer: "Any registered Alumni can sign up as a mentor via the 'Become a mentor' button on the Mentorship page."
          },
          {
            question: "How do I change my mentor?",
            answer: "Click 'Change Mentor' on your active mentor card. Your current mentor will receive a release request. Once they accept, you'll be free to choose a new mentor."
          }
        ]}
      />

      {/* Modals */}
      {showSignUp && (
        <MentorSignUpModal
          onClose={() => setShowSignUp(false)}
          onSuccess={() => {
            setShowSignUp(false);
            setIsMentor(true);
            refreshMentorStatus();
            loadData();
          }}
        />
      )}
      {requestModal && (
        <RequestModal
          mentor={requestModal}
          onClose={() => setRequestModal(null)}
          onSuccess={() => {
            setRequestModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
