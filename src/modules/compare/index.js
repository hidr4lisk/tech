const COLS = [
  { key: 'name',          i18nKey: 'm4_col_name',      type: 'str' },
  { key: 'org',           i18nKey: 'm4_col_org',       type: 'str' },
  { key: 'params_b',      i18nKey: 'm4_col_params',    type: 'num', fmt: v => v ? `${v}B` : '—' },
  { key: 'context_window',i18nKey: 'm4_col_context',   type: 'num', fmt: v => v ? (v >= 1000 ? `${Math.round(v/1000)}K` : String(v)) : '—' },
  { key: 'multimodal',    i18nKey: 'm4_col_multimodal',type: 'bool' },
  { key: 'open_weights',  i18nKey: 'm4_col_open',      type: 'bool' },
  { key: 'license',       i18nKey: 'm4_col_license',   type: 'str' },
  { key: 'released_at',   i18nKey: 'm4_col_released',  type: 'str', fmt: v => v ? v.slice(0, 10) : '—' },
];

function cellHtml(col, val) {
  if (col.fmt) return col.fmt(val);
  if (col.type === 'bool') {
    const ok = val === true || val === 'true';
    return `<span class="${ok ? 'bool-true' : 'bool-false'}">${ok ? '✓' : '✗'}</span>`;
  }
  return val ?? '—';
}

function sortModels(models, sortKey, sortDir) {
  return [...models].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (av == null) av = sortDir === 'asc' ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === 'asc' ? Infinity : -Infinity;
    if (typeof av === 'boolean') av = av ? 1 : 0;
    if (typeof bv === 'boolean') bv = bv ? 1 : 0;
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

export function init(container, { strings }) {
  if (!container) return;

  container.innerHTML = `<p class="module-loading vt323">${strings.m4_loading ?? 'CARGANDO...'}<span class="cursor">_</span></p>`;

  fetch('./data/models.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => render(container, data, strings))
    .catch(() => {
      container.innerHTML = `<p class="module-error">${strings.m4_error ?? 'Error.'}</p>`;
    });
}

function render(container, data, strings) {
  const models = data.models ?? [];
  let sortKey = 'params_b';
  let sortDir = 'desc';

  const storedKeys = sessionStorage.getItem('tech_compare_hidden');
  const hidden = new Set(storedKeys ? JSON.parse(storedKeys) : []);

  function rebuild() {
    if (!models.length) {
      container.innerHTML = `<p class="module-loading" style="color:var(--text-tertiary)">${strings.m4_no_items ?? '—'}</p>`;
      return;
    }

    const sorted = sortModels(models.filter(m => !hidden.has(m.id)), sortKey, sortDir);

    const theadHtml = COLS.map(col => {
      const sortAttr = col.key === sortKey ? `aria-sort="${sortDir === 'asc' ? 'ascending' : 'descending'}"` : '';
      return `<th ${sortAttr} data-col="${col.key}" tabindex="0">
        ${strings[col.i18nKey] ?? col.key}<span class="sort-arrow"></span>
      </th>`;
    }).join('');

    const tbodyHtml = sorted.map(m => `
      <tr>
        ${COLS.map(col => `<td>${cellHtml(col, m[col.key])}</td>`).join('')}
      </tr>`).join('');

    container.innerHTML = `
      <div class="compare-wrapper" role="region" aria-label="${strings.m4_title ?? 'Compare'}">
        <table class="compare-table" aria-live="polite">
          <thead><tr>${theadHtml}</tr></thead>
          <tbody>${tbodyHtml}</tbody>
        </table>
      </div>`;

    container.querySelectorAll('.compare-table th').forEach(th => {
      const activate = () => {
        const col = th.dataset.col;
        if (sortKey === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = col;
          sortDir = 'asc';
        }
        rebuild();
      };
      th.addEventListener('click', activate);
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
  }

  rebuild();

  container.__techModule = {
    refresh: ({ strings: s }) => render(container, data, s),
  };
}
