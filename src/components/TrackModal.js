import { trackApplication } from '../data/api.js';
import { escapeHtml } from '../utils/html.js';

export function createTrackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'track-modal';

  modal.innerHTML = `
    <div class="modal-dialog track-dialog">
      <button class="modal-close" aria-label="Close modal">&times;</button>

      <div class="modal-head-centered">
        <div class="logo-crest modal-crest">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 class="modal-title">Track Admission Status</h3>
        <p class="modal-intro">Enter your official RPPS application reference code to check your status in real time.</p>
      </div>

      <form id="track-form" class="track-form">
        <div class="track-input-row">
          <input class="form-input track-code-input" type="text" id="track-code-input" required maxlength="60" aria-label="Tracking code" placeholder="e.g. RPPS-2026-a1b2c3d4e5f6a7b8" />
          <button type="submit" class="btn btn-primary">Check Status</button>
        </div>
      </form>

      <div id="track-result" hidden></div>
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

    resultDiv.hidden = false;
    resultDiv.innerHTML = `<div class="track-searching">Searching admissions database...</div>`;

    const res = await trackApplication(code);

    if (res.success && res.application) {
      const app = res.application;
      const STATUS_VIEW = {
        'Pending': {
          cls: 'track-status-pending',
          icon: '⏳',
          desc: 'Your application has been received and is queued for initial admissions officer review.'
        },
        'Under Review': {
          cls: 'track-status-review',
          icon: '🔍',
          desc: 'Academic transcripts and pupil records are currently being evaluated by the Academic Board.'
        },
        'Approved': {
          cls: 'track-status-approved',
          icon: '🎉',
          desc: '<strong>Congratulations! Admission Granted.</strong> Please visit the Rwenanura Parents Primary School administration office in Nyagatare to pick up your official acceptance letter.'
        }
      };
      const view = STATUS_VIEW[app.status] || STATUS_VIEW.Pending;

      resultDiv.innerHTML = `
        <div class="track-card">
          <div class="track-card-head">
            <div>
              <span class="track-code">${escapeHtml(app.tracking_code)}</span>
              <h4 class="track-child">${escapeHtml(app.child_name)}</h4>
              <p class="track-grade">Grade: <strong>${escapeHtml(app.grade)}</strong></p>
            </div>
            <div class="track-status ${view.cls}">
              <span>${view.icon}</span>
              <span>${escapeHtml(app.status)}</span>
            </div>
          </div>
          <p class="track-desc">${view.desc}</p>
          <div class="track-date">Submitted on: ${new Date(app.created_at).toLocaleDateString()}</div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="form-feedback is-error track-error">
          ❌ ${escapeHtml(res.error || 'Tracking code not found.')}
        </div>
      `;
    }
  });

  // Open with a code already filled in and looked up (links in status emails)
  modal.openWithCode = (code) => {
    modal.querySelector('#track-code-input').value = code;
    modal.classList.add('active');
    form.requestSubmit();
  };

  return modal;
}
