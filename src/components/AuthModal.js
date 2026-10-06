import { loginUser, registerUser } from '../data/api.js';

const CLASS_LEVELS = ['Nursery 1', 'Nursery 2', 'Nursery 3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

/**
 * Unified Log In / Register modal for students, staff and administrators.
 * Alumni have their own sign-in inside the Alumni Network modal.
 *
 * The returned element exposes `open(tab)` where tab is 'login' or 'register'.
 */
export function createAuthModal(onAuthSuccess, onOpenAlumni) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'auth-modal';

  modal.innerHTML = `
    <div class="modal-dialog auth-dialog">
      <button class="modal-close" aria-label="Close modal">&times;</button>

      <div class="auth-header">
        <div class="logo-crest auth-crest">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3>RPPS School Portal</h3>
        <p>For pupils, teachers and school administration</p>
      </div>

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" data-auth-tab="login" role="tab">Log In</button>
        <button class="auth-tab" data-auth-tab="register" role="tab">Register</button>
      </div>

      <div id="auth-feedback" class="auth-feedback" role="status" hidden></div>

      <!-- LOGIN FORM -->
      <form id="auth-login-form" class="auth-form">
        <label class="auth-label" for="login-email">Email</label>
        <input class="auth-input" type="email" id="login-email" required autocomplete="username" placeholder="you@example.com" />

        <label class="auth-label" for="login-password">Password</label>
        <input class="auth-input" type="password" id="login-password" required autocomplete="current-password" placeholder="••••••••" />

        <button type="submit" id="login-submit-btn" class="btn btn-primary btn-block">Log In</button>
      </form>

      <!-- REGISTER FORM -->
      <form id="auth-register-form" class="auth-form" hidden>
        <span class="auth-label">I am registering as</span>
        <div class="auth-type-toggle">
          <label class="auth-type-option">
            <input type="radio" name="account-type" value="student" checked />
            <span>🎒 Student</span>
          </label>
          <label class="auth-type-option">
            <input type="radio" name="account-type" value="staff" />
            <span>🧑‍🏫 Staff</span>
          </label>
        </div>

        <label class="auth-label" for="register-name">Full Name</label>
        <input class="auth-input" type="text" id="register-name" required maxlength="120" autocomplete="name" placeholder="e.g. Aline Uwase" />

        <label class="auth-label" for="register-email">Email</label>
        <input class="auth-input" type="email" id="register-email" required maxlength="200" autocomplete="email" placeholder="you@example.com" />

        <div id="register-class-field">
          <label class="auth-label" for="register-class">Class</label>
          <select class="auth-input" id="register-class">
            ${CLASS_LEVELS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        <label class="auth-label" for="register-password">Password</label>
        <input class="auth-input" type="password" id="register-password" required minlength="8" maxlength="128" autocomplete="new-password" placeholder="At least 8 characters" />

        <button type="submit" id="register-submit-btn" class="btn btn-primary btn-block">Create Account</button>
        <p class="auth-note" id="register-note">Student accounts are activated once a staff member approves them.</p>
      </form>

      <p class="auth-alumni-link">
        Former pupil? <button type="button" class="btn-link-action" id="auth-open-alumni">Join the Alumni Network</button>
      </p>
    </div>
  `;

  const tabs = modal.querySelectorAll('.auth-tab');
  const loginForm = modal.querySelector('#auth-login-form');
  const registerForm = modal.querySelector('#auth-register-form');
  const feedback = modal.querySelector('#auth-feedback');
  const classField = modal.querySelector('#register-class-field');
  const registerNote = modal.querySelector('#register-note');

  function close() {
    modal.classList.remove('active');
  }

  function showFeedback(msg, isError = false) {
    feedback.hidden = false;
    feedback.classList.toggle('is-error', isError);
    feedback.textContent = msg;
  }

  function switchTab(tab) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.authTab === tab));
    loginForm.hidden = tab !== 'login';
    registerForm.hidden = tab !== 'register';
    feedback.hidden = true;
  }

  modal.open = (tab = 'login') => {
    switchTab(tab);
    modal.classList.add('active');
  };

  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.authTab)));

  modal.querySelector('#auth-open-alumni').addEventListener('click', () => {
    close();
    if (onOpenAlumni) onOpenAlumni();
  });

  // Class selection only applies to student accounts
  registerForm.querySelectorAll('input[name="account-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isStudent = radio.value === 'student' && radio.checked;
      classField.hidden = !isStudent;
      registerNote.textContent = isStudent
        ? 'Student accounts are activated once a staff member approves them.'
        : 'Staff accounts are activated once an administrator approves them.';
    });
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#login-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    feedback.hidden = true;

    const res = await loginUser(
      modal.querySelector('#login-email').value,
      modal.querySelector('#login-password').value
    );

    btn.disabled = false;
    btn.textContent = 'Log In';

    if (res.success) {
      loginForm.reset();
      close();
      if (onAuthSuccess) onAuthSuccess(res.user);
    } else {
      showFeedback(res.error || 'Invalid credentials.', true);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#register-submit-btn');
    const accountType = registerForm.querySelector('input[name="account-type"]:checked').value;
    btn.disabled = true;
    btn.textContent = 'Creating account...';
    feedback.hidden = true;

    const res = await registerUser({
      accountType,
      name: modal.querySelector('#register-name').value,
      email: modal.querySelector('#register-email').value,
      password: modal.querySelector('#register-password').value,
      classLevel: accountType === 'student' ? modal.querySelector('#register-class').value : undefined
    });

    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (res.success) {
      registerForm.reset();
      classField.hidden = false;
      switchTab('login');
      showFeedback(res.message || 'Registration received. You can log in once your account is approved.');
    } else {
      showFeedback(res.error || 'Failed to create account.', true);
    }
  });

  return modal;
}
