# Hidr4lisk_Tech
**Open Source AI Ecosystem Tracker**

*Created by [Federico Furgiuele](https://linkedin.com/in/federico-furgiuele)*
[![GitHub](https://img.shields.io/badge/GitHub-hidr4lisk%2Ftech-98B4A6?style=flat&logo=github)](https://github.com/hidr4lisk/tech)
[![Live](https://img.shields.io/badge/Live-hidr4lisk.github.io%2Ftech-98B4A6?style=flat)](https://hidr4lisk.github.io/tech)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-federico--furgiuele-98B4A6?style=flat&logo=linkedin)](https://linkedin.com/in/federico-furgiuele)

[English](#english) | [Español](#español)

---

## English

Open source AI, all in one place. Models, releases and news — every 6h, no cookies, no servers.

### Modules

| # | Module | Description |
|---|--------|-------------|
| 00 | **Digest** | Auto-generated weekly summary: news count, release count, new models, top items at a glance |
| 01 | **News Feed** | Posts from official blogs and community (HuggingFace, Meta, Google, Microsoft, The Gradient, Qwen, r/LocalLLaMA, Simon Willison) |
| 02 | **Changelog** | Release timeline for tools (Ollama, llama.cpp, vLLM, Transformers, LocalAI, whisper.cpp, Unsloth, SGLang) and models (via HuggingFace API) |
| 03 | **Comparator** | Sortable table: context window, parameters, multimodal support, license, release date |
| 04 | **Sources** | Full list of data sources with links and applied filters — includes language disclaimer |

### How the data pipeline works

1. **`scripts/fetch.py`** runs via GitHub Actions cron (`0 */6 * * *`)
2. Fetches RSS feeds, GitHub Releases API and HuggingFace Models API
3. Merges with existing data (deduplication by URL / release ID)
4. Writes `data/news.json`, `data/models.json`, `data/changelog.json`
5. If files changed → commits to `main` → triggers deploy to GitHub Pages

All data lives as plain JSON in the repo. The browser fetches it directly from the same origin — no external API calls at runtime.

### Tech stack

| Layer | Tool |
|-------|------|
| Frontend | Vanilla JS (ES modules) |
| Styles | Tailwind CSS v3 + custom design tokens |
| Build | esbuild (JS) + Tailwind CLI (CSS) |
| Data | Python 3.11, `requests`, `pyyaml`, `python-dateutil` |
| Deploy | GitHub Actions → GitHub Pages |
| i18n | JSON-based, ES/EN toggle, no external library |

### Data sources

**News (RSS)** — capped at 12 items per source to keep the feed balanced
- HuggingFace Blog — `huggingface.co/blog/feed.xml`
- Meta Engineering — `engineering.fb.com/feed/` *(filter: llama, ai, model)*
- Google AI — `blog.google/innovation-and-ai/technology/ai/rss/` *(filter: gemma, llm, open)*
- Microsoft Research — `microsoft.com/en-us/research/feed/` *(filter: phi, llm, open)*
- The Gradient — `thegradient.pub/rss/`
- Qwen Blog — `qwenlm.github.io/blog/index.xml`
- r/LocalLLaMA — `reddit.com/r/LocalLLaMA/.rss`
- Simon Willison — `simonwillison.net/atom/everything/` *(filter: llm, model, local…)*

**Releases (GitHub API)**
- `ollama/ollama` · `ggml-org/llama.cpp` · `vllm-project/vllm` · `huggingface/transformers` · `mudler/LocalAI` · `ggml-org/whisper.cpp` · `unslothai/unsloth` · `sgl-project/sglang`

**Models (HuggingFace API)**
- Orgs tracked: `meta-llama`, `mistralai`, `google`, `microsoft`, `EleutherAI`, `stabilityai`, `Qwen`, `deepseek-ai`, `allenai`, `nvidia`, `01-ai`, `HuggingFaceTB`, `ibm-granite`, `CohereForAI`

### Run locally

```bash
git clone https://github.com/hidr4lisk/tech.git
cd tech

# Fetch data
pip install -r scripts/requirements.txt
python scripts/fetch.py

# Build frontend
npm install
npm run build

# Serve
npx serve .
```

### Contributing to the model map

The model comparator is sourced from `data/map.yaml`. To add a company or model, open a PR editing that file:

```yaml
companies:
  - id: your-org
    name: Your Org
    type: lab           # lab | platform | tool | researcher
    description_es: "..."
    description_en: "..."
    models:
      - id: your-model-id
        name: Your Model Name
        params_b: 7
        context_window: 128000
        open_weights: true
        license: apache-2.0
        multimodal: false
        hf_model_id: org/model-id-on-huggingface
```

### Privacy

- No cookies · no analytics
- No external requests at runtime (Google Fonts in CSS only)
- All data served from the same GitHub Pages origin
- Source is fully auditable

### License

[MIT](LICENSE)

---

## Español

IA open source, todo en un lugar. Modelos, releases y noticias — cada 6h, sin cookies, sin servidores.

### Módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 00 | **Digest** | Resumen semanal auto-generado: cantidad de noticias, releases, nuevos modelos y los items más recientes |
| 01 | **Noticias** | Posts de blogs oficiales y comunidad (HuggingFace, Meta, Google, Microsoft, The Gradient, Qwen, r/LocalLLaMA, Simon Willison) |
| 02 | **Changelog** | Timeline de releases de herramientas (Ollama, llama.cpp, vLLM, Transformers, LocalAI, whisper.cpp, Unsloth, SGLang) y modelos (via HuggingFace API) |
| 03 | **Comparador** | Tabla ordenable: contexto, parámetros, soporte multimodal, licencia, fecha de release |
| 04 | **Fuentes** | Lista completa de fuentes con links y filtros aplicados — incluye disclaimer de idioma |

### Cómo funciona el pipeline de datos

1. **`scripts/fetch.py`** corre via GitHub Actions cron (`0 */6 * * *`)
2. Consume feeds RSS, la API de GitHub Releases y la API de HuggingFace Models
3. Fusiona con datos existentes (deduplicación por URL / ID de release)
4. Escribe `data/news.json`, `data/models.json`, `data/changelog.json`
5. Si los archivos cambiaron → hace commit a `main` → dispara el deploy a GitHub Pages

Todos los datos viven como JSON plano en el repo. El browser los consume directamente desde el mismo origen — sin llamadas a APIs externas en runtime.

### Stack tecnológico

| Capa | Herramienta |
|------|-------------|
| Frontend | Vanilla JS (ES modules) |
| Estilos | Tailwind CSS v3 + design tokens propios |
| Build | esbuild (JS) + Tailwind CLI (CSS) |
| Datos | Python 3.11, `requests`, `pyyaml`, `python-dateutil` |
| Deploy | GitHub Actions → GitHub Pages |
| i18n | JSON-based, toggle ES/EN, sin librería externa |

### Fuentes de datos

**Noticias (RSS)**
- HuggingFace Blog — `huggingface.co/blog/feed.xml`
- Meta Engineering — `engineering.fb.com/feed/` *(filtro: llama, ai, model)*
- Google Research — `blog.research.google/feeds/posts/default` *(filtro: gemma, llm, open)*
- Microsoft Research — `microsoft.com/en-us/research/feed/` *(filtro: phi, llm, open)*
- The Gradient — `thegradient.pub/rss/`

**Releases (API de GitHub)**
- `ollama/ollama` · `ggerganov/llama.cpp` · `vllm-project/vllm` · `huggingface/transformers` · `mudler/LocalAI`

**Modelos (API de HuggingFace)**
- Orgs rastreadas: `meta-llama`, `mistralai`, `google`, `microsoft`, `EleutherAI`, `stabilityai`, `Qwen`, `deepseek-ai`

### Correr localmente

```bash
git clone https://github.com/hidr4lisk/tech.git
cd tech

# Obtener datos
pip install -r scripts/requirements.txt
python scripts/fetch.py

# Compilar frontend
npm install
npm run build

# Servir
npx serve .
```

### Contribuir al mapa de modelos

El comparador se alimenta de `data/map.yaml`. Para agregar una empresa o modelo, abrí un PR editando ese archivo:

```yaml
companies:
  - id: tu-org
    name: Tu Org
    type: lab           # lab | platform | tool | researcher
    description_es: "..."
    description_en: "..."
    models:
      - id: id-del-modelo
        name: Nombre del Modelo
        params_b: 7
        context_window: 128000
        open_weights: true
        license: apache-2.0
        multimodal: false
        hf_model_id: org/model-id-en-huggingface
```

### Privacidad

- Sin cookies · sin analytics
- Sin requests externos en runtime (Google Fonts solo en CSS)
- Todos los datos servidos desde el mismo origen de GitHub Pages
- Código completamente auditable

### Licencia

[MIT](LICENSE)
