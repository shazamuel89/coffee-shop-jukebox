# **Coffee Shop Jukebox - PEN Stack (PostgreSQL, Express/Node, Vanilla JS)**
Software Engineering Group Project - Fall 2025

**Coffee Shop Jukebox is a web application that allows coffee shop customers to request, vote on, and view upcoming songs, while administrators retain control through configurable rules and management of the queue. The app integrates with the Spotify API and SDK.**

## **Table of Contents**:
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start (TL;DR)](#quick-start-tldr)
- [Full Local Setup](#full-local-setup)
- [Environment Variables](#environment-variables)
- [Database Initialization](#database-initialization)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [How to Use the Application](#how-to-use-the-application)
- [Authors](#authors)

## Overview

This README explains:
- How to run the software locally (backend, frontend, database)
- How to initialize and seed the database
- What inputs and parameters the app uses at runtime

## Prerequisites

You must have:
- **Node.js 18+**
- **npm 9+**
- **PostgreSQL 14+**
- **Git** (optional but recommended)
- **psql CLI** (for database setup)

## Quick Start (TL;DR)

```bash
git clone https://github.com/shazamuel89/coffee-shop-jukebox.git
cd coffee-shop-jukebox/backend
npm install
```

Create .env (see [Environment Variables](#environment-variables) section), then:
```bash
npm start
```

Initialize DB:
```bash
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_initialize.sql
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_seed.sql
```

Serve frontend:
```bash
cd ../frontend
npx http-server public -p 5173
```

Open:
```
http://127.0.0.1:5173
```

## Full Local Setup

### Step 1 - Clone Repo

```bash
git clone https://github.com/shazamuel89/coffee-shop-jukebox.git
cd coffee-shop-jukebox
```

### Step 2 - Install Backend Dependencies

```bash
cd backend
npm install

```

### Step 3 - Configure Environment Variables

Create a file:
```
backend/.env
```

In the file, write the following required variables:
```
PORT=3000
EXTERNAL_DATABASE_URL=your_postgres_connection_string
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

To get the required .env variables, you must create
- Your own PostgreSQL database
You can create a free PostgreSQL database at:
```
https://render.com
```
- Your own Spotify Developer App
You can create a Spotify Developer App at:
```
https://developer.spotify.com
```

## Database Initialization

Run the following with your postreSQL database's external database url:
```bash
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_initialize.sql
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_seed.sql
```

## Running the Backend

For production mode, run:
```bash
npm start
```

For dev mode, run:
```bash
npm run dev
```

The default URL for the backend is:
```
http://localhost:3000
```

To run the health check, use the URL:
```
http://localhost:3000/health
```

## Running the Frontend

### Option 1 - Simple Static Server (Recommended)

Run:
```bash
cd frontend
npx http-server public -p 5173
```

Then open the URL:
```
http://127.0.0.1:5173
```

### Option 2 - VSCode Live Server

Install VSCode, and install the VSCode Live Server extension.\
Open the project file:
```
frontend/index.html
```
Then click **Go Live** at the bottom of the window.

## How to Use the Application

1. Navigate to the frontend root URL (the index.html file opened above). This will load the queue page, which is initially empty.
2. Navigate to the request page using the nav links on the top right of the page.
3. Using the search bar, enter a song, artist, or album, or any combination of the three. The results will be fetched from Spotify and displayed below.
4. Select a track from the list.
5. A window will pop up, showing the track's information. Click the request button.
6. If your request is valid (meaning it does not break the administrator-set rules), then it will be added to the queue. Navigate back to the queue to see your requested track added.

## Authors

- [Samuel Heinrich](mailto:shazamuel89@gmail.com)
- Grace Weisel
- Adriana Garcia
- Jonah Medina

This repository is currently maintained and further developed by **Samuel Heinrich**, who designed and implemented the majority of the project, including backend and database integration.

The other authors contributed during the initial academic project phase.