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
import { createFooter } from './components/Footer.js';

function initApp() {
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Modal handler
  const contactModal = createContactModal();

  const handleOpenModal = () => {
    contactModal.classList.add('active');
  };

  // Mount Components
  app.appendChild(createHeader(handleOpenModal));
  app.appendChild(createHero(handleOpenModal));
  app.appendChild(createStats());
  app.appendChild(createAcademics(handleOpenModal));
  app.appendChild(createAbout());
  app.appendChild(createFacilities());
  app.appendChild(createNewsEvents());
  app.appendChild(createAdmissions(handleOpenModal));
  app.appendChild(createTestimonials());
  app.appendChild(createFooter());
  app.appendChild(contactModal);
}

document.addEventListener('DOMContentLoaded', initApp);
