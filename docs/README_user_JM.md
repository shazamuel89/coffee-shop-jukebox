# How to Run the Coffee Shop Jukebox (JM)

## Prerequisites
- **Node.js v18+**: https://nodejs.org
- (Optional) **Git**: https://git-scm.com

---

## Setup (Windows)

```bat
REM 1) Clone the repo (or download & unzip)
cd C:\Jukebox
git clone https://github.com/shazamuel89/coffee-shop-jukebox.git
cd coffee-shop-jukebox\backend

REM 2) Install dependencies
npm install

REM 3) Create your local env file from the example
copy .env.example .env

REM 4) Ensure the port is set
REM Open .env and set:  PORT=3001

REM 5) Run the server (auto-restarts on changes)
npm run dev
You should see: Server running on port 3001

Quick Tests
Health check
http://localhost:3001/api/health

Current queue (empty at first)
http://localhost:3001/api/queue

Add a song (Command Prompt)
bat
Copy code
curl -X POST http://localhost:3001/api/queue -H "Content-Type: application/json" -d "{\"title\":\"Blinding Lights\",\"artist\":\"The Weeknd\",\"requestedBy\":\"Jonah\"}"
Vote / Delete (Command Prompt)
bat
Copy code
REM Get an ID from GET /api/queue, then:
set ID=<paste-id>

REM Vote up
curl -X PATCH http://localhost:3001/api/queue/%ID%/vote -H "Content-Type: application/json" -d "{\"dir\":\"up\"}"

REM Delete item
curl -X DELETE http://localhost:3001/api/queue/%ID%
Optional: Real Spotify Search
Create an app at https://developer.spotify.com to get Client ID and Client Secret.

Put them in backend/.env:

ini
Copy code
SPOTIFY_CLIENT_ID=your_id_here
SPOTIFY_CLIENT_SECRET=your_secret_here
Restart the backend: npm run dev

Try: http://localhost:3001/api/search?q=weeknd

(If keys are not set, /api/search returns mock results for the demo.)

Troubleshooting
Wrong port / can’t connect
Ensure .env has PORT=3001 and the console shows Server running on port 3001.

Cannot DELETE/PATCH (405/404)
Restart the server after adding new routes (Ctrl+C → npm run dev).
Make sure you’re using the path parameter style:

bash
Copy code
/api/queue/<id>/vote
/api/queue/<id>
ID not found
Use a fresh ID from GET /api/queue. IDs are case-sensitive.

CORS issues
CORS is enabled on the backend; frontend on a different port should work.

Demo Flow
Add → 2) List → 3) Vote (up/down) → 4) Delete
Plus: Health check and Search (mock by default; real if Spotify keys provided).