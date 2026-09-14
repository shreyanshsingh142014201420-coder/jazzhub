# 🚀 JazzHub — AWS EC2 Production Deployment Guide

A step-by-step production deployment guide for **JazzHub** on an **AWS EC2 Ubuntu 22.04 / 24.04 LTS** instance using **Nginx**, **Node.js LTS**, **PM2**, and **Vite**.

---

## 🏗️ Architecture Overview

```text
Internet
   │
   ▼  (Port 80 HTTP / Port 443 HTTPS)
AWS EC2 Security Group
   │
   ▼
Nginx (Reverse Proxy & Web Server)
   ├── /             ──▶ Serves React Production Static Build (/var/www/jazzhub/client/dist)
   │                     (Includes SPA fallback: try_files $uri $uri/ /index.html)
   │
   └── /api/*        ──▶ Proxies internally to http://127.0.0.1:5000
                           │
                           ▼
                   PM2 Process Manager (jazzhub-api)
                           │
                           ▼
                   Express.js Backend (server/server.js)
                           │
                           ▼
                   TMDB API (api.themoviedb.org)
```

---

## 🔒 AWS EC2 Security Group Inbound Rules

Configure your EC2 Security Group with **only** the required ports. Keep port `5000` closed to the internet (Nginx proxies to it internally on localhost):

| Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `My IP` (recommended) or `0.0.0.0/0` | Secure remote shell access |
| **HTTP** | `80` | `0.0.0.0/0` | Web traffic (JazzHub frontend & API) |
| **HTTPS** | `443` | `0.0.0.0/0` | Encrypted SSL/TLS web traffic |

> ⚠️ **IMPORTANT:** Never open port `5000` to `0.0.0.0/0`. The Express server runs internally behind Nginx.

---

## 📋 Step-by-Step Deployment Instructions

### Step 1 — Connect to EC2 via SSH

Open your local terminal and connect to your EC2 instance:

```bash
# On Linux / macOS, ensure correct permissions for your key:
chmod 400 YOUR_KEY.pem

# SSH into your EC2 Ubuntu instance:
ssh -i "YOUR_KEY.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### Step 2 — Update System Packages

Update Ubuntu package indexes and upgrade existing packages:

```bash
sudo apt update && sudo apt upgrade -y
```

---

### Step 3 — Install Node.js LTS (v20)

Install Node.js 20 LTS via the official NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation:
node -v
npm -v
```

---

### Step 4 — Install Git & Build Tools

```bash
sudo apt install git build-essential -y
```

---

### Step 5 — Clone the Repository

Prepare the deployment directory `/var/www/jazzhub` and clone your project:

```bash
# Create directory and assign ownership to the ubuntu user
sudo mkdir -p /var/www/jazzhub
sudo chown -R ubuntu:ubuntu /var/www/jazzhub

# Clone your repository
git clone YOUR_GITHUB_REPOSITORY_URL /var/www/jazzhub
cd /var/www/jazzhub
```

---

### Step 6 — Install Dependencies

Install root, backend, and frontend dependencies:

```bash
cd /var/www/jazzhub

# 1. Install Backend Dependencies
cd server
npm install --omit=dev

# 2. Install Frontend Dependencies
cd ../client
npm install

# Return to project root
cd ..
```

---

### Step 7 — Configure Backend Environment Variables (`.env`)

Create the production `.env` inside the `server/` directory.

> 🔒 **Security Notice:** The `.env` file must live strictly on the server and is excluded by `.gitignore`. Never commit real API keys to GitHub or expose them to the frontend.

```bash
cd /var/www/jazzhub/server
cp .env.example .env
nano .env
```

Set your production variables:

```env
NODE_ENV=production
PORT=5000

# TMDB API Key from https://www.themoviedb.org/settings/api
TMDB_API_KEY=YOUR_TMDB_API_KEY

# Frontend origin allowed by CORS
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP

# Optional: External authorized playback provider URL
PLAYBACK_PROVIDER_URL=
PLAYBACK_PROVIDER_API_KEY=YOUR_KEY
ALLOW_DEMO_PLAYBACK=false
```

*(Press `Ctrl + O`, then `Enter` to save, and `Ctrl + X` to exit `nano`).*

---

### Step 8 — Build the React Frontend

Compile the React frontend into static, production-optimized assets:

```bash
cd /var/www/jazzhub/client
npm run build
```

Verify that the production build was created:

```bash
ls -la /var/www/jazzhub/client/dist
# Should list: index.html, assets/, and static files
```

---

### Step 9 — Start the Backend with PM2

Install **PM2** globally to keep the Express server running continuously, restart on crashes, and auto-start on server reboots:

```bash
sudo npm install -g pm2

cd /var/www/jazzhub

# Start backend using the provided PM2 configuration:
pm2 start ecosystem.config.cjs

# Save PM2 process list:
pm2 save

# Setup PM2 to automatically start on system reboots:
pm2 startup
# (Copy and run the sudo env PATH=... command printed in terminal if prompted)
```

Verify the process is active:

```bash
pm2 status
```

You should see `jazzhub-api` with status **online**.

---

### Step 10 — Install & Configure Nginx

Install Nginx:

```bash
sudo apt install nginx -y
```

Copy the JazzHub Nginx configuration:

```bash
sudo cp /var/www/jazzhub/nginx/jazzhub.conf /etc/nginx/sites-available/jazzhub
```

---

### Step 11 — Enable Nginx Site & Restart

Disable the default site, enable the JazzHub configuration, test syntax, and restart:

```bash
# Disable default site if active
sudo rm -f /etc/nginx/sites-enabled/default

# Enable JazzHub site
sudo ln -sf /etc/nginx/sites-available/jazzhub /etc/nginx/sites-enabled/jazzhub

# Test syntax
sudo nginx -t
```

Output should show:
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Restart Nginx:

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### Step 12 — Test Your Production Deployment

#### 1. Test Backend Health Check:
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "JazzHub API",
  "environment": "production"
}
```

#### 2. Test Nginx Proxy Endpoint:
```bash
curl http://YOUR_EC2_PUBLIC_IP/api/health
```

#### 3. Open JazzHub in your Browser:
Visit:
```text
http://YOUR_EC2_PUBLIC_IP
```

You will see the complete **JazzHub** Dark Cinematic experience:
- 🎬 Live Hero Spotlight Banner
- 🍿 Trending, Popular, Top Rated, and Upcoming rows
- 🔍 Live Multi-Search with instant modal results
- ℹ️ Detailed Movie & TV pages (`/movie/:id`, `/tv/:id`)
- 📌 Persistent Watchlist
- 🎥 Cinema Video Player with dynamic state handling

Refresh any direct link (e.g. `http://YOUR_EC2_PUBLIC_IP/popular` or `http://YOUR_EC2_PUBLIC_IP/movie/550`) to verify SPA client-side routing works seamlessly with zero 404s.

---

## 🌐 Custom Domain & Free SSL (HTTPS with Let's Encrypt)

When you are ready to point your domain (e.g., `example.com` and `www.example.com`) to your EC2 instance:

### 1. Point DNS A-Record
In your DNS provider (Route 53, Cloudflare, Namecheap, GoDaddy, etc.):
- Add an **A Record**: `@` points to `YOUR_EC2_PUBLIC_IP`
- Add an **A Record** (or CNAME): `www` points to `YOUR_EC2_PUBLIC_IP`

### 2. Update `server_name` in Nginx
Edit `/etc/nginx/sites-available/jazzhub`:
```nginx
server_name example.com www.example.com;
```
Reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Update `FRONTEND_URL` in `server/.env`
```env
FRONTEND_URL=https://example.com
```
Restart backend:
```bash
pm2 restart jazzhub-api
```

### 4. Obtain Free SSL Certificate with Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d example.com -d www.example.com
```
Certbot will automatically configure HTTPS redirection and renew your certificates automatically.

---

## 🛠️ Production Monitoring & Useful Commands

| Task | Command |
| :--- | :--- |
| **View Live Backend Logs** | `pm2 logs jazzhub-api` |
| **Check Backend Status** | `pm2 status` |
| **Restart Backend** | `pm2 restart jazzhub-api` |
| **Stop Backend** | `pm2 stop jazzhub-api` |
| **Test Nginx Syntax** | `sudo nginx -t` |
| **Restart Nginx** | `sudo systemctl restart nginx` |
| **Check Nginx Status** | `sudo systemctl status nginx` |
| **View Nginx Access Logs** | `sudo tail -f /var/log/nginx/access.log` |
| **View Nginx Error Logs** | `sudo tail -f /var/log/nginx/error.log` |

---

## ⚡ Updating Code After Changes

When you push new updates to GitHub, deploy the changes with:

```bash
cd /var/www/jazzhub
git pull origin main

# Rebuild frontend
cd client
npm install
npm run build

# Restart backend if server code changed
cd ..
pm2 restart jazzhub-api
```

---

## ⚡ EC2 Deployment — Run These Commands

A concise, copy-paste sequence to execute directly on your EC2 Ubuntu instance:

```bash
# 1. Update system & install Node.js 20, Git, and Nginx
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx
sudo npm install -g pm2

# 2. Setup project folder & clone
sudo mkdir -p /var/www/jazzhub
sudo chown -R ubuntu:ubuntu /var/www/jazzhub
git clone YOUR_GITHUB_REPOSITORY_URL /var/www/jazzhub
cd /var/www/jazzhub

# 3. Install dependencies
cd server && npm install --omit=dev
cd ../client && npm install && npm run build
cd ..

# 4. Configure .env
cp server/.env.example server/.env
# Edit server/.env with: nano server/.env (Set your TMDB_API_KEY and FRONTEND_URL)

# 5. Start Backend with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# 6. Configure & Restart Nginx
sudo cp nginx/jazzhub.conf /etc/nginx/sites-available/jazzhub
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/jazzhub /etc/nginx/sites-enabled/jazzhub
sudo nginx -t
sudo systemctl restart nginx
```
