import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  AlertTriangle,
  Radio,
  Server,
  ExternalLink,
  Users
} from 'lucide-react';
import { movieApi, tvApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import jazzhubLogo from '../assets/hero.png';

/**
 * Cast Member Avatar & Info Card
 * Handles TMDB w185 profile photos with resilient fallback to actor initials
 */
function CastMemberCard({ person }) {
  const [imgError, setImgError] = useState(false);
  const name = typeof person === 'string' ? person : (person.name || 'Unknown');
  const character = typeof person === 'object' ? person.character : null;
  const profilePath = typeof person === 'object' ? person.profile_path : null;
  const imageUrl = profilePath ? `https://image.tmdb.org/t/p/w185${profilePath}` : null;

  // Compute initials for clean fallback avatar
  const initials = (name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex-shrink-0 w-24 sm:w-28 flex flex-col items-center text-center group select-none">
      {/* Circular Portrait Image with Fallback */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2 bg-neutral-900 border-2 border-neutral-800 group-hover:border-red-600/70 transition-all duration-200 shadow-lg relative flex items-center justify-center">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-950 text-neutral-300">
            <span className="font-bold text-sm tracking-wider">{initials || 'A'}</span>
          </div>
        )}
      </div>

      {/* Actor's Full Name */}
      <span
        className="w-full text-xs sm:text-sm font-semibold text-white truncate px-1 group-hover:text-red-400 transition-colors"
        title={name}
      >
        {name}
      </span>

      {/* Character / Role Name */}
      {character && (
        <span
          className="w-full text-[11px] text-neutral-400 truncate px-1"
          title={character}
        >
          {character}
        </span>
      )}
    </div>
  );
}

export default function WatchMovie() {
  const params = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // 1. Dynamic ID & Type Extraction
  const pathParts = (typeof window !== 'undefined' ? window.location.pathname : '').split('/').filter(Boolean);
  const extractedType = params.type || (pathParts[0] === 'watch' ? pathParts[1] : pathParts[0]) || 'movie';
  const extractedId = params.id || (pathParts[0] === 'watch' ? pathParts[2] : pathParts[1]) || '';

  // Normalize: "tv" or "series" -> "series". "movie" -> "movie"
  const type = ['tv', 'series', 'shows', 'show'].includes(String(extractedType).toLowerCase().trim())
    ? 'series'
    : 'movie';
  const id = extractedId;

  // 2. UI State
  const [showMirrors, setShowMirrors] = useState(false);
  const [movie, setMovie] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const videoRef = useRef(null);

  // 4 Mirrors Registry
  const MIRRORS = [
    {
      name: 'ShuttleTV',
      endpoint: '1080p Ultra',
      url: `https://shuttletv.su/?media=${type}-${id}`
    },
    {
      name: 'FlickyStream',
      endpoint: '1080p High',
      url: `http://flickystream.mov/play/${type}/${id}`
    },
    {
      name: 'PopcornMovies',
      endpoint: '4K Stream',
      url: `https://popcornmovies.ac/watch/${type}/${id}`
    },
    {
      name: 'Backup Mirror 04',
      endpoint: '1080p Auto',
      url: `https://popcornmovies.ac/watch/${type}/${id}`
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    async function loadWatchData() {
      setLoading(true);

      // Fetch Metadata & Credits gracefully
      try {
        const fetcher = type === 'series' ? tvApi.getTVDetails : movieApi.getMovieDetails;
        const mediaData = await fetcher(id).catch(() => null);
        if (isMounted && mediaData) {
          setMovie(mediaData);
        }
      } catch (err) {
        console.warn("Could not fetch media details:", err);
      }

      // Query Playback Stream
      try {
        const pbFetcher = type === 'series'
          ? () => tvApi.getEpisodePlayback(id, 1, 1)
          : () => movieApi.getMoviePlayback(id);
        const pb = await pbFetcher().catch(() => null);
        if (isMounted) {
          setPlayback(pb);
        }
      } catch (err) {
        console.warn("Playback error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadWatchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, type]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/movie/${id}`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  const rating = movie?.vote_average
    ? movie.vote_average.toFixed(1)
    : (movie?.rating || '8.5');

  const releaseYear = movie?.release_date
    ? movie.release_date.substring(0, 4)
    : movie?.first_air_date
    ? movie.first_air_date.substring(0, 4)
    : (movie?.year || '2026');

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const hasPlayableStream = Boolean(
    playback &&
    playback.available &&
    playback.url &&
    !videoError
  );

  // Extract Cast list
  const rawCast = movie?.credits?.cast || (Array.isArray(movie?.cast) ? movie.cast : []);
  const castList = rawCast.slice(0, 20);

  return (
    <div className="cinema-watch-experience">
      {/* Top Cinema Header Bar */}
      <div className="cinema-top-header">
        <button
          type="button"
          onClick={handleBack}
          className="cinema-back-action"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
          <span className="cinema-back-label">Back</span>
        </button>

        <div className="cinema-title-center">
          <span className="cinema-live-dot"></span>
          <h1 className="cinema-headline-text">
            {movie?.title || movie?.name || `Streaming Media #${id}`}
          </h1>
        </div>

        <Link to="/" className="cinema-brand-link" aria-label="JazzHub Home">
          <img src={jazzhubLogo} alt="JazzHub" className="cinema-brand-logo-img" />
          <span className="cinema-brand-name">JAZZ<span className="brand-highlight">HUB</span></span>
        </Link>
      </div>

      {/* Main Video Viewport & Fallback Container */}
      <div className="cinema-stage-viewport">
        {loading ? (
          <div className="w-full aspect-video min-h-[380px] bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-400 font-mono">Initializing media pipeline...</p>
          </div>
        ) : hasPlayableStream ? (
          /* Active Stream (HTML5 Video or Embed) */
          <div className="relative w-full aspect-video min-h-[380px] bg-black rounded-xl overflow-hidden border border-neutral-900 shadow-2xl">
            {playback.type === 'embed' ? (
              <iframe
                src={playback.url}
                title={movie?.title || "JazzHub Player"}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
                onError={() => setVideoError(true)}
              />
            ) : (
              <video
                ref={videoRef}
                src={playback.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onError={() => setVideoError(true)}
              >
                Your browser does not support HTML5 video.
              </video>
            )}
          </div>
        ) : !showMirrors ? (
          /* Initial State: Dark container when video fails or stream is unavailable */
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center text-white flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute w-72 h-72 bg-red-600/10 blur-3xl rounded-full pointer-events-none -top-10" />

            {/* Crimson Warning Indicator */}
            <div className="w-16 h-16 mb-4 rounded-2xl bg-red-950/70 border border-red-600/60 flex items-center justify-center shadow-lg shadow-red-950/80">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Playback Unavailable
            </h2>

            {/* Subtitle / Movie Info */}
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed mb-6">
              {movie?.title || movie?.name ? (
                <>The primary video stream for <span className="text-neutral-100 font-semibold">{movie.title || movie.name}</span> could not be loaded or is offline.</>
              ) : (
                <>The primary video stream for Media ID <span className="font-mono text-neutral-100 font-semibold">#{id}</span> could not be loaded.</>
              )}
            </p>

            {/* Button: Show Availability */}
            <button
              type="button"
              onClick={() => setShowMirrors(true)}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Show Availability</span>
            </button>

            {/* Footer Metadata */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-neutral-500 font-mono">
              <span className="capitalize">{type}:</span>
              <span className="text-neutral-300 font-semibold">{id}</span>
            </div>
          </div>
        ) : (
          /* Expanded State: 2x2 Grid with 4 mirror server cards */
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-white min-h-[380px] flex flex-col justify-between shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMirrors(false)}
                  className="p-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Available Mirrors</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-red-950/60 text-red-400 border border-red-800/50">
                      4 Gateways
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Current Media ID: <span className="font-mono text-neutral-200">{id}</span> &bull; Type: <span className="capitalize text-neutral-200">{type}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 2x2 Grid with opacity-60 hover:opacity-100 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center my-2">
              {MIRRORS.map((m) => (
                <a
                  key={m.name}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity duration-200 p-5 rounded-xl border border-neutral-800 bg-neutral-900 flex flex-col justify-between text-left group hover:border-red-600/50 hover:shadow-xl hover:shadow-black/70 cursor-pointer"
                >
                  {/* Card Header: Server Name, Host & External Link Arrow */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                        <Server className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {m.name}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {new URL(m.url).host}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-md bg-neutral-950/80 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card Footer: Endpoint Badge & Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                      {m.endpoint}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer Back Button */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => setShowMirrors(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-neutral-400 text-xs">External links open in a new tab</span>
            </div>
          </div>
        )}
      </div>

      {/* Under-Player Metadata Section */}
      <div className="cinema-info-section">
        <div className="cinema-info-container">
          <div className="cinema-meta-primary">
            <h2 className="cinema-movie-title">
              {movie?.title || movie?.name || `Title #${id}`}
            </h2>
            <div className="cinema-meta-badges">
              <div className="cinema-star-rating">
                <Star size={15} fill="#e50914" color="#e50914" />
                <span>{rating}</span>
              </div>
              <span className="cinema-bullet">•</span>
              <span className="cinema-year">{releaseYear}</span>
              {movie?.runtime && (
                <>
                  <span className="cinema-bullet">•</span>
                  <span className="cinema-runtime">{formatRuntime(movie.runtime)}</span>
                </>
              )}
              <span className="cinema-bullet">•</span>
              <span className="cinema-quality-pill">4K UHD</span>
              <span className="cinema-quality-pill">HDR</span>
            </div>
          </div>

          <div className="cinema-actions-bar">
            {movie && (
              <button
                type="button"
                onClick={() => toggleWatchlist({ ...movie, media_type: type })}
                className={`btn ${inWatchlist ? 'btn-cinema-active' : 'btn-secondary'}`}
                aria-label={inWatchlist ? "Remove from My List" : "Add to My List"}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck size={18} className="icon-crimson" />
                    <span>In My List</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={18} />
                    <span>+ My List</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="btn btn-secondary"
              aria-label="Share movie link"
            >
              {copiedToast ? (
                <>
                  <Check size={18} className="icon-green" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {movie?.overview && (
          <div className="cinema-synopsis-container">
            <p className="cinema-synopsis-text">{movie.overview}</p>
          </div>
        )}

        {/* Cast & Crew Section with Profile Photos & Names */}
        {castList && castList.length > 0 && (
          <div className="cinema-cast-section mt-8 pt-6 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-red-600" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Cast & Crew
              </h3>
              <span className="text-xs text-neutral-500 font-mono">({castList.length})</span>
            </div>

            {/* Horizontal Scrolling Cast Row */}
            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1">
              {castList.map((person, idx) => (
                <CastMemberCard
                  key={person.id || `${typeof person === 'string' ? person : person.name}-${idx}`}
                  person={person}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
