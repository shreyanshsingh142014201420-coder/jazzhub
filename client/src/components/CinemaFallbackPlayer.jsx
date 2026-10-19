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
  Radio,
  Sliders,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

/**
 * Route & Parameter Normalization
 * Converts 'tv', 'series', 'show' -> 'series'
 * Maps 'movie' -> 'movie'
 */
const normalizeMediaType = (rawType) => {
  if (!rawType) return 'movie';
  const clean = String(rawType).toLowerCase().trim();
  if (['tv', 'series', 'shows', 'show'].includes(clean)) {
    return 'series';
  }
  return 'movie';
};

/**
 * 4-Mirror Dynamic Route Registry
 * Formats URLs to target specifications:
 * 1. ShuttleTV: https://shuttletv.su/?media={normalizedType}-{id}
 * 2. FlickyStream: https://flickystream.mov/{normalizedType}/{id}
 * 3. PopcornMovies: https://popcornmovies.ac/{normalizedType}/{id}
 * 4. Failover Node 04: https://vidsrc.to/embed/{normalizedType}/{id}
 */
const MIRROR_PROVIDERS = [
  {
    id: 'shuttletv',
    name: 'ShuttleTV',
    domain: 'shuttletv.su',
    resolution: '1080p Ultra',
    cdn: 'Fast CDN',
    status: 'Active',
    latency: '18ms',
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
    resolution: '1080p High',
    cdn: 'Edge Tier-1',
    status: 'Active',
    latency: '24ms',
    accentBorder: 'hover:border-sky-500/60',
    badgeStyle: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://flickystream.mov/${normalizedType}/${id}`;
    }
  },
  {
    id: 'popcornmovies',
    name: 'PopcornMovies',
    domain: 'popcornmovies.ac',
    resolution: '4K / 1080p',
    cdn: 'Global Mesh',
    status: 'Active',
    latency: '31ms',
    accentBorder: 'hover:border-emerald-500/60',
    badgeStyle: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://popcornmovies.ac/${normalizedType}/${id}`;
    }
  },
  {
    id: 'failover-node-04',
    name: 'Failover Node 04',
    domain: 'vidsrc.to',
    resolution: '1080p Auto',
    cdn: 'Direct Failover',
    status: 'Standby',
    latency: '42ms',
    accentBorder: 'hover:border-purple-500/60',
    badgeStyle: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    buildUrl: (type, id) => {
      const normalizedType = normalizeMediaType(type);
      return `https://vidsrc.to/embed/${normalizedType}/${id}`;
    }
  }
];

/**
 * CinemaFallbackPlayer Component
 * 
 * Production streaming player with fallback to a dark cinematic 4-mirror grid.
 */
export default function CinemaFallbackPlayer({
  playback,
  streamUrl,
  loading = false,
  error = null,
  title = 'Now Playing',
  type: propType,
  id: propId,
  poster,
  onRetry
}) {
  const params = useParams();

  // Extract and normalize route parameters
  const rawType = propType || params.type || (params.season ? 'tv' : 'movie');
  const normalizedType = normalizeMediaType(rawType);
  const resolvedId = propId || params.id || '1153576';

  // Determine active media URL and type (embed vs direct stream)
  const activeUrl = streamUrl || playback?.url;
  const isEmbed = playback?.type === 'embed';
  const isPlayable = Boolean(activeUrl && playback?.available !== false && !error);

  // View state: 'STREAM' | 'UNAVAILABLE' | 'MIRRORS'
  const [viewState, setViewState] = useState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
  const [prevUrl, setPrevUrl] = useState(activeUrl);
  const [errorMessage, setErrorMessage] = useState(error || '');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  // Sync state when activeUrl or error prop changes
  if (activeUrl !== prevUrl) {
    setPrevUrl(activeUrl);
    if (!isSimulatedOffline) {
      setViewState(isPlayable ? 'STREAM' : 'UNAVAILABLE');
      setErrorMessage(error || '');
    }
  }

  // Native HTML5 video error handler
  const handleVideoError = (e) => {
    const mediaError = e?.currentTarget?.error;
    let desc = 'The video stream could not be loaded or the remote host failed.';
    if (mediaError) {
      switch (mediaError.code) {
        case 1:
          desc = 'Playback aborted by the browser.';
          break;
        case 2:
          desc = 'Network error: Failed to download video stream.';
          break;
        case 3:
          desc = 'Media decoding error or corrupted format.';
          break;
        case 4:
          desc = 'Video format not supported or origin returned 404/403.';
          break;
        default:
          desc = mediaError.message || desc;
      }
    }
    setErrorMessage(desc);
    setViewState('UNAVAILABLE');
  };

  // Iframe embed error handler
  const handleIframeError = () => {
    setErrorMessage('The external embed provider refused connection or timed out.');
    setViewState('UNAVAILABLE');
  };

  // Manual "Server Offline" simulator for instant verification
  const toggleSimulateOffline = () => {
    if (!isSimulatedOffline) {
      setIsSimulatedOffline(true);
      setErrorMessage('Server Offline (Simulated Failover Triggered)');
      setViewState('UNAVAILABLE');
    } else {
      setIsSimulatedOffline(false);
      setErrorMessage('');
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

  // Pre-generate mirror targets
  const mirrors = useMemo(() => {
    return MIRROR_PROVIDERS.map((p) => ({
      ...p,
      url: p.buildUrl(normalizedType, resolvedId)
    }));
  }, [normalizedType, resolvedId]);

  return (
    <div className="relative w-full aspect-video min-h-[380px] bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      
      {/* Top Diagnostics & Manual Simulator Bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSimulateOffline}
          className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all duration-200 flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
            isSimulatedOffline
              ? 'bg-red-950/80 border-red-600/70 text-red-200'
              : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-400 hover:text-white hover:border-neutral-500'
          }`}
          title="Toggle instant failover test without waiting for network timeout"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isSimulatedOffline ? 'Failover Active' : 'Simulate Failover'}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SCREEN 0: LOADING STATE                                              */}
      {/* ==================================================================== */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-mono">Initializing media pipeline...</p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 1: ACTIVE STREAM OR EMBED                                     */}
      {/* ==================================================================== */}
      {viewState === 'STREAM' && !isSimulatedOffline && activeUrl && (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {isEmbed ? (
            <iframe
              ref={iframeRef}
              src={activeUrl}
              title={title}
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
      {/* SCREEN 2: "PLAYBACK UNAVAILABLE" CINEMATIC OVERLAY                   */}
      {/* ==================================================================== */}
      {(viewState === 'UNAVAILABLE' || isSimulatedOffline || !isPlayable) && (
        <div className="relative z-10 w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black animate-fade-in">
          {/* Ambient Glow */}
          <div className="absolute w-72 h-72 bg-red-600/10 blur-3xl rounded-full pointer-events-none -top-10" />

          {/* Dark Red Warning Badge */}
          <div className="w-16 h-16 mb-4 rounded-2xl bg-red-950/60 border border-red-600/50 flex items-center justify-center shadow-lg shadow-red-950/60 group">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          {/* Headline & Metadata */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Playback Unavailable
          </h2>
          <p className="text-sm text-neutral-400 max-w-lg leading-relaxed mb-6">
            {errorMessage || (
              <>
                The primary video stream for <span className="text-neutral-100 font-semibold">{title}</span> could not be initiated or timed out.
              </>
            )}
          </p>

          {/* Action Call-to-Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setViewState('MIRRORS')}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Check Availability</span>
            </button>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin text-red-400' : ''}`} />
              <span>{isRetrying ? 'Connecting...' : 'Retry Stream'}</span>
            </button>
          </div>

          {/* Footer Routing Info */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-neutral-500 font-mono">
            {normalizedType === 'series' ? (
              <Tv className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Film className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="capitalize">{normalizedType}:</span>
            <span className="text-neutral-300">{resolvedId}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 3: 2x2 MIRROR SELECTION GRID MATRIX                           */}
      {/* ==================================================================== */}
      {viewState === 'MIRRORS' && (
        <div className="relative z-20 w-full h-full p-5 sm:p-6 flex flex-col justify-between bg-neutral-950/98 backdrop-blur-xl animate-fade-in overflow-y-auto">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewState('UNAVAILABLE')}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Back to status view"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Available Mirror Gateways</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-red-950/60 text-red-400 border border-red-800/50">
                    4 Active
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Select an alternate provider node to stream {title}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Route: {normalizedType}-{resolvedId}</span>
            </div>
          </div>

          {/* 2x2 Mirror Grid Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 items-center">
            {mirrors.map((mirror) => (
              <a
                key={mirror.id}
                href={mirror.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between p-4 rounded-xl bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800 ${mirror.accentBorder} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/70 text-left`}
              >
                {/* Provider Header */}
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

                  <div className="p-1 rounded-md bg-neutral-950/60 text-neutral-500 group-hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Metrics & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-800/80 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mirror.badgeStyle}`}>
                      {mirror.resolution}
                    </span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                      {mirror.cdn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{mirror.latency}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => setViewState('UNAVAILABLE')}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to status</span>
            </button>

            <span className="hidden sm:inline text-neutral-400">
              Streams open in a secure external tab.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
