'use strict';
document.documentElement.classList.add('motion-ready');
document.querySelectorAll('section h2, .menu-group, blockquote, .gallery, .address, .visit-actions, form, .map').forEach(el => el.classList.add('reveal'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// gallery: thumbnails, swipe, tap-to-enlarge viewer
const photos = {
  platter: ['platter.webp', 'A plate of stew with rice and peas and fried plantains at Dev’s', 'A full plate: stew, rice and peas, fried plantains.', 1200, 925],
  closeup: ['closeup.webp', 'A saucy stewed meat dish up close at Dev’s', 'Up close, from the kitchen at Dev’s.', 1080, 745],
  plate: ['curry-plate.webp', 'A curry plate with rice and peas and steamed cabbage at Dev’s', 'Rice and peas with steamed cabbage.', 1000, 1120]
};
const keys = Object.keys(photos);
let current = 0;
const image = document.getElementById('gallery-image'), caption = document.getElementById('gallery-caption');
const viewer = document.querySelector('.viewer'), vImg = viewer.querySelector('img'), vCap = viewer.querySelector('figcaption');
const fill = (img, cap, k) => { const p = photos[k]; img.src = 'assets/' + p[0]; img.alt = p[1]; img.width = p[3]; img.height = p[4]; cap.textContent = p[2]; };
function show(i) {
  current = (i + keys.length) % keys.length;
  const k = keys[current];
  document.querySelectorAll('[data-photo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.photo === k)));
  const swap = () => { fill(image, caption, k); image.classList.remove('fading'); };
  if (reduce) swap(); else { image.classList.add('fading'); setTimeout(swap, 170); }
  if (viewer.open) fill(vImg, vCap, k);
}
document.querySelectorAll('[data-photo]').forEach(b => b.addEventListener('click', () => show(keys.indexOf(b.dataset.photo))));
const swipe = (el, onLeft, onRight) => {
  let x0 = null, y0 = 0;
  el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive: true});
  el.addEventListener('touchend', e => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { e.preventDefault(); dx < 0 ? onLeft() : onRight(); }
  });
};
const zoom = document.querySelector('.zoom');
swipe(zoom, () => show(current + 1), () => show(current - 1));
swipe(viewer, () => show(current + 1), () => show(current - 1));
zoom.addEventListener('click', () => { fill(vImg, vCap, keys[current]); viewer.showModal(); viewer.querySelector('.v-close').focus(); });
viewer.querySelector('.v-prev').addEventListener('click', () => show(current - 1));
viewer.querySelector('.v-next').addEventListener('click', () => show(current + 1));
viewer.querySelector('.v-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(current - 1); if (e.key === 'ArrowRight') show(current + 1); });
viewer.addEventListener('close', () => zoom.focus());

// hero dish links: scroll to the menu card and flash it
document.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => {
  const t = document.querySelector(a.getAttribute('href')); if (!t) return;
  e.preventDefault();
  t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'});
  history.replaceState(null, '', a.getAttribute('href'));
  t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
  setTimeout(() => t.classList.remove('flash'), 1800);
}));
// standard reveal: stagger siblings, fade in on arrival, failsafe
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const n = new Map();
  els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
})();

// Local Form request form (shared across previews): reads the request back and sends nothing.
document.querySelectorAll('form[data-lf-request]').forEach(form => {
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.querySelectorAll('input[type=date]').forEach(d => d.min = today.toISOString().slice(0, 10));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const parts = [...form.querySelectorAll('[data-sum]')].map(el => {
      if (el.type === 'radio' || el.type === 'checkbox') return el.checked ? el.value : '';
      let v = el.value.trim(); if (!v) return '';
      if (el.type === 'date') v = new Date(v + 'T00:00').toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'});
      return el.dataset.sum.replace('%', v);
    }).filter(Boolean);
    const name = (form.elements.name?.value || '').trim(), done = form.querySelector('.lf-done'), b = document.createElement('b'), p = document.createElement('span');
    b.textContent = `Your request: ${parts.join(' · ')}${name ? ` (for ${name})` : ''}`;
    p.textContent = form.dataset.lfConfirm;
    done.replaceChildren(b, p); done.hidden = false; done.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  });
});
