import { 
  fetchApplications, 
  updateApplicationStatus, 
  deleteApplication,
  fetchSubscribers,
  fetchNewsAndEvents,
  createNewsItem,
  deleteNewsItem,
  clearAuthSession,
  getStoredUser
} from '../data/api.js';

export function createAdminDashboard(onLogout) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'admin-dashboard-modal';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 980px; width: 94%; max-height: 90vh; display: flex; flex-direction: column;">
      
      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--gray-200); padding-bottom: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="logo-crest" style="width: 40px; height: 40px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.4rem; color: var(--navy); margin-bottom: 0.15rem;">School Management Console</h3>
            <p style="font-size: 0.82rem; color: var(--gray-600);">
              User: <strong id="dash-user-name">Admin</strong> (<span id="dash-user-email">admin@rwenanura.ac.rw</span>)
              <span id="dash-user-role" class="badge badge-gold" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; margin-left: 0.35rem;">ADMIN</span>
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button id="dash-refresh-btn" class="btn btn-outline" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">🔄 Sync Data</button>
          <button id="dash-logout-btn" class="btn btn-gold" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">Logout 🚪</button>
          <button class="modal-close" style="position: static; font-size: 1.5rem;" aria-label="Close modal">&times;</button>
        </div>
      </div>

      <!-- Quick Stats Counter Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
        <div style="background: var(--gray-100); padding: 0.85rem; border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
          <div style="font-size: 0.75rem; color: var(--gray-600); text-transform: uppercase; font-weight: 600;">Total Admissions</div>
          <div id="stat-total-apps" style="font-size: 1.5rem; font-weight: 800; color: var(--navy);">0</div>
        </div>

        <div style="background: var(--gray-100); padding: 0.85rem; border-radius: var(--radius-sm); border-left: 4px solid #d97706;">
          <div style="font-size: 0.75rem; color: var(--gray-600); text-transform: uppercase; font-weight: 600;">Pending Review</div>
          <div id="stat-pending-apps" style="font-size: 1.5rem; font-weight: 800; color: #d97706;">0</div>
        </div>

        <div style="background: var(--gray-100); padding: 0.85rem; border-radius: var(--radius-sm); border-left: 4px solid var(--primary-light);">
          <div style="font-size: 0.75rem; color: var(--gray-600); text-transform: uppercase; font-weight: 600;">Approved</div>
          <div id="stat-approved-apps" style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">0</div>
        </div>

        <div style="background: var(--gray-100); padding: 0.85rem; border-radius: var(--radius-sm); border-left: 4px solid var(--gold);">
          <div style="font-size: 0.75rem; color: var(--gray-600); text-transform: uppercase; font-weight: 600;">Subscribers</div>
          <div id="stat-subscribers" style="font-size: 1.5rem; font-weight: 800; color: var(--navy);">0</div>
        </div>
      </div>

      <!-- Grade Analytics Breakdown -->
      <div style="background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="font-size: 0.88rem; color: var(--navy);">📊 Applicant Distribution by Grade Level</strong>
          <span style="font-size: 0.75rem; color: var(--gray-500);">Live Class Enrollment Analytics</span>
        </div>
        <div id="grade-analytics-bars" style="display: flex; gap: 0.85rem; flex-wrap: wrap; font-size: 0.8rem;"></div>
      </div>

      <!-- Main Navigation Tabs -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--gray-300); margin-bottom: 1rem;">
        <button class="dash-tab active" data-tab="admissions" style="padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.9rem; border: none; background: none; border-bottom: 3px solid var(--primary); color: var(--primary); cursor: pointer;">
          📝 Admissions Applications
        </button>
        <button class="dash-tab" data-tab="news" style="padding: 0.6rem 1.25rem; font-weight: 600; font-size: 0.9rem; border: none; background: none; border-bottom: 3px solid transparent; color: var(--gray-600); cursor: pointer;">
          📢 News & Announcements
        </button>
        <button class="dash-tab" data-tab="newsletter" style="padding: 0.6rem 1.25rem; font-weight: 600; font-size: 0.9rem; border: none; background: none; border-bottom: 3px solid transparent; color: var(--gray-600); cursor: pointer;">
          📧 Newsletter Mailing List
        </button>
      </div>

      <!-- Tab Content Area -->
      <div style="flex: 1; overflow-y: auto; padding-right: 0.25rem;">
        
        <!-- 1. ADMISSIONS TAB -->
        <div id="tab-content-admissions">
          <div style="display: flex; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center;">
            <input type="text" id="dash-app-search" placeholder="🔍 Search by pupil name, parent, or code..." style="padding: 0.5rem 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem; flex: 1; min-width: 200px;" />
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <div style="display: flex; gap: 0.35rem;" id="dash-app-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="Pending">Pending</button>
                <button class="filter-btn" data-filter="Under Review">Under Review</button>
                <button class="filter-btn" data-filter="Approved">Approved</button>
              </div>
              
              <button id="export-csv-btn" class="btn btn-outline" style="padding: 0.45rem 0.85rem; font-size: 0.82rem; background: var(--primary-subtle); border-color: var(--primary); color: var(--primary);">
                📥 Export CSV
              </button>
            </div>
          </div>

          <div id="dash-apps-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 2rem; color: var(--gray-500);">Loading admissions...</div>
          </div>
        </div>

        <!-- 2. NEWS MANAGEMENT TAB -->
        <div id="tab-content-news" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; background: var(--gray-100); padding: 0.85rem; border-radius: var(--radius-sm);">
            <div>
              <strong style="color: var(--navy); font-size: 1rem;">Publish New School Article / Calendar Event</strong>
              <p style="font-size: 0.82rem; color: var(--gray-600); margin: 0;">Add news or events to be rendered live on the public landing page.</p>
            </div>
            <button id="show-add-news-form-btn" class="btn btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.85rem;">
              + Create Article
            </button>
          </div>

          <!-- Add News Form Modal/Box -->
          <form id="add-news-form" style="display: none; background: white; border: 1px solid var(--gray-300); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm);">
            <h4 style="font-size: 1.1rem; color: var(--navy); margin-bottom: 1rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.5rem;">New News / Event Form</h4>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.85rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Article Title *</label>
                <input type="text" id="news-input-title" required placeholder="e.g. Primary 6 Graduation Ceremony" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Type</label>
                <select id="news-input-type" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem; background: white;">
                  <option value="news">News Article</option>
                  <option value="event">School Event</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Category *</label>
                <input type="text" id="news-input-category" required placeholder="Academic / Sports" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1.5fr; gap: 0.75rem; margin-bottom: 0.85rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Day (DD)</label>
                <input type="text" id="news-input-day" required placeholder="15" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Month (MMM)</label>
                <input type="text" id="news-input-month" required placeholder="OCT" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Year</label>
                <input type="text" id="news-input-year" required value="${new Date().getFullYear()}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Time</label>
                <input type="text" id="news-input-time" placeholder="09:00 AM - 01:00 PM" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
              </div>
            </div>

            <div style="margin-bottom: 0.85rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Location</label>
              <input type="text" id="news-input-location" placeholder="e.g. School Main Auditorium" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem;" />
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--navy);">Summary Description *</label>
              <textarea id="news-input-summary" required rows="2" placeholder="Brief summary of the announcement..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.88rem; font-family: inherit;"></textarea>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" id="cancel-add-news-btn" class="btn btn-outline" style="padding: 0.4rem 0.85rem;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem;">Publish to Live Site</button>
            </div>
          </form>

          <div id="dash-news-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 2rem; color: var(--gray-500);">Loading articles...</div>
          </div>
        </div>

        <!-- 3. SUBSCRIBERS TAB -->
        <div id="tab-content-newsletter" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="font-size: 0.9rem; color: var(--gray-600);">
              Registered Subscribers: <strong id="dash-subscribers-count" style="color: var(--primary);">0</strong>
            </div>
            <button id="copy-subscribers-btn" class="btn btn-outline" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;">
              📋 Copy Email List
            </button>
          </div>

          <div id="dash-subscribers-container">
            <div style="text-align: center; padding: 2rem; color: var(--gray-500);">Loading subscribers list...</div>
          </div>
        </div>

      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  const logoutBtn = modal.querySelector('#dash-logout-btn');
  logoutBtn.addEventListener('click', () => {
    clearAuthSession();
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
    newsletter: modal.querySelector('#tab-content-newsletter')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.borderBottom = '3px solid transparent';
        t.style.color = 'var(--gray-600)';
      });
      const selected = e.target.dataset.tab;
      e.target.classList.add('active');
      e.target.style.borderBottom = '3px solid var(--primary)';
      e.target.style.color = 'var(--primary)';

      Object.keys(tabContents).forEach(key => {
        tabContents[key].style.display = key === selected ? 'block' : 'none';
      });
    });
  });

  // Global State Data
  let applications = [];
  let subscribers = [];
  let newsList = [];
  let appFilter = 'all';

  async function loadAllData() {
    const user = getStoredUser();
    if (user) {
      modal.querySelector('#dash-user-name').textContent = user.name || 'Staff';
      modal.querySelector('#dash-user-email').textContent = user.email || '';
      modal.querySelector('#dash-user-role').textContent = (user.role || 'staff').toUpperCase();
    }

    const [appRes, subRes, newsRes] = await Promise.all([
      fetchApplications(),
      fetchSubscribers(),
      fetchNewsAndEvents()
    ]);

    if (appRes.success) applications = appRes.applications || [];
    if (subRes.success) subscribers = subRes.subscribers || [];
    if (newsRes.success) newsList = newsRes.newsAndEvents || [];

    updateCounters();
    renderGradeAnalytics();
    renderApplications();
    renderNews();
    renderSubscribers();
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
      container.innerHTML = `<span style="color: var(--gray-500);">No application grade metrics recorded yet.</span>`;
      return;
    }

    container.innerHTML = sortedGrades.map(grade => {
      const count = gradeCounts[grade];
      const pct = Math.round((count / total) * 100);
      return `
        <div style="flex: 1; min-width: 110px; background: var(--gray-50); border: 1px solid var(--gray-200); padding: 0.5rem; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.25rem;">
            <span>${grade}</span>
            <span style="color: var(--primary);">${count} (${pct}%)</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: var(--primary);"></div>
          </div>
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
    const rows = applications.map(a => [
      `"${a.tracking_code || ''}"`,
      `"${a.child_name || ''}"`,
      `"${a.grade || ''}"`,
      `"${a.parent_name || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.email || ''}"`,
      `"${a.status || ''}"`,
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
      appsContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);">No applications found matching criteria.</div>`;
      return;
    }

    appsContainer.innerHTML = filtered.map(app => `
      <div style="background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="background: var(--navy); color: var(--gold); font-family: monospace; font-weight: 700; font-size: 0.78rem; padding: 0.15rem 0.45rem; border-radius: 3px;">${app.tracking_code}</span>
            <strong style="font-size: 1rem; margin-left: 0.5rem; color: var(--navy);">${app.child_name}</strong>
            <span style="font-size: 0.82rem; color: var(--gray-500);">(${app.grade})</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <select class="app-status-select" data-id="${app.id}" style="padding: 0.3rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-300); font-size: 0.8rem; background: white;">
              <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Approved" ${app.status === 'Approved' ? 'selected' : ''}>Approved</option>
            </select>
            
            <button class="app-delete-btn" data-id="${app.id}" style="color: #dc2626; border: 1px solid #fee2e2; background: #fef2f2; padding: 0.3rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.78rem; cursor: pointer;">
              🗑️
            </button>
          </div>
        </div>

        <div style="font-size: 0.82rem; color: var(--gray-600); display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.4rem; background: var(--gray-100); padding: 0.5rem 0.75rem; border-radius: 4px;">
          <div>👤 <strong>Parent:</strong> ${app.parent_name}</div>
          <div>📞 <strong>Phone:</strong> ${app.phone}</div>
          <div>✉️ <strong>Email:</strong> ${app.email || 'N/A'}</div>
          <div>🕒 <strong>Date:</strong> ${new Date(app.created_at).toLocaleDateString()}</div>
        </div>

        ${app.notes ? `<div style="font-size: 0.8rem; color: var(--gray-600); font-style: italic;">📝 Notes: "${app.notes}"</div>` : ''}
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
          }
        }
      });
    });
  }

  searchInput.addEventListener('input', renderApplications);
  appFilterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      appFilterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      appFilter = e.target.dataset.filter;
      renderApplications();
    });
  });

  // 2. Render News Management
  const newsContainer = modal.querySelector('#dash-news-container');
  const addNewsForm = modal.querySelector('#add-news-form');
  const showAddNewsBtn = modal.querySelector('#show-add-news-form-btn');
  const cancelAddNewsBtn = modal.querySelector('#cancel-add-news-btn');

  showAddNewsBtn.addEventListener('click', () => { addNewsForm.style.display = 'block'; });
  cancelAddNewsBtn.addEventListener('click', () => { addNewsForm.style.display = 'none'; });

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

    const res = await createNewsItem({ title, type, category, day, month, year, time, location, summary });

    if (res.success) {
      alert('Article published successfully!');
      addNewsForm.reset();
      addNewsForm.style.display = 'none';
      const fetchRes = await fetchNewsAndEvents();
      if (fetchRes.success) newsList = fetchRes.newsAndEvents || [];
      renderNews();
    } else {
      alert(res.error || 'Failed to publish article.');
    }
  });

  function renderNews() {
    if (newsList.length === 0) {
      newsContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);">No news articles published.</div>`;
      return;
    }

    newsContainer.innerHTML = newsList.map(item => `
      <div style="background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">${item.category}</span>
            <span style="font-size: 0.78rem; color: var(--gray-500);">${item.date.day} ${item.date.month} ${item.date.year}</span>
          </div>
          <strong style="color: var(--navy); font-size: 0.95rem;">${item.title}</strong>
          <p style="font-size: 0.82rem; color: var(--gray-600); margin: 0.2rem 0 0 0;">${item.summary}</p>
        </div>

        <button class="delete-news-btn" data-id="${item.id}" style="color: #dc2626; border: 1px solid #fee2e2; background: #fef2f2; padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer;">
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
      subContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);">No newsletter subscribers yet.</div>`;
      return;
    }

    subContainer.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
        <thead>
          <tr style="background: var(--navy); color: white; text-align: left;">
            <th style="padding: 0.6rem 0.85rem; border-top-left-radius: 4px;">#</th>
            <th style="padding: 0.6rem 0.85rem;">Subscriber Email</th>
            <th style="padding: 0.6rem 0.85rem; border-top-right-radius: 4px;">Subscribed Date</th>
          </tr>
        </thead>
        <tbody>
          ${subscribers.map((sub, idx) => `
            <tr style="border-bottom: 1px solid var(--gray-200);">
              <td style="padding: 0.6rem 0.85rem; color: var(--gray-500);">${idx + 1}</td>
              <td style="padding: 0.6rem 0.85rem; font-weight: 600; color: var(--navy);">${sub.email}</td>
              <td style="padding: 0.6rem 0.85rem; color: var(--gray-500);">${new Date(sub.subscribed_at).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
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

  return modal;
}
