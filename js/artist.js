/* ============================================
   Comedy Library — artist detail page logic
   ============================================ */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');
  const content = document.getElementById('artist-content');

  if (!artistId) {
    content.innerHTML = '<div class="empty-state">No artist specified.</div>';
    return;
  }

  try {
    const [artists, tags, specials, lookup, shorts] = await Promise.all([
      loadJSON('data/artists.json'),
      loadJSON('data/tags.json'),
      loadJSON('data/specials.json'),
      loadJSON('data/special_lookup.json'),
      loadJSON('data/shorts.json'),
    ]);

    const artist = artists.find(a => String(a.ArtistID) === String(artistId));
    if (!artist) {
      content.innerHTML = '<div class="empty-state">Comedian not found.</div>';
      return;
    }

    document.title = `${artist.Name} — The Comedy Library`;

    const artistTags = tags.filter(t => String(t.ArtistID) === String(artistId)).map(t => t.Tag);
    const photo = artist.PhotoURL ? `style="background-image:url('${artist.PhotoURL}')"` : '';

    content.innerHTML = `
      <div class="artist-header">
        <div class="artist-header__photo" ${photo}>
          ${artist.PhotoURL ? '' : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-size:2.5rem;color:var(--gold-dim);">${initials(artist.Name)}</div>`}
        </div>
        <div>
          <h1 class="artist-header__name">${artist.Name}</h1>
          ${artist.WebsiteURL ? `<a class="artist-header__website" href="${artist.WebsiteURL}" target="_blank" rel="noopener">${artist.WebsiteURL}</a>` : ''}
          <div class="stub__tags" style="margin-top:0.6rem;">
            ${artistTags.map(t => `<span class="stub__tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
      ${artist.Bio ? `<p class="artist-bio">${artist.Bio}</p>` : '<p class="artist-bio empty-state">No bio yet.</p>'}
    `;

    // Specials for this artist (via lookup table, since specials can have multiple comedians)
    const specialIds = lookup.filter(l => String(l.ArtistID) === String(artistId)).map(l => l.SpecialID);
    const artistSpecials = specials.filter(s => specialIds.includes(s.SpecialID));

    const specialsSection = document.getElementById('specials-section');
    const specialsList = document.getElementById('specials-list');
    if (artistSpecials.length > 0) {
      specialsSection.style.display = '';
      specialsList.innerHTML = artistSpecials.map(s => `
        <div class="stub" style="margin-bottom:0.8rem;">
          <div class="stub__body" style="width:100%;">
            <p class="stub__name">
              ${s.YouTubeLink ? `<a href="${s.YouTubeLink}" target="_blank" rel="noopener">${s.Title}</a>` : s.Title}
              ${s.AiredYear ? `<span class="section__note"> · ${s.AiredYear}</span>` : ''}
            </p>
            <span class="rating-stamp">${s.LanguageLevel || '?'} language · ${s.ContentLevel || '?'} content</span>
          </div>
        </div>
      `).join('');
    }

    // Shorts for this artist
    const artistShorts = shorts.filter(s => String(s.ArtistID) === String(artistId));
    const shortsSection = document.getElementById('shorts-section');
    const shortsGrid = document.getElementById('artist-shorts');
    if (artistShorts.length > 0) {
      shortsSection.style.display = '';
      shortsGrid.innerHTML = artistShorts.map(s => `
        <div class="short-card">
          <div class="short-card__embed">
            <iframe src="${s.EmbedLink}" title="${s.Title}" allowfullscreen loading="lazy"></iframe>
          </div>
          <div class="short-card__body">
            <p class="short-card__title">${s.Title}</p>
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error(err);
    content.innerHTML = '<div class="empty-state">Couldn\'t load this comedian\'s data.</div>';
  }
}

init();
