import { fetchAlumniMembers } from '../data/api.js';

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
        <div class="alumni-pillar-card featured">
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
          <button class="btn btn-gold btn-block trigger-chat-btn">
            <span>Open Alumni ChatUp</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        <!-- Card 2: Official WhatsApp Community -->
        <div class="alumni-pillar-card whatsapp-card">
          <div class="pillar-badge whatsapp-badge">Instant Mobile Messaging</div>
          <div class="pillar-icon whatsapp-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.524zm6.208-3.805c1.474.875 3.09 1.338 4.743 1.339 5.431 0 9.849-4.418 9.851-9.852.001-2.633-1.023-5.108-2.887-6.973-1.863-1.864-4.337-2.89-6.97-2.891-5.432 0-9.85 4.418-9.852 9.852-.001 1.748.468 3.454 1.357 4.972l-.999 3.649 3.757-.986z"/>
            </svg>
          </div>
          <h3>Official WhatsApp Group</h3>
          <p>
            Stay connected on your phone! Receive instant updates about school events, alumni announcements, and cohort-specific WhatsApp threads.
          </p>
          <div class="cohort-pills-row">
            <span class="cohort-tag">Kigali Chapter</span>
            <span class="cohort-tag">Nyagatare Hub</span>
            <span class="cohort-tag">Diaspora OB/OG</span>
          </div>
          <a href="https://chat.whatsapp.com/invite/sample-rpps-alumni" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block">
            <span>Join WhatsApp Community</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

        <!-- Card 3: Upcoming 2026 Reunion & Mentorship -->
        <div class="alumni-pillar-card event-card">
          <div class="pillar-badge event-badge">Next Event</div>
          <div class="pillar-icon">🤝</div>
          <h3>2026 Grand Alumni Gala</h3>
          <p>
            The official homecoming at the RPPS Nyagatare Campus: alumni vs pupil sports matches, campus tour of new ICT facilities, and networking banquet.
          </p>
          <div class="event-details-box">
            <div class="event-row">
              <span>📅 Date:</span>
              <strong>December 19, 2026</strong>
            </div>
            <div class="event-row">
              <span>📍 Venue:</span>
              <strong>RPPS Main Campus, Nyagatare</strong>
            </div>
            <div class="event-row">
              <span>⚽ Highlights:</span>
              <strong>OBs Football Match & Mentorship Session</strong>
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
          <!-- Default loaded cards -->
          <div class="spotlight-card">
            <div class="spotlight-avatar ob-avatar">EM</div>
            <div class="spotlight-info">
              <h4>Emmanuel Mugisha</h4>
              <span class="spotlight-role">Civil Engineer • Class of 2016 (OB)</span>
              <p class="spotlight-quote">
                "The discipline, English fluency, and mathematical foundations I gained at RPPS shaped my entire engineering career."
              </p>
            </div>
          </div>

          <div class="spotlight-card">
            <div class="spotlight-avatar og-avatar">GU</div>
            <div class="spotlight-info">
              <h4>Grace Uwase</h4>
              <span class="spotlight-role">Biomedical Scientist • Class of 2018 (OG)</span>
              <p class="spotlight-quote">
                "RPPS gave me the confidence to lead and excel in science. Proud to see our school still leading Nyagatare district!"
              </p>
            </div>
          </div>

          <div class="spotlight-card">
            <div class="spotlight-avatar og-avatar">DM</div>
            <div class="spotlight-info">
              <h4>Diane Mukamana</h4>
              <span class="spotlight-role">Software Developer • Class of 2019 (OG)</span>
              <p class="spotlight-quote">
                "To all current pupils: embrace technology and reading. RPPS teachers will guide you to reach any dream in Rwanda."
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Registration Callout Banner -->
      <div class="alumni-cta-banner">
        <div class="cta-content">
          <div class="cta-badge">Join the Legacy</div>
          <h3>Are you an Old Boy or Old Girl of RPPS?</h3>
          <p>Register your current profession and class year to stay connected, receive event invitations, and inspire current primary pupils.</p>
        </div>
        <div class="cta-actions">
          <button class="btn btn-gold btn-lg trigger-register-btn">
            <span>Register as RPPS Alumni 🎉</span>
          </button>
          <button class="btn btn-outline-white btn-lg trigger-chat-btn-2">
            <span>Enter Alumni Chatroom 🚀</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach button triggers to open the modal on specific tabs & channels
  const chatBtn = section.querySelector('.trigger-chat-btn');
  const chatBtn2 = section.querySelector('.trigger-chat-btn-2');
  const reunionBtn = section.querySelector('.trigger-reunion-btn');
  const directoryBtn = section.querySelector('.trigger-directory-btn');
  const registerBtn = section.querySelector('.trigger-register-btn');

  if (onOpenAlumniModal) {
    if (chatBtn) chatBtn.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
    if (chatBtn2) chatBtn2.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
    if (reunionBtn) reunionBtn.addEventListener('click', () => onOpenAlumniModal('chat', 'reunions'));
    if (directoryBtn) directoryBtn.addEventListener('click', () => onOpenAlumniModal('directory'));
    if (registerBtn) registerBtn.addEventListener('click', () => onOpenAlumniModal('register'));
  }

  // Load dynamic members from database if available
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
