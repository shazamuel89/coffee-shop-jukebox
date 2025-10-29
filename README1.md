# **Coffee Shop Jukebox — How to Run (Local + Deployed)**

This doc explains how to get the project running on your computer for demo/testing and where the deployed services live.

---

## **Table of Contents**
- [Prerequisites](#prerequisites)
- [Clone the repo](#clone-the-repo)
- [Clone the Frontend Locally](#clone-the-frontend-locally)
- [What you should see](#what-you-should-see)
- [Sample data (no backend required)](#sample-data-no-backend-required)
- [Run the Backend](#run-the-backend)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

---

## **Prerequisites**
- Node.js **v22.19.0**
- Git
- (Optional) Visual Studio Code

---

## **Clone the repo**
```bash
git clone https://github.com/shazamuel89/coffee-shop-jukebox.git
cd coffee-shop-jukebox
```

## **Clone the Frontend Locally**
```bash
cd frontend
npm install
npx http-server public -p 5173
```
Then open your browser and go to: **http://127.0.0.1:5173**

## **What you should see:**

- A **search box** and a list of sample songs with cover art.
- **Typing filters** the list.
- Clicking **Request song** changes the button to Requested ✓ and shows a toast.


## **Sample data (no backend required)**

Frontend reads public/data/tracks.sample.json, so it works completely offline.

If you see **“Index of /”**, you started the server from the wrong folder.
Stop it **(Ctrl+C)**, then run:
```bash
cd frontend && npx http-server public -p 5173
```

## **Run the Backend**
```bash
cd backend
npm install
npm start
```
The backend runs on **http://127.0.0.1:3000** by default.
Frontend requests will automatically route to it once it’s active.


## **Deployment Notes**

The **live version** (if deployed) should serve both frontend and backend together.
For **local demos**, running only the frontend with sample data is enough

If deploying, make sure your .env file includes:
```bash
PORT=3000
NODE_ENV=production
```
## **Troubleshooting**

- **Port already in use:** Change **-p 5173** to another port (e.g., 5174).
- **Page shows “Index of /”:** You’re not inside the frontend/public folder. Run the correct command again.
- **Blank page:** Try clearing browser cache or reinstalling dependencies:
```bash
npm install
```