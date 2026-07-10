/* ============================================
   Comedy Library — shared helpers
   Used by every page's script (loaded before it)
   ============================================ */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function tagsForArtist(tags, artistId) {
  return tags.filter(t => String(t.ArtistID) === String(artistId)).map(t => t.Tag);
}

function tagsForSpecial(specialTags, specialId) {
  return specialTags.filter(t => String(t.SpecialID) === String(specialId)).map(t => t.Tag);
}

function specialIdsForArtist(specialLookup, artistId) {
  return specialLookup.filter(l => String(l.ArtistID) === String(artistId)).map(l => l.SpecialID);
}

function artistIdsForSpecial(specialLookup, specialId) {
  return specialLookup.filter(l => String(l.SpecialID) === String(specialId)).map(l => l.ArtistID);
}

function artistsForSpecial(artists, specialLookup, specialId) {
  return artistIdsForSpecial(specialLookup, specialId)
    .map(id => artists.find(a => String(a.ArtistID) === String(id)))
    .filter(Boolean);
}

// Does this artist have at least one special tagged with `tag`?
function artistHasSpecialTag(artistId, tag, specialLookup, specialTags) {
  return specialIdsForArtist(specialLookup, artistId)
    .some(sid => tagsForSpecial(specialTags, sid).includes(tag));
}

// Does this special belong to an artist who has the given artist-level style tag?
function specialHasArtistTag(specialId, tag, specialLookup, tags) {
  return artistIdsForSpecial(specialLookup, specialId)
    .some(aid => tagsForArtist(tags, aid).includes(tag));
}

// Extracts an 11-char YouTube video ID from any common URL shape.
function youTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function youTubeThumbnail(url) {
  const id = youTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Inline SVG placeholder poster, used when a special has no parseable YouTube link
// (or its thumbnail fails to load) — matches the new indigo/purple/teal palette.
const POSTER_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241A47"/>
      <stop offset="1" stop-color="#150E2E"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="160" cy="78" r="26" fill="none" stroke="#8B5CF6" stroke-width="2.5"/>
  <polygon points="152,64 152,92 178,78" fill="#2DD4BF"/>
  <text x="160" y="132" text-anchor="middle" font-family="Calibri, Inter, sans-serif" font-size="12" fill="#A79FC4">no poster available</text>
</svg>
`);

function highlightNavLink(activeHref) {
  document.querySelectorAll('.site-nav__link').forEach(link => {
    if (link.getAttribute('href') === activeHref) link.classList.add('active');
  });
}

function matchesSearch(text, query) {
  if (!query) return true;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

/* ---------- Icons (inline SVG, no external dependency) ---------- */

const PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z"/></svg>';

const CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6Z"/></svg>';

// Appends autoplay=1 to a YouTube embed URL (only — other providers like
// Instagram don't support it reliably via query param) so an expanded
// video starts playing immediately off the user's click gesture.
function withAutoplay(embedLink) {
  if (!embedLink.includes('youtube.com/embed')) return embedLink;
  const sep = embedLink.includes('?') ? '&' : '?';
  return `${embedLink}${sep}autoplay=1`;
}

// Instagram Reels embed in portrait (9:16), unlike YouTube's landscape 16:9 —
// callers use this to swap in the --vertical CSS variant for the right aspect ratio.
function isVerticalEmbed(embedLink) {
  return embedLink.includes('instagram.com');
}

/* ---------- Video lightbox — expands a clip to window width, correct aspect ratio ---------- */

function openVideoLightbox(embedLink, title) {
  const lightbox = document.createElement('div');
  lightbox.className = 'video-lightbox';
  const innerClass = isVerticalEmbed(embedLink) ? 'video-lightbox__inner video-lightbox__inner--vertical' : 'video-lightbox__inner';
  lightbox.innerHTML = `
    <div class="${innerClass}">
      <button class="video-lightbox__close" type="button" aria-label="Close">${CLOSE_ICON}</button>
      <iframe src="${withAutoplay(embedLink)}" title="${title}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
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

// Renders a short clip as a small poster thumbnail with a play button that
// opens the video-lightbox — shared markup for the homepage lineup strip
// and the artist page's clips section, so shorts behave identically everywhere.
function renderShortCard(short, extraBodyHtml = '') {
  const poster = short.ThumbnailURL || youTubeThumbnail(short.EmbedLink) || POSTER_FALLBACK;
  return `
    <div class="card">
      <button class="short-card__embed" type="button" data-embed="${short.EmbedLink}" data-title="${short.Title}" aria-label="Play ${short.Title}">
        <img src="${poster}" alt="${short.Title} poster" loading="lazy" onerror="this.onerror=null;this.src='${POSTER_FALLBACK}';">
        <span class="play-badge">${PLAY_ICON}</span>
      </button>
      <div class="short-card__body">
        <p class="short-card__title">"${short.Title}"</p>
        ${extraBodyHtml}
      </div>
    </div>
  `;
}

// Wires up click-to-open-lightbox for every .short-card__embed button inside `container`.
function bindShortCardEmbeds(container) {
  container.querySelectorAll('.short-card__embed').forEach(btn => {
    btn.addEventListener('click', () => openVideoLightbox(btn.dataset.embed, btn.dataset.title));
  });
}

/* ---------- Streaming platform ("Watch on X") pills for specials that
   aren't on YouTube — colors are per-platform brand accents, with a
   muted-purple fallback matching the site's existing chip style. ---------- */

// All platforms share one purple treatment (same as the former DVD fallback) —
// per-brand colors were too visually loud (e.g. Netflix red) next to the rest of the UI.
const PLATFORM_COLORS = {
  "default": { bg: "#372B63", text: "#D9CFFB" },
};

// Builds a search-results URL for a special's title on its streaming platform.
// Deliberately not a stored deep link — per-title/episode URLs aren't stable
// across platforms, so we send viewers to search instead.
function platformSearchUrl(platform, title) {
  const q = encodeURIComponent(title);
  const urls = {
    "Netflix":     `https://www.netflix.com/search?q=${q}`,
    "HBO Max":     `https://play.max.com/search?q=${q}`,
    "Prime Video": `https://www.amazon.com/s?k=${encodeURIComponent(title + " prime video")}&i=instant-video`,
    "Hulu":        `https://www.hulu.com/search?q=${q}`,
    "Paramount+":  `https://www.paramountplus.com/search?query=${q}`,
    "Apple TV+":   `https://tv.apple.com/search?term=${q}`,
    "Peacock":     `https://www.peacocktv.com/search?q=${q}`,
  };
  return urls[platform] || `https://www.google.com/search?q=${encodeURIComponent(title + " " + platform)}`;
}

// Renders the "Watch on {Platform}" pill for specials without a YouTubeLink.
function renderPlatformPill(special) {
  const colors = PLATFORM_COLORS.default;
  const url = platformSearchUrl(special.Platform, special.Title);
  return `<a class="watch-pill watch-pill--platform" href="${url}" target="_blank" rel="noopener noreferrer" style="background:${colors.bg};color:${colors.text};">Watch on ${special.Platform}</a>`;
}

const TICKET_ICON = '<svg viewBox="0 0 24 24"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4Zm-2-1.73a3.99 3.99 0 0 0 0 7.46V18H4v-2.27a3.99 3.99 0 0 0 0-7.46V6h16Z"/></svg>';

const SOCIAL_ICONS = {
  youtube: '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5L15.8 12Z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.66.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.66 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>',
};

// Builds the circular social-icon row for an artist — only icons for
// non-empty URL fields are rendered; the row shrinks otherwise.
function renderSocialIcons(artist) {
  const links = [
    { url: artist.FacebookURL, icon: 'facebook', label: 'Facebook' },
    { url: artist.TwitterURL, icon: 'twitter', label: 'Twitter/X' },
    { url: artist.InstagramURL, icon: 'instagram', label: 'Instagram' },
    { url: artist.YouTubeURL, icon: 'youtube', label: 'YouTube' },
  ].filter(l => l.url);

  if (links.length === 0) return '';

  return `<div class="social-icons">${links.map(l =>
    `<a class="social-icon" href="${l.url}" target="_blank" rel="noopener" aria-label="${l.label}">${SOCIAL_ICONS[l.icon]}</a>`
  ).join('')}</div>`;
}

// Builds the "Get Tickets" link from TourLink — omitted entirely if empty.
function renderTicketsLink(artist) {
  if (!artist.TourLink) return '';
  return `<a class="artist-header__tickets" href="${artist.TourLink}" target="_blank" rel="noopener">${TICKET_ICON} Get Tickets</a>`;
}
