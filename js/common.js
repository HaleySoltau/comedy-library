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
