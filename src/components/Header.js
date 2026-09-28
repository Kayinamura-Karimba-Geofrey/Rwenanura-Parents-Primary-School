import { schoolInfo } from '../data/schoolData.js';

export function createHeader(onOpenApplyModal, onOpenTrackModal, onOpenAdminModal, onOpenAlumniModal) {
  const header = document.createElement('header');
  header.className = 'site-header';
  
  header.innerHTML = `
    <!-- Top Utility Bar -->
    <div class="top-bar">
      <div class="container top-bar-content">
        <div class="top-bar-info">
          <a href="tel:${schoolInfo.phone}" class="top-bar-item" title="Call RPPS Admissions">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${schoolInfo.phone}</span>
          </a>
          <a href="mailto:${schoolInfo.email}" class="top-bar-item" title="Email RPPS Admissions">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>${schoolInfo.email}</span>
          </a>
          <div class="top-bar-item top-bar-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Nyagatare, Rwanda</span>
          </div>
        </div>
        
        <div class="top-bar-actions">
          <button class="top-util-link parent-track-trigger" title="Check your admission application status">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Track Application</span>
          </button>
          <span class="util-divider">|</span>
          <button class="top-util-link alumni-top-trigger" title="OBs & OGs Alumni Network">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            <span>Alumni Network</span>
          </button>
          <span class="util-divider">|</span>
          <button class="top-util-link admin-modal-trigger" title="Staff Portal Login">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Staff Portal</span>
          </button>
          <span class="util-divider">|</span>
          <div class="lang-selector">
            <button class="lang-btn active" data-lang="en">EN</button>
            <button class="lang-btn" data-lang="rw">RW</button>
            <button class="lang-btn" data-lang="fr">FR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header Navbar -->
    <nav class="main-nav">
      <div class="container nav-container">
        <!-- School Crest Logo -->
        <a href="#home" class="brand-logo" aria-label="Rwenanura Parents Primary School Home">
          <div class="logo-crest">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M12 6l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Rwenanura Parents</span>
            <span class="brand-sub">Primary School</span>
          </div>
        </a>

        <!-- Navigation Links (Streamlined, Professional & Uncongested) -->
        <ul class="nav-menu" id="nav-menu">
          <li><a href="#about" class="nav-link">About</a></li>
          <li><a href="#academics" class="nav-link">Academics</a></li>
          <li><a href="#facilities" class="nav-link">Campus Life</a></li>
          <li><a href="#news" class="nav-link">News</a></li>
          <li><a href="#admissions" class="nav-link">Admissions</a></li>
          <li><a href="#alumni" class="nav-link alumni-nav-link">Alumni</a></li>
          <li><a href="#contact" class="nav-link">Contact</a></li>
        </ul>

        <!-- Right Action Button & Mobile Toggle -->
        <div class="nav-actions">
          <button class="btn btn-primary btn-sm apply-now-btn">
            <span>Apply Now</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          
          <button class="mobile-toggle" id="mobile-menu-btn" aria-label="Toggle navigation menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </nav>
  `;

  // Attach event listeners
  const applyBtn = header.querySelector('.apply-now-btn');
  const trackBtn = header.querySelector('.parent-track-trigger');
  const adminBtn = header.querySelector('.admin-modal-trigger');
  const alumniTopBtn = header.querySelector('.alumni-top-trigger');
  const alumniNavLink = header.querySelector('.alumni-nav-link');
  
  if (applyBtn && onOpenApplyModal) applyBtn.addEventListener('click', onOpenApplyModal);
  if (trackBtn && onOpenTrackModal) trackBtn.addEventListener('click', onOpenTrackModal);
  if (adminBtn && onOpenAdminModal) adminBtn.addEventListener('click', onOpenAdminModal);
  
  if (onOpenAlumniModal) {
    if (alumniTopBtn) alumniTopBtn.addEventListener('click', () => onOpenAlumniModal('chat', 'general'));
    if (alumniNavLink) {
      alumniNavLink.addEventListener('click', (e) => {
        const sec = document.querySelector('#alumni');
        if (sec) {
          e.preventDefault();
          sec.scrollIntoView({ behavior: 'smooth' });
        } else {
          e.preventDefault();
          onOpenAlumniModal('chat', 'general');
        }
      });
    }
  }

  const mobileBtn = header.querySelector('#mobile-menu-btn');
  const navMenu = header.querySelector('#nav-menu');
  
  mobileBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Smooth scroll active state
  const navLinks = header.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navMenu.classList.remove('open');
    });
  });

  // Language button switcher feedback
  const langBtns = header.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  return header;
}
