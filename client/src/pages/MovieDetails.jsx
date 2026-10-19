import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  Users,
  Play,
  Sparkles,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import CinemaFallbackPlayer from '../components/CinemaFallbackPlayer';
import MovieCard from '../components/MovieCard';
import { SkeletonHero } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { movieApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { getBackdropUrl, getPosterUrl } from '../utils/imageUrl';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playback, setPlayback] = useState(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  const handleWatchStream = async () => {
    setShowPlayer(true);
    if (!playback && !playbackLoading) {
      setPlaybackLoading(true);
      setPlaybackError(null);
      try {
        const pb = await movieApi.getMoviePlayback(movie?.id || id);
        setPlayback(pb);
      } catch (err) {
        setPlaybackError(err.message || 'Stream playback unavailable');
      } finally {
        setPlaybackLoading(false);
      }
    }
    setTimeout(() => {
      document.getElementById('cinema-player-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    async function fetchDetails() {
      setLoading(true);
      setNotFound(false);

      try {
        const details = await movieApi.getMovieDetails(id);

        if (!details) {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        // Fetch similar movies
        let similar = [];
        if (details.similar?.results?.length > 0) {
          similar = details.similar.results.slice(0, 12);
        } else {
          similar = await movieApi.getSimilarMovies(id).catch(() => []);
        }

        if (isMounted) {
          setMovie(details);
          setSimilarMovies(similar.slice(0, 12));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="details-loading-page">
        <SkeletonHero />
      </div>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="page-container not-found-view">
        <EmptyState
          icon={AlertCircle}
          title="Title Not Found"
          description={`We couldn't locate any title matching ID "${id}".`}
          actionText="Discover Movies"
          actionLink="/popular"
        />
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : (movie.rating || 'N/A');

  const genres = Array.isArray(movie.genres)
    ? movie.genres.map(g => (typeof g === 'object' ? g.name : g))
    : Array.isArray(movie.genre)
    ? movie.genre
    : [];

  const castList = movie.credits?.cast
    ? movie.credits.cast.slice(0, 10)
    : Array.isArray(movie.cast)
    ? movie.cast.map(c => (typeof c === 'string' ? { name: c } : c))
    : [];

  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';

  return (
    <div className="cinematic-details-page">
      {/* Immersive Backdrop Banner */}
      <div className="details-backdrop-hero">
        <img
          src={getBackdropUrl(movie.backdrop_path || movie.backdrop)}
          alt={movie.title}
          className="details-backdrop-image"
        />
        <div className="details-gradient-left"></div>
        <div className="details-gradient-bottom"></div>
        <div className="details-radial-overlay"></div>
      </div>

      <div className="details-main-container">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="details-back-button"
          aria-label="Back to previous page"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Primary Showcase Layout */}
        <div className="details-showcase-grid">
          {/* Poster Column */}
          <div className="details-poster-wrapper">
            <div className="details-poster-frame">
              <img
                src={getPosterUrl(movie.poster_path || movie.poster)}
                alt={movie.title}
                className="details-poster-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPosterUrl(null);
                }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="details-poster-actions">
              <button
                type="button"
                onClick={handleWatchStream}
                className="btn btn-details-watch"
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Stream</span>
              </button>

              <Link
                to={`/watch/movie/${movie.id}`}
                className="btn btn-secondary"
                title="Full Theater Mode"
              >
                <Maximize2 size={16} />
                <span>Theater</span>
              </Link>

              <button
                type="button"
                onClick={() => toggleWatchlist({ ...movie, media_type: 'movie' })}
                className={`btn btn-details-list ${inWatchlist ? 'is-active' : ''}`}
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
            </div>
          </div>

          {/* Details & Metadata Column */}
          <div className="details-content-column">
            {movie.tagline && (
              <p className="details-tagline-text">"{movie.tagline}"</p>
            )}

            <h1 className="details-main-heading">{movie.title}</h1>

            {/* Metadata Badges */}
            <div className="details-metadata-strip">
              <div className="details-rating-badge">
                <Star size={16} fill="#e50914" color="#e50914" />
                <span className="rating-num">{rating}</span>
                <span className="rating-base">/10</span>
              </div>

              {releaseYear && (
                <div className="details-meta-item">
                  <Calendar size={15} />
                  <span>{releaseYear}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="details-meta-item">
                  <Clock size={15} />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}

              <span className="badge-pill">4K UHD</span>
              <span className="badge-pill">HDR</span>
            </div>

            {/* Genres List */}
            {genres.length > 0 && (
              <div className="details-genre-pills">
                {genres.map((g) => (
                  <Link
                    key={g}
                    to={`/search?q=${encodeURIComponent(g)}`}
                    className="genre-badge-link"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="details-synopsis-section">
              <h2 className="details-sub-heading">Synopsis</h2>
              <p className="details-synopsis-body">
                {movie.overview || movie.description || "No synopsis available for this title."}
              </p>
            </div>

            {/* Top Cast */}
            {castList.length > 0 && (
              <div className="details-cast-section">
                <div className="section-title-wrapper">
                  <Users size={18} className="section-icon-crimson" />
                  <h2 className="details-sub-heading">Starring Cast</h2>
                </div>
                <div className="cast-members-row">
                  {castList.map((actor, idx) => {
                    const profileUrl = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null;
                    return (
                      <div key={actor.id || idx} className="cast-member-card">
                        <div className="cast-avatar-circle overflow-hidden bg-neutral-900 flex items-center justify-center">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={actor.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{ display: profileUrl ? 'none' : 'flex' }}>
                            {(actor.name || 'A').charAt(0)}
                          </span>
                        </div>
                        <div className="cast-text">
                          <span className="cast-real-name">{actor.name}</span>
                          {actor.character && (
                            <span className="cast-role-name">{actor.character}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Embedded Cinema Player Section with Failover Matrix */}
        {showPlayer && (
          <div id="cinema-player-section" className="details-embedded-player-wrap mt-8 mb-8 animate-fade-in">
            <div className="section-title-wrapper mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="section-icon-crimson" />
                <h2 className="details-sub-heading text-lg font-bold text-white">Cinema Media Stream</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPlayer(false)}
                className="text-xs text-neutral-400 hover:text-white font-mono cursor-pointer"
              >
                ✕ Close Player
              </button>
            </div>
            <CinemaFallbackPlayer
              movie={movie}
              title={movie.title}
              type="movie"
              id={movie.id || id}
              playback={playback}
              loading={playbackLoading}
              error={playbackError}
              poster={getBackdropUrl(movie.backdrop_path || movie.backdrop)}
              onRetry={handleWatchStream}
            />
          </div>
        )}

        {/* More Like This Rails */}
        {similarMovies.length > 0 && (
          <section className="details-similar-section" aria-label="Similar Titles">
            <div className="section-title-wrapper">
              <Sparkles size={20} className="section-icon-crimson" />
              <h2 className="similar-section-title">More Like This</h2>
            </div>
            <div className="similar-posters-grid">
              {similarMovies.map((simMovie) => (
                <MovieCard key={simMovie.id} movie={simMovie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
