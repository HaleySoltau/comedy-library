/* ============================================
   Comedy Library — artist detail page logic
   (loadJSON / helpers come from js/common.js)
   ============================================ */

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

    document.title = `${artist.Name} — Comedy Library`;

    const artistTags = tagsForArtist(tags, artistId);
    const photo = artist.PhotoURL ? `style="background-image:url('${artist.PhotoURL}')"` : '';

    document.getElementById('artist-social-icons').innerHTML = renderSocialIcons(artist);

    content.innerHTML = `
      <div class="artist-header">
        <div class="artist-header__photo" ${photo}>
          ${artist.PhotoURL ? '' : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-size:2.75rem;color:var(--primary);">${initials(artist.Name)}</div>`}
        </div>
        <div>
          <h1 class="artist-header__name">${artist.Name}</h1>
          ${artist.WebsiteURL ? `<a class="artist-header__website" href="${artist.WebsiteURL}" target="_blank" rel="noopener">${artist.WebsiteURL}</a>` : ''}
          ${renderTicketsLink(artist)}
          <div class="artist-header__tags">
            ${artistTags.map(t => `<span class="pill-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
      ${artist.Bio ? `<p class="artist-bio">${artist.Bio}</p>` : '<p class="artist-bio empty-state">No bio yet.</p>'}
    `;

    // Specials for this artist (via lookup table, since specials can have multiple comedians)
    const specialIds = specialIdsForArtist(lookup, artistId);
    const artistSpecials = specials.filter(s => specialIds.includes(s.SpecialID));

    const specialsSection = document.getElementById('specials-section');
    const specialsList = document.getElementById('specials-list');
    const specialsHeading = document.getElementById('specials-heading');
    if (artistSpecials.length > 0) {
      specialsSection.style.display = '';
      specialsHeading.textContent = `Specials by ${artist.Name}`;
      specialsList.innerHTML = artistSpecials.map(s => {
        const hasVideo = Boolean(s.YouTubeLink);
        const poster = youTubeThumbnail(s.YouTubeLink) || POSTER_FALLBACK;
        const posterImg = `<img src="${poster}" alt="${s.Title} poster" loading="lazy" onerror="this.onerror=null;this.src='${POSTER_FALLBACK}';">`;
        const posterBlock = hasVideo
          ? `<a class="special-row__poster" href="${s.YouTubeLink}" target="_blank" rel="noopener" aria-label="Watch ${s.Title}">${posterImg}<span class="play-badge">${PLAY_ICON}</span></a>`
          : `<div class="special-row__poster">${posterImg}</div>`;
        return `
          <div class="special-row${hasVideo ? ' has-video' : ''}">
            ${posterBlock}
            <div class="special-row__info">
              <p class="special-row__title">
                ${hasVideo ? `<a href="${s.YouTubeLink}" target="_blank" rel="noopener">${s.Title}</a>` : s.Title}
                ${s.AiredYear ? `<span class="special-row__year"> · Aired ${s.AiredYear}</span>` : ''}
              </p>
              <div class="special-row__badges">
                ${hasVideo ? `<a class="watch-pill" href="${s.YouTubeLink}" target="_blank" rel="noopener">${PLAY_ICON}WATCH</a>` : ''}
                <span class="badge">${s.LanguageLevel || '?'}</span>
                <span class="badge">${s.ContentLevel || '?'}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Shorts for this artist
    const artistShorts = shorts.filter(s => String(s.ArtistID) === String(artistId));
    const shortsSection = document.getElementById('shorts-section');
    const shortsGrid = document.getElementById('artist-shorts');
    if (artistShorts.length > 0) {
      shortsSection.style.display = '';
      shortsGrid.innerHTML = artistShorts.map(s => `
        <div class="card">
          <div class="short-card__embed">
            <iframe src="${s.EmbedLink}" title="${s.Title}" allowfullscreen loading="lazy"></iframe>
          </div>
          <div class="short-card__body">
            <p class="short-card__title">"${s.Title}"</p>
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
