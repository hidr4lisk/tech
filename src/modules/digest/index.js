const DIGEST_DAYS = 7;

function daysAgo(isoStr) {
  return Math.floor((Date.now() - Date.parse(isoStr)) / 86400000);
}

function isRecent(isoStr) {
  return daysAgo(isoStr) <= DIGEST_DAYS;
}

function fmtDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

async function loadAll() {
  const [newsRes, clRes] = await Promise.all([
    fetch('./data/news.json').then(r => r.json()),
    fetch('./data/changelog.json').then(r => r.json()),
  ]);
  return {
    news:     (newsRes.items     ?? []).filter(i => isRecent(i.published_at)),
    releases: (clRes.releases    ?? []).filter(r => isRecent(r.published_at)),
  };
}

function buildDigest(container, { news, releases }, strings) {
  const models = releases.filter(r => r.type === 'model');
  const tools  = releases.filter(r => r.type === 'tool');

  const statHtml = [
    { num: news.length,     label: strings.digest_stat_news     ?? 'noticias' },
    { num: releases.length, label: strings.digest_stat_releases ?? 'releases' },
    { num: models.length,   label: strings.digest_stat_models   ?? 'modelos' },
  ].map(s => `
    <div class="digest-stat">
      <span class="digest-stat__num">${s.num}</span>
      <span class="digest-stat__label">${s.label}</span>
    </div>`).join('');

  const topNews = news.slice(0, 3).map(item => `
    <a class="digest-item" href="${item.url}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source">${item.source}</span>
      <span class="digest-item__title">${item.title}</span>
      <span class="digest-item__date">${fmtDate(item.published_at)}</span>
    </a>`).join('');

  const topReleases = releases.slice(0, 4).map(r => `
    <a class="digest-item" href="${r.url}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source digest-item__source--${r.type}">${r.project}</span>
      <span class="digest-item__title">${r.version}</span>
      <span class="digest-item__date">${fmtDate(r.published_at)}</span>
    </a>`).join('');

  const noActivity = !news.length && !releases.length;

  container.innerHTML = `
    <div class="digest">
      <div class="digest__header">
        <span class="digest__eyebrow vt323">${strings.digest_eyebrow ?? '// ÚLTIMOS 7 DÍAS'}</span>
        <div class="digest__stats">${statHtml}</div>
      </div>
      ${noActivity ? `<p class="digest__empty">${strings.digest_empty ?? 'Sin actividad reciente.'}</p>` : `
      <div class="digest__cols">
        ${topNews ? `
        <div class="digest__col">
          <p class="digest__col-label">${strings.digest_top_news ?? '// NOTICIAS'}</p>
          <div class="digest__items">${topNews}</div>
        </div>` : ''}
        ${topReleases ? `
        <div class="digest__col">
          <p class="digest__col-label">${strings.digest_top_releases ?? '// RELEASES'}</p>
          <div class="digest__items">${topReleases}</div>
        </div>` : ''}
      </div>`}
    </div>`;
}

export function init(container, { strings }) {
  if (!container) return;
  container.innerHTML = `<p class="module-loading vt323">${strings.digest_loading ?? 'CARGANDO...'}<span class="cursor">_</span></p>`;

  loadAll()
    .then(data => {
      buildDigest(container, data, strings);
      container.__techModule = {
        refresh: ({ strings: s }) => buildDigest(container, data, s),
      };
    })
    .catch(() => {
      container.innerHTML = `<p class="module-error">${strings.digest_error ?? 'Error.'}</p>`;
    });
}
