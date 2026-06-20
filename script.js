(function () {
  const data = JSON.parse(document.getElementById('portfolio-data').textContent);
  const editMode = new URLSearchParams(location.search).get('edit') === '1';

  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  const applyImageSettings = (imgEl, conf) => {
    const fit = conf.fit || 'cover';
    const px = conf.posX != null ? conf.posX : 50;
    const py = conf.posY != null ? conf.posY : 50;
    const scale = conf.scale != null ? conf.scale : 1;
    imgEl.style.objectFit = fit;
    imgEl.style.objectPosition = `${px}% ${py}%`;
    imgEl.style.transform = `scale(${scale})`;
  };

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

  const heroImg = document.querySelector('.hero-img');
  heroImg.classList.add('editable');
  heroImg.dataset.confKey = 'hero';
  applyImageSettings(heroImg, data.hero);

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
         <img class="editable" data-conf-key="gallery.${i}" src="${g.image}" alt="${g.alt}" loading="lazy" />
       </figure>`
    ).join('');
    data.gallery.forEach((g, i) => {
      const img = galleryEl.querySelector(`[data-conf-key="gallery.${i}"]`);
      if (img) applyImageSettings(img, g);
    });
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

  if (!editMode) {
    galleryEl.addEventListener('click', e => {
      const item = e.target.closest('.gallery-item');
      if (item) openLightbox(Number(item.dataset.index));
    });
  }

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

  // ----- EDIT MODE -----
  if (!editMode) return;

  document.body.classList.add('edit-mode');

  const banner = document.createElement('div');
  banner.className = 'edit-banner';
  banner.textContent = 'EDIT MODE — click any photo to adjust · drag image to pan · scroll wheel to zoom';
  document.body.appendChild(banner);

  const panel = document.createElement('div');
  panel.className = 'edit-panel';
  panel.innerHTML = `
    <h3>Photo adjustments</h3>
    <div class="target">Click a photo to start</div>
    <div class="controls" style="display:none">
      <div class="fit-toggle">
        <button data-fit="cover">Crop to fill</button>
        <button data-fit="contain">Show whole photo</button>
      </div>
      <label>Zoom <span class="val-scale">1.0×</span></label>
      <input type="range" class="ctrl-scale" min="1" max="3" step="0.05" value="1" />
      <label>Horizontal position <span class="val-posx">50%</span></label>
      <input type="range" class="ctrl-posx" min="0" max="100" step="1" value="50" />
      <label>Vertical position <span class="val-posy">50%</span></label>
      <input type="range" class="ctrl-posy" min="0" max="100" step="1" value="50" />
      <button class="secondary reset" style="width:100%;padding:0.5rem;margin-top:0.5rem;background:#fff;color:#1a1a1a;border:1px solid var(--line);cursor:pointer;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em">Reset this photo</button>
    </div>
    <div class="actions">
      <button class="copy-btn">Copy code</button>
      <button class="secondary exit-btn">Exit edit</button>
    </div>
    <p class="hint">When happy: click "Copy code" → open index.html in Notepad → replace the JSON block at the top → save → commit & push.</p>
    <p class="copied">Copied! Now paste into index.html.</p>
  `;
  document.body.appendChild(panel);

  let selected = null;
  let selectedConf = null;

  const targetEl = panel.querySelector('.target');
  const controlsEl = panel.querySelector('.controls');
  const ctrlScale = panel.querySelector('.ctrl-scale');
  const ctrlPosX = panel.querySelector('.ctrl-posx');
  const ctrlPosY = panel.querySelector('.ctrl-posy');
  const valScale = panel.querySelector('.val-scale');
  const valPosX = panel.querySelector('.val-posx');
  const valPosY = panel.querySelector('.val-posy');
  const fitButtons = panel.querySelectorAll('.fit-toggle button');

  const getConf = (key) => {
    if (key === 'hero') return data.hero;
    const [, i] = key.split('.');
    return data.gallery[Number(i)];
  };

  const refreshPanel = () => {
    if (!selectedConf) return;
    ctrlScale.value = selectedConf.scale;
    ctrlPosX.value = selectedConf.posX;
    ctrlPosY.value = selectedConf.posY;
    valScale.textContent = Number(selectedConf.scale).toFixed(2) + '×';
    valPosX.textContent = selectedConf.posX + '%';
    valPosY.textContent = selectedConf.posY + '%';
    fitButtons.forEach(b => b.classList.toggle('active', b.dataset.fit === selectedConf.fit));
  };

  const selectImage = (img) => {
    document.querySelectorAll('.editable.selected').forEach(el => el.classList.remove('selected'));
    selected = img;
    selected.classList.add('selected');
    selectedConf = getConf(img.dataset.confKey);
    targetEl.textContent = 'Editing: ' + (img.alt || img.dataset.confKey);
    controlsEl.style.display = 'block';
    refreshPanel();
  };

  document.querySelectorAll('.editable').forEach(img => {
    img.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      selectImage(img);
    });
  });

  const updateSelected = () => {
    if (!selected || !selectedConf) return;
    applyImageSettings(selected, selectedConf);
    refreshPanel();
  };

  ctrlScale.addEventListener('input', e => { selectedConf.scale = Number(e.target.value); updateSelected(); });
  ctrlPosX.addEventListener('input', e => { selectedConf.posX = Number(e.target.value); updateSelected(); });
  ctrlPosY.addEventListener('input', e => { selectedConf.posY = Number(e.target.value); updateSelected(); });
  fitButtons.forEach(b => b.addEventListener('click', () => { selectedConf.fit = b.dataset.fit; updateSelected(); }));

  panel.querySelector('.reset').addEventListener('click', () => {
    if (!selectedConf) return;
    selectedConf.fit = 'cover';
    selectedConf.posX = 50;
    selectedConf.posY = 50;
    selectedConf.scale = 1;
    updateSelected();
  });

  // Drag-to-pan on the selected image
  let dragging = false;
  let startX = 0, startY = 0;
  let startPosX = 50, startPosY = 50;

  document.addEventListener('mousedown', e => {
    if (!selected || !e.target.classList.contains('editable')) return;
    if (e.target !== selected) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPosX = selectedConf.posX;
    startPosY = selectedConf.posY;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging || !selected) return;
    const rect = selected.getBoundingClientRect();
    const dx = ((e.clientX - startX) / rect.width) * 100;
    const dy = ((e.clientY - startY) / rect.height) * 100;
    selectedConf.posX = Math.max(0, Math.min(100, startPosX - dx));
    selectedConf.posY = Math.max(0, Math.min(100, startPosY - dy));
    updateSelected();
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  // Scroll-to-zoom on the selected image
  document.addEventListener('wheel', e => {
    if (!selected || !selectedConf) return;
    if (!selected.contains(e.target) && e.target !== selected) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    selectedConf.scale = Math.max(1, Math.min(3, selectedConf.scale + delta));
    updateSelected();
  }, { passive: false });

  // Copy updated JSON
  panel.querySelector('.copy-btn').addEventListener('click', async () => {
    const pretty = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(pretty);
      const copied = panel.querySelector('.copied');
      copied.classList.add('show');
      setTimeout(() => copied.classList.remove('show'), 4000);
    } catch (err) {
      prompt('Copy this and paste into the portfolio-data block in index.html:', pretty);
    }
  });

  panel.querySelector('.exit-btn').addEventListener('click', () => {
    location.href = location.pathname;
  });
})();
