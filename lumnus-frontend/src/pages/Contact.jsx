import { useState } from 'react';
import './Contact.css';

const WEB3FORMS_ACCESS_KEY = 'a515a707-6428-4631-bb8c-2e860cd94902';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Please fill in name, email, and message fields.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('subject', form.subject || 'Contact from Lumnus');
      formData.append('message', form.message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-hero">
          <span className="contact-badge">Contact Us</span>
          <h1>Get in Touch with Lumnus</h1>
          <p className="contact-subtitle">
            Have questions about student onboarding, partnerships, or features? Send us a message and we'll reply shortly.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-card">
            {status === 'success' ? (
              <div className="contact-success">
                <div className="contact-success-icon">✅</div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you, {form.name}. Our support team will get back to you shortly at <strong>{form.email}</strong>.</p>
                <button type="button" className="btn-primary contact-submit-btn" onClick={handleReset}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                {status === 'error' && errorMsg && (
                  <div className="contact-error">{errorMsg}</div>
                )}

                <div className="form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder="e.g. Divya Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder="e.g. divya@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    placeholder="e.g. Campus Onboarding Query"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    placeholder="Describe your inquiry..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary contact-submit-btn"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Submit Form'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
