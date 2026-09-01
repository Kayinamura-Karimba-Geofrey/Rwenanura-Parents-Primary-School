import './style.css';
import './styles/components.css';

import { createHeader } from './components/Header.js';
import { createHero } from './components/Hero.js';
import { createStats } from './components/Stats.js';
import { createAcademics } from './components/Academics.js';
import { createAbout } from './components/About.js';
import { createFacilities } from './components/Facilities.js';
import { createNewsEvents } from './components/NewsEvents.js';
import { createAdmissions } from './components/Admissions.js';
import { createTestimonials } from './components/Testimonials.js';
import { createContactModal } from './components/ContactModal.js';
import { createTrackModal } from './components/TrackModal.js';
import { createAuthModal } from './components/AuthModal.js';
import { createAdminDashboard } from './components/AdminDashboard.js';
import { createFooter } from './components/Footer.js';

import { getStoredToken } from './data/api.js';

function setupScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToReveal = document.querySelectorAll(
    '.section-header, .program-card, .facility-card, .news-card, .step-card, .stat-card, .value-item, .headteacher-card, .testimonials-slider'
  );

  elementsToReveal.forEach((el, idx) => {
    el.classList.add('reveal-on-scroll');
    const delayClass = `reveal-delay-${(idx % 4) + 1}`;
    el.classList.add(delayClass);
    observer.observe(el);
  });
}

function initApp() {
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Modals
  const contactModal = createContactModal();
  const trackModal = createTrackModal();
  let authModal = null;
  let adminDashboard = null;

  const handleOpenApplyModal = () => {
    contactModal.classList.add('active');
  };

  const handleOpenTrackModal = () => {
    trackModal.classList.add('active');
  };

  const handleOpenAdminConsole = () => {
    const token = getStoredToken();
    if (token) {
      adminDashboard.classList.add('active');
    } else {
      authModal.classList.add('active');
    }
  };

  const handleAuthSuccess = () => {
    adminDashboard.classList.add('active');
  };

  const handleLogout = () => {
    // Session cleared
  };

  authModal = createAuthModal(handleAuthSuccess);
  adminDashboard = createAdminDashboard(handleLogout);

  // Mount Components
  app.appendChild(createHeader(handleOpenApplyModal, handleOpenTrackModal, handleOpenAdminConsole));
  app.appendChild(createHero(handleOpenApplyModal));
  app.appendChild(createStats());
  app.appendChild(createAcademics(handleOpenApplyModal));
  app.appendChild(createAbout());
  app.appendChild(createFacilities());
  app.appendChild(createNewsEvents());
  app.appendChild(createAdmissions(handleOpenApplyModal));
  app.appendChild(createTestimonials());
  app.appendChild(createFooter());
  app.appendChild(contactModal);
  app.appendChild(trackModal);
  app.appendChild(authModal);
  app.appendChild(adminDashboard);

  // Initialize Scroll Reveal Animations
  setupScrollReveal();
}

document.addEventListener('DOMContentLoaded', initApp);
