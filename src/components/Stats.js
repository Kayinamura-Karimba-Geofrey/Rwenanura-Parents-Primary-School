import { quickStats } from '../data/schoolData.js';
import { t } from '../data/i18n.js';
import { onCleanup } from '../utils/lifecycle.js';

export function createStats() {
  const container = document.createElement('div');
  container.className = 'container';

  const localizedStats = [
    { value: t('stat_pass_rate'), label: t('stat_pass_label'), desc: t('stat_pass_desc') },
    { value: t('stat_pupils'), label: t('stat_pupils_label'), desc: t('stat_pupils_desc') },
    { value: t('stat_teachers'), label: t('stat_teachers_label'), desc: t('stat_teachers_desc') },
    { value: t('stat_ratio'), label: t('stat_ratio_label'), desc: t('stat_ratio_desc') }
  ];

  container.innerHTML = `
    <div class="stats-section">
      <div class="stats-grid">
        ${localizedStats.map(stat => `
          <div class="stat-card">
            <h3 class="stat-value" data-target="${stat.value}">${stat.value}</h3>
            <p class="stat-label">${stat.label}</p>
            <p class="stat-desc">${stat.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Animated Counter Effect on Scroll
  const statValues = container.querySelectorAll('.stat-value');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statValues.forEach(el => {
          const raw = el.dataset.target;
          const match = raw.match(/(\d+)/);
          if (match) {
            const targetNum = parseInt(match[1], 10);
            const prefix = raw.substring(0, raw.indexOf(match[1]));
            const suffix = raw.substring(raw.indexOf(match[1]) + match[1].length);
            
            let current = 0;
            const step = Math.max(1, Math.floor(targetNum / 40));
            const timer = setInterval(() => {
              current += step;
              if (current >= targetNum) {
                current = targetNum;
                clearInterval(timer);
              }
              el.textContent = `${prefix}${current}${suffix}`;
            }, 30);
          }
        });
      }
    });
  }, { threshold: 0.3 });
  onCleanup(() => observer.disconnect());

  observer.observe(container);

  return container;
}
