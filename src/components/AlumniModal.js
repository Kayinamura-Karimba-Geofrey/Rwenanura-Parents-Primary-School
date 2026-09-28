import { 
  fetchAlumniMessages, 
  sendAlumniMessage, 
  reactToAlumniMessage, 
  fetchAlumniChannels, 
  fetchAlumniMembers, 
  registerAlumniMember,
  getStoredAlumniProfile,
  setStoredAlumniProfile
} from '../data/api.js';

export function createAlumniModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'alumni-chat-modal';

  let currentChannel = 'general';
  let activeTab = 'chat'; // 'chat' | 'directory' | 'register'
  let currentFilter = 'all';
  let pollInterval = null;
  let messagesList = [];

  // Default / Stored user profile
  let userProfile = getStoredAlumniProfile() || {
    name: '',
    type: 'OB', // 'OB' or 'OG'
    classYear: 'Class of 2018',
    profession: 'Alumni Member',
    color: '#0d5c3a'
  };

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

        <div class="alumni-header-right">
          <!-- Persona Pill Button -->
          <button id="alumni-profile-btn" class="alumni-persona-pill" title="Click to edit your OB/OG profile">
            <span class="persona-avatar" id="header-avatar-badge">${userProfile.type || 'OB'}</span>
            <span class="persona-info">
              <strong id="header-persona-name">${userProfile.name || 'Set Your Persona'}</strong>
              <small id="header-persona-tag">${userProfile.name ? `${userProfile.type} • ${userProfile.classYear}` : 'Join the chat'}</small>
            </span>
            <span class="edit-icon">✏️</span>
          </button>
          
          <button class="modal-close alumni-close-btn" aria-label="Close modal">&times;</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="alumni-nav-tabs">
        <button class="alumni-tab-btn active" data-tab="chat">
          <span>💬 Channels & Chat</span>
        </button>
        <button class="alumni-tab-btn" data-tab="directory">
          <span>👥 OBs & OGs Directory</span>
        </button>
        <button class="alumni-tab-btn" data-tab="register">
          <span>🎓 Join Network</span>
        </button>
      </div>

      <!-- WhatsApp Quick Community Bar -->
      <div class="alumni-whatsapp-quickbar">
        <div class="whatsapp-quick-text">
          <span class="whatsapp-badge-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.524zm6.208-3.805c1.474.875 3.09 1.338 4.743 1.339 5.431 0 9.849-4.418 9.851-9.852.001-2.633-1.023-5.108-2.887-6.973-1.863-1.864-4.337-2.89-6.97-2.891-5.432 0-9.85 4.418-9.852 9.852-.001 1.748.468 3.454 1.357 4.972l-.999 3.649 3.757-.986z"/>
            </svg>
          </span>
          <span>Prefer mobile messaging? Join the <strong>Official RPPS Alumni WhatsApp Community</strong></span>
        </div>
        <a href="https://chat.whatsapp.com/invite/sample-rpps-alumni" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-pill">
          Join WhatsApp Group 📲
        </a>
      </div>

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

          <!-- Messages Stream -->
          <div class="alumni-messages-feed" id="alumni-messages-feed">
            <div class="chat-loading-state">Loading alumni conversations...</div>
          </div>

          <!-- Message Composer Area -->
          <div class="alumni-composer-wrap">
            <!-- Profile Prompt if not configured -->
            <div id="persona-quick-bar" class="persona-quick-bar" style="${userProfile.name ? 'display: none;' : 'display: flex;'}">
              <span>👋 You are currently posting as a guest.</span>
              <button id="quick-set-persona" class="btn-link-action">Customize your OB/OG name & year &rarr;</button>
            </div>

            <!-- Quick Emoji Buttons -->
            <div class="quick-reactions-bar">
              <button class="reaction-tag" data-emoji="👏">👏 Cheers</button>
              <button class="reaction-tag" data-emoji="🎓">🎓 Proud OB/OG</button>
              <button class="reaction-tag" data-emoji="❤️">❤️ Love RPPS</button>
              <button class="reaction-tag" data-emoji="🔥">🔥 High Five</button>
              <button class="reaction-tag" data-emoji="🏆">🏆 Top School</button>
            </div>

            <form id="alumni-message-form" class="alumni-input-form">
              <textarea 
                id="alumni-message-input" 
                rows="2" 
                placeholder="Share a thought, reunion plan, or memory with fellow OBs & OGs... (Press Enter to send)"
                required
              ></textarea>
              <button type="submit" id="btn-send-message" class="btn btn-gold btn-send-alumni">
                <span>Send</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
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

      <!-- TAB 3: REGISTER IN NETWORK -->
      <div class="alumni-tab-content" id="tab-register-content">
        <div class="alumni-register-card">
          <div class="register-header">
            <h4>🎓 Register in RPPS OBs & OGs Alumni Network</h4>
            <p>Reconnect with your classmates, get invitations to school reunions, and mentor upcoming primary pupils.</p>
          </div>

          <form id="alumni-register-form" class="register-grid">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" id="reg-name" required placeholder="e.g. Sandra Uwase" />
            </div>

            <div class="form-group">
              <label>I am an *</label>
              <select id="reg-type" required>
                <option value="OB">Old Boy (OB)</option>
                <option value="OG" selected>Old Girl (OG)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Primary Graduation / Class Year *</label>
              <input type="text" id="reg-year" required placeholder="e.g. Class of 2016" />
            </div>

            <div class="form-group">
              <label>Current Profession / University / Work</label>
              <input type="text" id="reg-profession" placeholder="e.g. Civil Engineer, Kigali" />
            </div>

            <div class="form-group">
              <label>Current City / Country</label>
              <input type="text" id="reg-location" placeholder="e.g. Nyagatare, Rwanda" />
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="reg-email" placeholder="e.g. sandra@example.com" />
            </div>

            <div class="form-group">
              <label>Phone / WhatsApp Number</label>
              <input type="tel" id="reg-phone" placeholder="e.g. +250 788 123 456" />
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label>Message / Memory to Current Pupils & Staff</label>
              <textarea id="reg-bio" rows="3" placeholder="Share a few words of advice for current pupils or fond memories of your teachers..."></textarea>
            </div>

            <div class="form-actions" style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="submit" class="btn btn-primary" id="btn-submit-registration">
                Register as RPPS Alumni 🎉
              </button>
            </div>
          </form>

          <div id="register-status-msg" style="display: none; margin-top: 1rem;"></div>
        </div>
      </div>

      <!-- Persona Profile Setup Drawer/Modal Overlay -->
      <div id="persona-edit-modal" class="persona-edit-overlay" style="display: none;">
        <div class="persona-edit-box">
          <div class="persona-edit-header">
            <h4>Set Your Alumni Persona</h4>
            <button id="close-persona-edit" class="btn-close-sm">&times;</button>
          </div>
          <p class="persona-edit-desc">This profile is displayed next to your messages in the live OBs & OGs chat room.</p>
          
          <form id="persona-edit-form">
            <div class="form-group">
              <label>Your Name *</label>
              <input type="text" id="edit-persona-name" required placeholder="e.g. Patrick Mugisha" value="${userProfile.name || ''}" />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Alumni Type *</label>
                <select id="edit-persona-type">
                  <option value="OB" ${userProfile.type === 'OB' ? 'selected' : ''}>Old Boy (OB)</option>
                  <option value="OG" ${userProfile.type === 'OG' ? 'selected' : ''}>Old Girl (OG)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Class Year *</label>
                <input type="text" id="edit-persona-year" required placeholder="e.g. Class of 2015" value="${userProfile.classYear || 'Class of 2018'}" />
              </div>
            </div>

            <div class="form-group">
              <label>Profession / Title</label>
              <input type="text" id="edit-persona-profession" placeholder="e.g. Software Developer, Kigali" value="${userProfile.profession || ''}" />
            </div>

            <div class="persona-save-actions">
              <button type="submit" class="btn btn-primary" style="width: 100%;">Save Persona & Continue Chat</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // UI Element References
  const closeBtn = modal.querySelector('.alumni-close-btn');
  const tabs = modal.querySelectorAll('.alumni-tab-btn');
  const tabContents = {
    chat: modal.querySelector('#tab-chat-content'),
    directory: modal.querySelector('#tab-directory-content'),
    register: modal.querySelector('#tab-register-content')
  };

  const channelsContainer = modal.querySelector('#alumni-channels-container');
  const messagesFeed = modal.querySelector('#alumni-messages-feed');
  const messageForm = modal.querySelector('#alumni-message-form');
  const messageInput = modal.querySelector('#alumni-message-input');
  const searchInput = modal.querySelector('#chat-search-input');
  const refreshBtn = modal.querySelector('#refresh-chat-btn');
  const activeChannelLabel = modal.querySelector('#active-channel-label');

  // Persona Modal References
  const profileBtn = modal.querySelector('#alumni-profile-btn');
  const personaEditOverlay = modal.querySelector('#persona-edit-modal');
  const closePersonaBtn = modal.querySelector('#close-persona-edit');
  const personaForm = modal.querySelector('#persona-edit-form');
  const quickPersonaBtn = modal.querySelector('#quick-set-persona');
  const personaQuickBar = modal.querySelector('#persona-quick-bar');

  // Directory References
  const directoryGrid = modal.querySelector('#alumni-directory-grid');
  const directorySearchInput = modal.querySelector('#directory-search-input');
  const directoryFilters = modal.querySelectorAll('.filter-pill');
  const directoryStats = modal.querySelector('#directory-stats-summary');

  // Registration References
  const registerForm = modal.querySelector('#alumni-register-form');
  const registerStatus = modal.querySelector('#register-status-msg');

  // Close handlers
  const closeModal = () => {
    modal.classList.remove('active');
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Switch Tabs
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');

      Object.values(tabContents).forEach(c => c.classList.remove('active'));
      if (tabContents[activeTab]) {
        tabContents[activeTab].classList.add('active');
      }

      if (activeTab === 'chat') {
        loadMessages();
        startPolling();
      } else if (activeTab === 'directory') {
        loadDirectory();
      }
    });
  });

  // Switch Channels
  channelsContainer.querySelectorAll('.channel-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      channelsContainer.querySelectorAll('.channel-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChannel = btn.getAttribute('data-channel');
      
      const channelTitles = {
        general: '# General Lounge',
        reunions: '# Reunions & Events',
        mentorship: '# Careers & Mentorship',
        memories: '# School Memories'
      };
      activeChannelLabel.textContent = channelTitles[currentChannel] || `# ${currentChannel}`;
      loadMessages();
    });
  });

  // Quick reactions click
  modal.querySelectorAll('.reaction-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const emoji = tag.getAttribute('data-emoji');
      messageInput.value = (messageInput.value.trim() ? messageInput.value.trim() + ' ' : '') + emoji + ' ';
      messageInput.focus();
    });
  });

  // Batch / Cohort Year Filters
  let selectedCohort = 'all';
  const cohortPills = modal.querySelectorAll('.chat-year-filter-pills .year-pill');
  cohortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      cohortPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedCohort = pill.getAttribute('data-year');
      applyFiltersAndRender();
    });
  });

  function applyFiltersAndRender() {
    let filtered = messagesList;
    if (selectedCohort !== 'all') {
      filtered = messagesList.filter(msg => {
        const yr = (msg.class_year || '').toLowerCase();
        if (selectedCohort === '2014-2016') {
          return yr.includes('2014') || yr.includes('2015') || yr.includes('2016');
        } else if (selectedCohort === '2017-2019') {
          return yr.includes('2017') || yr.includes('2018') || yr.includes('2019');
        } else if (selectedCohort === '2020') {
          return yr.includes('2020') || yr.includes('2021') || yr.includes('2022') || yr.includes('2023') || yr.includes('2024') || yr.includes('2025');
        }
        return true;
      });
    }
    renderMessages(filtered);
  }

  // Load and Render Messages
  async function loadMessages(isBackground = false) {
    if (!isBackground) {
      messagesFeed.innerHTML = '<div class="chat-loading-state">Loading messages...</div>';
    }

    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const res = await fetchAlumniMessages(currentChannel, searchTerm);

    if (res.success && res.messages) {
      messagesList = res.messages;
      applyFiltersAndRender();
      updateChannelCounts();
    } else if (!isBackground) {
      messagesFeed.innerHTML = `<div class="chat-empty-state">Could not connect to the alumni chat server. Please ensure the backend is running.</div>`;
    }
  }

  // Update counts
  async function updateChannelCounts() {
    const res = await fetchAlumniChannels();
    if (res.success && res.channels) {
      res.channels.forEach(ch => {
        const countEl = modal.querySelector(`#count-${ch.id}`);
        if (countEl) countEl.textContent = ch.messageCount;
      });
    }
  }

  function renderMessages(list) {
    if (!list || list.length === 0) {
      messagesFeed.innerHTML = `
        <div class="chat-empty-state">
          <div class="empty-icon">💬</div>
          <h4>No messages yet in this channel</h4>
          <p>Be the first Old Boy or Old Girl to break the ice and share a greeting!</p>
        </div>
      `;
      return;
    }

    const wasScrolledToBottom = messagesFeed.scrollHeight - messagesFeed.clientHeight <= messagesFeed.scrollTop + 80;

    messagesFeed.innerHTML = list.map(msg => {
      const isOB = msg.author_type === 'OB';
      const badgeClass = isOB ? 'badge-ob' : 'badge-og';
      const initials = (msg.author_name || 'Alumni').substring(0, 2).toUpperCase();
      const timeStr = formatTimestamp(msg.created_at);

      return `
        <div class="chat-message-item" data-id="${msg.id}">
          <div class="message-avatar" style="background-color: ${msg.avatar_color && msg.avatar_color !== '#1e40af' && msg.avatar_color !== '#be185d' ? msg.avatar_color : (isOB ? '#0d5c3a' : '#d97706')};">
            ${initials}
          </div>
          <div class="message-content-wrap">
            <div class="message-header-line">
              <span class="message-author">${escapeHtml(msg.author_name)}</span>
              <span class="alumni-badge ${badgeClass}">${msg.author_type}</span>
              <span class="message-class">${escapeHtml(msg.class_year || '')}</span>
              ${msg.profession ? `<span class="message-profession">• ${escapeHtml(msg.profession)}</span>` : ''}
              <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-body-text">
              ${escapeHtml(msg.content)}
            </div>
            <div class="message-actions-row">
              <button class="btn-reaction-cheer" data-msg-id="${msg.id}">
                <span class="cheer-heart">❤️</span>
                <span class="cheer-count">${msg.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach reaction listeners
    messagesFeed.querySelectorAll('.btn-reaction-cheer').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-msg-id');
        btn.classList.add('reacting');
        const res = await reactToAlumniMessage(id);
        if (res.success) {
          const countSpan = btn.querySelector('.cheer-count');
          if (countSpan) countSpan.textContent = res.likesCount;
        }
        setTimeout(() => btn.classList.remove('reacting'), 400);
      });
    });

    if (wasScrolledToBottom) {
      messagesFeed.scrollTop = messagesFeed.scrollHeight;
    }
  }

  // Format timestamp
  function formatTimestamp(isoStr) {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Polling loop
  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(() => {
      if (modal.classList.contains('active') && activeTab === 'chat') {
        loadMessages(true);
      }
    }, 4000);
  }

  // Handle Send Message
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;

    if (!userProfile.name) {
      openPersonaEdit();
      return;
    }

    const payload = {
      channel: currentChannel,
      authorName: userProfile.name,
      authorType: userProfile.type,
      classYear: userProfile.classYear,
      profession: userProfile.profession,
      avatarColor: userProfile.color,
      content
    };

    const submitBtn = modal.querySelector('#btn-send-message');
    submitBtn.disabled = true;

    const res = await sendAlumniMessage(payload);

    submitBtn.disabled = false;

    if (res.success) {
      messageInput.value = '';
      await loadMessages(true);
      messagesFeed.scrollTop = messagesFeed.scrollHeight;
    } else {
      alert(res.error || 'Failed to send message. Please try again.');
    }
  });

  // Enter to send support
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      messageForm.dispatchEvent(new Event('submit'));
    }
  });

  // Search input with debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadMessages();
    }, 350);
  });

  refreshBtn.addEventListener('click', () => loadMessages());

  // Persona Edit Open/Close/Save
  function openPersonaEdit() {
    personaEditOverlay.style.display = 'flex';
    modal.querySelector('#edit-persona-name').focus();
  }

  function closePersonaEdit() {
    personaEditOverlay.style.display = 'none';
  }

  profileBtn.addEventListener('click', openPersonaEdit);
  quickPersonaBtn.addEventListener('click', openPersonaEdit);
  closePersonaBtn.addEventListener('click', closePersonaEdit);
  personaEditOverlay.addEventListener('click', (e) => {
    if (e.target === personaEditOverlay) closePersonaEdit();
  });

  personaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modal.querySelector('#edit-persona-name').value.trim();
    const type = modal.querySelector('#edit-persona-type').value;
    const classYear = modal.querySelector('#edit-persona-year').value.trim();
    const profession = modal.querySelector('#edit-persona-profession').value.trim();

    if (!name || !classYear) return;

    userProfile = {
      name,
      type,
      classYear,
      profession,
      color: type === 'OB' ? '#0d5c3a' : '#d97706'
    };

    setStoredAlumniProfile(userProfile);
    updatePersonaDisplay();
    closePersonaEdit();
  });

  function updatePersonaDisplay() {
    const avatarBadge = modal.querySelector('#header-avatar-badge');
    const nameEl = modal.querySelector('#header-persona-name');
    const tagEl = modal.querySelector('#header-persona-tag');

    if (userProfile.name) {
      avatarBadge.textContent = userProfile.type;
      avatarBadge.style.backgroundColor = userProfile.color;
      nameEl.textContent = userProfile.name;
      tagEl.textContent = `${userProfile.type} • ${userProfile.classYear}`;
      personaQuickBar.style.display = 'none';
    } else {
      avatarBadge.textContent = 'OB';
      nameEl.textContent = 'Set Your Persona';
      tagEl.textContent = 'Join the chat';
      personaQuickBar.style.display = 'flex';
    }
  }

  // Tab 2: Directory Loader
  async function loadDirectory() {
    directoryGrid.innerHTML = '<div class="chat-loading-state">Loading alumni members directory...</div>';
    
    const searchTerm = directorySearchInput.value.trim();
    const typeFilter = currentFilter === 'all' ? '' : currentFilter;

    const res = await fetchAlumniMembers(typeFilter, searchTerm);

    if (res.success && res.members) {
      const stats = res.stats || {};
      directoryStats.innerHTML = `
        <strong>${res.total || 0} Registered Alumni</strong> 
        (<span>👨 ${stats.obCount || 0} Old Boys</span> • <span>👩 ${stats.ogCount || 0} Old Girls</span>)
      `;

      if (res.members.length === 0) {
        directoryGrid.innerHTML = `
          <div class="chat-empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">👥</div>
            <h4>No alumni found</h4>
            <p>Try a different keyword or register a new member profile.</p>
          </div>
        `;
        return;
      }

      directoryGrid.innerHTML = res.members.map(member => {
        const isOB = member.member_type === 'OB';
        const badgeClass = isOB ? 'badge-ob' : 'badge-og';
        const color = isOB ? '#0d5c3a' : '#d97706';
        const initials = (member.name || 'Alumni').substring(0, 2).toUpperCase();

        return `
          <div class="alumni-member-card">
            <div class="member-card-header">
              <div class="member-avatar" style="background-color: ${color};">
                ${initials}
              </div>
              <div>
                <h5 class="member-name">${escapeHtml(member.name)}</h5>
                <div class="member-meta">
                  <span class="alumni-badge ${badgeClass}">${member.member_type}</span>
                  <span class="member-year">${escapeHtml(member.class_year)}</span>
                </div>
              </div>
            </div>

            <div class="member-card-body">
              ${member.profession ? `<div class="member-detail">💼 <strong>${escapeHtml(member.profession)}</strong></div>` : ''}
              ${member.location ? `<div class="member-detail">📍 ${escapeHtml(member.location)}</div>` : ''}
              ${member.bio ? `<p class="member-bio">"${escapeHtml(member.bio)}"</p>` : ''}
            </div>

            <div class="member-card-footer">
              <button class="btn-say-hi" data-name="${escapeHtml(member.name)}">
                👋 Say Hi in Chat
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Wire "Say Hi" buttons
      directoryGrid.querySelectorAll('.btn-say-hi').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-name');
          tabs.forEach(b => {
            if (b.getAttribute('data-tab') === 'chat') b.click();
          });
          messageInput.value = `@${name} Greetings from fellow RPPS alumni! `;
          messageInput.focus();
        });
      });
    } else {
      directoryGrid.innerHTML = `<div class="chat-empty-state" style="grid-column: 1 / -1;">Failed to load directory.</div>`;
    }
  }

  // Directory filter clicks
  directoryFilters.forEach(pill => {
    pill.addEventListener('click', () => {
      directoryFilters.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      loadDirectory();
    });
  });

  // Directory search debounce
  let dirSearchTimeout = null;
  directorySearchInput.addEventListener('input', () => {
    clearTimeout(dirSearchTimeout);
    dirSearchTimeout = setTimeout(() => {
      loadDirectory();
    }, 350);
  });

  // Tab 3: Registration Form Handler
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = modal.querySelector('#reg-name').value.trim();
    const memberType = modal.querySelector('#reg-type').value;
    const classYear = modal.querySelector('#reg-year').value.trim();
    const profession = modal.querySelector('#reg-profession').value.trim();
    const location = modal.querySelector('#reg-location').value.trim();
    const email = modal.querySelector('#reg-email').value.trim();
    const phone = modal.querySelector('#reg-phone').value.trim();
    const bio = modal.querySelector('#reg-bio').value.trim();

    if (!name || !memberType || !classYear) return;

    const submitBtn = modal.querySelector('#btn-submit-registration');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const res = await registerAlumniMember({
      name,
      memberType,
      classYear,
      profession,
      location,
      email,
      phone,
      bio
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Register as RPPS Alumni 🎉';

    registerStatus.style.display = 'block';

    if (res.success) {
      registerStatus.className = 'status-alert-success';
      registerStatus.innerHTML = `
        <strong>🎉 Welcome to the RPPS Alumni Network, ${escapeHtml(name)}!</strong>
        <p>Your profile is now recorded. We also updated your chat persona automatically.</p>
        <button id="btn-jump-to-chat" class="btn btn-gold btn-sm" style="margin-top: 0.5rem;">Join the Alumni Chat Now 🚀</button>
      `;

      // Set user profile persona automatically
      userProfile = {
        name,
        type: memberType,
        classYear,
        profession,
        color: memberType === 'OB' ? '#0d5c3a' : '#d97706'
      };
      setStoredAlumniProfile(userProfile);
      updatePersonaDisplay();

      modal.querySelector('#btn-jump-to-chat').addEventListener('click', () => {
        tabs[0].click();
      });

      registerForm.reset();
    } else {
      registerStatus.className = 'status-alert-error';
      registerStatus.textContent = res.error || 'Failed to submit registration. Please try again.';
    }
  });

  // Initial setup
  updatePersonaDisplay();

  // Public open method
  modal.open = (targetTab = 'chat', targetChannel = null) => {
    modal.classList.add('active');

    // Switch to target tab if specified
    if (targetTab && tabContents[targetTab]) {
      tabs.forEach(btn => {
        if (btn.getAttribute('data-tab') === targetTab) {
          btn.click();
        }
      });
    }

    // Switch to target channel if specified
    if (targetChannel) {
      const chBtn = channelsContainer.querySelector(`[data-channel="${targetChannel}"]`);
      if (chBtn) {
        chBtn.click();
      }
    } else if (activeTab === 'chat') {
      loadMessages();
      startPolling();
    }
  };

  return modal;
}
