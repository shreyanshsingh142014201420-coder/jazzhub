// TMDB Image URL utility for JazzHub

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Sleek fallback SVG for missing posters
const FALLBACK_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23131622'/%3E%3Cstop offset='100%25' stop-color='%231c2236'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='500' height='750' fill='url(%23g)'/%3E%3Ccircle cx='250' cy='330' r='50' fill='%23f59e0b' fill-opacity='0.2' stroke='%23f59e0b' stroke-width='3'/%3E%3Cpolygon points='240,310 270,330 240,350' fill='%23f59e0b'/%3E%3Ctext x='250' y='430' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EJazzHub Cinema%3C/text%3E%3Ctext x='250' y='465' font-family='sans-serif' font-size='16' fill='%2364748b' text-anchor='middle'%3EPoster Unavailable%3C/text%3E%3C/svg%3E";

// Sleek fallback SVG for missing backdrops
const FALLBACK_BACKDROP = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2307080c'/%3E%3Cstop offset='100%25' stop-color='%23131622'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1280' height='720' fill='url(%23bg)'/%3E%3Ctext x='640' y='360' font-family='sans-serif' font-size='32' font-weight='bold' fill='%23f59e0b' text-anchor='middle'%3EJazzHub Cinematic Experience%3C/text%3E%3C/svg%3E";

/**
 * Constructs a full TMDB poster URL
 * @param {string} path - The TMDB poster_path (e.g. "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg")
 * @param {string} size - TMDB image size (e.g. 'w500', 'w342', 'w780')
 * @returns {string} - Full image URL or fallback
 */
export function getPosterUrl(path, size = 'w500') {
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Constructs a full TMDB backdrop URL
 * @param {string} path - The TMDB backdrop_path
 * @param {string} size - TMDB image size (e.g. 'w1280', 'original')
 * @returns {string} - Full image URL or fallback
 */
export function getBackdropUrl(path, size = 'w1280') {
  if (!path) return FALLBACK_BACKDROP;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
