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
import { createAuthModal } from './components/AuthModal.js';
import { createAdminDashboard } from './components/AdminDashboard.js';
import { createFooter } from './components/Footer.js';

import { getStoredToken } from './data/api.js';

function initApp() {
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Modals
  const contactModal = createContactModal();
  let authModal = null;
  let adminDashboard = null;

  const handleOpenApplyModal = () => {
    contactModal.classList.add('active');
  };

  const handleOpenAdminConsole = () => {
    const token = getStoredToken();
    if (token) {
      adminDashboard.classList.add('active');
    } else {
      authModal.classList.add('active');
    }
  };

  const handleAuthSuccess = (user) => {
    adminDashboard.classList.add('active');
  };

  const handleLogout = () => {
    // Session cleared
  };

  authModal = createAuthModal(handleAuthSuccess);
  adminDashboard = createAdminDashboard(handleLogout);

  // Mount Components
  app.appendChild(createHeader(handleOpenApplyModal, handleOpenAdminConsole));
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
  app.appendChild(authModal);
  app.appendChild(adminDashboard);
}

document.addEventListener('DOMContentLoaded', initApp);
