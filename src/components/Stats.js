import { quickStats } from '../data/schoolData.js';

export function createStats() {
  const container = document.createElement('div');
  container.className = 'container';

  container.innerHTML = `
    <div class="stats-section">
      <div class="stats-grid">
        ${quickStats.map(stat => `
          <div class="stat-card">
            <h3>${stat.value}</h3>
            <p class="stat-label">${stat.label}</p>
            <p class="stat-desc">${stat.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return container;
}
