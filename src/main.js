import { initI18n, setLang, getLang, getStrings } from './core/i18n.js';

await initI18n();

const toolSelect = document.querySelector('.tool-select');
if (toolSelect) toolSelect.addEventListener('change', () => { window.location.href = toolSelect.value; });

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
  const { init } = await import('../dist/modules/digest/index.js');
  init(document.getElementById('digest-content'), ctx());
} catch (e) { console.error('[tech] módulo digest:', e); }

try {
  const { init } = await import('../dist/modules/news/index.js');
  init(document.getElementById('news-content'), ctx());
} catch (e) { console.error('[tech] módulo news:', e); }

try {
  const { init } = await import('../dist/modules/changelog/index.js');
  init(document.getElementById('changelog-content'), ctx());
} catch (e) { console.error('[tech] módulo changelog:', e); }

try {
  const { init } = await import('../dist/modules/compare/index.js');
  init(document.getElementById('compare-content'), ctx());
} catch (e) { console.error('[tech] módulo compare:', e); }

document.addEventListener('tech:langchange', ({ detail }) => {
  ['digest-content', 'news-content', 'changelog-content', 'compare-content'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const mod = el.__techModule;
    if (mod?.refresh) mod.refresh(detail);
  });
});

(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.querySelector('.hero__title');
  if (!el) return;
  const orig = el.textContent;
  const chars = '!@#$%^&*<>[]{}01';
  let frame = 0;
  const total = 40;
  const id = setInterval(() => {
    el.textContent = [...orig].map((ch, i) => {
      const lockAt = Math.floor((i / orig.length) * total * 0.75);
      return frame > lockAt ? ch : chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    if (++frame >= total) { clearInterval(id); el.textContent = orig; }
  }, 50);
  setTimeout(() => { const ov = document.getElementById('glitch-overlay'); if (ov) ov.remove(); }, 2100);
})();
