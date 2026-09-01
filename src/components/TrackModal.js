import { trackApplication } from '../data/api.js';

export function createTrackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'track-modal';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 520px; width: 90%;">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div class="logo-crest" style="width: 48px; height: 48px; margin: 0 auto 0.75rem auto;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 style="font-size: 1.5rem; color: var(--navy); margin-bottom: 0.35rem;">Track Admission Status</h3>
        <p style="color: var(--gray-600); font-size: 0.88rem;">Enter your official RPPS application reference code to check your status in real time.</p>
      </div>

      <form id="track-form" style="margin-bottom: 1.25rem;">
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="track-code-input" required placeholder="e.g. RPPS-2026-4289" style="flex: 1; padding: 0.8rem 1rem; border: 2px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.95rem; font-family: monospace; font-weight: 700; text-transform: uppercase;" />
          <button type="submit" class="btn btn-primary" style="padding: 0.8rem 1.25rem;">
            Check Status
          </button>
        </div>
      </form>

      <div id="track-result" style="display: none;"></div>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  const form = modal.querySelector('#track-form');
  const input = modal.querySelector('#track-code-input');
  const resultDiv = modal.querySelector('#track-result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (!code) return;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<div style="text-align: center; color: var(--gray-500); padding: 1rem;">Searching admissions database...</div>`;

    const res = await trackApplication(code);

    if (res.success && res.application) {
      const app = res.application;
      let badgeBg = 'var(--gold-light)';
      let badgeColor = 'var(--gold)';
      let statusIcon = '⏳';
      let desc = 'Your application has been received and is queued for initial admissions officer review.';

      if (app.status === 'Under Review') {
        badgeBg = 'rgba(30, 41, 59, 0.1)';
        badgeColor = 'var(--navy)';
        statusIcon = '🔍';
        desc = 'Academic transcripts and pupil records are currently being evaluated by the Academic Board.';
      } else if (app.status === 'Approved') {
        badgeBg = 'rgba(13, 92, 58, 0.12)';
        badgeColor = 'var(--primary)';
        statusIcon = '🎉';
        desc = '<strong>Congratulations! Admission Granted.</strong> Please visit the Rwenanura Parents Primary School administration office in Nyagatare to pick up your official acceptance letter.';
      }

      resultDiv.innerHTML = `
        <div style="background: var(--gray-50); border: 1px solid var(--gray-300); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <span style="font-family: monospace; font-weight: 700; color: var(--navy); font-size: 0.85rem;">${app.tracking_code}</span>
              <h4 style="font-size: 1.2rem; color: var(--navy); margin-top: 0.15rem;">${app.child_name}</h4>
              <p style="font-size: 0.82rem; color: var(--gray-600); margin: 0;">Grade: <strong>${app.grade}</strong></p>
            </div>
            
            <div style="background: ${badgeBg}; color: ${badgeColor}; padding: 0.45rem 0.85rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem;">
              <span>${statusIcon}</span>
              <span>${app.status}</span>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: var(--gray-700); line-height: 1.5; margin: 0;">${desc}</p>
          <div style="font-size: 0.78rem; color: var(--gray-500); margin-top: 0.85rem; text-align: right;">
            Submitted on: ${new Date(app.created_at).toLocaleDateString()}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid #fca5a5; color: #dc2626; padding: 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; text-align: center;">
          ❌ ${res.error || 'Tracking code not found.'}
        </div>
      `;
    }
  });

  return modal;
}
