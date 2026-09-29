import { schoolInfo } from '../data/schoolData.js';
import { subscribeNewsletter } from '../data/api.js';
import { t } from '../data/i18n.js';

export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.id = 'contact';

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <!-- School Identity Col -->
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div class="logo-crest" style="width: 40px; height: 40px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <h3 style="color: var(--white); font-size: 1.1rem; line-height: 1.2;">RPPS</h3>
              <p style="color: var(--gold); font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">${t('school_name')}</p>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: var(--gray-400); margin-bottom: 1.25rem; line-height: 1.6;">
            ${t('footer_desc')}
          </p>

          <div style="font-size: 0.85rem; color: var(--gray-300);">
            <p style="margin-bottom: 0.4rem;"><strong>${t('top_location')}:</strong> ${schoolInfo.location}</p>
            <p style="margin-bottom: 0.4rem;"><strong>Phone:</strong> ${schoolInfo.phone} / ${schoolInfo.altPhone}</p>
            <p><strong>Email:</strong> ${schoolInfo.email}</p>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4>${t('footer_quick_links')}</h4>
          <ul class="footer-links">
            <li><a href="#about">${t('nav_about')}</a></li>
            <li><a href="#academics">${t('nav_academics')}</a></li>
            <li><a href="#facilities">${t('nav_campus')}</a></li>
            <li><a href="#admissions">${t('nav_admissions')}</a></li>
            <li><a href="#alumni">${t('nav_alumni')}</a></li>
          </ul>
        </div>

        <!-- Useful Information -->
        <div class="footer-col">
          <h4>${t('footer_info_title')}</h4>
          <ul class="footer-links">
            <li><a href="#news">${t('nav_news')}</a></li>
            <li><a href="#calendar">${t('nav_calendar')}</a></li>
            <li><a href="#testimonials">${t('test_badge')}</a></li>
            <li><a href="#tuition-calculator">${t('calc_badge')}</a></li>
            <li><a href="#about">${t('headteacher_title')}</a></li>
            <li><a href="#faq">${t('faq_badge')}</a></li>
          </ul>
        </div>

        <!-- Working Hours & Newsletter -->
        <div class="footer-col">
          <h4>${t('footer_office_hours')}</h4>
          <p style="font-size: 0.88rem; color: var(--gray-300); margin-bottom: 0.5rem;">${schoolInfo.workingHours}</p>
          <p style="font-size: 0.8rem; color: var(--gray-400); margin-bottom: 1.25rem;">${t('footer_closed_weekend')}</p>

          <h5 style="color: var(--white); font-size: 0.95rem; margin-bottom: 0.5rem;">${t('footer_newsletter_title')}</h5>
          <form id="newsletter-form" style="display: flex; gap: 0.5rem;">
            <input type="email" id="newsletter-email" required placeholder="${t('footer_newsletter_placeholder')}" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-700); background: var(--navy-light); color: var(--white); font-size: 0.82rem; width: 100%;" />
            <button type="submit" id="newsletter-btn" class="btn btn-gold" style="padding: 0.5rem 0.85rem; font-size: 0.82rem;">${t('footer_newsletter_btn')}</button>
          </form>
          <div id="newsletter-msg" style="font-size: 0.8rem; margin-top: 0.5rem; display: none;"></div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} ${schoolInfo.name}. ${t('footer_copyright')}</p>
        <div style="display: flex; gap: 1.5rem;">
          <a href="#" style="color: var(--gray-400);">${t('footer_privacy')}</a>
          <a href="#" style="color: var(--gray-400);">${t('footer_terms')}</a>
          <a href="#" style="color: var(--gray-400);">${t('footer_portal')}</a>
        </div>
      </div>
    </div>
  `;

  const form = footer.querySelector('#newsletter-form');
  const msgEl = footer.querySelector('#newsletter-msg');
  const btn = footer.querySelector('#newsletter-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = footer.querySelector('#newsletter-email').value;

    btn.disabled = true;
    const res = await subscribeNewsletter(email);

    msgEl.style.display = 'block';
    if (res.success) {
      msgEl.style.color = '#34d399';
      msgEl.textContent = res.message;
      form.reset();
    } else {
      msgEl.style.color = '#f87171';
      msgEl.textContent = res.error || 'Failed to subscribe.';
    }

    btn.disabled = false;
  });

  return footer;
}
