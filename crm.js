// ApexSport OS - Sports Agency CRM Module

const CRMModule = {
  selectedClientId: null,

  init() {
    this.selectedClientId = window.db.getClients()[0]?.id || null;
    this.bindEvents();
  },

  bindEvents() {
    // Event listener for global database updates
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-crm').classList.contains('active')) {
        this.render();
      }
    });

    // Form submission - Add Client
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-add-client') {
        e.preventDefault();
        const client = {
          name: document.getElementById('new-client-name').value,
          sport: document.getElementById('new-client-sport').value,
          position: document.getElementById('new-client-position').value,
          team: document.getElementById('new-client-team').value,
          email: document.getElementById('new-client-email').value,
          phone: document.getElementById('new-client-phone').value,
          agent: document.getElementById('new-client-agent').value,
          bio: document.getElementById('new-client-bio').value,
          avatar: document.getElementById('new-client-avatar').value || '👤'
        };
        const newClient = window.db.addClient(client);
        this.selectedClientId = newClient.id;
        this.closeModal('modal-add-client');
        this.render();
      }

      // Form submission - Add Contract
      if (e.target && e.target.id === 'form-add-contract') {
        e.preventDefault();
        const contract = {
          clientId: this.selectedClientId,
          clientName: window.db.getClients().find(c => c.id === this.selectedClientId)?.name || 'Client',
          title: document.getElementById('new-con-title').value,
          type: document.getElementById('new-con-type').value,
          partner: document.getElementById('new-con-partner').value,
          value: parseFloat(document.getElementById('new-con-value').value) || 0,
          commissionRate: parseFloat(document.getElementById('new-con-commission').value) || 10,
          startDate: document.getElementById('new-con-start').value,
          endDate: document.getElementById('new-con-end').value,
          status: document.getElementById('new-con-status').value
        };
        window.db.addContract(contract);
        this.closeModal('modal-add-contract');
        this.render();
      }

      // Form submission - Log Conversation
      if (e.target && e.target.id === 'form-add-log') {
        e.preventDefault();
        const log = {
          clientId: this.selectedClientId,
          date: document.getElementById('log-date').value || new Date().toISOString().split('T')[0],
          type: document.getElementById('log-type').value,
          summary: document.getElementById('log-summary').value,
          notes: document.getElementById('log-notes').value,
          agent: document.getElementById('log-agent').value || 'System Agent'
        };
        window.db.addConversation(log);
        e.target.reset();
        this.render();
      }
    });

    // Delegated click listeners
    document.addEventListener('click', (e) => {
      // Client selection
      const clientItem = e.target.closest('.client-list-item');
      if (clientItem) {
        this.selectedClientId = clientItem.dataset.id;
        this.render();
      }

      // Open Add Client modal
      if (e.target && e.target.id === 'btn-open-add-client') {
        this.openModal('modal-add-client');
      }

      // Open Add Contract modal
      if (e.target && e.target.id === 'btn-open-add-contract') {
        this.openModal('modal-add-contract');
      }

      // Print/Preview Contract Detail
      if (e.target && e.target.classList.contains('btn-preview-contract')) {
        const contractId = e.target.dataset.id;
        this.previewContract(contractId);
      }
    });

    // Client search
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'crm-search-input') {
        this.renderClientList(e.target.value);
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

  previewContract(contractId) {
    const contract = window.db.getContracts().find(c => c.id === contractId);
    if (!contract) return;

    const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(contract.value);
    const commVal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(contract.value * (contract.commissionRate / 100));

    alert(`
--------------------------------------------------
          FRENZY SPORTS AGENCY - AGREEMENT SHEET     
--------------------------------------------------
Contract ID:   ${contract.id}
Client:        ${contract.clientName}
Partner:       ${contract.partner}
Title:         ${contract.title}
Agreement Type: ${contract.type}

Total Financial Value: ${formattedValue}
Agency Commission:    ${contract.commissionRate}% (${commVal})
Term Duration:        ${contract.startDate} to ${contract.endDate}
Status of Terms:      ${contract.status}
--------------------------------------------------
Generated in Sandboxed Client Environment.
This document summarizes legally binding terms negotiated.
    `);
  },

  render() {
    const view = document.getElementById('view-crm');
    if (!view) return;

    view.innerHTML = `
      <div class="page-title-section">
        <h1 class="page-title">Sports Agency CRM</h1>
        <p class="page-subtitle">Manage elite client relations, contract values, and conversation timelines.</p>
      </div>

      <div class="crm-layout">
        <!-- Client Search Sidebar -->
        <div class="crm-sidebar-list">
          <div class="list-search-wrapper">
            <div class="form-group" style="margin-bottom: 0;">
              <input type="text" id="crm-search-input" class="form-control" placeholder="Search athletes/coaches...">
            </div>
            <button id="btn-open-add-client" class="btn-primary btn-sm mt-4" style="width: 100%;">
              <span>+ Add New Client</span>
            </button>
          </div>
          <div class="list-scroll-area" id="crm-clients-list-container">
            <!-- Client list items render here -->
          </div>
        </div>

        <!-- Client Detailed View -->
        <div class="crm-detail-view" id="crm-client-detail-container">
          <!-- Active client profile details render here -->
        </div>
      </div>
    `;

    this.renderClientList();
    this.renderClientDetail();
  },

  renderClientList(query = '') {
    const container = document.getElementById('crm-clients-list-container');
    if (!container) return;

    const clients = window.db.getClients();
    const filtered = clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.sport.toLowerCase().includes(query.toLowerCase()) ||
      c.agent.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No agents or clients found
        </div>
      `;
      this.selectedClientId = null;
      this.renderClientDetail();
      return;
    }

    if (this.selectedClientId && !filtered.some(c => c.id === this.selectedClientId)) {
      this.selectedClientId = filtered[0].id;
      this.renderClientDetail();
    }

    container.innerHTML = filtered.map(c => `
      <div class="client-list-item ${this.selectedClientId === c.id ? 'selected' : ''}" data-id="${c.id}">
        <div class="client-item-avatar">${c.avatar}</div>
        <div class="client-item-details">
          <span class="client-item-name">${c.name}</span>
          <span class="client-item-meta">${c.sport} &bull; Agent: ${c.agent.split(' ')[0]}</span>
        </div>
      </div>
    `).join('');
  },

  renderClientDetail() {
    const container = document.getElementById('crm-client-detail-container');
    if (!container) return;

    if (!this.selectedClientId) {
      container.innerHTML = `
        <div class="dashboard-panel" style="align-items: center; justify-content: center; min-height: 300px; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 12px;">👤</div>
          <h3>No Client Selected</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Please select a sports professional from the sidebar to view details.</p>
        </div>
      `;
      return;
    }

    const client = window.db.getClients().find(c => c.id === this.selectedClientId);
    if (!client) {
      this.selectedClientId = null;
      this.renderClientDetail();
      return;
    }

    // Get contracts for client
    const contracts = window.db.getContracts().filter(c => c.clientId === client.id);
    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
    const activeContracts = contracts.filter(c => c.status === 'Active');

    // Get conversation history for client
    const conversations = window.db.getConversations()
      .filter(conv => conv.clientId === client.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue);

    container.innerHTML = `
      <!-- Header Profile Card -->
      <div class="client-profile-header-card">
        <div class="profile-avatar-info">
          <div class="big-profile-avatar">${client.avatar}</div>
          <div class="profile-texts">
            <span class="profile-sport-tag">${client.sport} &bull; ${client.position}</span>
            <span class="profile-name">${client.name}</span>
            <span style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Assigned Agent: <strong>${client.agent}</strong></span>
          </div>
        </div>
        <div class="profile-contact-info">
          <span>📧 ${client.email}</span>
          <span>📞 ${client.phone}</span>
          <span style="margin-top: 6px; font-style: italic; color: var(--text-muted);">"${client.team}"</span>
        </div>
      </div>

      <!-- Quick Metrics Pills -->
      <div class="client-info-pills">
        <div class="info-pill">
          <span class="info-pill-label">Total Contract Book</span>
          <span class="info-pill-val" style="color: var(--accent-cyan);">${formattedValue}</span>
        </div>
        <div class="info-pill">
          <span class="info-pill-label">Active Contracts</span>
          <span class="info-pill-val">${activeContracts.length} of ${contracts.length}</span>
        </div>
        <div class="info-pill">
          <span class="info-pill-label">Bio Details</span>
          <span class="info-pill-val" style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary); line-height: 1.2;">
            ${client.bio.substring(0, 50)}${client.bio.length > 50 ? '...' : ''}
          </span>
        </div>
      </div>

      <div class="detail-columns">
        <!-- Contracts list -->
        <div class="dashboard-panel">
          <div class="panel-header">
            <h3 class="panel-title">📋 Contract Ledger</h3>
            <button id="btn-open-add-contract" class="btn-primary btn-sm">Add Contract</button>
          </div>
          <div class="glass-table-wrapper">
            <table class="glass-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Value</th>
                  <th>Comm.</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${contracts.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); font-size: 0.8rem;">No contracts registered.</td>
                  </tr>
                ` : contracts.map(con => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${con.partner}</div>
                      <div style="font-size: 0.75rem; color: var(--text-secondary);">${con.title}</div>
                    </td>
                    <td style="font-weight: 600;">$${con.value.toLocaleString()}</td>
                    <td>${con.commissionRate}%</td>
                    <td>
                      <span class="badge ${con.status === 'Active' ? 'badge-success' : con.status === 'Pending' ? 'badge-warning' : 'badge-danger'}">
                        ${con.status}
                      </span>
                    </td>
                    <td>
                      <button class="btn-secondary btn-sm btn-preview-contract" data-id="${con.id}">📜 View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Conversations list -->
        <div class="dashboard-panel">
          <div class="panel-header">
            <h3 class="panel-title">💬 Interaction Journal</h3>
          </div>
          
          <!-- Conversation Timeline -->
          <div class="conversation-timeline">
            ${conversations.map(conv => `
              <div class="timeline-event">
                <div class="timeline-event-header">
                  <span class="timeline-event-type badge ${
                    conv.type === 'Call' ? 'badge-info' : conv.type === 'Meeting' ? 'badge-purple' : conv.type === 'Email' ? 'badge-warning' : 'badge-success'
                  }">${conv.type}</span>
                  <span class="timeline-event-date">${conv.date} &bull; ${conv.agent.split(' ')[0]}</span>
                </div>
                <div class="timeline-event-summary">${conv.summary}</div>
                <div class="timeline-event-notes">${conv.notes}</div>
              </div>
            `).join('')}
          </div>

          <!-- Add Conversation form -->
          <form id="form-add-log" style="border-top: 1px solid var(--border-glass); padding-top: 16px; margin-top: 8px;">
            <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; color: var(--accent-purple);">Log New Interaction</h4>
            <div class="grid-2">
              <div class="form-group" style="margin-bottom: 8px;">
                <label>Contact Type</label>
                <select class="form-control" id="log-type" required>
                  <option>Call</option>
                  <option>Email</option>
                  <option>Meeting</option>
                  <option>Negotiation</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 8px;">
                <label>Contact Date</label>
                <input type="date" class="form-control" id="log-date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label>Subject / Summary</label>
              <input type="text" class="form-control" id="log-summary" placeholder="e.g. Contract review with director" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label>Detailed Notes</label>
              <textarea class="form-control" id="log-notes" placeholder="Write logs here..." required></textarea>
            </div>
            <input type="hidden" id="log-agent" value="${client.agent}">
            <button type="submit" class="btn-primary btn-sm" style="width: 100%; background: var(--gradient-purple);">Record Log</button>
          </form>
        </div>
      </div>
    `;
  }
};

window.CRMModule = CRMModule;
