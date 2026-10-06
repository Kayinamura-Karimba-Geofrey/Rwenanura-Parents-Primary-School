import { downloadICalFile } from '../data/calendarData.js';
import { fetchCalendar } from '../data/api.js';
import { canViewCalendar, onAuthChange } from '../data/userRole.js';
import { t, getLanguage } from '../data/i18n.js';

/**
 * School calendar section. Only signed-in students, staff and admins can see
 * it; the data is fetched from GET /api/calendar (which enforces the same
 * rule), so nothing is rendered or bundled for visitors.
 */
export function createAcademicCalendar() {
  const section = document.createElement('section');
  section.className = 'section calendar-section';
  section.id = 'calendar';
  section.hidden = true;

  let academicTerms = [];
  let calendarEvents = [];

  let selectedTerm = 'all';
  let selectedCategory = 'all';
  let searchQuery = '';

  const terms = [
    { id: 'all', key: 'cal_tab_all_terms', defaultLabel: 'All Academic Year (2026/2027)' },
    { id: 'term-1', key: 'cal_tab_term1', defaultLabel: 'Term 1 (Sep – Dec 2026)' },
    { id: 'term-2', key: 'cal_tab_term2', defaultLabel: 'Term 2 (Jan – Apr 2027)' },
    { id: 'term-3', key: 'cal_tab_term3', defaultLabel: 'Term 3 (Apr – Jul 2027)' }
  ];

  const categories = [
    { id: 'all', key: 'cal_cat_all', defaultLabel: 'All Categories' },
    { id: 'academic', key: 'cal_cat_academic', defaultLabel: 'Academic & Exams' },
    { id: 'holiday', key: 'cal_cat_holiday', defaultLabel: 'Holidays & Breaks' },
    { id: 'community', key: 'cal_cat_community', defaultLabel: 'School Life & Sports' }
  ];

  function getLocalizedText(obj) {
    const lang = getLanguage();
    if (!obj) return '';
    return obj[lang] || obj.en || '';
  }

  async function refresh() {
    if (!canViewCalendar()) {
      section.hidden = true;
      section.innerHTML = '';
      return;
    }
    const res = await fetchCalendar();
    // Role may have changed while the request was in flight
    if (!res.success || !canViewCalendar()) {
      section.hidden = true;
      section.innerHTML = '';
      return;
    }
    academicTerms = res.terms || [];
    calendarEvents = res.events || [];
    render();
    section.hidden = false;
  }

  function render() {
    section.innerHTML = `
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="badge badge-gold">${t('cal_badge', 'Official Timetable & Schedule')}</div>
          <h2 class="section-title">${t('cal_title', 'Academic Calendar & Term Dates 2026/2027')}</h2>
          <p class="section-subtitle">
            ${t('cal_subtitle', 'Structured according to Rwanda Basic Education Board (REB) guidelines. Keep track of term openings, examination periods, sports days, and school vacations.')}
          </p>
        </div>

        <!-- 3-Term Overview Cards -->
        <div class="term-overview-grid">
          ${academicTerms.map(term => {
            const isActive = term.status === 'active';
            const statusText = isActive 
              ? t('cal_status_active', 'Active Term') 
              : t('cal_status_upcoming', 'Upcoming Term');
            return `
              <div class="term-summary-card ${isActive ? 'term-active' : ''}" data-term-id="${term.id}">
                <div>
                  <span class="term-status-pill ${isActive ? 'term-status-active' : 'term-status-upcoming'}">
                    ${isActive ? '🟢' : '📅'} ${statusText}
                  </span>
                  <h3 class="term-card-title">${escapeHtml(getLocalizedText(term.name))}</h3>
                  <div class="term-card-period">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>${escapeHtml(term.period)}</span>
                  </div>
                </div>
                <div class="term-card-highlights">
                  <strong>${t('cal_highlights_label', 'Highlights')}:</strong> ${escapeHtml(getLocalizedText(term.highlights))}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Filter Controls & Action Bar -->
        <div class="calendar-control-bar">
          <div class="calendar-top-controls">
            <!-- Term Tabs -->
            <div class="calendar-term-tabs" id="calendar-term-tabs">
              ${terms.map(tItem => `
                <button class="calendar-tab-btn ${tItem.id === selectedTerm ? 'active' : ''}" data-term="${tItem.id}">
                  ${t(tItem.key, tItem.defaultLabel)}
                </button>
              `).join('')}
            </div>

            <!-- Actions: Export to iCal & Print PDF -->
            <div class="calendar-export-actions">
              <button class="btn-export-ical" id="btn-export-ical" title="Sync with Google Calendar, Apple Calendar, or Outlook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>${t('cal_btn_export_ical', 'Sync to Calendar (.ics)')}</span>
              </button>
              <button class="btn-print-timetable" id="btn-print-timetable" title="Print or save as PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>${t('cal_btn_print', 'Print / Save PDF')}</span>
              </button>
            </div>
          </div>

          <!-- Secondary Row: Category Filter & Search Box -->
          <div class="calendar-secondary-row">
            <div class="calendar-category-filters" id="calendar-cat-filters">
              ${categories.map(cItem => `
                <button class="category-filter-pill ${cItem.id === selectedCategory ? 'active' : ''}" data-cat="${cItem.id}">
                  ${t(cItem.key, cItem.defaultLabel)}
                </button>
              `).join('')}
            </div>

            <div class="calendar-search-box">
              <svg class="calendar-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="calendar-search-input" id="calendar-search-input" placeholder="${t('cal_search_placeholder', 'Search events, exams, or holidays...')}" />
            </div>
          </div>
        </div>

        <!-- Events Timeline List -->
        <div class="calendar-events-list" id="calendar-events-container">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    const eventsContainer = section.querySelector('#calendar-events-container');
    const termTabs = section.querySelectorAll('.calendar-tab-btn');
    const catPills = section.querySelectorAll('.category-filter-pill');
    const searchInput = section.querySelector('#calendar-search-input');
    const exportBtn = section.querySelector('#btn-export-ical');
    const printBtn = section.querySelector('#btn-print-timetable');
    const termOverviewCards = section.querySelectorAll('.term-summary-card');

    function getFilteredEvents() {
      return calendarEvents.filter(ev => {
        // Term filter
        if (selectedTerm !== 'all' && ev.term !== selectedTerm) return false;

        // Category filter
        if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim();
          const title = getLocalizedText(ev.title).toLowerCase();
          const desc = getLocalizedText(ev.description).toLowerCase();
          const location = (ev.location || '').toLowerCase();
          const audience = (ev.audience || '').toLowerCase();
          return title.includes(query) || desc.includes(query) || location.includes(query) || audience.includes(query);
        }

        return true;
      });
    }

    function renderEvents() {
      const list = getFilteredEvents();

      if (list.length === 0) {
        eventsContainer.innerHTML = `
          <div class="calendar-empty-state">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
            <h4>${t('cal_empty_title', 'No Events Found')}</h4>
            <p>${t('cal_empty_sub', 'Try adjusting your search query or selecting a different term filter.')}</p>
          </div>
        `;
        return;
      }

      eventsContainer.innerHTML = list.map(ev => {
        const title = getLocalizedText(ev.title);
        const desc = getLocalizedText(ev.description);
        const termLabel = ev.term === 'term-1' ? 'Term 1' : ev.term === 'term-2' ? 'Term 2' : 'Term 3';
        const catClass = ev.category === 'academic' ? 'cat-academic' : ev.category === 'holiday' ? 'cat-holiday' : 'cat-community';
        const catLabel = ev.category === 'academic' ? t('cal_cat_academic') : ev.category === 'holiday' ? t('cal_cat_holiday') : t('cal_cat_community');

        return `
          <div class="calendar-event-card">
            <div class="event-date-box">
              <span class="event-date-text">${escapeHtml(ev.dateDisplay)}</span>
              <span class="event-term-tag">${termLabel}</span>
            </div>

            <div class="event-content-box">
              <div class="event-meta-row">
                <span class="event-category-badge ${catClass}">${catLabel}</span>
                <span class="event-audience-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>${escapeHtml(ev.audience)}</span>
                </span>
                <span class="event-location-pill">
                  📍 <span>${escapeHtml(ev.location)}</span>
                </span>
              </div>

              <h4 class="event-title">${escapeHtml(title)}</h4>
              <p class="event-desc">${escapeHtml(desc)}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // Bind Term Tabs
    termTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        termTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTerm = btn.getAttribute('data-term');
        renderEvents();
      });
    });

    // Bind Term Overview Cards (clicking card switches term tab)
    termOverviewCards.forEach(card => {
      card.addEventListener('click', () => {
        const termId = card.getAttribute('data-term-id');
        termTabs.forEach(b => {
          if (b.getAttribute('data-term') === termId) {
            b.click();
            b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });
    });

    // Bind Category Pills
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedCategory = pill.getAttribute('data-cat');
        renderEvents();
      });
    });

    // Bind Search Input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderEvents();
    });

    // Bind Export to iCal
    exportBtn.addEventListener('click', () => {
      const list = getFilteredEvents();
      const currentLang = getLanguage();
      const termSuffix = selectedTerm !== 'all' ? `-${selectedTerm}` : '';
      downloadICalFile(list, `RPPS-Calendar-2026-2027${termSuffix}.ics`, currentLang);
    });

    // Bind Print Timetable
    printBtn.addEventListener('click', () => {
      window.print();
    });

    renderEvents();
  }

  refresh();
  onAuthChange(refresh);

  return section;
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
