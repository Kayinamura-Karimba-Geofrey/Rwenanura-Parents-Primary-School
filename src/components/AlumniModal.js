import { schoolInfo } from '../data/schoolData.js';
import { getUserRole, getCurrentUser, isAlumni, isStaffOrAdmin, logoutUser, onAuthChange } from '../data/userRole.js';
import { escapeHtml } from '../utils/html.js';
import { createChatPanel } from './alumni/chatPanel.js';
import { createDirectoryPanel } from './alumni/directoryPanel.js';
import { renderPortal } from './alumni/portalPanel.js';

/**
 * Alumni Network modal ("OBs & OGs ChatUp"): a shell with three tabs.
 *   chat      -> alumni/chatPanel.js
 *   directory -> alumni/directoryPanel.js
 *   portal    -> alumni/portalPanel.js
 *
 * The returned element exposes open(tab = 'chat', channel = null).
 */
export function createAlumniModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'alumni-chat-modal';

  let activeTab = 'chat'; // 'chat' | 'directory' | 'portal'

  modal.innerHTML = `
    <div class="modal-dialog alumni-dialog">
      <!-- Header -->
      <div class="alumni-header">
        <div class="alumni-header-left">
          <div class="logo-crest alumni-crest">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div class="alumni-title-row">
              <h3>RPPS OBs & OGs ChatUp</h3>
              <span class="alumni-live-badge"><span class="live-dot"></span> Live Community</span>
            </div>
            <p class="alumni-subtitle">Official Network for Old Boys & Old Girls of Rwenanura Parents Primary School</p>
          </div>
        </div>

        <div class="alumni-header-right" id="alumni-header-auth-slot">
          <!-- Populated dynamically based on auth status -->
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="alumni-nav-tabs" id="alumni-nav-tabs">
        <button class="alumni-tab-btn active" data-tab="chat">
          <span>💬 Live Lounge</span>
        </button>
        <button class="alumni-tab-btn" data-tab="directory">
          <span>👥 OBs & OGs Directory</span>
        </button>
        <button class="alumni-tab-btn" data-tab="portal" id="alumni-portal-tab-btn">
          <span id="portal-tab-label">🎓 Alumni Portal</span>
        </button>
      </div>

      <!-- WhatsApp Quick Community Bar (only when an invite link is configured) -->
      ${schoolInfo.links.alumniWhatsApp ? `
      <div class="alumni-whatsapp-quickbar">
        <div class="whatsapp-quick-text">
          <span class="whatsapp-badge-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.524zm6.208-3.805c1.474.875 3.09 1.338 4.743 1.339 5.431 0 9.849-4.418 9.851-9.852.001-2.633-1.023-5.108-2.887-6.973-1.863-1.864-4.337-2.89-6.97-2.891-5.432 0-9.85 4.418-9.852 9.852-.001 1.748.468 3.454 1.357 4.972l-.999 3.649 3.757-.986z"/>
            </svg>
          </span>
          <span>Prefer mobile messaging? Join the <strong>Official RPPS Alumni WhatsApp Community</strong></span>
        </div>
        <a href="${encodeURI(schoolInfo.links.alumniWhatsApp)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-pill">
          Join WhatsApp Group 📲
        </a>
      </div>` : ''}

      <!-- TAB 1: LIVE CHAT -->
      <div class="alumni-tab-content active" id="tab-chat-content">
        <!-- Channels Bar -->
        <div class="alumni-channels-bar" id="alumni-channels-container">
          <button class="channel-chip active" data-channel="general">
            <span class="ch-icon">💬</span>
            <span class="ch-name">General Lounge</span>
            <span class="ch-count" id="count-general">0</span>
          </button>
          <button class="channel-chip" data-channel="reunions">
            <span class="ch-icon">🤝</span>
            <span class="ch-name">Reunions & Events</span>
            <span class="ch-count" id="count-reunions">0</span>
          </button>
          <button class="channel-chip" data-channel="mentorship">
            <span class="ch-icon">💼</span>
            <span class="ch-name">Careers & Mentorship</span>
            <span class="ch-count" id="count-mentorship">0</span>
          </button>
          <button class="channel-chip" data-channel="memories">
            <span class="ch-icon">🏆</span>
            <span class="ch-name">School Memories</span>
            <span class="ch-count" id="count-memories">0</span>
          </button>
        </div>

        <!-- Chat Main Area -->
        <div class="alumni-chat-container">
          <!-- Search / Filter subbar -->
          <div class="alumni-search-subbar">
            <span id="active-channel-label" class="channel-tag-label"># General Lounge</span>
            <span class="live-status-pill" id="chat-live-status">
              <span class="live-dot"></span>
              <span id="chat-online-count">Live</span>
            </span>
            <div class="chat-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="chat-search-input" placeholder="Search alumni messages..." />
            </div>
            <div class="chat-year-filter-pills" id="chat-year-filters">
              <button class="year-pill active" data-year="all">All Batches</button>
              <button class="year-pill" data-year="2014-2016">2014–16</button>
              <button class="year-pill" data-year="2017-2019">2017–19</button>
              <button class="year-pill" data-year="2020">2020+</button>
            </div>
            <button id="refresh-chat-btn" class="btn-chat-icon" title="Refresh messages">🔄</button>
          </div>

          <!-- Messages Stream (Visible to all) -->
          <div class="alumni-messages-feed" id="alumni-messages-feed">
            <div class="chat-loading-state">Loading alumni conversations...</div>
          </div>

          <!-- Real-Time Typing Indicator Bubble -->
          <div class="chat-typing-indicator" id="chat-typing-indicator" hidden>
            <span class="typing-dots">
              <span></span><span></span><span></span>
            </span>
            <span class="typing-text" id="chat-typing-text">Someone is typing...</span>
          </div>

          <!-- Message Composer Area (Gated by Role) -->
          <div class="alumni-composer-wrap" id="alumni-composer-wrap">
            <!-- Rendered dynamically depending on whether user is authenticated -->
          </div>
        </div>
      </div>

      <!-- TAB 2: DIRECTORY -->
      <div class="alumni-tab-content" id="tab-directory-content">
        <div class="directory-top-bar">
          <div class="directory-filters">
            <button class="filter-pill active" data-filter="all">All Alumni</button>
            <button class="filter-pill" data-filter="OB">Old Boys (OBs)</button>
            <button class="filter-pill" data-filter="OG">Old Girls (OGs)</button>
          </div>
          <div class="directory-search-box">
            <input type="text" id="directory-search-input" placeholder="Search by name, year, or profession..." />
          </div>
        </div>

        <div class="directory-stats-row" id="directory-stats-summary">
          <span>Loading alumni statistics...</span>
        </div>

        <div class="alumni-directory-grid" id="alumni-directory-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- TAB 3: ALUMNI PORTAL (ID CARD OR AUTH) -->
      <div class="alumni-tab-content" id="tab-portal-content">
        <div id="portal-content-container" class="portal-content-container">
          <!-- Dynamically populated: ID Card for logged in, or Login/Register forms for guests -->
        </div>
      </div>
    </div>
  `;

  const tabs = modal.querySelectorAll('.alumni-tab-btn');
  const tabContents = {
    chat: modal.querySelector('#tab-chat-content'),
    directory: modal.querySelector('#tab-directory-content'),
    portal: modal.querySelector('#tab-portal-content')
  };
  const headerAuthSlot = modal.querySelector('#alumni-header-auth-slot');
  const portalTabLabel = modal.querySelector('#portal-tab-label');
  const portalContainer = modal.querySelector('#portal-content-container');

  const chat = createChatPanel(modal, {
    isVisible: () => modal.classList.contains('active') && activeTab === 'chat',
    goToTab
  });

  const directory = createDirectoryPanel(modal, {
    onSayHi(name) {
      goToTab('chat');
      chat.prefill(`@${name} Greetings from fellow RPPS alumni! `);
    },
    onSignIn: () => goToTab('portal', { subTab: 'login' })
  });

  function showPortal(subTab) {
    renderPortal(portalContainer, { subTab, goToTab, closeModal });
  }

  // Switch to a tab and start/stop what it needs
  function goToTab(tab, { subTab = 'login' } = {}) {
    if (!tabContents[tab]) return;
    activeTab = tab;
    tabs.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
    Object.entries(tabContents).forEach(([key, el]) => el.classList.toggle('active', key === tab));

    if (tab === 'chat') {
      chat.start();
    } else {
      chat.stop();
      if (tab === 'directory') directory.load();
      if (tab === 'portal') showPortal(subTab);
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    chat.stop();
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('alumni-close-btn')) {
      closeModal();
    }
  });

  tabs.forEach(btn => {
    btn.addEventListener('click', () => goToTab(btn.getAttribute('data-tab')));
  });

  // Header: profile + sign out for members, sign-in button for visitors
  function renderHeader() {
    const user = getCurrentUser();
    if ((isAlumni() || isStaffOrAdmin()) && user) {
      const role = getUserRole();
      const initials = (user.name || 'Alumni').substring(0, 2).toUpperCase();
      const memberType = user.memberType === 'OG' ? 'OG' : 'OB';
      const roleBadge = role === 'alumni' ? memberType : (role === 'admin' ? 'ADMIN' : 'STAFF');

      headerAuthSlot.innerHTML = `
        <button id="btn-header-profile" class="alumni-persona-pill" title="View your RPPS Alumni profile">
          <span class="persona-avatar ${memberType === 'OG' ? 'avatar-og' : 'avatar-ob'}">${escapeHtml(initials)}</span>
          <span class="persona-info">
            <strong>${escapeHtml(user.name)}</strong>
            <small>${roleBadge} • ${escapeHtml(user.classYear || 'Verified')}</small>
          </span>
        </button>
        <button id="btn-header-logout" class="btn btn-outline btn-sm" title="Sign Out">Sign Out ⎋</button>
        <button class="modal-close alumni-close-btn" aria-label="Close modal">&times;</button>
      `;
      headerAuthSlot.querySelector('#btn-header-profile').addEventListener('click', () => goToTab('portal'));
      headerAuthSlot.querySelector('#btn-header-logout').addEventListener('click', () => logoutUser());
      portalTabLabel.textContent = '🎓 My Alumni ID';
    } else {
      headerAuthSlot.innerHTML = `
        <button id="btn-header-login" class="btn btn-primary btn-sm" title="Sign in as an RPPS Alumnus">
          <span>Alumni Sign In / Join 🎓</span>
        </button>
        <button class="modal-close alumni-close-btn" aria-label="Close modal">&times;</button>
      `;
      headerAuthSlot.querySelector('#btn-header-login').addEventListener('click', () => goToTab('portal'));
      portalTabLabel.textContent = '🎓 Sign In / Join';
    }
  }

  function renderRoleBasedUI() {
    renderHeader();
    chat.renderComposer();
    if (activeTab === 'portal') showPortal('login');
    if (activeTab === 'directory') directory.load();
  }

  renderRoleBasedUI();
  onAuthChange(renderRoleBasedUI);

  modal.open = (targetTab = 'chat', targetChannel = null) => {
    modal.classList.add('active');
    goToTab(tabContents[targetTab] ? targetTab : 'chat');
    if (targetChannel) chat.selectChannel(targetChannel);
  };

  return modal;
}
