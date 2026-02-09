# **Coffee Shop Jukebox - PEN Stack (PostgreSQL, Express/Node, Vanilla JS)**
Group Project - Fall 2025

---

**This project is a web application intended for coffee shops to allow customers to request, vote on, and view upcoming songs to play, with administrators retaining control through configurable rules, using the Spotify API and SDK.**

This README explains:

How to run the software locally (backend, frontend, database)

How to initialize and seed the database

What inputs and parameters the app uses at runtime

## **How to run the project locally:**

You must have Node.js, npm, and PostgreSQL installed.


**Step 1:** Clone the project and move to the project directory

```bash
git clone https://github.com/shazamuel89/coffee-shop-jukebox.git
cd coffee-shop-jukebox
```

**Step 2:** Install backend dependencies

```bash
cd backend
npm install
```

**Step 3:** Configure environment variables

* Create a file in the backend directory named .env
* Inside the file, you must add the postgreSQL PORT=3000, EXTERNAL_DATABASE_URL, SPOTIFY_CLIENT_ID, and SPOTIFY_CLIENT_SECRET. However, the actual content of the Spotify .env variables cannot be uploaded to github, so if you need to know what they are to test the project, you can email me at shazamuel89@gmail.com to request them.


**Step 4:** Initialize and seed the database

```bash
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_initialize.sql
psql ${EXTERNAL_DATABASE_URL} -f database_scripts/db_seed.sql
```

**Step 5:** Start the backend server

```bash
npm start
```

The backend will run at http://localhost:3000

**Step 6**: Start the frontend site

* Install the Live Server VSCode extension
* Open the frontend/index.html file in VSCode
* Click 'Go Live' on the bottom right of the VSCode window



## How to use the application (subject to change):

When the index.html page opens on your browser, it will show the Queue page.\
The queue will currently be empty, so you can then navigate to the Request page using the nav links on the top right of the page.\
Using the search bar, enter a song, artist, or album, or any combination of the three.\
The results will be fetched from Spotify and displayed below.\
When you see the track you would like to request, click on it.\
A modal will pop up, showing the track's information, and a button to request the track.\
Clicking the button will request the track.\
Currently, the rules are hardcoded to limit the track requests to disallow tracks that are explicit, longer than 7 minutes, or already existing on the queue.\
As long as your track request does not get rejected under those rules, then when viewing the queue, you can see your request displayed at the bottom of the queue.