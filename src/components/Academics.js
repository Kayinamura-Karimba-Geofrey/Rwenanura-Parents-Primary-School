import { academicPrograms } from '../data/schoolData.js';
import { t } from '../data/i18n.js';

export function createAcademics(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'academics';

  const localizedPrograms = [
    {
      ...academicPrograms[0],
      title: t('acad_nursery'),
      grades: t('acad_nursery_grades'),
      description: t('acad_nursery_desc')
    },
    {
      ...academicPrograms[1],
      title: t('acad_lower'),
      grades: t('acad_lower_grades'),
      description: t('acad_lower_desc')
    },
    {
      ...academicPrograms[2],
      title: t('acad_upper'),
      grades: t('acad_upper_grades'),
      description: t('acad_upper_desc')
    },
    {
      ...academicPrograms[3],
      title: t('acad_stem'),
      grades: t('acad_stem_grades'),
      description: t('acad_stem_desc')
    }
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge">${t('acad_badge')}</div>
        <h2 class="section-title">${t('acad_title')}</h2>
        <p class="section-subtitle">${t('acad_subtitle')}</p>
      </div>

      <div class="academics-grid">
        ${localizedPrograms.map(prog => `
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
                <span>${t('btn_apply_program')}</span>
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
