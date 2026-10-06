import { campusFacilities } from '../data/schoolData.js';
import { t } from '../data/i18n.js';

export function createFacilities() {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'facilities';

  let activeCategory = 'All';

  const categories = ['All', 'Academic', 'Extracurricular', 'Wellness', 'Early Years'];

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">${t('fac_badge')}</div>
        <h2 class="section-title">${t('fac_title')}</h2>
        <p class="section-subtitle">${t('fac_subtitle')}</p>
      </div>

      <div class="facilities-tabs">
        ${categories.map(cat => `
          <button class="facility-tab-btn ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>
        `).join('')}
      </div>

      <div class="facilities-grid" id="facilities-container">
        ${renderFacilityCards(campusFacilities)}
      </div>
    </div>
  `;

  function renderFacilityCards(items) {
    return items.map(fac => `
      <div class="facility-card">
        <div class="facility-img">
          <img src="${fac.image}" alt="${fac.title}" loading="lazy" />
        </div>
        <div class="facility-content">
          <div class="badge badge-gold badge-sm">${fac.category}</div>
          <h4>${fac.title}</h4>
          <p>${fac.description}</p>
        </div>
      </div>
    `).join('');
  }

  // Filter tabs logic
  const tabBtns = section.querySelectorAll('.facility-tab-btn');
  const container = section.querySelector('#facilities-container');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = e.target.dataset.cat;

      const filtered = activeCategory === 'All'
        ? campusFacilities
        : campusFacilities.filter(f => f.category === activeCategory);

      container.innerHTML = renderFacilityCards(filtered);
    });
  });

  return section;
}
