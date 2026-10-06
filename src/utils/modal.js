import { currentScope } from './lifecycle.js';

/**
 * Accessible modal behaviour shared by every pop-up window.
 *
 * Modals are `.modal-backdrop` elements shown by adding the `active` class.
 * enhanceModal() adds, without changing how each component opens/closes:
 *  - role="dialog", aria-modal and an accessible name (its first heading)
 *  - Escape closes the top-most open modal
 *  - Tab / Shift+Tab stay inside the open modal (focus trap)
 *  - focus moves into the modal on open and back to the opener on close
 *  - the page behind does not scroll while a modal is open
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const openStack = [];

function focusableIn(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE)].filter(el => el.getClientRects().length > 0);
}

function syncBodyLock() {
  document.body.classList.toggle('modal-open', openStack.length > 0);
}

/**
 * @param {HTMLElement} backdrop  the `.modal-backdrop` element
 * @param {object} [options]
 *   close()  how to close it (defaults to removing the `active` class)
 */
export function enhanceModal(backdrop, { close } = {}) {
  const dialog = backdrop.querySelector('[role="dialog"], .modal-dialog, .lightbox-content') || backdrop;
  const doClose = close || (() => backdrop.classList.remove('active'));

  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.tabIndex = -1;
  const heading = dialog.querySelector('h2, h3');
  if (heading && !dialog.hasAttribute('aria-label')) {
    if (!heading.id) heading.id = `${backdrop.id || 'modal'}-title`;
    dialog.setAttribute('aria-labelledby', heading.id);
  }

  let returnFocus = null;
  let isOpen = false;

  const observer = new MutationObserver(() => {
    const nowOpen = backdrop.classList.contains('active');
    if (nowOpen === isOpen) return;
    isOpen = nowOpen;

    if (nowOpen) {
      returnFocus = document.activeElement;
      openStack.push(backdrop);
      // Focus the dialog itself: screen readers announce its title, and the
      // on-screen keyboard does not pop up on phones.
      requestAnimationFrame(() => {
        if (!dialog.contains(document.activeElement)) dialog.focus();
      });
    } else {
      const i = openStack.indexOf(backdrop);
      if (i !== -1) openStack.splice(i, 1);
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
      returnFocus = null;
    }
    syncBodyLock();
  });
  observer.observe(backdrop, { attributes: true, attributeFilter: ['class'] });

  backdrop.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || openStack[openStack.length - 1] !== backdrop) return;
    const items = focusableIn(dialog);
    if (items.length === 0) {
      e.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  backdrop.closeModal = doClose;

  // Removed together with the rest of the app on rebuild (language change)
  currentScope().addEventListener('abort', () => {
    observer.disconnect();
    const i = openStack.indexOf(backdrop);
    if (i !== -1) openStack.splice(i, 1);
    syncBodyLock();
  }, { once: true });
}

// One global Escape handler: closes only the top-most modal
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || openStack.length === 0) return;
  const top = openStack[openStack.length - 1];
  e.preventDefault();
  top.closeModal();
});
