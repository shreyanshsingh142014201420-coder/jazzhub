// JazzHub Frontend API Service
// Talks strictly to the Express backend (/api), never directly with TMDB or provider domains.

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody.message || errBody.error) {
        errMsg = errBody.message || errBody.error;
      }
    } catch {
      // Ignore json parse error
    }
    const err = new Error(errMsg);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// ----------------------------------------------------
// MOVIES API
// ----------------------------------------------------
export const movieApi = {
  getTrending: async (timeWindow = 'week') => {
    const data = await request('/api/movies/trending', { time_window: timeWindow });
    return data.data || [];
  },

  getPopular: async (page = 1) => {
    const data = await request('/api/movies/popular', { page });
    return data.data || [];
  },

  getTopRated: async (page = 1) => {
    const data = await request('/api/movies/top-rated', { page });
    return data.data || [];
  },

  getUpcoming: async (page = 1) => {
    const data = await request('/api/movies/upcoming', { page });
    return data.data || [];
  },

  searchMovies: async (query, page = 1) => {
    if (!query || !query.trim()) return [];
    const data = await request('/api/movies/search', { query: query.trim(), page, type: 'movie' });
    return data.data || [];
  },

  getMovieDetails: async (id) => {
    const data = await request(`/api/movies/${id}`);
    return data.data || null;
  },

  getSimilarMovies: async (id) => {
    const data = await request(`/api/movies/${id}/similar`);
    return data.data || [];
  },

  // Movie Playback
  getMoviePlayback: async (id) => {
    return await request(`/api/movies/${id}/playback`);
  }
};

// ----------------------------------------------------
// TV SERIES & ANIME API
// ----------------------------------------------------
export const tvApi = {
  getTrending: async (timeWindow = 'week') => {
    const data = await request('/api/tv/trending', { time_window: timeWindow });
    return data.data || [];
  },

  getPopular: async (page = 1) => {
    const data = await request('/api/tv/popular', { page });
    return data.data || [];
  },

  getTopRated: async (page = 1) => {
    const data = await request('/api/tv/top-rated', { page });
    return data.data || [];
  },

  getAnime: async (page = 1) => {
    const data = await request('/api/tv/anime', { page });
    return data.data || [];
  },

  getTVDetails: async (id) => {
    const data = await request(`/api/tv/${id}`);
    return data.data || null;
  },

  getSeasonDetails: async (id, season) => {
    const data = await request(`/api/tv/${id}/season/${season}`);
    return data.data || null;
  },

  // TV / Anime Episode Playback
  getEpisodePlayback: async (id, season, episode) => {
    return await request(`/api/tv/${id}/${season}/${episode}/playback`);
  }
};

// ----------------------------------------------------
// MULTI-SEARCH (Movies, TV, Anime)
// ----------------------------------------------------
export const searchApi = {
  search: async (query, type = 'multi', page = 1) => {
    if (!query || !query.trim()) return [];
    const data = await request('/api/movies/search', { query: query.trim(), type, page });
    return data.data || [];
  }
};
