import { galleryItems } from '../data/galleryData.js';
import { t, getLanguage } from '../data/i18n.js';

export function createGallery() {
  const section = document.createElement('section');
  section.className = 'section gallery-section';
  section.id = 'gallery';

  let currentCategory = 'all';
  let filteredItems = [...galleryItems];
  let activeLightboxIndex = 0;

  const categories = [
    { id: 'all', key: 'gal_tab_all', defaultLabel: 'All Moments' },
    { id: 'academics', key: 'gal_tab_academics', defaultLabel: 'Classrooms & Labs' },
    { id: 'sports', key: 'gal_tab_sports', defaultLabel: 'Sports & Athletics' },
    { id: 'culture', key: 'gal_tab_culture', defaultLabel: 'Culture & Arts' },
    { id: 'campus', key: 'gal_tab_campus', defaultLabel: 'Campus & Dining' }
  ];

  section.innerHTML = `
    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <div class="badge badge-gold">${t('gal_badge', 'Campus Life in Pictures')}</div>
        <h2 class="section-title">${t('gal_title', 'Moments of Joy, Discovery & Excellence')}</h2>
        <p class="section-subtitle">
          ${t('gal_subtitle', 'Explore our vibrant learning community in action across modern classrooms, science discovery labs, athletic pitches, and cultural celebrations.')}
        </p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="gallery-filters" id="gallery-filters-container">
        ${categories.map(cat => {
          const count = cat.id === 'all' 
            ? galleryItems.length 
            : galleryItems.filter(i => i.category === cat.id).length;
          return `
            <button class="gallery-filter-btn ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
              <span>${t(cat.key, cat.defaultLabel)}</span>
              <span class="gallery-filter-count">${count}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Gallery Grid -->
      <div class="gallery-grid" id="gallery-grid-container">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div class="lightbox-modal" id="gallery-lightbox" aria-modal="true" role="dialog" aria-hidden="true">
      <!-- Top Bar -->
      <div class="lightbox-topbar">
        <div class="lightbox-meta">
          <span class="lightbox-category-tag" id="lightbox-tag">Tag</span>
          <span class="lightbox-counter" id="lightbox-counter">1 / 12</span>
        </div>
        <div class="lightbox-actions">
          <button class="lightbox-btn lightbox-close-btn" id="lightbox-close" aria-label="Close Lightbox">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Middle Stage Area with Nav Arrows -->
      <div class="lightbox-stage">
        <button class="lightbox-nav-btn lightbox-prev-btn" id="lightbox-prev" aria-label="Previous Image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="lightbox-image-container">
          <img src="" alt="" class="lightbox-main-img" id="lightbox-main-img" />
        </div>

        <button class="lightbox-nav-btn lightbox-next-btn" id="lightbox-next" aria-label="Next Image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- Bottom Details Bar & Thumbnail Strip -->
      <div class="lightbox-bottombar">
        <h3 class="lightbox-title" id="lightbox-title">Title</h3>
        <p class="lightbox-caption" id="lightbox-caption">Caption</p>
        <div class="lightbox-thumbnails" id="lightbox-thumbnails-strip">
          <!-- Thumbnails rendered dynamically -->
        </div>
      </div>
    </div>
  `;

  const gridContainer = section.querySelector('#gallery-grid-container');
  const filterBtns = section.querySelectorAll('.gallery-filter-btn');
  const lightbox = section.querySelector('#gallery-lightbox');
  const lightboxImg = section.querySelector('#lightbox-main-img');
  const lightboxTitle = section.querySelector('#lightbox-title');
  const lightboxCaption = section.querySelector('#lightbox-caption');
  const lightboxTag = section.querySelector('#lightbox-tag');
  const lightboxCounter = section.querySelector('#lightbox-counter');
  const lightboxThumbStrip = section.querySelector('#lightbox-thumbnails-strip');
  const closeBtn = section.querySelector('#lightbox-close');
  const prevBtn = section.querySelector('#lightbox-prev');
  const nextBtn = section.querySelector('#lightbox-next');

  function getLocalizedText(obj) {
    const lang = getLanguage();
    if (!obj) return '';
    return obj[lang] || obj.en || '';
  }

  function renderGrid() {
    gridContainer.innerHTML = filteredItems.map((item, index) => {
      const itemTitle = getLocalizedText(item.title);
      const itemCaption = getLocalizedText(item.caption);
      return `
        <div class="gallery-card" data-index="${index}">
          <div class="gallery-card-img-wrapper">
            <img src="${item.image}" alt="${escapeHtml(itemTitle)}" class="gallery-card-img" loading="lazy" />
          </div>
          <span class="gallery-card-tag">${escapeHtml(item.tag)}</span>
          <span class="gallery-card-date">${escapeHtml(item.date)}</span>
          <div class="gallery-card-overlay">
            <h4 class="gallery-card-title">${escapeHtml(itemTitle)}</h4>
            <p class="gallery-card-caption-preview">${escapeHtml(itemCaption)}</p>
            <span class="gallery-card-cta">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              <span>${t('gal_view_photo', 'Expand Image')}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to cards
    gridContainer.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-index'), 10);
        openLightbox(index);
      });
    });
  }

  // Filter actions
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');

      if (currentCategory === 'all') {
        filteredItems = [...galleryItems];
      } else {
        filteredItems = galleryItems.filter(i => i.category === currentCategory);
      }

      renderGrid();
    });
  });

  // Lightbox functions
  function openLightbox(index) {
    if (filteredItems.length === 0) return;
    activeLightboxIndex = (index + filteredItems.length) % filteredItems.length;
    updateLightboxContent();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const currentItem = filteredItems[activeLightboxIndex];
    if (!currentItem) return;

    const itemTitle = getLocalizedText(currentItem.title);
    const itemCaption = getLocalizedText(currentItem.caption);

    lightboxImg.src = currentItem.image;
    lightboxImg.alt = itemTitle;
    lightboxTitle.textContent = itemTitle;
    lightboxCaption.textContent = itemCaption;
    lightboxTag.textContent = currentItem.tag;
    lightboxCounter.textContent = `${activeLightboxIndex + 1} / ${filteredItems.length}`;

    // Render Thumbnails
    lightboxThumbStrip.innerHTML = filteredItems.map((item, idx) => `
      <div class="lightbox-thumb ${idx === activeLightboxIndex ? 'active' : ''}" data-thumb-idx="${idx}">
        <img src="${item.image}" alt="" />
      </div>
    `).join('');

    lightboxThumbStrip.querySelectorAll('.lightbox-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-thumb-idx'), 10);
        activeLightboxIndex = idx;
        updateLightboxContent();
      });
    });

    // Auto-scroll active thumbnail into view
    const activeThumb = lightboxThumbStrip.querySelector('.lightbox-thumb.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function showNext() {
    if (filteredItems.length <= 1) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % filteredItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    if (filteredItems.length <= 1) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    updateLightboxContent();
  }

  // Lightbox event bindings
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close when clicking stage background (outside the image container)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Initial Grid Render
  renderGrid();

  return section;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
