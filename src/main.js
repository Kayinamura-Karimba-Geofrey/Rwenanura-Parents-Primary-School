import './style.css';
import './styles/components.css';
import './styles/alumni.css';
import './styles/gallery.css';
import './styles/calendar.css';

import { createHeader } from './components/Header.js';
import { createHero } from './components/Hero.js';
import { createStats } from './components/Stats.js';
import { createAcademics } from './components/Academics.js';
import { createAbout } from './components/About.js';
import { createFacilities } from './components/Facilities.js';
import { createGallery } from './components/Gallery.js';
import { createAcademicCalendar } from './components/AcademicCalendar.js';
import { createNewsEvents } from './components/NewsEvents.js';
import { createAdmissions } from './components/Admissions.js';
import { createTuitionEstimator } from './components/TuitionEstimator.js';
import { createFAQ } from './components/FAQ.js';
import { createTestimonials } from './components/Testimonials.js';
import { createContactModal } from './components/ContactModal.js';
import { createTrackModal } from './components/TrackModal.js';
import { createAuthModal } from './components/AuthModal.js';
import { createAdminDashboard } from './components/AdminDashboard.js';
import { createAlumniModal } from './components/AlumniModal.js';
import { createAlumniSection } from './components/AlumniSection.js';
import { createFooter } from './components/Footer.js';

import { getStoredToken, getStoredUser, checkAuthMe, clearAuthSession } from './data/api.js';
import { initUserRole } from './data/userRole.js';
import { onLanguageChange } from './data/i18n.js';

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
    '.section-header, .program-card, .facility-card, .gallery-card, .term-summary-card, .calendar-event-card, .news-card, .step-card, .stat-card, .value-item, .headteacher-card, .testimonials-slider, .faq-item, .alumni-pillar-card, .spotlight-card, .metric-pill'
  );

  elementsToReveal.forEach((el, idx) => {
    el.classList.add('reveal-on-scroll');
    const delayClass = `reveal-delay-${(idx % 4) + 1}`;
    el.classList.add(delayClass);
    observer.observe(el);
  });
}

function initApp() {
  initUserRole();

  // SECURITY: validate the stored session against the server on load so
  // expired tokens and revoked/downgraded roles can't keep granting access
  // to admin UI state from localStorage.
  if (getStoredToken()) {
    checkAuthMe().then(res => {
      if (!res.success) {
        clearAuthSession();
      }
    });
  }

  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Modals
  const contactModal = createContactModal();
  const trackModal = createTrackModal();
  const alumniModal = createAlumniModal();
  let authModal = null;
  let adminDashboard = null;

  const handleOpenApplyModal = () => {
    contactModal.classList.add('active');
  };

  const handleOpenTrackModal = () => {
    trackModal.classList.add('active');
  };

  const handleOpenAlumniModal = (tab = 'chat', channel = null) => {
    alumniModal.open(tab, channel);
  };

  const handleOpenAdminConsole = () => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user && user.role === 'alumni') {
      alumniModal.open('portal');
    } else if (token && user && (user.role === 'staff' || user.role === 'admin')) {
      adminDashboard.classList.add('active');
    } else {
      authModal.open('login');
    }
  };

  const handleOpenAuthModal = (tab = 'login') => {
    authModal.open(tab);
  };

  const handleAuthSuccess = (user) => {
    if (user && user.role === 'alumni') {
      alumniModal.open('portal');
    } else if (user && user.role === 'student') {
      // Calendar section renders once its data loads after sign-in
      setTimeout(() => document.querySelector('#calendar')?.scrollIntoView({ behavior: 'smooth' }), 400);
    } else {
      adminDashboard.classList.add('active');
    }
  };

  const handleLogout = () => {
    // Session cleared
  };

  authModal = createAuthModal(handleAuthSuccess, () => handleOpenAlumniModal('portal'));
  adminDashboard = createAdminDashboard(handleLogout);

  // Mount Components
  app.appendChild(createHeader(handleOpenApplyModal, handleOpenTrackModal, handleOpenAdminConsole, handleOpenAlumniModal, handleOpenAuthModal));
  app.appendChild(createHero(handleOpenApplyModal));
  app.appendChild(createStats());
  app.appendChild(createAcademics(handleOpenApplyModal));
  app.appendChild(createAbout());
  app.appendChild(createFacilities());
  app.appendChild(createGallery());
  app.appendChild(createAcademicCalendar());
  app.appendChild(createNewsEvents());
  app.appendChild(createAlumniSection(handleOpenAlumniModal));
  app.appendChild(createAdmissions(handleOpenApplyModal));
  app.appendChild(createTuitionEstimator(handleOpenApplyModal));
  app.appendChild(createFAQ());
  app.appendChild(createTestimonials());
  app.appendChild(createFooter());
  app.appendChild(contactModal);
  app.appendChild(trackModal);
  app.appendChild(authModal);
  app.appendChild(adminDashboard);
  app.appendChild(alumniModal);

  // Initialize Scroll Reveal Animations
  setupScrollReveal();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  onLanguageChange(() => {
    const currentScrollY = window.scrollY;
    initApp();
    window.scrollTo({ top: currentScrollY, behavior: 'instant' });
  });
});
