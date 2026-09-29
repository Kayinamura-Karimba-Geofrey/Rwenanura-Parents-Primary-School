import { t } from '../data/i18n.js';

export function createAdmissions(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'admissions';

  const steps = [
    {
      step: '01',
      title: t('adm_step1_title'),
      desc: t('adm_step1_desc')
    },
    {
      step: '02',
      title: t('adm_step2_title'),
      desc: t('adm_step2_desc')
    },
    {
      step: '03',
      title: t('adm_step3_title'),
      desc: t('adm_step3_desc')
    }
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">${t('adm_badge')}</div>
        <h2 class="section-title">${t('adm_title')}</h2>
        <p class="section-subtitle">${t('adm_subtitle')}</p>
      </div>

      <!-- Admissions Timeline -->
      <div class="admissions-timeline">
        ${steps.map(st => `
          <div class="step-card">
            <div class="step-number">${st.step}</div>
            <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--navy);">${st.title}</h4>
            <p style="font-size: 0.88rem; color: var(--gray-600); line-height: 1.5;">${st.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Application CTA Card -->
      <div style="margin-top: 4rem; background: var(--navy); border: 1px solid var(--navy-light); border-radius: var(--radius-lg); padding: 3rem; color: var(--white); display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; box-shadow: var(--shadow-lg);">
        <div style="max-width: 600px;">
          <div class="badge badge-gold" style="margin-bottom: 0.75rem;">${t('adm_banner_badge')}</div>
          <h3 style="font-size: 2rem; color: var(--white); margin-bottom: 0.75rem;">${t('adm_banner_title')}</h3>
          <p style="color: var(--gray-300); font-size: 1rem;">${t('adm_banner_desc')}</p>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-gold start-application-btn" style="padding: 1rem 2rem; font-size: 1.05rem;">
            <span>${t('btn_start_app')}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          
          <button class="btn btn-glass schedule-tour-btn" style="padding: 1rem 2rem;">
            <span>${t('btn_book_tour')}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  section.querySelector('.start-application-btn').addEventListener('click', onOpenApplyModal);
  section.querySelector('.schedule-tour-btn').addEventListener('click', onOpenApplyModal);

  return section;
}
