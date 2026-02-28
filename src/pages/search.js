// Search results page
import { searchMulti, IMG } from '../api.js';
import { createCards } from './home.js';

export default async function renderSearch(app, params, queryParams) {
    const query = queryParams.q || '';

    if (!query) {
        app.innerHTML = `
      <div class="search-page">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <p>Start typing to search for movies & TV shows</p>
        </div>
      </div>
    `;
        return;
    }

    app.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    try {
        const data = await searchMulti(query);
        const results = (data.results || []).filter(
            (item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );

        app.innerHTML = `
      <div class="search-page fade-in">
        <div class="search-results-header">
          <h1>Results for "${query}"</h1>
          <p>${results.length} result${results.length !== 1 ? 's' : ''} found</p>
        </div>
        ${results.length > 0
                ? `<div class="card-grid">${createCards(results)}</div>`
                : `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                <p>No results found for "${query}"</p>
              </div>`
            }
      </div>
    `;
    } catch (err) {
        console.error('Search error:', err);
        app.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
        <p>Search failed. Please try again.</p>
      </div>
    `;
    }
}
