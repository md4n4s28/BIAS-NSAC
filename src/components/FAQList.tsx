import { useMemo, useState } from 'react';
import { faqs } from '../data/event';

const categories = ['All questions', ...new Set(faqs.map((faq) => faq.category))];

export default function FAQList({ interactive = false }: { interactive?: boolean }) {
  const [activeCategory, setActiveCategory] = useState('All questions');
  const visibleFaqs = useMemo(() => {
    return faqs.filter((faq) => activeCategory === 'All questions' || faq.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={`faq-explorer ${interactive ? 'faq-explorer-interactive' : ''}`}>
      {interactive && (
        <div className="faq-controls">
          <div className="faq-category-list" aria-label="Filter questions by topic">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                type="button"
                key={category}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="faq-list">
        {visibleFaqs.map((faq, index) => (
          <details className="faq-item" key={faq.question}>
            <summary>
              <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="faq-question">
                {interactive && <small>{faq.category}</small>}
                <strong>{faq.question}</strong>
              </span>
              <span className="faq-plus" aria-hidden="true">+</span>
            </summary>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
        {visibleFaqs.length === 0 && (
          <div className="faq-empty-state">
            <h3>No questions in this topic</h3>
            <p>Choose another topic to browse its questions.</p>
          </div>
        )}
      </div>
      {interactive && (
        <p className="faq-result-count" aria-live="polite">
          Showing {visibleFaqs.length} of {faqs.length} questions
        </p>
      )}
    </div>
  );
}
