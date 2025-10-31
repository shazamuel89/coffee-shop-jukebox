// This file loads sample tracks and powers the search UI

// file path to the temporary local data source
const DATA_URL = '../public/data/tracks.sample.json';

// Search input element where the user types queries into
const q = document.getElementById('q');

// div element where the search results will be rendered
const results = document.getElementById('results');

// div element that shows the loading/search status text
const statusEl = document.getElementById('status');

// div element that pops up with notifications
const toastEl = document.getElementById('toast');

// Stores song data once it is fetched
let cache = [];

// This allows debouncing search input so filter doesn't occur on every keystroke instantly
let typingTimer = null;

// Presents a brief toast notification to the user - displays message briefly and then hides it
function toast(msg) {
  toastEl.textContent = msg;                                // Store message in element
  toastEl.style.display = 'block';                          // Make the element visible
  setTimeout(() => (toastEl.style.display = 'none'), 1500); // Hide the element after a brief period
}

// Fetches data and stores it in the cache, displaying ui feedback
async function loadData() {
  statusEl.textContent = 'Loading songs…';  // Display loading status
  const res = await fetch(DATA_URL);        // Fetch the data
  cache = await res.json();                 // Store the data for later search use
  statusEl.textContent = '';                // Clear loading indicator
}

// Renders the list of song objects to the page
function render(list) {
  results.innerHTML = '';                                             // Clear any previously rendered results
  if (!list.length) {                                                 // If list is empty, then display feedback and exit
    results.innerHTML = '<p>No matches. Try a different search.</p>';
    return;
  }
  for (const t of list) {                                             // For each track in the list
    const card = document.createElement('div');                       // Create a div element
    card.className = 'card';                                          // Add 'card' class to div
    card.setAttribute('role','listitem');                             // Set role for the div
    card.innerHTML = `
      <img src="${t.cover}" alt="Cover art for ${t.album}">
      <div>
        <div><strong>${t.title}</strong></div>
        <div>${t.artist} — <em>${t.album}</em></div>
      </div>
      <div>
        <button data-id="${t.id}">Request song</button>
      </div>`;                                                        // Set up the display for the track
    results.appendChild(card);                                        // Append the card onto results
  }
}

// Filters tracks from the cache based on the search term
function filter(term) {
  const s = term.trim().toLowerCase();  // Normalize input
  if (!s) return cache;                 // If input was empty, return all results
  return cache.filter(t =>              // Normalize tracks in cache by combining 'title artist album' and filter using search term
    (t.title + ' ' + t.artist + ' ' + t.album).toLowerCase().includes(s)
  );
}

// Upon input to the search bar, the list is filtered as the user types
q.addEventListener('input', () => {
  clearTimeout(typingTimer);                                // Reset debounce timer
  statusEl.textContent = 'Searching…';                      // Display feedback
  typingTimer = setTimeout(() => {                          // Delay execution for a brief period
    const list = filter(q.value);                           // Filter the results by the input currently in the search bar
    render(list);                                           // Render the filtered results
    statusEl.textContent = list.length ? '' : 'No results'; // If no results, display feedback
  }, 200);
});

// Upon click on the results element, clicks on request button requests the track
results.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');  // Identify the clicked button if any
  if (!btn) return;                                 // Ignore clicks that are not on request button
  btn.disabled = true;                              // Immediately disable the button to prevent duplicate clicks
  btn.textContent = 'Requested ✓';                  // Display feedback on button
  toast('Song added to queue');                     // Display feedback as a popup
  // Later: POST to backend /requests with song id
});

// Initially load the data and then render the full list before user searches
loadData().then(() => render(cache));