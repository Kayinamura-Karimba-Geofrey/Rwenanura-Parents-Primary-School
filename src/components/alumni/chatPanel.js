import {
  fetchAlumniMessages,
  sendAlumniMessage,
  reactToAlumniMessage,
  fetchAlumniChannels,
  sendAlumniTypingStatus,
  connectAlumniStream
} from '../../data/api.js';
import { getCurrentUser, isAlumni, isStaffOrAdmin } from '../../data/userRole.js';
import { escapeHtml } from '../../utils/html.js';

const CHANNEL_TITLES = {
  general: '# General Lounge',
  reunions: '# Reunions & Events',
  mentorship: '# Careers & Mentorship',
  memories: '# School Memories'
};

// Cohort pills filter on the year text of each message
const COHORT_YEARS = {
  '2014-2016': ['2014', '2015', '2016'],
  '2017-2019': ['2017', '2018', '2019'],
  '2020': ['2020', '2021', '2022', '2023', '2024', '2025', '2026']
};

/**
 * "Live Lounge" tab of the alumni modal: channels, message feed, real-time
 * stream (SSE), typing indicator and the message composer.
 *
 * @param {HTMLElement} root  the modal element containing the chat markup
 * @param {object} hooks
 *   isVisible()          whether the chat tab is currently shown
 *   goToTab(tab, opts)   switch the modal to another tab ('portal' for sign-in)
 */
export function createChatPanel(root, { isVisible, goToTab }) {
  const channelsContainer = root.querySelector('#alumni-channels-container');
  const messagesFeed = root.querySelector('#alumni-messages-feed');
  const searchInput = root.querySelector('#chat-search-input');
  const refreshBtn = root.querySelector('#refresh-chat-btn');
  const activeChannelLabel = root.querySelector('#active-channel-label');
  const composerWrap = root.querySelector('#alumni-composer-wrap');
  const typingEl = root.querySelector('#chat-typing-indicator');
  const typingText = root.querySelector('#chat-typing-text');
  const onlineCountEl = root.querySelector('#chat-online-count');
  const cohortPills = root.querySelectorAll('.chat-year-filter-pills .year-pill');

  let currentChannel = 'general';
  let selectedCohort = 'all';
  let messagesList = [];
  let pollInterval = null;
  let streamDisconnect = null;
  let typingHideTimer = null;
  let typingEmitTimeout = null;
  let typingEmitLastSent = 0;
  let searchTimeout = null;

  // ---------------------------------------------------------------
  // Channels, filters and loading
  // ---------------------------------------------------------------
  function selectChannel(channel) {
    const btn = channelsContainer.querySelector(`[data-channel="${channel}"]`);
    if (!btn) return;
    channelsContainer.querySelectorAll('.channel-chip').forEach(b => b.classList.toggle('active', b === btn));
    currentChannel = channel;
    activeChannelLabel.textContent = CHANNEL_TITLES[channel] || `# ${channel}`;
    loadMessages();
  }

  channelsContainer.querySelectorAll('.channel-chip').forEach(btn => {
    btn.addEventListener('click', () => selectChannel(btn.getAttribute('data-channel')));
  });

  cohortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      cohortPills.forEach(p => p.classList.toggle('active', p === pill));
      selectedCohort = pill.getAttribute('data-year');
      applyFiltersAndRender();
    });
  });

  function applyFiltersAndRender() {
    const years = COHORT_YEARS[selectedCohort];
    const filtered = years
      ? messagesList.filter(msg => years.some(y => (msg.class_year || '').includes(y)))
      : messagesList;
    renderMessages(filtered);
  }

  async function loadMessages(isBackground = false) {
    if (!isBackground) {
      messagesFeed.innerHTML = '<div class="chat-loading-state">Loading messages...</div>';
    }
    const res = await fetchAlumniMessages(currentChannel, searchInput.value.trim());
    if (res.success && res.messages) {
      messagesList = res.messages;
      applyFiltersAndRender();
      updateChannelCounts();
    } else if (!isBackground) {
      messagesFeed.innerHTML = '<div class="chat-empty-state">Could not connect to the alumni chat server.</div>';
    }
  }

  async function updateChannelCounts() {
    const res = await fetchAlumniChannels();
    if (res.success && res.channels) {
      res.channels.forEach(ch => {
        const countEl = root.querySelector(`#count-${ch.id}`);
        if (countEl) countEl.textContent = ch.messageCount;
      });
    }
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadMessages(), 350);
  });

  refreshBtn.addEventListener('click', () => loadMessages());

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
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
      const initials = (msg.author_name || 'Alumni').substring(0, 2).toUpperCase();
      return `
        <div class="chat-message-item" data-id="${msg.id}">
          <div class="message-avatar ${isOB ? 'avatar-ob' : 'avatar-og'}">
            ${escapeHtml(initials)}
          </div>
          <div class="message-content-wrap">
            <div class="message-header-line">
              <span class="message-author">${escapeHtml(msg.author_name)}</span>
              <span class="alumni-badge ${isOB ? 'badge-ob' : 'badge-og'}">${escapeHtml(msg.author_type)}</span>
              <span class="message-class">${escapeHtml(msg.class_year || '')}</span>
              ${msg.profession ? `<span class="message-profession">• ${escapeHtml(msg.profession)}</span>` : ''}
              <span class="message-time">${formatTimestamp(msg.created_at)}</span>
            </div>
            <div class="message-body-text">
              ${escapeHtml(msg.content)}
            </div>
            <div class="message-actions-row">
              <button class="btn-reaction-cheer${msg.liked_by_me ? ' liked' : ''}" data-msg-id="${msg.id}" aria-pressed="${msg.liked_by_me ? 'true' : 'false'}" title="${msg.liked_by_me ? 'Remove like' : 'Like'}">
                <span class="cheer-heart">❤️</span>
                <span class="cheer-count">${msg.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    messagesFeed.querySelectorAll('.btn-reaction-cheer').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!isAlumni() && !isStaffOrAdmin()) {
          goToTab('portal'); // reacting requires sign-in
          return;
        }
        btn.classList.add('reacting');
        const res = await reactToAlumniMessage(btn.getAttribute('data-msg-id'));
        if (res.success) {
          btn.querySelector('.cheer-count').textContent = res.likesCount;
          btn.classList.toggle('liked', res.liked);
          btn.setAttribute('aria-pressed', String(res.liked));
          btn.title = res.liked ? 'Remove like' : 'Like';
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
    const date = new Date(isoStr);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    } catch {
      // AudioContext blocked until a user gesture, or unsupported
    }
  }

  // ---------------------------------------------------------------
  // Real-time stream (SSE) and typing indicator
  // ---------------------------------------------------------------
  function connectStream() {
    if (streamDisconnect) streamDisconnect();
    streamDisconnect = connectAlumniStream((eventType, data) => {
      if (eventType === 'new_message') handleIncomingMessage(data);
      else if (eventType === 'reaction_update') handleIncomingReaction(data);
      else if (eventType === 'typing_status') handleIncomingTyping(data);
      else if (eventType === 'online_count') handleIncomingOnlineCount(data);
    });
  }

  function handleIncomingMessage(msg) {
    if (!msg) return;
    if (!messagesList.some(m => m.id === msg.id)) {
      messagesList.push(msg);
    }
    updateChannelCounts();

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
    if (target) target.likes_count = data.likesCount;

    const cheerBtn = messagesFeed.querySelector(`.btn-reaction-cheer[data-msg-id="${data.messageId}"]`);
    if (cheerBtn) {
      cheerBtn.querySelector('.cheer-count').textContent = data.likesCount;
      cheerBtn.classList.add('cheer-pop');
      setTimeout(() => cheerBtn.classList.remove('cheer-pop'), 450);
    }
  }

  function handleIncomingTyping(data) {
    if (!data || data.channel !== currentChannel) return;
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.name === data.authorName) return;

    clearTimeout(typingHideTimer);
    if (data.isTyping) {
      typingText.textContent = `${clip(data.authorName)} (${clip(data.authorType)}) is typing...`;
      typingEl.hidden = false;
      typingHideTimer = setTimeout(() => { typingEl.hidden = true; }, 3000);
    } else {
      typingEl.hidden = true;
    }
  }

  function hideTypingIndicator() {
    typingEl.hidden = true;
    clearTimeout(typingHideTimer);
  }

  function handleIncomingOnlineCount(data) {
    if (data && data.count !== undefined) {
      onlineCountEl.textContent = `${data.count} Online`;
    }
  }

  // ---------------------------------------------------------------
  // Composer (signed-in) or read-only callout (visitors)
  // ---------------------------------------------------------------
  function renderComposer() {
    const user = getCurrentUser();
    if (!(isAlumni() || isStaffOrAdmin()) || !user) {
      composerWrap.innerHTML = `
        <div class="chat-visitor-gated-box">
          <div class="gated-lock-icon">🔒</div>
          <div class="gated-content">
            <h4>Alumni Live Chat is in Read-Only Mode</h4>
            <p>You can read conversations between RPPS alumni. To participate, share stories, and message fellow Old Boys & Old Girls, please sign in or register your alumni profile.</p>
          </div>
          <div class="gated-actions">
            <button class="btn btn-primary btn-sm trigger-goto-login">Alumni Sign In</button>
            <button class="btn btn-outline-white btn-sm trigger-goto-register">Join / Register</button>
          </div>
        </div>
      `;
      composerWrap.querySelector('.trigger-goto-login').addEventListener('click', () => goToTab('portal', { subTab: 'login' }));
      composerWrap.querySelector('.trigger-goto-register').addEventListener('click', () => goToTab('portal', { subTab: 'register' }));
      return;
    }

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
          maxlength="1000"
          aria-label="Message"
          placeholder="Share a message, reunion thought, or memory with fellow OBs & OGs... (Press Enter to send)"
          required
        ></textarea>
        <button type="submit" id="btn-send-message" class="btn btn-primary btn-send-alumni">
          <span>Send</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    `;

    const form = composerWrap.querySelector('#alumni-message-form');
    const input = composerWrap.querySelector('#alumni-message-input');
    const sendBtn = composerWrap.querySelector('#btn-send-message');

    composerWrap.querySelectorAll('.reaction-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        input.value = (input.value.trim() ? input.value.trim() + ' ' : '') + tag.getAttribute('data-emoji') + ' ';
        input.focus();
      });
    });

    // Typing indicator: at most one event per second, "stopped" after 1.8s idle
    input.addEventListener('input', () => {
      const now = Date.now();
      if (!typingEmitLastSent || now - typingEmitLastSent >= 1000) {
        typingEmitLastSent = now;
        sendAlumniTypingStatus(currentChannel, true);
      }
      clearTimeout(typingEmitTimeout);
      typingEmitTimeout = setTimeout(() => sendAlumniTypingStatus(currentChannel, false), 1800);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = input.value.trim();
      if (!content) return;

      clearTimeout(typingEmitTimeout);
      sendAlumniTypingStatus(currentChannel, false);

      sendBtn.disabled = true;
      const res = await sendAlumniMessage({ channel: currentChannel, content });
      sendBtn.disabled = false;

      if (res.success) {
        input.value = '';
        // The SSE stream also delivers it; adding it here keeps the sender in sync
        handleIncomingMessage(res.data);
        messagesFeed.scrollTop = messagesFeed.scrollHeight;
      } else {
        alert(res.error || 'Failed to post message.');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  // ---------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------
  return {
    // Chat tab became visible
    start() {
      loadMessages();
      connectStream();
      clearInterval(pollInterval);
      // Slow background sync every 15s to complement the instant SSE stream
      pollInterval = setInterval(() => {
        if (isVisible()) loadMessages(true);
      }, 15000);
    },
    // Chat tab hidden or modal closed
    stop() {
      clearInterval(pollInterval);
      pollInterval = null;
      if (streamDisconnect) {
        streamDisconnect();
        streamDisconnect = null;
      }
      if (typingEmitTimeout) {
        clearTimeout(typingEmitTimeout);
        sendAlumniTypingStatus(currentChannel, false);
      }
    },
    selectChannel,
    renderComposer,
    // Pre-fill the composer (e.g. "Say Hi" from the directory)
    prefill(text) {
      const input = composerWrap.querySelector('#alumni-message-input');
      if (input) {
        input.value = text;
        input.focus();
      }
    },
  };
}

function clip(str) {
  return typeof str === 'string' ? str.substring(0, 120) : '';
}
