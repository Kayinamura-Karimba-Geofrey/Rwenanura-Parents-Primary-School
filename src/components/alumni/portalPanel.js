import { registerAlumniAccount, loginUser } from '../../data/api.js';
import { getUserRole, getCurrentUser, isAlumni, isStaffOrAdmin, logoutUser } from '../../data/userRole.js';
import { escapeHtml } from '../../utils/html.js';

/**
 * "Alumni Portal" tab of the alumni modal: the digital membership card for
 * signed-in members, or the sign-in / registration forms for visitors.
 *
 * @param {HTMLElement} container
 * @param {object} options
 *   subTab         'login' | 'register' (visitors)
 *   goToTab(tab)   switch the modal to 'chat' or 'directory'
 *   closeModal()   close the alumni modal
 */
export function renderPortal(container, { subTab = 'login', goToTab, closeModal }) {
  const user = getCurrentUser();
  if ((isAlumni() || isStaffOrAdmin()) && user) {
    renderMembershipCard(container, user, goToTab);
  } else {
    renderAuthForms(container, subTab, goToTab, closeModal);
  }
}

function renderMembershipCard(container, user, goToTab) {
  const role = getUserRole();
  const isOB = (user.memberType || 'OB').toUpperCase() === 'OB';
  const initials = (user.name || 'Alumni').substring(0, 2).toUpperCase();

  container.innerHTML = `
    <div class="alumni-id-card-wrapper">
      <div class="alumni-id-card">
        <div class="id-card-top">
          <div class="id-card-brand">
            <div class="logo-crest id-card-crest">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <h4>Rwenanura Parents Primary School</h4>
              <span>Official Alumni Association ID</span>
            </div>
          </div>
          <div class="id-card-ribbon ${isOB ? 'ribbon-ob' : 'ribbon-og'}">
            ${escapeHtml(user.memberType || (role === 'admin' ? 'ADMIN' : 'OB'))}
          </div>
        </div>

        <div class="id-card-body">
          <div class="id-avatar ${isOB ? 'avatar-ob' : 'avatar-og'}">${escapeHtml(initials)}</div>
          <div class="id-details">
            <h3 class="id-name">${escapeHtml(user.name)}</h3>
            <div class="id-meta-line">
              <span class="id-class-tag">${escapeHtml(user.classYear || 'Alumni')}</span>
              ${user.profession ? `<span class="id-prof-tag">• ${escapeHtml(user.profession)}</span>` : ''}
            </div>
            <div class="id-contact-grid">
              <div><strong>Email:</strong> ${escapeHtml(user.email)}</div>
              ${user.phone ? `<div><strong>Phone:</strong> ${escapeHtml(user.phone)}</div>` : ''}
              ${user.location ? `<div><strong>Location:</strong> ${escapeHtml(user.location)}</div>` : ''}
            </div>
            ${user.bio ? `<p class="id-quote">"${escapeHtml(user.bio)}"</p>` : ''}
          </div>
        </div>

        <div class="id-card-footer">
          <div class="id-card-status"><span class="status-indicator"></span> Verified Community Member</div>
          <div class="id-card-school-motto">"Light, Leadership & Excellence"</div>
        </div>
      </div>

      <div class="id-card-actions">
        <button class="btn btn-primary btn-jump-chat"><span>Go to Live ChatUp 💬</span></button>
        <button class="btn btn-outline btn-jump-dir"><span>Browse Alumni Directory 👥</span></button>
        <button class="btn btn-outline-danger btn-portal-logout"><span>Sign Out ⎋</span></button>
      </div>
    </div>
  `;

  container.querySelector('.btn-jump-chat').addEventListener('click', () => goToTab('chat'));
  container.querySelector('.btn-jump-dir').addEventListener('click', () => goToTab('directory'));
  container.querySelector('.btn-portal-logout').addEventListener('click', () => logoutUser());
}

function renderAuthForms(container, subTab, goToTab, closeModal) {
  container.innerHTML = `
    <div class="alumni-auth-container">
      <div class="auth-subtabs-nav">
        <button class="subtab-btn ${subTab === 'login' ? 'active' : ''}" data-subtab="login"><span>Alumni Sign In</span></button>
        <button class="subtab-btn ${subTab === 'register' ? 'active' : ''}" data-subtab="register"><span>New Alumni Registration</span></button>
      </div>

      <div id="auth-status-alert" class="auth-status-alert" role="status" hidden></div>

      <div class="auth-subtab-pane ${subTab === 'login' ? 'active' : ''}" id="pane-login">
        <form id="alumni-login-form" class="auth-form-card">
          <div class="form-header">
            <h4>Sign In to RPPS Alumni Network</h4>
            <p>Enter your credentials to unlock chat posting, direct contacts, and networking.</p>
          </div>

          <div class="form-group">
            <label for="modal-login-email">Registered Alumni Email *</label>
            <input type="email" id="modal-login-email" required autocomplete="username" placeholder="e.g. emmanuel.m@gmail.com" />
          </div>

          <div class="form-group">
            <label for="modal-login-password">Password *</label>
            <input type="password" id="modal-login-password" required autocomplete="current-password" placeholder="••••••••" />
          </div>

          <button type="submit" id="btn-modal-login-submit" class="btn btn-primary btn-block">Sign In to Alumni Network 🚀</button>
          <div class="auth-links">
            <button type="button" class="btn-link-action" id="alumni-forgot-password">Forgot password?</button>
          </div>
        </form>
      </div>

      <div class="auth-subtab-pane ${subTab === 'register' ? 'active' : ''}" id="pane-register">
        <form id="alumni-signup-form" class="auth-form-card">
          <div class="form-header">
            <h4>Register in RPPS Alumni Community</h4>
            <p>Create your verified profile to reconnect with your graduating cohort.</p>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="reg-name">Full Name *</label>
              <input type="text" id="reg-name" required maxlength="120" autocomplete="name" placeholder="e.g. Sandra Uwase" />
            </div>
            <div class="form-group">
              <label for="reg-type">I am an *</label>
              <select id="reg-type" required>
                <option value="OB">Old Boy (OB)</option>
                <option value="OG" selected>Old Girl (OG)</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="reg-year">Class Graduation Year *</label>
              <input type="text" id="reg-year" required maxlength="40" placeholder="e.g. Class of 2016" />
            </div>
            <div class="form-group">
              <label for="reg-profession">Current Profession / Work</label>
              <input type="text" id="reg-profession" maxlength="120" placeholder="e.g. Biomedical Scientist" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="reg-email">Email Address *</label>
              <input type="email" id="reg-email" required maxlength="200" autocomplete="email" placeholder="e.g. sandra@example.com" />
            </div>
            <div class="form-group">
              <label for="reg-password">Create Password * (min 8 chars)</label>
              <input type="password" id="reg-password" required minlength="8" maxlength="128" autocomplete="new-password" placeholder="••••••••" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="reg-phone">Phone / WhatsApp Number</label>
              <input type="tel" id="reg-phone" maxlength="30" autocomplete="tel" placeholder="e.g. +250 788 123 456" />
            </div>
            <div class="form-group">
              <label for="reg-location">Current Location</label>
              <input type="text" id="reg-location" maxlength="120" placeholder="e.g. Kigali, Rwanda" />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-bio">Memory or Advice for Current Pupils</label>
            <textarea id="reg-bio" rows="2" maxlength="600" placeholder="Share a few words of advice or fond memories of your teachers..."></textarea>
          </div>

          <button type="submit" id="btn-modal-reg-submit" class="btn btn-primary btn-block">Create Account & Join Network 🎉</button>
        </form>
      </div>
    </div>
  `;

  const statusAlert = container.querySelector('#auth-status-alert');
  const subtabBtns = container.querySelectorAll('.subtab-btn');
  const subtabPanes = container.querySelectorAll('.auth-subtab-pane');

  function showAlert(msg, isError = false) {
    statusAlert.hidden = false;
    statusAlert.className = `auth-status-alert ${isError ? 'alert-error' : 'alert-success'}`;
    statusAlert.textContent = msg;
  }

  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab');
      subtabBtns.forEach(b => b.classList.toggle('active', b === btn));
      subtabPanes.forEach(p => p.classList.toggle('active', p.id === `pane-${target}`));
      statusAlert.hidden = true;
    });
  });

  const loginForm = container.querySelector('#alumni-login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#btn-modal-login-submit');
    btn.disabled = true;
    btn.textContent = 'Authenticating...';

    const res = await loginUser(
      container.querySelector('#modal-login-email').value.trim(),
      container.querySelector('#modal-login-password').value
    );

    btn.disabled = false;
    btn.textContent = 'Sign In to Alumni Network 🚀';

    if (res.success) {
      showAlert('Welcome back! Switching to Live Lounge...');
      setTimeout(() => goToTab('chat'), 400);
    } else {
      showAlert(res.error || 'Invalid email or password.', true);
    }
  });

  container.querySelector('#alumni-forgot-password').addEventListener('click', () => {
    closeModal();
    window.dispatchEvent(new CustomEvent('rpps-open-auth', { detail: 'forgot' }));
  });

  const regForm = container.querySelector('#alumni-signup-form');
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = id => container.querySelector(`#${id}`).value.trim();
    const btn = container.querySelector('#btn-modal-reg-submit');
    btn.disabled = true;
    btn.textContent = 'Registering Account...';

    const res = await registerAlumniAccount({
      name: value('reg-name'),
      memberType: value('reg-type'),
      classYear: value('reg-year'),
      profession: value('reg-profession'),
      email: value('reg-email'),
      password: container.querySelector('#reg-password').value,
      phone: value('reg-phone'),
      location: value('reg-location'),
      bio: value('reg-bio')
    });

    btn.disabled = false;
    btn.textContent = 'Create Account & Join Network 🎉';

    if (res.success) {
      // The account is activated from the emailed confirmation link
      regForm.reset();
      showAlert(res.message || 'Check your email for a confirmation link to activate your account.');
    } else {
      showAlert(res.error || 'Failed to create account.', true);
    }
  });
}
