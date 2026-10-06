import { testimonials } from '../data/schoolData.js';
import { t } from '../data/i18n.js';

export function createTestimonials() {
  const section = document.createElement('section');
  section.className = 'section section-muted';
  section.id = 'testimonials';

  let currentIdx = 0;

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge badge-gold">${t('test_badge')}</div>
        <h2 class="section-title">${t('test_title')}</h2>
        <p class="section-subtitle">${t('test_subtitle')}</p>
      </div>

      <div class="testimonials-slider">
        <div class="quote-icon">“</div>
        <p class="testimonial-text" id="testimonial-quote">"${testimonials[0].quote}"</p>
        
        <div class="author-info">
          <img src="${testimonials[0].avatar}" alt="${testimonials[0].author}" class="author-avatar" id="testimonial-avatar" />
          <div class="author-text">
            <h4 id="testimonial-author" class="author-name">${testimonials[0].author}</h4>
            <p id="testimonial-role" class="author-role">${testimonials[0].role}</p>
          </div>
        </div>

        <div class="testimonial-controls">
          <button class="prev-t testimonial-arrow" aria-label="Previous quote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div class="testimonial-dots">
            ${testimonials.map((_, i) => `
              <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('')}
          </div>

          <button class="next-t testimonial-arrow" aria-label="Next quote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const quoteEl = section.querySelector('#testimonial-quote');
  const authorEl = section.querySelector('#testimonial-author');
  const roleEl = section.querySelector('#testimonial-role');
  const avatarEl = section.querySelector('#testimonial-avatar');
  const dots = section.querySelectorAll('.testimonial-dots .dot');

  function updateTestimonial(index) {
    currentIdx = (index + testimonials.length) % testimonials.length;
    const item = testimonials[currentIdx];

    quoteEl.textContent = `"${item.quote}"`;
    authorEl.textContent = item.author;
    roleEl.textContent = item.role;
    avatarEl.src = item.avatar;

    dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
  }

  section.querySelector('.prev-t').addEventListener('click', () => updateTestimonial(currentIdx - 1));
  section.querySelector('.next-t').addEventListener('click', () => updateTestimonial(currentIdx + 1));
  dots.forEach(d => d.addEventListener('click', (e) => updateTestimonial(parseInt(e.target.dataset.index))));

  return section;
}
