// Hardcoded base url for now
const BASE_URL = "https://coffee-shop-jukebox.onrender.com";

// DOM references
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const refreshBtn = document.getElementById("refresh");

// Main function to check health
async function checkHealth() {
    try {
        // Show loading state
        statusEl.textContent = "Checking...";
        statusEl.className = "status";

        // Fetch health endpoint
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();

        if (data.ok) {
            statusEl.textContent = "Backend: UP";
            statusEl.className = "status up";
        } else {
            statusEl.textContent = "Backend: DOWN";
            statusEl.className = "status down";
        }

        // Print full JSON response
        outputEl.textContent = JSON.stringify(data, null, 2);

    } catch (err) {
        statusEl.textContent = "Backend: ERROR";
        statusEl.className = "status down";

        outputEl.textContent = JSON.stringify({
            error: err.message
        }, null, 2);
    }
}

// Clicking the refresh button runs checkHealth() again
refreshBtn.addEventListener('click', checkHealth);

// Run checkHealth() upon loading the page
document.addEventListener('DOMContentLoaded', checkHealth);
