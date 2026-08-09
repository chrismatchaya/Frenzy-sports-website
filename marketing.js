// ApexSport OS - Marketing & PR Client Pipeline Module

const MarketingModule = {
  selectedCampaignId: null,

  init() {
    this.selectedCampaignId = window.db.getCampaigns()[0]?.id || null;
    this.bindEvents();
  },

  bindEvents() {
    // Listen for database changes
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-marketing').classList.contains('active')) {
        this.render();
      }
    });

    // Form Submission - Create Campaign
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-add-campaign') {
        e.preventDefault();
        
        const clientSelect = document.getElementById('new-camp-client');
        const title = document.getElementById('new-camp-title').value;
        const budget = parseFloat(document.getElementById('new-camp-budget').value) || 0;
        const desc = document.getElementById('new-camp-desc').value;
        const outletsText = document.getElementById('new-camp-outlets').value;
        const outlets = outletsText.split(',').map(item => item.trim()).filter(item => item.length > 0);

        const camp = {
          clientName: clientSelect.value,
          title: title,
          budget: budget,
          targetOutlets: outlets,
          status: 'Pitching',
          description: desc
        };

        const newCamp = window.db.addCampaign(camp);
        this.selectedCampaignId = newCamp.id;
        this.closeModal('modal-add-campaign');
        this.render();
      }

      // Form Submission - Send Press Release
      if (e.target && e.target.id === 'form-create-pr') {
        e.preventDefault();

        const title = document.getElementById('new-pr-title').value;
        const content = document.getElementById('new-pr-content').value;

        const pr = {
          campaignId: this.selectedCampaignId,
          title: title,
          content: content,
          pitchStatus: 'Sent'
        };

        window.db.addPressRelease(pr);
        e.target.reset();

        const camp = window.db.getCampaigns().find(c => c.id === this.selectedCampaignId);
        alert(`📰 Press Release Broadcasted!\n\nPitch sent to: ${camp.targetOutlets.join(', ')}\n\nCheck the campaign media logs below to manage media interest.`);
        this.render();
      }
    });

    // Delegated click listeners
    document.addEventListener('click', (e) => {
      // Select campaign
      const card = e.target.closest('.campaign-card-item');
      if (card) {
        this.selectedCampaignId = card.dataset.id;
        this.render();
      }

      // Open Add Campaign modal
      if (e.target && e.target.id === 'btn-open-add-campaign') {
        this.openModal('modal-add-campaign');
      }

      // Update PR status
      if (e.target && e.target.classList.contains('btn-pr-status')) {
        const prId = e.target.dataset.id;
        const nextStatus = e.target.dataset.status;
        window.db.updatePRStatus(prId, nextStatus);
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

  render() {
    const view = document.getElementById('view-marketing');
    if (!view) return;

    const campaigns = window.db.getCampaigns();
    const clients = window.db.getClients();

    view.innerHTML = `
      <div class="page-title-section">
        <h1 class="page-title">Marketing & PR Client Pipeline</h1>
        <p class="page-subtitle">Draft and distribute press releases, track active publicity campaigns, and catalog media pitches.</p>
      </div>

      <div class="marketing-grid">
        <!-- Campaigns List -->
        <div class="dashboard-panel">
          <div class="panel-header">
            <h3 class="panel-title">📢 Active PR Campaigns</h3>
            <button id="btn-open-add-campaign" class="btn-primary btn-sm">Create Campaign</button>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            ${campaigns.length === 0 ? `
              <div style="padding: 40px 0; text-align: center; color: var(--text-muted);">
                No active campaigns found. Click "Create Campaign" to pitch client stories.
              </div>
            ` : campaigns.map(c => `
              <div class="campaign-card-item ${this.selectedCampaignId === c.id ? 'selected' : ''}" data-id="${c.id}">
                <div class="campaign-card-header">
                  <div>
                    <span style="font-size: 0.75rem; color: var(--accent-purple); font-weight: 700; text-transform: uppercase;">${c.clientName}</span>
                    <div class="campaign-card-title">${c.title}</div>
                  </div>
                  <span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}">${c.status}</span>
                </div>
                <div class="campaign-card-desc">${c.description}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <div class="campaign-card-outlets">
                    ${c.targetOutlets.map(out => `<span class="outlet-tag">${out}</span>`).join('')}
                  </div>
                  <span class="campaign-card-budget">$${c.budget.toLocaleString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- PR Editor / Pitch History -->
        <div class="pr-editor-box" id="marketing-campaign-detail-container">
          <!-- Campaign Detail content renders here -->
        </div>
      </div>
    `;

    this.renderCampaignDetail();
  },

  renderCampaignDetail() {
    const container = document.getElementById('marketing-campaign-detail-container');
    if (!container) return;

    if (!this.selectedCampaignId) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 12px;">📰</div>
          <h3>No Campaign Selected</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); text-align: center; max-width: 280px; margin-top: 4px;">
            Select an active publicity campaign from the list to compose pitches or view analytics.
          </p>
        </div>
      `;
      return;
    }

    const campaign = window.db.getCampaigns().find(c => c.id === this.selectedCampaignId);
    if (!campaign) {
      this.selectedCampaignId = null;
      this.renderCampaignDetail();
      return;
    }

    // Get press releases under this campaign
    const releases = window.db.getPressReleases().filter(pr => pr.campaignId === campaign.id);

    container.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--accent-purple); font-weight: 700;">Client Campaign Manager</span>
        <h2 style="font-size: 1.5rem; margin-top: 2px;">${campaign.title}</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">${campaign.description}</p>
        
        <div style="display: flex; gap: 20px; font-size: 0.85rem; margin-top: 12px;">
          <span>Targeting: <strong>${campaign.targetOutlets.join(', ')}</strong></span>
          <span>Budget: <strong style="color: var(--accent-purple);">$${campaign.budget.toLocaleString()}</strong></span>
        </div>
      </div>

      <!-- Pitch Log History -->
      <div>
        <h4 style="font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Media Outbox & Log</h4>
        
        <div class="pr-history-list">
          ${releases.length === 0 ? `
            <div style="padding: 24px; text-align: center; border: 1px dashed var(--border-glass); border-radius: 8px; color: var(--text-muted); font-size: 0.85rem;">
              No press releases drafted for this campaign yet. Compose one below.
            </div>
          ` : releases.map(pr => {
            let statusClass = 'badge-warning';
            if (pr.pitchStatus === 'Responded') statusClass = 'badge-success';
            else if (pr.pitchStatus === 'Ignored') statusClass = 'badge-danger';

            return `
              <div class="pr-history-item">
                <div class="pr-history-header">
                  <span class="badge ${statusClass}">Pitch: ${pr.pitchStatus}</span>
                  <span style="color: var(--text-muted); font-family: monospace;">${pr.date}</span>
                </div>
                <div class="pr-history-title">${pr.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4; white-space: pre-line;">
                  ${pr.content.substring(0, 150)}${pr.content.length > 150 ? '...' : ''}
                </div>
                
                ${pr.pitchStatus === 'Sent' ? `
                  <div class="pr-history-actions">
                    <button class="btn-primary btn-sm btn-pr-status" data-id="${pr.id}" data-status="Responded" style="background: var(--gradient-green);">✔ Outlet Accepted</button>
                    <button class="btn-secondary btn-sm btn-pr-status" data-id="${pr.id}" data-status="Ignored">✘ No Response</button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Send PR Form -->
      <form id="form-create-pr" style="border-top: 1px solid var(--border-glass); padding-top: 20px; margin-top: 24px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 14px; color: var(--accent-purple);">Draft New Pitch</h4>
        
        <div class="form-group">
          <label>Press Release Title</label>
          <input type="text" class="form-control" id="new-pr-title" placeholder="e.g. Elena Rostova partners with sports technology brand" required>
        </div>

        <div class="form-group">
          <label>Body Content</label>
          <textarea class="form-control" id="new-pr-content" style="min-height: 110px;" placeholder="Draft full media release details here..." required></textarea>
        </div>

        <button type="submit" class="btn-primary btn-sm" style="width: 100%; background: var(--gradient-purple);">
          <span>Distribute & Pitch Media Outlets</span>
        </button>
      </form>
    `;
  }
};

window.MarketingModule = MarketingModule;
