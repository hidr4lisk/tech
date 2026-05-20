const TYPE_BADGE = {
  platform:   'badge--platform',
  lab:        'badge--open',
  researcher: 'badge--researcher',
  tool:       'badge--tool',
};

const TYPE_KEY = {
  platform:   'm1_badge_platform',
  lab:        'm1_badge_open',
  researcher: 'm1_badge_researcher',
  tool:       'm1_badge_tool',
};

function fmtParams(b) {
  if (!b) return null;
  return b >= 1 ? `${b}B` : `${Math.round(b * 1000)}M`;
}

function fmtContext(n) {
  if (!n) return null;
  return n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
}

function buildCompanyCard(company, models, strings) {
  const typeClass = TYPE_BADGE[company.type] ?? 'badge--researcher';
  const typeLabelKey = TYPE_KEY[company.type] ?? 'm1_badge_researcher';
  const initial = (company.name || '?')[0];
  const desc = strings.lang === 'es'
    ? (company.description_es || '')
    : (company.description_en || '');

  const companyModels = models.filter(m => m.org === company.id);

  const modelChipsHtml = companyModels.length
    ? companyModels.map(m => {
        const params = fmtParams(m.params_b);
        return `
          <button class="model-chip" data-model-id="${m.id}" aria-expanded="false">
            <span>${m.name}</span>
            ${params ? `<span class="model-chip__params">${params}</span>` : ''}
          </button>`;
      }).join('')
    : `<span style="font-size:var(--t-xs);color:var(--text-disabled)">${strings.m1_no_models ?? '—'}</span>`;

  return `
    <article class="company-card" data-company-id="${company.id}" data-type="${company.type}">
      <div class="company-card__head">
        <div class="company-card__avatar" aria-hidden="true">${initial}</div>
        <span class="company-card__name">${company.name}</span>
        <span class="badge ${typeClass}">${strings[typeLabelKey] ?? company.type}</span>
      </div>
      ${desc ? `<p class="company-card__desc">${desc}</p>` : ''}
      <div>
        <p class="company-card__models-label">${strings.m1_models_label ?? 'MODELOS'}</p>
        <div class="model-chips">${modelChipsHtml}</div>
      </div>
    </article>`;
}

function buildModelDetail(model, strings) {
  const fields = [
    [strings.m1_params,   fmtParams(model.params_b)],
    [strings.m1_context,  fmtContext(model.context_window)],
    [strings.m1_license,  model.license],
    [strings.m1_released, model.released_at ? model.released_at.slice(0, 10) : null],
    ['OPEN', model.open_weights ? '✓' : '✗'],
    ['MULTIMODAL', model.multimodal ? '✓' : '✗'],
  ].filter(([, v]) => v != null);

  return `
    <div class="model-detail" role="region" aria-label="${model.name}">
      ${fields.map(([k, v]) => `
        <div class="model-detail__field">
          <span class="model-detail__key">${k}</span>
          <span class="model-detail__val">${v}</span>
        </div>`).join('')}
    </div>`;
}

function applyFilter(container, activeFilter) {
  container.querySelectorAll('.company-card').forEach(card => {
    const type = card.dataset.type;
    let show = true;
    if (activeFilter === 'open') {
      const hasOpen = card.querySelectorAll('.model-chip').length > 0;
      show = hasOpen && type !== 'tool';
    } else if (activeFilter === 'multimodal') {
      show = card.querySelector('[data-multimodal="true"]') !== null;
    } else if (activeFilter === 'tool') {
      show = type === 'tool';
    }
    card.style.display = show ? '' : 'none';
  });
}

function attachChipListeners(container, modelsById) {
  container.querySelectorAll('.model-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const modelId = chip.dataset.modelId;
      const model = modelsById[modelId];
      if (!model) return;

      const expanded = chip.getAttribute('aria-expanded') === 'true';
      const existingDetail = chip.closest('.company-card').querySelector('.model-detail');

      if (expanded) {
        chip.setAttribute('aria-expanded', 'false');
        if (existingDetail) existingDetail.remove();
        return;
      }

      container.querySelectorAll('.model-chip[aria-expanded="true"]').forEach(c => {
        c.setAttribute('aria-expanded', 'false');
      });
      container.querySelectorAll('.model-detail').forEach(d => d.remove());

      chip.setAttribute('aria-expanded', 'true');
      const strings = chip.closest('[data-strings]')?.__strings ?? {};
      const detailHtml = buildModelDetail(model, strings);
      chip.closest('.company-card').insertAdjacentHTML('beforeend', detailHtml);
    });
  });
}

export function init(container, { strings }) {
  if (!container) return;

  container.innerHTML = `<p class="module-loading vt323">${strings.m1_loading ?? 'CARGANDO...'}<span class="cursor">_</span></p>`;

  fetch('./data/models.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => render(container, data, strings))
    .catch(() => {
      container.innerHTML = `<p class="module-error">${strings.m1_error ?? 'Error.'}</p>`;
    });
}

function render(container, data, strings) {
  const models = data.models ?? [];
  const companies = data.companies ?? [];
  const modelsById = Object.fromEntries(models.map(m => [m.id, m]));

  const filters = [
    { key: 'all',       label: strings.m1_filter_all },
    { key: 'open',      label: strings.m1_filter_open },
    { key: 'multimodal',label: strings.m1_filter_multimodal },
    { key: 'tool',      label: strings.m1_filter_tool },
  ];

  const pillsHtml = filters.map(f =>
    `<button class="filter-pill${f.key === 'all' ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  const cardsHtml = companies.map(c => buildCompanyCard(c, models, strings)).join('');

  container.innerHTML = `
    <div class="filter-pills" role="group" aria-label="Filtros">${pillsHtml}</div>
    <div class="map-grid" aria-live="polite">${cardsHtml}</div>`;

  container.__strings = strings;

  container.querySelectorAll('.model-chip').forEach(chip => {
    chip.closest('[data-strings]');
    chip.closest('.company-card').__strings = strings;
  });

  container.querySelector('.map-grid').__strings = strings;

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilter(container.querySelector('.map-grid'), pill.dataset.filter);
    });
  });

  attachChipListeners(container, modelsById);

  container.__techModule = {
    refresh: ({ strings: s }) => {
      container.innerHTML = '';
      render(container, data, s);
    },
  };
}
