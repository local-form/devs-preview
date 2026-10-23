'use strict';
document.documentElement.classList.add('motion-ready');
document.querySelectorAll('section h2, .menu-group, blockquote, .window-shot, .gallery-main, .address, dl, form, .map').forEach(el => el.classList.add('reveal'));
const photos = {
  platter: ['platter.webp', 'A meat platter with rice and peas and fried plantains at Dev’s', 'Rice and peas, plantains, and a full plate.'],
  oxtail: ['oxtail.webp', 'Oxtail with rice and peas at Dev’s', 'Oxtail, rice and peas, and plantains.'],
  chicken: ['chicken.webp', 'Chicken with greens and cabbage at Dev’s', 'Chicken and greens from the kitchen.']
};
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  const photo = photos[button.dataset.photo];
  const image = document.getElementById('gallery-image');
  image.src = 'assets/' + photo[0]; image.alt = photo[1];
  document.getElementById('gallery-caption').textContent = photo[2];
  document.querySelectorAll('[data-photo]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
}));
// standard reveal: stagger siblings, fade in on arrival, failsafe
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
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
      if (el.type === 'radio') return el.checked ? el.value : '';
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
