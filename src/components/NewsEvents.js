import { newsAndEvents } from '../data/schoolData.js';

export function createNewsEvents() {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'news';
  section.style.backgroundColor = 'var(--gray-100)';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge badge-gold">Stay Updated</div>
        <h2 class="section-title">What's Happening at RPPS</h2>
        <p class="section-subtitle">Keep up with recent school achievements, upcoming academic events, sports competitions, and parent announcements.</p>
      </div>

      <div class="news-grid">
        ${newsAndEvents.map(item => `
          <div class="news-card">
            <div class="news-date-badge">
              <span class="day">${item.date.day}</span>
              <span class="month">${item.date.month}</span>
              <span style="font-size: 0.75rem; opacity: 0.8;">${item.date.year}</span>
            </div>

            <div class="news-content">
              <div class="news-meta">
                <span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; margin-bottom: 0;">${item.category}</span>
                <span>• ${item.time}</span>
              </div>
              <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--navy);">${item.title}</h3>
              <p style="font-size: 0.88rem; color: var(--gray-600); margin-bottom: 1rem;">${item.summary}</p>
              
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--gray-500); font-weight: 500;">
                <span>📍 ${item.location}</span>
                <button class="read-news-btn" style="color: var(--primary); font-weight: 700;">Read More →</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach read more alerts
  const btns = section.querySelectorAll('.read-news-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      alert("Full news story details and photo gallery are available on our school bulletin board!");
    });
  });

  return section;
}
