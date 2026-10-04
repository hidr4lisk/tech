// Escape helpers for innerHTML templates. Data comes from third-party feeds
// (RSS, GitHub releases, HF) — never interpolate it raw.

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Feed text often arrives entity-encoded (&#32;, &amp;): decode to plain text, then escape.
export function txt(v) {
  const s = String(v ?? '');
  if (!s.includes('&') && !s.includes('<')) return esc(s);
  return esc(new DOMParser().parseFromString(s, 'text/html').body.textContent);
}

// Only http(s) links; anything else (javascript:, data:) becomes '#'.
export function safeUrl(u) {
  try {
    const url = new URL(String(u ?? ''), location.href);
    return url.protocol === 'http:' || url.protocol === 'https:' ? esc(url.href) : '#';
  } catch {
    return '#';
  }
}
