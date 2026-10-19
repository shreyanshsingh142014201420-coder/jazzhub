import React, { useState, useEffect } from 'react';
import { Tv, ExternalLink, Globe, Play, AlertCircle, ShoppingCart, Film } from 'lucide-react';
import { movieApi, tvApi } from '../services/api';

const POPULAR_REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }
];

export default function WatchOptions({ id, type = 'movie', title = '' }) {
  const [region, setRegion] = useState('US');
  const [data, setData] = useState(null);
  const [allRegions, setAllRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'flatrate', 'rent', 'buy'

  useEffect(() => {
    let isMounted = true;

    async function fetchWatchOptions() {
      setLoading(true);
      try {
        const apiCall = type === 'tv' ? tvApi.getWatchOptions : movieApi.getWatchOptions;
        const res = await apiCall(id, region);

        if (isMounted) {
          if (res && res.data) {
            setData(res.data);
            if (res.available_regions && res.available_regions.length > 0) {
              setAllRegions(res.available_regions);
            }
          } else {
            setData(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn(`[WatchOptions] Error fetching options for ${type} ${id}:`, err);
        if (isMounted) {
          setData(null);
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchWatchOptions();
    }

    return () => {
      isMounted = false;
    };
  }, [id, type, region]);

  const tmdbImgBase = 'https://image.tmdb.org/t/p/original';

  const flatrate = data?.flatrate || [];
  const rent = data?.rent || [];
  const buy = data?.buy || [];
  const justWatchLink = data?.link || 'https://www.justwatch.com';

  const hasAnyOptions = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

  // Filter items based on activeTab
  const getDisplayItems = () => {
    if (activeTab === 'flatrate') return { flatrate, rent: [], buy: [] };
    if (activeTab === 'rent') return { flatrate: [], rent, buy: [] };
    if (activeTab === 'buy') return { flatrate: [], rent, buy };
    return { flatrate, rent, buy };
  };

  const display = getDisplayItems();

  return (
    <div className="watch-options-container" id="watch-options-section">
      <div className="watch-options-header">
        <div className="watch-options-title-group">
          <div className="watch-options-badge">
            <Tv size={16} />
            <span>Where to Watch</span>
          </div>
          <h3 className="watch-options-heading">External Watch Options</h3>
          <p className="watch-options-subtext">
            Stream, rent, or purchase {title ? `"${title}"` : 'this title'} across authorized global providers.
          </p>
        </div>

        {/* Region Switcher */}
        <div className="watch-options-region-selector">
          <Globe size={15} className="region-icon" />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="watch-options-select"
            aria-label="Select Country / Region"
          >
            {POPULAR_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name} ({r.code})
              </option>
            ))}
            {allRegions
              .filter((r) => !POPULAR_REGIONS.some((p) => p.code === r))
              .sort()
              .map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      {hasAnyOptions && (
        <div className="watch-options-tabs">
          <button
            type="button"
            className={`watch-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Options
          </button>
          {flatrate.length > 0 && (
            <button
              type="button"
              className={`watch-tab-btn ${activeTab === 'flatrate' ? 'active' : ''}`}
              onClick={() => setActiveTab('flatrate')}
            >
              Subscription ({flatrate.length})
            </button>
          )}
          {rent.length > 0 && (
            <button
              type="button"
              className={`watch-tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
              onClick={() => setActiveTab('rent')}
            >
              Rent ({rent.length})
            </button>
          )}
          {buy.length > 0 && (
            <button
              type="button"
              className={`watch-tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
              onClick={() => setActiveTab('buy')}
            >
              Buy ({buy.length})
            </button>
          )}
        </div>
      )}

      {/* Content State */}
      {loading ? (
        <div className="watch-options-loading">
          <div className="watch-skeleton-provider"></div>
          <div className="watch-skeleton-provider"></div>
          <div className="watch-skeleton-provider"></div>
          <div className="watch-skeleton-provider"></div>
        </div>
      ) : !hasAnyOptions ? (
        <div className="watch-options-empty">
          <AlertCircle size={22} className="watch-empty-icon" />
          <div className="watch-empty-text">
            <h4>No streaming options found in {region}</h4>
            <p>Try switching to another region or check JustWatch for updates.</p>
          </div>
          <a
            href={justWatchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary watch-external-btn"
          >
            <span>Search JustWatch</span>
            <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <div className="watch-options-sections">
          {/* Subscription / Flatrate */}
          {display.flatrate.length > 0 && (
            <div className="watch-group-section">
              <div className="watch-group-title">
                <Play size={15} className="group-icon stream-icon" />
                <span>Subscription Streaming</span>
              </div>
              <div className="watch-providers-grid">
                {display.flatrate.map((provider) => (
                  <a
                    key={`stream-${provider.provider_id}-${provider.provider_name}`}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-provider-card"
                    title={`Watch on ${provider.provider_name}`}
                  >
                    <div className="provider-logo-box">
                      {provider.logo_path ? (
                        <img
                          src={`${tmdbImgBase}${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="provider-logo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="provider-logo-fallback"
                        style={{ display: provider.logo_path ? 'none' : 'flex' }}
                      >
                        <Film size={18} />
                      </div>
                    </div>
                    <div className="provider-details">
                      <span className="provider-name">{provider.provider_name}</span>
                      <span className="provider-type-tag stream-tag">Stream</span>
                    </div>
                    <ExternalLink size={14} className="provider-link-icon" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rent */}
          {display.rent.length > 0 && (
            <div className="watch-group-section">
              <div className="watch-group-title">
                <Film size={15} className="group-icon rent-icon" />
                <span>Rent</span>
              </div>
              <div className="watch-providers-grid">
                {display.rent.map((provider) => (
                  <a
                    key={`rent-${provider.provider_id}-${provider.provider_name}`}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-provider-card"
                    title={`Rent on ${provider.provider_name}`}
                  >
                    <div className="provider-logo-box">
                      {provider.logo_path ? (
                        <img
                          src={`${tmdbImgBase}${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="provider-logo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="provider-logo-fallback"
                        style={{ display: provider.logo_path ? 'none' : 'flex' }}
                      >
                        <Film size={18} />
                      </div>
                    </div>
                    <div className="provider-details">
                      <span className="provider-name">{provider.provider_name}</span>
                      <span className="provider-type-tag rent-tag">Rent</span>
                    </div>
                    <ExternalLink size={14} className="provider-link-icon" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Buy */}
          {display.buy.length > 0 && (
            <div className="watch-group-section">
              <div className="watch-group-title">
                <ShoppingCart size={15} className="group-icon buy-icon" />
                <span>Buy</span>
              </div>
              <div className="watch-providers-grid">
                {display.buy.map((provider) => (
                  <a
                    key={`buy-${provider.provider_id}-${provider.provider_name}`}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-provider-card"
                    title={`Buy on ${provider.provider_name}`}
                  >
                    <div className="provider-logo-box">
                      {provider.logo_path ? (
                        <img
                          src={`${tmdbImgBase}${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="provider-logo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="provider-logo-fallback"
                        style={{ display: provider.logo_path ? 'none' : 'flex' }}
                      >
                        <Film size={18} />
                      </div>
                    </div>
                    <div className="provider-details">
                      <span className="provider-name">{provider.provider_name}</span>
                      <span className="provider-type-tag buy-tag">Buy</span>
                    </div>
                    <ExternalLink size={14} className="provider-link-icon" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* JustWatch Attribution Footer */}
          <div className="watch-options-footer">
            <span className="watch-options-attribution">
              Data supplied by <strong>JustWatch</strong> via TMDB.
            </span>
            <a
              href={justWatchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="watch-options-view-all-link"
            >
              <span>View all watch options on JustWatch</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
