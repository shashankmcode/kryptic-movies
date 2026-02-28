// Watchlist page
import { getWatchlistItems } from '../watchlist.js';
import { IMG } from '../api.js';

const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export default function renderWatchlist(app) {
    const items = getWatchlistItems();

    if (items.length === 0) {
        app.innerHTML = `
      <div class="search-page fade-in">
        <div class="search-results-header">
          <h1>My <span class="accent" style="color:var(--accent-light)">List</span></h1>
        </div>
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p>Your watchlist is empty</p>
          <p style="font-size:var(--font-xs)">Browse movies and TV shows and click "Add to List" to save them here</p>
        </div>
      </div>
    `;
        return;
    }

    const cards = items
        .map((item) => {
            const year = (item.release_date || '').split('-')[0];
            const rating = item.vote_average?.toFixed(1) || 'N/A';
            const href = `#/${item.type}/${item.id}`;
            return `
        <a href="${href}" class="card" title="${item.title}">
          <img class="card-poster" src="${IMG.poster(item.poster_path) || ''}" alt="${item.title}" loading="lazy"
               onerror="this.style.background='var(--bg-secondary)'" />
          <div class="card-info">
            <div class="card-title">${item.title}</div>
            <div class="card-meta">
              <span class="card-rating">${starSvg} ${rating}</span>
              <span class="card-year">${year}</span>
            </div>
          </div>
        </a>
      `;
        })
        .join('');

    app.innerHTML = `
    <div class="search-page fade-in">
      <div class="search-results-header">
        <h1>My <span class="accent" style="color:var(--accent-light)">List</span></h1>
        <p>${items.length} title${items.length !== 1 ? 's' : ''} saved</p>
      </div>
      <div class="card-grid">${cards}</div>
    </div>
  `;
}
