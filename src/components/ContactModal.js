import { submitApplication } from '../data/api.js';
import { escapeHtml } from '../utils/html.js';

export function createContactModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'application-modal';

  modal.innerHTML = `
    <div class="modal-dialog">
      <button class="modal-close" aria-label="Close modal">&times;</button>

      <div class="badge badge-gold">Admissions Portal</div>
      <h3 class="modal-title">Apply to Rwenanura Parents</h3>
      <p class="modal-intro">Fill out this application form to reserve your child's spot for the upcoming academic year.</p>

      <div id="modal-feedback" class="form-feedback" role="status" hidden></div>

      <form id="apply-form">
        <div class="form-grid-2">
          <div>
            <label class="form-label" for="app-parent-name">Parent / Guardian Name *</label>
            <input class="form-input" type="text" id="app-parent-name" required maxlength="120" autocomplete="name" placeholder="e.g. Jean-Claude Habimana" />
          </div>
          <div>
            <label class="form-label" for="app-phone">Phone Number *</label>
            <input class="form-input" type="tel" id="app-phone" required maxlength="30" autocomplete="tel" placeholder="+250 78X XXX XXX" />
          </div>
        </div>

        <div class="form-grid-2">
          <div>
            <label class="form-label" for="app-child-name">Child's Full Name *</label>
            <input class="form-input" type="text" id="app-child-name" required maxlength="120" placeholder="Child's full name" />
          </div>
          <div>
            <label class="form-label" for="app-grade">Grade Level Applying For *</label>
            <select class="form-input" id="app-grade" required>
              <option value="">Select Grade Level</option>
              <option value="Nursery Baby Class">Nursery - Baby Class (3 yrs)</option>
              <option value="Nursery Middle Class">Nursery - Middle Class (4 yrs)</option>
              <option value="Nursery Top Class">Nursery - Top Class (5 yrs)</option>
              <option value="Primary 1">Primary 1 (P1)</option>
              <option value="Primary 2">Primary 2 (P2)</option>
              <option value="Primary 3">Primary 3 (P3)</option>
              <option value="Primary 4">Primary 4 (P4)</option>
              <option value="Primary 5">Primary 5 (P5)</option>
              <option value="Primary 6">Primary 6 (P6)</option>
            </select>
          </div>
        </div>

        <label class="form-label" for="app-email">Email Address <span class="auth-optional">(we'll email your tracking code)</span></label>
        <input class="form-input" type="email" id="app-email" maxlength="200" autocomplete="email" placeholder="parent@example.com" />

        <label class="form-label" for="app-notes">Additional Information</label>
        <textarea class="form-input" id="app-notes" rows="3" maxlength="1000" placeholder="Tell us about any special learning requirements..."></textarea>

        <button type="submit" id="submit-app-btn" class="btn btn-primary btn-block">
          <span>Submit Application</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </form>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  const form = modal.querySelector('#apply-form');
  const submitBtn = modal.querySelector('#submit-app-btn');
  const feedbackEl = modal.querySelector('#modal-feedback');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const parentName = modal.querySelector('#app-parent-name').value;
    const phone = modal.querySelector('#app-phone').value;
    const childName = modal.querySelector('#app-child-name').value;
    const grade = modal.querySelector('#app-grade').value;
    const email = modal.querySelector('#app-email').value;
    const notes = modal.querySelector('#app-notes').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting Application...</span>';
    feedbackEl.hidden = true;

    const response = await submitApplication({ parentName, phone, childName, grade, email, notes });

    if (response.success) {
      feedbackEl.hidden = false;
      feedbackEl.classList.remove('is-error');
      feedbackEl.innerHTML = `
        <strong>🎉 Application Submitted!</strong><br />
        Tracking Code: <strong>${escapeHtml(response.trackingCode)}</strong><br />
        <span class="form-feedback-note">We have recorded your application for ${escapeHtml(childName)} (${escapeHtml(grade)}). Keep your tracking code to check the status; our admissions office will contact you shortly.</span>
      `;
      form.reset();
    } else {
      feedbackEl.hidden = false;
      feedbackEl.classList.add('is-error');
      feedbackEl.textContent = response.error || 'Failed to submit application. Please check details and try again.';
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Submit Application</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  });

  return modal;
}
