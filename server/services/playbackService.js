// JazzHub Playback Service & Provider Adapter
// Decoupled layer that hides provider implementation details from the frontend.
// Strictly compliant: Never bypasses DRM, never scrapes unauthorized sites.
// Normalizes provider responses to:
//   { available: true, type: "video" | "embed", url: "..." }
// or:
//   { available: false, type: null, url: null, message: "..." }

import dotenv from 'dotenv';
dotenv.config();

const PLAYBACK_PROVIDER_URL = process.env.PLAYBACK_PROVIDER_URL || '';

// Public domain / Creative Commons authorized sample test streams (Blender Foundation / W3C)
// Used for verified testing and demo purposes
const DEMO_STREAMS = {
  movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  tv: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  anime: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
};

export const playbackService = {
  /**
   * Retrieves playback information for a movie by TMDB ID
   * @param {string|number} movieId - TMDB Movie ID
   * @returns {Promise<{available: boolean, type: string|null, url: string|null, message?: string}>}
   */
  getMoviePlayback: async (movieId) => {
    if (!movieId) {
      return {
        available: false,
        type: null,
        url: null,
        message: 'Invalid movie ID provided.'
      };
    }

    try {
      // 1. If an authorized playback provider URL is configured in environment
      if (PLAYBACK_PROVIDER_URL) {
        // Construct authorized endpoint
        const providerEndpoint = `${PLAYBACK_PROVIDER_URL.replace(/\/$/, '')}/movie/${movieId}`;

        // In a production setup with an external authorized provider, we would verify
        // or query the provider's API.
        // If the provider permits iframe embedding:
        return {
          available: true,
          type: 'embed',
          url: providerEndpoint
        };
      }

      // 2. Default: if no legitimate playback provider is configured, return clean unavailable response
      if (process.env.ALLOW_DEMO_PLAYBACK === 'true') {
        return {
          available: true,
          type: 'video',
          url: DEMO_STREAMS.movie,
          message: 'Streaming via authorized demo media source.'
        };
      }

      return {
        available: false,
        type: null,
        url: null,
        message: 'No authorized playback source is configured.'
      };
    } catch (err) {
      console.error(`[Playback Service] Error getting movie playback for ${movieId}:`, err.message);
      return {
        available: false,
        type: null,
        url: null,
        message: 'The playback provider returned an error or is unreachable.'
      };
    }
  },

  /**
   * Retrieves playback information for a TV or Anime episode
   * @param {string|number} seriesId - TMDB TV Series ID
   * @param {number} season - Season Number (e.g. 1)
   * @param {number} episode - Episode Number (e.g. 1)
   * @returns {Promise<{available: boolean, type: string|null, url: string|null, message?: string}>}
   */
  getEpisodePlayback: async (seriesId, season, episode) => {
    const s = parseInt(season, 10);
    const ep = parseInt(episode, 10);

    if (!seriesId || isNaN(s) || isNaN(ep) || s < 0 || ep < 1) {
      return {
        available: false,
        type: null,
        url: null,
        message: 'Invalid series, season, or episode identifier.'
      };
    }

    try {
      // 1. If an authorized playback provider URL is configured in environment
      if (PLAYBACK_PROVIDER_URL) {
        const providerEndpoint = `${PLAYBACK_PROVIDER_URL.replace(/\/$/, '')}/tv/${seriesId}/${s}/${ep}`;

        return {
          available: true,
          type: 'embed',
          url: providerEndpoint
        };
      }

      // 2. Default: if no legitimate playback provider is configured, return clean unavailable response
      if (process.env.ALLOW_DEMO_PLAYBACK === 'true') {
        return {
          available: true,
          type: 'video',
          url: DEMO_STREAMS.tv,
          message: 'Streaming via authorized demo media source.'
        };
      }

      return {
        available: false,
        type: null,
        url: null,
        message: 'No authorized playback source is configured.'
      };
    } catch (err) {
      console.error(`[Playback Service] Error getting episode playback for ${seriesId} S${season}E${episode}:`, err.message);
      return {
        available: false,
        type: null,
        url: null,
        message: 'The playback provider returned an error or is unreachable.'
      };
    }
  },

  /**
   * Debug function to inspect normalized provider response without exposing secrets
   */
  getDebugPlayback: async (mediaType, id, season = 1, episode = 1) => {
    let result;
    if (mediaType === 'movie') {
      result = await playbackService.getMoviePlayback(id);
    } else {
      result = await playbackService.getEpisodePlayback(id, season, episode);
    }

    return {
      ...result,
      provider: PLAYBACK_PROVIDER_URL ? 'custom-authorized-provider' : 'authorized-demo-stream',
      mediaType,
      id,
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined
    };
  }
};
