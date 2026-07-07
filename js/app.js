/* ============================================
   Comedy Library — homepage logic
   Renders "Tonight's Lineup" from data/shorts.json
   (loadJSON / helpers come from js/common.js)
   ============================================ */

let state = {
  artists: [],
  shorts: [],   // [{ArtistID, Title, EmbedLink}]
};

/* ---------- Featured shorts (deterministic lineup rotation) ---------- */

const ROTATION_DAYS = 3; // <-- the one number to change later when dropping to 1
const ROTATION_START_DATE = new Date('2026-07-03'); // site launch date — fixed forever so periodNumber is stable

// Deterministic seeded PRNG (mulberry32) so the "randomness" is 100% reproducible from the seed
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rng = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPeriodNumber(date, rotationDays, startDate) {
  const msPerDay = 86400000;
  const daysSince = Math.floor((date - startDate) / msPerDay);
  return Math.floor(daysSince / rotationDays);
}

// shortsByArtist: { artistId: [ {title, embedLink, ...}, ... ] } -- shorts.json grouped by ArtistID
function getLineup(shortsByArtist, periodNumber, slotCount = 4) {
  const artistIds = Object.keys(shortsByArtist).filter(id => shortsByArtist[id].length > 0);
  const shuffled = seededShuffle(artistIds, periodNumber);

  const lineup = [];
  const occurrenceCount = {}; // tracks how many times each artist has already filled a slot in this lineup

  for (let slot = 0; slot < slotCount; slot++) {
    if (shuffled.length === 0) break;
    const artistId = shuffled[slot % shuffled.length];
    const occurrence = occurrenceCount[artistId] || 0;
    occurrenceCount[artistId] = occurrence + 1;

    const clips = shortsByArtist[artistId];
    const clipIndex = (periodNumber + occurrence) % clips.length;
    lineup.push({ artistId, short: clips[clipIndex] });
  }
  return lineup;
}

function groupShortsByArtist(shorts) {
  const grouped = {};
  shorts.forEach(s => {
    const id = String(s.ArtistID);
    if (!grouped[id]) grouped[id] = [];
    grouped[id].push(s);
  });
  return grouped;
}

function renderFeaturedShorts() {
  const strip = document.getElementById('shorts-strip');
  const note = document.getElementById('rotation-note');

  if (state.shorts.length === 0) {
    strip.innerHTML = '<div class="empty-state">No clips yet — add rows to <code>data/shorts.json</code> (ArtistID, Title, EmbedLink) and 4 will rotate in here.</div>';
    return;
  }

  const shortsByArtist = groupShortsByArtist(state.shorts);
  const periodNumber = getPeriodNumber(new Date(), ROTATION_DAYS, ROTATION_START_DATE);
  const lineup = getLineup(shortsByArtist, periodNumber, 4);

  note.textContent = 'A rotating pick of short clips';

  strip.innerHTML = lineup.map(({ artistId, short }) => {
    const artist = state.artists.find(a => String(a.ArtistID) === String(artistId));
    const moreLink = artist
      ? `<a class="short-card__more" href="artist.html?id=${artist.ArtistID}">More from ${artist.Name} →</a>`
      : '';
    return `
      <div class="card">
        <div class="short-card__embed">
          <iframe src="${short.EmbedLink}" title="${short.Title}" allowfullscreen loading="lazy"></iframe>
          <button class="short-card__expand" type="button" data-embed="${short.EmbedLink}" data-title="${short.Title}" aria-label="Expand ${short.Title}">${EXPAND_ICON}</button>
        </div>
        <div class="short-card__body">
          <p class="short-card__title">"${short.Title}"</p>
          ${moreLink}
        </div>
      </div>
    `;
  }).join('');

  strip.querySelectorAll('.short-card__expand').forEach(btn => {
    btn.addEventListener('click', () => openVideoLightbox(btn.dataset.embed, btn.dataset.title));
  });
}

/* ---------- Video lightbox — expands a clip to window width, same aspect ratio ---------- */

function openVideoLightbox(embedLink, title) {
  const lightbox = document.createElement('div');
  lightbox.className = 'video-lightbox';
  lightbox.innerHTML = `
    <div class="video-lightbox__inner">
      <button class="video-lightbox__close" type="button" aria-label="Close">${CLOSE_ICON}</button>
      <iframe src="${withAutoplay(embedLink)}" title="${title}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    </div>
  `;

  const close = () => {
    lightbox.remove();
    document.removeEventListener('keydown', onKeydown);
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  lightbox.querySelector('.video-lightbox__close').addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);

  document.body.appendChild(lightbox);
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
