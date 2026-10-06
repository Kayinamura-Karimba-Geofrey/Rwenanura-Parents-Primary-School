import { schoolInfo } from '../data/schoolData.js';
import { subscribeNewsletter } from '../data/api.js';
import { t } from '../data/i18n.js';
import { canViewCalendar, onAuthChange } from '../data/userRole.js';
import { privacyPolicy, termsOfUse } from '../data/policies.js';

export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.id = 'contact';

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <!-- School Identity Col -->
        <div>
          <div class="footer-brand">
            <div class="logo-crest footer-crest">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <h3 class="footer-brand-title">RPPS</h3>
              <p class="footer-brand-sub">${t('school_name')}</p>
            </div>
          </div>

          <p class="footer-desc">
            ${t('footer_desc')}
          </p>

          <div class="footer-contact">
            <p><strong>${t('top_location')}:</strong> ${schoolInfo.location}</p>
            <p><strong>Phone:</strong> ${schoolInfo.phone} / ${schoolInfo.altPhone}</p>
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
            <li class="footer-calendar-item" hidden><a href="#calendar">${t('nav_calendar')}</a></li>
            <li><a href="#testimonials">${t('test_badge')}</a></li>
            <li><a href="#tuition-calculator">${t('calc_badge')}</a></li>
            <li><a href="#about">${t('headteacher_title')}</a></li>
            <li><a href="#faq">${t('faq_badge')}</a></li>
          </ul>
        </div>

        <!-- Working Hours & Newsletter -->
        <div class="footer-col">
          <h4>${t('footer_office_hours')}</h4>
          <p class="footer-hours">${schoolInfo.workingHours}</p>
          <p class="footer-closed">${t('footer_closed_weekend')}</p>

          <h5 class="footer-newsletter-title">${t('footer_newsletter_title')}</h5>
          <form id="newsletter-form" class="footer-newsletter-form">
            <input type="email" id="newsletter-email" class="footer-newsletter-input" required maxlength="200" aria-label="${t('footer_newsletter_placeholder')}" placeholder="${t('footer_newsletter_placeholder')}" />
            <button type="submit" id="newsletter-btn" class="btn btn-primary btn-xs">${t('footer_newsletter_btn')}</button>
          </form>
          <div id="newsletter-msg" class="footer-newsletter-msg" role="status" hidden></div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} ${schoolInfo.name}. ${t('footer_copyright')}</p>
        <div class="footer-legal">
          <button type="button" class="footer-legal-link" data-policy="privacy">${t('footer_privacy')}</button>
          <button type="button" class="footer-legal-link" data-policy="terms">${t('footer_terms')}</button>
          <button type="button" class="footer-legal-link" id="footer-track-link">${t('footer_portal')}</button>
        </div>
      </div>
    </div>
  `;

  // Calendar link only for roles that can see the calendar section
  const calendarItem = footer.querySelector('.footer-calendar-item');
  const syncCalendarLink = () => { calendarItem.hidden = !canViewCalendar(); };
  syncCalendarLink();
  onAuthChange(syncCalendarLink);

  footer.querySelectorAll('[data-policy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const policy = btn.dataset.policy === 'privacy' ? privacyPolicy : termsOfUse;
      window.dispatchEvent(new CustomEvent('rpps-show-info', { detail: policy }));
    });
  });
  // Parents' portal = tracking an admission application
  footer.querySelector('#footer-track-link').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('rpps-open-track'));
  });

  const form = footer.querySelector('#newsletter-form');
  const msgEl = footer.querySelector('#newsletter-msg');
  const btn = footer.querySelector('#newsletter-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = footer.querySelector('#newsletter-email').value;

    btn.disabled = true;
    const res = await subscribeNewsletter(email);

    msgEl.hidden = false;
    msgEl.classList.toggle('is-error', !res.success);
    if (res.success) {
      msgEl.textContent = res.message;
      form.reset();
    } else {
      msgEl.textContent = res.error || 'Failed to subscribe.';
    }

    btn.disabled = false;
  });

  return footer;
}
