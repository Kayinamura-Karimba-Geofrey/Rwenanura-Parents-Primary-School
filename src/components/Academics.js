import { academicPrograms } from '../data/schoolData.js';

export function createAcademics(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'academics';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">Academic Pathways</div>
        <h2 class="section-title">World-Class Primary Education</h2>
        <p class="section-subtitle">Delivering a comprehensive curriculum that inspires critical thinking, scientific curiosity, language fluency, and sound character.</p>
      </div>

      <div class="academics-grid">
        ${academicPrograms.map(prog => `
          <div class="program-card">
            <div class="program-img">
              <img src="${prog.image}" alt="${prog.title}" loading="lazy" />
              <div class="program-grade-badge">${prog.grades}</div>
            </div>
            
            <div class="program-body">
              <h3>${prog.title}</h3>
              <p>${prog.description}</p>
              
              <ul class="program-features">
                ${prog.features.map(feat => `
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${feat}</span>
                  </li>
                `).join('')}
              </ul>

              <button class="btn btn-outline learn-program-btn" style="margin-top: auto; width: 100%;">
                <span>Learn Program Details</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach modal trigger to program buttons
  const progBtns = section.querySelectorAll('.learn-program-btn');
  progBtns.forEach(btn => {
    btn.addEventListener('click', onOpenApplyModal);
  });

  return section;
}
