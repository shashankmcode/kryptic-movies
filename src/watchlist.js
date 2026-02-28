// Watchlist — localStorage-based favorites
const STORAGE_KEY = 'kryptic_watchlist';

function getWatchlist() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWatchlist(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function isInWatchlist(id, type) {
    return getWatchlist().some((item) => item.id === id && item.type === type);
}

export function toggleWatchlist(item) {
    const list = getWatchlist();
    const idx = list.findIndex((i) => i.id === item.id && i.type === item.type);

    if (idx !== -1) {
        list.splice(idx, 1);
        saveWatchlist(list);
        return false; // removed
    } else {
        list.unshift({
            id: item.id,
            type: item.type,
            title: item.title,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
        });
        saveWatchlist(list);
        return true; // added
    }
}

export function getWatchlistItems() {
    return getWatchlist();
}

// Watchlist button HTML
export function watchlistButtonHTML(id, type) {
    const added = isInWatchlist(id, type);
    const heartFill = added
        ? `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    return `<button class="watchlist-btn ${added ? 'added' : ''}" id="watchlist-toggle">${heartFill} ${added ? 'In My List' : 'Add to List'}</button>`;
}

// Show toast notification
export function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
