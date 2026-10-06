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

import { getStoredToken, getStoredUser, checkAuthMe, clearAuthSession, verifyEmail } from './data/api.js';
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

// The app is rebuilt on language change; keep a handle on the live auth modal.
let currentAuthModal = null;

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

  currentAuthModal = authModal;

  // Initialize Scroll Reveal Animations
  setupScrollReveal();
}

// Links from verification / password reset emails: /?verify=TOKEN, /?reset=TOKEN
function handleEmailLinks() {
  const params = new URLSearchParams(window.location.search);
  const verifyToken = params.get('verify');
  const resetToken = params.get('reset');
  if (!verifyToken && !resetToken) return;

  // Remove the token from the address bar (and browser history) right away
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);

  if (resetToken) {
    currentAuthModal.openReset(resetToken);
  } else {
    verifyEmail(verifyToken).then(res => {
      currentAuthModal.showMessage(res.success ? res.message : (res.error || 'Failed to confirm email.'), !res.success);
    });
  }
}

// Other components (e.g. the alumni sign-in) can open the shared auth modal,
// such as its "Forgot password" view: dispatch 'rpps-open-auth' with a tab.
window.addEventListener('rpps-open-auth', (e) => currentAuthModal?.open(e.detail || 'login'));

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  handleEmailLinks();
  onLanguageChange(() => {
    const currentScrollY = window.scrollY;
    initApp();
    window.scrollTo({ top: currentScrollY, behavior: 'instant' });
  });
});
