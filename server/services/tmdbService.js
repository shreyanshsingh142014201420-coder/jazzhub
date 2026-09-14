import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Curated high-fidelity TMDB snapshot dataset for resilient local development / ISP-blocked fallback
const fallbackMovies = [
  {
    id: 101,
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg",
    vote_average: 8.3,
    release_date: "2024-02-27",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    genres: [{ id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }],
    runtime: 166,
    credits: {
      cast: [
        { id: 1, name: "Timothée Chalamet", character: "Paul Atreides" },
        { id: 2, name: "Zendaya", character: "Chani" },
        { id: 3, name: "Rebecca Ferguson", character: "Lady Jessica" },
        { id: 4, name: "Javier Bardem", character: "Stilgar" },
        { id: 5, name: "Austin Butler", character: "Feyd-Rautha Harkonnen" }
      ]
    },
    category: ["trending", "popular", "top-rated"]
  },
  {
    id: 102,
    title: "Oppenheimer",
    tagline: "The world forever changes.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    vote_average: 8.1,
    release_date: "2023-07-19",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, examining his brilliance, hubris and unrelenting moral dilemma.",
    genres: [{ id: 18, name: "Drama" }, { id: 36, name: "History" }],
    runtime: 181,
    credits: {
      cast: [
        { id: 11, name: "Cillian Murphy", character: "J. Robert Oppenheimer" },
        { id: 12, name: "Emily Blunt", character: "Katherine Oppenheimer" },
        { id: 13, name: "Matt Damon", character: "Leslie Groves" },
        { id: 14, name: "Robert Downey Jr.", character: "Lewis Strauss" }
      ]
    },
    category: ["popular", "top-rated"]
  },
  {
    id: 103,
    title: "Interstellar",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    vote_average: 8.6,
    release_date: "2014-11-05",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    genres: [{ id: 12, name: "Adventure" }, { id: 18, name: "Drama" }, { id: 878, name: "Science Fiction" }],
    runtime: 169,
    credits: {
      cast: [
        { id: 21, name: "Matthew McConaughey", character: "Cooper" },
        { id: 22, name: "Anne Hathaway", character: "Brand" },
        { id: 23, name: "Jessica Chastain", character: "Murph" },
        { id: 24, name: "Michael Caine", character: "Professor Brand" }
      ]
    },
    category: ["top-rated"]
  },
  {
    id: 104,
    title: "Spider-Man: Across the Spider-Verse",
    tagline: "It's how you wear the mask that matters.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    vote_average: 8.4,
    release_date: "2023-05-31",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.",
    genres: [{ id: 16, name: "Animation" }, { id: 28, name: "Action" }, { id: 12, name: "Adventure" }],
    runtime: 140,
    credits: {
      cast: [
        { id: 31, name: "Shameik Moore", character: "Miles Morales (voice)" },
        { id: 32, name: "Hailee Steinfeld", character: "Gwen Stacy (voice)" },
        { id: 33, name: "Oscar Isaac", character: "Miguel O'Hara (voice)" }
      ]
    },
    category: ["trending", "popular", "top-rated"]
  },
  {
    id: 105,
    title: "Gladiator II",
    tagline: "What we do in life echoes in eternity.",
    poster_path: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop_path: "/euYIwmwkmz95mnExrPy4v9a9qT7.jpg",
    vote_average: 7.8,
    release_date: "2024-11-13",
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 18, name: "Drama" }],
    runtime: 148,
    credits: {
      cast: [
        { id: 41, name: "Paul Mescal", character: "Lucius" },
        { id: 42, name: "Pedro Pascal", character: "Marcus Acacius" },
        { id: 43, name: "Denzel Washington", character: "Macrinus" }
      ]
    },
    category: ["trending", "popular"]
  },
  {
    id: 106,
    title: "Avatar: The Way of Water",
    tagline: "Return to Pandora.",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    vote_average: 7.7,
    release_date: "2022-12-14",
    overview: "Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
    genres: [{ id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }, { id: 28, name: "Action" }],
    runtime: 192,
    credits: {
      cast: [
        { id: 51, name: "Sam Worthington", character: "Jake Sully" },
        { id: 52, name: "Zoe Saldaña", character: "Neytiri" },
        { id: 53, name: "Sigourney Weaver", character: "Kiri" }
      ]
    },
    category: ["popular"]
  },
  {
    id: 107,
    title: "The Dark Knight",
    tagline: "Welcome to a world without rules.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    vote_average: 8.5,
    release_date: "2008-07-16",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    genres: [{ id: 18, name: "Drama" }, { id: 28, name: "Action" }, { id: 80, name: "Crime" }, { id: 53, name: "Thriller" }],
    runtime: 152,
    credits: {
      cast: [
        { id: 61, name: "Christian Bale", character: "Bruce Wayne / Batman" },
        { id: 62, name: "Heath Ledger", character: "Joker" },
        { id: 63, name: "Aaron Eckhart", character: "Harvey Dent" },
        { id: 64, name: "Michael Caine", character: "Alfred Pennyworth" }
      ]
    },
    category: ["top-rated"]
  },
  {
    id: 108,
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    vote_average: 8.4,
    release_date: "2010-07-15",
    overview: "Cobb, a skilled thief who steals corporate secrets through use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a CEO.",
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }],
    runtime: 148,
    credits: {
      cast: [
        { id: 71, name: "Leonardo DiCaprio", character: "Dom Cobb" },
        { id: 72, name: "Joseph Gordon-Levitt", character: "Arthur" },
        { id: 73, name: "Elliot Page", character: "Ariadne" },
        { id: 74, name: "Tom Hardy", character: "Eames" }
      ]
    },
    category: ["top-rated", "popular"]
  }
];

// Fallback TV Series dataset
const fallbackTV = [
  {
    id: 126308,
    name: "Shōgun",
    title: "Shōgun",
    tagline: "Dawn of a new era.",
    poster_path: "/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
    backdrop_path: "/2rmK7mnchw9Xr3XdiTFSxTTvYQI.jpg",
    vote_average: 8.5,
    first_air_date: "2024-02-27",
    release_date: "2024-02-27",
    overview: "In Japan in the year 1600, at the dawn of a century-defining civil war, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him, when a mysterious European ship is found marooned in a nearby fishing village.",
    genres: [{ id: 18, name: "Drama" }, { id: 10768, name: "War & Politics" }],
    number_of_seasons: 1,
    number_of_episodes: 10,
    media_type: "tv",
    category: ["trending", "popular", "top-rated"],
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episode_count: 10,
        overview: "Lord Toranaga battles against political rivals while English navigator John Blackthorne arrives in Japan."
      }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "Chapter One: Anjin", overview: "Destinies converge in Japan when an English ship is shipwrecked in a warlord's territory.", runtime: 58, still_path: "/2rmK7mnchw9Xr3XdiTFSxTTvYQI.jpg" },
        { episode_number: 2, name: "Chapter Two: Servants of Two Masters", overview: "Blackthorne's arrival in Osaka stirs the rival regents.", runtime: 57, still_path: "/2rmK7mnchw9Xr3XdiTFSxTTvYQI.jpg" },
        { episode_number: 3, name: "Chapter Three: Tomorrow is Tomorrow", overview: "After Blackthorne survives an assassination attempt, Toranaga must smuggle his allies out of Osaka.", runtime: 55, still_path: "/2rmK7mnchw9Xr3XdiTFSxTTvYQI.jpg" },
        { episode_number: 4, name: "Chapter Four: The Eightfold Fence", overview: "Blackthorne and Mariko test their new alliance as they train Toranaga’s gunnery squad.", runtime: 61, still_path: "/2rmK7mnchw9Xr3XdiTFSxTTvYQI.jpg" }
      ]
    }
  },
  {
    id: 94605,
    name: "Arcane",
    title: "Arcane",
    tagline: "Every legend has a beginning.",
    poster_path: "/abf8tHzcvTF9zv6nhJ1mpRKOES2.jpg",
    backdrop_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg",
    vote_average: 8.7,
    first_air_date: "2021-11-06",
    release_date: "2021-11-06",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
    genres: [{ id: 16, name: "Animation" }, { id: 10765, name: "Sci-Fi & Fantasy" }, { id: 28, name: "Action" }],
    number_of_seasons: 2,
    number_of_episodes: 18,
    media_type: "tv",
    category: ["trending", "popular", "top-rated"],
    seasons: [
      { season_number: 1, name: "Season 1", episode_count: 9, overview: "The origin story of sisters Vi and Powder." },
      { season_number: 2, name: "Season 2", episode_count: 9, overview: "War between Piltover and Zaun escalates." }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "Welcome to the Playground", overview: "Orphaned sisters Vi and Powder lead a crew into wealthy Piltover.", runtime: 43, still_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg" },
        { episode_number: 2, name: "Some Mysteries Are Better Left Unsolved", overview: "Idealistic inventor Jayce faces punishment for studying forbidden magic.", runtime: 41, still_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg" },
        { episode_number: 3, name: "The Base Violence Necessary for Change", overview: "An epic showdown between old rivals leads to a fatal parting.", runtime: 44, still_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg" }
      ]
    }
  },
  {
    id: 66732,
    name: "Stranger Things",
    title: "Stranger Things",
    tagline: "Every ending has a beginning.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    vote_average: 8.6,
    first_air_date: "2016-07-15",
    release_date: "2016-07-15",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }, { id: 18, name: "Drama" }, { id: 9648, name: "Mystery" }],
    number_of_seasons: 4,
    number_of_episodes: 34,
    media_type: "tv",
    category: ["popular", "top-rated"],
    seasons: [
      { season_number: 1, name: "Season 1", episode_count: 8, overview: "The disappearance of Will Byers." },
      { season_number: 2, name: "Season 2", episode_count: 9, overview: "The shadow monster approaches." }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "Chapter One: The Vanishing of Will Byers", overview: "On his way home from a friend's house, young Will sees something terrifying.", runtime: 48, still_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg" },
        { episode_number: 2, name: "Chapter Two: The Weirdo on Maple Street", overview: "Mike hides Eleven in his bedroom. Dustin and Lucas want to find Will.", runtime: 55, still_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg" }
      ]
    }
  }
];

// Fallback Anime dataset (modeled as TMDB TV series)
const fallbackAnime = [
  {
    id: 1429,
    name: "Attack on Titan",
    title: "Attack on Titan",
    tagline: "If you win, you live. If you lose, you die.",
    poster_path: "/hTP1dtwGFamzeL2V9VjvtGlZXGR.jpg",
    backdrop_path: "/m03bEi8qvmsT7shNOFc7KaMNTkb.jpg",
    vote_average: 8.7,
    first_air_date: "2013-04-07",
    release_date: "2013-04-07",
    overview: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    genres: [{ id: 16, name: "Animation" }, { id: 10759, name: "Action & Adventure" }, { id: 10765, name: "Sci-Fi & Fantasy" }],
    number_of_seasons: 4,
    number_of_episodes: 87,
    media_type: "tv",
    category: ["anime", "trending", "top-rated"],
    seasons: [
      { season_number: 1, name: "Season 1", episode_count: 25, overview: "The fall of Wall Maria." },
      { season_number: 2, name: "Season 2", episode_count: 12, overview: "Clash of the Titans." }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "To You, in 2000 Years: The Fall of Shiganshina, Part 1", overview: "After 100 years of peace, the Colossal Titan suddenly attacks Shiganshina.", runtime: 24, still_path: "/m03bEi8qvmsT7shNOFc7KaMNTkb.jpg" },
        { episode_number: 2, name: "That Day: The Fall of Shiganshina, Part 2", overview: "The Armored Titan breaches Wall Maria. Refugees flee toward Wall Rose.", runtime: 24, still_path: "/m03bEi8qvmsT7shNOFc7KaMNTkb.jpg" },
        { episode_number: 3, name: "A Dim Light Amid Despair: Humanity's Comeback, Part 1", overview: "Eren, Mikasa and Armin begin their training in the 104th Cadet Corps.", runtime: 24, still_path: "/m03bEi8qvmsT7shNOFc7KaMNTkb.jpg" }
      ]
    }
  },
  {
    id: 85937,
    name: "Demon Slayer: Kimetsu no Yaiba",
    title: "Demon Slayer: Kimetsu no Yaiba",
    tagline: "Set your heart ablaze.",
    poster_path: "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    backdrop_path: "/nTvM4mhqZlHIvUkI1gVnWumNuSl.jpg",
    vote_average: 8.6,
    first_air_date: "2019-04-06",
    release_date: "2019-04-06",
    overview: "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. His younger sister Nezuko, the sole survivor, has been transformed into a demon.",
    genres: [{ id: 16, name: "Animation" }, { id: 10759, name: "Action & Adventure" }],
    number_of_seasons: 4,
    number_of_episodes: 55,
    media_type: "tv",
    category: ["anime", "popular", "trending"],
    seasons: [
      { season_number: 1, name: "Season 1: Tanjiro Kamado, Unwavering Resolve Arc", episode_count: 26, overview: "Tanjiro's quest begins." }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "Cruelty", overview: "Tanjiro returns home to find his family slaughtered by a demon.", runtime: 24, still_path: "/nTvM4mhqZlHIvUkI1gVnWumNuSl.jpg" },
        { episode_number: 2, name: "Trainer Sakonji Urokodaki", overview: "Tanjiro travels to Mt. Sagiri to find Urokodaki.", runtime: 24, still_path: "/nTvM4mhqZlHIvUkI1gVnWumNuSl.jpg" }
      ]
    }
  },
  {
    id: 209867,
    name: "Frieren: Beyond Journey's End",
    title: "Frieren: Beyond Journey's End",
    tagline: "The adventure is over, but life goes on.",
    poster_path: "/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",
    backdrop_path: "/9kyK47rBfW5YkYv3NnU6wWl0gQp.jpg",
    vote_average: 8.9,
    first_air_date: "2023-09-29",
    release_date: "2023-09-29",
    overview: "The adventure is over but life goes on for an elf mage just beginning to learn what living is all about. Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land.",
    genres: [{ id: 16, name: "Animation" }, { id: 10765, name: "Sci-Fi & Fantasy" }, { id: 18, name: "Drama" }],
    number_of_seasons: 1,
    number_of_episodes: 28,
    media_type: "tv",
    category: ["anime", "top-rated"],
    seasons: [
      { season_number: 1, name: "Season 1", episode_count: 28, overview: "Frieren begins a journey to the land of souls." }
    ],
    episodes: {
      1: [
        { episode_number: 1, name: "The Journey's End", overview: "After a ten-year quest, the hero party returns triumphant.", runtime: 25, still_path: "/9kyK47rBfW5YkYv3NnU6wWl0gQp.jpg" },
        { episode_number: 2, name: "It Didn't Have to Be Magic...", overview: "Frieren trains Fern in magic as years pass in a blink.", runtime: 24, still_path: "/9kyK47rBfW5YkYv3NnU6wWl0gQp.jpg" }
      ]
    }
  }
];

// Helper to fetch from TMDB with timeout
async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JazzHub-Server/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TMDB responded with status ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const tmdbService = {
  // ----------------------------------------------------
  // MOVIES
  // ----------------------------------------------------
  getTrending: async (timeWindow = 'week') => {
    try {
      const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      console.warn(`[TMDB] Trending fetch failed (${err.message}). Using resilient catalog.`);
      return fallbackMovies.filter(m => m.category.includes('trending')).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  getPopular: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/movie/popular', { page });
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      console.warn(`[TMDB] Popular fetch failed (${err.message}). Using resilient catalog.`);
      return fallbackMovies.filter(m => m.category.includes('popular')).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  getTopRated: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/movie/top_rated', { page });
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      console.warn(`[TMDB] Top Rated fetch failed (${err.message}). Using resilient catalog.`);
      return fallbackMovies.filter(m => m.category.includes('top-rated')).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  getUpcoming: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/movie/upcoming', { page });
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      console.warn(`[TMDB] Upcoming fetch failed (${err.message}). Using resilient catalog.`);
      return fallbackMovies.filter(m => m.category.includes('upcoming')).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  searchMovies: async (query, page = 1) => {
    if (!query || !query.trim()) return [];
    try {
      const data = await fetchFromTMDB('/search/movie', { query: query.trim(), page });
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      console.warn(`[TMDB] Search fetch failed (${err.message}). Searching fallback catalog.`);
      const q = query.trim().toLowerCase();
      return fallbackMovies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        (m.genres && m.genres.some(g => g.name.toLowerCase().includes(q)))
      ).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  getMovieDetails: async (id) => {
    if (!id) return null;
    try {
      const data = await fetchFromTMDB(`/movie/${id}`, {
        append_to_response: 'credits,similar'
      });
      return { ...data, media_type: 'movie' };
    } catch (err) {
      console.warn(`[TMDB] Movie Details fetch for ID ${id} failed (${err.message}). Checking fallback catalog.`);
      const local = fallbackMovies.find(m => String(m.id) === String(id));
      if (local) {
        return {
          ...local,
          media_type: 'movie',
          credits: local.credits || { cast: [] },
          similar: {
            results: fallbackMovies.filter(m => String(m.id) !== String(id)).slice(0, 6)
          }
        };
      }
      return null;
    }
  },

  getSimilarMovies: async (id) => {
    if (!id) return [];
    try {
      const data = await fetchFromTMDB(`/movie/${id}/similar`);
      return (data.results || []).map(m => ({ ...m, media_type: 'movie' }));
    } catch (err) {
      return fallbackMovies.filter(m => String(m.id) !== String(id)).slice(0, 6).map(m => ({ ...m, media_type: 'movie' }));
    }
  },

  // ----------------------------------------------------
  // TV SERIES & ANIME
  // ----------------------------------------------------
  getTrendingTV: async (timeWindow = 'week') => {
    try {
      const data = await fetchFromTMDB(`/trending/tv/${timeWindow}`);
      return (data.results || []).map(t => ({ ...t, title: t.name || t.title, media_type: 'tv' }));
    } catch (err) {
      return fallbackTV.map(t => ({ ...t, media_type: 'tv' }));
    }
  },

  getPopularTV: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/tv/popular', { page });
      return (data.results || []).map(t => ({ ...t, title: t.name || t.title, media_type: 'tv' }));
    } catch (err) {
      return fallbackTV.map(t => ({ ...t, media_type: 'tv' }));
    }
  },

  getTopRatedTV: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/tv/top_rated', { page });
      return (data.results || []).map(t => ({ ...t, title: t.name || t.title, media_type: 'tv' }));
    } catch (err) {
      return fallbackTV.map(t => ({ ...t, media_type: 'tv' }));
    }
  },

  // Discover Anime (TV shows with animation genre 16 and origin country JP)
  getAnime: async (page = 1) => {
    try {
      const data = await fetchFromTMDB('/discover/tv', {
        with_genres: '16',
        with_origin_country: 'JP',
        sort_by: 'popularity.desc',
        page
      });
      return (data.results || []).map(a => ({ ...a, title: a.name || a.title, media_type: 'tv', is_anime: true }));
    } catch (err) {
      return fallbackAnime.map(a => ({ ...a, media_type: 'tv', is_anime: true }));
    }
  },

  getTVDetails: async (id) => {
    if (!id) return null;
    try {
      const data = await fetchFromTMDB(`/tv/${id}`, {
        append_to_response: 'credits,similar'
      });
      return {
        ...data,
        title: data.name || data.title,
        release_date: data.first_air_date || data.release_date,
        media_type: 'tv'
      };
    } catch (err) {
      const allTV = [...fallbackTV, ...fallbackAnime];
      const local = allTV.find(t => String(t.id) === String(id));
      if (local) {
        return {
          ...local,
          media_type: 'tv',
          credits: local.credits || { cast: [] },
          similar: {
            results: allTV.filter(t => String(t.id) !== String(id)).slice(0, 6)
          }
        };
      }
      return null;
    }
  },

  getTVSeasonDetails: async (seriesId, seasonNumber) => {
    const s = parseInt(seasonNumber, 10);
    try {
      const data = await fetchFromTMDB(`/tv/${seriesId}/season/${s}`);
      return data;
    } catch (err) {
      const allTV = [...fallbackTV, ...fallbackAnime];
      const local = allTV.find(t => String(t.id) === String(seriesId));
      if (local && local.episodes && local.episodes[s]) {
        return {
          id: s,
          season_number: s,
          name: `Season ${s}`,
          episodes: local.episodes[s]
        };
      }
      return {
        season_number: s,
        name: `Season ${s}`,
        episodes: [
          { episode_number: 1, name: "Episode 1", overview: "The journey begins.", runtime: 45 },
          { episode_number: 2, name: "Episode 2", overview: "New challenges arise.", runtime: 48 }
        ]
      };
    }
  },

  getTVEpisodeDetails: async (seriesId, seasonNumber, episodeNumber) => {
    const s = parseInt(seasonNumber, 10);
    const ep = parseInt(episodeNumber, 10);
    try {
      const data = await fetchFromTMDB(`/tv/${seriesId}/season/${s}/episode/${ep}`);
      return data;
    } catch (err) {
      const seasonData = await tmdbService.getTVSeasonDetails(seriesId, s);
      const match = seasonData?.episodes?.find(e => e.episode_number === ep);
      return match || {
        episode_number: ep,
        season_number: s,
        name: `Episode ${ep}`,
        overview: "Episode overview."
      };
    }
  },

  // ----------------------------------------------------
  // MULTI-SEARCH (Movies, TV, Anime)
  // ----------------------------------------------------
  searchMulti: async (query, page = 1) => {
    if (!query || !query.trim()) return [];
    try {
      const data = await fetchFromTMDB('/search/multi', { query: query.trim(), page });
      return (data.results || [])
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(item => ({
          ...item,
          title: item.title || item.name,
          release_date: item.release_date || item.first_air_date
        }));
    } catch (err) {
      const q = query.trim().toLowerCase();
      const movieMatches = fallbackMovies.filter(m =>
        m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q)
      ).map(m => ({ ...m, media_type: 'movie' }));

      const allTV = [...fallbackTV, ...fallbackAnime];
      const tvMatches = allTV.filter(t =>
        (t.name || t.title).toLowerCase().includes(q) || t.overview.toLowerCase().includes(q)
      ).map(t => ({ ...t, title: t.name || t.title, media_type: 'tv' }));

      return [...movieMatches, ...tvMatches];
    }
  }
};
