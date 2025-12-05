// DOM elements
const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const resultsContainer = document.getElementById('results');
const statusIndicator = document.getElementById('status');
const toastElement = document.getElementById('toast');

// Modal elements
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalArtist = document.getElementById('modalArtist');
const modalAlbum = document.getElementById('modalAlbum');
const modalClose = document.getElementById('modalClose');
const confirmRequestBtn = document.getElementById('confirmRequestBtn');

// Presents a brief toast notification to the user - displays message briefly and then hides it
function toast(message) {
    toastElement.textContent = message;
    toastElement.style.display = 'block';
    setTimeout(() => (toastElement.style.display = 'none'), 1500);
}

// Build search URL
function searchUrl(term) {
    return `https://coffee-shop-jukebox.onrender.com/api/search?term=${encodeURIComponent(term)}`;
}

// Request URL
const requestUrl = "https://coffee-shop-jukebox.onrender.com/api/request/";

// Perform a search - returns a robust array of tracks with data formatted by backend for search results
async function search(term) {
    statusIndicator.textContent = 'Searching...';

    try {
        const response = await fetch(searchUrl(term));
        if (!response.ok) {
            throw new Error("Search failed");
        }
        const data = await response.json();
        return data;
    } catch (err) {
        toast("Search error");
        return [];
    } finally {
        statusIndicator.textContent = '';
    }
}

// Render search results - formats the results into an html appropriate form
function renderResults(list) {
    // Clear any previously rendered results
    resultsContainer.innerHTML = '';

    // If list is empty, then display feedback and exit
    if (!list.length) {
        resultsContainer.innerHTML = '<p>No matches found.</p>';
        return;
    }

    for (const track of list) {
        const card = document.createElement('div');
        card.className = 'card p-2 d-flex gap-2 align-items-center bg-dark border-secondary';

        // Attach the track's full dataset so modal can access it
        card.dataset.trackJson = JSON.stringify(track);
        
        // Set role for the div for accessibility
        card.setAttribute('role','listitem');


        card.innerHTML = `
            <img src="${track.album.images?.[2]?.url || ''}"
                 class="rounded"
                 alt="Album cover">
            <div class="flex-grow-1">
                <div><strong>${track.name}</strong></div>
                <div>${track.artists.map(artist => artist.name).join(', ')}</div>
                <div><em>${track.album?.name || ''}</em></div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }
}

// Show request modal for a given track
function openModal(track) {
    modalImage.src = track.album.images?.[1]?.url || '';
    modalTitle.textContent = track.name;
    modalArtist.textContent = track.artists.map(artist => artist.name).join(', ');
    modalAlbum.textContent = track.album?.name || '';

    // Store the track's id for request handling
    confirmRequestBtn.dataset.id = track.id;
    modal.style.display = 'block';
}

// Click handler for clicking on results
resultsContainer.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) {
        return;
    }

    const track = JSON.parse(card.dataset.trackJson);
    openModal(track);
});

// Click event for confirming request
confirmRequestBtn.addEventListener('click', async () => {
    const id = confirmRequestBtn.dataset.id;
    try {
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId: id }),
        });
        if (!response.ok) {
            throw new Error("Request failed");            
        }
        toast("Song requested!");
    } catch (err) {
        toast("Error: could not request");
    }
    closeModal();
});

// Search form submit handler
searchForm.addEventListener('submit', async (e) => {
    // Prevent the browser from reloading the page on form submit
    e.preventDefault();

    const term = queryInput.value.trim();
    if (!term) {
        return;
    }

    const list = await search(term);
    renderResults(list);
});
