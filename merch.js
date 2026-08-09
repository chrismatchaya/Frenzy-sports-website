// ApexSport OS - Merchandise Inventory & Fulfillment Module

const MerchModule = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Listen to global changes
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-merch').classList.contains('active')) {
        this.render();
      }
    });

    // Form submission - Add Product
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-add-product') {
        e.preventDefault();
        const product = {
          name: document.getElementById('new-prod-name').value,
          sku: document.getElementById('new-prod-sku').value,
          category: document.getElementById('new-prod-category').value,
          price: parseFloat(document.getElementById('new-prod-price').value) || 0,
          stock: parseInt(document.getElementById('new-prod-stock').value, 10) || 0,
          maxStock: parseInt(document.getElementById('new-prod-maxstock').value, 10) || 100
        };
        window.db.addProduct(product);
        this.closeModal('modal-add-product');
        this.render();
      }
    });

    // Delegated click actions
    document.addEventListener('click', (e) => {
      // Open Add Product modal
      if (e.target && e.target.id === 'btn-open-add-product') {
        this.openModal('modal-add-product');
      }

      // Quick Stock Adjustments
      if (e.target && e.target.classList.contains('btn-adjust-stock')) {
        const prodId = e.target.dataset.id;
        const change = parseInt(e.target.dataset.change, 10);
        const currentStock = window.db.getProductStock(prodId);
        window.db.updateStock(prodId, currentStock + change);
        this.render();
      }

      // Order Actions
      if (e.target && e.target.classList.contains('btn-process-order')) {
        const orderId = e.target.dataset.id;
        window.db.updateOrderStatus(orderId, 'Processing');
        this.render();
      }

      if (e.target && e.target.classList.contains('btn-ship-order')) {
        const orderId = e.target.dataset.id;
        window.db.updateOrderStatus(orderId, 'Shipped');
        this.render();
      }

      if (e.target && e.target.classList.contains('btn-complete-order')) {
        const orderId = e.target.dataset.id;
        window.db.updateOrderStatus(orderId, 'Delivered');
        this.render();
      }

      // Simulate order purchase
      if (e.target && e.target.id === 'btn-simulate-order') {
        this.simulateCustomerPurchase();
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

  simulateCustomerPurchase() {
    const products = window.db.getProducts().filter(p => p.stock > 0);
    if (products.length === 0) {
      alert('All products are out of stock! Adjust stock levels to simulate purchases.');
      return;
    }

    // Pick a random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
    const price = randomProduct.price;
    const total = parseFloat((price * qty).toFixed(2));

    const firstNames = ['Sarah', 'David', 'Alex', 'Chris', 'Jessica', 'Michael', 'Emma', 'Daniel'];
    const lastNames = ['Jordan', 'Messi', 'Federer', 'Hamilton', 'Williams', 'Brady', 'Mbappe'];
    const customerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const email = `${customerName.toLowerCase().replace(' ', '.')}@fanmail.com`;

    const simulatedOrder = {
      customerName,
      customerEmail: email,
      items: [{ productId: randomProduct.id, quantity: qty, price: price }],
      total: total,
      status: 'Pending'
    };

    window.db.addOrder(simulatedOrder);
    
    // Alert the user
    alert(`🛒 Simulated Fan Purchase Triggered!\n\nCustomer: ${customerName}\nItem: ${randomProduct.name} x${qty}\nTotal Cost: $${total}\n\nOrder placed in queue. Go to fulfillment section to process it.`);
    this.render();
  },

  render() {
    const view = document.getElementById('view-merch');
    if (!view) return;

    const products = window.db.getProducts();
    const orders = window.db.getOrders().sort((a, b) => b.id.localeCompare(a.id));

    view.innerHTML = `
      <div class="page-title-section" style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="page-title">Merch Inventory & Fulfillment</h1>
          <p class="page-subtitle">Track clothing & gear stock levels, fulfill fan orders, and review sales pipeline.</p>
        </div>
        <div class="panel-actions">
          <button id="btn-simulate-order" class="btn-secondary">
            <span>🛒 Simulate Purchase</span>
          </button>
          <button id="btn-open-add-product" class="btn-primary">
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      <div class="detail-columns">
        <!-- Products Grid Area -->
        <div class="dashboard-panel">
          <h3 class="panel-title">📦 Product Catalog & Stock Levels</h3>
          
          <div class="merch-grid">
            ${products.map(p => {
              const stockPct = Math.min((p.stock / p.maxStock) * 100, 100);
              let stockBadge = 'badge-success';
              if (p.stock === 0) stockBadge = 'badge-danger';
              else if (p.stock < 10) stockBadge = 'badge-warning';

              return `
                <div class="product-card">
                  <div class="product-visual" style="background: ${p.gradient || 'var(--gradient-primary)'}">
                    ${p.category === 'Apparel' ? '👕' : p.category === 'Footwear' ? '👟' : '🎒'}
                    <span class="product-category-pill">${p.category}</span>
                  </div>
                  <div class="product-details">
                    <div>
                      <div class="product-name">${p.name}</div>
                      <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace; margin-top: 2px;">${p.sku}</div>
                    </div>
                    
                    <div class="product-meta-row">
                      <span class="product-price">$${p.price.toFixed(2)}</span>
                      <span class="badge ${stockBadge}">${p.stock} Left</span>
                    </div>

                    <div class="stock-meter-container">
                      <div class="stock-labels">
                        <span>Capacity</span>
                        <span>${p.stock}/${p.maxStock}</span>
                      </div>
                      <div class="stock-bar-bg">
                        <div class="stock-bar-fill" style="width: ${stockPct}%; background: ${p.stock < 10 ? 'var(--accent-orange)' : 'var(--accent-cyan)'}"></div>
                      </div>
                    </div>

                    <div class="product-actions">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn-secondary btn-sm btn-adjust-stock" data-id="${p.id}" data-change="-5" style="flex: 1;">-5 Stock</button>
                        <button class="btn-secondary btn-sm btn-adjust-stock" data-id="${p.id}" data-change="10" style="flex: 1;">+10 Stock</button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Orders & Fulfillment Area -->
        <div class="dashboard-panel">
          <h3 class="panel-title">🚚 Fulfillment Queue</h3>
          
          <div class="order-list-panel">
            ${orders.length === 0 ? `
              <div style="padding: 40px 0; text-align: center; color: var(--text-muted);">
                No customer orders received yet. Click "Simulate Purchase" above to generate traffic.
              </div>
            ` : orders.map(ord => {
              const orderProducts = ord.items.map(item => {
                const prod = products.find(p => p.id === item.productId);
                return `${prod ? prod.name : 'Unknown Product'} (x${item.quantity})`;
              }).join(', ');

              let statusBadge = 'badge-warning';
              let actionButton = '';

              if (ord.status === 'Pending') {
                statusBadge = 'badge-info';
                actionButton = `<button class="btn-primary btn-sm btn-process-order" data-id="${ord.id}">Process</button>`;
              } else if (ord.status === 'Processing') {
                statusBadge = 'badge-warning';
                actionButton = `<button class="btn-primary btn-sm btn-ship-order" data-id="${ord.id}" style="background: var(--gradient-purple);">Ship & Deduct</button>`;
              } else if (ord.status === 'Shipped') {
                statusBadge = 'badge-success';
                actionButton = `<button class="btn-secondary btn-sm btn-complete-order" data-id="${ord.id}">Complete</button>`;
              } else if (ord.status === 'Delivered') {
                statusBadge = 'badge-success';
                actionButton = `<span style="font-size: 0.75rem; color: var(--text-muted);">✅ Fulfilled</span>`;
              }

              return `
                <div class="order-row-item">
                  <div class="order-basic-info">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="order-id">#${ord.id.substring(4, 9).toUpperCase()}</span>
                      <span class="badge ${statusBadge}">${ord.status}</span>
                    </div>
                    <div class="order-customer">${ord.customerName}</div>
                    <div class="order-details-text">${orderProducts} &bull; <span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">${ord.customerEmail}</span></div>
                  </div>
                  <div class="order-meta-action">
                    <span class="order-total-price">$${ord.total.toFixed(2)}</span>
                    <div>${actionButton}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
};

window.MerchModule = MerchModule;
