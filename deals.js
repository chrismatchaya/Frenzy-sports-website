// ApexSport OS - Sponsorship & Deal Tracker Module

const DealsModule = {
  activeDealId: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Listen for database changes
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-deals').classList.contains('active')) {
        this.render();
      }
    });

    // Form Submission - Create Opportunity
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-add-deal') {
        e.preventDefault();
        
        const brand = document.getElementById('new-deal-brand').value;
        const category = document.getElementById('new-deal-category').value;
        const value = parseFloat(document.getElementById('new-deal-value').value) || 0;
        const prob = parseInt(document.getElementById('new-deal-prob').value, 10) || 50;
        const contact = document.getElementById('new-deal-contact').value;
        const date = document.getElementById('new-deal-date').value;
        const stage = document.getElementById('new-deal-stage').value;
        const delivText = document.getElementById('new-deal-deliverables').value;
        const deliverables = delivText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        const deal = {
          brandName: brand,
          category: category,
          value: value,
          stage: stage,
          probability: prob,
          contactName: contact,
          deliverables: deliverables,
          closeDate: date
        };

        window.db.addDeal(deal);
        this.closeModal('modal-add-deal');
        this.render();
      }

      // Update Deal details (stage change in detail view)
      if (e.target && e.target.id === 'form-update-deal-stage') {
        e.preventDefault();
        const stageSelect = document.getElementById('edit-deal-stage');
        if (this.activeDealId) {
          window.db.updateDealStage(this.activeDealId, stageSelect.value);
          this.closeModal('modal-deal-details');
          this.render();
        }
      }
    });

    // Delegated click listeners
    document.addEventListener('click', (e) => {
      // Click on Kanban Card
      const card = e.target.closest('.kanban-card');
      if (card) {
        const dealId = card.dataset.id;
        this.openDealDetailsModal(dealId);
      }

      // Open Add Opportunity modal
      if (e.target && e.target.id === 'btn-open-add-deal') {
        this.openModal('modal-add-deal');
      }

      // Fast Kanban shifting
      if (e.target && e.target.classList.contains('btn-shift-stage')) {
        e.stopPropagation(); // Avoid triggering open detail modal
        const dealId = e.target.dataset.id;
        const nextStage = e.target.dataset.next;
        window.db.updateDealStage(dealId, nextStage);
        this.render();
      }
    });
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  },

  openDealDetailsModal(dealId) {
    const deal = window.db.getDeals().find(d => d.id === dealId);
    if (!deal) return;

    this.activeDealId = dealId;
    this.openModal('modal-deal-details');

    document.getElementById('edit-deal-brand').textContent = deal.brandName;
    document.getElementById('edit-deal-category').textContent = deal.category;
    document.getElementById('edit-deal-contact').textContent = deal.contactName || 'No contact specified';
    document.getElementById('edit-deal-value').textContent = `$${deal.value.toLocaleString()}`;
    document.getElementById('edit-deal-date').textContent = deal.closeDate;
    document.getElementById('edit-deal-stage').value = deal.stage;

    // Render deliverables bullet list
    const delivContainer = document.getElementById('edit-deal-deliverables-list');
    delivContainer.innerHTML = deal.deliverables.map(d => `<li>${d}</li>`).join('') || '<li>No specified deliverables</li>';
  },

  render() {
    const view = document.getElementById('view-deals');
    if (!view) return;

    const deals = window.db.getDeals();
    const stages = ['Lead', 'Proposal', 'Negotiating', 'Signed', 'Closed-Lost'];

    // Compute metrics
    const totalPipeline = deals.filter(d => d.stage !== 'Closed-Lost').reduce((sum, d) => sum + d.value, 0);
    const securedRevenue = deals.filter(d => d.stage === 'Signed').reduce((sum, d) => sum + d.value, 0);
    const weightedPotential = deals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

    view.innerHTML = `
      <div class="page-title-section" style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="page-title">Sponsorship & Deal Tracker</h1>
          <p class="page-subtitle">Track corporate sponsorships, brand partnerships, activations, and media rights pipeline.</p>
        </div>
        <div>
          <button id="btn-open-add-deal" class="btn-primary">
            <span>+ Add Opportunity</span>
          </button>
        </div>
      </div>

      <!-- Module Summary Metrics -->
      <div class="dashboard-metrics-grid">
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Secured Partnerships</span>
            <span class="metric-value" style="color: var(--accent-green);">$${securedRevenue.toLocaleString()}</span>
            <span class="metric-trend trend-up">▲ 100% Guaranteed</span>
          </div>
          <div class="metric-icon-box green">🤝</div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Active Pipeline Book</span>
            <span class="metric-value" style="color: var(--accent-cyan);">$${totalPipeline.toLocaleString()}</span>
            <span class="metric-trend trend-up">▲ Open Opportunities</span>
          </div>
          <div class="metric-icon-box">📊</div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Weighted Yield Projection</span>
            <span class="metric-value" style="color: var(--accent-purple);">$${Math.round(weightedPotential).toLocaleString()}</span>
            <span class="metric-trend">Adjusted by Close Probability</span>
          </div>
          <div class="metric-icon-box purple">💡</div>
        </div>
      </div>

      <!-- Split Layout: Kanban board on top, Analytics breakdown bottom -->
      <div class="dashboard-panel" style="margin-bottom: 24px;">
        <h3 class="panel-title">📋 Deal Funnel (Kanban)</h3>
        
        <div class="kanban-board-scroll">
          <div class="kanban-board">
            ${stages.map(stg => {
              const stageDeals = deals.filter(d => d.stage === stg);
              const totalVal = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return `
                <div class="kanban-column">
                  <div class="kanban-column-header">
                    <span>${stg}</span>
                    <span class="kanban-column-count">${stageDeals.length}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                    $${totalVal.toLocaleString()}
                  </div>
                  <div class="kanban-card-list">
                    ${stageDeals.map(d => {
                      let btnShift = '';
                      if (d.stage === 'Lead') btnShift = `<button class="btn-secondary btn-sm btn-shift-stage" data-id="${d.id}" data-next="Proposal" style="font-size: 0.65rem; padding: 2px 6px;">➡ Propose</button>`;
                      else if (d.stage === 'Proposal') btnShift = `<button class="btn-secondary btn-sm btn-shift-stage" data-id="${d.id}" data-next="Negotiating" style="font-size: 0.65rem; padding: 2px 6px;">➡ Negotiate</button>`;
                      else if (d.stage === 'Negotiating') btnShift = `<button class="btn-primary btn-sm btn-shift-stage" data-id="${d.id}" data-next="Signed" style="font-size: 0.65rem; padding: 2px 6px; background: var(--gradient-green);">➡ Sign</button>`;
                      
                      return `
                        <div class="kanban-card" data-id="${d.id}">
                          <div class="kanban-card-brand">${d.brandName}</div>
                          <div class="kanban-card-category">${d.category}</div>
                          <div class="kanban-card-footer">
                            <span class="kanban-card-value">$${d.value.toLocaleString()}</span>
                            <span class="kanban-card-probability">${d.probability}%</span>
                          </div>
                          ${btnShift ? `<div style="text-align: right; margin-top: 8px;">${btnShift}</div>` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="detail-columns">
        <div class="dashboard-panel">
          <h3 class="panel-title">🍩 Pipeline Share by Category</h3>
          <div id="deals-category-donut" style="display: flex; gap: 24px; align-items: center; justify-content: center; min-height: 220px; padding: 10px;">
            <!-- Category Donut renders here -->
          </div>
        </div>

        <div class="dashboard-panel">
          <h3 class="panel-title">📉 High Value Opportunities</h3>
          <div id="deals-top-list" style="min-height: 220px;">
            <!-- Top deals rendered here -->
          </div>
        </div>
      </div>
    `;

    this.renderCharts();
  },

  renderCharts() {
    const deals = window.db.getDeals().filter(d => d.stage !== 'Closed-Lost');
    
    // Group deals by category
    const catMap = {};
    deals.forEach(d => {
      catMap[d.category] = (catMap[d.category] || 0) + d.value;
    });
    const donutData = Object.keys(catMap).map(k => ({ label: k, value: catMap[k] }));

    window.Charts.renderDonutChart('deals-category-donut', donutData);

    // Render list of high value deals
    const sortedDeals = [...deals].sort((a,b) => b.value - a.value).slice(0, 4);
    const progressData = sortedDeals.map(d => ({
      label: d.brandName,
      value: d.value,
      displayVal: `$${d.value.toLocaleString()} (${d.stage})`
    }));

    window.Charts.renderHorizontalProgressList('deals-top-list', progressData, 'var(--accent-cyan)');
  }
};

window.DealsModule = DealsModule;
