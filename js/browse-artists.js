/* ============================================
   Lauren's Green Room — Browse by Artist page logic
   (loadJSON / helpers come from js/common.js)
   ============================================ */

let state = {
  artists: [],
  tags: [],           // [{ArtistID, Tag}]  — artist-level style tags
  specialLookup: [],  // [{ArtistID, SpecialID}]
  specialTags: [],    // [{SpecialID, Tag}] — "special type" tags (e.g. drybar)
  search: '',
  styleTag: '',
  specialTypeTag: '',
};

function renderFilterOptions() {
  const styleTags = [...new Set(state.tags.map(t => t.Tag))].sort();
  const specialTypeTags = [...new Set(state.specialTags.map(t => t.Tag))].sort();

  const styleSelect = document.getElementById('style-filter');
  styleSelect.innerHTML = '<option value="">Style: Any</option>' +
    styleTags.map(t => `<option value="${t}">Style: ${t}</option>`).join('');

  const specialTypeSelect = document.getElementById('special-type-filter');
  specialTypeSelect.innerHTML = '<option value="">Special type: Any</option>' +
    specialTypeTags.map(t => `<option value="${t}">Special type: ${t}</option>`).join('');
}

function renderActiveFilters() {
  const bar = document.getElementById('active-filters');
  const chips = [];

  if (state.styleTag) {
    chips.push(`<span class="filter-chip">Style: ${state.styleTag}<button data-clear="style">×</button></span>`);
  }
  if (state.specialTypeTag) {
    chips.push(`<span class="filter-chip">Special type: ${state.specialTypeTag}<button data-clear="specialType">×</button></span>`);
  }

  bar.innerHTML = chips.join('');
  bar.querySelectorAll('button[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.clear === 'style') {
        state.styleTag = '';
        document.getElementById('style-filter').value = '';
      } else {
        state.specialTypeTag = '';
        document.getElementById('special-type-filter').value = '';
      }
      renderActiveFilters();
      renderArtistGrid();
    });
  });
}

function renderArtistGrid() {
  const grid = document.getElementById('artist-grid');
  const countLabel = document.getElementById('artist-count');

  let visible = state.artists;

  if (state.search) {
    visible = visible.filter(a => matchesSearch(a.Name, state.search));
  }
  if (state.styleTag) {
    visible = visible.filter(a => tagsForArtist(state.tags, a.ArtistID).includes(state.styleTag));
  }
  if (state.specialTypeTag) {
    visible = visible.filter(a => artistHasSpecialTag(a.ArtistID, state.specialTypeTag, state.specialLookup, state.specialTags));
  }

  countLabel.textContent = `${visible.length} of ${state.artists.length} comedians`;

  if (visible.length === 0) {
    grid.innerHTML = '<div class="empty-state">No comedians match those filters yet.</div>';
    return;
  }

  grid.innerHTML = visible.map(a => {
    const tags = tagsForArtist(state.tags, a.ArtistID).slice(0, 3);
    const photo = a.PhotoURL ? `style="background-image:url('${a.PhotoURL}')"` : '';
    return `
      <a class="card artist-card" href="artist.html?id=${a.ArtistID}">
        <div class="artist-card__photo" ${photo}>${a.PhotoURL ? '' : initials(a.Name)}</div>
        <div class="card__perf"></div>
        <div class="artist-card__body">
          <p class="artist-card__name">${a.Name}</p>
          <div class="artist-card__tags">
            ${tags.map(t => `<span class="pill-tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>
    `;
  }).join('');
}

async function init() {
  try {
    const [artists, tags, specialLookup, specialTags] = await Promise.all([
      loadJSON('data/artists.json'),
      loadJSON('data/tags.json'),
      loadJSON('data/special_lookup.json'),
      loadJSON('data/special_tags.json'),
    ]);
    state.artists = visibleArtists(artists).sort((a, b) => a.Name.localeCompare(b.Name));
    state.tags = tags;
    state.specialLookup = specialLookup;
    state.specialTags = specialTags;

    renderFilterOptions();
    renderArtistGrid();

    document.getElementById('artist-search').addEventListener('input', (e) => {
      state.search = e.target.value;
      renderArtistGrid();
    });
    document.getElementById('style-filter').addEventListener('change', (e) => {
      state.styleTag = e.target.value;
      renderActiveFilters();
      renderArtistGrid();
    });
    document.getElementById('special-type-filter').addEventListener('change', (e) => {
      state.specialTypeTag = e.target.value;
      renderActiveFilters();
      renderArtistGrid();
    });
  } catch (err) {
    console.error(err);
    document.getElementById('artist-grid').innerHTML =
      '<div class="empty-state">Couldn\'t load data. Check that the /data JSON files exist and are valid.</div>';
  }
}

init();
