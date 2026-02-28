// Movies browse page
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, IMG } from '../api.js';
import { createCards } from './home.js';

export default async function renderMovies(app) {
    app.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    try {
        const [popularData, topRatedData, nowPlayingData] = await Promise.all([
            getPopularMovies(),
            getTopRatedMovies(),
            getNowPlayingMovies(),
        ]);

        app.innerHTML = `
      <div class="category-page fade-in">
        <h1 class="section-title" style="font-size:var(--font-2xl);margin-bottom:var(--space-2xl);">
          Browse <span class="accent">Movies</span>
        </h1>

        <section class="section" style="padding-left:0;padding-right:0;">
          <div class="section-header">
            <h2 class="section-title">Popular <span class="accent">Now</span></h2>
          </div>
          <div class="card-grid">
            ${createCards(popularData.results || [], 'movie')}
          </div>
        </section>

        <section class="section" style="padding-left:0;padding-right:0;">
          <div class="section-header">
            <h2 class="section-title">Top <span class="accent">Rated</span></h2>
          </div>
          <div class="card-grid">
            ${createCards(topRatedData.results || [], 'movie')}
          </div>
        </section>

        <section class="section" style="padding-left:0;padding-right:0;">
          <div class="section-header">
            <h2 class="section-title">Now <span class="accent">Playing</span></h2>
          </div>
          <div class="card-grid">
            ${createCards(nowPlayingData.results || [], 'movie')}
          </div>
        </section>
      </div>
    `;
    } catch (err) {
        console.error('Movies page error:', err);
        app.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
        <p>Failed to load movies. Please try again.</p>
      </div>
    `;
    }
}
