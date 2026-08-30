import { useToast } from '../context/ToastContext';
import './Careers.css';

const JOB_LISTINGS = [
  {
    title: 'Senior Frontend Engineer (React)',
    type: 'Full-time',
    location: 'Remote (India)',
    department: 'Engineering',
    description: 'We are looking for a React expert to help us build smooth, high-fidelity UI elements, interactions, and features.'
  },
  {
    title: 'Full Stack Developer (Node.js & React)',
    type: 'Full-time',
    location: 'Remote (India)',
    department: 'Engineering',
    description: 'Help us scale our backend endpoints, database systems, and integrate virtual tools like Google Meet.'
  },
  {
    title: 'Community Manager',
    type: 'Part-time / Internship',
    location: 'Remote',
    department: 'Growth & Relations',
    description: 'Help us grow our campus networks, coordinate homecoming calls, and onboard university cohorts.'
  }
];

export default function Careers() {
  const { showToast } = useToast();

  const handleApply = (title) => {
    showToast(`Thank you for your interest in the "${title}" role. Please send your resume to careers@lumnus.com.`, 'info');
  };

  return (
    <div className="careers-page">
      <div className="careers-container">
        <div className="careers-hero">
          <span className="careers-badge">Join Us</span>
          <h1>Build the Future of Alumni Networks</h1>
          <p className="careers-subtitle">
            We are a fully remote team building clean, premium tools to help students and alumni collaborate.
          </p>
        </div>

        <div className="careers-list">
          <h2>Open Opportunities</h2>
          <div className="jobs-grid">
            {JOB_LISTINGS.map((job, idx) => (
              <div key={idx} className="job-card">
                <div className="job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-tag">{job.type}</span>
                      <span className="job-tag">{job.location}</span>
                      <span className="job-tag">{job.department}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary job-apply-btn"
                    onClick={() => handleApply(job.title)}
                  >
                    Apply Now
                  </button>
                </div>
                <p className="job-description">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
