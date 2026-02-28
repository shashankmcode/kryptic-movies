// Genre browse page
import { IMG } from '../api.js';
import { createCards } from './home.js';

const API_KEY = '38794fd417f1e4d997f8297557a52bf0';
const BASE_URL = 'https://api.themoviedb.org/3';

const GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
];

async function discoverByGenre(genreId, page = 1) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
    const res = await fetch(url);
    return res.json();
}

export default async function renderGenre(app, params, queryParams) {
    const activeGenreId = parseInt(queryParams.id) || GENRES[0].id;
    const activeGenre = GENRES.find((g) => g.id === activeGenreId) || GENRES[0];

    // Render genre bar immediately
    app.innerHTML = `
    <div class="category-page fade-in">
      <h1 class="section-title" style="font-size:var(--font-2xl);margin-bottom:var(--space-lg);">
        Browse by <span class="accent">${activeGenre.name}</span>
      </h1>
      <div class="genre-bar" id="genre-bar">
        ${GENRES.map(
        (g) => `<button class="genre-chip ${g.id === activeGenreId ? 'active' : ''}" data-id="${g.id}">${g.name}</button>`
    ).join('')}
      </div>
      <div id="genre-results">
        <div class="card-grid">
          ${Array(10).fill(`
            <div class="skeleton-card">
              <div class="skeleton skeleton-poster"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text-sm"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

    // Genre chip click handler
    document.getElementById('genre-bar')?.addEventListener('click', (e) => {
        const chip = e.target.closest('.genre-chip');
        if (!chip) return;
        const id = chip.dataset.id;
        window.location.hash = `#/genre?id=${id}`;
    });

    // Load movies for this genre
    try {
        const data = await discoverByGenre(activeGenreId);
        const results = data.results || [];
        document.getElementById('genre-results').innerHTML = `
      <div class="card-grid">
        ${createCards(results, 'movie')}
      </div>
    `;
    } catch (err) {
        console.error('Genre page error:', err);
        document.getElementById('genre-results').innerHTML = `
      <div class="empty-state">
        <p>Failed to load movies. Try again.</p>
      </div>
    `;
    }
}
