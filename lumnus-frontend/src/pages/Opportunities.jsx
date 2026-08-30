import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Opportunities.css';
import FaqSection from '../components/FaqSection';

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ opportunity, onClose, onSuccess }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    email: user?.email || '',
    phone: '',
    resumeName: '',
    resumeData: '',
    resumeMime: '',
  });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setErr('Only PDF or Word documents (.doc, .docx) are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('File must be under 5 MB.');
      return;
    }
    setErr('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      // Strip the data URL prefix to keep only base64 content
      const base64 = ev.target.result.split(',')[1];
      setForm((f) => ({
        ...f,
        resumeName: file.name,
        resumeData: base64,
        resumeMime: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.email.trim()) {
      setErr('Email is required.');
      return;
    }
    setSending(true);
    try {
      await api.post(`/opportunities/${opportunity._id}/apply`, {
        email: form.email.trim(),
        phone: form.phone.trim(),
        resumeName: form.resumeName,
        resumeData: form.resumeData,
        resumeMime: form.resumeMime,
      });
      onSuccess();
    } catch (error) {
      setErr(error.response?.data?.message || 'Could not submit application.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="op-modal-overlay" onClick={onClose}>
      <div className="op-modal op-modal--apply" onClick={(e) => e.stopPropagation()}>
        <button className="op-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="op-modal__header">
          <div className="op-apply-icon">📋</div>
          <div>
            <h3 className="op-modal__title">Apply for {opportunity.title}</h3>
            <p className="op-modal__sub">at {opportunity.company}</p>
          </div>
        </div>

        {err && <div className="op-apply-error">{err}</div>}

        <form onSubmit={handleSubmit} className="op-modal__form">
          <div className="op-form-group">
            <label>
              Contact Email <span className="op-required">*</span>
            </label>
            <input
              className="op-input"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="op-form-group">
            <label>Phone number <span className="op-optional">(optional)</span></label>
            <input
              className="op-input"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="op-form-group">
            <label>Resume / CV <span className="op-optional">(optional · PDF or Word, max 5 MB)</span></label>
            <div
              className={`op-file-drop ${form.resumeName ? 'op-file-drop--selected' : ''}`}
              onClick={() => fileRef.current?.click()}
            >
              {form.resumeName ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="op-file-name">{form.resumeName}</span>
                  <button
                    type="button"
                    className="op-file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, resumeName: '', resumeData: '', resumeMime: '' });
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                  >✕</button>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <span>Click to upload your resume</span>
                  <span className="op-file-hint">PDF, DOC or DOCX</span>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div className="op-modal__footer">
            <button type="button" className="op-btn op-btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="op-btn op-btn--primary" disabled={sending}>
              {sending ? 'Submitting…' : '🚀 Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Applicants Panel (Alumni poster only) ────────────────────────────────────
function ApplicantsPanel({ opportunity, onClose }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/opportunities/${opportunity._id}/applicants`)
      .then((res) => setApplicants(res.data))
      .catch(() => setErr('Could not load applicants.'))
      .finally(() => setLoading(false));
  }, [opportunity._id]);

  // Download resume from base64
  const downloadResume = (applicant) => {
    if (!applicant.resumeData) return;
    const blob = b64toBlob(applicant.resumeData, applicant.resumeMime || 'application/pdf');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = applicant.resumeName || 'resume';
    a.click();
    URL.revokeObjectURL(url);
  };

  const b64toBlob = (b64, mimeType) => {
    const byteChars = atob(b64);
    const byteNums = Array.from(byteChars).map((c) => c.charCodeAt(0));
    return new Blob([new Uint8Array(byteNums)], { type: mimeType });
  };

  return (
    <div className="op-modal-overlay" onClick={onClose}>
      <div className="op-modal op-modal--applicants" onClick={(e) => e.stopPropagation()}>
        <button className="op-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="op-modal__header">
          <div className="op-apply-icon">👥</div>
          <div>
            <h3 className="op-modal__title">Applied Students</h3>
            <p className="op-modal__sub">{opportunity.title} · {opportunity.company}</p>
          </div>
        </div>

        {loading ? (
          <div className="op-applicants-loading">
            <div className="op-loader"></div>
            <p>Loading applicants…</p>
          </div>
        ) : err ? (
          <div className="op-apply-error">{err}</div>
        ) : applicants.length === 0 ? (
          <div className="op-applicants-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="op-applicants-list">
            {applicants.map((a, i) => (
              <div key={i} className="op-applicant-card">
                <div className="op-applicant__avatar">
                  {a.user?.avatarUrl ? (
                    <img src={a.user.avatarUrl} alt={a.user?.name} />
                  ) : (
                    <span>{(a.user?.name || a.email)?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="op-applicant__info">
                  <h4 className="op-applicant__name">
                    {a.user?.name || 'Student'}
                    {a.user?.batch && <span className="op-applicant__batch">Batch {a.user.batch}</span>}
                  </h4>
                  {a.user?.branch && <p className="op-applicant__college">LPU · {a.user.branch}</p>}

                  <div className="op-applicant__contacts">
                    <a className="op-contact-chip op-contact-chip--email" href={`mailto:${a.email}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {a.email}
                    </a>
                    {a.phone && (
                      <a className="op-contact-chip op-contact-chip--phone" href={`tel:${a.phone}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.4 2 2 0 0 1 3.69 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {a.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="op-applicant__actions">
                  {a.resumeData ? (
                    <button
                      className="op-cv-btn"
                      onClick={() => downloadResume(a)}
                      title="Download CV"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download CV
                    </button>
                  ) : (
                    <span className="op-no-cv">No CV</span>
                  )}
                  <span className={`op-status-badge op-status-badge--${a.status}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Opportunities() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAlumni = user?.role === 'alumni';

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);      // opportunity student is applying to
  const [applicantsTarget, setApplicantsTarget] = useState(null); // opportunity alumni is viewing
  const [form, setForm] = useState({
    title: '',
    company: '',
    type: 'job',
    location: '',
    description: '',
    applyLink: '',
  });

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (showForm || applyTarget || applicantsTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm, applyTarget, applicantsTarget]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/opportunities', form);
      setShowForm(false);
      setForm({ title: '', company: '', type: 'job', location: '', description: '', applyLink: '' });
      loadOpportunities();
      showToast('Opportunity posted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post opportunity', 'error');
    }
  };

  const filteredOpportunities = opportunities.filter((op) => {
    const matchesTab = typeFilter === '' || op.type === typeFilter;
    const matchesSearch =
      op.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // My postings (alumni only)
  const myPostings = isAlumni
    ? opportunities.filter((op) => String(op.postedBy?._id || op.postedBy) === String(user?._id))
    : [];

  const totalCount = opportunities.length;
  const jobsCount = opportunities.filter((o) => o.type === 'job').length;
  const internshipsCount = opportunities.filter((o) => o.type === 'internship').length;

  const getTabCount = (tabType) => {
    if (tabType === '') return opportunities.length;
    return opportunities.filter((o) => o.type === tabType).length;
  };

  return (
    <div className="op-page">
      {/* Hero Banner */}
      <section className="op-hero">
        <div className="op-hero__content">
          <h1 className="op-hero__title">Opportunities Hub</h1>
          <p className="op-hero__sub">
            Explore and apply to job openings and internships curated and shared by our alumni network.
          </p>
        </div>
        <div className="op-hero__stats">
          <div className="op-stat">
            <span className="op-stat__number">{totalCount}</span>
            <span className="op-stat__label">Total Openings</span>
          </div>
          <div className="op-stat">
            <span className="op-stat__number">{jobsCount}</span>
            <span className="op-stat__label">Jobs</span>
          </div>
          <div className="op-stat">
            <span className="op-stat__number">{internshipsCount}</span>
            <span className="op-stat__label">Internships</span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="op-toolbar">
        <div className="op-tabs">
          {[
            { id: '', label: 'All Postings' },
            { id: 'job', label: 'Jobs' },
            { id: 'internship', label: 'Internships' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`op-tab ${typeFilter === tab.id ? 'op-tab--active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
              <span className="op-tab__badge">{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        <div className="op-toolbar__actions">
          <div className="op-search-wrap">
            <svg className="op-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="op-search"
              placeholder="Search by role, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isAlumni && (
            <button className="op-btn op-btn--primary" onClick={() => setShowForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post an Opening
            </button>
          )}
        </div>
      </div>

      {/* Opportunity Cards */}
      {loading ? (
        <div className="op-loader-container">
          <div className="op-loader"></div>
        </div>
      ) : (
        <div className="op-grid">
          {filteredOpportunities.length === 0 ? (
            <div className="op-empty">
              <div className="op-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <path d="M12 11v6M9 14h6"/>
                </svg>
              </div>
              <h3 className="op-empty__title">No opportunities found</h3>
              <p className="op-empty__desc">Try resetting filters or check back later!</p>
              {isAlumni && (
                <button className="op-btn op-btn--outline" onClick={() => setShowForm(true)}>
                  Post the first opening
                </button>
              )}
            </div>
          ) : (
            filteredOpportunities.map((op) => {
              const hasApplied = op.applicants?.some(
                (a) => String(a.user?._id || a.user) === String(user?._id)
              );
              const isMyPosting = isAlumni && String(op.postedBy?._id || op.postedBy) === String(user?._id);

              return (
                <div key={op._id} className="op-card">
                  <div className="op-card__header">
                    <span className={`op-badge op-badge--${op.type || 'job'}`}>
                      {op.type === 'internship' ? 'Internship' : 'Job'}
                    </span>
                    {op.location && (
                      <span className="op-card__location-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ marginRight: '4px' }}>
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {op.location}
                      </span>
                    )}
                    {isMyPosting && (
                      <span className="op-my-posting-badge">Your posting</span>
                    )}
                  </div>

                  <div className="op-card__body">
                    <h3 className="op-card__title" title={op.title}>{op.title}</h3>
                    <h4 className="op-card__company">{op.company}</h4>
                    <p className="op-card__desc">{op.description}</p>
                  </div>

                  <div className="op-card__footer">
                    <div className="op-card__applicants">
                      <svg className="op-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                      <span>{op.applicants?.length || 0} applicants</span>
                    </div>

                    <div className="op-card__actions">
                      {/* Alumni poster — view applicants */}
                      {isMyPosting && (
                        <button
                          className="op-btn op-btn--sm op-btn--applicants"
                          onClick={() => setApplicantsTarget(op)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          View Applicants
                        </button>
                      )}

                      {/* External apply link */}
                      {op.applyLink ? (
                        <a
                          href={op.applyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="op-btn op-btn--sm op-btn--primary"
                        >
                          Apply Externally
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" style={{ marginLeft: '4px' }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
                          </svg>
                        </a>
                      ) : !isAlumni ? (
                        // Students apply via modal
                        <button
                          className={`op-btn op-btn--sm ${hasApplied ? 'op-btn--success' : 'op-btn--outline'}`}
                          onClick={() => !hasApplied && setApplyTarget(op)}
                          disabled={hasApplied}
                        >
                          {hasApplied ? (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12" style={{ marginRight: '4px' }}>
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                              Applied
                            </>
                          ) : 'Apply Now'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Alumni: Applied Students section (my postings summary) ── */}
      {isAlumni && myPostings.length > 0 && (
        <section className="op-my-postings-section">
          <h2 className="op-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Applied Students
          </h2>
          <p className="op-section-sub">Only you can see who applied to your postings.</p>

          <div className="op-postings-summary">
            {myPostings.map((op) => (
              <div key={op._id} className="op-posting-row">
                <div className="op-posting-row__info">
                  <span className={`op-badge op-badge--${op.type}`}>{op.type}</span>
                  <strong>{op.title}</strong>
                  <span className="op-posting-row__company">{op.company}</span>
                </div>
                <div className="op-posting-row__right">
                  <span className="op-posting-row__count">
                    {op.applicants?.length || 0} applied
                  </span>
                  <button
                    className="op-btn op-btn--sm op-btn--applicants"
                    onClick={() => setApplicantsTarget(op)}
                  >
                    View All →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FaqSection
        title="Opportunities FAQs"
        faqs={[
          {
            question: "Who can post job openings and internships?",
            answer: "Alumni can post openings by clicking the 'Post an Opening' button in the toolbar.",
          },
          {
            question: "What information do I need to apply?",
            answer: "Your contact email is required. Phone number and resume (PDF/Word) are optional but recommended.",
          },
          {
            question: "Can alumni see my application details?",
            answer: "Yes — only the alumni who posted the job can see your email, phone, and resume. Other users cannot see your application.",
          },
          {
            question: "Can students post opportunities?",
            answer: "No, currently only alumni can post opportunities to ensure they are verified listings from our professional network.",
          },
        ]}
      />

      {/* ── Modals ── */}
      {showForm && (
        <div className="op-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="op-modal" onClick={(e) => e.stopPropagation()}>
            <button className="op-modal__close" onClick={() => setShowForm(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="op-modal__header">
              <h3 className="op-modal__title">Post a new opportunity</h3>
              <p className="op-modal__sub">Share job openings or internship possibilities with current students and fellow alumni.</p>
            </div>

            <form onSubmit={handleCreate} className="op-modal__form">
              <div className="op-form-grid">
                <div className="op-form-group">
                  <label>Role Title</label>
                  <input className="op-input" name="title" placeholder="e.g. Software Engineer, Data Intern" value={form.title} onChange={handleChange} required />
                </div>
                <div className="op-form-group">
                  <label>Company</label>
                  <input className="op-input" name="company" placeholder="e.g. Google, Microsoft, Startup" value={form.company} onChange={handleChange} required />
                </div>
              </div>
              <div className="op-form-grid">
                <div className="op-form-group">
                  <label>Opportunity Type</label>
                  <select className="op-select" name="type" value={form.type} onChange={handleChange}>
                    <option value="job">Full-time Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="op-form-group">
                  <label>Location</label>
                  <input className="op-input" name="location" placeholder="e.g. Remote, Bangalore, New York" value={form.location} onChange={handleChange} />
                </div>
              </div>
              <div className="op-form-group">
                <label>Description</label>
                <textarea className="op-textarea" name="description" placeholder="Provide role responsibilities, requirements, qualifications..." rows={4} value={form.description} onChange={handleChange} required />
              </div>
              <div className="op-form-group">
                <label>Application Link (Optional)</label>
                <input className="op-input" name="applyLink" placeholder="https://company-careers-portal.com/job/123" value={form.applyLink} onChange={handleChange} />
              </div>
              <div className="op-modal__footer">
                <button type="button" className="op-btn op-btn--outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="op-btn op-btn--primary">Post Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {applyTarget && (
        <ApplyModal
          opportunity={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={() => { setApplyTarget(null); loadOpportunities(); }}
        />
      )}

      {applicantsTarget && (
        <ApplicantsPanel
          opportunity={applicantsTarget}
          onClose={() => setApplicantsTarget(null)}
        />
      )}
    </div>
  );
}
