(function () {
  const data = JSON.parse(document.getElementById('portfolio-data').textContent);

  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  document.querySelectorAll('[data-bind]').forEach(el => {
    const v = getPath(data, el.getAttribute('data-bind'));
    if (v != null) el.textContent = v;
  });

  document.querySelectorAll('[data-bind-src]').forEach(el => {
    const v = getPath(data, el.getAttribute('data-bind-src'));
    if (v) el.src = v;
  });

  document.querySelectorAll('[data-bind-alt]').forEach(el => {
    const v = getPath(data, el.getAttribute('data-bind-alt'));
    if (v) el.alt = v;
  });

  document.querySelectorAll('[data-bind-href]').forEach(el => {
    const v = getPath(data, el.getAttribute('data-bind-href'));
    const prefix = el.getAttribute('data-href-prefix') || '';
    if (v) el.href = prefix + v;
  });

  document.title = data.name + ' — Portfolio';

  const statsEl = document.querySelector('[data-bind-stats]');
  if (statsEl) {
    statsEl.innerHTML = Object.entries(data.stats).map(([k, v]) =>
      `<div class="stat-item"><dt>${k}</dt><dd>${v}</dd></div>`
    ).join('');
  }

  const galleryEl = document.querySelector('[data-bind-gallery]');
  if (galleryEl) {
    galleryEl.innerHTML = data.gallery.map((g, i) =>
      `<figure class="gallery-item" data-index="${i}">
         <img src="${g.image}" alt="${g.alt}" loading="lazy" />
       </figure>`
    ).join('');
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  let currentIndex = 0;

  const openLightbox = (i) => {
    currentIndex = i;
    lightboxImg.src = data.gallery[i].image;
    lightboxImg.alt = data.gallery[i].alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const navigate = (dir) => {
    currentIndex = (currentIndex + dir + data.gallery.length) % data.gallery.length;
    lightboxImg.src = data.gallery[currentIndex].image;
    lightboxImg.alt = data.gallery[currentIndex].alt;
  };

  galleryEl.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item) openLightbox(Number(item.dataset.index));
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();
