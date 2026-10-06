import { t } from '../data/i18n.js';
import { schoolInfo } from '../data/schoolData.js';

export function createFAQ() {
  const section = document.createElement('section');
  section.className = 'section section-white';
  section.id = 'faq';

  const faqs = [
    {
      q: 'What documents are required for new pupil enrollment?',
      a: 'To complete admission registration, parents must submit: (1) Copy of the child\'s Birth Certificate, (2) Previous school report cards/transcripts (for Primary 2–6 transfers), (3) Two passport-size photos, and (4) Parent/Guardian National ID or Passport copy.'
    },
    {
      q: 'What are the official school hours for Nursery and Primary pupils?',
      a: 'Nursery classes run from 07:30 AM to 12:30 PM (Monday to Friday). Primary 1 to Primary 6 classes operate from 07:30 AM to 03:45 PM. Supervised after-school academic prep and sports clubs run until 05:00 PM.'
    },
    {
      q: 'How does Rwenanura Primary maintain a 100% PLE Pass Rate?',
      a: 'We combine rigorous REB curriculum coverage with weekly diagnostic assessments, intensive STEM & English literacy labs, small teacher-to-pupil ratios (24:1), and targeted weekend revision tutorials for candidate classes.'
    },
    {
      q: 'Is school bus transport available across Nyagatare District?',
      a: 'Yes, RPPS operates fleet buses covering Nyagatare Town, Rwenanura trading center, and surrounding residential communities with trained drivers and onboard pupil attendants.'
    },
    {
      q: 'What extracurricular clubs and ICT activities are offered?',
      a: 'Pupils participate in computer programming & robotics basics, French & English debate clubs, football, basketball, traditional Rwandan cultural dance troupe, and music & arts workshops.'
    }
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">${t('faq_badge')}</div>
        <h2 class="section-title">${t('faq_title')}</h2>
        <p class="section-subtitle">${t('faq_subtitle')}</p>
      </div>

      <div class="faq-layout-grid">
        
        <!-- Accordion Items -->
        <div class="faq-accordion">
          ${faqs.map((faq, idx) => `
            <div class="faq-item">
              <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${idx}" id="faq-question-${idx}">
                <span>${faq.q}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer" id="faq-answer-${idx}" role="region" aria-labelledby="faq-question-${idx}" hidden>
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Download Prospectus Sidebar Card -->
        <div class="faq-prospectus-card">
          <div class="faq-prospectus-icon" aria-hidden="true">📄</div>
          <h3 class="faq-prospectus-title">${t('faq_guide_title')}</h3>
          <p class="faq-prospectus-desc">
            ${t('faq_guide_desc')}
          </p>

          <a id="download-prospectus-btn" class="btn btn-primary btn-block"
             href="mailto:${schoolInfo.admissionsEmail}?subject=${encodeURIComponent('Prospectus request')}">
            📧 ${t('faq_guide_request_btn', 'Request the Prospectus by Email')}
          </a>
        </div>

      </div>
    </div>
  `;

  // Accordion toggle logic
  const items = section.querySelectorAll('.faq-item');
  items.forEach(item => {
    const qBtn = item.querySelector('.faq-question');

    qBtn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      // Only one answer open at a time
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').hidden = true;
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-icon').textContent = '+';
      });

      if (!wasOpen) {
        item.classList.add('open');
        item.querySelector('.faq-answer').hidden = false;
        qBtn.setAttribute('aria-expanded', 'true');
        item.querySelector('.faq-icon').textContent = '−';
      }
    });
  });

  // Offer the PDF only if it has actually been published (public/prospectus.pdf);
  // otherwise keep the "request by email" link.
  const prospectusLink = section.querySelector('#download-prospectus-btn');
  const pdfUrl = schoolInfo.links.prospectusPdf;
  if (pdfUrl) {
    fetch(pdfUrl, { method: 'HEAD' })
      .then(res => {
        if (res.ok && (res.headers.get('content-type') || '').includes('pdf')) {
          prospectusLink.href = pdfUrl;
          prospectusLink.setAttribute('download', 'RPPS-Prospectus.pdf');
          prospectusLink.textContent = `📥 ${t('faq_guide_btn')}`;
        }
      })
      .catch(() => { /* keep the email request link */ });
  }

  return section;
}
