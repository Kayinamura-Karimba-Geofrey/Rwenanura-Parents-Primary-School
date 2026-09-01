import { fetchApplications, updateApplicationStatus, deleteApplication } from '../data/api.js';

export function createAdminModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'admin-portal-modal';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 850px; width: 92%;">
      <button class="modal-close" aria-label="Close portal">&times;</button>
      
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 1rem;">
        <div>
          <div class="badge badge-gold" style="margin-bottom: 0.25rem;">Staff & Admissions Portal</div>
          <h3 style="font-size: 1.6rem; color: var(--navy);">Submitted Applications Dashboard</h3>
        </div>
        <button id="refresh-apps-btn" class="btn btn-outline" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;">
          🔄 Refresh Live Database
        </button>
      </div>

      <!-- Filters & Stats -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <div style="font-size: 0.9rem; color: var(--gray-600);">
          Total Applications in DB: <strong id="admin-total-count" style="color: var(--primary);">0</strong>
        </div>

        <div style="display: flex; gap: 0.5rem;" id="admin-status-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="Pending">Pending</button>
          <button class="filter-btn" data-filter="Approved">Approved</button>
          <button class="filter-btn" data-filter="Under Review">Under Review</button>
        </div>
      </div>

      <!-- Applications Table / Cards Container -->
      <div id="admin-apps-list" style="max-height: 450px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding-right: 0.25rem;">
        <div style="text-align: center; padding: 2rem; color: var(--gray-500);">Loading admissions records...</div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  const listEl = modal.querySelector('#admin-apps-list');
  const countEl = modal.querySelector('#admin-total-count');
  const refreshBtn = modal.querySelector('#refresh-apps-btn');
  const filterBtns = modal.querySelectorAll('#admin-status-filters .filter-btn');

  let currentFilter = 'all';
  let allApplications = [];

  async function loadApplications() {
    listEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);">Fetching records from SQLite database...</div>`;
    const res = await fetchApplications();

    if (res.success) {
      allApplications = res.applications || [];
      countEl.textContent = allApplications.length;
      renderList();
    } else {
      listEl.innerHTML = `<div style="text-align: center; color: #dc2626; padding: 1.5rem;">Failed to load applications from server.</div>`;
    }
  }

  function renderList() {
    const filtered = currentFilter === 'all' 
      ? allApplications 
      : allApplications.filter(a => a.status === currentFilter);

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);">No applications found for category: <strong>${currentFilter}</strong></div>`;
      return;
    }

    listEl.innerHTML = filtered.map(app => `
      <div style="background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="background: var(--navy); color: var(--gold); font-family: monospace; font-weight: 700; font-size: 0.8rem; padding: 0.15rem 0.5rem; border-radius: 4px;">${app.tracking_code}</span>
            <strong style="font-size: 1.05rem; margin-left: 0.5rem; color: var(--navy);">${app.child_name}</strong>
            <span style="font-size: 0.85rem; color: var(--gray-500);">(${app.grade})</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <select class="status-select" data-id="${app.id}" style="padding: 0.35rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-300); font-size: 0.82rem; background: white;">
              <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Approved" ${app.status === 'Approved' ? 'selected' : ''}>Approved</option>
            </select>
            
            <button class="delete-app-btn" data-id="${app.id}" title="Delete Application" style="color: #dc2626; border: 1px solid #fee2e2; background: #fef2f2; padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer;">
              🗑️
            </button>
          </div>
        </div>

        <div style="font-size: 0.88rem; color: var(--gray-600); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; background: var(--gray-100); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm);">
          <div>👤 <strong>Parent:</strong> ${app.parent_name}</div>
          <div>📞 <strong>Phone:</strong> ${app.phone}</div>
          <div>✉️ <strong>Email:</strong> ${app.email || 'N/A'}</div>
          <div>🕒 <strong>Submitted:</strong> ${new Date(app.created_at).toLocaleString()}</div>
        </div>

        ${app.notes ? `<div style="font-size: 0.82rem; color: var(--gray-600); font-style: italic;">📝 Note: "${app.notes}"</div>` : ''}
      </div>
    `).join('');

    // Attach Event Listeners to status selects & delete buttons
    listEl.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        const res = await updateApplicationStatus(id, newStatus);
        if (res.success) {
          const item = allApplications.find(a => a.id == id);
          if (item) item.status = newStatus;
        }
      });
    });

    listEl.querySelectorAll('.delete-app-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this admission record?')) {
          const res = await deleteApplication(id);
          if (res.success) {
            allApplications = allApplications.filter(a => a.id != id);
            countEl.textContent = allApplications.length;
            renderList();
          }
        }
      });
    });
  }

  refreshBtn.addEventListener('click', loadApplications);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderList();
    });
  });

  // Load when opened
  const observer = new MutationObserver(() => {
    if (modal.classList.contains('active')) {
      loadApplications();
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

  return modal;
}
