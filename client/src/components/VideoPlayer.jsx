import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
  AlertCircle,
  RefreshCw,
  Film,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VideoPlayer({
  playback,
  loading = false,
  error = null,
  title = "Media Player",
  onRetry,
  onNextEpisode,
  hasNextEpisode = false
}) {
  const navigate = useNavigate();
  const playerContainerRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  // Diagnostics logging as requested
  console.log("Playback response:", playback);
  console.log("Playback URL:", playback?.url);
  console.log("Playback type:", playback?.type);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [mediaErrorMessage, setMediaErrorMessage] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const controlsTimeoutRef = useRef(null);

  // Format time (seconds -> mm:ss or hh:mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Activity timer to auto-hide controls
  const handleUserActivity = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  }, [isPlaying]);

  // Video playback controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    handleUserActivity();
  }, [handleUserActivity]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      } else if (playerContainerRef.current.webkitRequestFullscreen) {
        playerContainerRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }, [isFullscreen]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    handleUserActivity();
  }, [isMuted, handleUserActivity]);

  const seekRelative = useCallback((seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    handleUserActivity();
  }, [duration, handleUserActivity]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
    } else {
      handleUserActivity();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, handleUserActivity]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      }
      handleUserActivity();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, seekRelative, handleUserActivity]);

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
    handleUserActivity();
  };

  const handleScrubberClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    handleUserActivity();
  };

  const handleScrubberMouseMove = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    handleUserActivity();
  };

  // Video element events
  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Compute buffered range
    if (videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(end);
    }
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="cinema-screen-container cinema-state-loading" role="status" aria-label="Loading video...">
        <div className="cinema-loading-core">
          <div className="cinema-pulse-ring"></div>
          <Play size={32} className="cinema-pulse-icon" fill="currentColor" />
        </div>
        <p className="cinema-state-title">Loading video...</p>
        <span className="cinema-state-subtext">Connecting to authorized media stream</span>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="cinema-screen-container cinema-state-error" role="alert">
        <div className="cinema-state-box">
          <AlertCircle size={48} className="cinema-warning-icon" />
          <h3 className="cinema-state-title">Playback Error</h3>
          <p className="cinema-state-desc">{error}</p>
          <div className="cinema-state-actions">
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn btn-primary">
                <RefreshCw size={16} />
                <span>Retry Connection</span>
              </button>
            )}
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Playback Unavailable State
  if (!playback || !playback.available || !playback.url) {
    return (
      <div className="cinema-screen-container cinema-state-unavailable" role="alert">
        <div className="cinema-state-box">
          <Film size={48} className="cinema-warning-icon" />
          <h3 className="cinema-state-title">Playback unavailable</h3>
          <p className="cinema-state-desc">
            {playback?.message || "This title currently doesn't have an available playback stream."}
          </p>
          <div className="cinema-state-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn btn-secondary">
                <RefreshCw size={16} />
                <span>Check Availability</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Fallback HTML5 decoding error
  if (videoError) {
    return (
      <div className="cinema-screen-container cinema-state-error" role="alert">
        <div className="cinema-state-box">
          <AlertCircle size={48} className="cinema-warning-icon" />
          <h3 className="cinema-state-title">Unable to load this video.</h3>
          <p className="cinema-state-desc">
            {mediaErrorMessage || "The browser media engine failed to load or decode this media stream."}
          </p>
          <div className="cinema-state-actions">
            <button
              type="button"
              onClick={() => { setVideoError(false); if (onRetry) onRetry(); }}
              className="btn btn-primary"
            >
              <RefreshCw size={16} />
              <span>Reload Stream</span>
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized Iframe Embed
  if (playback.type === 'embed') {
    return (
      <div
        ref={playerContainerRef}
        className={`cinema-screen-container ${isFullscreen ? 'is-fullscreen' : ''}`}
      >
        <iframe
          src={playback.url}
          title={title || "JazzHub Player"}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="cinema-viewport-iframe"
        />
        <div className="cinema-embed-overlay-controls">
          <button
            type="button"
            className="cinema-control-btn embed-fs-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    );
  }

  // 6. Direct Video Stream with Full Cinema Custom Controls Layer
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={playerContainerRef}
      className={`cinema-screen-container ${isFullscreen ? 'is-fullscreen' : ''} ${!controlsVisible ? 'hide-cursor' : ''}`}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      onTouchStart={handleUserActivity}
    >
      {/* Native HTML5 Video Element with Contain Fit on Pure Black */}
      <video
        ref={videoRef}
        src={playback.url}
        playsInline
        controls={false}
        className="cinema-viewport-video"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => { setIsPlaying(false); setControlsVisible(true); }}
        onError={(e) => {
          console.error("VIDEO ERROR:", e);
          console.error("VIDEO ELEMENT:", e.currentTarget);
          console.error("VIDEO ERROR CODE:", e.currentTarget.error?.code);
          console.error("VIDEO ERROR MESSAGE:", e.currentTarget.error?.message);
          console.error("VIDEO NETWORK STATE:", videoRef.current?.networkState);
          console.error("VIDEO READY STATE:", videoRef.current?.readyState);
          setVideoError(true);
          const errCode = e.currentTarget.error?.code;
          const errMsg = e.currentTarget.error?.message;
          setMediaErrorMessage(
            errMsg
              ? `Error (${errCode}): ${errMsg}`
              : `Media error code ${errCode || 'unknown'}: Source not supported or server returned an error.`
          );
        }}
        onClick={togglePlay}
      />

      {/* Center Big Play / Pause Indicator (shows briefly when clicked) */}
      {!isPlaying && controlsVisible && (
        <div className="cinema-center-action" onClick={togglePlay}>
          <div className="cinema-center-btn">
            <Play size={36} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Custom Streaming Controls Overlay */}
      <div className={`cinema-controls-layer ${controlsVisible ? 'is-visible' : 'is-hidden'}`}>
        {/* Scrubber Progress Bar */}
        <div
          ref={progressBarRef}
          className="cinema-scrubber-track"
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Buffered Range */}
          <div
            className="cinema-scrubber-buffered"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Current Progress Played */}
          <div
            className="cinema-scrubber-played"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="cinema-scrubber-thumb" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="cinema-scrubber-tooltip"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls Bar Row */}
        <div className="cinema-controls-bottom-bar">
          {/* Left Controls: Play/Pause, Seek -10/+10, Volume, Time */}
          <div className="cinema-controls-left">
            <button
              type="button"
              className="cinema-control-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>

            <button
              type="button"
              className="cinema-control-btn"
              onClick={() => seekRelative(-10)}
              title="Rewind 10 seconds"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw size={19} />
            </button>

            <button
              type="button"
              className="cinema-control-btn"
              onClick={() => seekRelative(10)}
              title="Fast forward 10 seconds"
              aria-label="Fast forward 10 seconds"
            >
              <RotateCw size={19} />
            </button>

            {/* Volume Control */}
            <div className="cinema-volume-group">
              <button
                type="button"
                className="cinema-control-btn"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="cinema-volume-slider"
                aria-label="Volume slider"
              />
            </div>

            {/* Elapsed / Duration */}
            <div className="cinema-time-counter">
              <span className="time-current">{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="time-total">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Next Episode (if TV), Speed, Settings, Fullscreen */}
          <div className="cinema-controls-right">
            {hasNextEpisode && onNextEpisode && (
              <button
                type="button"
                className="cinema-control-btn cinema-next-ep-btn"
                onClick={onNextEpisode}
                title="Next Episode"
                aria-label="Next Episode"
              >
                <SkipForward size={20} fill="currentColor" />
                <span className="next-ep-label">Next Ep</span>
              </button>
            )}

            {/* Speed Selector Menu */}
            <div className="cinema-speed-wrapper">
              <button
                type="button"
                className="cinema-control-btn cinema-speed-btn"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                title="Playback Speed"
                aria-label="Playback Speed"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="cinema-speed-dropdown">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`speed-option ${playbackSpeed === s ? 'is-selected' : ''}`}
                      onClick={() => handleSpeedChange(s)}
                    >
                      {s}x {s === 1 ? '(Normal)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              className="cinema-control-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
