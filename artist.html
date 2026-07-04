/* ============================================
   Comedy Library — homepage logic
   Reads from /data/*.json (no backend required)
   ============================================ */

const DATA_PATHS = {
  artists: 'data/artists.json',
  tags: 'data/tags.json',
  shorts: 'data/shorts.json',
};

let state = {
  artists: [],
  tags: [],       // [{ArtistID, Tag}]
  shorts: [],     // [{ArtistID, Title, EmbedLink}]
  activeTag: null,
};

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function tagsForArtist(artistId) {
  return state.tags.filter(t => String(t.ArtistID) === String(artistId)).map(t => t.Tag);
}

/* ---------- Tag bar ---------- */

function renderTagBar() {
  const bar = document.getElementById('tag-bar');
  const uniqueTags = [...new Set(state.tags.map(t => t.Tag))].sort();

  if (uniqueTags.length === 0) {
    bar.innerHTML = '';
    document.getElementById('filters').querySelector('.section__heading')
      .insertAdjacentHTML('afterend',
        '<div class="empty-state">No tags yet — add rows to <code>data/tags.json</code> (ArtistID + Tag) to enable filtering.</div>');
    return;
  }

  bar.innerHTML = uniqueTags.map(tag =>
    `<button class="tag-chip" data-tag="${tag}">${tag}</button>`
  ).join('');

  bar.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      state.activeTag = state.activeTag === tag ? null : tag;
      renderTagBar();
      renderArtistGrid();
    });
  });

  if (state.activeTag) {
    const activeChip = bar.querySelector(`[data-tag="${state.activeTag}"]`);
    if (activeChip) activeChip.classList.add('active');
  }
}

/* ---------- Artist grid ---------- */

function renderArtistGrid() {
  const grid = document.getElementById('artist-grid');
  const countLabel = document.getElementById('artist-count');

  let visible = state.artists;
  if (state.activeTag) {
    visible = visible.filter(a => tagsForArtist(a.ArtistID).includes(state.activeTag));
  }

  countLabel.textContent = `${visible.length} of ${state.artists.length}`;

  if (visible.length === 0) {
    grid.innerHTML = '<div class="empty-state">No comedians match that tag yet.</div>';
    return;
  }

  grid.innerHTML = visible.map(a => {
    const tags = tagsForArtist(a.ArtistID).slice(0, 3);
    const photo = a.PhotoURL
      ? `style="background-image:url('${a.PhotoURL}')"`
      : '';
    return `
      <a class="stub" href="artist.html?id=${a.ArtistID}">
        <div class="stub__photo" ${photo}>${a.PhotoURL ? '' : initials(a.Name)}</div>
        <div class="stub__divider"></div>
        <div class="stub__body">
          <p class="stub__name">${a.Name}</p>
          <div class="stub__tags">
            ${tags.map(t => `<span class="stub__tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>
    `;
  }).join('');
}

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
    strip.innerHTML = '';
    strip.insertAdjacentHTML('beforebegin',
      '<div class="empty-state">No clips yet — add rows to <code>data/shorts.json</code> (ArtistID, Title, EmbedLink) and 5 will rotate in here daily.</div>');
    note.textContent = '';
    return;
  }

  const today = new Date();
  const seed = dayOfYear(today) + today.getFullYear() * 1000;
  const shuffled = seededShuffle(state.shorts, seed);
  const picks = shuffled.slice(0, Math.min(5, shuffled.length));

  note.textContent = `rotates daily · ${picks.length} of ${state.shorts.length} clips`;

  strip.innerHTML = picks.map(s => {
    const artist = state.artists.find(a => String(a.ArtistID) === String(s.ArtistID));
    return `
      <div class="short-card">
        <div class="short-card__embed">
          <iframe src="${s.EmbedLink}" title="${s.Title}" allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="short-card__body">
          <p class="short-card__title">${s.Title}</p>
          <p class="short-card__artist">${artist ? artist.Name : 'Unknown artist'}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Init ---------- */

async function init() {
  try {
    const [artists, tags, shorts] = await Promise.all([
      loadJSON(DATA_PATHS.artists),
      loadJSON(DATA_PATHS.tags),
      loadJSON(DATA_PATHS.shorts),
    ]);
    state.artists = artists.sort((a, b) => a.Name.localeCompare(b.Name));
    state.tags = tags;
    state.shorts = shorts;

    renderTagBar();
    renderArtistGrid();
    renderFeaturedShorts();
  } catch (err) {
    console.error(err);
    document.getElementById('artist-grid').innerHTML =
      '<div class="empty-state">Couldn\'t load data. Check that the /data JSON files exist and are valid.</div>';
  }
}

init();
