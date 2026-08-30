import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-hero">
          <span className="about-badge">Our Mission</span>
          <h1>Connecting Alumni & Prospects Globally</h1>
          <p className="about-subtitle">
            Lumnus is a professional network ecosystem designed to build strong connections between students, job seekers, and industry alumni.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon">
              <svg className="about-card-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </div>
            <h3>LinkedIn Sync</h3>
            <p>
              Keep your profile and career updates perfectly synchronized with LinkedIn to highlight roles and professional details automatically.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg className="about-card-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <h3>Virtual Meetings</h3>
            <p>
              Generate Google Meet links directly from the dashboard to conduct mock interviews, webinars, and batch reunions.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg className="about-card-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M16 8h2M16 12h2M8 8h5v6H8z"/>
              </svg>
            </div>
            <h3>News Bulletins</h3>
            <p>
              Stay updated with news highlights, alumni funding updates, promotions, and curated campus bulletins.
            </p>
          </div>
        </div>

        <div className="about-vision">
          <h2>Empowering Professional Growth</h2>
          <p>
            Whether you are a student looking for mentorship and job recommendations or an alumnus looking to give back, Lumnus provides a clean, solid, and reliable stack to make interaction effortless.
          </p>
        </div>
      </div>
    </div>
  );
}
