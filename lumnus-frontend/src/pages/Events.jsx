import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Events.css';
import FaqSection from '../components/FaqSection';

export default function Events() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'networking',
    date: '',
    location: '',
    meetingLink: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateMeetLink = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const link = `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
    setForm({ ...form, meetingLink: link, location: 'Online' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      setShowForm(false);
      setForm({ title: '', description: '', eventType: 'networking', date: '', location: '', meetingLink: '' });
      loadEvents();
      showToast('Event created successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create event', 'error');
    }
  };

  const handleRsvp = async (id) => {
    try {
      await api.post(`/events/${id}/rsvp`);
      loadEvents();
      showToast('Successfully RSVP\'d for this event!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not RSVP', 'error');
    }
  };

  // Filter events based on activeTab and searchQuery
  const filteredEvents = events.filter((ev) => {
    const matchesTab = activeTab === 'all' || ev.eventType?.toLowerCase() === activeTab;
    const matchesSearch = 
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate statistics
  const totalCount = events.length;
  const onlineCount = events.filter(e => e.location?.toLowerCase() === 'online' || e.meetingLink).length;
  const myRsvpCount = events.filter(e => e.rsvps?.some(r => (r.user?._id || r.user) === user?._id)).length;

  // Helper count for tabs
  const getTabCount = (tabName) => {
    if (tabName === 'all') return events.length;
    return events.filter(e => e.eventType?.toLowerCase() === tabName).length;
  };

  const renderAttendeeAvatars = (rsvps) => {
    if (!rsvps || rsvps.length === 0) return null;
    const limit = 3;
    const displayRsvps = rsvps.slice(0, limit);
    const remaining = rsvps.length - limit;
    return (
      <div className="ev-card__attendee-avatars">
        {displayRsvps.map((rsvp, idx) => {
          const u = rsvp.user;
          const name = u?.name || 'User';
          const avatar = u?.avatarUrl || `https://ui-avatars.com/api/?background=0052cc&color=fff&name=${encodeURIComponent(name)}`;
          return (
            <img 
              key={rsvp._id || idx} 
              src={avatar} 
              alt={name} 
              title={name}
              className="ev-card__attendee-avatar" 
              style={{ zIndex: limit - idx }}
            />
          );
        })}
        {remaining > 0 && (
          <div className="ev-card__attendee-avatar-more" style={{ zIndex: 0 }}>
            +{remaining}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ev-page">
      {/* Hero Banner */}
      <section className="ev-hero">
        <div className="ev-hero__content">
          <h1 className="ev-hero__title">Explore Events</h1>
          <p className="ev-hero__sub">Join reunions, virtual webinars, hands-on workshops, and casual networking sessions with alumni.</p>
        </div>
        <div className="ev-hero__stats">
          <div className="ev-stat">
            <span className="ev-stat__number">{totalCount}</span>
            <span className="ev-stat__label">Total Events</span>
          </div>
          <div className="ev-stat">
            <span className="ev-stat__number">{onlineCount}</span>
            <span className="ev-stat__label">Online</span>
          </div>
          <div className="ev-stat">
            <span className="ev-stat__number">{myRsvpCount}</span>
            <span className="ev-stat__label">My RSVPs</span>
          </div>
        </div>
      </section>

      {/* Control bar */}
      <div className="ev-toolbar">
        <div className="ev-tabs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'reunion', label: 'Reunions' },
            { id: 'webinar', label: 'Webinars' },
            { id: 'workshop', label: 'Workshops' },
            { id: 'networking', label: 'Networking' },
            { id: 'other', label: 'Others' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`ev-tab ${activeTab === tab.id ? 'ev-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="ev-tab__badge">{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        <div className="ev-toolbar__actions">
          <div className="ev-search-wrap">
            <svg className="ev-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="ev-search"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="ev-btn ev-btn--primary" onClick={() => setShowForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Host an Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ev-loader-container">
          <div className="ev-loader"></div>
        </div>
      ) : (
        <div className="ev-grid">
          {filteredEvents.length === 0 ? (
            <div className="ev-empty">
              <div className="ev-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="ev-empty__title">No events found</h3>
              <p className="ev-empty__desc">There are no upcoming events matches your search. Try changing the filters or create a new event yourself!</p>
              <button className="ev-btn ev-btn--outline" onClick={() => setShowForm(true)}>
                Host the first event
              </button>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const hasRsvpd = ev.rsvps?.some((r) => (r.user?._id || r.user) === user?._id);
              const formattedDate = new Date(ev.date).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={ev._id} className="ev-card">
                  <div className="ev-card__header">
                    <span className={`ev-badge ev-badge--${ev.eventType || 'other'}`}>
                      {ev.eventType}
                    </span>
                    <span className="ev-card__date-pill">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="ev-card__body">
                    <h3 className="ev-card__title" title={ev.title}>{ev.title}</h3>
                    <p className="ev-card__desc">{ev.description}</p>
                    
                    <div className="ev-card__details">
                      {ev.location && (
                        <div className="ev-card__detail">
                          <svg className="ev-card__detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>

                    {ev.meetingLink && (
                      <a 
                        href={ev.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ev-card__meet-btn"
                        title="Join Google Meet Room"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7Z"/>
                          <path d="m23 10-6.5 4.5V9.5L23 14Z"/>
                        </svg>
                        Join Google Meet
                      </a>
                    )}
                  </div>

                  <div className="ev-card__footer">
                    <div className="ev-card__attendees">
                      {ev.rsvps && ev.rsvps.length > 0 ? (
                        <>
                          {renderAttendeeAvatars(ev.rsvps)}
                          <span className="ev-card__attendee-count">{ev.rsvps.length} going</span>
                        </>
                      ) : (
                        <span className="ev-card__attendee-count">Be the first to RSVP!</span>
                      )}
                    </div>

                    <button
                      className={`ev-btn ev-btn--sm ${hasRsvpd ? 'ev-btn--success' : 'ev-btn--primary-action'}`}
                      onClick={() => !hasRsvpd && handleRsvp(ev._id)}
                      disabled={hasRsvpd}
                    >
                      {hasRsvpd ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12" style={{ marginRight: '4px' }}>
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                          Going
                        </>
                      ) : 'RSVP'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FAQ Section */}
      <FaqSection
        title="Events FAQs"
        faqs={[
          {
            question: "Who can host an event on Lumnus?",
            answer: "Currently, alumni have the permission to host new events (reunions, webinars, workshops) by clicking the 'Host an Event' button."
          },
          {
            question: "How do I RSVP for an event?",
            answer: "Browse the upcoming events grid, find an event you want to attend, and click 'RSVP'. The event card will update to show you are going."
          },
          {
            question: "Can we host virtual events?",
            answer: "Yes, when hosting an event, you can generate a mock Google Meet link automatically using the 'Generate Meet Link' helper and set the location to 'Online'."
          },
          {
            question: "Can I filter events by type?",
            answer: "Yes, use the category tabs at the top (Reunions, Webinars, Workshops, Networking) to filter events by their respective formats."
          }
        ]}
      />

      {/* Host Event Modal */}
      {showForm && (
        <div className="ev-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ev-modal__close" onClick={() => setShowForm(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="ev-modal__header">
              <h3 className="ev-modal__title">Host a new event</h3>
              <p className="ev-modal__sub">Fill in the details to schedule a reunion, webinar, or networking session.</p>
            </div>

            <form onSubmit={handleCreate} className="ev-modal__form">
              <div className="ev-form-group">
                <label>Event Title</label>
                <input
                  className="ev-input"
                  name="title"
                  placeholder="e.g. Tech Talk 2026, Annual Alumni Reunion"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ev-form-group">
                <label>Description</label>
                <textarea
                  className="ev-textarea"
                  name="description"
                  placeholder="Tell people what this event is about..."
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ev-form-grid">
                <div className="ev-form-group">
                  <label>Event Type</label>
                  <select className="ev-select" name="eventType" value={form.eventType} onChange={handleChange}>
                    <option value="reunion">Reunion</option>
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="ev-form-group">
                  <label>Date & Time</label>
                  <input
                    className="ev-input"
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ev-form-group">
                <label>Location / Venue</label>
                <input
                  className="ev-input"
                  name="location"
                  placeholder="e.g. Seminar Hall 3, Zoom, or Online"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="ev-form-group">
                <label>Meeting Session Link</label>
                <div className="ev-meet-input-wrapper">
                  <input
                    className="ev-input"
                    name="meetingLink"
                    placeholder="https://meet.google.com/..."
                    value={form.meetingLink}
                    onChange={handleChange}
                  />
                  <button 
                    type="button" 
                    className="ev-btn ev-btn--outline ev-meet-gen-btn" 
                    onClick={generateMeetLink}
                    title="Generate Google Meet Link"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7Z"/>
                      <path d="m23 10-6.5 4.5V9.5L23 14Z"/>
                    </svg>
                    Generate Meet Link
                  </button>
                </div>
              </div>

              <div className="ev-modal__footer">
                <button type="button" className="ev-btn ev-btn--outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="ev-btn ev-btn--primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
