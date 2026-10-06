import { newsAndEvents as defaultNews } from '../data/schoolData.js';
import { fetchNewsAndEvents } from '../data/api.js';
import { t } from '../data/i18n.js';

export function createNewsEvents() {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'news';
  section.style.backgroundColor = 'var(--gray-100)';

  function renderNews(items) {
    section.innerHTML = `
      <div class="container">
        <div class="section-header">
          <div class="badge badge-gold">${t('news_badge')}</div>
          <h2 class="section-title">${t('news_title')}</h2>
          <p class="section-subtitle">${t('news_subtitle')}</p>
        </div>

        <div class="news-grid">
          ${items.map(item => `
            <div class="news-card">
              <div class="news-date-badge">
                <span class="day">${escapeHtml(item.date.day)}</span>
                <span class="month">${escapeHtml(item.date.month)}</span>
                <span style="font-size: 0.75rem; opacity: 0.8;">${escapeHtml(item.date.year)}</span>
              </div>

              <div class="news-content">
                <div class="news-meta">
                  <span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; margin-bottom: 0;">${escapeHtml(item.category)}</span>
                  <span>• ${escapeHtml(item.time)}</span>
                </div>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--navy);">${escapeHtml(item.title)}</h3>
                <p style="font-size: 0.88rem; color: var(--gray-600); margin-bottom: 1rem;">${escapeHtml(item.summary)}</p>
                
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--gray-500); font-weight: 500;">
                  <span>📍 ${escapeHtml(item.location)}</span>
                  <button class="read-news-btn" data-index="${items.indexOf(item)}" style="color: var(--primary); font-weight: 700;">${t('news_read_more')}</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    section.querySelectorAll('.read-news-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = items[Number(btn.dataset.index)];
        const date = [item.date.day, item.date.month, item.date.year].filter(Boolean).join(' ');
        window.dispatchEvent(new CustomEvent('rpps-show-info', {
          detail: {
            title: item.title,
            meta: [date, item.time, item.location].filter(Boolean).join(' • '),
            // Full article when staff wrote one, otherwise the summary
            text: item.body ? `${item.summary}\n\n${item.body}` : item.summary
          }
        }));
      });
    });
  }

  // Render static defaults initially
  renderNews(defaultNews);

  // Fetch live API news from SQLite backend
  fetchNewsAndEvents().then(res => {
    if (res.success && res.newsAndEvents && res.newsAndEvents.length > 0) {
      renderNews(res.newsAndEvents);
    }
  });

  return section;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
