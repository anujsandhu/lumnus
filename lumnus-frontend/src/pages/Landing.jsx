import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Landing.css';

const FAQS = [
  {
    question: 'Is there a fee for students to join the mentorship program?',
    answer: 'No, participation is completely free for all verified students and alumni of your institution.',
  },
  {
    question: 'How do I find and request a mentor?',
    answer: 'Browse the Alumni Directory, filter by industry or skills, and click "Request Mentorship" on any profile marked as mentor-available.',
  },
  {
    question: 'Can I host virtual events on lumnus?',
    answer: 'Yes — when creating an event you can instantly generate a Google Meet link right from the dashboard, no external tools needed.',
  },
  {
    question: 'How quickly are mentorship requests answered?',
    answer: 'Response time depends on the mentor\'s availability. You\'ll get a real-time notification the moment they accept or decline your request.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    api.get('/events')
      .then(res => {
        const now = new Date();
        const upcoming = res.data
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (i) => setActiveFaq(activeFaq === i ? null : i);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/directory?search=${encodeURIComponent(searchQuery.trim())}` : '/directory');
  };

  return (
    <div className="landing">

      {/* ── HERO (original indigo banner) ── */}
      <div className="landing__hero-banner">
        <div className="landing__hero-container">
          <div className="landing__hero-left">
            <div className="landing__logo-badge">lumnus workspace</div>
            <h1 className="landing__hero-title">
              Alumni &amp; Prospects Engagement Stack built for <span className="underline-text">Success &amp; Efficiency</span>
            </h1>
            <p className="landing__hero-subtitle">
              Your professional mentorship and networking partner, grounded in the community you trust, built with modern directory features.
            </p>

            <form className="landing__search-form" onSubmit={handleSearch}>
              <div className="landing__search-container">
                <svg className="landing__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="landing__search-input"
                  placeholder="Search alumni by name, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-primary landing__search-btn">Search</button>
              </div>
            </form>

            <div className="landing__actions">
              {!user && (
                <>
                  <Link to="/register" className="btn-primary-white">Join the Network</Link>
                  <Link to="/login" className="btn-ghost-white">Sign in</Link>
                </>
              )}
            </div>
          </div>

          <div className="landing__hero-right">
            <div className="avatar-grid-container">
              <div className="avatar-grid__dots" />
              <div className="avatar-grid__cell avatar-grid__cell--1">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
              <div className="avatar-grid__cell avatar-grid__cell--2">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
              <div className="avatar-grid__cell avatar-grid__cell--3">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
              <div className="avatar-grid__cell avatar-grid__cell--4">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
              <div className="avatar-grid__cell avatar-grid__cell--5">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
              <div className="avatar-grid__cell avatar-grid__cell--6">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" alt="Alumni" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="landing__stats-bar">
        <div className="landing__stats-inner">
          {[
            { num: stats ? stats.totalUsers.toLocaleString() : '—',   suffix: '',  label: 'Alumni & students registered' },
            { num: stats ? stats.totalMentors.toLocaleString() : '—', suffix: '',  label: 'Active mentors' },
            { num: stats ? stats.totalEvents.toLocaleString() : '—',  suffix: '',  label: 'Events hosted' },
            { num: stats ? stats.totalRsvps.toLocaleString() : '—',   suffix: '',  label: 'Total RSVPs' },
          ].map((s) => (
            <div key={s.label} className="landing__stat-item">
              <span className="landing__stat-num">{s.num}<span>{s.suffix}</span></span>
              <span className="landing__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="landing__content">

        {/* ── PORTALS ── */}
        <section className="landing__portals">
          <div className="landing__section-header">
            <span className="landing__section-tag">Everything you need</span>
            <h2 className="landing__section-title">One platform, every touchpoint</h2>
            <p className="landing__section-sub">From finding a mentor to hosting a reunion — lumnus handles the entire alumni lifecycle.</p>
          </div>

          <div className="landing__portals-grid">
            <Link to="/directory" className="landing__portal-card">
              <div className="landing__portal-icon landing__portal-icon--blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h3>Alumni Directory</h3>
              <p>Search and connect with graduates across every industry, batch, and location — all in seconds.</p>
              <span className="landing__portal-arrow">Browse directory <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>

            <Link to="/mentorship" className="landing__portal-card">
              <div className="landing__portal-icon landing__portal-icon--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Mentorship Hub</h3>
              <p>Request career coaching from industry veterans or offer your expertise to the next generation.</p>
              <span className="landing__portal-arrow">Find a mentor <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>

            <Link to="/events" className="landing__portal-card">
              <div className="landing__portal-icon landing__portal-icon--amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Events &amp; Meetups</h3>
              <p>Host or attend reunions, webinars, and workshops. Generate Google Meet links in one click.</p>
              <span className="landing__portal-arrow">View events <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>

            <Link to="/opportunities" className="landing__portal-card">
              <div className="landing__portal-icon landing__portal-icon--rose">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <h3>Opportunities</h3>
              <p>Explore exclusive jobs, internships, and project openings shared by your alumni network.</p>
              <span className="landing__portal-arrow">Explore jobs <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <div className="landing__features">

          {/* Feature 1 — Profile */}
          <div className="landing__feature-row">
            <div className="landing__feature-text">
              <span className="landing__feature-kicker">
                <span className="landing__feature-kicker-line" />
                Alumni Profiles
              </span>
              <h2>Your career story, professionally showcased</h2>
              <p>Build a rich profile that highlights your company, batch, skills, and mentorship availability. Let students and recruiters discover your journey.</p>
              <ul className="landing__feature-list">
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Verified student &amp; alumni status</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Showcase skills, companies, and batch details</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Toggle mentorship availability anytime</li>
              </ul>
              <Link to="/register" className="landing__feature-cta">
                Create your profile
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="landing__feature-graphic">
              <div className="feature-mockup fm-profile">
                <div className="fm-profile__head">
                  <div className="fm-profile__avatar">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80" alt="Amit Patel" />
                  </div>
                  <div>
                    <p className="fm-profile__name">Amit Patel</p>
                    <p className="fm-profile__role">Senior Software Engineer · Google</p>
                  </div>
                </div>
                <p className="fm-profile__bio">"Happy to help with system design mock interviews, backend engineering paths, and resume reviews."</p>
                <div className="fm-profile__tags">
                  <span className="fm-badge fm-badge--blue">Batch 2020</span>
                  <span className="fm-badge fm-badge--green">Mentor Available</span>
                  <span className="fm-badge">Node.js</span>
                  <span className="fm-badge">Distributed Systems</span>
                </div>
                <div className="fm-profile__footer">
                  <div className="fm-profile__metric">
                    <div className="fm-profile__metric-num">24</div>
                    <div className="fm-profile__metric-label">Mentees</div>
                  </div>
                  <div className="fm-profile__metric">
                    <div className="fm-profile__metric-num">8</div>
                    <div className="fm-profile__metric-label">Events</div>
                  </div>
                  <div className="fm-profile__metric">
                    <div className="fm-profile__metric-num">4.9</div>
                    <div className="fm-profile__metric-label">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — Mentorship */}
          <div className="landing__feature-row landing__feature-row--reverse">
            <div className="landing__feature-graphic">
              <div className="feature-mockup fm-mentor">
                {[
                  { label: 'Request Mentorship', active: true, badge: 'New' },
                  { label: 'Schedule a Session', active: false, badge: null },
                  { label: 'Send a Message', active: false, badge: null },
                  { label: 'View Mentor Profile', active: false, badge: null },
                ].map((item) => (
                  <div key={item.label} className={`fm-mentor__item${item.active ? ' fm-mentor__item--active' : ''}`}>
                    <div className="fm-mentor__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <span className="fm-mentor__label">{item.label}</span>
                    {item.badge && <span className="fm-mentor__badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="landing__feature-text">
              <span className="landing__feature-kicker">
                <span className="landing__feature-kicker-line" />
                Mentorship
              </span>
              <h2>Find your guide in the industry</h2>
              <p>Browse mentors by domain, send structured requests, and build real career connections with alumni who've been exactly where you are now.</p>
              <ul className="landing__feature-list">
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Filter mentors by industry, company, or skill</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Send structured mentorship requests directly</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Real-time status notifications on every request</li>
              </ul>
              <Link to="/mentorship" className="landing__feature-cta">
                Browse mentors
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Feature 3 — Events */}
          <div className="landing__feature-row">
            <div className="landing__feature-text">
              <span className="landing__feature-kicker">
                <span className="landing__feature-kicker-line" />
                Events
              </span>
              <h2>Host world-class alumni events in minutes</h2>
              <p>Schedule reunions, webinars, and networking sessions end-to-end — complete with RSVP tracking, attendee lists, and instant Google Meet link generation.</p>
              <ul className="landing__feature-list">
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>One-click Google Meet link generation</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>RSVP tracking with live attendee count</li>
                <li><svg className="landing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Filter by reunion, webinar, workshop, or networking</li>
              </ul>
              <Link to="/events" className="landing__feature-cta">
                Explore events
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="landing__feature-graphic">
              <div className="feature-mockup fm-events">
                <div className="fm-events__header">
                  <span className="fm-events__title">Upcoming Events</span>
                  <span className="fm-events__dot" />
                </div>
                {upcomingEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: '0.88rem' }}>
                    No upcoming events yet
                  </div>
                ) : (
                  upcomingEvents.map((ev) => {
                    const d = new Date(ev.date);
                    const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
                    const day = d.getDate();
                    const rsvpCount = ev.rsvps?.length || 0;
                    const location = ev.location || 'Online';
                    const type = ev.eventType
                      ? ev.eventType.charAt(0).toUpperCase() + ev.eventType.slice(1)
                      : 'Event';
                    return (
                      <div key={ev._id} className="fm-event-item">
                        <div className="fm-event__date-box">
                          <span className="fm-event__month">{month}</span>
                          <span className="fm-event__day">{day}</span>
                        </div>
                        <div className="fm-event__info">
                          <p className="fm-event__name">{ev.title}</p>
                          <p className="fm-event__meta">{location} · {rsvpCount} going</p>
                        </div>
                        <span className="fm-event__pill">{type}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── FAQ ── */}
        <section className="landing__faq">
          <div className="landing__faq-left">
            <span className="landing__section-tag">FAQs</span>
            <h2>Got questions?<br />We've got answers.</h2>
            <p>Can't find what you're looking for? Reach out through your profile and our team will get back to you.</p>
            <Link to="/contact" className="landing__faq-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Contact us
            </Link>
          </div>

          <div className="landing__faq-right">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`landing__faq-item${activeFaq === i ? ' landing__faq-item--active' : ''}`}
                onClick={() => toggleFaq(i)}
              >
                <div className="landing__faq-question">
                  <h3>{faq.question}</h3>
                  <svg className="landing__faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                <div className="landing__faq-answer">
                  <div className="landing__faq-answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <div className="landing__cta-banner">
          <div className="landing__cta-banner-text">
            <h2>Ready to reconnect with your alumni network?</h2>
            <p>Join thousands of alumni and students already building careers and communities on lumnus.</p>
          </div>
          <div className="landing__cta-banner-actions">
            {user ? (
              <Link to="/directory" className="btn-primary-white" style={{borderRadius:'12px'}}>
                Go to Directory →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary-white" style={{borderRadius:'12px'}}>
                  Create free account →
                </Link>
                <Link to="/login" className="btn-ghost-white" style={{borderRadius:'12px'}}>Sign in</Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
