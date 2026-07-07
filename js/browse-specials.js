/* ============================================
   Comedy Library — Browse by Special page logic
   (loadJSON / helpers come from js/common.js)
   ============================================ */

let state = {
  artists: [],
  tags: [],           // [{ArtistID, Tag}] — artist-level style tags
  specials: [],       // [{SpecialID, Title, AiredYear, YouTubeLink, LanguageLevel, ContentLevel}]
  specialLookup: [],  // [{ArtistID, SpecialID}]
  specialTags: [],    // [{SpecialID, Tag}]
  search: '',
  specialTag: '',
  artistStyleTag: '',
};

function renderFilterOptions() {
  const specialTagOptions = [...new Set(state.specialTags.map(t => t.Tag))].sort();
  const artistStyleOptions = [...new Set(state.tags.map(t => t.Tag))].sort();

  const specialTagSelect = document.getElementById('special-tag-filter');
  specialTagSelect.innerHTML = '<option value="">Tag: Any</option>' +
    specialTagOptions.map(t => `<option value="${t}">Tag: ${t}</option>`).join('');

  const artistStyleSelect = document.getElementById('artist-style-filter');
  artistStyleSelect.innerHTML = '<option value="">Artist style: Any</option>' +
    artistStyleOptions.map(t => `<option value="${t}">Artist style: ${t}</option>`).join('');
}

function renderActiveFilters() {
  const bar = document.getElementById('active-filters');
  const chips = [];

  if (state.specialTag) {
    chips.push(`<span class="filter-chip">Tag: ${state.specialTag}<button data-clear="specialTag">×</button></span>`);
  }
  if (state.artistStyleTag) {
    chips.push(`<span class="filter-chip">Artist style: ${state.artistStyleTag}<button data-clear="artistStyle">×</button></span>`);
  }

  bar.innerHTML = chips.join('');
  bar.querySelectorAll('button[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.clear === 'specialTag') {
        state.specialTag = '';
        document.getElementById('special-tag-filter').value = '';
      } else {
        state.artistStyleTag = '';
        document.getElementById('artist-style-filter').value = '';
      }
      renderActiveFilters();
      renderSpecialGrid();
    });
  });
}

function renderSpecialGrid() {
  const grid = document.getElementById('special-grid');
  const countLabel = document.getElementById('special-count');

  if (state.specials.length === 0) {
    grid.innerHTML = '<div class="empty-state">No specials yet — add rows to <code>data/specials.json</code> and link them to comedians via <code>data/special_lookup.json</code>.</div>';
    countLabel.textContent = '';
    return;
  }

  let visible = state.specials;

  if (state.search) {
    visible = visible.filter(s => matchesSearch(s.Title, state.search));
  }
  if (state.specialTag) {
    visible = visible.filter(s => tagsForSpecial(state.specialTags, s.SpecialID).includes(state.specialTag));
  }
  if (state.artistStyleTag) {
    visible = visible.filter(s => specialHasArtistTag(s.SpecialID, state.artistStyleTag, state.specialLookup, state.tags));
  }

  countLabel.textContent = `${visible.length} of ${state.specials.length} specials`;

  if (visible.length === 0) {
    grid.innerHTML = '<div class="empty-state">No specials match those filters yet.</div>';
    return;
  }

  grid.innerHTML = visible.map(s => {
    const artists = artistsForSpecial(state.artists, state.specialLookup, s.SpecialID);
    const artistNames = artists.length ? artists.map(a => a.Name).join(', ') : 'Unknown artist';
    const wrapperTag = artists[0] ? 'a' : 'div';
    const hrefAttr = artists[0] ? `href="artist.html?id=${artists[0].ArtistID}"` : '';
    const poster = youTubeThumbnail(s.YouTubeLink) || POSTER_FALLBACK;
    const hasVideo = Boolean(s.YouTubeLink);

    return `
      <${wrapperTag} class="card special-card${hasVideo ? ' has-video' : ''}" ${hrefAttr}>
        <div class="special-card__poster">
          <img src="${poster}" alt="${s.Title} poster" loading="lazy" onerror="this.onerror=null;this.src='${POSTER_FALLBACK}';">
          ${hasVideo ? `<span class="play-badge">${PLAY_ICON}</span>` : ''}
        </div>
        <div class="card__perf"></div>
        <div class="special-card__body">
          <p class="special-card__title">${s.Title}</p>
          <p class="special-card__meta">${artistNames}${s.AiredYear ? ` · ${s.AiredYear}` : ''}</p>
          <div class="special-card__badges">
            ${hasVideo ? `<span class="watch-pill">${PLAY_ICON}WATCH</span>` : ''}
            <span class="badge">${s.LanguageLevel || '?'}</span>
            <span class="badge">${s.ContentLevel || '?'}</span>
          </div>
        </div>
      </${wrapperTag}>
    `;
  }).join('');
}

async function init() {
  try {
    const [artists, tags, specials, specialLookup, specialTags] = await Promise.all([
      loadJSON('data/artists.json'),
      loadJSON('data/tags.json'),
      loadJSON('data/specials.json'),
      loadJSON('data/special_lookup.json'),
      loadJSON('data/special_tags.json'),
    ]);
    state.artists = artists;
    state.tags = tags;
    state.specials = specials;
    state.specialLookup = specialLookup;
    state.specialTags = specialTags;

    renderFilterOptions();
    renderSpecialGrid();

    document.getElementById('special-search').addEventListener('input', (e) => {
      state.search = e.target.value;
      renderSpecialGrid();
    });
    document.getElementById('special-tag-filter').addEventListener('change', (e) => {
      state.specialTag = e.target.value;
      renderActiveFilters();
      renderSpecialGrid();
    });
    document.getElementById('artist-style-filter').addEventListener('change', (e) => {
      state.artistStyleTag = e.target.value;
      renderActiveFilters();
      renderSpecialGrid();
    });
  } catch (err) {
    console.error(err);
    document.getElementById('special-grid').innerHTML =
      '<div class="empty-state">Couldn\'t load data. Check that the /data JSON files exist and are valid.</div>';
  }
}

init();
