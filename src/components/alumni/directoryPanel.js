import { fetchAlumniMembers } from '../../data/api.js';
import { escapeHtml } from '../../utils/html.js';

/**
 * "OBs & OGs Directory" tab of the alumni modal. Contact details are masked
 * by the server for visitors.
 *
 * @param {HTMLElement} root  the modal element containing the directory markup
 * @param {object} hooks
 *   onSayHi(name)   start a chat greeting to a member
 *   onSignIn()      visitor asked to sign in to see contacts
 */
export function createDirectoryPanel(root, { onSayHi, onSignIn }) {
  const grid = root.querySelector('#alumni-directory-grid');
  const searchInput = root.querySelector('#directory-search-input');
  const filterPills = root.querySelectorAll('.filter-pill');
  const statsEl = root.querySelector('#directory-stats-summary');

  let currentFilter = 'all';
  let searchTimeout = null;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.toggle('active', p === pill));
      currentFilter = pill.getAttribute('data-filter');
      load();
    });
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(load, 350);
  });

  async function load() {
    grid.innerHTML = '<div class="chat-loading-state">Loading alumni members directory...</div>';

    const res = await fetchAlumniMembers(currentFilter === 'all' ? '' : currentFilter, searchInput.value.trim());
    if (!res.success || !res.members) {
      grid.innerHTML = '<div class="chat-empty-state chat-empty-full">Failed to load directory.</div>';
      return;
    }

    const stats = res.stats || {};
    statsEl.innerHTML = `
      <strong>${res.total || 0} Registered Alumni</strong>
      (<span>👨 ${stats.obCount || 0} Old Boys</span> • <span>👩 ${stats.ogCount || 0} Old Girls</span>)
      ${res.isAuthorized
        ? '<span class="directory-auth-badge">✓ Full networking contacts unlocked</span>'
        : '<span class="directory-guest-badge">🔒 Direct contacts masked for guests</span>'}
    `;

    if (res.members.length === 0) {
      grid.innerHTML = `
        <div class="chat-empty-state chat-empty-full">
          <div class="empty-icon">👥</div>
          <h4>No alumni found</h4>
          <p>Try a different keyword or register a new member profile.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = res.members.map(renderMember).join('');

    grid.querySelectorAll('.btn-say-hi').forEach(btn => {
      btn.addEventListener('click', () => onSayHi(btn.getAttribute('data-name')));
    });
    grid.querySelectorAll('.trigger-reveal-auth').forEach(btn => {
      btn.addEventListener('click', onSignIn);
    });
  }

  return { load };
}

function renderMember(member) {
  const isOB = member.member_type === 'OB';
  const initials = escapeHtml((member.name || 'Alumni').substring(0, 2).toUpperCase());
  const cleanPhone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const contacts = member.isContactMasked
    ? `
      <div class="contact-masked-box">
        <span>🔒 Contact private to verified alumni</span>
        <button class="btn-link-action trigger-reveal-auth">Sign in to view</button>
      </div>`
    : `
      <div class="contact-unmasked-box">
        ${member.phone ? `<a href="tel:${escapeHtml(member.phone)}" class="contact-pill" title="Call">📞 ${escapeHtml(member.phone)}</a>` : ''}
        ${whatsappUrl ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="contact-pill contact-whatsapp" title="WhatsApp">💬 WhatsApp</a>` : ''}
        ${member.email ? `<a href="mailto:${escapeHtml(member.email)}" class="contact-pill" title="Email">✉️ Email</a>` : ''}
      </div>`;

  return `
    <div class="alumni-member-card">
      <div class="member-card-header">
        <div class="member-avatar ${isOB ? 'avatar-ob' : 'avatar-og'}">${initials}</div>
        <div>
          <h5 class="member-name">${escapeHtml(member.name)}</h5>
          <div class="member-meta">
            <span class="alumni-badge ${isOB ? 'badge-ob' : 'badge-og'}">${escapeHtml(member.member_type)}</span>
            <span class="member-year">${escapeHtml(member.class_year)}</span>
          </div>
        </div>
      </div>

      <div class="member-card-body">
        ${member.profession ? `<div class="member-detail">💼 <strong>${escapeHtml(member.profession)}</strong></div>` : ''}
        ${member.location ? `<div class="member-detail">📍 ${escapeHtml(member.location)}</div>` : ''}
        ${member.bio ? `<p class="member-bio">"${escapeHtml(member.bio)}"</p>` : ''}
        <div class="member-contact-strip">${contacts}</div>
      </div>

      <div class="member-card-footer">
        <button class="btn-say-hi" data-name="${escapeHtml(member.name)}">👋 Say Hi in Chat</button>
      </div>
    </div>
  `;
}
