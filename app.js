// FrenzySport - Master Application Coordinator

const App = {
  activeView: 'dashboard',
  searchQuery: '',

  init() {
    // Register global event listener for database changes to update the dashboard overview
    window.addEventListener('frenzy_data_changed', () => {
      this.updateGlobalMetrics();
      if (this.activeView === 'dashboard') {
        this.renderDashboard();
      }
    });

    // Handle database reset
    const btnReset = document.getElementById('btn-reset-db');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('⚠️ Are you sure you want to reset all data? This will wipe your local changes and reload initial records.')) {
          window.db.reset();
          alert('Database reset successful.');
          window.location.reload();
        }
      });
    }

    // Modal Close Triggers
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      }
      if (e.target && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    // Hash routing
    window.addEventListener('hashchange', () => this.handleRouting());

    // Global search input
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value || '';
        this.handleSearch(this.searchQuery);
      });
    }

    // Init submodules once
    if (window.CRMModule) window.CRMModule.init();
    if (window.MerchModule) window.MerchModule.init();
    if (window.BookingModule) window.BookingModule.init();
    if (window.DealsModule) window.DealsModule.init();
    if (window.MarketingModule) window.MarketingModule.init();
    if (window.NewsModule) window.NewsModule.init();

    // Trigger initial route
    this.handleRouting();
    this.updateGlobalMetrics();
  },


  handleRouting() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    const views = ['dashboard', 'crm', 'merch', 'booking', 'deals', 'marketing', 'news'];
    
    if (!views.includes(hash)) return;


    this.activeView = hash;

    // Toggle active classes on view containers
    views.forEach(v => {
      const container = document.getElementById(`view-${v}`);
      if (container) {
        if (v === hash) {
          container.classList.add('active');
        } else {
          container.classList.remove('active');
        }
      }
    });

    // Toggle active class on sidebar menu links
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item');
    menuLinks.forEach(li => {
      const a = li.querySelector('a');
      if (a && a.getAttribute('href') === `#${hash}`) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });

    // Load active view content
    if (hash === 'dashboard') {
      this.renderDashboard();
    } else if (hash === 'crm') {
      window.CRMModule.render();
    } else if (hash === 'merch') {
      window.MerchModule.render();
    } else if (hash === 'booking') {
      window.BookingModule.render();
    } else if (hash === 'deals') {
      window.DealsModule.render();
    } else if (hash === 'marketing') {
      window.MarketingModule.render();
    } else if (hash === 'news') {
      window.NewsModule.render();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (this.searchQuery && (hash === 'crm' || hash === 'news')) {
      this.handleSearch(this.searchQuery);
    }
  },

  handleSearch(query) {
    if (this.activeView === 'crm' && window.CRMModule) {
      window.CRMModule.renderClientList(query);
    } else if (this.activeView === 'news' && window.NewsModule) {
      window.NewsModule.searchQuery = query;
      window.NewsModule.render();
    }
  },

  updateSearchInput(value) {
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.value = value || '';
    }
  },

  updateGlobalMetrics() {
    // 1. CRM - Athlete Count
    const clientsCount = window.db.getClients().length;
    const clientCountBadge = document.getElementById('metric-global-clients');
    if (clientCountBadge) clientCountBadge.textContent = clientsCount;

    // 2. Merch + Academy Bookings = Total Revenue
    const orders = window.db.getOrders().filter(o => o.status === 'Shipped' || o.status === 'Delivered');
    const bookings = window.db.getBookings().filter(b => b.status === 'Paid');
    const merchRev = orders.reduce((sum, o) => sum + o.total, 0);
    const bookingRev = bookings.reduce((sum, b) => sum + b.totalCost, 0);
    const totalRev = merchRev + bookingRev;

    const revBadge = document.getElementById('metric-global-revenue');
    if (revBadge) {
      revBadge.textContent = `$${Math.round(totalRev).toLocaleString()}`;
    }

    // 3. Deals - Signed Sponsorship deals
    const signedDealsVal = window.db.getDeals()
      .filter(d => d.stage === 'Signed')
      .reduce((sum, d) => sum + d.value, 0);

    const dealBadge = document.getElementById('metric-global-deals');
    if (dealBadge) {
      dealBadge.textContent = `$${(signedDealsVal / 1000000).toFixed(1)}M`;
    }

    // 4. Marketing - Active Campaigns count
    const campCount = window.db.getCampaigns().filter(c => c.status === 'Active').length;
    const campBadge = document.getElementById('metric-global-campaigns');
    if (campBadge) campBadge.textContent = campCount;
  },

  renderDashboard() {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title-section">
        <h1 class="page-title">Executive Dashboard</h1>
        <p class="page-subtitle">Unified operations control of the agency, commercial merchandise, academy facility, and corporate sponsorship deals.</p>
      </div>

      <!-- Metrics Row -->
      <div class="dashboard-metrics-grid">
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Managed Roster</span>
            <span id="metric-dash-clients" class="metric-value">0</span>
            <span class="metric-trend trend-up">▲ Pro Athletes & Coaches</span>
          </div>
          <div class="metric-icon-box">🏃‍♂️</div>
        </div>

        <div class="metric-card green">
          <div class="metric-info">
            <span class="metric-label">Secured Partnerships</span>
            <span id="metric-dash-deals" class="metric-value">$0.0M</span>
            <span class="metric-trend trend-up">▲ Active Brand Sponsorships</span>
          </div>
          <div class="metric-icon-box">💰</div>
        </div>

        <div class="metric-card orange">
          <div class="metric-info">
            <span class="metric-label">Operating Revenues</span>
            <span id="metric-dash-revenue" class="metric-value">$0</span>
            <span class="metric-trend">Merch Sales & Academy Bookings</span>
          </div>
          <div class="metric-icon-box">⚡</div>
        </div>

        <div class="metric-card purple">
          <div class="metric-info">
            <span class="metric-label">Active Marketing</span>
            <span id="metric-dash-campaigns" class="metric-value">0</span>
            <span class="metric-trend">Ongoing PR Pitch Campaigns</span>
          </div>
          <div class="metric-icon-box">📢</div>
        </div>
      </div>

      <!-- Dashboard Visual Row -->
      <div class="dashboard-row">
        <!-- SVG Charts -->
        <div class="dashboard-panel">
          <div class="panel-header">
            <h3 class="panel-title">📈 Commercial Sponsorship Funnel</h3>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Deal values by sales stage</span>
          </div>
          <div id="dashboard-revenue-chart-box" class="svg-chart-container" style="min-height: 240px; margin-top: 10px;">
            <!-- Render SVG vertical bar chart -->
          </div>
        </div>

        <!-- Combined Activity Feed -->
        <div class="dashboard-panel">
          <h3 class="panel-title">🔔 Integrated Operation Feed</h3>
          
          <div id="dashboard-activity-feed" style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
            <!-- Activity feed logs -->
          </div>
        </div>
      </div>

      <div class="detail-columns">
        <div class="dashboard-panel">
          <h3 class="panel-title">⚽ Academy Live Training (Next 48 Hours)</h3>
          <div class="glass-table-wrapper" style="margin-top: 10px;">
            <table class="glass-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Facility Zone</th>
                  <th>Trainer</th>
                  <th>Time / Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="dash-booking-table">
                <!-- Renders upcoming booking details -->
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-panel">
          <h3 class="panel-title">👚 Low Stock Merch Alerts</h3>
          <div class="glass-table-wrapper" style="margin-top: 10px;">
            <table class="glass-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody id="dash-merch-table">
                <!-- Renders low inventory alerts -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Fetch and bind actual numerical data to dashboard elements
    const clientsCount = window.db.getClients().length;
    document.getElementById('metric-dash-clients').textContent = clientsCount;

    const orders = window.db.getOrders().filter(o => o.status === 'Shipped' || o.status === 'Delivered');
    const bookings = window.db.getBookings().filter(b => b.status === 'Paid');
    const merchRev = orders.reduce((sum, o) => sum + o.total, 0);
    const bookingRev = bookings.reduce((sum, b) => sum + b.totalCost, 0);
    const totalRev = merchRev + bookingRev;
    document.getElementById('metric-dash-revenue').textContent = `$${Math.round(totalRev).toLocaleString()}`;

    const signedDealsVal = window.db.getDeals()
      .filter(d => d.stage === 'Signed')
      .reduce((sum, d) => sum + d.value, 0);
    document.getElementById('metric-dash-deals').textContent = `$${(signedDealsVal / 1000000).toFixed(1)}M`;

    const activeCamps = window.db.getCampaigns().filter(c => c.status === 'Active').length;
    document.getElementById('metric-dash-campaigns').textContent = activeCamps;

    // Render Charts
    this.renderDashboardCharts();

    // Render Operation Feed
    this.renderActivityFeed();

    // Render Tables
    this.renderDashboardTables();
  },

  renderDashboardCharts() {
    const deals = window.db.getDeals();
    const stages = ['Lead', 'Proposal', 'Negotiating', 'Signed'];
    const chartData = stages.map(stg => {
      const val = deals.filter(d => d.stage === stg).reduce((sum, d) => sum + d.value, 0);
      return { label: stg, value: val };
    });

    window.Charts.renderBarChart('dashboard-revenue-chart-box', chartData);
  },

  renderActivityFeed() {
    const container = document.getElementById('dashboard-activity-feed');
    if (!container) return;

    // Pull events from CRM Conversations, Merch Orders, Academy Bookings, and Sponsor Deals
    const activities = [];

    // Orders
    window.db.getOrders().forEach(o => {
      activities.push({
        type: 'Order',
        icon: '🛒',
        color: 'var(--accent-cyan)',
        title: `Merchandise Purchase order by ${o.customerName}`,
        meta: `Total: $${o.total.toFixed(2)} &bull; Status: ${o.status}`,
        timestamp: new Date(o.date)
      });
    });

    // Bookings
    window.db.getBookings().forEach(b => {
      activities.push({
        type: 'Booking',
        icon: '📅',
        color: 'var(--accent-orange)',
        title: `Performance session booked for ${b.clientName}`,
        meta: `${b.facilityName} &bull; Status: ${b.status}`,
        timestamp: new Date(b.date)
      });
    });

    // Deals
    window.db.getDeals().forEach(d => {
      activities.push({
        type: 'Deal',
        icon: '🤝',
        color: 'var(--accent-green)',
        title: `Sponsorship opportunity: ${d.brandName}`,
        meta: `Value: $${d.value.toLocaleString()} &bull; Stage: ${d.stage}`,
        timestamp: new Date(d.closeDate)
      });
    });

    // CRM Conversations
    window.db.getConversations().forEach(c => {
      const client = window.db.getClients().find(cl => cl.id === c.clientId);
      activities.push({
        type: 'Log',
        icon: '💬',
        color: 'var(--accent-purple)',
        title: `Agent interaction log with ${client ? client.name : 'Client'}`,
        meta: `${c.summary} &bull; ${c.type}`,
        timestamp: new Date(c.date)
      });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp - a.timestamp);

    if (activities.length === 0) {
      container.innerHTML = `<span style="color: var(--text-muted); text-align: center; padding: 20px;">No operational events registered.</span>`;
      return;
    }

    container.innerHTML = activities.slice(0, 7).map(a => `
      <div style="display: flex; gap: 12px; background: rgba(255,255,255,0.015); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; align-items: flex-start;">
        <span style="font-size: 1.25rem; width: 34px; height: 34px; background: rgba(255,255,255,0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-glass);">${a.icon}</span>
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${a.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${a.meta}</div>
        </div>
      </div>
    `).join('');
  },

  renderDashboardTables() {
    // 1. Academy Upcoming Bookings Table
    const bookingBody = document.getElementById('dash-booking-table');
    if (bookingBody) {
      const bookings = window.db.getBookings().slice(0, 4);
      if (bookings.length === 0) {
        bookingBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No upcoming training sessions.</td></tr>`;
      } else {
        bookingBody.innerHTML = bookings.map(b => `
          <tr>
            <td><strong style="color: var(--text-primary);">${b.clientName}</strong></td>
            <td>${b.facilityName}</td>
            <td>${b.trainerName.split(' (')[0]}</td>
            <td>${b.date} (${b.timeSlot.split(' ')[0]})</td>
            <td><span class="badge ${b.status === 'Paid' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
          </tr>
        `).join('');
      }
    }

    // 2. Low stock merchandise table
    const merchBody = document.getElementById('dash-merch-table');
    if (merchBody) {
      const lowStockProducts = window.db.getProducts().filter(p => p.stock < 15);
      if (lowStockProducts.length === 0) {
        merchBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--accent-green); font-weight:600;">✅ All merchandise products fully stocked!</td></tr>`;
      } else {
        merchBody.innerHTML = lowStockProducts.map(p => `
          <tr>
            <td><span style="font-weight:600;">${p.name}</span></td>
            <td style="font-family:monospace; font-size:0.75rem; color:var(--text-secondary);">${p.sku}</td>
            <td>${p.category}</td>
            <td><span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock} Units Left</span></td>
          </tr>
        `).join('');
      }
    }
  }
};

window.App = App;
window.onload = () => window.App.init();
