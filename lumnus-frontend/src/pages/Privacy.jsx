import './Legal.css';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="legal-last-updated">Last Updated: July 18, 2026</p>

        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly when creating your profile, syncing with LinkedIn, or scheduling events. This includes your name, email, company, role, batch year, and profile photo.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Data</h2>
          <p>
            Your profile details are shown in the alumni directory to help other members find and connect with you. We use your data to suggest mentorship matches and coordinate events.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Data Security & Storage</h2>
          <p>
            We implement security measures to protect your personal details. We do not sell or lease your personal information to third parties.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Third-Party Integrations</h2>
          <p>
            Our platform integrates with Google Meet for scheduling virtual meetings and LinkedIn for keeping profiles up to date. These services have their own independent privacy terms.
          </p>
        </section>
      </div>
    </div>
  );
}
