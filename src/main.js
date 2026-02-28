// Main entry — wires up router, search, mobile menu, back-to-top
import { addRoute, initRouter, navigateTo } from './router.js';
import renderHome from './pages/home.js';
import renderSearch from './pages/search.js';
import renderMovie from './pages/movie.js';
import renderTV from './pages/tv.js';
import renderMovies from './pages/movies.js';
import renderTVBrowse from './pages/tvbrowse.js';
import renderGenre from './pages/genre.js';
import renderWatchlist from './pages/watchlist.js';

// ——— Register routes ———
addRoute('/', renderHome);
addRoute('/search', renderSearch);
addRoute('/movie/:id', renderMovie);
addRoute('/tv/:id', renderTV);
addRoute('/movies', renderMovies);
addRoute('/tv', renderTVBrowse);
addRoute('/genre', renderGenre);
addRoute('/watchlist', renderWatchlist);

// ——— Search input handler ———
let searchTimeout;
const searchInput = document.getElementById('search-input');

searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);

    if (!query) return;

    searchTimeout = setTimeout(() => {
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
    }, 400);
});

searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            clearTimeout(searchTimeout);
            navigateTo(`/search?q=${encodeURIComponent(query)}`);
        }
    }
});

// ——— Header scroll effect ———
const header = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        header.style.background = 'rgba(10, 10, 15, 0.8)';
    }

    // Back to top visibility
    if (currentScroll > 500) {
        backToTop?.classList.add('visible');
    } else {
        backToTop?.classList.remove('visible');
    }
});

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ——— Mobile menu ———
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const nav = document.getElementById('nav');
const mobileOverlay = document.getElementById('mobile-overlay');

function toggleMobileMenu() {
    nav?.classList.toggle('open');
    mobileOverlay?.classList.toggle('open');
}

function closeMobileMenu() {
    nav?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
}

mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
mobileOverlay?.addEventListener('click', closeMobileMenu);

// Close mobile menu on nav link click
nav?.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        closeMobileMenu();
    }
});

// ——— Init ———
initRouter();
