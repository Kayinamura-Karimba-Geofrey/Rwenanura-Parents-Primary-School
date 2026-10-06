import {
  fetchCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateCalendarTerm
} from '../data/api.js';
import { escapeHtml } from '../utils/html.js';

const CATEGORY_LABELS = { academic: 'Academic & Exams', holiday: 'Holidays & Breaks', community: 'School Life & Sports' };
const STATUS_LABELS = { active: 'Active', upcoming: 'Upcoming', completed: 'Completed' };

/**
 * Staff/admin editor for the academic calendar (Calendar tab of the
 * management console). Changes are saved through /api/calendar/* and the
 * public calendar section is told to reload via 'rpps-calendar-changed'.
 */
export function createCalendarManager() {
  const root = document.createElement('div');
  root.className = 'calendar-manager';

  let terms = [];
  let events = [];
  let editingId = null; // null = adding a new event

  root.innerHTML = `
    <h4 class="dash-section-title">Terms</h4>
    <div class="cm-terms" id="cm-terms"></div>

    <div class="dash-toolbar">
      <h4 class="dash-section-title">Events</h4>
      <button type="button" class="btn btn-primary btn-xs" id="cm-add-btn">+ Add Event</button>
    </div>

    <form class="dash-form" id="cm-event-form" hidden>
      <h4 class="dash-form-title" id="cm-form-title">New Event</h4>
      <div class="dash-form-grid">
        <label class="dash-field">Title (English) *
          <input type="text" name="title_en" required maxlength="160" />
        </label>
        <label class="dash-field">Term *
          <select name="term" id="cm-term-select" required></select>
        </label>
        <label class="dash-field">Category *
          <select name="category" required>
            ${Object.entries(CATEGORY_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </label>
        <label class="dash-field">Starts *
          <input type="datetime-local" name="startDate" required />
        </label>
        <label class="dash-field">Ends *
          <input type="datetime-local" name="endDate" required />
        </label>
        <label class="dash-field">Audience
          <input type="text" name="audience" maxlength="80" placeholder="e.g. All Pupils & Staff" />
        </label>
        <label class="dash-field">Location
          <input type="text" name="location" maxlength="120" placeholder="e.g. Main Hall" />
        </label>
      </div>
      <label class="dash-field">Description (English)
        <textarea name="description_en" rows="2" maxlength="1000"></textarea>
      </label>
      <details class="dash-translations">
        <summary>Translations (optional, English is shown when empty)</summary>
        <div class="dash-form-grid">
          <label class="dash-field">Title (Kinyarwanda)<input type="text" name="title_rw" maxlength="160" /></label>
          <label class="dash-field">Title (French)<input type="text" name="title_fr" maxlength="160" /></label>
          <label class="dash-field">Description (Kinyarwanda)<textarea name="description_rw" rows="2" maxlength="1000"></textarea></label>
          <label class="dash-field">Description (French)<textarea name="description_fr" rows="2" maxlength="1000"></textarea></label>
        </div>
      </details>
      <div class="dash-form-actions">
        <button type="button" class="btn btn-outline btn-xs" id="cm-cancel-btn">Cancel</button>
        <button type="submit" class="btn btn-primary btn-xs" id="cm-save-btn">Save Event</button>
      </div>
    </form>

    <div class="dash-list" id="cm-events"></div>
  `;

  const termsEl = root.querySelector('#cm-terms');
  const eventsEl = root.querySelector('#cm-events');
  const form = root.querySelector('#cm-event-form');
  const termSelect = root.querySelector('#cm-term-select');

  function notifyChanged() {
    window.dispatchEvent(new CustomEvent('rpps-calendar-changed'));
  }

  async function load() {
    const res = await fetchCalendar();
    if (!res.success) {
      eventsEl.innerHTML = `<div class="dash-empty">${escapeHtml(res.error || 'Failed to load the calendar.')}</div>`;
      return;
    }
    terms = res.terms || [];
    events = res.events || [];
    termSelect.innerHTML = terms.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name.en)}</option>`).join('');
    renderTerms();
    renderEvents();
  }

  function renderTerms() {
    termsEl.innerHTML = terms.map(t => `
      <form class="cm-term-card" data-term-id="${escapeHtml(t.id)}">
        <strong>${escapeHtml(t.name.en)}</strong>
        <label class="dash-field">Dates
          <input type="text" name="period" required maxlength="80" value="${escapeHtml(t.period)}" />
        </label>
        <label class="dash-field">Status
          <select name="status">
            ${Object.entries(STATUS_LABELS).map(([v, l]) => `<option value="${v}" ${t.status === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
        <label class="dash-field">Highlights (English)
          <textarea name="highlights" rows="2" required maxlength="400">${escapeHtml(t.highlights.en || '')}</textarea>
        </label>
        <button type="submit" class="btn btn-outline btn-xs">Save Term</button>
      </form>
    `).join('');

    termsEl.querySelectorAll('.cm-term-card').forEach(card => {
      card.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(card);
        const res = await updateCalendarTerm(card.dataset.termId, {
          period: data.get('period'),
          status: data.get('status'),
          highlights: { en: data.get('highlights') }
        });
        if (!res.success) return alert(res.error || 'Failed to update the term.');
        await load();
        notifyChanged();
      });
    });
  }

  function renderEvents() {
    if (events.length === 0) {
      eventsEl.innerHTML = '<div class="dash-empty">No events yet. Use "Add Event" to create one.</div>';
      return;
    }
    const termName = id => (terms.find(t => t.id === id)?.name.en || id);
    eventsEl.innerHTML = events.map(ev => `
      <div class="dash-item">
        <div>
          <div class="dash-item-meta">
            <span class="badge dash-badge">${escapeHtml(CATEGORY_LABELS[ev.category] || ev.category)}</span>
            <span>${escapeHtml(ev.dateDisplay)} • ${escapeHtml(termName(ev.term))}</span>
          </div>
          <strong class="dash-item-title">${escapeHtml(ev.title.en)}</strong>
          ${ev.location ? `<p class="dash-item-text">📍 ${escapeHtml(ev.location)}</p>` : ''}
        </div>
        <div class="dash-item-actions">
          <button type="button" class="btn btn-outline btn-xs cm-edit-btn" data-id="${ev.id}">Edit</button>
          <button type="button" class="btn btn-outline btn-xs cm-delete-btn" data-id="${ev.id}">Delete</button>
        </div>
      </div>
    `).join('');

    eventsEl.querySelectorAll('.cm-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openForm(events.find(ev => String(ev.id) === btn.dataset.id)));
    });
    eventsEl.querySelectorAll('.cm-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this calendar event?')) return;
        const res = await deleteCalendarEvent(btn.dataset.id);
        if (!res.success) return alert(res.error || 'Failed to delete the event.');
        await load();
        notifyChanged();
      });
    });
  }

  function openForm(ev = null) {
    editingId = ev ? ev.id : null;
    form.reset();
    root.querySelector('#cm-form-title').textContent = ev ? 'Edit Event' : 'New Event';
    if (ev) {
      const set = (name, value) => { form.elements[name].value = value || ''; };
      set('title_en', ev.title.en); set('title_rw', ev.title.rw); set('title_fr', ev.title.fr);
      set('description_en', ev.description.en); set('description_rw', ev.description.rw); set('description_fr', ev.description.fr);
      set('term', ev.term); set('category', ev.category);
      set('startDate', ev.startDate.slice(0, 16)); set('endDate', ev.endDate.slice(0, 16));
      set('audience', ev.audience); set('location', ev.location);
    }
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  root.querySelector('#cm-add-btn').addEventListener('click', () => openForm());
  root.querySelector('#cm-cancel-btn').addEventListener('click', () => { form.hidden = true; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      term: data.get('term'),
      category: data.get('category'),
      title: { en: data.get('title_en'), rw: data.get('title_rw'), fr: data.get('title_fr') },
      description: { en: data.get('description_en'), rw: data.get('description_rw'), fr: data.get('description_fr') },
      startDate: data.get('startDate'),
      endDate: data.get('endDate'),
      audience: data.get('audience'),
      location: data.get('location')
    };
    const saveBtn = root.querySelector('#cm-save-btn');
    saveBtn.disabled = true;
    const res = editingId ? await updateCalendarEvent(editingId, payload) : await createCalendarEvent(payload);
    saveBtn.disabled = false;
    if (!res.success) return alert(res.error || 'Failed to save the event.');
    form.hidden = true;
    await load();
    notifyChanged();
  });

  root.load = load;
  return root;
}
