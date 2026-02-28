// Movie detail + player page
import { getMovieDetails, IMG, VIDEO_SOURCES } from '../api.js';
import { createCards } from './home.js';
import { watchlistButtonHTML, toggleWatchlist, showToast } from '../watchlist.js';

const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export default async function renderMovie(app, params) {
  const { id } = params;

  // Skeleton loading
  app.innerHTML = `
    <div class="detail-page">
      <div class="detail-backdrop skeleton skeleton-hero"></div>
      <div class="detail-content" style="padding-top:60vh">
        <div class="player-section">
          <div class="player-wrapper skeleton"></div>
        </div>
        <div class="detail-info">
          <div class="detail-poster"><div class="skeleton" style="aspect-ratio:2/3;width:100%"></div></div>
          <div class="detail-meta">
            <div class="skeleton" style="height:32px;width:60%;border-radius:8px"></div>
            <div class="skeleton" style="height:16px;width:40%;border-radius:6px"></div>
            <div class="skeleton" style="height:80px;width:90%;border-radius:8px"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const movie = await getMovieDetails(id);
    const year = (movie.release_date || '').split('-')[0];
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
    const recommendations = movie.recommendations?.results || [];

    let currentSource = 0;

    function getPlayerUrl(sourceIndex) {
      return VIDEO_SOURCES[sourceIndex].movieUrl(id);
    }

    app.innerHTML = `
      <div class="detail-page">
        <div class="detail-backdrop" style="background-image: url('${IMG.backdrop(movie.backdrop_path)}')"></div>
        <div class="detail-content fade-in">

          <!-- Player -->
          <div class="player-section">
            <div class="player-wrapper">
              <iframe
                id="player-video"
                src="${getPlayerUrl(0)}"
                allowfullscreen
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerpolicy="origin"
              ></iframe>
            </div>
            <div class="source-selector" id="source-selector">
              ${VIDEO_SOURCES.map(
      (s, i) => `<button class="source-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${s.name}</button>`
    ).join('')}
            </div>
          </div>

          <!-- Info -->
          <div class="detail-info">
            <div class="detail-poster">
              <img src="${IMG.poster(movie.poster_path)}" alt="${movie.title}" />
            </div>
            <div class="detail-meta">
              <h1 class="detail-title">${movie.title}</h1>
              ${movie.tagline ? `<p class="detail-tagline">"${movie.tagline}"</p>` : ''}
              <div class="detail-genres">
                ${(movie.genres || []).map((g) => `<span class="genre-tag">${g.name}</span>`).join('')}
              </div>
              <div class="detail-stats">
                <span class="detail-stat rating">${starSvg} ${movie.vote_average?.toFixed(1)}</span>
                ${year ? `<span class="detail-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${year}</span>` : ''}
                ${runtime ? `<span class="detail-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${runtime}</span>` : ''}
              </div>
              <div style="margin-top:var(--space-sm)">
                ${watchlistButtonHTML(parseInt(id), 'movie')}
              </div>
              <p class="detail-overview">${movie.overview || 'No description available.'}</p>
            </div>
          </div>

          <!-- Recommendations -->
          ${recommendations.length > 0
        ? `
            <div class="section" style="padding-left:0;padding-right:0;margin-top:var(--space-2xl)">
              <div class="section-header">
                <h2 class="section-title">You Might <span class="accent">Also Like</span></h2>
              </div>
              <div class="card-grid">
                ${createCards(recommendations.slice(0, 12), 'movie')}
              </div>
            </div>
          `
        : ''
      }
        </div>
      </div>
    `;

    // Source selector click handler
    const selector = document.getElementById('source-selector');
    selector?.addEventListener('click', (e) => {
      const btn = e.target.closest('.source-btn');
      if (!btn) return;
      const index = parseInt(btn.dataset.index, 10);
      if (index === currentSource) return;

      currentSource = index;
      selector.querySelectorAll('.source-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const iframe = document.getElementById('player-video');
      if (iframe) iframe.src = getPlayerUrl(index);
    });

    // Watchlist button handler
    document.getElementById('watchlist-toggle')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const added = toggleWatchlist({
        id: parseInt(id),
        type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      });

      if (added) {
        btn.classList.add('added');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> In My List`;
        showToast('Added to your list');
      } else {
        btn.classList.remove('added');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Add to List`;
        showToast('Removed from your list');
      }
    });
  } catch (err) {
    console.error('Movie page error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
        <p>Failed to load movie. Please try again.</p>
      </div>
    `;
  }
}
