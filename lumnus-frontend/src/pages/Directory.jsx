import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import './Directory.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FaqSection from '../components/FaqSection';

export default function Directory() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    batch: searchParams.get('batch') || '',
    branch: searchParams.get('branch') || ''
  });

  const fetchUsers = async (activeFilters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v)
      );
      const [usersRes, connRes] = await Promise.all([
        api.get('/users', { params }),
        api.get('/connections/me')
      ]);
      setUsers(usersRes.data);
      setConnections(connRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeFilters = {
      search: searchParams.get('search') || '',
      role: searchParams.get('role') || '',
      batch: searchParams.get('batch') || '',
      branch: searchParams.get('branch') || ''
    };
    setFilters(activeFilters);
    fetchUsers(activeFilters);
  }, [searchParams]);

  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUser]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
  };

  const getConnectionInfo = (otherUserId) => {
    const conn = connections.find(
      (c) =>
        (c.fromUser?._id || c.fromUser) === otherUserId ||
        (c.toUser?._id || c.toUser) === otherUserId
    );
    if (!conn) return null;
    return {
      id: conn._id,
      status: conn.status,
      fromUser: conn.fromUser?._id || conn.fromUser,
      toUser: conn.toUser?._id || conn.toUser,
    };
  };

  const handleConnectClick = async (toUserId) => {
    try {
      await api.post('/connections', { toUser: toUserId });
      const connRes = await api.get('/connections/me');
      setConnections(connRes.data);
      showToast('Connection request sent!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send connection request', 'error');
    }
  };

  const handleRespondClick = async (connectionId, status) => {
    try {
      await api.put(`/connections/${connectionId}`, { status });
      const connRes = await api.get('/connections/me');
      setConnections(connRes.data);
      showToast(`Connection request ${status}!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not respond to request', 'error');
    }
  };

  const handleWithdrawClick = async (connectionId) => {
    try {
      await api.delete(`/connections/${connectionId}`);
      const connRes = await api.get('/connections/me');
      setConnections(connRes.data);
      showToast('Connection request withdrawn.', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not withdraw request', 'error');
    }
  };

  const alumniCount = users.filter(u => u.role === 'alumni').length;
  const studentCount = users.filter(u => u.role === 'student').length;

  const renderConnectionButton = (u, variant = 'card') => {
    const connInfo = getConnectionInfo(u._id);
    const isSelf = u._id === user?._id;
    const isModal = variant === 'modal';
    const btnClass = isModal ? 'dir-modal-action-btn' : 'dir-card__cta';

    if (isSelf) {
      return <span className="dir-self-label">Your profile</span>;
    }
    if (!connInfo) {
      return (
        <button className={`${btnClass} dir-btn--connect`} onClick={(e) => { e.stopPropagation(); handleConnectClick(u._id); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Connect
        </button>
      );
    }
    if (connInfo.status === 'pending') {
      if (connInfo.fromUser === user?._id) {
        return (
          <div className="dir-respond-row" onClick={(e) => e.stopPropagation()}>
            <span className="dir-status-pill dir-status-pill--pending">Pending</span>
            <button
              className={`${btnClass} dir-btn--withdraw`}
              onClick={(e) => { e.stopPropagation(); handleWithdrawClick(connInfo.id); }}
              title="Withdraw pending connection request"
            >
              Withdraw
            </button>
          </div>
        );
      }
      return (
        <div className="dir-respond-row" onClick={(e) => e.stopPropagation()}>
          <button className={`${btnClass} dir-btn--accept`} onClick={() => handleRespondClick(connInfo.id, 'accepted')}>Accept</button>
          <button className={`${btnClass} dir-btn--ignore`} onClick={() => handleRespondClick(connInfo.id, 'rejected')}>Ignore</button>
        </div>
      );
    }
    if (connInfo.status === 'accepted') {
      return (
        <span className="dir-status-pill dir-status-pill--connected">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M20 6 9 17l-5-5"/></svg>
          Connected
        </span>
      );
    }
    return (
      <button className={`${btnClass} dir-btn--connect`} onClick={(e) => { e.stopPropagation(); handleConnectClick(u._id); }}>
        Connect
      </button>
    );
  };

  return (
    <div className="dir-page">
      {/* Hero */}
      <section className="dir-hero">
        <div className="dir-hero__content">
          <h1 className="dir-hero__title">Alumni Directory</h1>
          <p className="dir-hero__sub">Discover graduates and students across every batch and branch.</p>
        </div>
        <div className="dir-hero__stats">
          <div className="dir-stat">
            <span className="dir-stat__num">{users.length}</span>
            <span className="dir-stat__label">Total members</span>
          </div>
          <div className="dir-stat">
            <span className="dir-stat__num">{alumniCount}</span>
            <span className="dir-stat__label">Alumni</span>
          </div>
          <div className="dir-stat">
            <span className="dir-stat__num">{studentCount}</span>
            <span className="dir-stat__label">Students</span>
          </div>
        </div>
      </section>

      {/* Search & Filters Bar */}
      <form className="dir-filters" onSubmit={handleSearch}>
        <div className="dir-search-wrap">
          <svg className="dir-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="dir-search"
            name="search"
            placeholder="Search by name, bio, or skills..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="dir-filter-pills">
          <div className="dir-select-wrap">
            <select className="dir-select" name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <input
            className="dir-filter-input"
            name="batch"
            placeholder="Batch"
            value={filters.batch}
            onChange={handleFilterChange}
          />
          <input
            className="dir-filter-input"
            name="branch"
            placeholder="Branch"
            value={filters.branch}
            onChange={handleFilterChange}
          />
          <button type="submit" className="dir-search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </form>

      {/* Content */}
      <section className="dir-content">
        {loading ? (
          <div className="dir-loading">
            <div className="dir-spinner"></div>
            <p>Loading directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="dir-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h3>No results found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="dir-grid">
            {users.map((u) => {
              const connInfo = getConnectionInfo(u._id);
              const isSelf = u._id === user?._id;
              const isConnected = connInfo?.status === 'accepted';

              return (
                <div key={u._id} className="dir-card" onClick={() => setSelectedUser(u)}>
                  <div className="dir-card__top">
                    <div className="dir-card__avatar">
                      {u.avatarUrl || u.profilePicture ? (
                        <img src={u.avatarUrl || u.profilePicture} alt={u.name} />
                      ) : (
                        <span>{u.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="dir-card__role-badge">
                      {u.role === 'alumni' ? 'Alumni' : 'Student'}
                    </div>
                  </div>

                  <div className="dir-card__body">
                    <h3 className="dir-card__name">{u.name}</h3>
                    <p className="dir-card__subtitle">
                      {u.role === 'alumni'
                        ? [u.designation, u.company ? `at ${u.company}` : ''].filter(Boolean).join(' ') || 'Alumni'
                        : [u.branch, u.batch ? `Batch ${u.batch}` : ''].filter(Boolean).join(' · ') || 'Student'}
                    </p>
                    {u.location && (
                      <span className="dir-card__location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {u.location}
                      </span>
                    )}
                  </div>

                  {u.bio && <p className="dir-card__bio">{u.bio}</p>}

                  <div className="dir-card__tags">
                    {u.batch && <span className="dir-tag">Batch {u.batch}</span>}
                    {u.branch && <span className="dir-tag">{u.branch}</span>}
                    {u.isMentor && <span className="dir-tag dir-tag--mentor">Mentor</span>}
                  </div>

                  <div className="dir-card__footer" onClick={(e) => e.stopPropagation()}>
                    {renderConnectionButton(u, 'card')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <FaqSection
        title="Directory FAQs"
        faqs={[
          {
            question: "How can I connect with an alumnus?",
            answer: "You can click the 'Connect' button on their card to send a request. Once accepted, their email will be visible to you."
          },
          {
            question: "What is the difference between a student and an alumnus profile?",
            answer: "Alumni profiles showcase their graduation year, current company, designation, and mentorship availability, while student profiles focus on current studies, branch, and batch."
          },
          {
            question: "Can I filter members by graduation year or department?",
            answer: "Yes, use the Batch and Branch filter options in the toolbar to find members from specific cohorts or departments."
          },
          {
            question: "How do I update my profile details?",
            answer: "Go to the Profile section from the top right user menu to edit your details, LinkedIn, GitHub, and bio."
          }
        ]}
      />

      {/* Profile Modal */}
      {selectedUser && createPortal(
        <div className="dir-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="dir-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dir-modal__close" onClick={() => setSelectedUser(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            <div className="dir-modal__body">
              {/* Left column */}
              <div className="dir-modal__left">
                <div className="dir-modal__avatar">
                  {selectedUser.avatarUrl || selectedUser.profilePicture ? (
                    <img src={selectedUser.avatarUrl || selectedUser.profilePicture} alt={selectedUser.name} />
                  ) : (
                    <span>{selectedUser.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="dir-modal__socials">
                  {selectedUser.linkedinUrl && (
                    <a href={selectedUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="dir-social-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {selectedUser.githubUrl && (
                    <a href={selectedUser.githubUrl} target="_blank" rel="noopener noreferrer" className="dir-social-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {!selectedUser.linkedinUrl && !selectedUser.githubUrl && (
                    <p className="dir-no-socials">No social links added</p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="dir-modal__right">
                <span className="dir-modal__role-tag">{selectedUser.role}</span>
                <h2 className="dir-modal__name">{selectedUser.name}</h2>
                <p className="dir-modal__designation">
                  {selectedUser.role === 'alumni' ? `${selectedUser.designation || 'Alumnus'} ${selectedUser.company ? `at ${selectedUser.company}` : ''}` : `Student · ${selectedUser.branch || ''}`}
                </p>

                <div className="dir-modal__meta-row">
                  {selectedUser.location && (
                    <span className="dir-modal__meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {selectedUser.location}
                    </span>
                  )}
                  {selectedUser.batch && (
                    <span className="dir-modal__meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      Batch {selectedUser.batch}{selectedUser.branch ? ` · ${selectedUser.branch}` : ''}
                    </span>
                  )}
                </div>

                {selectedUser.bio && (
                  <div className="dir-modal__section">
                    <h4>About</h4>
                    <p>{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.skills?.length > 0 && (
                  <div className="dir-modal__section">
                    <h4>Skills</h4>
                    <div className="dir-modal__skills">
                      {selectedUser.skills.map((s) => <span key={s} className="dir-tag">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Connection panel */}
                <div className="dir-modal__conn-panel">
                  {renderConnectionButton(selectedUser, 'modal')}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
