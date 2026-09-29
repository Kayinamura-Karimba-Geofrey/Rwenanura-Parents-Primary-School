import { t } from '../data/i18n.js';

export function createTuitionEstimator(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'tuition-calculator';
  section.style.backgroundColor = 'var(--primary-subtle)';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge badge-gold">${t('calc_badge')}</div>
        <h2 class="section-title">${t('calc_title')}</h2>
        <p class="section-subtitle">${t('calc_subtitle')}</p>
      </div>

      <div class="tuition-calculator-grid">
        
        <!-- Left Selection Controls -->
        <div class="tuition-calc-left">
          <h3 style="font-size: 1.25rem; color: var(--navy); margin-bottom: 1.25rem;">${t('calc_select_options')}</h3>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; font-size: 0.9rem;">${t('calc_label_grade')}</label>
            <select id="fee-grade-select" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.95rem; background: white; font-weight: 600; color: var(--navy);">
              <option value="nursery" data-tuition="75000">${t('calc_opt_nursery')}</option>
              <option value="lower_primary" data-tuition="95000" selected>${t('calc_opt_lower')}</option>
              <option value="upper_primary" data-tuition="110000">${t('calc_opt_upper')}</option>
            </select>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; font-size: 0.9rem;">${t('calc_label_services')}</label>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-lunch" value="18000" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>${t('calc_lunch_label')}</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-transport" value="25000" style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>${t('calc_transport_label')}</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-uniform" value="20000" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>${t('calc_uniform_label')}</span>
              </label>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--gray-600); background: var(--gray-100); padding: 0.75rem; border-radius: var(--radius-sm);">
            ${t('calc_note')}
          </div>
        </div>

        <!-- Right Summary Card -->
        <div class="tuition-calc-right">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--gold-light); margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.75rem;">${t('calc_summary_title')}</h3>

            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">${t('calc_tuition_row')}</span>
                <strong id="summary-tuition">95,000 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">${t('calc_meal_row')}</span>
                <strong id="summary-lunch">18,000 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">${t('calc_transport_row')}</span>
                <strong id="summary-transport">0 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">${t('calc_uniform_row')}</span>
                <strong id="summary-uniform">20,000 RWF</strong>
              </div>
            </div>

            <div style="border-top: 2px dashed rgba(255,255,255,0.2); padding-top: 1.25rem; margin-top: 1rem;">
              <div style="font-size: 0.85rem; color: var(--gray-300); text-transform: uppercase;">${t('calc_total_investment')}</div>
              <div id="summary-total" style="font-size: 2.2rem; font-weight: 800; color: var(--gold-light);">133,000 RWF</div>
            </div>
          </div>

          <button id="estimator-apply-btn" class="btn btn-gold" style="width: 100%; margin-top: 1.5rem;">
            ${t('calc_btn_apply')}
          </button>
        </div>

      </div>
    </div>
  `;

  // Calculator Logic
  const gradeSelect = section.querySelector('#fee-grade-select');
  const optLunch = section.querySelector('#fee-opt-lunch');
  const optTransport = section.querySelector('#fee-opt-transport');
  const optUniform = section.querySelector('#fee-opt-uniform');

  const summaryTuition = section.querySelector('#summary-tuition');
  const summaryLunch = section.querySelector('#summary-lunch');
  const summaryTransport = section.querySelector('#summary-transport');
  const summaryUniform = section.querySelector('#summary-uniform');
  const summaryTotal = section.querySelector('#summary-total');

  function calculateTotal() {
    const selectedOption = gradeSelect.options[gradeSelect.selectedIndex];
    const tuition = parseInt(selectedOption.dataset.tuition, 10);
    const lunch = optLunch.checked ? parseInt(optLunch.value, 10) : 0;
    const transport = optTransport.checked ? parseInt(optTransport.value, 10) : 0;
    const uniform = optUniform.checked ? parseInt(optUniform.value, 10) : 0;

    const total = tuition + lunch + transport + uniform;

    summaryTuition.textContent = `${tuition.toLocaleString()} RWF`;
    summaryLunch.textContent = `${lunch.toLocaleString()} RWF`;
    summaryTransport.textContent = `${transport.toLocaleString()} RWF`;
    summaryUniform.textContent = `${uniform.toLocaleString()} RWF`;
    summaryTotal.textContent = `${total.toLocaleString()} RWF`;
  }

  gradeSelect.addEventListener('change', calculateTotal);
  optLunch.addEventListener('change', calculateTotal);
  optTransport.addEventListener('change', calculateTotal);
  optUniform.addEventListener('change', calculateTotal);

  const applyBtn = section.querySelector('#estimator-apply-btn');
  if (onOpenApplyModal) applyBtn.addEventListener('click', onOpenApplyModal);

  return section;
}
