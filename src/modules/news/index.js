const PAGE_SIZE = 20;

function relativeTime(isoStr, lang) {
  const diff = Date.now() - Date.parse(isoStr);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (lang === 'en') {
    if (mins  < 2)   return 'just now';
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  < 30)  return `${days}d ago`;
    return new Date(isoStr).toLocaleDateString('en');
  }
  if (mins  < 2)   return 'ahora';
  if (mins  < 60)  return `hace ${mins}m`;
  if (hours < 24)  return `hace ${hours}h`;
  if (days  < 30)  return `hace ${days}d`;
  return new Date(isoStr).toLocaleDateString('es');
}

function buildCard(item, lang) {
  const time = relativeTime(item.published_at, lang);
  return `
    <article class="news-card">
      <div class="news-card__head">
        <span class="news-card__source">${item.source}</span>
        <span class="news-card__time">${time}</span>
      </div>
      <a class="news-card__title" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
      ${item.summary ? `<p class="news-card__summary">${item.summary}</p>` : ''}
    </article>`;
}

function buildUpdatedAt(isoStr, strings, lang) {
  const rel = relativeTime(isoStr, lang);
  return `<p class="news-meta">${strings.m2_updated_prefix ?? '// DATOS:'} ${rel}</p>`;
}

export function init(container, { lang, strings }) {
  if (!container) return;

  container.innerHTML = `<p class="module-loading vt323">${strings.m2_loading ?? 'CARGANDO...'}<span class="cursor">_</span></p>`;

  fetch('./data/news.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => render(container, data, lang, strings))
    .catch(() => {
      container.innerHTML = `<p class="module-error">${strings.m2_error ?? 'Error.'}</p>`;
    });
}

function render(container, data, lang, strings) {
  const allItems = data.items ?? [];
  let activeSource = 'all';
  let shownCount   = PAGE_SIZE;

  const sources = ['all', ...new Set(allItems.map(i => i.source))];

  function rebuild() {
    const filtered = activeSource === 'all'
      ? allItems
      : allItems.filter(i => i.source === activeSource);
    const visible = filtered.slice(0, shownCount);

    const pillsHtml = sources.map(s =>
      `<button class="filter-pill${s === activeSource ? ' active' : ''}" data-src="${s}">
        ${s === 'all' ? (strings.m2_filter_all ?? 'TODOS') : s.toUpperCase()}
      </button>`
    ).join('');

    const updatedHtml = data.updated_at ? buildUpdatedAt(data.updated_at, strings, lang) : '';

    const cardsHtml = visible.length
      ? visible.map(i => buildCard(i, lang)).join('')
      : `<p class="module-loading" style="color:var(--text-tertiary)">${strings.m2_no_items ?? '—'}</p>`;

    const hasMore = filtered.length > shownCount;
    const loadMoreHtml = `
      <button class="news-load-more" ${!hasMore ? 'disabled' : ''}>
        ${hasMore ? (strings.m2_load_more ?? 'CARGAR MÁS ▸') : (strings.m2_no_more ?? '— FIN —')}
      </button>`;

    container.innerHTML = `
      ${updatedHtml}
      <div class="filter-pills" role="group">${pillsHtml}</div>
      <div class="news-list" aria-live="polite">${cardsHtml}</div>
      ${loadMoreHtml}`;

    container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeSource = pill.dataset.src;
        shownCount   = PAGE_SIZE;
        rebuild();
      });
    });

    container.querySelector('.news-load-more')?.addEventListener('click', () => {
      shownCount += PAGE_SIZE;
      rebuild();
    });
  }

  rebuild();

  container.__techModule = {
    refresh: ({ lang: l, strings: s }) => {
      lang    = l;
      strings = s;
      render(container, data, l, s);
    },
  };
}
