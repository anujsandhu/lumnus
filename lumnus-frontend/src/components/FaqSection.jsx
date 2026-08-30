import { useState } from 'react';

export default function FaqSection({ title, faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div className="faq-divider"></div>
      <section className="faq-container">
        <h2 className="faq-title">{title}</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                {faq.question}
                <span className="faq-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </span>
              </button>
              <div
                className="faq-answer-wrapper"
                style={{ maxHeight: isOpen ? '300px' : '0' }}
              >
                <div className="faq-answer">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
    </>
  );
}
