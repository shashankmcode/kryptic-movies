// Simple hash-based SPA router

const routes = [];
let currentCleanup = null;

export function addRoute(pattern, handler) {
    // Convert pattern like '/movie/:id' to regex
    const paramNames = [];
    const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });
    routes.push({
        regex: new RegExp(`^${regexStr}$`),
        paramNames,
        handler,
    });
}

export function navigateTo(path) {
    window.location.hash = path;
}

export function getQueryParams() {
    const hash = window.location.hash.slice(1);
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    return Object.fromEntries(params.entries());
}

function getPath() {
    const hash = window.location.hash.slice(1) || '/';
    const qIndex = hash.indexOf('?');
    return qIndex === -1 ? hash : hash.slice(0, qIndex);
}

export function resolveRoute() {
    const path = getPath();
    const app = document.getElementById('app');

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    for (const route of routes) {
        const match = path.match(route.regex);
        if (match) {
            const params = {};
            route.paramNames.forEach((name, i) => {
                params[name] = decodeURIComponent(match[i + 1]);
            });
            const queryParams = getQueryParams();
            currentCleanup = route.handler(app, params, queryParams);

            // Update active nav link
            updateActiveNav(path);

            // Scroll to top
            window.scrollTo(0, 0);
            return;
        }
    }

    // 404
    app.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
      <p>Page not found</p>
    </div>
  `;
}

function updateActiveNav(path) {
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
        const page = link.dataset.page;
        if (page === 'home' && path === '/') link.classList.add('active');
        else if (page === 'movies' && path.startsWith('/movies')) link.classList.add('active');
        else if (page === 'tv' && (path === '/tv' || path.startsWith('/tv/'))) link.classList.add('active');
        else if (page === 'genre' && path.startsWith('/genre')) link.classList.add('active');
        else if (page === 'watchlist' && path === '/watchlist') link.classList.add('active');
    });
}

export function initRouter() {
    window.addEventListener('hashchange', resolveRoute);
    // If no hash, set default
    if (!window.location.hash) {
        window.location.hash = '#/';
    } else {
        resolveRoute();
    }
}
