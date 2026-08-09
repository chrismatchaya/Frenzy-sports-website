// ApexSport OS - Academy Booking & Payment Module

const BookingModule = {
  activePayBookingId: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Listen for database changes
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-booking').classList.contains('active')) {
        this.render();
      }
    });

    // Form Submission - Create Booking
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-create-booking') {
        e.preventDefault();
        
        const clientSelect = document.getElementById('book-client');
        const facilitySelect = document.getElementById('book-facility');
        const trainerSelect = document.getElementById('book-trainer');
        const dateInput = document.getElementById('book-date');
        const slotSelect = document.getElementById('book-slot');
        const durationSelect = document.getElementById('book-duration');

        const facilityId = facilitySelect.value;
        const trainerId = trainerSelect.value;
        const duration = parseInt(durationSelect.value, 10);

        const facility = window.db.getFacilities().find(f => f.id === facilityId);
        const trainer = window.db.getTrainers().find(t => t.id === trainerId);

        const cost = (facility.pricePerHour + trainer.ratePerHour) * duration;

        const booking = {
          clientName: clientSelect.value,
          facilityId: facilityId,
          facilityName: facility.name,
          trainerId: trainerId,
          trainerName: trainer.name,
          date: dateInput.value,
          timeSlot: slotSelect.value,
          durationHours: duration,
          totalCost: cost,
          status: 'Unpaid',
          paymentCard: ''
        };

        window.db.addBooking(booking);
        e.target.reset();
        alert('📅 Reservation Created! Please proceed to payment to finalize.');
        this.render();
      }

      // Form Submission - Process Payment
      if (e.target && e.target.id === 'form-pay-invoice') {
        e.preventDefault();
        const cardNum = document.getElementById('pay-card-num').value;
        if (this.activePayBookingId) {
          window.db.payBooking(this.activePayBookingId, cardNum);
          this.closeModal('modal-payment-checkout');
          alert('💳 Payment Approved! Digital invoice has been settled and receipt generated.');
          this.render();
        }
      }
    });

    // Delegated click listeners
    document.addEventListener('click', (e) => {
      // Trigger payment checkout
      if (e.target && e.target.classList.contains('btn-checkout-booking')) {
        this.activePayBookingId = e.target.dataset.id;
        this.openPaymentModal(this.activePayBookingId);
      }
    });

    // Calculator updates in reservation form
    document.addEventListener('change', (e) => {
      const triggerIds = ['book-facility', 'book-trainer', 'book-duration'];
      if (e.target && triggerIds.includes(e.target.id)) {
        this.updatePricePreview();
      }
    });
  },

  openPaymentModal(bookingId) {
    const booking = window.db.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    this.openModal('modal-payment-checkout');

    // Reset payment inputs
    document.getElementById('pay-card-num').value = '';
    document.getElementById('pay-card-name').value = '';
    document.getElementById('pay-card-expiry').value = '';
    document.getElementById('pay-card-cvv').value = '';

    // Render payment display totals
    document.getElementById('checkout-desc').textContent = `${booking.facilityName} with ${booking.trainerName.split(' (')[0]}`;
    document.getElementById('checkout-amt').textContent = `$${booking.totalCost}`;
    
    // Bind graphic updater
    this.updateCardGraphic();
  },

  updateCardGraphic() {
    const numInput = document.getElementById('pay-card-num');
    const nameInput = document.getElementById('pay-card-name');
    const expiryInput = document.getElementById('pay-card-expiry');

    // Event listener for inputs to mirror onto credit card preview
    const syncFunc = () => {
      // Number formatting: Add spaces every 4 characters
      let num = numInput.value.replace(/\D/g, '').substring(0, 16);
      let formatted = num.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
      numInput.value = num.match(/.{1,4}/g)?.join(' ') || num;

      document.getElementById('card-g-num').textContent = formatted;
      document.getElementById('card-g-name').textContent = nameInput.value.toUpperCase() || 'HOLDER NAME';
      document.getElementById('card-g-exp').textContent = expiryInput.value || 'MM/YY';
    };

    numInput.oninput = syncFunc;
    nameInput.oninput = syncFunc;
    expiryInput.oninput = syncFunc;
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    this.activePayBookingId = null;
  },

  updatePricePreview() {
    const facilitySelect = document.getElementById('book-facility');
    const trainerSelect = document.getElementById('book-trainer');
    const durationSelect = document.getElementById('book-duration');
    const previewVal = document.getElementById('booking-price-preview-value');

    if (!facilitySelect || !trainerSelect || !durationSelect || !previewVal) return;

    const facility = window.db.getFacilities().find(f => f.id === facilitySelect.value);
    const trainer = window.db.getTrainers().find(t => t.id === trainerSelect.value);
    const hours = parseInt(durationSelect.value, 10) || 1;

    if (facility && trainer) {
      const total = (facility.pricePerHour + trainer.ratePerHour) * hours;
      previewVal.textContent = `$${total} ($${facility.pricePerHour + trainer.ratePerHour}/hr)`;
    }
  },

  render() {
    const view = document.getElementById('view-booking');
    if (!view) return;

    const clients = window.db.getClients();
    const facilities = window.db.getFacilities();
    const trainers = window.db.getTrainers();
    const bookings = window.db.getBookings().sort((a, b) => b.id.localeCompare(a.id));

    view.innerHTML = `
      <div class="page-title-section">
        <h1 class="page-title">Academy Booking & Payments</h1>
        <p class="page-subtitle">Schedule facility training slots, assign coaches, process billing, and view live schedules.</p>
      </div>

      <div class="booking-grid">
        <!-- Booking Booking Form Panel -->
        <div class="dashboard-panel">
          <h3 class="panel-title">📅 Reserve Performance Training</h3>
          
          <form id="form-create-booking" style="margin-top: 10px;">
            <div class="form-group">
              <label>Select Athlete / Client</label>
              <select class="form-control" id="book-client" required>
                ${clients.map(c => `<option value="${c.name}">${c.avatar} ${c.name} (${c.sport})</option>`).join('')}
              </select>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Facility Zone</label>
                <select class="form-control" id="book-facility" required>
                  ${facilities.map(f => `<option value="${f.id}">${f.name} ($${f.pricePerHour}/hr)</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Specialist Trainer</label>
                <select class="form-control" id="book-trainer" required>
                  ${trainers.map(t => `<option value="${t.id}">${t.name} ($${t.ratePerHour}/hr)</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Booking Date</label>
                <input type="date" class="form-control" id="book-date" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}" required>
              </div>
              <div class="form-group">
                <label>Available Hours</label>
                <select class="form-control" id="book-slot" required>
                  <option>08:00 - 10:00</option>
                  <option>10:00 - 12:00</option>
                  <option>13:00 - 15:00</option>
                  <option>15:00 - 17:00</option>
                  <option>18:00 - 20:00</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Duration (Hours)</label>
              <select class="form-control" id="book-duration" required>
                <option value="1">1 Hour</option>
                <option value="2" selected>2 Hours</option>
                <option value="3">3 Hours</option>
                <option value="4">4 Hours</option>
              </select>
            </div>

            <div class="stock-meter-container" style="background: rgba(255,145,0,0.05); border: 1px dashed rgba(255,145,0,0.2); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">Calculated Session Cost:</span>
                <span id="booking-price-preview-value" style="font-family: 'Outfit'; font-weight: 700; font-size: 1.2rem; color: var(--accent-orange);">$480 ($240/hr)</span>
              </div>
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; background: var(--gradient-gold);">
              <span>Book Academy Session</span>
            </button>
          </form>
        </div>

        <!-- Bookings Ledger Panel -->
        <div class="dashboard-panel">
          <h3 class="panel-title">🗓️ Schedule Ledger</h3>
          
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            ${bookings.length === 0 ? `
              <div style="padding: 40px 0; text-align: center; color: var(--text-muted);">
                No academy training sessions scheduled.
              </div>
            ` : bookings.map(b => {
              const statusLabel = b.status === 'Paid' ? `badge-success` : 'badge-danger';
              return `
                <div class="booking-item-card">
                  <div class="booking-item-details">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="booking-item-facility">${b.facilityName}</span>
                      <span class="badge ${statusLabel}">${b.status}</span>
                    </div>
                    <span class="booking-item-time">📅 ${b.date} (${b.timeSlot}) &bull; Hours: ${b.durationHours}hr</span>
                    <span class="booking-item-trainer">👤 Athlete: <strong>${b.clientName}</strong> &bull; Trainer: ${b.trainerName.split(' (')[0]}</span>
                  </div>
                  <div class="booking-item-action">
                    <span class="booking-item-cost">$${b.totalCost}</span>
                    <div>
                      ${b.status === 'Paid' ? `
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Receipt: ${b.paymentCard}</span>
                      ` : `
                        <button class="btn-primary btn-sm btn-checkout-booking" data-id="${b.id}" style="background: var(--gradient-gold);">Pay Invoice</button>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.updatePricePreview();
  }
};

window.BookingModule = BookingModule;
