import './Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="legal-last-updated">Last Updated: July 18, 2026</p>

        <section className="legal-section">
          <h2>1. Terms of Use</h2>
          <p>
            By accessing Lumnus, you agree to comply with these terms, all applicable laws, and agree that you are responsible for compliance with any local regulations.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Membership eligibility</h2>
          <p>
            Only verified students, graduates, and staff of the institution are eligible to join the network. Accounts found using fake credentials will be suspended.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Member Conduct</h2>
          <p>
            You agree not to post spam, advertisement bulletins, or engage in abusive behavior during mentorship video calls or mock interviews. Respectful communication is mandatory.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Limitations of Liability</h2>
          <p>
            Lumnus provides platform tools for communication but is not responsible for external agreements, mentorship outcomes, or terms established between individual users.
          </p>
        </section>
      </div>
    </div>
  );
}
