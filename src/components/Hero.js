import { heroSlides } from '../data/schoolData.js';

export function createHero(onOpenApplyModal) {
  const section = document.createElement('section');
  section.className = 'hero-section';
  section.id = 'home';

  let currentSlide = 0;
  let autoplayTimer = null;

  section.innerHTML = `
    <!-- Background Carousel Slider -->
    <div class="hero-slider">
      ${heroSlides.map((slide, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image}');" data-index="${index}">
          <div class="hero-overlay"></div>
        </div>
      `).join('')}
    </div>

    <!-- Foreground Banner Content -->
    <div class="container" style="position: relative; z-index: 10;">
      <div class="hero-content">
        <div class="badge badge-gold" id="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span id="badge-text">${heroSlides[0].badge}</span>
        </div>
        <h2 id="hero-title" class="animate-fade-in">${heroSlides[0].title}</h2>
        <p id="hero-subtitle">${heroSlides[0].subtitle}</p>
        
        <div class="hero-actions">
          <button class="btn btn-gold hero-cta-primary animate-pulse-glow">
            <span id="cta-primary-text">${heroSlides[0].ctaPrimary}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          
          <a href="#about" class="btn btn-glass">
            <span>Learn More</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Slider Controls -->
    <div class="slider-controls">
      <button class="slider-arrow prev-slide" aria-label="Previous slide" style="color: white; background: rgba(255,255,255,0.15); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      
      <div class="slider-dots">
        ${heroSlides.map((_, index) => `
          <div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('')}
      </div>

      <button class="slider-arrow next-slide" aria-label="Next slide" style="color: white; background: rgba(255,255,255,0.15); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  `;

  // Function to switch slides
  const slides = section.querySelectorAll('.hero-slide');
  const dots = section.querySelectorAll('.dot');
  const badgeText = section.querySelector('#badge-text');
  const titleEl = section.querySelector('#hero-title');
  const subtitleEl = section.querySelector('#hero-subtitle');
  const ctaText = section.querySelector('#cta-primary-text');
  const ctaBtn = section.querySelector('.hero-cta-primary');

  ctaBtn.addEventListener('click', onOpenApplyModal);

  function goToSlide(index) {
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    const slideData = heroSlides[currentSlide];

    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });

    // Content fade update
    badgeText.textContent = slideData.badge;
    titleEl.textContent = slideData.title;
    subtitleEl.textContent = slideData.subtitle;
    ctaText.textContent = slideData.ctaPrimary;
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  // Event bindings
  section.querySelector('.prev-slide').addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    startAutoplay();
  });

  section.querySelector('.next-slide').addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    startAutoplay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      goToSlide(idx);
      startAutoplay();
    });
  });

  startAutoplay();

  return section;
}
