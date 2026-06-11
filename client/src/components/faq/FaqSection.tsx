'use client';

import { useState } from 'react';
import { Search, X, ChevronDown, HelpCircle } from 'lucide-react';
import styles from '@/app/(public)/faq/faq.module.css';
import { FAQ_GROUPS as groups, FAQ_SEARCH_UI } from '@/data/faq';

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

export function FaqSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const trimmedQuery = searchQuery.trim();

  const filteredGroups = groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!trimmedQuery) return true;
      const q = trimmedQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.searchText.toLowerCase().includes(q)
      );
    }),
  })).filter(group => group.items.length > 0);

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const showNoResults = trimmedQuery.length > 0 && totalVisible === 0;

  function handleSearch(value: string) {
    setSearchQuery(value);
    setOpenItemId(null);
  }

  function toggle(id: string) {
    setOpenItemId(prev => (prev === id ? null : id));
  }

  return (
    <>
      {/* SEARCH BAR */}
      <div className={`${styles.searchArea}`} style={{ background: 'var(--neutral-50)' }}>
        <div className="container">
          <div className={styles.searchWrap} role="search">
            <span className={styles.searchIc} aria-hidden="true">
              <Search size={18} />
            </span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder={FAQ_SEARCH_UI.placeholder}
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              aria-label={FAQ_SEARCH_UI.inputAriaLabel}
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery.length > 0 && (
              <button
                className={styles.searchClear}
                onClick={() => handleSearch('')}
                aria-label={FAQ_SEARCH_UI.clearAriaLabel}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div
            className={styles.searchAnnounce}
            aria-live="polite"
            aria-atomic="true"
          >
            {trimmedQuery.length > 0 && !showNoResults
              ? `${totalVisible} question${totalVisible !== 1 ? 's' : ''} found`
              : null}
          </div>
        </div>
      </div>

      {/* FAQ ACCORDION */}
      <section className={`${styles.faqSection} bg-50`}>
        <div className="container">
          <div className={styles.faqInner}>

            {showNoResults && (
              <div className={styles.noResults}>
                <div className={styles.nrIcon}>
                  <HelpCircle size={40} />
                </div>
                <p>
                  No results for <strong>&ldquo;{trimmedQuery}&rdquo;</strong>.
                  Try different keywords or{' '}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)', fontWeight: 600, padding: 0, fontSize: 'inherit' }}
                    onClick={() => handleSearch('')}
                  >
                    clear the search
                  </button>.
                </p>
              </div>
            )}

            {filteredGroups.map(group => (
              <div key={group.id} className={styles.faqGroup}>
                <div className={styles.faqGroupHeader}>
                  <h2>{group.heading}</h2>
                  <span className={styles.groupTag} aria-label={`${group.items.length} questions`}>
                    {group.items.length}
                  </span>
                </div>

                <div className={styles.faqList} role="list">
                  {group.items.map(item => {
                    const isOpen = openItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={styles.faqItem}
                        role="listitem"
                      >
                        <h3 className={styles.faqHeading}>
                          <button
                            type="button"
                            id={`faq-trigger-${item.id}`}
                            className={styles.faqTrigger}
                            aria-expanded={isOpen}
                            aria-controls={`faq-body-${item.id}`}
                            onClick={() => toggle(item.id)}
                          >
                            <span className={isOpen ? `${styles.faqQ} ${styles.faqQOpen}` : styles.faqQ}>
                              {highlightText(item.question, trimmedQuery)}
                            </span>
                            <ChevronDown
                              className={isOpen ? `${styles.faqChev} ${styles.faqChevOpen}` : styles.faqChev}
                              size={20}
                              aria-hidden="true"
                            />
                          </button>
                        </h3>
                        <div
                          className={isOpen ? `${styles.faqBody} ${styles.faqBodyOpen}` : styles.faqBody}
                          id={`faq-body-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${item.id}`}
                          inert={!isOpen}
                        >
                          <div className={styles.faqBodyInner}>
                            <div className={styles.faqAnswer}>{item.answerJsx}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </>
  );
}
