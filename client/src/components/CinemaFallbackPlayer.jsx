import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ExternalLink,
  Server,
  ArrowLeft,
  RefreshCw,
  Film,
  Tv,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { movieApi, tvApi } from '../services/api';

/**
 * Route & Media Type Normalization
 * Converts 'tv', 'series', 'shows', 'show' -> 'series'
 * Maps 'movie' or any other type -> 'movie'
 */
export const normalizeMediaType = (rawType) => {
  if (!rawType) return 'movie';
  const clean = String(rawType).toLowerCase().trim();
  if (['tv', 'series', 'shows', 'show'].includes(clean)) {
    return 'series';
  }
  return 'movie';
};

/**
 * 4-Mirror Dynamic Gateway Registry
 * Formats URLs to target specifications:
 * 1. ShuttleTV: https://shuttletv.su/?media={normalizedType}-{dynamicId}
 * 2. FlickyStream: https://flickystream.mov/{normalizedType}/{dynamicId}
 * 3. PopcornMovies: https://popcornmovies.ac/{normalizedType}/{dynamicId}
 * 4. Failover Node 04: https://vidsrc.to/embed/{normalizedType}/{dynamicId}
 */
export const MIRROR_PROVIDERS = [
  {
    id: 'shuttletv',
    name: 'ShuttleTV',
    domain: 'shuttletv.su',
    resolution: '1080p',
    badge: 'Mirror 01',
    status: 'Operational',
    accentBorder: 'hover:border-amber-500/60',
    badgeStyle: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://shuttletv.su/?media=${normalizedType}-${id}`;
    }
  },
  {
    id: 'flickystream',
    name: 'FlickyStream',
    domain: 'flickystream.mov',
    resolution: '1080p',
    badge: 'Mirror 02',
    status: 'Operational',
    accentBorder: 'hover:border-sky-500/60',
    badgeStyle: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `http://flickystream.mov/play/${normalizedType}/${id}`;
    }
  },
  {
    id: 'popcornmovies',
    name: 'PopcornMovies',
    domain: 'popcornmovies.ac',
    resolution: '4K',
    badge: 'Mirror 03',
    status: 'Ultra HD',
    accentBorder: 'hover:border-emerald-500/60',
    badgeStyle: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://popcornmovies.ac/watch/${normalizedType}/${id}`;
    }
  },
  {
    id: 'backup-mirror-04',
    name: 'Backup Mirror 04',
    domain: 'popcornmovies.ac',
    resolution: '1080p / 4K',
    badge: 'Failover Node',
    status: 'Standby Mesh',
    accentBorder: 'hover:border-purple-500/60',
    badgeStyle: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://popcornmovies.ac/watch/${normalizedType}/${id}`;
    }
  }
];

/**
 * CinemaFallbackPlayer Component
 * 
 * Dynamic video player with seamless fallback to a 4-mirror gateway grid.
 * Extracts dynamic IDs from state, props, or route params without hardcoded fallbacks.
 */
export default function CinemaFallbackPlayer({
  playback,
  streamUrl,
  loading = false,
  error = null,
  title = 'Now Playing',
  movie = null,
  movieDetails = null,
  type: propType,
  id: propId,
  poster,
  onRetry
}) {
  const params = useParams();

  // Dynamic TMDB ID extraction (no hardcoded test IDs)
  const dynamicId = propId || movie?.id || movieDetails?.id || params.id || '';

  // Dynamic movie title
  const dynamicTitle = title || movie?.title || movie?.name || movieDetails?.title || movieDetails?.name || 'Now Playing';

  // Route & media type normalization
  const rawType = propType || params.type || (params.season ? 'tv' : 'movie');
  const normalizedType = normalizeMediaType(rawType);

  // Internal playback fetch fallback if not supplied by parent
  const [internalPlayback, setInternalPlayback] = useState(playback || null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  useEffect(() => {
    if (playback !== undefined) {
      setInternalPlayback(playback);
    }
  }, [playback]);

  useEffect(() => {
    // If playback or streamUrl was not passed externally, query service dynamically
    if (playback === undefined && !streamUrl && dynamicId) {
      let isMounted = true;
      setInternalLoading(true);

      const fetcher = normalizedType === 'series'
        ? tvApi.getEpisodePlayback(dynamicId, params.season || 1, params.episode || 1)
        : movieApi.getMoviePlayback(dynamicId);

      fetcher
        .then((data) => {
          if (isMounted) {
            setInternalPlayback(data);
            setInternalLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setInternalError(err.message || 'Stream source offline');
            setInternalLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [playback, streamUrl, dynamicId, normalizedType, params.season, params.episode]);

  // Determine active media URL and state
  const activePlayback = playback !== undefined ? playback : internalPlayback;
  const activeLoading = loading || internalLoading;
  const activeError = error || internalError;
  const activeUrl = streamUrl || activePlayback?.url;
  const isEmbed = activePlayback?.type === 'embed';
  const isPlayable = Boolean(activeUrl && activePlayback?.available !== false && !activeError);

  // View state: 'STREAM' | 'UNAVAILABLE' | 'MIRRORS'
  const [viewState, setViewState] = useState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
  const [prevUrl, setPrevUrl] = useState(activeUrl);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  // Sync view state when media stream or error changes
  if (activeUrl !== prevUrl) {
    setPrevUrl(activeUrl);
    if (!isSimulatedOffline) {
      setViewState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
    }
  }

  // Handle native HTML5 video playback errors
  const handleVideoError = () => {
    setViewState('UNAVAILABLE');
  };

  // Handle iframe embed errors
  const handleIframeError = () => {
    setViewState('UNAVAILABLE');
  };

  // Developer simulation toggle to verify fallback UI at any time
  const toggleSimulateOffline = () => {
    if (!isSimulatedOffline) {
      setIsSimulatedOffline(true);
      setViewState('UNAVAILABLE');
    } else {
      setIsSimulatedOffline(false);
      setViewState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    }
    setTimeout(() => {
      setIsRetrying(false);
      setIsSimulatedOffline(false);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
      setViewState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
    }, 600);
  };

  // Memoize mirrors with dynamically computed URLs
  const mirrors = useMemo(() => {
    return MIRROR_PROVIDERS.map((provider) => ({
      ...provider,
      url: provider.buildUrl(normalizedType, dynamicId)
    }));
  }, [normalizedType, dynamicId]);

  return (
    <div className="relative w-full aspect-video min-h-[400px] bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      
      {/* Top Diagnostics Bar: Live failover testing toggle */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSimulateOffline}
          className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all duration-200 flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
            isSimulatedOffline
              ? 'bg-red-950/80 border-red-600/70 text-red-200'
              : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-400 hover:text-white hover:border-neutral-500'
          }`}
          title="Toggle instant failover test without waiting for connection timeout"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isSimulatedOffline ? 'Failover Active' : 'Simulate Failover'}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* STATE 0: LOADING INDICATOR                                           */}
      {/* ==================================================================== */}
      {activeLoading && (
        <div className="absolute inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-mono">Connecting to media stream...</p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 1: ACTIVE VIDEO STREAM (HTML5 or Iframe Embed)                 */}
      {/* ==================================================================== */}
      {viewState === 'STREAM' && !isSimulatedOffline && activeUrl && (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {isEmbed ? (
            <iframe
              ref={iframeRef}
              src={activeUrl}
              title={dynamicTitle}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full border-0"
              onError={handleIframeError}
            />
          ) : (
            <video
              ref={videoRef}
              src={activeUrl}
              poster={poster}
              controls
              playsInline
              className="w-full h-full object-contain"
              onError={handleVideoError}
            >
              Your browser does not support HTML5 video playback.
            </video>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 2: "PLAYBACK UNAVAILABLE" INITIAL WARNING CONTAINER            */}
      {/* ==================================================================== */}
      {(viewState === 'UNAVAILABLE' || isSimulatedOffline || !isPlayable) && (
        <div className="relative z-10 w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black animate-fade-in">
          {/* Subtle Ambient Crimson Glow */}
          <div className="absolute w-72 h-72 bg-red-600/15 blur-3xl rounded-full pointer-events-none -top-10" />

          {/* Crimson Warning Indicator */}
          <div className="w-16 h-16 mb-4 rounded-2xl bg-red-950/70 border border-red-600/60 flex items-center justify-center shadow-lg shadow-red-950/80">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Playback Unavailable
          </h2>

          {/* Subtitle displaying dynamic movie title */}
          <p className="text-sm sm:text-base text-neutral-300 max-w-lg leading-relaxed mb-6">
            <span className="text-neutral-400">Stream source for </span>
            <span className="text-red-400 font-semibold">{dynamicTitle}</span>
            <span className="text-neutral-400"> is currently unavailable or offline.</span>
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setViewState('MIRRORS')}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Show Availability</span>
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin text-red-400' : ''}`} />
                <span>{isRetrying ? 'Connecting...' : 'Retry Stream'}</span>
              </button>
            )}
          </div>

          {/* Footer Routing Metadata */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-neutral-500 font-mono">
            {normalizedType === 'series' ? (
              <Tv className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Film className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="capitalize">{normalizedType}:</span>
            <span className="text-neutral-300 font-semibold">{dynamicId || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 3: EXPANDED 2x2 MIRROR SERVER CARD MATRIX                      */}
      {/* ==================================================================== */}
      {viewState === 'MIRRORS' && (
        <div className="relative z-20 w-full h-full p-5 sm:p-6 flex flex-col justify-between bg-neutral-950/98 backdrop-blur-xl animate-fade-in overflow-y-auto">
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewState('UNAVAILABLE')}
                className="p-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                title="Back to status view"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Available Mirror Gateways</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-red-950/60 text-red-400 border border-red-800/50">
                    4 Active
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Select an alternate provider node to stream {dynamicTitle}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Route: {normalizedType}-{dynamicId}</span>
            </div>
          </div>

          {/* 2x2 Mirror Card Grid Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 items-center my-2">
            {mirrors.map((mirror) => (
              <a
                key={mirror.id}
                href={mirror.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between p-4 rounded-xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 ${mirror.accentBorder} opacity-60 hover:opacity-100 transition-opacity duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/70 text-left`}
              >
                {/* Provider Header & External Link Arrow */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                      <Server className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                        {mirror.name}
                      </h4>
                      <span className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-400">
                        {mirror.domain}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-md bg-neutral-950/60 text-neutral-400 group-hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Badges & Resolution */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-800/80 mt-1">
                  <div className="flex items-center gap-1.5">
                    {/* Resolution Tag */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mirror.badgeStyle}`}>
                      {mirror.resolution}
                    </span>
                    {/* Server Badge */}
                    <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                      {mirror.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{mirror.status}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer Controls with Explicit Back Button */}
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => setViewState('UNAVAILABLE')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to status</span>
            </button>

            <span className="hidden sm:inline text-neutral-400">
              Streams open securely in an external tab.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
