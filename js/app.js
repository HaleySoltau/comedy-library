/* ============================================
   Comedy Library — homepage logic
   Renders "Tonight's Lineup" from data/shorts.json
   (loadJSON / helpers come from js/common.js)
   ============================================ */

let state = {
  artists: [],
  shorts: [],   // [{ArtistID, Title, EmbedLink}]
};

/* ---------- Featured shorts (deterministic daily rotation) ---------- */

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

// Seeded shuffle so "today's" picks are stable all day but change day to day
function seededShuffle(array, seed) {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function renderFeaturedShorts() {
  const strip = document.getElementById('shorts-strip');
  const note = document.getElementById('rotation-note');

  if (state.shorts.length === 0) {
    strip.innerHTML = '<div class="empty-state">No clips yet — add rows to <code>data/shorts.json</code> (ArtistID, Title, EmbedLink) and 5 will rotate in here daily.</div>';
    return;
  }

  const today = new Date();
  const seed = dayOfYear(today) + today.getFullYear() * 1000;
  const shuffled = seededShuffle(state.shorts, seed);
  const picks = shuffled.slice(0, Math.min(5, shuffled.length));

  note.textContent = `A rotating pick of short clips, refreshed daily · ${picks.length} of ${state.shorts.length}`;

  strip.innerHTML = picks.map(s => {
    const artist = state.artists.find(a => String(a.ArtistID) === String(s.ArtistID));
    const moreLink = artist
      ? `<a class="short-card__more" href="artist.html?id=${artist.ArtistID}">More from ${artist.Name} →</a>`
      : '';
    return `
      <div class="card">
        <div class="short-card__embed">
          <iframe src="${s.EmbedLink}" title="${s.Title}" allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="short-card__body">
          <p class="short-card__title">"${s.Title}"</p>
          ${moreLink}
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Init ---------- */

async function init() {
  try {
    const [artists, shorts] = await Promise.all([
      loadJSON('data/artists.json'),
      loadJSON('data/shorts.json'),
    ]);
    state.artists = artists;
    state.shorts = shorts;
    renderFeaturedShorts();
  } catch (err) {
    console.error(err);
    document.getElementById('shorts-strip').innerHTML =
      '<div class="empty-state">Couldn\'t load data. Check that the /data JSON files exist and are valid.</div>';
  }
}

init();
