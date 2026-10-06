/**
 * Privacy notice and terms of use shown from the footer.
 *
 * The privacy notice describes what this website actually collects (see the
 * server routes). Have the school administration review both texts, and
 * update them whenever the site starts collecting something new.
 */
import { schoolInfo } from './schoolData.js';

const LAST_UPDATED = 'October 2026';

export const privacyPolicy = {
  title: 'Privacy Notice',
  html: `
    <p class="info-updated">Last updated: ${LAST_UPDATED}</p>
    <p>${schoolInfo.name} ("the school") respects your privacy and handles personal data in line with Rwanda's law on the protection of personal data and privacy (Law N° 058/2021). This notice explains what this website collects and why.</p>

    <h4>What we collect</h4>
    <ul>
      <li><strong>Admission applications:</strong> parent or guardian name, phone number, email (optional), the child's name, the class applied for and any notes you add. Used only to process the application and to let you track its status with your tracking code.</li>
      <li><strong>Newsletter:</strong> your email address, used only to send school news. You can ask us to remove it at any time.</li>
      <li><strong>School portal accounts</strong> (pupils, staff): name, email and/or username, class (pupils) and a password, which is stored only in scrambled (hashed) form.</li>
      <li><strong>Alumni network:</strong> name, graduation year, member type and, if you choose to add them, profession, location, phone number and a short bio. Name, year, profession, location and bio appear in the alumni directory; phone and email are shown only to signed-in alumni and staff. Messages posted in the alumni lounge can be read by anyone visiting the site.</li>
    </ul>

    <h4>Who can see it</h4>
    <p>Applications, subscriber lists and account details are visible only to authorised school staff. We do not sell or share personal data with third parties, except where required by law.</p>

    <h4>Cookies and browser storage</h4>
    <p>We use one essential cookie to keep you signed in. Your browser also remembers your language choice and basic profile details so pages display correctly. We use no advertising or tracking cookies. Fonts are loaded from Google Fonts, which receives your IP address when it delivers them.</p>

    <h4>How long we keep it</h4>
    <p>Application records are kept for as long as needed for admissions and school records. Accounts and alumni profiles are kept until you ask us to delete them or the account is closed.</p>

    <h4>Your rights</h4>
    <p>You may ask to see, correct or delete your personal data, or object to how it is used. Contact the school at <a href="mailto:${schoolInfo.email}">${schoolInfo.email}</a> or ${schoolInfo.phone}.</p>
  `
};

export const termsOfUse = {
  title: 'Terms of Use',
  html: `
    <p class="info-updated">Last updated: ${LAST_UPDATED}</p>
    <p>By using this website you agree to these terms.</p>

    <h4>Information on this site</h4>
    <p>We work to keep school information (fees, dates, programmes) accurate, but it may change. Please confirm important details with the school office before acting on them.</p>

    <h4>Accounts</h4>
    <ul>
      <li>Give accurate information when registering, and keep your password private.</li>
      <li>Pupil and staff accounts are approved by the school and may be suspended or removed at any time.</li>
      <li>Tell the school straight away if you think someone else has used your account.</li>
    </ul>

    <h4>Alumni lounge and directory</h4>
    <ul>
      <li>Be respectful. Do not post anything offensive, misleading or unlawful, or anyone's private information.</li>
      <li>Messages are public; do not share anything you would not want others to read.</li>
      <li>The school may remove content or accounts that break these rules.</li>
    </ul>

    <h4>Contact</h4>
    <p>Questions about these terms: <a href="mailto:${schoolInfo.email}">${schoolInfo.email}</a>.</p>
  `
};
