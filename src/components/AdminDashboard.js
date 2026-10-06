import { 
  fetchApplications, 
  updateApplicationStatus, 
  deleteApplication,
  fetchSubscribers,
  fetchNewsAndEvents,
  createNewsItem,
  deleteNewsItem,
  fetchStaffUsers,
  approveUser,
  issueTemporaryPassword,
  updateStaffRole,
  deleteStaffUser,
  logoutUser,
  getStoredUser
} from '../data/api.js';
import { createCalendarManager } from './CalendarManager.js';
import { escapeHtml } from '../utils/html.js';
import { onCleanup } from '../utils/lifecycle.js';

export function createAdminDashboard(onLogout) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'admin-dashboard-modal';

  modal.innerHTML = `
    <div class="modal-dialog dash-dialog">

      <!-- Top Header -->
      <div class="admin-dash-header">
        <div class="dash-identity">
          <div class="logo-crest dash-crest">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h3 class="dash-title">School Management Console</h3>
            <p class="dash-user-line">
              User: <strong id="dash-user-name">Admin</strong> (<span id="dash-user-email"></span>)
              <span id="dash-user-role" class="badge badge-gold dash-role-badge">ADMIN</span>
            </p>
          </div>
        </div>

        <div class="dash-header-actions">
          <button id="dash-refresh-btn" class="btn btn-outline btn-xs">🔄 Sync Data</button>
          <button id="dash-logout-btn" class="btn btn-primary btn-xs">Logout 🚪</button>
          <button class="modal-close dash-close" aria-label="Close modal">&times;</button>
        </div>
      </div>

      <!-- Quick Stats Counter Grid -->
      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat-label">Total Admissions</div>
          <div id="stat-total-apps" class="dash-stat-value">0</div>
        </div>
        <div class="dash-stat dash-stat-gold">
          <div class="dash-stat-label">Pending Review</div>
          <div id="stat-pending-apps" class="dash-stat-value">0</div>
        </div>
        <div class="dash-stat dash-stat-green">
          <div class="dash-stat-label">Approved</div>
          <div id="stat-approved-apps" class="dash-stat-value">0</div>
        </div>
        <div class="dash-stat dash-stat-gold-border">
          <div class="dash-stat-label">Subscribers</div>
          <div id="stat-subscribers" class="dash-stat-value">0</div>
        </div>
      </div>

      <!-- Grade Analytics Breakdown -->
      <div class="dash-panel">
        <div class="dash-panel-header">
          <strong>📊 Applicant Distribution by Grade Level</strong>
          <span>Live Class Enrollment Analytics</span>
        </div>
        <div id="grade-analytics-bars" class="dash-grade-bars"></div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="dash-tabs" role="tablist">
        <button class="dash-tab active" data-tab="admissions" role="tab">📝 Admissions Applications</button>
        <button class="dash-tab" data-tab="news" role="tab">📢 News & Announcements</button>
        <button class="dash-tab" data-tab="newsletter" role="tab">📧 Newsletter Mailing List</button>
        <button class="dash-tab" data-tab="staff" id="dash-staff-tab-btn" role="tab">🛡️ Accounts</button>
        <button class="dash-tab" data-tab="calendar" role="tab">📅 Calendar</button>
      </div>

      <!-- Tab Content Area -->
      <div class="dash-content">

        <!-- 1. ADMISSIONS TAB -->
        <div id="tab-content-admissions">
          <div class="dash-toolbar dash-toolbar-top">
            <input type="text" id="dash-app-search" class="dash-search" placeholder="🔍 Search by pupil name, parent, or code..." />
            <div class="dash-item-actions">
              <div class="dash-filters" id="dash-app-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="Pending">Pending</button>
                <button class="filter-btn" data-filter="Under Review">Under Review</button>
                <button class="filter-btn" data-filter="Approved">Approved</button>
              </div>
              <button id="export-csv-btn" class="btn btn-outline btn-xs">📥 Export CSV</button>
            </div>
          </div>

          <div id="dash-apps-container" class="dash-list">
            <div class="dash-empty">Loading admissions...</div>
          </div>
        </div>

        <!-- 2. NEWS MANAGEMENT TAB -->
        <div id="tab-content-news" hidden>
          <div class="dash-callout">
            <div>
              <strong>Publish New School Article / Calendar Event</strong>
              <p>Add news or events to be rendered live on the public landing page.</p>
            </div>
            <button id="show-add-news-form-btn" class="btn btn-primary btn-xs">+ Create Article</button>
          </div>

          <form id="add-news-form" class="dash-form" hidden>
            <h4 class="dash-form-title">New News / Event Form</h4>

            <div class="admin-form-grid-3">
              <label class="dash-field">Article Title *
                <input type="text" id="news-input-title" required placeholder="e.g. Primary 6 Graduation Ceremony" />
              </label>
              <label class="dash-field">Type
                <select id="news-input-type">
                  <option value="news">News Article</option>
                  <option value="event">School Event</option>
                </select>
              </label>
              <label class="dash-field">Category *
                <input type="text" id="news-input-category" required placeholder="Academic / Sports" />
              </label>
            </div>

            <div class="admin-form-grid-4">
              <label class="dash-field">Day (DD)
                <input type="text" id="news-input-day" required placeholder="15" />
              </label>
              <label class="dash-field">Month (MMM)
                <input type="text" id="news-input-month" required placeholder="OCT" />
              </label>
              <label class="dash-field">Year
                <input type="text" id="news-input-year" required value="${new Date().getFullYear()}" />
              </label>
              <label class="dash-field">Time
                <input type="text" id="news-input-time" placeholder="09:00 AM - 01:00 PM" />
              </label>
            </div>

            <label class="dash-field">Location
              <input type="text" id="news-input-location" placeholder="e.g. School Main Auditorium" />
            </label>

            <label class="dash-field">Summary Description *
              <textarea id="news-input-summary" required rows="2" placeholder="Brief summary of the announcement..."></textarea>
            </label>

            <label class="dash-field">Full Article (optional, shown by "Read more")
              <textarea id="news-input-body" rows="5" maxlength="5000" placeholder="The complete story. Leave a blank line between paragraphs."></textarea>
            </label>

            <div class="dash-form-actions">
              <button type="button" id="cancel-add-news-btn" class="btn btn-outline btn-xs">Cancel</button>
              <button type="submit" class="btn btn-primary btn-xs">Publish to Live Site</button>
            </div>
          </form>

          <div id="dash-news-container" class="dash-list">
            <div class="dash-empty">Loading articles...</div>
          </div>
        </div>

        <!-- 3. SUBSCRIBERS TAB -->
        <div id="tab-content-newsletter" hidden>
          <div class="dash-toolbar dash-toolbar-top">
            <div class="dash-muted">
              Registered Subscribers: <strong id="dash-subscribers-count" class="dash-count">0</strong>
            </div>
            <button id="copy-subscribers-btn" class="btn btn-outline btn-xs">📋 Copy Email List</button>
          </div>

          <div id="dash-subscribers-container">
            <div class="dash-empty">Loading subscribers list...</div>
          </div>
        </div>

        <!-- 4. ACCOUNTS TAB (staff: students; admin: everyone) -->
        <div id="tab-content-staff" hidden>
          <p id="dash-accounts-help" class="dash-help"></p>
          <div id="dash-staff-container" class="dash-list">
            <div class="dash-empty">Loading accounts...</div>
          </div>
        </div>

        <!-- 5. CALENDAR TAB (staff/admin edit the academic calendar) -->
        <div id="tab-content-calendar" hidden></div>

      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  const logoutBtn = modal.querySelector('#dash-logout-btn');
  logoutBtn.addEventListener('click', () => {
    logoutUser();
    modal.classList.remove('active');
    if (onLogout) onLogout();
  });

  const refreshBtn = modal.querySelector('#dash-refresh-btn');
  refreshBtn.addEventListener('click', loadAllData);

  const exportCsvBtn = modal.querySelector('#export-csv-btn');
  exportCsvBtn.addEventListener('click', exportApplicationsCSV);

  // Tab Switching Logic
  const tabs = modal.querySelectorAll('.dash-tab');
  const tabContents = {
    admissions: modal.querySelector('#tab-content-admissions'),
    news: modal.querySelector('#tab-content-news'),
    newsletter: modal.querySelector('#tab-content-newsletter'),
    staff: modal.querySelector('#tab-content-staff'),
    calendar: modal.querySelector('#tab-content-calendar')
  };

  const calendarManager = createCalendarManager();
  tabContents.calendar.appendChild(calendarManager);

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const selected = e.currentTarget.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t === e.currentTarget));
      Object.keys(tabContents).forEach(key => {
        tabContents[key].hidden = key !== selected;
      });
    });
  });

  // Global State Data
  let applications = [];
  let subscribers = [];
  let newsList = [];
  let staffUsers = [];
  let appFilter = 'all';

  async function loadAllData() {
    const user = getStoredUser();
    const isAdmin = user && user.role === 'admin';
    if (user) {
      modal.querySelector('#dash-user-name').textContent = user.name || 'Staff';
      modal.querySelector('#dash-user-email').textContent = user.email || '';
      modal.querySelector('#dash-user-role').textContent = (user.role || 'staff').toUpperCase();
    }
    modal.querySelector('#dash-accounts-help').innerHTML = isAdmin
      ? 'New registrations stay <strong>pending</strong> until approved here. Students can view the school calendar; staff can also manage admissions and approve students; admins manage every account.'
      : 'New student registrations stay <strong>pending</strong> until you approve them. Approved students can sign in and view the school calendar.';

    const [appRes, subRes, newsRes, staffRes] = await Promise.all([
      fetchApplications(),
      fetchSubscribers(),
      fetchNewsAndEvents(),
      fetchStaffUsers()
    ]);

    if (appRes.success) applications = appRes.applications || [];
    if (subRes.success) subscribers = subRes.subscribers || [];
    if (newsRes.success) newsList = newsRes.newsAndEvents || [];
    if (staffRes.success) staffUsers = staffRes.users || [];

    updateCounters();
    renderGradeAnalytics();
    renderApplications();
    renderNews();
    renderSubscribers();
    renderStaff();
    calendarManager.load();
  }

  function updateCounters() {
    modal.querySelector('#stat-total-apps').textContent = applications.length;
    modal.querySelector('#stat-pending-apps').textContent = applications.filter(a => a.status === 'Pending').length;
    modal.querySelector('#stat-approved-apps').textContent = applications.filter(a => a.status === 'Approved').length;
    modal.querySelector('#stat-subscribers').textContent = subscribers.length;
    modal.querySelector('#dash-subscribers-count').textContent = subscribers.length;
  }

  function renderGradeAnalytics() {
    const container = modal.querySelector('#grade-analytics-bars');
    const gradeCounts = {};
    
    applications.forEach(app => {
      const g = app.grade || 'Other';
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    });

    const total = applications.length || 1;
    const sortedGrades = Object.keys(gradeCounts).sort();

    if (sortedGrades.length === 0) {
      container.innerHTML = `<span class="dash-muted">No application grade metrics recorded yet.</span>`;
      return;
    }

    container.innerHTML = sortedGrades.map(grade => {
      const count = gradeCounts[grade];
      const pct = Math.round((count / total) * 100);
      return `
        <div class="dash-grade">
          <div class="dash-grade-head">
            <span>${escapeHtml(grade)}</span>
            <span class="dash-count">${count} (${pct}%)</span>
          </div>
          <progress class="dash-grade-bar" max="100" value="${pct}">${pct}%</progress>
        </div>
      `;
    }).join('');
  }

  function exportApplicationsCSV() {
    if (applications.length === 0) {
      alert('No application records available to export.');
      return;
    }

    const headers = ['Tracking Code', 'Pupil Name', 'Grade Level', 'Parent Name', 'Phone', 'Email', 'Status', 'Date Submitted'];
    // SECURITY: neutralize CSV formula injection (=, +, -, @ prefixes) so a
    // crafted application can't execute as a formula when opened in Excel.
    const sanitizeCell = (v) => {
      const s = String(v == null ? '' : v);
      return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    };
    const rows = applications.map(a => [
      `"${sanitizeCell(a.tracking_code)}"`,
      `"${sanitizeCell(a.child_name)}"`,
      `"${sanitizeCell(a.grade)}"`,
      `"${sanitizeCell(a.parent_name)}"`,
      `"${sanitizeCell(a.phone)}"`,
      `"${sanitizeCell(a.email)}"`,
      `"${sanitizeCell(a.status)}"`,
      `"${new Date(a.created_at).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rpps_admissions_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 1. Render Applications Table
  const appsContainer = modal.querySelector('#dash-apps-container');
  const searchInput = modal.querySelector('#dash-app-search');
  const appFilterBtns = modal.querySelectorAll('#dash-app-filters .filter-btn');

  function renderApplications() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = applications.filter(app => {
      const matchesFilter = appFilter === 'all' || app.status === appFilter;
      const matchesSearch = !searchTerm || 
        app.child_name.toLowerCase().includes(searchTerm) ||
        app.parent_name.toLowerCase().includes(searchTerm) ||
        app.tracking_code.toLowerCase().includes(searchTerm);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      appsContainer.innerHTML = `<div class="dash-empty">No applications found matching criteria.</div>`;
      return;
    }

    appsContainer.innerHTML = filtered.map(app => `
      <div class="dash-item dash-item-stacked">
        <div class="dash-item-row">
          <div>
            <span class="dash-code">${escapeHtml(app.tracking_code)}</span>
            <strong class="dash-item-title dash-app-name">${escapeHtml(app.child_name)}</strong>
            <span class="dash-muted">(${escapeHtml(app.grade)})</span>
          </div>

          <div class="dash-item-actions">
            <select class="app-status-select dash-select" data-id="${app.id}" aria-label="Application status">
              <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Approved" ${app.status === 'Approved' ? 'selected' : ''}>Approved</option>
            </select>
            
            <button class="btn btn-outline btn-xs app-delete-btn" data-id="${app.id}">
              🗑️
            </button>
          </div>
        </div>

        <div class="dash-app-details">
          <div>👤 <strong>Parent:</strong> ${escapeHtml(app.parent_name)}</div>
          <div>📞 <strong>Phone:</strong> ${escapeHtml(app.phone)}</div>
          <div>✉️ <strong>Email:</strong> ${escapeHtml(app.email || 'N/A')}</div>
          <div>🕒 <strong>Date:</strong> ${new Date(app.created_at).toLocaleDateString()}</div>
        </div>

        ${app.notes ? `<div class="dash-note">📝 Notes: "${escapeHtml(app.notes)}"</div>` : ''}
      </div>
    `).join('');

    appsContainer.querySelectorAll('.app-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        const res = await updateApplicationStatus(id, newStatus);
        if (res.success) {
          const item = applications.find(a => a.id == id);
          if (item) item.status = newStatus;
          updateCounters();
          renderGradeAnalytics();
        } else {
          alert(res.error || 'Failed to update status.');
          renderApplications();
        }
      });
    });

    appsContainer.querySelectorAll('.app-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete this application record?')) {
          const res = await deleteApplication(id);
          if (res.success) {
            applications = applications.filter(a => a.id != id);
            updateCounters();
            renderGradeAnalytics();
            renderApplications();
          } else {
            alert(res.error || 'Failed to delete application.');
          }
        }
      });
    });
  }

  searchInput.addEventListener('input', renderApplications);
  appFilterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      appFilterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      appFilter = e.currentTarget.dataset.filter;
      renderApplications();
    });
  });

  // 2. Render News Management
  const newsContainer = modal.querySelector('#dash-news-container');
  const addNewsForm = modal.querySelector('#add-news-form');
  const showAddNewsBtn = modal.querySelector('#show-add-news-form-btn');
  const cancelAddNewsBtn = modal.querySelector('#cancel-add-news-btn');

  showAddNewsBtn.addEventListener('click', () => { addNewsForm.hidden = false; });
  cancelAddNewsBtn.addEventListener('click', () => { addNewsForm.hidden = true; });

  addNewsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = modal.querySelector('#news-input-title').value;
    const type = modal.querySelector('#news-input-type').value;
    const category = modal.querySelector('#news-input-category').value;
    const day = modal.querySelector('#news-input-day').value;
    const month = modal.querySelector('#news-input-month').value;
    const year = modal.querySelector('#news-input-year').value;
    const time = modal.querySelector('#news-input-time').value;
    const location = modal.querySelector('#news-input-location').value;
    const summary = modal.querySelector('#news-input-summary').value;
    const body = modal.querySelector('#news-input-body').value;

    const res = await createNewsItem({ title, type, category, day, month, year, time, location, summary, body });

    if (res.success) {
      alert('Article published successfully!');
      addNewsForm.reset();
      addNewsForm.hidden = true;
      const fetchRes = await fetchNewsAndEvents();
      if (fetchRes.success) newsList = fetchRes.newsAndEvents || [];
      renderNews();
    } else {
      alert(res.error || 'Failed to publish article.');
    }
  });

  function renderNews() {
    if (newsList.length === 0) {
      newsContainer.innerHTML = `<div class="dash-empty">No news articles published.</div>`;
      return;
    }

    newsContainer.innerHTML = newsList.map(item => `
      <div class="dash-item">
        <div>
          <div class="dash-item-meta">
            <span class="badge dash-badge">${escapeHtml(item.category)}</span>
            <span>${escapeHtml(item.date.day)} ${escapeHtml(item.date.month)} ${escapeHtml(item.date.year)}</span>
          </div>
          <strong class="dash-item-title">${escapeHtml(item.title)}</strong>
          <p class="dash-item-text">${escapeHtml(item.summary)}</p>
        </div>

        <button class="btn btn-outline btn-xs delete-news-btn" data-id="${item.id}">
          Delete 🗑️
        </button>
      </div>
    `).join('');

    newsContainer.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete this news article?')) {
          const res = await deleteNewsItem(id);
          if (res.success) {
            newsList = newsList.filter(n => n.id != id);
            renderNews();
          } else {
            alert(res.error || 'Failed to delete article.');
          }
        }
      });
    });
  }

  // 3. Render Subscribers Table
  const subContainer = modal.querySelector('#dash-subscribers-container');
  const copySubBtn = modal.querySelector('#copy-subscribers-btn');

  function renderSubscribers() {
    if (subscribers.length === 0) {
      subContainer.innerHTML = `<div class="dash-empty">No newsletter subscribers yet.</div>`;
      return;
    }

    subContainer.innerHTML = `
      <table class="dash-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Subscriber Email</th>
            <th>Subscribed Date</th>
          </tr>
        </thead>
        <tbody>
          ${subscribers.map((sub, idx) => `
            <tr>
              <td class="dash-muted">${idx + 1}</td>
              <td class="dash-table-strong">${escapeHtml(sub.email)}</td>
              <td class="dash-muted">${new Date(sub.subscribed_at).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 4. Render Accounts (staff see students; admins see everyone)
  const staffContainer = modal.querySelector('#dash-staff-container');

  function renderStaff() {
    const me = getStoredUser();
    const isAdmin = me && me.role === 'admin';
    if (staffUsers.length === 0) {
      staffContainer.innerHTML = `<div class="dash-empty">No accounts found.</div>`;
      return;
    }

    staffContainer.innerHTML = staffUsers.map(u => {
      const isSelf = me && me.id === u.id;
      const roleLabel = u.role === 'pending' ? `pending ${u.requested_role || 'staff'}` : u.role;
      const actions = isSelf ? `<span class="dash-muted">(you)</span>` : `
        ${u.role === 'pending' ? `<button class="btn btn-primary btn-xs staff-approve-btn" data-id="${u.id}">Approve</button>` : ''}
        ${u.role === 'student' ? `<button class="btn btn-outline btn-xs staff-temp-password-btn" data-id="${u.id}">Reset Password</button>` : ''}
        ${isAdmin && u.role === 'staff' ? `<button class="btn btn-outline btn-xs staff-role-btn" data-id="${u.id}" data-role="admin">Make Admin</button>` : ''}
        ${isAdmin && u.role === 'admin' ? `<button class="btn btn-outline btn-xs staff-role-btn" data-id="${u.id}" data-role="staff">Make Staff</button>` : ''}
        <button class="btn btn-outline btn-xs staff-delete-btn" data-id="${u.id}">
          ${u.role === 'pending' ? 'Reject' : 'Remove'}
        </button>`;
      return `
        <div class="dash-item">
          <div>
            <strong class="dash-item-title">${escapeHtml(u.name)}</strong>
            <span class="dash-role dash-role-${escapeHtml(u.role)}">${escapeHtml(roleLabel)}</span>
            <div class="dash-item-text">${escapeHtml([u.username ? `@${u.username}` : '', u.email || ''].filter(Boolean).join(' • '))}${u.class_level ? ` • ${escapeHtml(u.class_level)}` : ''} • joined ${new Date(u.created_at).toLocaleDateString()}</div>
          </div>
          <div class="dash-item-actions">${actions}</div>
        </div>
      `;
    }).join('');

    staffContainer.querySelectorAll('.staff-approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const res = await approveUser(id);
        if (!res.success) return alert(res.error || 'Failed to approve account.');
        const item = staffUsers.find(u => u.id == id);
        if (item) item.role = res.role;
        renderStaff();
      });
    });

    staffContainer.querySelectorAll('.staff-temp-password-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Give this pupil a new temporary password? Their current password will stop working.')) return;
        const res = await issueTemporaryPassword(id);
        if (!res.success) return alert(res.error || 'Failed to reset password.');
        prompt('Temporary password (give it to the pupil; they can sign in with it right away):', res.temporaryPassword);
      });
    });

    staffContainer.querySelectorAll('.staff-role-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const { id, role } = e.currentTarget.dataset;
        const res = await updateStaffRole(id, role);
        if (!res.success) return alert(res.error || 'Failed to update role.');
        const item = staffUsers.find(u => u.id == id);
        if (item) item.role = role;
        renderStaff();
      });
    });

    staffContainer.querySelectorAll('.staff-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Remove this account? The person will no longer be able to sign in.')) return;
        const res = await deleteStaffUser(id);
        if (!res.success) return alert(res.error || 'Failed to remove account.');
        staffUsers = staffUsers.filter(u => u.id != id);
        renderStaff();
      });
    });
  }

  copySubBtn.addEventListener('click', () => {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert('Subscriber email addresses copied to clipboard!');
  });

  // Auto load when modal opens
  const observer = new MutationObserver(() => {
    if (modal.classList.contains('active')) {
      loadAllData();
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  onCleanup(() => observer.disconnect());

  return modal;
}
