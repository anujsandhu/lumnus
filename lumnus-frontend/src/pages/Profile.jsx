import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ImageAdjustModal from '../components/ImageAdjustModal';
import './Profile.css';

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80&auto=format&fit=crop';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0052cc&color=fff&size=128&bold=true&name=';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:            user?.name             || '',
    role:            user?.role             || 'student',
    batch:           user?.batch            || '',
    branch:          user?.branch           || '',
    company:         user?.company          || '',
    designation:     user?.designation      || '',
    location:        user?.location         || '',
    bio:             user?.bio              || '',
    skills:          (user?.skills          || []).join(', '),
    avatarUrl:       user?.avatarUrl        || '',
    resumeUrl:       user?.resumeUrl        || '',
    resumeName:      user?.resumeName       || '',
    linkedinUrl:     user?.linkedinUrl      || '',
    githubUrl:       user?.githubUrl        || '',
    isMentor:        user?.isMentor         || false,
    mentorExpertise: (user?.mentorExpertise || []).join(', '),
    isActive:        user?.isActive         !== false,
  });

  const [saved,           setSaved]           = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedCropFile,setSelectedCropFile]= useState(null);
  const [error,           setError]           = useState('');
  const [activeSection,   setActiveSection]   = useState('overview');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting,          setDeleting]          = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  /* ── Avatar File Select & Crop ── */
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds maximum limit of 5 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError('');
    setSelectedCropFile(file);
    e.target.value = ''; // Reset input
  };

  const handleApplyCroppedAvatar = async (croppedBlob) => {
    setSelectedCropFile(null);
    setUploadingAvatar(true);
    setError('');

    const formData = new FormData();
    formData.append('image', croppedBlob, 'avatar.jpg');

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAvatarUrl = res.data.url;
      setForm((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      const updatedUserRes = await api.put('/users/me', { avatarUrl: newAvatarUrl });
      setUser(updatedUserRes.data);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setError('');
    try {
      setForm((prev) => ({ ...prev, avatarUrl: '' }));
      const updatedUserRes = await api.put('/users/me', { avatarUrl: '' });
      setUser(updatedUserRes.data);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('Failed to remove avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ── Resume / CV Upload & Delete ── */
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5 MB max file size limit check
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume file size exceeds maximum limit of 5 MB.');
      return;
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
      setError('Invalid format. Only PDF, DOC, and DOCX files up to 5 MB are allowed.');
      return;
    }

    setUploadingResume(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newResumeUrl = res.data.url;
      const newResumeName = res.data.original_name || file.name;

      setForm((prev) => ({ ...prev, resumeUrl: newResumeUrl, resumeName: newResumeName }));

      const updatedUserRes = await api.put('/users/me', {
        resumeUrl: newResumeUrl,
        resumeName: newResumeName,
      });

      setUser(updatedUserRes.data);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload resume document.');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleRemoveResume = async () => {
    setUploadingResume(true);
    setError('');
    try {
      setForm((prev) => ({ ...prev, resumeUrl: '', resumeName: '' }));
      const updatedUserRes = await api.put('/users/me', { resumeUrl: '', resumeName: '' });
      setUser(updatedUserRes.data);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('Failed to remove resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    if (form.isMentor && !form.mentorExpertise.trim()) {
      setError('Please add your mentorship areas of expertise.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        skills:          form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        mentorExpertise: form.mentorExpertise.split(',').map((s) => s.trim()).filter(Boolean),
      };
      delete payload.role;

      const res = await api.put('/users/me', payload);
      setUser(res.data);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await api.delete('/users/me');
      logout();
      navigate('/login', { state: { infoMessage: 'Your account has been deleted successfully.' } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not delete account.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  /* ── Completeness ── */
  const requiredFields = [
    { key: 'name',     label: 'Full Name'  },
    { key: 'batch',    label: 'Batch'      },
    { key: 'branch',   label: 'Branch'     },
    { key: 'location', label: 'Location'   },
    { key: 'bio',      label: 'Bio'        },
    { key: 'skills',   label: 'Skills'     },
  ];
  if (user.role === 'alumni') {
    requiredFields.push({ key: 'company',     label: 'Company'     });
    requiredFields.push({ key: 'designation', label: 'Designation' });
  }
  const missingFields     = requiredFields.filter(f => !String(form[f.key] || '').trim());
  const isComplete        = missingFields.length === 0;
  const completenessPercent = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);
  const hasAboutInfo = !!(form.designation || form.company || form.branch || form.location || form.batch);

  const avatarSrc   = form.avatarUrl || `${DEFAULT_AVATAR}${encodeURIComponent(form.name || 'U')}`;
  const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);

  const navItems = [
    { id: 'overview',     label: 'Overview'       },
    { id: 'education',    label: 'Education'       },
    { id: 'professional', label: 'Professional'    },
    { id: 'links',        label: 'Links & Skills'  },
    ...(user.role === 'alumni' ? [{ id: 'mentorship', label: 'Mentorship' }] : []),
    { id: 'settings',     label: 'Account Settings' },
  ];

  /* Save button shared across sections */
  const SaveBtn = () => (
    <div className="profile-form-actions">
      <button type="submit" className="profile-save-btn" disabled={saving}>
        {saving
          ? <><span className="profile-spinner" />Saving…</>
          : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <div className="profile-page">
      {/* ── Image Adjustment Modal ── */}
      {selectedCropFile && (
        <ImageAdjustModal
          imageFile={selectedCropFile}
          onClose={() => setSelectedCropFile(null)}
          onApply={handleApplyCroppedAvatar}
        />
      )}

      {/* ── Banner ── */}
      <div className="profile-banner">
        <img src={DEFAULT_BANNER} alt="Profile banner" className="profile-banner__img" />
        <div className="profile-banner__overlay" />
      </div>

      {/* ── Body ── */}
      <div className="profile-body">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="profile-sidebar">

          {/* Avatar Container */}
          <div className="profile-sidebar__avatar-container">
            <div className="profile-sidebar__avatar-wrap">
              <img src={avatarSrc} alt={form.name} className="profile-sidebar__avatar" />
              <label className="profile-sidebar__avatar-upload-btn" title="Upload new photo">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  disabled={uploadingAvatar}
                  style={{ display: 'none' }}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{uploadingAvatar ? 'Uploading...' : 'Adjust / Upload'}</span>
              </label>
            </div>

            {form.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="profile-sidebar__avatar-remove-btn"
                title="Remove profile photo"
                disabled={uploadingAvatar}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Remove photo
              </button>
            )}
          </div>

          {/* White card */}
          <div className="profile-sidebar__card">
            <div className="profile-sidebar__name">{form.name || 'Your Name'}</div>
            <div className="profile-sidebar__role-badge">
              {form.role === 'alumni' ? '🎓 Alumni' : '📚 Student'}
            </div>

            {/* Status pill */}
            <span className={`profile-sidebar__status profile-sidebar__status--${isComplete ? 'ok' : 'warn'}`}>
              <span className="profile-sidebar__status-dot" />
              {isComplete ? 'Listed in Directory' : `${completenessPercent}% complete`}
            </span>

            {/* Toasts */}
            {saved && (
              <div className="profile-sidebar__toast profile-sidebar__toast--ok">✓ Saved successfully!</div>
            )}
            {error && (
              <div className="profile-sidebar__toast profile-sidebar__toast--err">⚠ {error}</div>
            )}

            {hasAboutInfo && (
              <>
                <div className="profile-sidebar__divider" />
                <div className="profile-sidebar__section-label">ABOUT</div>
                <ul className="profile-sidebar__info-list">
                  {form.designation && (
                    <li>
                      <span className="profile-sidebar__info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      </span>
                      <span className="profile-sidebar__info-text">{form.designation}</span>
                    </li>
                  )}
                  {form.company && (
                    <li>
                      <span className="profile-sidebar__info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </span>
                      <span className="profile-sidebar__info-text">{form.company}</span>
                    </li>
                  )}
                  {form.branch && (
                    <li>
                      <span className="profile-sidebar__info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </span>
                      <span className="profile-sidebar__info-text">{form.branch}</span>
                    </li>
                  )}
                  {form.location && (
                    <li>
                      <span className="profile-sidebar__info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      <span className="profile-sidebar__info-text">{form.location}</span>
                    </li>
                  )}
                  {form.batch && (
                    <li>
                      <span className="profile-sidebar__info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                      <span className="profile-sidebar__info-text">Batch {form.batch}</span>
                    </li>
                  )}
                </ul>
              </>
            )}

            <div className="profile-sidebar__divider" />

            {/* Contact */}
            <div className="profile-sidebar__section-label">CONTACT</div>
            <ul className="profile-sidebar__info-list">
              <li>
                <span className="profile-sidebar__info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <span className="profile-sidebar__info-text">{user?.email}</span>
              </li>
              {form.linkedinUrl && (
                <li>
                  <span className="profile-sidebar__info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  </span>
                  <a href={form.linkedinUrl} target="_blank" rel="noreferrer" className="profile-sidebar__info-link">LinkedIn</a>
                </li>
              )}
              {form.githubUrl && (
                <li>
                  <span className="profile-sidebar__info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  </span>
                  <a href={form.githubUrl} target="_blank" rel="noreferrer" className="profile-sidebar__info-link">GitHub</a>
                </li>
              )}
            </ul>

            {form.isMentor && (
              <>
                <div className="profile-sidebar__divider" />
                <span className="profile-sidebar__mentor-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Available as Mentor
                </span>
              </>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="profile-main">

          {/* Completeness warning */}
          {!isComplete && (
            <div className="profile-completeness-banner">
              <div className="profile-completeness-banner__info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                  <strong>Profile {completenessPercent}% complete</strong> — Fill in missing fields to appear in the directory.
                  <div className="profile-completeness-banner__missing">
                    Missing: {missingFields.map(f => f.label).join(' · ')}
                  </div>
                </div>
              </div>
              <div className="profile-completeness-banner__bar">
                <div className="profile-completeness-banner__fill" style={{ width: `${completenessPercent}%` }} />
              </div>
            </div>
          )}

          {/* Nav tabs */}
          <nav className="profile-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={`profile-nav__tab${activeSection === item.id ? ' profile-nav__tab--active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Form */}
          <form onSubmit={handleSubmit} className="profile-form-wrap">

            {/* ── OVERVIEW ── */}
            {activeSection === 'overview' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Overview</h2>
                  <p className="profile-section__sub">Your public-facing summary shown in the directory.</p>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Full Name</label>
                  <input className="profile-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sharma" required />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Bio / Introduction</label>
                  <textarea className="profile-input profile-textarea" name="bio" value={form.bio} onChange={handleChange} placeholder="Write a short introduction about yourself…" rows={4} maxLength={500} required />
                  <span className="profile-char-count">{500 - (form.bio?.length || 0)} characters remaining</span>
                </div>

                <div className="profile-field profile-field--readonly">
                  <label className="profile-label">Account Role</label>
                  <div className="profile-readonly-pill">{form.role === 'alumni' ? '🎓 Alumni' : '📚 Student'}</div>
                  <span className="profile-help">Role is locked after registration.</span>
                </div>

                {/* Resume / CV Section in Overview */}
                <div className="profile-resume-card">
                  <div className="profile-resume-head">
                    <div>
                      <h3 className="profile-resume-title">Resume / CV Document</h3>
                      <p className="profile-resume-sub">Upload your CV in PDF, DOC, or DOCX format (Max size: 5 MB).</p>
                    </div>
                    {form.resumeUrl && (
                      <span className="profile-resume-badge">Uploaded</span>
                    )}
                  </div>

                  {form.resumeUrl ? (
                    <div className="profile-resume-item">
                      <div className="profile-resume-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                      <div className="profile-resume-details">
                        <span className="profile-resume-name">{form.resumeName || 'Curriculum_Vitae.pdf'}</span>
                        <span className="profile-resume-limit-text">Max 5 MB · PDF / DOC / DOCX</span>
                      </div>
                      <div className="profile-resume-actions">
                        <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="profile-resume-btn download">
                          View / Download
                        </a>
                        <label className="profile-resume-btn replace">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeUpload}
                            disabled={uploadingResume}
                            style={{ display: 'none' }}
                          />
                          {uploadingResume ? 'Uploading...' : 'Replace'}
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="profile-resume-btn delete"
                          disabled={uploadingResume}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-resume-upload-box">
                      <label className="profile-resume-upload-area">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeUpload}
                          disabled={uploadingResume}
                          style={{ display: 'none' }}
                        />
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="32" height="32">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span className="upload-title">
                          {uploadingResume ? 'Uploading CV...' : 'Click to Upload CV / Resume'}
                        </span>
                        <span className="upload-desc">Supports PDF, DOC, DOCX up to 5 MB</span>
                      </label>
                    </div>
                  )}
                </div>

                <SaveBtn />
              </div>
            )}

            {/* ── EDUCATION ── */}
            {activeSection === 'education' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Education Details</h2>
                  <p className="profile-section__sub">Helps connect you with alumni and peers from the same batch.</p>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label className="profile-label">Graduation Batch <span className="profile-label__req">*</span></label>
                    <input className="profile-input" name="batch" value={form.batch} onChange={handleChange} placeholder="e.g. 2024" required />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">Branch / Department <span className="profile-label__req">*</span></label>
                    <input className="profile-input" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. Computer Science" required />
                  </div>
                </div>

                <SaveBtn />
              </div>
            )}

            {/* ── PROFESSIONAL ── */}
            {activeSection === 'professional' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Professional Details</h2>
                  <p className="profile-section__sub">
                    {user.role === 'alumni'
                      ? 'Required for alumni to be listed in the directory.'
                      : 'Optional for students — add if you are interning or working.'}
                  </p>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label className="profile-label">
                      Company / Organization
                      {user.role === 'alumni' && <span className="profile-label__req"> *</span>}
                    </label>
                    <input className="profile-input" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google, Amazon" required={user.role === 'alumni'} />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">
                      Designation / Job Role
                      {user.role === 'alumni' && <span className="profile-label__req"> *</span>}
                    </label>
                    <input className="profile-input" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" required={user.role === 'alumni'} />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Current Location <span className="profile-label__req">*</span></label>
                  <input className="profile-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, India" required />
                </div>

                <SaveBtn />
              </div>
            )}

            {/* ── LINKS & SKILLS ── */}
            {activeSection === 'links' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Links & Skills</h2>
                  <p className="profile-section__sub">Help others discover and connect with you.</p>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label className="profile-label">LinkedIn URL <span className="profile-label__opt">(optional)</span></label>
                    <input className="profile-input" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">GitHub URL <span className="profile-label__opt">(optional)</span></label>
                    <input className="profile-input" name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/username" />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Skills <span className="profile-label__req">*</span></label>
                  <input className="profile-input" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python, System Design" required />
                  <span className="profile-help">Comma-separated — these appear as tags on your directory card.</span>
                </div>

                {skillsArray.length > 0 && (
                  <div className="profile-skills-preview">
                    <label className="profile-label">Preview</label>
                    <div className="profile-skills-preview__tags">
                      {skillsArray.map((sk, i) => <span key={i} className="profile-skill-tag">{sk}</span>)}
                    </div>
                  </div>
                )}

                <SaveBtn />
              </div>
            )}

            {/* ── MENTORSHIP (Alumni only) ── */}
            {activeSection === 'mentorship' && user.role === 'alumni' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Mentorship Settings</h2>
                  <p className="profile-section__sub">Opt-in to guide current students as a mentor.</p>
                </div>

                <label className={`profile-toggle${form.isMentor ? ' profile-toggle--active' : ''}`}>
                  <input
                    type="checkbox"
                    name="isMentor"
                    checked={form.isMentor}
                    onChange={handleChange}
                    className="profile-toggle__input"
                  />
                  <div className="profile-toggle__track">
                    <div className="profile-toggle__thumb" />
                  </div>
                  <div className="profile-toggle__label">
                    <span className="profile-toggle__title">Available as Mentor</span>
                    <span className="profile-toggle__desc">
                      Your profile will appear in the Mentorship section so students can request sessions.
                    </span>
                  </div>
                </label>

                {form.isMentor && (
                  <div className="profile-field" style={{ marginTop: '20px' }}>
                    <label className="profile-label">Areas of Expertise <span className="profile-label__req">*</span></label>
                    <input
                      className="profile-input"
                      name="mentorExpertise"
                      value={form.mentorExpertise}
                      onChange={handleChange}
                      placeholder="Career Coaching, System Design, Resume Review"
                      required
                    />
                    <span className="profile-help">Comma-separated — students will see this when browsing mentors.</span>
                  </div>
                )}

                <SaveBtn />
              </div>
            )}

            {/* ── ACCOUNT SETTINGS ── */}
            {activeSection === 'settings' && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Account Settings</h2>
                  <p className="profile-section__sub">Manage your profile visibility and account status.</p>
                </div>

                <div className="profile-settings-group">
                  <h3 className="profile-settings-group__title">Profile Visibility</h3>
                  <p className="profile-settings-group__desc">
                    Control whether your profile is shown in the directory, mentors lists, and opportunities applicants.
                  </p>
                  
                  <label className={`profile-toggle${form.isActive ? ' profile-toggle--active' : ''}`}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="profile-toggle__input"
                    />
                    <div className="profile-toggle__track">
                      <div className="profile-toggle__thumb" />
                    </div>
                    <div className="profile-toggle__label">
                      <span className="profile-toggle__title">Show Profile (Active)</span>
                      <span className="profile-toggle__desc">
                        When unchecked, your profile is hidden from the directory, mentor recommendations, and other public areas. You can reactivate anytime.
                      </span>
                    </div>
                  </label>
                  
                  <SaveBtn />
                </div>

                <div className="profile-settings-group profile-settings-group--danger">
                  <h3 className="profile-settings-group__title">Danger Zone</h3>
                  <p className="profile-settings-group__desc">
                    Permanently delete your profile and all associated data. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setShowDeleteModal(true);
                    }}
                    className="profile-btn-danger"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </form>
        </main>
      </div>

      {/* ── Double Confirmation Delete Modal ── */}
      {showDeleteModal && (
        <div className="profile-delete-overlay">
          <div className="profile-delete-modal">
            <h3 className="profile-delete-modal__title">Delete Your Account?</h3>
            <p className="profile-delete-modal__desc">
              This will permanently delete your profile, connections, events, job opportunities, and mentorship requests.
              <strong> This action is irreversible.</strong>
            </p>
            <div className="profile-delete-modal__confirm-box">
              <label>Please type <span className="profile-delete-modal__code">DELETE</span> to confirm:</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="profile-input"
              />
            </div>
            <div className="profile-delete-modal__actions">
              <button
                type="button"
                className="profile-delete-modal__btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-delete-modal__btn-confirm"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
              >
                {deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
