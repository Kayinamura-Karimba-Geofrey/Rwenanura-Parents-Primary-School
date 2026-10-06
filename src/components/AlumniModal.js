import { 
  fetchAlumniMessages, 
  sendAlumniMessage, 
  reactToAlumniMessage, 
  fetchAlumniChannels, 
  fetchAlumniMembers, 
  registerAlumniAccount,
  loginUser,
  sendAlumniTypingStatus,
  connectAlumniStream
} from '../data/api.js';

import { 
  getUserRole, 
  getCurrentUser, 
  isAlumni, 
  isStaffOrAdmin, 
  logoutUser, 
  onAuthChange 
} from '../data/userRole.js';

export function createAlumniModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'alumni-chat-modal';

  let currentChannel = 'general';
  let activeTab = 'chat'; // 'chat' | 'directory' | 'portal'
  let currentFilter = 'all';
  let pollInterval = null;
  let messagesList = [];

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
          <div class="chat-typing-indicator" id="chat-typing-indicator" style="display: none;">
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
        <div id="portal-content-container" style="padding: 1rem 0; overflow-y: auto;">
          <!-- Dynamically populated: ID Card for logged in, or Login/Register forms for guests -->
        </div>
      </div>
    </div>
  `;

  // UI Element References
  const tabs = modal.querySelectorAll('.alumni-tab-btn');
  const tabContents = {
    chat: modal.querySelector('#tab-chat-content'),
    directory: modal.querySelector('#tab-directory-content'),
    portal: modal.querySelector('#tab-portal-content')
  };

  const headerAuthSlot = modal.querySelector('#alumni-header-auth-slot');
  const portalTabLabel = modal.querySelector('#portal-tab-label');
  const composerWrap = modal.querySelector('#alumni-composer-wrap');
  const portalContainer = modal.querySelector('#portal-content-container');

  const channelsContainer = modal.querySelector('#alumni-channels-container');
  const messagesFeed = modal.querySelector('#alumni-messages-feed');
  const searchInput = modal.querySelector('#chat-search-input');
  const refreshBtn = modal.querySelector('#refresh-chat-btn');
  const activeChannelLabel = modal.querySelector('#active-channel-label');

  const directoryGrid = modal.querySelector('#alumni-directory-grid');
  const directorySearchInput = modal.querySelector('#directory-search-input');
  const directoryFilters = modal.querySelectorAll('.filter-pill');
  const directoryStats = modal.querySelector('#directory-stats-summary');

  // Close handlers
  const closeModal = () => {
    modal.classList.remove('active');
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (streamDisconnect) {
      streamDisconnect();
      streamDisconnect = null;
    }
    if (typingEmitTimeout) clearTimeout(typingEmitTimeout);
    sendAlumniTypingStatus(currentChannel, false);
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('alumni-close-btn')) {
      closeModal();
    }
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
        setupRealtimeStream();
        startPolling();
      } else {
        if (streamDisconnect) {
          streamDisconnect();
          streamDisconnect = null;
        }
        if (activeTab === 'directory') {
          loadDirectory();
        } else if (activeTab === 'portal') {
          renderPortalView();
        }
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
      messagesFeed.innerHTML = `<div class="chat-empty-state">Could not connect to the alumni chat server.</div>`;
    }
  }

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
          <p>Be the first Old Boy or Old Girl to share a message or greeting!</p>
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
          <div class="message-avatar" style="background-color: ${escapeHtml(msg.avatar_color || (isOB ? '#0d5c3a' : '#d97706'))};">
            ${escapeHtml(initials)}
          </div>
          <div class="message-content-wrap">
            <div class="message-header-line">
              <span class="message-author">${escapeHtml(msg.author_name)}</span>
              <span class="alumni-badge ${badgeClass}">${escapeHtml(msg.author_type)}</span>
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
        if (!isAlumni() && !isStaffOrAdmin()) {
          tabs[2].click(); // reacting requires sign-in; open the portal tab
          return;
        }
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

  function formatTimestamp(isoStr) {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function playMessageChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      // AudioContext blocked until gesture or unsupported, ignore
    }
  }

  let streamDisconnect = null;
  let typingHideTimer = null;
  let typingEmitTimeout = null;
  let typingEmitLastSent = 0;

  function setupRealtimeStream() {
    if (streamDisconnect) streamDisconnect();

    streamDisconnect = connectAlumniStream((eventType, data) => {
      if (eventType === 'new_message') {
        handleIncomingMessage(data);
      } else if (eventType === 'reaction_update') {
        handleIncomingReaction(data);
      } else if (eventType === 'typing_status') {
        handleIncomingTyping(data);
      } else if (eventType === 'online_count') {
        handleIncomingOnlineCount(data);
      }
    });
  }

  function handleIncomingMessage(msg) {
    if (!msg) return;

    // Avoid duplicate message in array
    const exists = messagesList.some(m => m.id === msg.id);
    if (!exists) {
      messagesList.push(msg);
    }

    // Refresh channel counts
    updateChannelCounts();

    // If message is in currently viewed channel
    if (msg.channel === currentChannel) {
      hideTypingIndicator();

      const wasAtBottom = messagesFeed.scrollHeight - messagesFeed.clientHeight <= messagesFeed.scrollTop + 120;
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.name !== msg.author_name) {
        playMessageChime();
      }

      applyFiltersAndRender();

      if (wasAtBottom) {
        messagesFeed.scrollTop = messagesFeed.scrollHeight;
      }
    }
  }

  function handleIncomingReaction(data) {
    if (!data || !data.messageId) return;

    const target = messagesList.find(m => m.id === data.messageId);
    if (target) {
      target.likes_count = data.likesCount;
    }

    const cheerBtn = messagesFeed.querySelector(`.btn-reaction-cheer[data-msg-id="${data.messageId}"]`);
    if (cheerBtn) {
      const countSpan = cheerBtn.querySelector('.cheer-count');
      if (countSpan) countSpan.textContent = data.likesCount;
      cheerBtn.classList.add('cheer-pop');
      setTimeout(() => cheerBtn.classList.remove('cheer-pop'), 450);
    }
  }

  function handleIncomingTyping(data) {
    if (!data || data.channel !== currentChannel) return;
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.name === data.authorName) return;

    const typingEl = modal.querySelector('#chat-typing-indicator');
    const typingText = modal.querySelector('#chat-typing-text');
    if (!typingEl || !typingText) return;

    if (data.isTyping) {
      typingText.textContent = `${sanitizeText(data.authorName)} (${sanitizeText(data.authorType)}) is typing...`;
      typingEl.style.display = 'flex';

      if (typingHideTimer) clearTimeout(typingHideTimer);
      typingHideTimer = setTimeout(() => {
        typingEl.style.display = 'none';
      }, 3000);
    } else {
      typingEl.style.display = 'none';
      if (typingHideTimer) clearTimeout(typingHideTimer);
    }
  }

  function hideTypingIndicator() {
    const typingEl = modal.querySelector('#chat-typing-indicator');
    if (typingEl) typingEl.style.display = 'none';
    if (typingHideTimer) clearTimeout(typingHideTimer);
  }

  function handleIncomingOnlineCount(data) {
    const onlineCountEl = modal.querySelector('#chat-online-count');
    if (onlineCountEl && data && data.count !== undefined) {
      onlineCountEl.textContent = `${data.count} Online`;
    }
  }

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    // Slow background sync every 15s to complement instant SSE
    pollInterval = setInterval(() => {
      if (modal.classList.contains('active') && activeTab === 'chat') {
        loadMessages(true);
      }
    }, 15000);
  }

  // Search input with debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadMessages();
    }, 350);
  });

  refreshBtn.addEventListener('click', () => loadMessages());

  // -------------------------------------------------------------
  // DYNAMIC HEADER, COMPOSER & PORTAL RENDERING
  // -------------------------------------------------------------
  function renderRoleBasedUI() {
    const role = getUserRole();
    const user = getCurrentUser();
    const isAuth = isAlumni() || isStaffOrAdmin();

    // 1. Header Right Slot
    if (isAuth && user) {
      const initials = (user.name || 'Alumni').substring(0, 2).toUpperCase();
      const memberType = user.memberType || 'OB';
      const roleBadge = role === 'alumni' ? memberType : (role === 'admin' ? 'ADMIN' : 'STAFF');

      headerAuthSlot.innerHTML = `
        <button id="btn-header-profile" class="alumni-persona-pill" title="View your RPPS Alumni profile">
          <span class="persona-avatar" style="background: ${escapeHtml(user.avatarColor || (memberType === 'OB' ? '#0d5c3a' : '#d97706'))};">${escapeHtml(initials)}</span>
          <span class="persona-info">
            <strong>${escapeHtml(user.name)}</strong>
            <small>${roleBadge} • ${escapeHtml(user.classYear || 'Verified')}</small>
          </span>
        </button>
        <button id="btn-header-logout" class="btn btn-outline btn-sm" title="Sign Out">Sign Out ⎋</button>
        <button class="modal-close alumni-close-btn" aria-label="Close modal">&times;</button>
      `;

      headerAuthSlot.querySelector('#btn-header-profile').addEventListener('click', () => {
        tabs[2].click(); // switch to portal tab
      });

      headerAuthSlot.querySelector('#btn-header-logout').addEventListener('click', () => {
        logoutUser();
      });

      portalTabLabel.textContent = '🎓 My Alumni ID';

    } else {
      // Visitor / Guest Header
      headerAuthSlot.innerHTML = `
        <button id="btn-header-login" class="btn btn-primary btn-sm" title="Sign in as an RPPS Alumnus">
          <span>Alumni Sign In / Join 🎓</span>
        </button>
        <button class="modal-close alumni-close-btn" aria-label="Close modal">&times;</button>
      `;

      headerAuthSlot.querySelector('#btn-header-login').addEventListener('click', () => {
        tabs[2].click();
      });

      portalTabLabel.textContent = '🎓 Sign In / Join';
    }

    // 2. Chat Composer Area
    if (isAuth && user) {
      composerWrap.innerHTML = `
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
            placeholder="Share a message, reunion thought, or memory with fellow OBs & OGs... (Press Enter to send)"
            required
          ></textarea>
          <button type="submit" id="btn-send-message" class="btn btn-primary btn-send-alumni">
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      `;

      // Emoji chips click
      composerWrap.querySelectorAll('.reaction-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const emoji = tag.getAttribute('data-emoji');
          const input = composerWrap.querySelector('#alumni-message-input');
          if (input) {
            input.value = (input.value.trim() ? input.value.trim() + ' ' : '') + emoji + ' ';
            input.focus();
          }
        });
      });

      // Typing indicator emit (throttled to 1 event/second instead of firing
      // per keystroke, which hammered the server and risked hitting the
      // server-side typing rate limit)
      input.addEventListener('input', () => {
        const now = Date.now();
        if (!typingEmitLastSent || now - typingEmitLastSent >= 1000) {
          typingEmitLastSent = now;
          sendAlumniTypingStatus(currentChannel, true);
        }
        clearTimeout(typingEmitTimeout);
        typingEmitTimeout = setTimeout(() => {
          sendAlumniTypingStatus(currentChannel, false);
        }, 1800);
      });

      // Submit message
      const form = composerWrap.querySelector('#alumni-message-form');
      const sendBtn = composerWrap.querySelector('#btn-send-message');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = input.value.trim();
        if (!content) return;

        clearTimeout(typingEmitTimeout);
        sendAlumniTypingStatus(currentChannel, false);

        sendBtn.disabled = true;
        const res = await sendAlumniMessage({
          channel: currentChannel,
          content
        });
        sendBtn.disabled = false;

        if (res.success) {
          input.value = '';
          // Message will be instantly pushed via SSE; fallback ensures local sync
          handleIncomingMessage(res.data);
          messagesFeed.scrollTop = messagesFeed.scrollHeight;
        } else {
          alert(res.error || 'Failed to post message.');
        }
      });

      // Enter to send
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          form.dispatchEvent(new Event('submit'));
        }
      });

    } else {
      // VISITOR GATED CALLOUT
      composerWrap.innerHTML = `
        <div class="chat-visitor-gated-box">
          <div class="gated-lock-icon">🔒</div>
          <div class="gated-content">
            <h4>Alumni Live Chat is in Read-Only Mode</h4>
            <p>You can read conversations between RPPS alumni. To participate, share stories, and message fellow Old Boys & Old Girls, please sign in or register your alumni profile.</p>
          </div>
          <div class="gated-actions">
            <button class="btn btn-primary btn-sm trigger-goto-login">
              Alumni Sign In
            </button>
            <button class="btn btn-outline-white btn-sm trigger-goto-register">
              Join / Register
            </button>
          </div>
        </div>
      `;

      composerWrap.querySelector('.trigger-goto-login').addEventListener('click', () => {
        tabs[2].click();
        renderPortalView('login');
      });

      composerWrap.querySelector('.trigger-goto-register').addEventListener('click', () => {
        tabs[2].click();
        renderPortalView('register');
      });
    }

    // Re-render portal tab content if it's currently active
    if (activeTab === 'portal') {
      renderPortalView();
    }
  }

  // -------------------------------------------------------------
  // TAB 2: DIRECTORY LOADER & RENDERER
  // -------------------------------------------------------------
  async function loadDirectory() {
    directoryGrid.innerHTML = '<div class="chat-loading-state">Loading alumni members directory...</div>';
    
    const searchTerm = directorySearchInput.value.trim();
    const typeFilter = currentFilter === 'all' ? '' : currentFilter;

    const res = await fetchAlumniMembers(typeFilter, searchTerm);

    if (res.success && res.members) {
      const stats = res.stats || {};
      const isAuth = res.isAuthorized;

      directoryStats.innerHTML = `
        <strong>${res.total || 0} Registered Alumni</strong> 
        (<span>👨 ${stats.obCount || 0} Old Boys</span> • <span>👩 ${stats.ogCount || 0} Old Girls</span>)
        ${!isAuth ? '<span class="directory-guest-badge">🔒 Direct contacts masked for guests</span>' : '<span class="directory-auth-badge">✓ Full networking contacts unlocked</span>'}
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
        const color = isOB ? 'var(--primary)' : 'var(--gold)';
        const initials = escapeHtml((member.name || 'Alumni').substring(0, 2).toUpperCase());

        const cleanPhone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
        const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

        return `
          <div class="alumni-member-card">
            <div class="member-card-header">
              <div class="member-avatar" style="background-color: ${color};">
                ${initials}
              </div>
              <div>
                <h5 class="member-name">${escapeHtml(member.name)}</h5>
                <div class="member-meta">
                  <span class="alumni-badge ${badgeClass}">${escapeHtml(member.member_type)}</span>
                  <span class="member-year">${escapeHtml(member.class_year)}</span>
                </div>
              </div>
            </div>

            <div class="member-card-body">
              ${member.profession ? `<div class="member-detail">💼 <strong>${escapeHtml(member.profession)}</strong></div>` : ''}
              ${member.location ? `<div class="member-detail">📍 ${escapeHtml(member.location)}</div>` : ''}
              ${member.bio ? `<p class="member-bio">"${escapeHtml(member.bio)}"</p>` : ''}
              
              <!-- Contact Details (Masked or Unmasked) -->
              <div class="member-contact-strip">
                ${member.isContactMasked ? `
                  <div class="contact-masked-box">
                    <span>🔒 Contact private to verified alumni</span>
                    <button class="btn-link-action trigger-reveal-auth">Sign in to view</button>
                  </div>
                ` : `
                  <div class="contact-unmasked-box">
                    ${member.phone ? `<a href="tel:${escapeHtml(member.phone)}" class="contact-pill" title="Call">📞 ${escapeHtml(member.phone)}</a>` : ''}
                    ${whatsappUrl ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="contact-pill contact-whatsapp" title="WhatsApp">💬 WhatsApp</a>` : ''}
                    ${member.email ? `<a href="mailto:${escapeHtml(member.email)}" class="contact-pill" title="Email">✉️ Email</a>` : ''}
                  </div>
                `}
              </div>
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
          tabs[0].click(); // Go to chat
          const input = composerWrap.querySelector('#alumni-message-input');
          if (input) {
            input.value = `@${name} Greetings from fellow RPPS alumni! `;
            input.focus();
          }
        });
      });

      // Wire "Sign in to view" links
      directoryGrid.querySelectorAll('.trigger-reveal-auth').forEach(btn => {
        btn.addEventListener('click', () => {
          tabs[2].click();
          renderPortalView('login');
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

  let dirSearchTimeout = null;
  directorySearchInput.addEventListener('input', () => {
    clearTimeout(dirSearchTimeout);
    dirSearchTimeout = setTimeout(() => {
      loadDirectory();
    }, 350);
  });

  // -------------------------------------------------------------
  // TAB 3: PORTAL VIEW (ID CARD FOR LOGGED-IN, LOGIN/SIGNUP FOR GUESTS)
  // -------------------------------------------------------------
  function renderPortalView(defaultSubTab = 'login') {
    const role = getUserRole();
    const user = getCurrentUser();
    const isAuth = isAlumni() || isStaffOrAdmin();

    if (isAuth && user) {
      // 1. DIGITAL ALUMNI MEMBERSHIP CARD
      const isOB = (user.memberType || 'OB').toUpperCase() === 'OB';
      const initials = (user.name || 'Alumni').substring(0, 2).toUpperCase();

      portalContainer.innerHTML = `
        <div class="alumni-id-card-wrapper">
          <div class="alumni-id-card">
            <div class="id-card-top">
              <div class="id-card-brand">
                <div class="logo-crest" style="width: 38px; height: 38px;">
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
              <div class="id-avatar" style="background: ${escapeHtml(user.avatarColor || (isOB ? '#0d5c3a' : '#d97706'))};">
                ${escapeHtml(initials)}
              </div>
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
              <div class="id-card-status">
                <span class="status-indicator"></span> Verified Community Member
              </div>
              <div class="id-card-school-motto">
                "Light, Leadership & Excellence"
              </div>
            </div>
          </div>

          <!-- Quick Portal Actions -->
          <div class="id-card-actions">
            <button class="btn btn-primary btn-jump-chat">
              <span>Go to Live ChatUp 💬</span>
            </button>
            <button class="btn btn-outline btn-jump-dir">
              <span>Browse Alumni Directory 👥</span>
            </button>
            <button class="btn btn-outline-danger btn-portal-logout">
              <span>Sign Out ⎋</span>
            </button>
          </div>
        </div>
      `;

      portalContainer.querySelector('.btn-jump-chat').addEventListener('click', () => {
        tabs[0].click();
      });

      portalContainer.querySelector('.btn-jump-dir').addEventListener('click', () => {
        tabs[1].click();
      });

      portalContainer.querySelector('.btn-portal-logout').addEventListener('click', () => {
        logoutUser();
      });

    } else {
      // 2. GUEST: LOGIN / REGISTER FORMS
      portalContainer.innerHTML = `
        <div class="alumni-auth-container">
          <div class="auth-subtabs-nav">
            <button class="subtab-btn ${defaultSubTab === 'login' ? 'active' : ''}" data-subtab="login">
              <span>Alumni Sign In</span>
            </button>
            <button class="subtab-btn ${defaultSubTab === 'register' ? 'active' : ''}" data-subtab="register">
              <span>New Alumni Registration</span>
            </button>
          </div>

          <div id="auth-status-alert" class="auth-status-alert" style="display: none;"></div>

          <!-- SUBTAB A: ALUMNI SIGN IN -->
          <div class="auth-subtab-pane ${defaultSubTab === 'login' ? 'active' : ''}" id="pane-login">
            <form id="alumni-login-form" class="auth-form-card">
              <div class="form-header">
                <h4>Sign In to RPPS Alumni Network</h4>
                <p>Enter your credentials to unlock chat posting, direct contacts, and networking.</p>
              </div>

              <div class="form-group">
                <label>Registered Alumni Email *</label>
                <input type="email" id="modal-login-email" required placeholder="e.g. emmanuel.m@gmail.com" />
              </div>

              <div class="form-group">
                <label>Password *</label>
                <input type="password" id="modal-login-password" required placeholder="••••••••" />
              </div>

              <button type="submit" id="btn-modal-login-submit" class="btn btn-primary btn-block">
                Sign In to Alumni Network 🚀
              </button>
            </form>
          </div>

          <!-- SUBTAB B: NEW ALUMNI REGISTRATION -->
          <div class="auth-subtab-pane ${defaultSubTab === 'register' ? 'active' : ''}" id="pane-register">
            <form id="alumni-signup-form" class="auth-form-card">
              <div class="form-header">
                <h4>Register in RPPS Alumni Community</h4>
                <p>Create your verified profile to reconnect with your graduating cohort.</p>
              </div>

              <div class="form-grid-2">
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
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Class Graduation Year *</label>
                  <input type="text" id="reg-year" required placeholder="e.g. Class of 2016" />
                </div>

                <div class="form-group">
                  <label>Current Profession / Work</label>
                  <input type="text" id="reg-profession" placeholder="e.g. Biomedical Scientist" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" id="reg-email" required placeholder="e.g. sandra@example.com" />
                </div>

                <div class="form-group">
                  <label>Create Password * (min 8 chars)</label>
                  <input type="password" id="reg-password" required minlength="8" placeholder="••••••••" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Phone / WhatsApp Number</label>
                  <input type="tel" id="reg-phone" placeholder="e.g. +250 788 123 456" />
                </div>

                <div class="form-group">
                  <label>Current Location</label>
                  <input type="text" id="reg-location" placeholder="e.g. Kigali, Rwanda" />
                </div>
              </div>

              <div class="form-group">
                <label>Memory or Advice for Current Pupils</label>
                <textarea id="reg-bio" rows="2" placeholder="Share a few words of advice or fond memories of your teachers..."></textarea>
              </div>

              <button type="submit" id="btn-modal-reg-submit" class="btn btn-primary btn-block">
                Create Account & Join Network 🎉
              </button>
            </form>
          </div>
        </div>
      `;

      // Subtab switching
      const subtabBtns = portalContainer.querySelectorAll('.subtab-btn');
      const subtabPanes = portalContainer.querySelectorAll('.auth-subtab-pane');
      const statusAlert = portalContainer.querySelector('#auth-status-alert');

      subtabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          subtabBtns.forEach(b => b.classList.remove('active'));
          subtabPanes.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.getAttribute('data-subtab');
          portalContainer.querySelector(`#pane-${target}`).classList.add('active');
          statusAlert.style.display = 'none';
        });
      });

      function showAlert(msg, isError = false) {
        statusAlert.style.display = 'block';
        statusAlert.className = `auth-status-alert ${isError ? 'alert-error' : 'alert-success'}`;
        statusAlert.textContent = msg;
      }

      // Handle Sign In Submission
      const loginForm = portalContainer.querySelector('#alumni-login-form');
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = portalContainer.querySelector('#modal-login-email').value.trim();
        const password = portalContainer.querySelector('#modal-login-password').value;
        const btn = portalContainer.querySelector('#btn-modal-login-submit');

        btn.disabled = true;
        btn.textContent = 'Authenticating...';

        const res = await loginUser(email, password);
        btn.disabled = false;
        btn.textContent = 'Sign In to Alumni Network 🚀';

        if (res.success) {
          showAlert('Welcome back! Switching to Live Lounge...', false);
          setTimeout(() => {
            tabs[0].click(); // jump to chat
          }, 400);
        } else {
          showAlert(res.error || 'Invalid email or password.', true);
        }
      });

      // Handle Registration Submission
      const regForm = portalContainer.querySelector('#alumni-signup-form');
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = portalContainer.querySelector('#reg-name').value.trim();
        const memberType = portalContainer.querySelector('#reg-type').value;
        const classYear = portalContainer.querySelector('#reg-year').value.trim();
        const profession = portalContainer.querySelector('#reg-profession').value.trim();
        const email = portalContainer.querySelector('#reg-email').value.trim();
        const password = portalContainer.querySelector('#reg-password').value;
        const phone = portalContainer.querySelector('#reg-phone').value.trim();
        const location = portalContainer.querySelector('#reg-location').value.trim();
        const bio = portalContainer.querySelector('#reg-bio').value.trim();
        const btn = portalContainer.querySelector('#btn-modal-reg-submit');

        btn.disabled = true;
        btn.textContent = 'Registering Account...';

        const res = await registerAlumniAccount({
          name,
          memberType,
          classYear,
          profession,
          email,
          password,
          phone,
          location,
          bio
        });

        btn.disabled = false;
        btn.textContent = 'Create Account & Join Network 🎉';

        if (res.success) {
          showAlert(`Welcome to the RPPS Alumni Network, ${name}! Your account is now active.`, false);
          setTimeout(() => {
            tabs[0].click(); // jump to chat
          }, 500);
        } else {
          showAlert(res.error || 'Failed to create account.', true);
        }
      });
    }
  }

  // Initial UI Render
  renderRoleBasedUI();

  // Subscribe to auth state changes
  onAuthChange(() => {
    renderRoleBasedUI();
    if (activeTab === 'directory') {
      loadDirectory();
    }
  });

  // Public open method
  modal.open = (targetTab = 'chat', targetChannel = null) => {
    modal.classList.add('active');

    // Select tab
    if (targetTab && tabContents[targetTab]) {
      tabs.forEach(btn => {
        if (btn.getAttribute('data-tab') === targetTab) {
          btn.click();
        }
      });
    } else {
      tabs[0].click();
    }

    // Select channel if applicable
    if (targetChannel) {
      const chBtn = channelsContainer.querySelector(`[data-channel="${targetChannel}"]`);
      if (chBtn) chBtn.click();
    }

    if (activeTab === 'chat') {
      setupRealtimeStream();
    }
  };

  return modal;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeText(str) {
  return typeof str === 'string' ? str.substring(0, 120) : '';
}
