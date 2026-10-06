import { newsAndEvents as defaultNews } from '../data/schoolData.js';
import { fetchNewsAndEvents } from '../data/api.js';
import { t } from '../data/i18n.js';
import { escapeHtml } from '../utils/html.js';

export function createNewsEvents() {
  const section = document.createElement('section');
  section.className = 'section section-muted';
  section.id = 'news';

  // fromServer: items are real articles with a page at /news/:id
  function renderNews(items, fromServer = false) {
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
                <span class="year">${escapeHtml(item.date.year)}</span>
              </div>

              <div class="news-content">
                <div class="news-meta">
                  <span class="badge badge-sm">${escapeHtml(item.category)}</span>
                  <span>• ${escapeHtml(item.time)}</span>
                </div>
                <h3 class="news-title">${escapeHtml(item.title)}</h3>
                <p class="news-summary">${escapeHtml(item.summary)}</p>
                
                <div class="news-footer">
                  <span>📍 ${escapeHtml(item.location)}</span>
                  <button class="read-news-btn" data-index="${items.indexOf(item)}">${t('news_read_more')}</button>
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
            text: item.body ? `${item.summary}\n\n${item.body}` : item.summary,
            link: fromServer ? `/news/${item.id}` : null
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
      renderNews(res.newsAndEvents, true);
    }
  });

  return section;
}
