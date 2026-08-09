// FrenzySport - Data Layer & Persistence Engine
const STORAGE_KEY = 'frenzy_sport_os_state';

// Initial dummy database to populate the UI with realistic sports business operations
const INITIAL_STATE = {
  crm: {
    clients: [
      {
        id: 'c1',
        name: 'Marcus Vance',
        sport: 'Soccer',
        position: 'Striker',
        team: 'Madrid FC',
        email: 'marcus.v@apexagency.com',
        phone: '+34 612 890 321',
        agent: 'Samantha Mercer',
        bio: 'Top scorer in La Liga last season. Currently negotiating boot endorsement renewal.',
        avatar: '⚽'
      },
      {
        id: 'c2',
        name: 'Elena Rostova',
        sport: 'Tennis',
        position: 'Singles (Ranked #4)',
        team: 'Independent',
        email: 'elena.rostov@apexagency.com',
        phone: '+41 79 456 7890',
        agent: 'Marcus Chen',
        bio: 'Wimbledon finalist. Strong social media following. High demand for luxury brand sponsorships.',
        avatar: '🎾'
      },
      {
        id: 'c3',
        name: 'Devon "Flash" Carter',
        sport: 'Basketball',
        position: 'Point Guard',
        team: 'LA Lakers',
        email: 'devon.carter@apexagency.com',
        phone: '+1 213 555 0199',
        agent: 'Samantha Mercer',
        bio: 'All-Star starter. Emerging fashion icon. Interested in launching a signature capsule collection.',
        avatar: '🏀'
      },
      {
        id: 'c4',
        name: 'Carlos Sainz Jr (Simulated)',
        sport: 'Formula 1',
        position: 'Driver',
        team: 'Ferrari',
        email: 'carlos.s@apexagency.com',
        phone: '+39 02 444 888',
        agent: 'Jean-Pierre Laurent',
        bio: 'Experienced podium contender. Huge commercial appeal in Europe and Latin America.',
        avatar: '🏎️'
      }
    ],
    contracts: [
      {
        id: 'con1',
        clientId: 'c1',
        clientName: 'Marcus Vance',
        title: 'Madrid FC Playing Contract',
        type: 'Team',
        partner: 'Madrid FC',
        value: 12500000,
        commissionRate: 5,
        startDate: '2024-07-01',
        endDate: '2028-06-30',
        status: 'Active'
      },
      {
        id: 'con2',
        clientId: 'c1',
        clientName: 'Marcus Vance',
        title: 'Nike Footwear Endorsement',
        type: 'Sponsorship',
        partner: 'Nike',
        value: 3000000,
        commissionRate: 10,
        startDate: '2023-01-01',
        endDate: '2026-12-31',
        status: 'Active'
      },
      {
        id: 'con3',
        clientId: 'c2',
        clientName: 'Elena Rostova',
        title: 'Rolex Ambassador Deal',
        type: 'Sponsorship',
        partner: 'Rolex',
        value: 1500000,
        commissionRate: 15,
        startDate: '2025-01-01',
        endDate: '2027-12-31',
        status: 'Active'
      },
      {
        id: 'con4',
        clientId: 'c3',
        clientName: 'Devon "Flash" Carter',
        title: 'Red Bull Energy Drinks Deal',
        type: 'Sponsorship',
        partner: 'Red Bull',
        value: 800000,
        commissionRate: 10,
        startDate: '2026-03-01',
        endDate: '2027-02-28',
        status: 'Pending'
      }
    ],
    conversations: [
      {
        id: 'conv1',
        clientId: 'c1',
        date: '2026-07-02',
        type: 'Call',
        summary: 'Madrid FC Sporting Director',
        notes: 'Discussed bonus triggers for the upcoming Champions League matches. Marcus is very happy with the current support.',
        agent: 'Samantha Mercer'
      },
      {
        id: 'conv2',
        clientId: 'c2',
        date: '2026-06-28',
        type: 'Meeting',
        summary: 'Rolex Marketing Team Pitch',
        notes: 'Finalized photoshoot dates in Geneva. Elena confirmed availability during the off-season window.',
        agent: 'Marcus Chen'
      },
      {
        id: 'conv3',
        clientId: 'c3',
        date: '2026-07-03',
        type: 'Email',
        summary: 'Signature Shoe Ideation',
        notes: 'Devon sent mood boards for a fashion shoe. Need to pitch this concept to Nike or Puma representatives next week.',
        agent: 'Samantha Mercer'
      }
    ]
  },
  merch: {
    products: [
      {
        id: 'p1',
        name: 'Vance "MV9" Madrid Jersey',
        sku: 'APEX-MV9-JRSY',
        category: 'Apparel',
        price: 89.99,
        stock: 142,
        maxStock: 500,
        gradient: 'linear-gradient(135deg, #1e3c72, #2a5298)'
      },
      {
        id: 'p2',
        name: 'Flash Signature Basketball Shoes',
        sku: 'APEX-FLASH-1',
        category: 'Footwear',
        price: 159.99,
        stock: 18,
        maxStock: 150,
        gradient: 'linear-gradient(135deg, #f12711, #f5af19)'
      },
      {
        id: 'p3',
        name: 'Elena Rostova Tennis Polo',
        sku: 'APEX-ER-POLO',
        category: 'Apparel',
        price: 64.99,
        stock: 94,
        maxStock: 300,
        gradient: 'linear-gradient(135deg, #11998e, #38ef7d)'
      },
      {
        id: 'p4',
        name: 'Frenzy Sports Agency Sleek Cap',
        sku: 'APEX-LOGO-CAP',
        category: 'Accessories',
        price: 29.99,
        stock: 5,
        maxStock: 100,
        gradient: 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)'
      }
    ],
    orders: [
      {
        id: 'ord1',
        customerName: 'Thomas Anderson',
        customerEmail: 'neo@matrix.io',
        items: [{ productId: 'p1', quantity: 2, price: 89.99 }],
        total: 179.98,
        date: '2026-07-04',
        status: 'Pending'
      },
      {
        id: 'ord2',
        customerName: 'Linda Lovelace',
        customerEmail: 'linda@domain.com',
        items: [
          { productId: 'p2', quantity: 1, price: 159.99 },
          { productId: 'p4', quantity: 1, price: 29.99 }
        ],
        total: 189.98,
        date: '2026-07-03',
        status: 'Processing'
      },
      {
        id: 'ord3',
        customerName: 'Kobe Bryant Jr',
        customerEmail: 'mamba@forever.org',
        items: [{ productId: 'p2', quantity: 1, price: 159.99 }],
        total: 159.99,
        date: '2026-07-01',
        status: 'Shipped'
      }
    ]
  },
  booking: {
    facilities: [
      { id: 'f1', name: 'Elite Performance Turf', pricePerHour: 150 },
      { id: 'f2', name: 'Indoor Hard Court', pricePerHour: 100 },
      { id: 'f3', name: 'Recovery Suite & Cryo', pricePerHour: 80 },
      { id: 'f4', name: 'VIP Video & Tactical Room', pricePerHour: 50 }
    ],
    trainers: [
      { id: 't1', name: 'Coach Sarah Mercer (Speed)', ratePerHour: 90 },
      { id: 't2', name: 'Coach Dave Miller (Tactics)', ratePerHour: 80 },
      { id: 't3', name: 'Coach Anna Rostova (Tennis)', ratePerHour: 120 },
      { id: 't4', name: 'Coach Leo Carter (Strength)', ratePerHour: 75 }
    ],
    bookings: [
      {
        id: 'b1',
        clientName: 'Marcus Vance',
        facilityId: 'f1',
        facilityName: 'Elite Performance Turf',
        trainerId: 't1',
        trainerName: 'Coach Sarah Mercer (Speed)',
        date: '2026-07-05',
        timeSlot: '09:00 - 11:00',
        durationHours: 2,
        totalCost: 480, // (150 + 90) * 2
        status: 'Paid',
        paymentCard: '•••• 4242'
      },
      {
        id: 'b2',
        clientName: 'Elena Rostova',
        facilityId: 'f2',
        facilityName: 'Indoor Hard Court',
        trainerId: 't3',
        trainerName: 'Coach Anna Rostova (Tennis)',
        date: '2026-07-06',
        timeSlot: '14:00 - 16:00',
        durationHours: 2,
        totalCost: 440, // (100 + 120) * 2
        status: 'Unpaid',
        paymentCard: ''
      }
    ]
  },
  deals: {
    pipeline: [
      {
        id: 'd1',
        brandName: 'Monster Energy',
        category: 'Beverage',
        value: 1200000,
        stage: 'Lead',
        probability: 20,
        contactName: 'Zack Johnson',
        deliverables: ['Logo on racing suit', '6x Twitch streams featuring product'],
        closeDate: '2026-09-01'
      },
      {
        id: 'd2',
        brandName: 'Porsche AG',
        category: 'Auto',
        value: 4500000,
        stage: 'Negotiating',
        probability: 65,
        contactName: 'Anke Weber',
        deliverables: ['Custom livery highlight', '1x Global commercial shoot'],
        closeDate: '2026-08-15'
      },
      {
        id: 'd3',
        brandName: 'Crypto.com',
        category: 'Crypto',
        value: 2000000,
        stage: 'Proposal',
        probability: 40,
        contactName: 'Sarah Smith',
        deliverables: ['Social media integrations', 'VIP event appearance'],
        closeDate: '2026-10-01'
      },
      {
        id: 'd4',
        brandName: 'Hugo Boss',
        category: 'Apparel',
        value: 850000,
        stage: 'Signed',
        probability: 100,
        contactName: 'Dieter Klein',
        deliverables: ['Red carpet outfits', '3x Instagram stories per month'],
        closeDate: '2026-06-20'
      },
      {
        id: 'd5',
        brandName: 'Sony PlayStation',
        category: 'Entertainment',
        value: 300000,
        stage: 'Closed-Lost',
        probability: 0,
        contactName: 'Ken Tanaka',
        deliverables: ['Console bundle promotional posts'],
        closeDate: '2026-05-10'
      }
    ]
  },
  marketing: {
    campaigns: [
      {
        id: 'm1',
        clientName: 'Marcus Vance',
        title: 'MV9 Brand Launch',
        budget: 50000,
        targetOutlets: ['ESPN', 'Sky Sports', 'Marca', 'L\'Equipe'],
        status: 'Active',
        description: 'Global campaign announcing Marcus\'s new brand identity, clothing line, and Charity Foundation.'
      },
      {
        id: 'm2',
        clientName: 'Elena Rostova',
        title: 'Grand Slam Warm-Up PR Tour',
        budget: 25000,
        targetOutlets: ['Eurosport', 'Tennis Channel', 'GQ Magazine', 'Vogue'],
        status: 'Pitching',
        description: 'PR push focusing on Elena\'s physical recovery, diet, and training regime heading into the US Open.'
      }
    ],
    pressReleases: [
      {
        id: 'pr1',
        campaignId: 'm1',
        title: 'Marcus Vance Unveils MV9 Charity Foundation and Fashion Collaboration',
        date: '2026-07-02',
        content: `MADRID -- Today, international football star Marcus Vance officially launches the MV9 Foundation, dedicated to building community pitches for youth in underprivileged neighborhoods. Alongside the foundation, Vance launched a premium apparel capsule in partnership with Hugo Boss, with all proceeds from the first week directed to the community pitches. \n\n"Sport changed my life," said Vance. "MV9 is about giving the next generation the space and confidence to run towards their dreams."`,
        pitchStatus: 'Responded'
      },
      {
        id: 'pr2',
        campaignId: 'm2',
        title: 'Tennis Star Elena Rostova Partners with Rolex in Multi-Year Global Ambassador Endorsement',
        date: '2026-06-25',
        content: `LONDON -- World Rank #4 Elena Rostova joins Rolex as its newest global brand ambassador. Celebrating timeless precision and athleticism, Rostova will sport the flagship Oyster Perpetual Datejust throughout the upcoming hard-court season. \n\n"Rolex represents the pinnacle of excellence and dedication," Rostova remarked. "I am honored to represent a brand that values sportsmanship and precision as much as I do."`,
        pitchStatus: 'Sent'
      }
    ]
  },
  news: [
    {
      id: 'n1',
      title: 'Frenzy Sports Agency Launches Global Talent Summit',
      excerpt: 'Agency brings top athletes, coaches, and sponsors together for a high-growth networking event.',
      content: `Frenzy Sports Agency inaugurated its first Global Talent Summit to accelerate athlete representation and sponsorship collaboration. The three-day event featured breakout workshops, brand negotiations, and elite performance showcases from nominees across football, tennis, basketball, and motorsport. Attendees praised the summit for creating meaningful connections between talent, agencies and global marketing partners.`,
      date: '2026-08-06',
      category: 'Agency',
      source: 'Frenzy Newsroom'
    },
    {
      id: 'n2',
      title: 'New Strategic Sponsorship Deals Strengthen Talent Exposure',
      excerpt: 'Recent brand partnerships expand marketing reach across Europe and North America.',
      content: `In the past month, Frenzy Sports Agency secured several multiyear sponsorship deals designed to elevate athlete visibility in high-growth media markets. The new agreements include apparel collaborations, broadcast ambassadorships, and digital activations that will embed talent into leading lifestyle and sports content.`,
      date: '2026-07-29',
      category: 'Partnerships',
      source: 'Frenzy Newsroom'
    },
    {
      id: 'n3',
      title: 'Academy Booking Volume Hits Record Levels This Quarter',
      excerpt: 'Premium training sessions and recovery services are in high demand as athlete preparation ramps up.',
      content: `Frenzy Academy saw bookings surge as elite athletes and rising prospects booked premium training and recovery packages. The spike reflects a rising demand for personalized performance support, video analysis, and integrated health services ahead of the upcoming competitive season.`,

      date: '2026-07-20',
      category: 'Operations',
      source: 'Frenzy Newsroom'
    }
  ]
};

class DataStore {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return JSON.parse(JSON.stringify(INITIAL_STATE));
      }
      return JSON.parse(serialized);
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      return JSON.parse(JSON.stringify(INITIAL_STATE));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      // Dispatch custom event to notify components of global change
      window.dispatchEvent(new CustomEvent('frenzy_data_changed', { detail: this.state }));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.save();
  }

  // --- CRM API ---
  getClients() { return this.state.crm.clients; }
  addClient(client) {
    client.id = 'c_' + Date.now();
    this.state.crm.clients.push(client);
    this.save();
    return client;
  }
  updateClient(id, updated) {
    const idx = this.state.crm.clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.crm.clients[idx] = { ...this.state.crm.clients[idx], ...updated };
      this.save();
    }
  }
  getContracts() { return this.state.crm.contracts; }
  addContract(contract) {
    contract.id = 'con_' + Date.now();
    this.state.crm.contracts.push(contract);
    this.save();
    return contract;
  }
  updateContract(id, updated) {
    const idx = this.state.crm.contracts.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.crm.contracts[idx] = { ...this.state.crm.contracts[idx], ...updated };
      this.save();
    }
  }
  getConversations() { return this.state.crm.conversations; }
  addConversation(log) {
    log.id = 'conv_' + Date.now();
    this.state.crm.conversations.push(log);
    this.save();
    return log;
  }

  // --- Merch API ---
  getProducts() { return this.state.merch.products; }
  updateStock(productId, newQty) {
    const prod = this.state.merch.products.find(p => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, parseInt(newQty, 10));
      this.save();
    }
  }
  addProduct(product) {
    product.id = 'p_' + Date.now();
    product.stock = parseInt(product.stock, 10) || 0;
    product.maxStock = parseInt(product.maxStock, 10) || 200;
    product.price = parseFloat(product.price) || 0;
    const grads = [
      'linear-gradient(135deg, #1e3c72, #2a5298)',
      'linear-gradient(135deg, #f12711, #f5af19)',
      'linear-gradient(135deg, #11998e, #38ef7d)',
      'linear-gradient(135deg, #8a2387, #e94057, #f27121)'
    ];
    product.gradient = product.gradient || grads[Math.floor(Math.random() * grads.length)];
    this.state.merch.products.push(product);
    this.save();
    return product;
  }
  getOrders() { return this.state.merch.orders; }
  updateOrderStatus(orderId, nextStatus) {
    const order = this.state.merch.orders.find(o => o.id === orderId);
    if (order) {
      const prevStatus = order.status;
      order.status = nextStatus;

      // Adjust inventory upon Shipping (simulated fulfillment action)
      if (prevStatus !== 'Shipped' && nextStatus === 'Shipped') {
        order.items.forEach(item => {
          this.updateStock(item.productId, this.getProductStock(item.productId) - item.quantity);
        });
      }
      this.save();
    }
  }
  getProductStock(productId) {
    const prod = this.state.merch.products.find(p => p.id === productId);
    return prod ? prod.stock : 0;
  }
  addOrder(order) {
    order.id = 'ord_' + Date.now();
    order.date = new Date().toISOString().split('T')[0];
    this.state.merch.orders.push(order);
    this.save();
    return order;
  }

  // --- Academy Booking API ---
  getFacilities() { return this.state.booking.facilities; }
  getTrainers() { return this.state.booking.trainers; }
  getBookings() { return this.state.booking.bookings; }
  addBooking(b) {
    b.id = 'b_' + Date.now();
    b.status = b.status || 'Unpaid';
    this.state.booking.bookings.push(b);
    this.save();
    return b;
  }
  payBooking(bookingId, cardNum) {
    const b = this.state.booking.bookings.find(bk => bk.id === bookingId);
    if (b) {
      b.status = 'Paid';
      b.paymentCard = '•••• ' + cardNum.slice(-4);
      this.save();
    }
  }

  // --- Deals API ---
  getDeals() { return this.state.deals.pipeline; }
  updateDealStage(dealId, newStage) {
    const d = this.state.deals.pipeline.find(dl => dl.id === dealId);
    if (d) {
      d.stage = newStage;
      if (newStage === 'Signed') {
        d.probability = 100;
      } else if (newStage === 'Closed-Lost') {
        d.probability = 0;
      }
      this.save();
    }
  }
  addDeal(deal) {
    deal.id = 'd_' + Date.now();
    deal.value = parseFloat(deal.value) || 0;
    deal.probability = parseInt(deal.probability, 10) || 50;
    deal.deliverables = Array.isArray(deal.deliverables) ? deal.deliverables : [deal.deliverables];
    this.state.deals.pipeline.push(deal);
    this.save();
    return deal;
  }

  // --- PR & Marketing API ---
  getCampaigns() { return this.state.marketing.campaigns; }
  addCampaign(camp) {
    camp.id = 'm_' + Date.now();
    camp.budget = parseFloat(camp.budget) || 0;
    camp.targetOutlets = Array.isArray(camp.targetOutlets) ? camp.targetOutlets : [camp.targetOutlets];
    this.state.marketing.campaigns.push(camp);
    this.save();
    return camp;
  }
  getPressReleases() { return this.state.marketing.pressReleases; }
  addPressRelease(pr) {
    pr.id = 'pr_' + Date.now();
    pr.date = new Date().toISOString().split('T')[0];
    this.state.marketing.pressReleases.push(pr);
    this.save();
    return pr;
  }
  updatePRStatus(prId, status) {
    const pr = this.state.marketing.pressReleases.find(item => item.id === prId);
    if (pr) {
      pr.pitchStatus = status;
      this.save();
    }
  }
  // --- News API ---
  getNews() { return this.state.news; }
  addNews(article) {
    article.id = 'n_' + Date.now();
    article.date = article.date || new Date().toISOString().split('T')[0];
    this.state.news.push(article);
    this.save();
    return article;
  }
}

// Expose a single shared data store for the SPA.
window.db = window.db || new DataStore();
