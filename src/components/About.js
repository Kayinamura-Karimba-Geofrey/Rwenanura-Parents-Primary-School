import { schoolInfo } from '../data/schoolData.js';
import { t } from '../data/i18n.js';

export function createAbout() {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'about';
  section.style.backgroundColor = 'var(--gray-100)';

  const values = [
    {
      title: t('val_integrity'),
      description: t('val_integrity_desc')
    },
    {
      title: t('val_excellence'),
      description: t('val_excellence_desc')
    },
    {
      title: t('val_inclusivity'),
      description: t('val_inclusivity_desc')
    },
    {
      title: t('val_innovation'),
      description: t('val_innovation_desc')
    },
    {
      title: t('val_community'),
      description: t('val_community_desc')
    }
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge badge-gold">${t('about_badge')}</div>
        <h2 class="section-title">${t('about_title')}</h2>
        <p class="section-subtitle">${t('about_p1')}</p>
      </div>

      <div class="about-wrapper">
        <!-- Headteacher's Welcome Card -->
        <div class="headteacher-card">
          <div class="headteacher-profile">
            <img src="${schoolInfo.headteacher.image}" alt="${schoolInfo.headteacher.name}" class="headteacher-img" />
            <div>
              <h3 style="font-size: 1.3rem; color: var(--navy);">${t('headteacher_name', schoolInfo.headteacher.name)}</h3>
              <p style="color: var(--gold); font-weight: 600; font-size: 0.85rem;">${t('headteacher_title', schoolInfo.headteacher.title)}</p>
            </div>
          </div>
          
          <blockquote style="font-style: italic; color: var(--gray-700); line-height: 1.7; font-size: 1rem; position: relative;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="color: var(--primary-subtle); position: absolute; top: -10px; left: -10px; z-index: 0; opacity: 0.8;"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            <span style="position: relative; z-index: 1;">"${t('headteacher_quote')}"</span>
          </blockquote>

          <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem;">
            <div style="font-weight: 700; color: var(--primary); font-size: 0.9rem;">"${t('footer_motto')}"</div>
          </div>
        </div>

        <!-- Core Values Column -->
        <div>
          <h3 style="font-size: 1.8rem; margin-bottom: 1rem; color: var(--navy);">${t('about_pillars_title')}</h3>
          <p style="color: var(--gray-600); margin-bottom: 1.5rem;">${t('about_pillars_desc')}</p>

          <div class="values-grid">
            ${values.map(val => `
              <div class="value-item">
                <div class="value-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--navy);">${val.title}</h4>
                <p style="font-size: 0.85rem; color: var(--gray-600); line-height: 1.5;">${val.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}
