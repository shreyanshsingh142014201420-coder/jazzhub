import React, { useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ExternalLink,
  Server,
  ArrowLeft,
  RefreshCw,
  Film,
  Tv,
  Radio
} from 'lucide-react';

/**
 * Normalizes media type across routing conventions
 * (e.g., standardizing 'tv', 'show', 'series' -> 'series' or 'tv')
 */
const normalizeMediaType = (rawType, target = 'series') => {
  if (!rawType) return 'movie';
  const clean = rawType.toLowerCase().trim();
  if (['tv', 'series', 'shows', 'show'].includes(clean)) {
    return target === 'series' ? 'series' : 'tv';
  }
  return 'movie';
};

/**
 * Modular Mirror Registry: Slot in any new mirror by appending an object
 */
const MIRROR_REGISTRY = [
  {
    id: 'shuttletv',
    name: 'ShuttleTV',
    domain: 'shuttletv.su',
    quality: '1080p Ultra',
    cdn: 'Fast CDN',
    status: 'Active',
    ping: '18ms',
    accent: 'from-amber-500/10 to-transparent',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type, 'series');
      return `https://shuttletv.su/?media=${normalizedType}-${id}`;
    }
  },
  {
    id: 'flickystream',
    name: 'FlickyStream',
    domain: 'flickystream.mov',
    quality: '1080p High',
    cdn: 'Edge Tier-1',
    status: 'Active',
    ping: '24ms',
    accent: 'from-sky-500/10 to-transparent',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type, 'series');
      return `https://flickystream.mov/${normalizedType}/${id}`;
    }
  },
  {
    id: 'popcornmovies',
    name: 'PopcornMovies',
    domain: 'popcornmovies.ac',
    quality: '4K / 1080p',
    cdn: 'Global Mesh',
    status: 'Active',
    ping: '31ms',
    accent: 'from-emerald-500/10 to-transparent',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type, 'series');
      return `https://popcornmovies.ac/${normalizedType}/${id}`;
    }
  },
  {
    id: 'mirror4',
    name: 'Backup Node (Mirror 4)',
    domain: 'streamnode.cx',
    quality: '1080p Direct',
    cdn: 'Failover CDN',
    status: 'Standby',
    ping: '42ms',
    accent: 'from-purple-500/10 to-transparent',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type, 'series');
      const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MIRROR_4_URL)
        ? import.meta.env.VITE_MIRROR_4_URL.replace(/\/$/, '')
        : 'https://streamnode.cx';
      return `${base}/${normalizedType}/${id}`;
    }
  }
];

/**
 * CinemaFallbackPlayer Component
 * 
 * Production-ready React streaming player with seamless failover
 * to a 4-mirror grid when the stream fails or is unavailable.
 */
export default function CinemaFallbackPlayer({
  streamUrl,
  title = 'Now Playing',
  type: propType,
  id: propId,
  poster,
  onRetry
}) {
  const params = useParams();

  // Resolve media type and ID from route params (/watch/:type/:id) or direct props
  const resolvedType = propType || params.type || (params.season ? 'tv' : 'movie');
  const resolvedId = propId || params.id || '1153576';

  // Player view states: 'PLAYER' | 'UNAVAILABLE' | 'MIRROR_GRID'
  const [viewState, setViewState] = useState(streamUrl ? 'PLAYER' : 'UNAVAILABLE');
  const [prevStreamUrl, setPrevStreamUrl] = useState(streamUrl);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const videoRef = useRef(null);

  // Sync state if streamUrl changes during navigation without cascading effect
  if (streamUrl !== prevStreamUrl) {
    setPrevStreamUrl(streamUrl);
    setViewState(streamUrl ? 'PLAYER' : 'UNAVAILABLE');
    setErrorMessage('');
  }

  // Handle native HTML5 video error & network failure events
  const handleVideoError = (event) => {
    const error = event?.currentTarget?.error;
    let description = 'The media stream could not be loaded or network connection failed.';

    if (error) {
      switch (error.code) {
        case 1:
          description = 'Stream playback aborted by the browser.';
          break;
        case 2:
          description = 'Network error caused stream download to fail.';
          break;
        case 3:
          description = 'Media decoding error or corrupted stream format.';
          break;
        case 4:
          description = 'Stream format not supported or remote server returned 404/403.';
          break;
        default:
          description = error.message || description;
      }
    }

    setErrorMessage(description);
    setViewState('UNAVAILABLE');
  };

  const handleManualRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    }
    setTimeout(() => {
      setIsRetrying(false);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 750);
  };

  // Generate resolved links for all 4 mirrors
  const mirrorLinks = useMemo(() => {
    return MIRROR_REGISTRY.map((mirror) => ({
      ...mirror,
      targetUrl: mirror.buildUrl(resolvedType, resolvedId)
    }));
  }, [resolvedType, resolvedId]);

  return (
    <div className="relative w-full aspect-video bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center font-sans select-none">
      
      {/* ==================================================================== */}
      {/* STATE 1: ACTIVE VIDEO PLAYER (STREAMING)                             */}
      {/* ==================================================================== */}
      {viewState === 'PLAYER' && streamUrl && (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={streamUrl}
            poster={poster}
            controls
            playsInline
            className="w-full h-full object-contain"
            onError={handleVideoError}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 2: PLAYBACK UNAVAILABLE (CINEMATIC FALLBACK CALLOUT)           */}
      {/* ==================================================================== */}
      {viewState === 'UNAVAILABLE' && (
        <div className="relative z-10 w-full h-full p-6 flex flex-col items-center justify-center text-center bg-radial from-neutral-900/80 via-neutral-950 to-black animate-fade-in">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-red-950/10 pointer-events-none blur-3xl rounded-full transform -translate-y-12" />

          {/* Warning Icon Badge */}
          <div className="w-16 h-16 mb-4 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center shadow-lg shadow-red-950/50 group">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          {/* Headline & Description */}
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Playback Unavailable
          </h2>
          <p className="text-sm text-neutral-400 max-w-md leading-relaxed mb-6">
            {errorMessage || (
              <>
                The direct media stream for <span className="text-neutral-200 font-medium">{title}</span> is temporarily offline or unreachable in your region.
              </>
            )}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setViewState('MIRROR_GRID')}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Check Availability</span>
            </button>

            <button
              type="button"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="px-4 py-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin text-red-400' : ''}`} />
              <span>{isRetrying ? 'Checking...' : 'Retry Stream'}</span>
            </button>
          </div>

          {/* Media Info Footer Badge */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-neutral-500">
            {normalizeMediaType(resolvedType) === 'series' ? (
              <Tv className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Film className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="capitalize">{normalizeMediaType(resolvedType)} ID:</span>
            <span className="font-mono text-neutral-400">{resolvedId}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 3: 2x2 MIRROR SELECTION GRID                                   */}
      {/* ==================================================================== */}
      {viewState === 'MIRROR_GRID' && (
        <div className="relative z-10 w-full h-full p-5 sm:p-6 flex flex-col justify-between bg-neutral-950/95 backdrop-blur-md animate-fade-in overflow-y-auto">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewState('UNAVAILABLE')}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Back to error view"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>Available Mirror Gateways</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono tracking-wide rounded-full bg-red-950/50 text-red-400 border border-red-800/40">
                    4 Online
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Select an alternate provider node to stream {title}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/60 px-2.5 py-1 rounded-md border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Routing: {normalizeMediaType(resolvedType)}-{resolvedId}</span>
            </div>
          </div>

          {/* 2x2 Mirror Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 flex-1 items-center">
            {mirrorLinks.map((mirror) => (
              <a
                key={mirror.id}
                href={mirror.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br ${mirror.accent} bg-neutral-900/50 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60 text-left`}
              >
                {/* Card Top: Name, Domain & Direct Link Icon */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
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

                  <div className="p-1 rounded-md bg-neutral-950/40 text-neutral-500 group-hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Card Bottom: Metrics & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-800/60 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mirror.badgeColor}`}>
                      {mirror.quality}
                    </span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800/80">
                      {mirror.cdn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{mirror.ping}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer Back & Instructions */}
          <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => setViewState('UNAVAILABLE')}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to player status</span>
            </button>

            <span className="hidden sm:inline">
              External mirror links open securely in a separate browser tab.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
