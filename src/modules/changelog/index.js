function fmtDate(isoStr) {
  if (!isoStr) return '??';
  const d = new Date(isoStr);
  return d.toISOString().slice(0, 10);
}

function stripMd(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function buildEntry(rel, strings) {
  const badgeClass = rel.type === 'model' ? 'badge--model' : 'badge--tool';
  const badgeLabel = rel.type === 'model'
    ? (strings.m3_badge_model ?? 'MODEL')
    : (strings.m3_badge_tool  ?? 'TOOL');

  return `
    <div class="cl-entry cl-entry--${rel.type}" data-type="${rel.type}">
      <div class="cl-entry__head">
        <span class="cl-entry__date vt323">${fmtDate(rel.published_at)}</span>
        <span class="cl-entry__project">${rel.project}</span>
        <a class="cl-entry__version" href="${rel.url}" target="_blank" rel="noopener noreferrer">${rel.version}</a>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>
      ${rel.body_excerpt ? `<p class="cl-entry__body">${stripMd(rel.body_excerpt)}</p>` : ''}
    </div>`;
}

export function init(container, { strings }) {
  if (!container) return;

  container.innerHTML = `<p class="module-loading vt323">${strings.m3_loading ?? 'CARGANDO...'}<span class="cursor">_</span></p>`;

  fetch('./data/changelog.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => render(container, data, strings))
    .catch(() => {
      container.innerHTML = `<p class="module-error">${strings.m3_error ?? 'Error.'}</p>`;
    });
}

function render(container, data, strings) {
  const all = data.releases ?? [];
  let activeFilter = 'all';

  function rebuild() {
    const filtered = activeFilter === 'all'
      ? all
      : all.filter(r => r.type === activeFilter);

    const pillsHtml = [
      { key: 'all',   label: strings.m3_filter_all   ?? 'ALL' },
      { key: 'model', label: strings.m3_filter_model ?? 'MODELS' },
      { key: 'tool',  label: strings.m3_filter_tool  ?? 'TOOLS' },
    ].map(f =>
      `<button class="filter-pill${f.key === activeFilter ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
    ).join('');

    const entriesHtml = filtered.length
      ? filtered.map(r => buildEntry(r, strings)).join('')
      : `<p style="color:var(--text-tertiary);font-size:var(--t-xs)">${strings.m3_no_items ?? '—'}</p>`;

    container.innerHTML = `
      <div class="filter-pills" role="group">${pillsHtml}</div>
      <div class="changelog-timeline" aria-live="polite">${entriesHtml}</div>`;

    container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeFilter = pill.dataset.filter;
        rebuild();
      });
    });
  }

  rebuild();

  container.__techModule = {
    refresh: ({ strings: s }) => render(container, data, s),
  };
}
