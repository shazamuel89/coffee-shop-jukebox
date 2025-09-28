// Load sample tracks and power the search UI
const DATA_URL = './data/tracks.sample.json';
const q = document.getElementById('q');
const results = document.getElementById('results');
const statusEl = document.getElementById('status');
const toastEl = document.getElementById('toast');

let cache = [];
let typingTimer = null;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  setTimeout(() => (toastEl.style.display = 'none'), 1500);
}

async function loadData() {
  statusEl.textContent = 'Loading songs…';
  const res = await fetch(DATA_URL);
  cache = await res.json();
  statusEl.textContent = '';
}

function render(list) {
  results.innerHTML = '';
  if (!list.length) {
    results.innerHTML = '<p>No matches. Try a different search.</p>';
    return;
  }
  for (const t of list) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role','listitem');
    card.innerHTML = `
      <img src="${t.cover}" alt="Cover art for ${t.album}">
      <div>
        <div><strong>${t.title}</strong></div>
        <div>${t.artist} — <em>${t.album}</em></div>
      </div>
      <div>
        <button data-id="${t.id}">Request song</button>
      </div>`;
    results.appendChild(card);
  }
}

function filter(term) {
  const s = term.trim().toLowerCase();
  if (!s) return cache;
  return cache.filter(t =>
    (t.title + ' ' + t.artist + ' ' + t.album).toLowerCase().includes(s)
  );
}

q.addEventListener('input', () => {
  clearTimeout(typingTimer);
  statusEl.textContent = 'Searching…';
  typingTimer = setTimeout(() => {
    const list = filter(q.value);
    render(list);
    statusEl.textContent = list.length ? '' : 'No results';
  }, 200);
});

results.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Requested ✓'; // instant feedback
  toast('Song added to queue');    // instant feedback
  // Later: POST to backend /requests with song id
});

loadData().then(() => render(cache));
