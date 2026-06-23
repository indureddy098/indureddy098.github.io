(function () {
  const data = JSON.parse(document.getElementById('portfolio-data').textContent);
  const editMode = new URLSearchParams(location.search).get('edit') === '1';

  // ---------- defaults ----------
  data.theme = Object.assign({
    accent: '#1a1a1a', background: '#fafaf8', text: '#1a1a1a', muted: '#6b6b6b',
    heroOverlay: 0, galleryAspect: '3 / 4', galleryColumns: 260, galleryGap: 16,
    fontHeading: 'Cormorant Garamond', fontBody: 'Inter'
  }, data.theme || {});

  data.labels = Object.assign({
    navPortfolio: 'Portfolio', navStats: 'Stats', navContact: 'Contact',
    statsTitle: 'Stats', galleryTitle: 'Portfolio', contactTitle: 'Contact',
    contactSubtitle: 'For bookings, inquiries, and collaborations.',
    emailLabel: 'Email', instagramLabel: 'Instagram', agencyLabel: 'Representation'
  }, data.labels || {});

  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  const setPath = (obj, path, val) => {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => o[k], obj);
    target[last] = val;
  };

  const applyTheme = () => {
    const t = data.theme;
    const r = document.documentElement;
    r.style.setProperty('--bg', t.background);
    r.style.setProperty('--fg', t.text);
    r.style.setProperty('--muted', t.muted);
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--gallery-aspect', t.galleryAspect);
    r.style.setProperty('--gallery-gap', t.galleryGap + 'px');
    r.style.setProperty('--gallery-min', t.galleryColumns + 'px');
  };

  const applyImageSettings = (imgEl, conf) => {
    imgEl.style.objectFit = conf.fit || 'cover';
    imgEl.style.objectPosition = `${conf.posX ?? 50}% ${conf.posY ?? 50}%`;
    imgEl.style.transform = `scale(${conf.scale ?? 1})`;
  };

  const bindAll = () => {
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
  };

  const renderStats = () => {
    const el = document.querySelector('[data-bind-stats]');
    if (!el) return;
    el.innerHTML = Object.entries(data.stats).map(([k, v]) =>
      `<div class="stat-item"><dt>${k}</dt><dd>${v}</dd></div>`
    ).join('');
  };

  const renderGallery = () => {
    const el = document.querySelector('[data-bind-gallery]');
    if (!el) return;
    el.innerHTML = data.gallery.map((g, i) =>
      `<figure class="gallery-item" data-index="${i}">
         <img class="editable" data-conf-key="gallery.${i}" src="${g.image}" alt="${g.alt}" loading="lazy" />
       </figure>`
    ).join('');
    data.gallery.forEach((g, i) => {
      const img = el.querySelector(`[data-conf-key="gallery.${i}"]`);
      if (img) applyImageSettings(img, g);
    });
    if (editMode) wireImageEditClicks();
  };

  const renderHero = () => {
    const heroImg = document.querySelector('.hero-img');
    heroImg.classList.add('editable');
    heroImg.dataset.confKey = 'hero';
    applyImageSettings(heroImg, data.hero);
  };

  applyTheme();
  bindAll();
  renderHero();
  renderStats();
  renderGallery();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  let currentIndex = 0;

  const openLightbox = (i) => {
    currentIndex = i;
    lightboxImg.src = data.gallery[i].image;
    lightboxImg.alt = data.gallery[i].alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
  const navigate = (dir) => {
    currentIndex = (currentIndex + dir + data.gallery.length) % data.gallery.length;
    lightboxImg.src = data.gallery[currentIndex].image;
  };

  if (!editMode) {
    document.querySelector('[data-bind-gallery]').addEventListener('click', e => {
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

  if (!editMode) return;

  // ==================== EDIT MODE ====================
  document.body.classList.add('edit-mode');

  const banner = document.createElement('div');
  banner.className = 'edit-banner';
  banner.textContent = 'EDIT MODE — click any text to type · click any photo to adjust · changes save only when you copy & push';
  document.body.appendChild(banner);

  // Make all data-bind text elements click-to-edit
  const wireInlineEditing = () => {
    document.querySelectorAll('[data-bind]').forEach(el => {
      if (el.tagName === 'A' && el.getAttribute('data-bind-href')) return;
      el.contentEditable = 'true';
      el.spellcheck = false;
      el.addEventListener('input', () => {
        const path = el.getAttribute('data-bind');
        setPath(data, path, el.textContent);
        document.querySelectorAll(`[data-bind="${path}"]`).forEach(other => {
          if (other !== el) other.textContent = el.textContent;
        });
        if (path === 'name') document.title = data.name + ' — Portfolio';
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      });
    });
  };

  let selectedImg = null;
  let selectedConf = null;
  let selectedKey = null;

  const selectImage = (img) => {
    document.querySelectorAll('.editable.selected').forEach(el => el.classList.remove('selected'));
    selectedImg = img;
    selectedImg.classList.add('selected');
    selectedKey = img.dataset.confKey;
    selectedConf = selectedKey === 'hero' ? data.hero : data.gallery[Number(selectedKey.split('.')[1])];
    switchTab('photos');
    refreshPhotosTab();
  };

  const wireImageEditClicks = () => {
    document.querySelectorAll('.editable').forEach(img => {
      img.onclick = e => { e.preventDefault(); e.stopPropagation(); selectImage(img); };
    });
  };

  // ---------- panel ----------
  const panel = document.createElement('aside');
  panel.className = 'edit-panel';
  panel.innerHTML = `
    <div class="edit-tabs">
      <button data-tab="photos">Photos</button>
      <button data-tab="text">Text</button>
      <button data-tab="stats">Stats</button>
      <button data-tab="contact">Contact</button>
      <button data-tab="theme">Theme</button>
    </div>
    <div class="edit-tab-body">
      <section data-tab="photos"></section>
      <section data-tab="text" style="display:none"></section>
      <section data-tab="stats" style="display:none"></section>
      <section data-tab="contact" style="display:none"></section>
      <section data-tab="theme" style="display:none"></section>
    </div>
    <div class="edit-footer">
      <button class="btn-block primary copy-btn">Copy code → clipboard</button>
      <button class="btn-block exit-btn">Exit edit mode</button>
      <p class="copied">Copied! Paste into index.html (between &lt;script id="portfolio-data"&gt; tags).</p>
    </div>
  `;
  document.body.appendChild(panel);

  const tabBodies = {};
  panel.querySelectorAll('.edit-tab-body section').forEach(s => tabBodies[s.dataset.tab] = s);

  const switchTab = (name) => {
    panel.querySelectorAll('.edit-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    Object.entries(tabBodies).forEach(([k, el]) => el.style.display = k === name ? 'block' : 'none');
  };

  panel.querySelectorAll('.edit-tabs button').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  // ---------- PHOTOS tab ----------
  const refreshPhotosTab = () => {
    const body = tabBodies.photos;
    const allPhotos = [{key: 'hero', conf: data.hero, label: 'Hero'}, ...data.gallery.map((g, i) => ({key: `gallery.${i}`, conf: g, label: `#${i+1}`}))];
    body.innerHTML = `
      <h3>All photos</h3>
      <div class="photo-list">
        ${allPhotos.map(p => `
          <div class="thumb ${p.key === selectedKey ? 'active' : ''}" data-key="${p.key}">
            <span class="num">${p.label}</span>
            <img src="${p.conf.image}" alt="" />
          </div>
        `).join('')}
      </div>
      <button class="btn-block add-photo">+ Add gallery photo</button>
      ${selectedConf ? renderPhotoControls() : '<p class="hint">Click a photo above (or on the page) to adjust it.</p>'}
    `;
    body.querySelectorAll('.thumb').forEach(t => t.addEventListener('click', () => {
      const key = t.dataset.key;
      const el = document.querySelector(`.editable[data-conf-key="${key}"]`);
      if (el) { el.scrollIntoView({behavior: 'smooth', block: 'center'}); selectImage(el); }
    }));
    body.querySelector('.add-photo').addEventListener('click', addGalleryPhoto);
    if (selectedConf) wirePhotoControls();
  };

  const renderPhotoControls = () => {
    const isGallery = selectedKey.startsWith('gallery');
    return `
      <h3>Editing: ${selectedKey === 'hero' ? 'Hero' : 'Gallery #' + (Number(selectedKey.split('.')[1]) + 1)}</h3>
      <label>Image file <span class="val"></span></label>
      <input type="text" class="ctrl-img" value="${selectedConf.image}" placeholder="images/filename.png" />
      <label>Alt text <span class="val"></span></label>
      <input type="text" class="ctrl-alt" value="${selectedConf.alt || ''}" />
      <div class="fit-toggle">
        <button data-fit="cover" class="${selectedConf.fit === 'cover' ? 'active' : ''}">Crop to fill</button>
        <button data-fit="contain" class="${selectedConf.fit === 'contain' ? 'active' : ''}">Whole photo</button>
      </div>
      <label>Zoom <span class="val val-scale">${Number(selectedConf.scale).toFixed(2)}×</span></label>
      <input type="range" class="ctrl-scale" min="1" max="3" step="0.05" value="${selectedConf.scale}" />
      <label>Horizontal <span class="val val-posx">${Math.round(selectedConf.posX)}%</span></label>
      <input type="range" class="ctrl-posx" min="0" max="100" step="1" value="${selectedConf.posX}" />
      <label>Vertical <span class="val val-posy">${Math.round(selectedConf.posY)}%</span></label>
      <input type="range" class="ctrl-posy" min="0" max="100" step="1" value="${selectedConf.posY}" />
      <button class="btn-block reset-photo">Reset this photo</button>
      ${isGallery ? `<button class="btn-block danger remove-photo">Remove from gallery</button>` : ''}
      <p class="hint">Tip: drag the photo on the page to pan it, scroll wheel to zoom.</p>
    `;
  };

  const wirePhotoControls = () => {
    const body = tabBodies.photos;
    const updateAndApply = () => {
      applyImageSettings(selectedImg, selectedConf);
      body.querySelector('.val-scale').textContent = Number(selectedConf.scale).toFixed(2) + '×';
      body.querySelector('.val-posx').textContent = Math.round(selectedConf.posX) + '%';
      body.querySelector('.val-posy').textContent = Math.round(selectedConf.posY) + '%';
    };
    body.querySelector('.ctrl-img').addEventListener('input', e => {
      selectedConf.image = e.target.value;
      selectedImg.src = e.target.value;
      refreshPhotosTab();
    });
    body.querySelector('.ctrl-alt').addEventListener('input', e => {
      selectedConf.alt = e.target.value;
      selectedImg.alt = e.target.value;
    });
    body.querySelectorAll('.fit-toggle button').forEach(b => b.addEventListener('click', () => {
      selectedConf.fit = b.dataset.fit;
      body.querySelectorAll('.fit-toggle button').forEach(x => x.classList.toggle('active', x === b));
      applyImageSettings(selectedImg, selectedConf);
    }));
    body.querySelector('.ctrl-scale').addEventListener('input', e => { selectedConf.scale = Number(e.target.value); updateAndApply(); });
    body.querySelector('.ctrl-posx').addEventListener('input', e => { selectedConf.posX = Number(e.target.value); updateAndApply(); });
    body.querySelector('.ctrl-posy').addEventListener('input', e => { selectedConf.posY = Number(e.target.value); updateAndApply(); });
    body.querySelector('.reset-photo').addEventListener('click', () => {
      Object.assign(selectedConf, {fit: 'cover', posX: 50, posY: 50, scale: 1});
      applyImageSettings(selectedImg, selectedConf);
      refreshPhotosTab();
    });
    const removeBtn = body.querySelector('.remove-photo');
    if (removeBtn) removeBtn.addEventListener('click', () => {
      const i = Number(selectedKey.split('.')[1]);
      data.gallery.splice(i, 1);
      selectedImg = null; selectedConf = null; selectedKey = null;
      renderGallery();
      refreshPhotosTab();
    });
  };

  const addGalleryPhoto = () => {
    const next = data.gallery.length + 1;
    const padded = String(next).padStart(2, '0');
    data.gallery.push({image: `images/gallery-${padded}.png`, alt: `Gallery image ${next}`, fit: 'cover', posX: 50, posY: 50, scale: 1});
    renderGallery();
    refreshPhotosTab();
  };

  // ---------- TEXT tab ----------
  const refreshTextTab = () => {
    const body = tabBodies.text;
    body.innerHTML = `
      <h3>Page text</h3>
      <p class="hint">Click any text directly on the page to edit it inline. Or use the fields below.</p>
      <label>Name <span class="val"></span></label>
      <input type="text" class="txt-name" value="${escAttr(data.name)}" />
      <label>Tagline <span class="val"></span></label>
      <input type="text" class="txt-tagline" value="${escAttr(data.tagline)}" />

      <h3>Section titles</h3>
      <label>Stats heading <span class="val"></span></label>
      <input type="text" class="txt-statsTitle" value="${escAttr(data.labels.statsTitle)}" />
      <label>Portfolio heading <span class="val"></span></label>
      <input type="text" class="txt-galleryTitle" value="${escAttr(data.labels.galleryTitle)}" />
      <label>Contact heading <span class="val"></span></label>
      <input type="text" class="txt-contactTitle" value="${escAttr(data.labels.contactTitle)}" />
      <label>Contact subtitle <span class="val"></span></label>
      <input type="text" class="txt-contactSubtitle" value="${escAttr(data.labels.contactSubtitle)}" />

      <h3>Nav links</h3>
      <label>Portfolio link <span class="val"></span></label>
      <input type="text" class="txt-navPortfolio" value="${escAttr(data.labels.navPortfolio)}" />
      <label>Stats link <span class="val"></span></label>
      <input type="text" class="txt-navStats" value="${escAttr(data.labels.navStats)}" />
      <label>Contact link <span class="val"></span></label>
      <input type="text" class="txt-navContact" value="${escAttr(data.labels.navContact)}" />
    `;
    const wireText = (cls, path) => {
      body.querySelector('.txt-' + cls).addEventListener('input', e => {
        setPath(data, path, e.target.value);
        document.querySelectorAll(`[data-bind="${path}"]`).forEach(el => el.textContent = e.target.value);
      });
    };
    wireText('name', 'name');
    wireText('tagline', 'tagline');
    ['statsTitle','galleryTitle','contactTitle','contactSubtitle','navPortfolio','navStats','navContact'].forEach(k => wireText(k, 'labels.' + k));
  };

  // ---------- STATS tab ----------
  const refreshStatsTab = () => {
    const body = tabBodies.stats;
    const rows = Object.entries(data.stats);
    body.innerHTML = `
      <h3>Stats rows</h3>
      <p class="hint">Each row is one line on the page. Drag-free reorder with ↑↓.</p>
      ${rows.map(([k, v], i) => `
        <div class="edit-row" data-i="${i}">
          <button class="move-btn up" title="Move up">↑</button>
          <button class="move-btn down" title="Move down">↓</button>
          <input type="text" class="r-key" value="${escAttr(k)}" placeholder="Label" />
          <input type="text" class="r-val" value="${escAttr(v)}" placeholder="Value" />
          <button class="x-btn" title="Remove">×</button>
        </div>
      `).join('')}
      <button class="btn-block add-stat">+ Add row</button>
    `;
    body.querySelectorAll('.edit-row').forEach(row => {
      const i = Number(row.dataset.i);
      const oldKey = Object.keys(data.stats)[i];
      row.querySelector('.r-key').addEventListener('change', e => {
        const newKey = e.target.value || oldKey;
        const entries = Object.entries(data.stats);
        entries[i] = [newKey, entries[i][1]];
        data.stats = Object.fromEntries(entries);
        renderStats(); refreshStatsTab();
      });
      row.querySelector('.r-val').addEventListener('input', e => {
        data.stats[oldKey] = e.target.value;
        renderStats();
      });
      row.querySelector('.x-btn').addEventListener('click', () => {
        delete data.stats[oldKey];
        renderStats(); refreshStatsTab();
      });
      row.querySelector('.up').addEventListener('click', () => moveStat(i, -1));
      row.querySelector('.down').addEventListener('click', () => moveStat(i, +1));
    });
    body.querySelector('.add-stat').addEventListener('click', () => {
      data.stats['New label'] = 'value';
      renderStats(); refreshStatsTab();
    });
  };

  const moveStat = (i, dir) => {
    const entries = Object.entries(data.stats);
    const j = i + dir;
    if (j < 0 || j >= entries.length) return;
    [entries[i], entries[j]] = [entries[j], entries[i]];
    data.stats = Object.fromEntries(entries);
    renderStats(); refreshStatsTab();
  };

  // ---------- CONTACT tab ----------
  const refreshContactTab = () => {
    const body = tabBodies.contact;
    body.innerHTML = `
      <h3>Contact details</h3>
      <label>Email <span class="val"></span></label>
      <input type="email" class="c-email" value="${escAttr(data.contact.email)}" />
      <label>Instagram handle <span class="val"></span></label>
      <input type="text" class="c-ig" value="${escAttr(data.contact.instagram)}" />
      <label>Instagram URL <span class="val"></span></label>
      <input type="url" class="c-igurl" value="${escAttr(data.contact.instagramUrl)}" />
      <label>Representation <span class="val"></span></label>
      <input type="text" class="c-agency" value="${escAttr(data.contact.agency)}" />

      <h3>Field labels</h3>
      <label>Email label <span class="val"></span></label>
      <input type="text" class="c-emailLabel" value="${escAttr(data.labels.emailLabel)}" />
      <label>Instagram label <span class="val"></span></label>
      <input type="text" class="c-igLabel" value="${escAttr(data.labels.instagramLabel)}" />
      <label>Representation label <span class="val"></span></label>
      <input type="text" class="c-agencyLabel" value="${escAttr(data.labels.agencyLabel)}" />
    `;
    const wire = (cls, path, isHref, hrefPrefix) => {
      body.querySelector('.' + cls).addEventListener('input', e => {
        setPath(data, path, e.target.value);
        document.querySelectorAll(`[data-bind="${path}"]`).forEach(el => el.textContent = e.target.value);
        if (isHref) {
          document.querySelectorAll(`[data-bind-href="${path}"]`).forEach(el => el.href = (hrefPrefix || '') + e.target.value);
        }
      });
    };
    wire('c-email', 'contact.email', true, 'mailto:');
    wire('c-ig', 'contact.instagram');
    wire('c-igurl', 'contact.instagramUrl', true, '');
    wire('c-agency', 'contact.agency');
    wire('c-emailLabel', 'labels.emailLabel');
    wire('c-igLabel', 'labels.instagramLabel');
    wire('c-agencyLabel', 'labels.agencyLabel');
  };

  // ---------- THEME tab ----------
  const refreshThemeTab = () => {
    const body = tabBodies.theme;
    body.innerHTML = `
      <h3>Colors</h3>
      <div class="edit-color-row"><span>Background</span><input type="color" class="th-bg" value="${data.theme.background}" /></div>
      <div class="edit-color-row"><span>Text</span><input type="color" class="th-text" value="${data.theme.text}" /></div>
      <div class="edit-color-row"><span>Accent</span><input type="color" class="th-accent" value="${data.theme.accent}" /></div>
      <div class="edit-color-row"><span>Muted/secondary</span><input type="color" class="th-muted" value="${data.theme.muted}" /></div>

      <h3>Gallery layout</h3>
      <label>Photo shape <span class="val"></span></label>
      <div class="seg-toggle">
        <button data-ratio="3 / 4" class="${data.theme.galleryAspect === '3 / 4' ? 'active' : ''}">Portrait</button>
        <button data-ratio="1 / 1" class="${data.theme.galleryAspect === '1 / 1' ? 'active' : ''}">Square</button>
        <button data-ratio="4 / 3" class="${data.theme.galleryAspect === '4 / 3' ? 'active' : ''}">Landscape</button>
      </div>
      <label>Column width <span class="val val-cols">${data.theme.galleryColumns}px</span></label>
      <input type="range" class="th-cols" min="150" max="500" step="10" value="${data.theme.galleryColumns}" />
      <label>Gap between <span class="val val-gap">${data.theme.galleryGap}px</span></label>
      <input type="range" class="th-gap" min="0" max="40" step="2" value="${data.theme.galleryGap}" />

      <h3>Reset</h3>
      <button class="btn-block th-reset">Reset theme to default</button>
    `;
    const onColor = (cls, key) => body.querySelector('.' + cls).addEventListener('input', e => {
      data.theme[key] = e.target.value; applyTheme();
    });
    onColor('th-bg', 'background');
    onColor('th-text', 'text');
    onColor('th-accent', 'accent');
    onColor('th-muted', 'muted');
    body.querySelectorAll('.seg-toggle button').forEach(b => b.addEventListener('click', () => {
      data.theme.galleryAspect = b.dataset.ratio;
      body.querySelectorAll('.seg-toggle button').forEach(x => x.classList.toggle('active', x === b));
      applyTheme();
    }));
    body.querySelector('.th-cols').addEventListener('input', e => {
      data.theme.galleryColumns = Number(e.target.value);
      body.querySelector('.val-cols').textContent = e.target.value + 'px';
      applyTheme();
    });
    body.querySelector('.th-gap').addEventListener('input', e => {
      data.theme.galleryGap = Number(e.target.value);
      body.querySelector('.val-gap').textContent = e.target.value + 'px';
      applyTheme();
    });
    body.querySelector('.th-reset').addEventListener('click', () => {
      data.theme = {accent: '#1a1a1a', background: '#fafaf8', text: '#1a1a1a', muted: '#6b6b6b',
        heroOverlay: 0, galleryAspect: '3 / 4', galleryColumns: 260, galleryGap: 16,
        fontHeading: 'Cormorant Garamond', fontBody: 'Inter'};
      applyTheme(); refreshThemeTab();
    });
  };

  const escAttr = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // ---------- drag-to-pan & wheel-to-zoom ----------
  let dragging = false, startX = 0, startY = 0, startPosX = 50, startPosY = 50;
  document.addEventListener('mousedown', e => {
    if (!selectedImg || e.target !== selectedImg) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startPosX = selectedConf.posX; startPosY = selectedConf.posY;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = selectedImg.getBoundingClientRect();
    selectedConf.posX = Math.max(0, Math.min(100, startPosX - ((e.clientX - startX) / rect.width) * 100));
    selectedConf.posY = Math.max(0, Math.min(100, startPosY - ((e.clientY - startY) / rect.height) * 100));
    applyImageSettings(selectedImg, selectedConf);
    const px = tabBodies.photos.querySelector('.val-posx');
    const py = tabBodies.photos.querySelector('.val-posy');
    if (px) { px.textContent = Math.round(selectedConf.posX) + '%'; tabBodies.photos.querySelector('.ctrl-posx').value = selectedConf.posX; }
    if (py) { py.textContent = Math.round(selectedConf.posY) + '%'; tabBodies.photos.querySelector('.ctrl-posy').value = selectedConf.posY; }
  });
  document.addEventListener('mouseup', () => { dragging = false; });
  document.addEventListener('wheel', e => {
    if (!selectedImg || e.target !== selectedImg) return;
    e.preventDefault();
    selectedConf.scale = Math.max(1, Math.min(3, selectedConf.scale + (e.deltaY > 0 ? -0.05 : 0.05)));
    applyImageSettings(selectedImg, selectedConf);
    const vs = tabBodies.photos.querySelector('.val-scale');
    const cs = tabBodies.photos.querySelector('.ctrl-scale');
    if (vs) vs.textContent = selectedConf.scale.toFixed(2) + '×';
    if (cs) cs.value = selectedConf.scale;
  }, { passive: false });

  // ---------- Copy / Exit ----------
  panel.querySelector('.copy-btn').addEventListener('click', async () => {
    const pretty = JSON.stringify(data, null, 2);
    let ok = false;
    try { await navigator.clipboard.writeText(pretty); ok = true; }
    catch { prompt('Copy this and paste into the portfolio-data block in index.html:', pretty); }
    if (ok) {
      const c = panel.querySelector('.copied');
      c.classList.add('show');
      setTimeout(() => c.classList.remove('show'), 4000);
    }
  });
  panel.querySelector('.exit-btn').addEventListener('click', () => { location.href = location.pathname; });

  // ---------- init ----------
  wireInlineEditing();
  wireImageEditClicks();
  refreshPhotosTab();
  refreshTextTab();
  refreshStatsTab();
  refreshContactTab();
  refreshThemeTab();
  switchTab('photos');
})();
