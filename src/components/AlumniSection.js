import { fetchAlumniMembers } from '../data/api.js';
import { getUserRole, getCurrentUser, onAuthChange } from '../data/userRole.js';

export function createAlumniSection(onOpenAlumniModal) {
  const section = document.createElement('section');
  section.className = 'section alumni-homepage-section';
  section.id = 'alumni';

  section.innerHTML = `
    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <div class="badge badge-gold">Alumni Network & Community</div>
        <h2 class="section-title">Old Boys & Old Girls (OBs & OGs)</h2>
        <p class="section-subtitle">
          From Rwenanura to universities and leadership across Rwanda and beyond. Reconnect with classmates, mentor upcoming candidates, and participate in school development.
        </p>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="alumni-metrics-strip">
        <div class="metric-pill">
          <span class="metric-num">500+</span>
          <span class="metric-lbl">Graduated Alumni</span>
        </div>
        <div class="metric-pill">
          <span class="metric-num">18+</span>
          <span class="metric-lbl">Graduating Cohorts</span>
        </div>
        <div class="metric-pill">
          <span class="metric-num">25+</span>
          <span class="metric-lbl">Active Mentors</span>
        </div>
        <div class="metric-pill">
          <span class="metric-num">100%</span>
          <span class="metric-lbl">RPPS Spirit & Pride</span>
        </div>
      </div>

      <!-- 3 Communication Pillars Grid -->
      <div class="alumni-pillars-grid">
        <!-- Card 1: Live ChatUp -->
        <div class="alumni-pillar-card">
          <div class="pillar-badge">Real-Time Community</div>
          <div class="pillar-icon">💬</div>
          <h3>OBs & OGs Live ChatUp</h3>
          <p>
            Connect directly in themed channels: daily catch-ups in <strong>#General</strong>, reunion arrangements in <strong>#Reunions</strong>, guidance in <strong>#Mentorship</strong>, and throwback stories in <strong>#Memories</strong>.
          </p>
          <ul class="pillar-perks">
            <li>✓ Custom OB/OG profile badge & class year</li>
            <li>✓ Cheer reactions & instant replies</li>
            <li>✓ Classmate directory & mentions</li>
          </ul>
          <button class="btn btn-primary btn-block trigger-chat-btn">
            <span>Open Alumni ChatUp</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        <!-- Card 2: Official WhatsApp Community -->
        <div class="alumni-pillar-card">
          <div class="pillar-badge">Mobile Messaging</div>
          <div class="pillar-icon">📲</div>
          <h3>Official WhatsApp Group</h3>
          <p>
            Stay connected on your phone! Receive instant updates about school events, alumni announcements, and cohort-specific WhatsApp threads.
          </p>
          <div class="cohort-pills-row">
            <span class="cohort-tag">Kigali Chapter</span>
            <span class="cohort-tag">Nyagatare Hub</span>
            <span class="cohort-tag">Diaspora OB/OG</span>
          </div>
          <a href="https://chat.whatsapp.com/invite/sample-rpps-alumni" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-block">
            <span>Join WhatsApp Community</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

        <!-- Card 3: Upcoming 2026 Reunion & Mentorship -->
        <div class="alumni-pillar-card">
          <div class="pillar-badge">Homecoming 2026</div>
          <div class="pillar-icon">🤝</div>
          <h3>2026 Grand Alumni Gala</h3>
          <p>
            The official homecoming at the RPPS Nyagatare Campus: alumni vs pupil sports matches, campus tour of new ICT facilities, and networking banquet.
          </p>
          <div class="event-details-box">
            <div class="event-row">
              <span>Date:</span>
              <strong>December 19, 2026</strong>
            </div>
            <div class="event-row">
              <span>Venue:</span>
              <strong>RPPS Main Campus, Nyagatare</strong>
            </div>
            <div class="event-row">
              <span>Highlights:</span>
              <strong>OBs Football Match & Mentorship</strong>
            </div>
          </div>
          <button class="btn btn-outline btn-block trigger-reunion-btn">
            <span>Discuss in #Reunions Channel</span>
          </button>
        </div>
      </div>

      <!-- Spotlight: Alumni in Action -->
      <div class="alumni-spotlight-area">
        <div class="spotlight-header">
          <div>
            <h3 class="spotlight-title">Featured Alumni Spotlights</h3>
            <p class="spotlight-sub">Discover where our Old Boys and Old Girls are making an impact today.</p>
          </div>
          <button class="btn btn-sm btn-outline trigger-directory-btn">
            <span>Browse Full Directory (500+) →</span>
          </button>
        </div>

        <div class="spotlight-cards-grid" id="alumni-spotlight-cards">
          <!-- Loaded dynamically -->
        </div>
      </div>

      <!-- Bottom Registration Callout Banner (Role-Dynamic) -->
      <div class="alumni-cta-banner" id="alumni-cta-banner-container">
        <!-- Rendered based on auth state -->
      </div>
    </div>
  `;

  const bannerContainer = section.querySelector('#alumni-cta-banner-container');

  function renderBanner() {
    const role = getUserRole();
    const user = getCurrentUser();

    if (role === 'alumni' && user) {
      bannerContainer.innerHTML = `
        <div class="cta-content">
          <div class="cta-badge">Verified Member: ${escapeHtml(user.memberType || 'OB')}</div>
          <h3>Welcome back, ${escapeHtml(user.name)}!</h3>
          <p>You are authenticated with the ${escapeHtml(user.classYear || 'Alumni Cohort')}. Reconnect in real-time, plan the 2026 reunion, or explore the full alumni contact directory.</p>
        </div>
        <div class="cta-actions">
          <button class="btn btn-gold btn-lg trigger-chat-action">
            <span>Open Alumni Lounge 💬</span>
          </button>
          <button class="btn btn-outline-white btn-lg trigger-directory-action">
            <span>Full Directory (500+) 👥</span>
          </button>
        </div>
      `;

      const chatAction = bannerContainer.querySelector('.trigger-chat-action');
      const dirAction = bannerContainer.querySelector('.trigger-directory-action');
      if (chatAction && onOpenAlumniModal) chatAction.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
      if (dirAction && onOpenAlumniModal) dirAction.addEventListener('click', () => onOpenAlumniModal('directory'));

    } else {
      bannerContainer.innerHTML = `
        <div class="cta-content">
          <div class="cta-badge">Join the Legacy</div>
          <h3>Are you an Old Boy or Old Girl of RPPS?</h3>
          <p>Authenticate or register your profile to unlock full directory contacts, network with classmates, and post in the live chat lounge.</p>
        </div>
        <div class="cta-actions">
          <button class="btn btn-gold btn-lg trigger-register-action">
            <span>Alumni Sign In / Register 🎉</span>
          </button>
          <button class="btn btn-outline-white btn-lg trigger-chat-action">
            <span>Preview Chatroom 💬</span>
          </button>
        </div>
      `;

      const regAction = bannerContainer.querySelector('.trigger-register-action');
      const chatAction = bannerContainer.querySelector('.trigger-chat-action');
      if (regAction && onOpenAlumniModal) regAction.addEventListener('click', () => onOpenAlumniModal('portal'));
      if (chatAction && onOpenAlumniModal) chatAction.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
    }
  }

  // Initial render
  renderBanner();
  onAuthChange(() => renderBanner());

  // Attach button triggers to open the modal
  const chatBtn = section.querySelector('.trigger-chat-btn');
  const reunionBtn = section.querySelector('.trigger-reunion-btn');
  const directoryBtn = section.querySelector('.trigger-directory-btn');

  if (onOpenAlumniModal) {
    if (chatBtn) chatBtn.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
    if (reunionBtn) reunionBtn.addEventListener('click', () => onOpenAlumniModal('chat', 'reunions'));
    if (directoryBtn) directoryBtn.addEventListener('click', () => onOpenAlumniModal('directory'));
  }

  // Load dynamic members from database
  fetchAlumniMembers('', '').then(res => {
    if (res.success && res.members && res.members.length > 0) {
      const container = section.querySelector('#alumni-spotlight-cards');
      if (!container) return;
      const top3 = res.members.slice(0, 3);
      container.innerHTML = top3.map(m => {
        const isOB = m.member_type === 'OB';
        const avatarClass = isOB ? 'ob-avatar' : 'og-avatar';
        const initials = (m.name || 'Alumni').substring(0, 2).toUpperCase();
        return `
          <div class="spotlight-card">
            <div class="spotlight-avatar ${avatarClass}">${initials}</div>
            <div class="spotlight-info">
              <h4>${escapeHtml(m.name)}</h4>
              <span class="spotlight-role">${escapeHtml(m.profession || 'Alumni')} • ${escapeHtml(m.class_year)} (${m.member_type})</span>
              ${m.bio ? `<p class="spotlight-quote">"${escapeHtml(m.bio)}"</p>` : `<p class="spotlight-quote">"Proud RPPS ${m.member_type} upholding excellence, light, and leadership."</p>`}
            </div>
          </div>
        `;
      }).join('');
    }
  });

  return section;
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
