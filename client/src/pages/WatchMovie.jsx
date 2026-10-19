import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Bookmark, BookmarkCheck, Share2, Check } from 'lucide-react';
import CinemaFallbackPlayer from '../components/CinemaFallbackPlayer';
import { movieApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import jazzhubLogo from '../assets/hero.png';

export default function WatchMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playbackLoading, setPlaybackLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    async function loadWatchData() {
      setLoading(true);
      setError(null);

      try {
        const movieData = await movieApi.getMovieDetails(id);
        if (!movieData) {
          if (isMounted) {
            setError("Movie not found");
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setMovie(movieData);
          setLoading(false);
        }

        setPlaybackLoading(true);
        const pb = await movieApi.getMoviePlayback(id);
        if (isMounted) {
          setPlayback(pb);
          setPlaybackLoading(false);
        }
      } catch (err) {
        console.error("Watch movie load error:", err);
        if (isMounted) {
          setError(err.message || "Failed to initialize playback.");
          setLoading(false);
          setPlaybackLoading(false);
        }
      }
    }

    loadWatchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/movie/${id}`);
    }
  };

  const handleRetryPlayback = async () => {
    setPlaybackLoading(true);
    try {
      const pb = await movieApi.getMoviePlayback(id);
      setPlayback(pb);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlaybackLoading(false);
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
    : (movie?.year || '2026');

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="cinema-watch-experience">
      {/* Top Cinema Overlay Header (Desktop & Mobile) */}
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
          <h1 className="cinema-headline-text">{movie?.title || "Cinema Mode"}</h1>
        </div>

        <Link to="/" className="cinema-brand-link" aria-label="JazzHub Home">
          <img src={jazzhubLogo} alt="JazzHub" className="cinema-brand-logo-img" />
          <span className="cinema-brand-name">JAZZ<span className="brand-highlight">HUB</span></span>
        </Link>
      </div>

      {/* Full-Width True Viewport Video Player Container */}
      <div className="cinema-stage-viewport">
        <CinemaFallbackPlayer
          playback={playback}
          loading={loading || playbackLoading}
          error={error}
          title={movie?.title}
          type="movie"
          id={id}
          onRetry={handleRetryPlayback}
        />
      </div>

      {/* Minimal Under-Player Metadata Strip */}
      {movie && (
        <div className="cinema-info-section">
          <div className="cinema-info-container">
            <div className="cinema-meta-primary">
              <h2 className="cinema-movie-title">{movie.title}</h2>
              <div className="cinema-meta-badges">
                <div className="cinema-star-rating">
                  <Star size={15} fill="#e50914" color="#e50914" />
                  <span>{rating}</span>
                </div>
                <span className="cinema-bullet">•</span>
                <span className="cinema-year">{releaseYear}</span>
                {movie.runtime && (
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
              <button
                type="button"
                onClick={() => toggleWatchlist({ ...movie, media_type: 'movie' })}
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

          <div className="cinema-synopsis-container">
            <p className="cinema-synopsis-text">{movie.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}
