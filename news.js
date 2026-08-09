// FrenzySport - Newsroom & Updates Module

const NewsModule = {
  searchQuery: '',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    window.addEventListener('frenzy_data_changed', () => {
      if (document.getElementById('view-news').classList.contains('active')) {
        this.render();
      }
    });

    document.addEventListener('click', (e) => {
      const readMoreButton = e.target.closest('.btn-news-read-more');
      if (readMoreButton) {
        const articleId = readMoreButton.dataset.id;
        if (articleId) {
          this.openArticleModal(articleId);
        }
        return;
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-add-news') {
        e.preventDefault();

        const title = document.getElementById('new-news-title').value.trim();
        const excerpt = document.getElementById('new-news-excerpt').value.trim();
        const category = document.getElementById('new-news-category').value;
        const source = document.getElementById('new-news-source').value.trim() || 'Frenzy Newsroom';

        const content = document.getElementById('new-news-content').value.trim();

        if (!title || !excerpt || !content) {
          alert('Please fill in headline, excerpt, and full story before publishing.');
          return;
        }

        window.db.addNews({
          title,
          excerpt,
          content,
          category,
          source,
          date: new Date().toISOString().split('T')[0]
        });

        document.getElementById('form-add-news').reset();
        this.render();
        alert('News article published successfully.');
      }
    });
  },

  render() {
    const view = document.getElementById('view-news');
    if (!view) return;

    const query = (this.searchQuery || '').trim().toLowerCase();
    const articles = window.db.getNews().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredArticles = query
      ? articles.filter(article => {
          const haystack = `${article.title} ${article.excerpt} ${article.content || ''} ${article.category} ${article.source}`.toLowerCase();
          return haystack.includes(query);
        })
      : articles;

    view.innerHTML = `
      <div class="page-title-section">
        <h1 class="page-title">Frenzy Newsroom</h1>
        <p class="page-subtitle">Track the latest agency updates, sponsorship milestones, and market intelligence in one live feed.</p>
      </div>

      <div class="news-page-grid">
        <div class="dashboard-panel news-feed-panel">
          <div class="panel-header">
            <h3 class="panel-title">Latest Headlines</h3>
            <span class="panel-subtitle">${filteredArticles.length} article${filteredArticles.length === 1 ? '' : 's'}</span>
          </div>

          <div class="news-list">
            ${filteredArticles.length === 0 ? `
              <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.95rem;">
                No news articles match your search query.
              </div>
            ` : filteredArticles.map(article => `
              <article class="news-article-card">
                <div class="news-article-header">
                  <span class="news-category-pill">${article.category}</span>
                  <span class="news-date">${article.date}</span>
                </div>
                <h4 class="news-article-title">${article.title}</h4>
                <p class="news-article-excerpt">${article.excerpt}</p>
                <div class="news-article-meta">
                  <span>${article.source}</span>
                  <button class="btn-secondary btn-sm btn-news-read-more" data-id="${article.id}">Read More</button>
                </div>
              </article>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-panel news-create-panel">
          <div class="panel-header">
            <h3 class="panel-title">Publish Update</h3>
            <span class="panel-subtitle">Create a newsroom article</span>
          </div>

          <form id="form-add-news">
            <div class="form-group">
              <label for="new-news-title">Headline</label>
              <input type="text" id="new-news-title" class="form-control" placeholder="Enter article headline" required>
            </div>
            <div class="form-group">
              <label for="new-news-excerpt">Excerpt</label>
              <textarea id="new-news-excerpt" class="form-control" rows="4" placeholder="Write a short summary of the news item" required></textarea>
            </div>
            <div class="form-group">
              <label for="new-news-content">Full Story</label>
              <textarea id="new-news-content" class="form-control" rows="6" placeholder="Write the full article body shown when the reader clicks Read More" required></textarea>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label for="new-news-category">Category</label>
                <select id="new-news-category" class="form-control">
                  <option>Agency</option>
                  <option>Partnerships</option>
                  <option>Operations</option>
                  <option>Market</option>
                </select>
              </div>
              <div class="form-group">
                <label for="new-news-source">Source</label>
                <input type="text" id="new-news-source" class="form-control" placeholder="Frenzy Newsroom">
              </div>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Publish News</button>
          </form>
        </div>
      </div>
    `;
  },

  openArticleModal(articleId) {
    const article = window.db.getNews().find(item => item.id === articleId);
    if (!article) {
      alert('Unable to locate this article.');
      return;
    }

    const content = article.content || article.excerpt || 'No additional details are available for this article yet.';
    const modal = document.getElementById('modal-news-detail');
    const modalContent = document.getElementById('news-detail-content');
    if (!modal || !modalContent) return;

    const summary = article.excerpt ? `<p class="news-detail-summary">${article.excerpt}</p>` : '';
    modalContent.innerHTML = `
      <div style="display: flex; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; align-items: center;">
        <div style="min-width: 48px; min-height: 48px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">📰</div>
        <div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">${article.category}</div>
          <h4 style="margin: 0 0 6px; font-size: 1.25rem; color: var(--text-primary);">${article.title}</h4>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${article.date} • ${article.source}</div>
        </div>
      </div>
      <div class="news-detail-body">
        ${summary}
        <p>${content}</p>
      </div>
    `;

    modal.classList.add('active');
  }
};

window.NewsModule = NewsModule;
