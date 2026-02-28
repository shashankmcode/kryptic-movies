// TMDB API client
const API_KEY = '38794fd417f1e4d997f8297557a52bf0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export const IMG = {
    poster: (path) => path ? `${IMG_BASE}/w500${path}` : null,
    backdrop: (path) => path ? `${IMG_BASE}/original${path}` : null,
    still: (path) => path ? `${IMG_BASE}/w300${path}` : null,
    posterSmall: (path) => path ? `${IMG_BASE}/w342${path}` : null,
};

async function request(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', API_KEY);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
    return res.json();
}

// ——— Movies ———

export function getTrending(mediaType = 'movie', timeWindow = 'week') {
    return request(`/trending/${mediaType}/${timeWindow}`);
}

export function getPopularMovies(page = 1) {
    return request('/movie/popular', { page });
}

export function getTopRatedMovies(page = 1) {
    return request('/movie/top_rated', { page });
}

export function getNowPlayingMovies(page = 1) {
    return request('/movie/now_playing', { page });
}

export function getMovieDetails(id) {
    return request(`/movie/${id}`, { append_to_response: 'credits,recommendations,videos' });
}

// ——— TV Shows ———

export function getPopularTV(page = 1) {
    return request('/tv/popular', { page });
}

export function getTopRatedTV(page = 1) {
    return request('/tv/top_rated', { page });
}

export function getTVDetails(id) {
    return request(`/tv/${id}`, { append_to_response: 'credits,recommendations' });
}

export function getTVSeasonDetails(tvId, seasonNumber) {
    return request(`/tv/${tvId}/season/${seasonNumber}`);
}

// ——— Search ———

export function searchMulti(query, page = 1) {
    return request('/search/multi', { query, page });
}

// ——— Video Sources ———

export const VIDEO_SOURCES = [
    {
        name: 'VidSrc Pro',
        movieUrl: (id) => `https://vidsrc.pro/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`,
    },
    {
        name: 'VidSrc.to',
        movieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    },
    {
        name: 'VidSrc.cc',
        movieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    },
    {
        name: 'VidLink',
        movieUrl: (id) => `https://vidlink.pro/movie/${id}?primaryColor=6c5ce7&poster=true&autoplay=false`,
        tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=6c5ce7&poster=true&autoplay=false`,
    },
    {
        name: 'MoviesAPI',
        movieUrl: (id) => `https://moviesapi.club/movie/${id}`,
        tvUrl: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
    },
    {
        name: '2Embed',
        movieUrl: (id) => `https://2embed.org/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://2embed.org/embed/tv/${id}/${s}/${e}`,
    },
    {
        name: 'AutoEmbed',
        movieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
        tvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
    },
    {
        name: 'SmashyStream',
        movieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
        tvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
    },
    {
        name: 'Embed.su',
        movieUrl: (id) => `https://embed.su/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
    },
    {
        name: 'NontonGo',
        movieUrl: (id) => `https://nontongo.win/embed/movie/${id}`,
        tvUrl: (id, s, e) => `https://nontongo.win/embed/tv/${id}/${s}/${e}`,
    },
];
