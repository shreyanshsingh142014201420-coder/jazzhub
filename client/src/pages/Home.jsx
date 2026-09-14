import React, { useEffect, useState } from 'react';
import { Flame, TrendingUp, Award, Tv, Sparkles, CalendarClock } from 'lucide-react';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { SkeletonHero, SkeletonRow } from '../components/SkeletonLoader';
import { movieApi, tvApi } from '../services/api';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [anime, setAnime] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const [trendData, popData, topData, tvData, animeData, upData] = await Promise.all([
          movieApi.getTrending().catch(() => []),
          movieApi.getPopular().catch(() => []),
          movieApi.getTopRated().catch(() => []),
          tvApi.getPopular().catch(() => []),
          tvApi.getAnime().catch(() => []),
          movieApi.getUpcoming().catch(() => [])
        ]);

        if (isMounted) {
          setTrending(trendData);
          setPopular(popData);
          setTopRated(topData);
          setPopularTV(tvData);
          setAnime(animeData);
          setUpcoming(upData);

          // Select highest rated/popular featured hero
          const candidate = trendData[0] || popData[0] || topData[0];
          setFeatured(candidate || null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading home streaming catalog:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="home-streaming-page">
        <SkeletonHero />
        <div className="home-content-rails">
          <SkeletonRow count={6} />
          <SkeletonRow count={6} />
          <SkeletonRow count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="home-streaming-page">
      {/* Cinematic Hero Section */}
      {featured && <Hero movie={featured} />}

      {/* Horizontal Content Rails */}
      <div className="home-content-rails">
        {trending.length > 0 && (
          <MovieRow
            title="Trending Now"
            movies={trending}
            viewAllLink="/popular"
            icon={Flame}
          />
        )}

        {popular.length > 0 && (
          <MovieRow
            title="Popular Movies"
            movies={popular}
            viewAllLink="/popular"
            icon={TrendingUp}
          />
        )}

        {topRated.length > 0 && (
          <MovieRow
            title="Top Rated Cinema"
            movies={topRated}
            viewAllLink="/top-rated"
            icon={Award}
          />
        )}

        {popularTV.length > 0 && (
          <MovieRow
            title="Popular TV Shows"
            movies={popularTV}
            viewAllLink="/tv"
            icon={Tv}
          />
        )}

        {anime.length > 0 && (
          <MovieRow
            title="Anime Spotlight"
            movies={anime}
            viewAllLink="/anime"
            icon={Sparkles}
          />
        )}

        {upcoming.length > 0 && (
          <MovieRow
            title="Upcoming Premieres"
            movies={upcoming}
            viewAllLink="/upcoming"
            icon={CalendarClock}
          />
        )}
      </div>
    </div>
  );
}
