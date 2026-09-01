import { submitApplication } from '../data/api.js';

export function createContactModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'application-modal';

  modal.innerHTML = `
    <div class="modal-dialog">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      
      <div class="badge badge-gold" style="margin-bottom: 0.5rem;">Admissions Portal</div>
      <h3 style="font-size: 1.75rem; margin-bottom: 0.5rem; color: var(--navy);">Apply to Rwenanura Parents</h3>
      <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1.5rem;">Fill out this application form to reserve your child's spot for the upcoming academic year.</p>

      <div id="modal-feedback" style="display: none; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;"></div>

      <form id="apply-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Parent / Guardian Name *</label>
            <input type="text" id="app-parent-name" required placeholder="e.g. Jean-Claude Habimana" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Phone Number *</label>
            <input type="tel" id="app-phone" required placeholder="+250 78X XXX XXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Child's Full Name *</label>
            <input type="text" id="app-child-name" required placeholder="Child's full name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Grade Level Applying For *</label>
            <select id="app-grade" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem; background: white;">
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

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Email Address</label>
          <input type="email" id="app-email" placeholder="parent@example.com" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Additional Information / Tour Request</label>
          <textarea id="app-notes" rows="3" placeholder="Tell us any special learning requirements or preferred campus tour date..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: inherit;"></textarea>
        </div>

        <button type="submit" id="submit-app-btn" class="btn btn-primary" style="width: 100%; padding: 0.9rem;">
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
    feedbackEl.style.display = 'none';

    const response = await submitApplication({ parentName, phone, childName, grade, email, notes });

    if (response.success) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.backgroundColor = 'rgba(13, 92, 58, 0.1)';
      feedbackEl.style.color = 'var(--primary)';
      feedbackEl.style.border = '1px solid var(--primary-light)';
      feedbackEl.innerHTML = `
        <strong>🎉 Application Submitted!</strong><br />
        Tracking Code: <strong>${response.trackingCode}</strong><br />
        <span style="font-size: 0.82rem; color: var(--gray-600);">We have recorded your application for ${childName} (${grade}). Our admissions office will contact you shortly!</span>
      `;
      form.reset();
    } else {
      feedbackEl.style.display = 'block';
      feedbackEl.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
      feedbackEl.style.color = '#dc2626';
      feedbackEl.style.border = '1px solid #fca5a5';
      feedbackEl.textContent = response.error || 'Failed to submit application. Please check details and try again.';
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Submit Application</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  });

  return modal;
}
