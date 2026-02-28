// TV show detail + player page with season/episode selection
import { getTVDetails, getTVSeasonDetails, IMG, VIDEO_SOURCES } from '../api.js';
import { createCards } from './home.js';
import { watchlistButtonHTML, toggleWatchlist, showToast } from '../watchlist.js';

const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export default async function renderTV(app, params, queryParams) {
  const { id } = params;
  const currentSeason = parseInt(queryParams.season) || 1;
  const currentEpisode = parseInt(queryParams.episode) || 1;

  app.innerHTML = `
    <div class="detail-page">
      <div class="detail-backdrop skeleton skeleton-hero"></div>
      <div class="detail-content" style="padding-top:60vh">
        <div class="player-section"><div class="player-wrapper skeleton"></div></div>
        <div class="detail-info">
          <div class="detail-poster"><div class="skeleton" style="aspect-ratio:2/3;width:100%"></div></div>
          <div class="detail-meta">
            <div class="skeleton" style="height:32px;width:60%;border-radius:8px"></div>
            <div class="skeleton" style="height:16px;width:40%;border-radius:6px"></div>
            <div class="skeleton" style="height:80px;width:90%;border-radius:8px"></div>
          </div>
        </div>
      </div>
    </div>`;

  try {
    const show = await getTVDetails(id);
    const seasons = (show.seasons || []).filter((s) => s.season_number > 0);
    const seasonData = await getTVSeasonDetails(id, currentSeason);
    const episodes = seasonData.episodes || [];
    const recommendations = show.recommendations?.results || [];

    let currentSource = 0;

    function getPlayerUrl(sourceIndex, season, episode) {
      return VIDEO_SOURCES[sourceIndex].tvUrl(id, season, episode);
    }

    function renderEpisodes(eps, activeSeason, activeEpisode) {
      return eps
        .map(
          (ep) => `
        <div class="episode-card ${ep.episode_number === activeEpisode ? 'active' : ''}"
             data-season="${activeSeason}" data-episode="${ep.episode_number}">
          <img class="episode-still"
               src="${IMG.still(ep.still_path) || ''}"
               alt="E${ep.episode_number}"
               loading="lazy"
               onerror="this.style.background='var(--bg-secondary)'" />
          <div class="episode-info">
            <span class="episode-number">Episode ${ep.episode_number}</span>
            <span class="episode-name">${ep.name || `Episode ${ep.episode_number}`}</span>
            <span class="episode-overview">${ep.overview || ''}</span>
          </div>
        </div>
      `
        )
        .join('');
    }

    app.innerHTML = `
      <div class="detail-page">
        <div class="detail-backdrop" style="background-image: url('${IMG.backdrop(show.backdrop_path)}')"></div>
        <div class="detail-content fade-in">

          <!-- Player -->
          <div class="player-section">
            <div class="player-wrapper">
              <iframe
                id="player-video"
                src="${getPlayerUrl(0, currentSeason, currentEpisode)}"
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
              <img src="${IMG.poster(show.poster_path)}" alt="${show.name}" />
            </div>
            <div class="detail-meta">
              <h1 class="detail-title">${show.name}</h1>
              ${show.tagline ? `<p class="detail-tagline">"${show.tagline}"</p>` : ''}
              <div class="detail-genres">
                ${(show.genres || []).map((g) => `<span class="genre-tag">${g.name}</span>`).join('')}
              </div>
              <div class="detail-stats">
                <span class="detail-stat rating">${starSvg} ${show.vote_average?.toFixed(1)}</span>
                <span class="detail-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                  ${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}
                </span>
                <span class="detail-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  S${currentSeason} E${currentEpisode}
                </span>
              </div>
              <div style="margin-top:var(--space-sm)">
                ${watchlistButtonHTML(parseInt(id), 'tv')}
              </div>
              <p class="detail-overview">${show.overview || 'No description available.'}</p>
            </div>
          </div>

          <!-- Season / Episode Selector -->
          <div class="section" style="padding-left:0;padding-right:0;margin-top:var(--space-2xl)">
            <div class="section-header">
              <h2 class="section-title"><span class="accent">Episodes</span></h2>
            </div>
            <div class="tv-controls">
              <div class="select-wrapper">
                <select id="season-select">
                  ${seasons
        .map(
          (s) =>
            `<option value="${s.season_number}" ${s.season_number === currentSeason ? 'selected' : ''}>
                          Season ${s.season_number} (${s.episode_count} eps)
                        </option>`
        )
        .join('')}
                </select>
              </div>
            </div>
            <div class="episode-grid" id="episode-grid">
              ${renderEpisodes(episodes, currentSeason, currentEpisode)}
            </div>
          </div>

          <!-- Recommendations -->
          ${recommendations.length > 0
        ? `
            <div class="section" style="padding-left:0;padding-right:0;margin-top:var(--space-xl)">
              <div class="section-header">
                <h2 class="section-title">Similar <span class="accent">Shows</span></h2>
              </div>
              <div class="card-grid">
                ${createCards(recommendations.slice(0, 12), 'tv')}
              </div>
            </div>
          `
        : ''
      }
        </div>
      </div>
    `;

    // Source selector
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
      const activeEp = document.querySelector('.episode-card.active');
      const season = activeEp ? activeEp.dataset.season : currentSeason;
      const episode = activeEp ? activeEp.dataset.episode : currentEpisode;
      if (iframe) iframe.src = getPlayerUrl(index, season, episode);
    });

    // Season selector
    document.getElementById('season-select')?.addEventListener('change', (e) => {
      const season = e.target.value;
      window.location.hash = `#/tv/${id}?season=${season}&episode=1`;
    });

    // Episode clicks
    document.getElementById('episode-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.episode-card');
      if (!card) return;
      const season = card.dataset.season;
      const episode = card.dataset.episode;

      // Update active state
      document.querySelectorAll('.episode-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      // Update player
      const iframe = document.getElementById('player-video');
      if (iframe) iframe.src = getPlayerUrl(currentSource, season, episode);

      // Update URL without reload
      history.replaceState(null, '', `#/tv/${id}?season=${season}&episode=${episode}`);

      // Update stat display
      const statEl = document.querySelector('.detail-stat:last-child');
      if (statEl) {
        statEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> S${season} E${episode}`;
      }
    });

    // Watchlist button handler
    document.getElementById('watchlist-toggle')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const added = toggleWatchlist({
        id: parseInt(id),
        type: 'tv',
        title: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average,
        first_air_date: show.first_air_date,
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
    console.error('TV page error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
        <p>Failed to load TV show. Please try again.</p>
      </div>
    `;
  }
}
