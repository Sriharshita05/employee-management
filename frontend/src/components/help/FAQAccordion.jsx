import { useState } from 'react';
import { Icons } from '../common/Icons';

function FAQAccordion({ items }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? null);

  if (items.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No matching questions.</p>;
  }

  return (
    <div className="faq-list">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="faq-question"
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              {item.question}
              <span className="chevron">
                <Icons.ChevronDown />
              </span>
            </button>
            {isOpen && <div className="faq-answer">{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default FAQAccordion;
