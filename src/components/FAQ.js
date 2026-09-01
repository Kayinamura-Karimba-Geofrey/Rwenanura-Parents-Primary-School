export function createFAQ() {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'faq';
  section.style.backgroundColor = 'var(--white)';

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
        <div class="badge">Frequently Asked Questions</div>
        <h2 class="section-title">Parent Information & FAQs</h2>
        <p class="section-subtitle">Find quick answers to common questions about RPPS admissions, academics, and campus life.</p>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; align-items: start; max-width: 1100px; margin: 0 auto;">
        
        <!-- Accordion Items -->
        <div class="faq-accordion" style="display: flex; flex-direction: column; gap: 1rem;">
          ${faqs.map((faq, idx) => `
            <div class="faq-item" style="border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden; transition: var(--transition);">
              <button class="faq-question" style="width: 100%; text-align: left; padding: 1.25rem 1.5rem; background: var(--gray-50); font-weight: 700; font-size: 1.05rem; color: var(--navy); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <span>${faq.q}</span>
                <span class="faq-icon" style="font-size: 1.2rem; transition: transform 0.3s ease; color: var(--primary);">+</span>
              </button>
              <div class="faq-answer" style="display: none; padding: 1.25rem 1.5rem; background: white; color: var(--gray-700); font-size: 0.95rem; line-height: 1.6; border-top: 1px solid var(--gray-200);">
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Download Prospectus Sidebar Card -->
        <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-md); text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📄</div>
          <h3 style="font-size: 1.35rem; color: white; margin-bottom: 0.5rem;">Download Official School Guide</h3>
          <p style="font-size: 0.88rem; color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; line-height: 1.5;">
            Get the full 2026 Rwenanura Parents Primary School prospectus including academic calendar, fee schedules, and school policies.
          </p>

          <button id="download-prospectus-btn" class="btn btn-gold" style="width: 100%;">
            📥 Download Prospectus (PDF)
          </button>
        </div>

      </div>
    </div>
  `;

  // Accordion toggle logic
  const items = section.querySelectorAll('.faq-item');
  items.forEach(item => {
    const qBtn = item.querySelector('.faq-question');
    const ans = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    qBtn.addEventListener('click', () => {
      const isOpen = ans.style.display === 'block';
      
      // Close all
      items.forEach(i => {
        i.querySelector('.faq-answer').style.display = 'none';
        i.querySelector('.faq-icon').textContent = '+';
        i.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        ans.style.display = 'block';
        icon.textContent = '−';
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  // Download Prospectus Button Handler
  const downloadBtn = section.querySelector('#download-prospectus-btn');
  downloadBtn.addEventListener('click', () => {
    alert('📄 Initializing official RPPS 2026 Academic Prospectus PDF download...');
  });

  return section;
}
