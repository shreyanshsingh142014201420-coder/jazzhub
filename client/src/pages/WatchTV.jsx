import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Layers
} from 'lucide-react';
import CinemaFallbackPlayer from '../components/CinemaFallbackPlayer';
import { tvApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import jazzhubLogo from '../assets/hero.png';

export default function WatchTV() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const currentSeason = parseInt(season, 10);
  const currentEpisode = parseInt(episode, 10);

  const [series, setSeries] = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [episodeData, setEpisodeData] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playbackLoading, setPlaybackLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    async function loadTVWatchData() {
      setLoading(true);
      setError(null);

      try {
        const [seriesInfo, seasonInfo] = await Promise.all([
          tvApi.getTVDetails(id),
          tvApi.getSeasonDetails(id, currentSeason)
        ]);

        if (!seriesInfo) {
          if (isMounted) {
            setError("TV Series not found");
            setLoading(false);
          }
          return;
        }

        const epMatch = seasonInfo?.episodes?.find(e => e.episode_number === currentEpisode);

        if (isMounted) {
          setSeries(seriesInfo);
          setSeasonData(seasonInfo);
          setEpisodeData(epMatch || {
            episode_number: currentEpisode,
            name: `Episode ${currentEpisode}`,
            overview: seriesInfo.overview
          });
          setLoading(false);
        }

        setPlaybackLoading(true);
        const pb = await tvApi.getEpisodePlayback(id, currentSeason, currentEpisode);
        if (isMounted) {
          setPlayback(pb);
          setPlaybackLoading(false);
        }
      } catch (err) {
        console.error("Watch TV error:", err);
        if (isMounted) {
          setError(err.message || "Failed to load episode stream.");
          setLoading(false);
          setPlaybackLoading(false);
        }
      }
    }

    loadTVWatchData();

    return () => {
      isMounted = false;
    };
  }, [id, currentSeason, currentEpisode]);

  const episodesList = seasonData?.episodes || [];
  const currentIndex = episodesList.findIndex(e => e.episode_number === currentEpisode);

  const prevEpisode = currentIndex > 0 ? episodesList[currentIndex - 1] : null;
  const nextEpisode = currentIndex >= 0 && currentIndex < episodesList.length - 1
    ? episodesList[currentIndex + 1]
    : null;

  const handlePrevClick = () => {
    if (prevEpisode) {
      navigate(`/watch/tv/${id}/${currentSeason}/${prevEpisode.episode_number}`);
    }
  };

  const handleNextClick = () => {
    if (nextEpisode) {
      navigate(`/watch/tv/${id}/${currentSeason}/${nextEpisode.episode_number}`);
    }
  };

  const handleEpisodeSelect = (epNum) => {
    if (epNum !== currentEpisode) {
      navigate(`/watch/tv/${id}/${currentSeason}/${epNum}`);
    }
  };

  const handleBack = () => {
    navigate(`/tv/${id}`);
  };

  const handleRetryPlayback = async () => {
    setPlaybackLoading(true);
    try {
      const pb = await tvApi.getEpisodePlayback(id, currentSeason, currentEpisode);
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

  const inWatchlist = series ? isInWatchlist(series.id) : false;

  return (
    <div className="cinema-watch-experience">
      {/* Top Cinema Header Bar */}
      <div className="cinema-top-header">
        <button
          type="button"
          onClick={handleBack}
          className="cinema-back-action"
          aria-label="Back to series overview"
        >
          <ArrowLeft size={20} />
          <span className="cinema-back-label">Series Overview</span>
        </button>

        <div className="cinema-title-center">
          <Link to={`/tv/${id}`} className="cinema-series-link">
            {series?.title || series?.name}
          </Link>
          <span className="cinema-bullet">•</span>
          <span className="cinema-season-ep-tag">
            S{currentSeason} E{currentEpisode}
          </span>
        </div>

        <Link to="/" className="cinema-brand-link" aria-label="JazzHub Home">
          <img src={jazzhubLogo} alt="JazzHub" className="cinema-brand-logo-img" />
          <span className="cinema-brand-name">JAZZ<span className="brand-highlight">HUB</span></span>
        </Link>
      </div>

      {/* Full Viewport Cinema Video Player Frame */}
      <div className="cinema-stage-viewport">
        <CinemaFallbackPlayer
          playback={playback}
          loading={loading || playbackLoading}
          error={error}
          title={`${series?.title || series?.name || 'TV'} - S${currentSeason}E${currentEpisode}`}
          type="series"
          id={id}
          onRetry={handleRetryPlayback}
        />
      </div>

      {/* Under-Player Series & Episode Controls Section */}
      <div className="cinema-info-section">
        <div className="cinema-info-container">
          <div className="cinema-meta-primary">
            <div className="cinema-tv-subhead">
              <span className="season-number-pill">Season {currentSeason} &bull; Episode {currentEpisode}</span>
            </div>
            <h2 className="cinema-episode-headline">
              {episodeData?.name ? episodeData.name : `Episode ${currentEpisode}`}
            </h2>
          </div>

          <div className="cinema-actions-bar">
            {/* Prev / Next Episode Buttons */}
            <div className="cinema-ep-nav-pair">
              <button
                type="button"
                onClick={handlePrevClick}
                disabled={!prevEpisode}
                className={`btn ${prevEpisode ? 'btn-secondary' : 'btn-disabled'}`}
                aria-label="Previous Episode"
              >
                <ChevronLeft size={18} />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNextClick}
                disabled={!nextEpisode}
                className={`btn ${nextEpisode ? 'btn-primary' : 'btn-disabled'}`}
                aria-label="Next Episode"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Watchlist & Share */}
            <button
              type="button"
              onClick={() => toggleWatchlist({ ...series, title: series.title || series.name, media_type: 'tv' })}
              className={`btn ${inWatchlist ? 'btn-cinema-active' : 'btn-secondary'}`}
              aria-label={inWatchlist ? "Remove series from My List" : "Add series to My List"}
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
              aria-label="Share episode link"
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

        {/* Streaming Service Horizontal Episode Selector Rail */}
        {episodesList.length > 0 && (
          <div className="cinema-episodes-rail-wrapper">
            <div className="cinema-rail-header">
              <div className="rail-title-group">
                <Layers size={16} className="icon-crimson" />
                <span className="rail-headline">Episodes — Season {currentSeason}</span>
              </div>
              <span className="rail-count">{episodesList.length} episodes</span>
            </div>

            <div className="cinema-episodes-scroll-track">
              {episodesList.map((ep) => {
                const isActive = ep.episode_number === currentEpisode;
                return (
                  <button
                    key={ep.id || ep.episode_number}
                    type="button"
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`cinema-episode-pill-card ${isActive ? 'is-active' : ''}`}
                    title={ep.name}
                  >
                    <span className="pill-ep-num">E{ep.episode_number}</span>
                    <span className="pill-ep-name">{ep.name || `Episode ${ep.episode_number}`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Synopsis */}
        {episodeData?.overview && (
          <div className="cinema-synopsis-container">
            <p className="cinema-synopsis-text">{episodeData.overview}</p>
          </div>
        )}
      </div>
    </div>
  );
}
