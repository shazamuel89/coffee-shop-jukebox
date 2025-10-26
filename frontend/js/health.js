// Since this is a static site (no build tool), we hardcode the API base for now.
const API_BASE = "https://coffee-shop-jukebox.onrender.com";

// Container for the URL to the API
document.getElementById('apiBase').textContent = API_BASE;

// On click of health button, check API connection
document.getElementById('btnHealth').addEventListener('click', async () => {
  const out = document.getElementById('health');
  out.textContent = 'Checking...';
  try {
    const res = await fetch(API_BASE + '/health', { headers: { 'Accept': 'application/json' } });
    const text = await res.text(); // use text() to show something even if not JSON
    if (res.ok) {
      out.innerHTML = '<div class="ok">✅ OK</div><pre>' + text + '</pre>';
    } else {
      out.innerHTML = '<div class="err">❌ HTTP ' + res.status + '</div><pre>' + text + '</pre>';
    }
  } catch (e) {
    out.innerHTML = '<div class="err">❌ Failed: ' + e.message + '</div>';
  }
});