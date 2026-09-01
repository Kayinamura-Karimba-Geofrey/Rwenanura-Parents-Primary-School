import { admissionsSteps } from '../data/schoolData.js';

export function createAdmissions(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'admissions';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">Join Our Family</div>
        <h2 class="section-title">Admissions & How To Apply</h2>
        <p class="section-subtitle">We welcome prospective pupils for Nursery through Primary 6. We offer a transparent, supportive enrollment process for all families.</p>
      </div>

      <!-- Admissions Timeline -->
      <div class="admissions-timeline">
        ${admissionsSteps.map(st => `
          <div class="step-card">
            <div class="step-number">${st.step}</div>
            <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--navy);">${st.title}</h4>
            <p style="font-size: 0.88rem; color: var(--gray-600); line-height: 1.5;">${st.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Application CTA Card -->
      <div style="margin-top: 4rem; background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%); border-radius: var(--radius-lg); padding: 3rem; color: var(--white); display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; box-shadow: var(--shadow-lg);">
        <div style="max-width: 600px;">
          <div class="badge badge-gold" style="margin-bottom: 0.75rem;">Enrollment Open for 2026/2027 Academic Year</div>
          <h3 style="font-size: 2rem; color: var(--white); margin-bottom: 0.75rem;">Ready to Begin Your Child's Journey?</h3>
          <p style="color: var(--gray-300); font-size: 1rem;">Complete our easy online application or schedule an on-campus meeting with our Admissions Team today.</p>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-gold start-application-btn" style="padding: 1rem 2rem; font-size: 1.05rem;">
            <span>Start Online Application</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          
          <button class="btn btn-glass schedule-tour-btn" style="padding: 1rem 2rem;">
            <span>Book School Tour</span>
          </button>
        </div>
      </div>
    </div>
  `;

  section.querySelector('.start-application-btn').addEventListener('click', onOpenApplyModal);
  section.querySelector('.schedule-tour-btn').addEventListener('click', onOpenApplyModal);

  return section;
}
