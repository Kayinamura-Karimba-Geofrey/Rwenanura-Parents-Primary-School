import { escapeHtml } from '../utils/html.js';

/**
 * Generic reading modal used for full news articles and the footer's
 * privacy / terms pages.
 *
 *   modal.showText({ title, meta, text, link })  - plain text (escaped; blank lines become
 *                                                paragraphs); optional link to a full page
 *   modal.showHtml({ title, html })        - trusted static HTML from the codebase only
 */
export function createInfoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'info-modal';

  modal.innerHTML = `
    <div class="modal-dialog info-dialog">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h3 class="info-title" id="info-modal-title"></h3>
      <div class="info-meta" id="info-modal-meta"></div>
      <div class="info-body" id="info-modal-body"></div>
      <a class="info-link" id="info-modal-link" hidden>Open article page ↗</a>
    </div>
  `;

  const titleEl = modal.querySelector('#info-modal-title');
  const metaEl = modal.querySelector('#info-modal-meta');
  const bodyEl = modal.querySelector('#info-modal-body');
  const linkEl = modal.querySelector('#info-modal-link');

  const close = () => modal.classList.remove('active');
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  function open(title, meta) {
    titleEl.textContent = title;
    metaEl.textContent = meta || '';
    metaEl.hidden = !meta;
    modal.classList.add('active');
    modal.querySelector('.modal-dialog').scrollTop = 0;
  }

  modal.showText = ({ title, meta, text, link }) => {
    linkEl.hidden = !link;
    if (link) linkEl.href = link;
    bodyEl.innerHTML = String(text || '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('');
    open(title, meta);
  };

  modal.showHtml = ({ title, html }) => {
    linkEl.hidden = true;
    bodyEl.innerHTML = html;
    open(title);
  };

  return modal;
}
