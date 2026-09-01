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

      <form id="apply-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Parent / Guardian Name *</label>
            <input type="text" required placeholder="e.g. Jean-Claude Habimana" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Phone Number *</label>
            <input type="tel" required placeholder="+250 78X XXX XXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Child's Full Name *</label>
            <input type="text" required placeholder="Child's full name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Grade Level Applying For *</label>
            <select required style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem; background: white;">
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
          <input type="email" placeholder="parent@example.com" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--navy);">Additional Information / Tour Request</label>
          <textarea rows="3" placeholder="Tell us any special learning requirements or preferred campus tour date..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: inherit;"></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem;">
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for submitting your application to Rwenanura Parents Primary School! Our admissions office will contact you within 24 hours via phone/email.');
    modal.classList.remove('active');
    form.reset();
  });

  return modal;
}
