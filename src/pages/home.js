// Home page — Hero + Trending + Popular
import { getTrending, getPopularMovies, getNowPlayingMovies, IMG } from '../api.js';

const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

function createCard(item) {
  const isMovie = item.media_type !== 'tv';
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const poster = IMG.poster(item.poster_path);
  const type = isMovie ? 'movie' : 'tv';
  const href = `#/${type}/${item.id}`;

  return `
    <a href="${href}" class="card" title="${title}">
      <img class="card-poster" src="${poster || ''}" alt="${title}" loading="lazy"
           onerror="this.style.background='var(--bg-secondary)'; this.alt='No Image'" />
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          <span class="card-rating">${starSvg} ${rating}</span>
          <span class="card-year">${year}</span>
        </div>
      </div>
    </a>
  `;
}

export function createCards(items, mediaType) {
  return items
    .filter((item) => item.poster_path)
    .map((item) => {
      if (mediaType) item.media_type = mediaType;
      return createCard(item);
    })
    .join('');
}

export default async function renderHome(app) {
  const skeletonCards = Array(6).fill(`<div class="skeleton-card"><div class="skeleton skeleton-poster"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text-sm"></div></div>`).join('');
  app.innerHTML = `<div class="skeleton skeleton-hero"></div><section class="section"><div class="section-header"><div class="skeleton" style="height:24px;width:200px;border-radius:8px"></div></div><div class="card-grid">${skeletonCards}</div></section>`;

  try {
    const [trendingData, popularData, nowPlayingData] = await Promise.all([
      getTrending('all', 'week'),
      getPopularMovies(),
      getNowPlayingMovies(),
    ]);

    const trending = trendingData.results || [];
    const popular = popularData.results || [];
    const nowPlaying = nowPlayingData.results || [];

    // Pick a random hero from trending
    const hero = trending[Math.floor(Math.random() * Math.min(5, trending.length))];
    const heroType = hero.media_type === 'tv' ? 'tv' : 'movie';
    const heroTitle = hero.title || hero.name;
    const heroYear = (hero.release_date || hero.first_air_date || '').split('-')[0];

    app.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="hero-backdrop" style="background-image: url('${IMG.backdrop(hero.backdrop_path)}')"></div>
        <div class="hero-content fade-in">
          <div class="hero-meta">
            <span class="hero-badge">${heroType === 'tv' ? 'TV Show' : 'Movie'}</span>
            <span class="hero-badge rating">${starSvg} ${hero.vote_average?.toFixed(1)}</span>
            ${heroYear ? `<span class="hero-badge">${heroYear}</span>` : ''}
          </div>
          <h1 class="hero-title">${heroTitle}</h1>
          <p class="hero-overview">${hero.overview || ''}</p>
          <div class="hero-actions">
            <a href="#/${heroType}/${hero.id}" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch Now
            </a>
          </div>
        </div>
      </section>

      <!-- Trending -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Trending <span class="accent">This Week</span></h2>
        </div>
        <div class="card-grid">
          ${createCards(trending)}
        </div>
      </section>

      <!-- Now Playing -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Now <span class="accent">Playing</span></h2>
        </div>
        <div class="card-grid">
          ${createCards(nowPlaying, 'movie')}
        </div>
      </section>

      <!-- Popular -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Popular <span class="accent">Movies</span></h2>
        </div>
        <div class="card-grid">
          ${createCards(popular, 'movie')}
        </div>
      </section>
    `;
  } catch (err) {
    console.error('Home page error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
        </svg>
        <p>Failed to load content. Please try again.</p>
      </div>
    `;
  }
}
