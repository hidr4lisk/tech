import { initI18n, setLang, getLang, getStrings } from './core/i18n.js';

await initI18n();

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

const sections = document.querySelectorAll('.module-section');
const navLinks  = document.querySelectorAll('.module-nav__item');
if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => {
        const active = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', active);
        a.setAttribute('aria-current', active ? 'true' : 'false');
      });
    });
  }, { rootMargin: '-88px 0px -50% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));
}

const ctx = () => ({ lang: getLang(), strings: getStrings() });

try {
  const { init } = await import('../dist/modules/map/index.js');
  init(document.getElementById('map'), ctx());
} catch (e) { console.error('[tech] módulo map:', e); }

try {
  const { init } = await import('../dist/modules/news/index.js');
  init(document.getElementById('news'), ctx());
} catch (e) { console.error('[tech] módulo news:', e); }

try {
  const { init } = await import('../dist/modules/changelog/index.js');
  init(document.getElementById('changelog'), ctx());
} catch (e) { console.error('[tech] módulo changelog:', e); }

try {
  const { init } = await import('../dist/modules/compare/index.js');
  init(document.getElementById('compare'), ctx());
} catch (e) { console.error('[tech] módulo compare:', e); }

document.addEventListener('tech:langchange', ({ detail }) => {
  ['map', 'news', 'changelog', 'compare'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const mod = el.__techModule;
    if (mod?.refresh) mod.refresh(detail);
  });
});
