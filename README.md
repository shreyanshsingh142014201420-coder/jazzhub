# 🎷 JazzHub — Production-Ready Full-Stack Movie Platform

**JazzHub** is a cinematic, full-stack movie discovery web application architected for production deployment on **Amazon Web Services (AWS EC2)**. Powered by React, Vite, Node.js, Express, and The Movie Database (TMDB) API, it provides a seamless streaming-style interface for exploring trending blockbusters, critically acclaimed masterpieces, and upcoming premieres worldwide.

---

## 🌟 Features

- **Cinematic Dark Interface**: Immersive radial backdrop lighting, golden accents (`#f59e0b`), smooth card transformations, and responsive typography using Google Fonts *Outfit* & *Plus Jakarta Sans*.
- **Hero Spotlight**: Dynamic featured title with rating badges, release year, genres, synopsis, and quick-access actions.
- **Curated Movie Sections**: Horizontally scrollable rows for *Trending Now*, *Popular Movies*, *Top Rated Cinema*, and *Upcoming Premieres* with directional controls.
- **Deep Movie Details (`/movie/:id`)**: High-resolution TMDB backdrops, posters, ratings, runtimes, genres, overview, top cast avatar chips, and "More Like This" similar recommendations with robust 404 error handling.
- **Live TMDB Search (`/search`)**: Real-time querying across titles, genres, and cast with genre filter pills, loading states, and empty result feedback.
- **Personal Watchlist (`/watchlist`)**: Client-side queue with `localStorage` persistence, quick bookmark buttons on all cards, navbar counter badge, and clear controls.
- **Security & Separation of Concerns**: Strict architectural isolation. TMDB API keys are guarded exclusively inside the Node.js backend; the frontend never touches or exposes external API credentials.
- **AWS EC2 Production-Ready**: Preconfigured with Nginx reverse proxy configurations, PM2 process ecosystem files, and full Linux deployment scripts.

---

## 🏗️ Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │                     AWS EC2 (Ubuntu)                   │
               │                                                        │
Client Browser │   Port 80 (HTTP)                                       │
     ──────────┼──▶ Nginx Web Server                                    │
               │        │                                               │
               │        ├── / ─────────▶ React Static Build             │
               │        │                (/var/www/jazzhub/client/dist) │
               │        │                                               │
               │        └── /api/ ─────▶ Express Server (Port 5000)     │
               │                         (Managed via PM2)              │
               │                                │                       │
               └────────────────────────────────┼───────────────────────┘
                                                ▼
                                         TMDB API v3
                                  (https://api.themoviedb.org/3)
```

---

## 🧰 Tech Stack

### Frontend (`client/`)
- **React 19**
- **Vite**
- **React Router 7**
- **Lucide React** (Icons)
- **Modular Vanilla CSS**

### Backend (`server/`)
- **Node.js** (v20+ LTS)
- **Express.js**
- **CORS**
- **Dotenv**
- **TMDB API Service Layer**

### Production & Infrastructure
- **AWS EC2** (Ubuntu Linux)
- **Nginx** (Reverse Proxy & Static Web Server)
- **PM2** (Process Manager & Daemon)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/jazzhub.git
cd jazzhub

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Inside `server/.env`:
```env
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
NODE_ENV=development
```

### 3. Start Local Servers
In one terminal, start the Express backend:
```bash
cd server
npm run dev
# Server running at: http://localhost:5000
```

In a second terminal, start the Vite frontend:
```bash
cd client
npm run dev
# Client running at: http://localhost:3000
```

Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Production Build

To build the client for production:
```bash
cd client
npm run build
```
This produces an optimized production bundle in `client/dist`.

---

## ☁️ AWS EC2 Deployment

For complete, step-by-step instructions on launching an EC2 instance, configuring Security Groups (ports 22, 80, 443), setting up Nginx, and managing the server with PM2, please see:

👉 **[AWS_DEPLOYMENT.md](file:///c:/Users/shrey/Downloads/lloi/AWS_DEPLOYMENT.md)**

---

## 🔒 Security Notice

- The `TMDB_API_KEY` is kept **strictly** in `server/.env`.
- `.env` files and `node_modules` are excluded from version control via `.gitignore`.
- Port 5000 is **not** exposed to public traffic in production; all external requests flow through Nginx over port 80/443.

---

## 📄 License
MIT License. Free to use for educational and personal projects.
