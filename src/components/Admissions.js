import { t } from '../data/i18n.js';
import { schoolInfo } from '../data/schoolData.js';

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
            <h4 class="step-title">${st.title}</h4>
            <p class="step-desc">${st.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Application CTA Card -->
      <div class="admissions-cta-banner">
        <div class="admissions-cta-content">
          <div class="badge badge-gold">${t('adm_banner_badge')}</div>
          <h3 class="admissions-cta-title">${t('adm_banner_title')}</h3>
          <p class="admissions-cta-desc">${t('adm_banner_desc')}</p>
        </div>

        <div class="admissions-cta-actions">
          <button class="btn btn-primary start-application-btn">
            <span>${t('btn_start_app')}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          
          <a class="btn btn-glass schedule-tour-btn"
             href="mailto:${schoolInfo.admissionsEmail}?subject=${encodeURIComponent('School tour request')}&body=${encodeURIComponent('Hello, I would like to book a visit to the school.\n\nPreferred date and time:\nNumber of visitors:\nPhone number:')}">
            <span>${t('btn_book_tour')}</span>
          </a>
        </div>
      </div>
    </div>
  `;

  section.querySelector('.start-application-btn').addEventListener('click', onOpenApplyModal);

  return section;
}
