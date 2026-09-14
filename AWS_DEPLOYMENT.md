# 🚀 JazzHub — AWS EC2 Production Deployment Guide

This guide walks you through deploying **JazzHub** onto an **Amazon EC2 (Ubuntu Linux)** instance from scratch using **Nginx**, **Node.js**, **PM2**, and the **TMDB API**.

---

## 📋 Architectural Overview

```text
User Browser
    │  (HTTP Port 80 / HTTPS Port 443)
    ▼
AWS EC2 Security Group
    ▼
Nginx Web Server
    ├─── /             ──▶ Serves Prebuilt React Static Bundle (client/dist)
    └─── /api/movies/* ──▶ Reverse Proxy to Express Server (127.0.0.1:5000)
                                 │
                                 ▼
                         PM2 Process Manager
                                 │
                                 ▼
                         Node.js / Express Backend
                                 │
                                 ▼
                         TMDB API v3 (api.themoviedb.org)
```

---

## Step 1: Launch an AWS EC2 Ubuntu Instance

1. Log into your [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Navigate to **EC2** → Click **Launch instance**.
3. Configure the instance:
   - **Name**: `jazzhub-production`
   - **OS Image (AMI)**: **Ubuntu Server 24.04 LTS** (or 22.04 LTS), 64-bit (x86).
   - **Instance Type**: `t2.micro` (Eligible for AWS Free Tier) or `t3.small`.
   - **Key Pair**: Select an existing key pair or create a new one (e.g. `jazzhub-key.pem`). Download and save it securely.
4. **Network Settings (Security Group)**:
   - Check **Allow SSH traffic from** `My IP` (Port 22)
   - Check **Allow HTTP traffic from the internet** (Port 80)
   - Check **Allow HTTPS traffic from the internet** (Port 443)
   > ⚠️ **Note**: Do **NOT** open port 5000 to the public internet. Port 5000 stays private inside the EC2 instance; Nginx forwards traffic internally.
5. Click **Launch Instance**. Wait 1–2 minutes until the status shows **Running**.
6. Copy your **Public IPv4 address** (e.g. `54.210.85.120`).

---

## Step 2: Connect to your EC2 Instance via SSH

Open your local terminal (PowerShell, Command Prompt, or Mac/Linux Terminal) and run:

```bash
# On Linux/macOS: ensure correct key permissions
chmod 400 jazzhub-key.pem

# Connect using SSH
ssh -i "jazzhub-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Update System Packages & Install Node.js

Once logged into Ubuntu, update the package repository and install **Node.js (v20 LTS or v22 LTS)**:

```bash
sudo apt update && sudo apt upgrade -y

# Install Node.js LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Verify installation
node -v    # e.g., v20.x.x
npm -v     # e.g., 10.x.x
```

---

## Step 4: Install Nginx Web Server

```bash
sudo apt install -y nginx

# Verify Nginx status
sudo systemctl status nginx
```

---

## Step 5: Install PM2 (Process Manager)

PM2 keeps your Node.js Express server running continuously in the background and restarts it automatically on system reboots:

```bash
sudo npm install -g pm2
```

---

## Step 6: Clone the JazzHub Repository

Clone the project into `/var/www/jazzhub`:

```bash
# Ensure /var/www exists and give ubuntu user ownership
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

# Clone repository
cd /var/www
git clone https://github.com/YOUR_GITHUB_USERNAME/jazzhub.git /var/www/jazzhub
cd /var/www/jazzhub
```

---

## Step 7: Install Dependencies

Install dependencies for both the backend and frontend:

```bash
# 1. Install Backend Dependencies
cd /var/www/jazzhub/server
npm install --production

# 2. Install Frontend Dependencies
cd /var/www/jazzhub/client
npm install
```

---

## Step 8: Create the Backend `.env` File

Create the `.env` file in the `server` directory:

```bash
cd /var/www/jazzhub/server
nano .env
```

Paste the configuration:

```env
TMDB_API_KEY=YOUR_TMDB_API_KEY
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
```

> 💡 *To save and exit nano: press `Ctrl + O`, hit `Enter`, then press `Ctrl + X`.*

---

## Step 9: Build the React Frontend

Compile the React frontend into static, production-optimized assets:

```bash
cd /var/www/jazzhub/client
npm run build
```

Verify that the `dist` folder has been generated:

```bash
ls -la /var/www/jazzhub/client/dist
# You should see index.html, assets/, and favicon
```

---

## Step 10: Configure Nginx as a Reverse Proxy

Remove the default Nginx welcome site and link the JazzHub configuration:

```bash
# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Copy or symlink the JazzHub Nginx configuration
sudo cp /var/www/jazzhub/nginx/jazzhub.conf /etc/nginx/sites-available/jazzhub
sudo ln -s /etc/nginx/sites-available/jazzhub /etc/nginx/sites-enabled/

# Test Nginx configuration for syntax correctness
sudo nginx -t
```

Output should show:
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Reload Nginx:

```bash
sudo systemctl restart nginx
```

---

## Step 11: Start the Node.js Backend with PM2

Start the Express backend using PM2 and configure it to boot automatically:

```bash
cd /var/www/jazzhub/server

# Start the Express server
pm2 start server.js --name jazzhub

# Save PM2 state
pm2 save

# Set PM2 to launch on server reboots
pm2 startup
# (Run the sudo command that PM2 prints in the terminal if prompted)
```

Verify that PM2 shows `jazzhub` with status **online**:

```bash
pm2 status
```

---

## Step 12: Configure the AWS EC2 Security Group

Ensure your EC2 Security Group inbound rules match the following:

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | 22 | Your IP / 0.0.0.0/0 | Remote server management |
| **HTTP** | TCP | 80 | 0.0.0.0/0 | Public web traffic for JazzHub |
| **HTTPS** | TCP | 443 | 0.0.0.0/0 | SSL/TLS encrypted traffic |

*(Do **NOT** add port 5000; Nginx proxies requests to it internally on localhost).*

---

## Step 13: Access JazzHub!

Open your web browser and navigate to:

```text
http://YOUR_EC2_PUBLIC_IP
```

You will see:
- 🎬 The full **JazzHub** cinematic landing page with featured hero spotlight.
- 🍿 Trending, Popular, Top Rated, and Upcoming rows populated via your Express backend & TMDB.
- 🔍 Live TMDB search (`/search?q=...`).
- ℹ️ Dynamic Movie Details (`/movie/:id`) with cast, backdrop, and similar movies.
- 📌 Persistent browser watchlist (`/watchlist`).

---

## 🛠️ Helpful Management Commands

### Viewing Backend Logs
```bash
pm2 logs jazzhub
```

### Restarting the Backend
```bash
pm2 restart jazzhub
```

### Checking Backend Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Updating Code from GitHub
```bash
cd /var/www/jazzhub
git pull origin main

# Rebuild frontend
cd client && npm install && npm run build

# Restart backend
pm2 restart jazzhub
```

🎉 **Congratulations! Your JazzHub full-stack production application is live on AWS EC2!**
