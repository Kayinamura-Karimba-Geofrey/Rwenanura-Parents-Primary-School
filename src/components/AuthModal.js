import { loginUser, signupUser } from '../data/api.js';

export function createAuthModal(onAuthSuccess) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'auth-modal';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 480px; width: 90%;">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div class="logo-crest" style="width: 45px; height: 45px; margin: 0 auto 0.75rem auto;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 style="font-size: 1.5rem; color: var(--navy); margin-bottom: 0.25rem;">Staff & Admin Portal</h3>
        <p style="color: var(--gray-600); font-size: 0.88rem;">Authenticate to access school management dashboard</p>
      </div>

      <!-- Tabs -->
      <div style="display: flex; border-bottom: 2px solid var(--gray-200); margin-bottom: 1.25rem;">
        <button id="tab-login-btn" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 0.95rem; border: none; background: none; border-bottom: 3px solid var(--primary); color: var(--primary); cursor: pointer;">
          Login
        </button>
        <button id="tab-signup-btn" style="flex: 1; padding: 0.75rem; font-weight: 600; font-size: 0.95rem; border: none; background: none; border-bottom: 3px solid transparent; color: var(--gray-500); cursor: pointer;">
          Sign Up (New Staff)
        </button>
      </div>

      <!-- Feedback Banner -->
      <div id="auth-feedback" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.88rem;"></div>

      <!-- LOGIN FORM -->
      <form id="auth-login-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Staff Email</label>
          <input type="email" id="login-email" required placeholder="admin@rwenanura.ac.rw" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Password</label>
          <input type="password" id="login-password" required placeholder="••••••••" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="background: var(--gray-100); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; font-size: 0.8rem; color: var(--gray-600);">
          💡 <strong>Default Admin Credentials:</strong><br />
          Email: <code style="color: var(--primary);">admin@rwenanura.ac.rw</code> | Password: <code style="color: var(--primary);">Admin@2026</code>
        </div>

        <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
          Sign In to Dashboard
        </button>
      </form>

      <!-- SIGNUP FORM -->
      <form id="auth-signup-form" style="display: none;">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Full Name *</label>
          <input type="text" id="signup-name" required placeholder="e.g. Teacher Eric Mutabazi" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Official Email *</label>
          <input type="email" id="signup-email" required placeholder="eric@rwenanura.ac.rw" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Password *</label>
            <input type="password" id="signup-password" required minlength="6" placeholder="Min 6 chars" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--navy); margin-bottom: 0.35rem;">Role Level</label>
            <select id="signup-role" style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.9rem; background: white;">
              <option value="staff">School Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <button type="submit" id="signup-submit-btn" class="btn btn-gold" style="width: 100%; padding: 0.85rem;">
          Register Account
        </button>
      </form>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  const tabLogin = modal.querySelector('#tab-login-btn');
  const tabSignup = modal.querySelector('#tab-signup-btn');
  const loginForm = modal.querySelector('#auth-login-form');
  const signupForm = modal.querySelector('#auth-signup-form');
  const feedback = modal.querySelector('#auth-feedback');

  function showFeedback(msg, isError = false) {
    feedback.style.display = 'block';
    feedback.style.backgroundColor = isError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(13, 92, 58, 0.1)';
    feedback.style.color = isError ? '#dc2626' : 'var(--primary)';
    feedback.style.border = `1px solid ${isError ? '#fca5a5' : 'var(--primary-light)'}`;
    feedback.textContent = msg;
  }

  tabLogin.addEventListener('click', () => {
    tabLogin.style.borderBottom = '3px solid var(--primary)';
    tabLogin.style.color = 'var(--primary)';
    tabSignup.style.borderBottom = '3px solid transparent';
    tabSignup.style.color = 'var(--gray-500)';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    feedback.style.display = 'none';
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.style.borderBottom = '3px solid var(--gold)';
    tabSignup.style.color = 'var(--navy)';
    tabLogin.style.borderBottom = '3px solid transparent';
    tabLogin.style.color = 'var(--gray-500)';
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    feedback.style.display = 'none';
  });

  // Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = modal.querySelector('#login-email').value;
    const password = modal.querySelector('#login-password').value;
    const btn = modal.querySelector('#login-submit-btn');

    btn.disabled = true;
    btn.textContent = 'Authenticating...';
    feedback.style.display = 'none';

    const res = await loginUser(email, password);

    if (res.success) {
      showFeedback('Login successful! Redirecting to dashboard...', false);
      setTimeout(() => {
        modal.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }, 500);
    } else {
      showFeedback(res.error || 'Invalid credentials.', true);
    }

    btn.disabled = false;
    btn.textContent = 'Sign In to Dashboard';
  });

  // Signup Form Submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#signup-name').value;
    const email = modal.querySelector('#signup-email').value;
    const password = modal.querySelector('#signup-password').value;
    const role = modal.querySelector('#signup-role').value;
    const btn = modal.querySelector('#signup-submit-btn');

    btn.disabled = true;
    btn.textContent = 'Creating account...';
    feedback.style.display = 'none';

    const res = await signupUser(name, email, password, role);

    if (res.success) {
      showFeedback('Account created successfully! Welcome to RPPS Portal.', false);
      setTimeout(() => {
        modal.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }, 600);
    } else {
      showFeedback(res.error || 'Failed to create account.', true);
    }

    btn.disabled = false;
    btn.textContent = 'Register Account';
  });

  return modal;
}
