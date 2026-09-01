import { quickStats } from '../data/schoolData.js';

export function createStats() {
  const container = document.createElement('div');
  container.className = 'container';

  container.innerHTML = `
    <div class="stats-section">
      <div class="stats-grid">
        ${quickStats.map(stat => `
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

  observer.observe(container);

  return container;
}
