import { t } from '../data/i18n.js';

export function createTuitionEstimator(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section section-tinted';
  section.id = 'tuition-calculator';

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
          <h3 class="calc-heading">${t('calc_select_options')}</h3>

          <div class="calc-group">
            <label class="form-label" for="fee-grade-select">${t('calc_label_grade')}</label>
            <select class="form-input calc-select" id="fee-grade-select">
              <option value="nursery" data-tuition="75000">${t('calc_opt_nursery')}</option>
              <option value="lower_primary" data-tuition="95000" selected>${t('calc_opt_lower')}</option>
              <option value="upper_primary" data-tuition="110000">${t('calc_opt_upper')}</option>
            </select>
          </div>

          <fieldset class="calc-group">
            <legend class="form-label">${t('calc_label_services')}</legend>
            <div class="calc-options">
              <label class="calc-option">
                <input type="checkbox" id="fee-opt-lunch" value="18000" checked />
                <span>${t('calc_lunch_label')}</span>
              </label>
              <label class="calc-option">
                <input type="checkbox" id="fee-opt-transport" value="25000" />
                <span>${t('calc_transport_label')}</span>
              </label>
              <label class="calc-option">
                <input type="checkbox" id="fee-opt-uniform" value="20000" checked />
                <span>${t('calc_uniform_label')}</span>
              </label>
            </div>
          </fieldset>

          <div class="calc-note">
            ${t('calc_note')}
          </div>
        </div>

        <!-- Right Summary Card -->
        <div class="tuition-calc-right">
          <div>
            <h3 class="calc-summary-title">${t('calc_summary_title')}</h3>

            <div class="calc-rows">
              <div class="calc-row">
                <span>${t('calc_tuition_row')}</span>
                <strong id="summary-tuition">95,000 RWF</strong>
              </div>
              <div class="calc-row">
                <span>${t('calc_meal_row')}</span>
                <strong id="summary-lunch">18,000 RWF</strong>
              </div>
              <div class="calc-row">
                <span>${t('calc_transport_row')}</span>
                <strong id="summary-transport">0 RWF</strong>
              </div>
              <div class="calc-row">
                <span>${t('calc_uniform_row')}</span>
                <strong id="summary-uniform">20,000 RWF</strong>
              </div>
            </div>

            <div class="calc-total">
              <div class="calc-total-label">${t('calc_total_investment')}</div>
              <div id="summary-total" class="calc-total-value" aria-live="polite">133,000 RWF</div>
            </div>
          </div>

          <button id="estimator-apply-btn" class="btn btn-primary btn-block calc-apply">
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
