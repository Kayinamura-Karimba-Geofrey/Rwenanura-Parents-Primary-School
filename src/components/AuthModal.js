import { loginUser, registerUser, resendVerification, requestPasswordReset, resetPassword } from '../data/api.js';

const CLASS_LEVELS = ['Nursery 1', 'Nursery 2', 'Nursery 3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

/**
 * Unified Log In / Register modal for students, staff and administrators.
 * Alumni have their own sign-in inside the Alumni Network modal.
 *
 * The returned element exposes:
 *  - open(tab)            tab: 'login' | 'register' | 'forgot'
 *  - openReset(token)     show the "choose a new password" form
 *  - showMessage(msg, isError)  open on the login tab with a status message
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

      <div id="form-feedback" class="form-feedback" role="status" hidden></div>

      <!-- LOGIN FORM -->
      <form id="auth-login-form" class="auth-form">
        <label class="form-label" for="login-email">Email or Username</label>
        <input class="form-input" type="text" id="login-email" required autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="you@example.com or username" />

        <label class="form-label" for="login-password">Password</label>
        <input class="form-input" type="password" id="login-password" required autocomplete="current-password" placeholder="••••••••" />

        <button type="submit" id="login-submit-btn" class="btn btn-primary btn-block">Log In</button>
        <div class="auth-links">
          <button type="button" class="btn-link-action" data-auth-goto="forgot">Forgot password?</button>
          <button type="button" class="btn-link-action" id="auth-resend-btn" hidden>Resend confirmation email</button>
        </div>
      </form>

      <!-- FORGOT PASSWORD FORM -->
      <form id="auth-forgot-form" class="auth-form" hidden>
        <p class="auth-help">Enter the email address of your account and we'll send you a link to choose a new password.</p>
        <label class="form-label" for="forgot-email">Email</label>
        <input class="form-input" type="email" id="forgot-email" required autocomplete="email" placeholder="you@example.com" />
        <button type="submit" id="forgot-submit-btn" class="btn btn-primary btn-block">Send Reset Link</button>
        <div class="auth-links">
          <button type="button" class="btn-link-action" data-auth-goto="login">Back to Log In</button>
        </div>
      </form>

      <!-- RESET PASSWORD FORM (opened from the emailed link) -->
      <form id="auth-reset-form" class="auth-form" hidden>
        <p class="auth-help">Choose a new password for your account.</p>
        <label class="form-label" for="reset-password">New Password</label>
        <input class="form-input" type="password" id="reset-password" required minlength="8" maxlength="128" autocomplete="new-password" placeholder="At least 8 characters" />
        <label class="form-label" for="reset-password-confirm">Confirm New Password</label>
        <input class="form-input" type="password" id="reset-password-confirm" required minlength="8" maxlength="128" autocomplete="new-password" />
        <button type="submit" id="reset-submit-btn" class="btn btn-primary btn-block">Save New Password</button>
      </form>

      <!-- REGISTER FORM -->
      <form id="auth-register-form" class="auth-form" hidden>
        <span class="form-label">I am registering as</span>
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

        <label class="form-label" for="register-name">Full Name</label>
        <input class="form-input" type="text" id="register-name" required maxlength="120" autocomplete="name" placeholder="e.g. Aline Uwase" />

        <div id="register-username-field">
          <label class="form-label" for="register-username">Username</label>
          <input class="form-input" type="text" id="register-username" minlength="3" maxlength="30" pattern="[A-Za-z0-9][A-Za-z0-9._\\-]{2,29}" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="e.g. aline.uwase" />
        </div>

        <label class="form-label" for="register-email" id="register-email-label">Email <span class="auth-optional">(optional - a parent's email is fine)</span></label>
        <input class="form-input" type="email" id="register-email" maxlength="200" autocomplete="email" placeholder="you@example.com" />

        <div id="register-class-field">
          <label class="form-label" for="register-class">Class</label>
          <select class="form-input" id="register-class">
            ${CLASS_LEVELS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        <label class="form-label" for="register-password">Password</label>
        <input class="form-input" type="password" id="register-password" required minlength="8" maxlength="128" autocomplete="new-password" placeholder="At least 8 characters" />

        <button type="submit" id="register-submit-btn" class="btn btn-primary btn-block">Create Account</button>
        <p class="auth-note" id="register-note">A staff member approves student accounts before first sign-in.</p>
      </form>

      <p class="auth-alumni-link">
        Former pupil? <button type="button" class="btn-link-action" id="auth-open-alumni">Join the Alumni Network</button>
      </p>
    </div>
  `;

  const tabs = modal.querySelectorAll('.auth-tab');
  const loginForm = modal.querySelector('#auth-login-form');
  const registerForm = modal.querySelector('#auth-register-form');
  const forgotForm = modal.querySelector('#auth-forgot-form');
  const resetForm = modal.querySelector('#auth-reset-form');
  const resendBtn = modal.querySelector('#auth-resend-btn');
  const tabBar = modal.querySelector('.auth-tabs');
  let resetToken = null;
  const feedback = modal.querySelector('#form-feedback');
  const classField = modal.querySelector('#register-class-field');
  const usernameField = modal.querySelector('#register-username-field');
  const usernameInput = modal.querySelector('#register-username');
  const emailInput = modal.querySelector('#register-email');
  const emailOptional = modal.querySelector('#register-email-label .auth-optional');

  // Pupils: username required, email optional. Staff: email required.
  function applyAccountType(isStudent) {
    classField.hidden = !isStudent;
    usernameField.hidden = !isStudent;
    usernameInput.required = isStudent;
    emailInput.required = !isStudent;
    emailOptional.hidden = !isStudent;
  }
  applyAccountType(true);
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
    tabBar.hidden = tab === 'forgot' || tab === 'reset';
    loginForm.hidden = tab !== 'login';
    registerForm.hidden = tab !== 'register';
    forgotForm.hidden = tab !== 'forgot';
    resetForm.hidden = tab !== 'reset';
    resendBtn.hidden = true;
    feedback.hidden = true;
  }

  modal.open = (tab = 'login') => {
    switchTab(tab);
    modal.classList.add('active');
  };

  modal.openReset = (token) => {
    resetToken = token;
    modal.open('reset');
  };

  modal.showMessage = (msg, isError = false) => {
    modal.open('login');
    showFeedback(msg, isError);
  };

  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.authTab)));
  modal.querySelectorAll('[data-auth-goto]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.authGoto));
  });

  modal.querySelector('#auth-open-alumni').addEventListener('click', () => {
    close();
    if (onOpenAlumni) onOpenAlumni();
  });

  // Class selection only applies to student accounts
  registerForm.querySelectorAll('input[name="account-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isStudent = radio.value === 'student' && radio.checked;
      applyAccountType(isStudent);
      registerNote.textContent = isStudent
        ? 'A staff member approves student accounts before first sign-in.'
        : 'Confirm your email, then an administrator approves staff accounts.';
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
      resendBtn.hidden = res.code !== 'EMAIL_NOT_VERIFIED';
    }
  });

  resendBtn.addEventListener('click', async () => {
    resendBtn.disabled = true;
    const res = await resendVerification(modal.querySelector('#login-email').value);
    resendBtn.disabled = false;
    resendBtn.hidden = true;
    showFeedback(res.success ? res.message : (res.error || 'Failed to send confirmation email.'), !res.success);
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modal.querySelector('#forgot-submit-btn');
    btn.disabled = true;
    const res = await requestPasswordReset(modal.querySelector('#forgot-email').value);
    btn.disabled = false;
    if (res.success) {
      forgotForm.reset();
      switchTab('login');
    }
    showFeedback(res.success ? res.message : (res.error || 'Failed to start password reset.'), !res.success);
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = modal.querySelector('#reset-password').value;
    if (password !== modal.querySelector('#reset-password-confirm').value) {
      showFeedback('The two passwords do not match.', true);
      return;
    }
    const btn = modal.querySelector('#reset-submit-btn');
    btn.disabled = true;
    const res = await resetPassword(resetToken, password);
    btn.disabled = false;
    if (res.success) {
      resetToken = null;
      resetForm.reset();
      switchTab('login');
    }
    showFeedback(res.success ? res.message : (res.error || 'Failed to reset password.'), !res.success);
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
      email: emailInput.value,
      username: accountType === 'student' ? usernameInput.value : undefined,
      password: modal.querySelector('#register-password').value,
      classLevel: accountType === 'student' ? modal.querySelector('#register-class').value : undefined
    });

    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (res.success) {
      registerForm.reset();
      applyAccountType(true);
      switchTab('login');
      showFeedback(res.message || 'Registration received. You can log in once your account is approved.');
    } else {
      showFeedback(res.error || 'Failed to create account.', true);
    }
  });

  return modal;
}
