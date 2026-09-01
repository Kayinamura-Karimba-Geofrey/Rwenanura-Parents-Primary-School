export function createTuitionEstimator(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'tuition-calculator';
  section.style.backgroundColor = 'var(--primary-subtle)';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <div class="badge badge-gold">Transparent Fee Structure</div>
        <h2 class="section-title">Interactive Tuition Estimator</h2>
        <p class="section-subtitle">Calculate termly fees and optional services for your child at Rwenanura Parents Primary School.</p>
      </div>

      <div style="max-width: 900px; margin: 0 auto; background: white; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-md); overflow: hidden; display: grid; grid-template-columns: 1.2fr 1fr;">
        
        <!-- Left Selection Controls -->
        <div style="padding: 2.25rem;">
          <h3 style="font-size: 1.25rem; color: var(--navy); margin-bottom: 1.25rem;">Select Options</h3>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; font-size: 0.9rem;">Grade Level *</label>
            <select id="fee-grade-select" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.95rem; background: white; font-weight: 600; color: var(--navy);">
              <option value="nursery" data-tuition="75000">Nursery School (Baby, Middle, Top Class) - 75,000 RWF</option>
              <option value="lower_primary" data-tuition="95000" selected>Lower Primary (Primary 1, Primary 2, Primary 3) - 95,000 RWF</option>
              <option value="upper_primary" data-tuition="110000">Upper Primary (Primary 4, Primary 5, Primary 6) - 110,000 RWF</option>
            </select>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; font-size: 0.9rem;">Optional Services & Facilities</label>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-lunch" value="18000" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>Balanced Daily Lunch & Tea Program (+18,000 RWF/term)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-transport" value="25000" style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>School Bus Transportation (Nyagatare Route) (+25,000 RWF/term)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="fee-opt-uniform" value="20000" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
                <span>Complete Uniform Package (2 Shirts, Sweater, Sportswear) (+20,000 RWF initial)</span>
              </label>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--gray-600); background: var(--gray-100); padding: 0.75rem; border-radius: var(--radius-sm);">
            💡 <em>Note: Tuition fees include full access to computer labs, library books, and sports facilities.</em>
          </div>
        </div>

        <!-- Right Summary Card -->
        <div style="background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%); color: white; padding: 2.25rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--gold-light); margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.75rem;">Estimated Summary</h3>

            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">Tuition Fee:</span>
                <strong id="summary-tuition">95,000 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">Meal Plan:</span>
                <strong id="summary-lunch">18,000 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">Transport:</span>
                <strong id="summary-transport">0 RWF</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-300);">Uniform Set:</span>
                <strong id="summary-uniform">20,000 RWF</strong>
              </div>
            </div>

            <div style="border-top: 2px dashed rgba(255,255,255,0.2); padding-top: 1.25rem; margin-top: 1rem;">
              <div style="font-size: 0.85rem; color: var(--gray-300); text-transform: uppercase;">Total Term 1 Investment</div>
              <div id="summary-total" style="font-size: 2.2rem; font-weight: 800; color: var(--gold-light);">133,000 RWF</div>
            </div>
          </div>

          <button id="estimator-apply-btn" class="btn btn-gold" style="width: 100%; margin-top: 1.5rem;">
            Submit Application Now 🚀
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
