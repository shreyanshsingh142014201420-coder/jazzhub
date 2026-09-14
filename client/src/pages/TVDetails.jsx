import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  Layers,
  Bookmark,
  BookmarkCheck,
  Users,
  Play,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonHero } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { tvApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { getBackdropUrl, getPosterUrl } from '../utils/imageUrl';

export default function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    async function fetchTVData() {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await tvApi.getTVDetails(id);
        if (!data) {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setSeries(data);
          const firstSeasonNum = data.seasons?.find(s => s.season_number > 0)?.season_number || 1;
          setSelectedSeason(firstSeasonNum);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching TV details:", err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    fetchTVData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadEpisodes() {
      if (!id || !selectedSeason) return;
      setEpisodesLoading(true);
      try {
        const sData = await tvApi.getSeasonDetails(id, selectedSeason);
        if (isMounted) {
          setSeasonEpisodes(sData?.episodes || []);
          setEpisodesLoading(false);
        }
      } catch (err) {
        console.error("Error loading season episodes:", err);
        if (isMounted) {
          setSeasonEpisodes([]);
          setEpisodesLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      isMounted = false;
    };
  }, [id, selectedSeason]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/tv');
    }
  };

  if (loading) {
    return (
      <div className="details-loading-page">
        <SkeletonHero />
      </div>
    );
  }

  if (notFound || !series) {
    return (
      <div className="page-container not-found-view">
        <EmptyState
          icon={AlertCircle}
          title="TV Series Not Found"
          description={`We couldn't find any TV series or anime matching ID "${id}".`}
          actionText="Browse TV Shows"
          actionLink="/tv"
        />
      </div>
    );
  }

  const inWatchlist = isInWatchlist(series.id);
  const rating = typeof series.vote_average === 'number'
    ? series.vote_average.toFixed(1)
    : (series.rating || 'N/A');

  const releaseYear = series.first_air_date ? series.first_air_date.substring(0, 4) : '';
  const seasonsList = series.seasons?.filter(s => s.season_number > 0) || [
    { season_number: 1, name: "Season 1" }
  ];

  const genres = Array.isArray(series.genres)
    ? series.genres.map(g => (typeof g === 'object' ? g.name : g))
    : [];

  const castList = series.credits?.cast ? series.credits.cast.slice(0, 10) : [];
  const similarShows = series.similar?.results?.slice(0, 12) || [];

  return (
    <div className="cinematic-details-page">
      {/* Immersive Backdrop Banner */}
      <div className="details-backdrop-hero">
        <img
          src={getBackdropUrl(series.backdrop_path || series.backdrop)}
          alt={series.title || series.name}
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
          aria-label="Back"
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
                src={getPosterUrl(series.poster_path || series.poster)}
                alt={series.title || series.name}
                className="details-poster-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPosterUrl(null);
                }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="details-poster-actions">
              <Link
                to={`/watch/tv/${series.id}/${selectedSeason}/1`}
                className="btn btn-details-watch"
              >
                <Play size={18} fill="currentColor" />
                <span>Watch S{selectedSeason} E1</span>
              </Link>

              <button
                type="button"
                onClick={() => toggleWatchlist({ ...series, title: series.title || series.name, media_type: 'tv' })}
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
            {series.tagline && (
              <p className="details-tagline-text">"{series.tagline}"</p>
            )}

            <h1 className="details-main-heading">{series.title || series.name}</h1>

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

              {series.number_of_seasons && (
                <div className="details-meta-item">
                  <Layers size={15} />
                  <span>{series.number_of_seasons} {series.number_of_seasons === 1 ? 'Season' : 'Seasons'}</span>
                </div>
              )}

              <span className="badge-pill">HD</span>
              <span className="badge-pill">5.1 AUDIO</span>
            </div>

            {/* Genres List */}
            {genres.length > 0 && (
              <div className="details-genre-pills">
                {genres.map((g) => (
                  <span key={g} className="genre-badge-static">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="details-synopsis-section">
              <h2 className="details-sub-heading">Synopsis</h2>
              <p className="details-synopsis-body">
                {series.overview || "No series synopsis is currently provided for this title."}
              </p>
            </div>

            {/* Top Cast */}
            {castList.length > 0 && (
              <div className="details-cast-section">
                <div className="section-title-wrapper">
                  <Users size={18} className="section-icon-crimson" />
                  <h2 className="details-sub-heading">Series Cast</h2>
                </div>
                <div className="cast-members-row">
                  {castList.map((actor, idx) => (
                    <div key={actor.id || idx} className="cast-member-card">
                      <div className="cast-avatar-circle">
                        {(actor.name || 'A').charAt(0)}
                      </div>
                      <div className="cast-text">
                        <span className="cast-real-name">{actor.name}</span>
                        {actor.character && (
                          <span className="cast-role-name">{actor.character}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episodes Section */}
        <section className="tv-episodes-section" aria-label="Episodes">
          <div className="episodes-header-row">
            <div className="episodes-title-wrapper">
              <Layers size={20} className="section-icon-crimson" />
              <h2 className="episodes-title">Episodes</h2>
            </div>

            {/* Season Selector Tabs */}
            <div className="season-selector-tabs" role="tablist">
              {seasonsList.map((s) => (
                <button
                  key={s.season_number}
                  type="button"
                  role="tab"
                  aria-selected={selectedSeason === s.season_number}
                  className={`season-tab-btn ${selectedSeason === s.season_number ? 'is-active' : ''}`}
                  onClick={() => setSelectedSeason(s.season_number)}
                >
                  Season {s.season_number}
                </button>
              ))}
            </div>
          </div>

          {/* Episode List Cards */}
          {episodesLoading ? (
            <div className="episodes-loading-placeholder">
              <p>Loading Season {selectedSeason} episodes...</p>
            </div>
          ) : seasonEpisodes.length === 0 ? (
            <div className="episodes-empty-state">
              <p>No episode listings currently available for this season.</p>
            </div>
          ) : (
            <div className="episodes-cards-list">
              {seasonEpisodes.map((ep) => (
                <div key={ep.id || ep.episode_number} className="episode-item-card">
                  {/* Thumbnail / Still with Play Overlay */}
                  <div className="episode-thumbnail-frame">
                    <img
                      src={getBackdropUrl(ep.still_path || series.backdrop_path)}
                      alt={ep.name}
                      className="episode-thumbnail-img"
                      loading="lazy"
                    />
                    <Link
                      to={`/watch/tv/${series.id}/${selectedSeason}/${ep.episode_number}`}
                      className="episode-hover-play"
                      aria-label={`Play episode ${ep.episode_number}: ${ep.name}`}
                    >
                      <Play size={24} fill="currentColor" />
                    </Link>
                  </div>

                  {/* Episode Info */}
                  <div className="episode-content-wrapper">
                    <div className="episode-title-row">
                      <h3 className="episode-item-headline">
                        <span className="episode-number-prefix">E{ep.episode_number}.</span> {ep.name}
                      </h3>
                      {ep.runtime && (
                        <div className="episode-runtime-tag">
                          <Clock size={13} />
                          <span>{ep.runtime}m</span>
                        </div>
                      )}
                    </div>
                    <p className="episode-item-overview">
                      {ep.overview || "No detailed synopsis available for this episode."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* More Like This Rails */}
        {similarShows.length > 0 && (
          <section className="details-similar-section" aria-label="Similar TV Series">
            <div className="section-title-wrapper">
              <Sparkles size={20} className="section-icon-crimson" />
              <h2 className="similar-section-title">More Like This</h2>
            </div>
            <div className="similar-posters-grid">
              {similarShows.map((show) => (
                <MovieCard key={show.id} movie={{ ...show, media_type: 'tv' }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
