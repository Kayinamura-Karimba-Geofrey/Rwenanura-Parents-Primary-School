/**
 * Internationalization (i18n) Module for Rwenanura Parents Primary School
 * Supports English (en), Ikinyarwanda (rw), and Français (fr)
 */

export const SUPPORTED_LANGS = {
  EN: 'en',
  RW: 'rw',
  FR: 'fr'
};

const LANG_STORAGE_KEY = 'rpps_selected_lang';
const LANG_EVENT_NAME = 'rpps-language-changed';

export function getLanguage() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'rw' || saved === 'fr')) {
      return saved;
    }
  }
  return SUPPORTED_LANGS.EN;
}

export function setLanguage(lang) {
  const cleanLang = (lang === 'rw' || lang === 'fr') ? lang : 'en';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, cleanLang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = cleanLang;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANG_EVENT_NAME, {
      detail: { lang: cleanLang }
    }));
  }
}

export function onLanguageChange(callback) {
  if (typeof window !== 'undefined') {
    const handler = (e) => callback(e.detail.lang);
    window.addEventListener(LANG_EVENT_NAME, handler);
    return () => window.removeEventListener(LANG_EVENT_NAME, handler);
  }
  return () => {};
}

export const translations = {
  en: {
    // Header
    top_location: "Nyagatare, Rwanda",
    top_track: "Track Application",
    top_alumni: "Alumni Network",
    top_staff: "Staff Portal",
    top_call: "Call Admissions",
    top_email: "Email Admissions",
    nav_about: "About",
    nav_academics: "Academics",
    nav_campus: "Campus Life",
    nav_news: "News",
    nav_admissions: "Admissions",
    nav_alumni: "Alumni",
    nav_contact: "Contact",
    btn_apply_now: "Apply Now",
    school_name: "Rwenanura Parents",
    school_type: "Primary School",

    // Hero
    hero_badge: "Academic Excellence in Eastern Province",
    hero_title_1: "Inspiring Young Minds to Reach Higher Heights",
    hero_subtitle_1: "Rwenanura Parents Primary School provides a world-class holistic foundation in a nurturing, learner-centered environment in Nyagatare.",
    hero_cta_apply: "Explore Admissions",
    hero_cta_tour: "Schedule a Tour",
    hero_title_2: "100% Primary Leaving Exam Distinction Rate",
    hero_subtitle_2: "Consistently ranked among the top-performing primary schools in Nyagatare District and the Eastern Province of Rwanda.",
    hero_title_3: "Digital Literacy & Modern Science Laboratories",
    hero_subtitle_3: "Empowering pupils with coding, robotics, hands-on scientific discovery, and modern ICT skills for tomorrow's world.",
    hero_title_4: "Vibrant Sports, Music & Cultural Leadership",
    hero_subtitle_4: "Developing confidence, teamwork, and talents beyond the classroom through comprehensive extracurricular activities.",
    btn_learn_more: "Learn More",

    // Stats
    stat_pass_rate: "100%",
    stat_pass_label: "PLE Pass Rate",
    stat_pass_desc: "First-grade division achievement",
    stat_pupils: "850+",
    stat_pupils_label: "Enrolled Pupils",
    stat_pupils_desc: "Nursery through Primary 6",
    stat_teachers: "38+",
    stat_teachers_label: "Dedicated Teachers",
    stat_teachers_desc: "Certified, experienced educators",
    stat_ratio: "1:22",
    stat_ratio_label: "Teacher-Pupil Ratio",
    stat_ratio_desc: "Individualized learner attention",

    // Academics
    acad_badge: "Curriculum & Programs",
    acad_title: "Academic Excellence at Every Stage",
    acad_subtitle: "Following the Rwanda Basic Education Board (REB) Competence-Based Curriculum (CBC) enriched with digital literacy, moral ethics, and international languages.",
    acad_nursery: "Nursery & Early Childhood",
    acad_nursery_grades: "Baby, Middle & Top Classes (Ages 3 - 5)",
    acad_nursery_desc: "A warm, child-centered environment focused on play-based learning, motor skills, English & Kinyarwanda immersion, and creative social interaction.",
    acad_lower: "Lower Primary School",
    acad_lower_grades: "Primary 1 to Primary 3 (Ages 6 - 8)",
    acad_lower_desc: "Building strong foundations in literacy, mental numeracy, scientific discovery, and environmental awareness while instilling curiosity.",
    acad_upper: "Upper Primary School",
    acad_upper_grades: "Primary 4 to Primary 6 (Ages 9 - 12)",
    acad_upper_desc: "Rigorous academic preparation for national Primary Leaving Examinations (PLE), critical thinking development, and French language introduction.",
    acad_stem: "STEM & Digital Innovation",
    acad_stem_grades: "All Primary Learners (P1 - P6)",
    acad_stem_desc: "Interactive coding workshops, basic robotics, environmental science projects, and hands-on computer literacy lab sessions.",
    btn_apply_program: "Enroll in Program →",

    // About
    about_badge: "Who We Are",
    about_title: "Leadership & Core Values",
    about_p1: "Founded with a vision to nurture knowledgeable, ethical, and ambitious leaders for Rwanda and the global community.",
    about_p2: "Today, RPPS has grown into a leading institution in Eastern Rwanda, consistently topping national exam rankings while maintaining a pupil-first ethos.",
    headteacher_title: "Headteacher & Academic Director",
    headteacher_name: "Mr. Geofrey K. Kayinamura",
    headteacher_quote: "At Rwenanura Parents Primary School, we believe every child is born with unique potential. Our dedicated team of educators fosters an environment where academic rigor meets character building, critical thinking, and holistic development.",
    about_pillars_title: "Our Core Pillars",
    about_pillars_desc: "At Rwenanura Parents Primary School, we cultivate five core principles in every pupil from Nursery to Primary 6:",

    // Core Values
    val_integrity: "Integrity & Respect",
    val_integrity_desc: "We cultivate honesty, mutual respect, self-discipline, and strong moral principles in every learner.",
    val_excellence: "Academic Excellence",
    val_excellence_desc: "We strive for high standards, encouraging curiosity, critical thinking, and intellectual mastery.",
    val_inclusivity: "Inclusivity & Caring",
    val_inclusivity_desc: "A welcoming, supportive environment where every child feels valued, safe, and encouraged to thrive.",
    val_innovation: "Innovation & Curiosity",
    val_innovation_desc: "Fostering active problem-solving, digital literacy, coding, and creative expression across all ages.",
    val_community: "Community & Leadership",
    val_community_desc: "Inspiring pupils to be active contributors, responsible stewards, and collaborative leaders.",

    // Facilities
    fac_badge: "Campus Life & Infrastructure",
    fac_title: "Modern Learning Facilities",
    fac_subtitle: "Designed to support interactive learning, healthy physical growth, digital skills, and student wellbeing.",

    // News & Events
    news_badge: "Stay Updated",
    news_title: "What's Happening at RPPS",
    news_subtitle: "Keep up with recent school achievements, upcoming academic events, sports competitions, and parent announcements.",
    news_read_more: "Read More →",

    // Tuition Estimator
    calc_badge: "Transparent Fee Structure",
    calc_title: "Interactive Tuition Estimator",
    calc_subtitle: "Calculate termly fees and optional services for your child at Rwenanura Parents Primary School.",
    calc_select_options: "Select Options",
    calc_label_grade: "Grade Level *",
    calc_opt_nursery: "Nursery School (Baby, Middle, Top Class) - 75,000 RWF",
    calc_opt_lower: "Lower Primary (Primary 1, Primary 2, Primary 3) - 95,000 RWF",
    calc_opt_upper: "Upper Primary (Primary 4, Primary 5, Primary 6) - 110,000 RWF",
    calc_label_services: "Optional Services & Facilities",
    calc_lunch_label: "Balanced Daily Lunch & Tea Program (+18,000 RWF/term)",
    calc_transport_label: "School Bus Transportation (Nyagatare Route) (+25,000 RWF/term)",
    calc_uniform_label: "Complete Uniform Package (2 Shirts, Sweater, Sportswear) (+20,000 RWF initial)",
    calc_note: "💡 Note: Tuition fees include full access to computer labs, library books, and sports facilities.",
    calc_summary_title: "Estimated Summary",
    calc_tuition_row: "Tuition Fee:",
    calc_meal_row: "Meal Plan:",
    calc_transport_row: "Transport:",
    calc_uniform_row: "Uniform Set:",
    calc_total_investment: "Total Term 1 Investment",
    calc_btn_apply: "Submit Application Now 🚀",

    // Admissions
    adm_badge: "Join Our Family",
    adm_title: "Admissions & How To Apply",
    adm_subtitle: "We welcome prospective pupils for Nursery through Primary 6. We offer a transparent, supportive enrollment process for all families.",
    adm_step1_title: "Online Application / In-Person Form",
    adm_step1_desc: "Fill out our quick admission application online or visit our school administration office at Rwenanura campus.",
    adm_step2_title: "Document Submission & Interview",
    adm_step2_desc: "Submit your child's birth certificate and previous school report. Pupils take a friendly assessment to determine placement.",
    adm_step3_title: "Admission Offer & Welcome Pack",
    adm_step3_desc: "Upon evaluation, parents receive an official acceptance letter with admission codes, fee guidelines, and term orientation details.",
    adm_banner_badge: "Enrollment Open for 2026/2027 Academic Year",
    adm_banner_title: "Ready to Begin Your Child's Journey?",
    adm_banner_desc: "Complete our easy online application or schedule an on-campus meeting with our Admissions Team today.",
    btn_start_app: "Start Online Application",
    btn_book_tour: "Book School Tour",
    btn_track_app: "Track Application Status",

    // Alumni
    alumni_badge: "Alumni Network & Community",
    alumni_title: "Old Boys & Old Girls (OBs & OGs)",
    alumni_subtitle: "From Rwenanura to universities and leadership across Rwanda and beyond. Reconnect with classmates, mentor upcoming candidates, and participate in school development.",
    alumni_stat_graduated: "Graduated Alumni",
    alumni_stat_cohorts: "Graduating Cohorts",
    alumni_stat_mentors: "Active Mentors",
    alumni_stat_spirit: "RPPS Spirit & Pride",
    alumni_card1_title: "OBs & OGs Live ChatUp",
    alumni_card1_desc: "Connect directly in themed channels: daily catch-ups in #General, reunion arrangements in #Reunions, guidance in #Mentorship, and throwback stories in #Memories.",
    alumni_card2_title: "Official WhatsApp Group",
    alumni_card2_desc: "Stay connected on your phone! Receive instant updates about school events, alumni announcements, and cohort-specific WhatsApp threads.",
    alumni_card3_title: "2026 Grand Alumni Gala",
    alumni_card3_desc: "The official homecoming at the RPPS Nyagatare Campus: alumni vs pupil sports matches, campus tour of new ICT facilities, and networking banquet.",
    btn_open_chat: "Open Alumni ChatUp",
    btn_join_whatsapp: "Join WhatsApp Community",
    btn_discuss_reunions: "Discuss in #Reunions Channel",
    alumni_spotlight_title: "Featured Alumni Spotlights",
    alumni_spotlight_sub: "Discover where our Old Boys and Old Girls are making an impact today.",
    alumni_btn_directory: "Browse Full Directory (500+) →",
    alumni_banner_auth_badge: "Verified Member",
    alumni_banner_auth_title: "Welcome back",
    alumni_banner_auth_p: "Reconnect in real-time, plan the 2026 reunion, or explore the full alumni contact directory.",
    alumni_banner_guest_badge: "Join the Legacy",
    alumni_banner_guest_title: "Are you an Old Boy or Old Girl of RPPS?",
    alumni_banner_guest_p: "Authenticate or register your profile to unlock full directory contacts, network with classmates, and post in the live chat lounge.",
    alumni_btn_lounge: "Open Alumni Lounge 💬",
    alumni_btn_signin: "Alumni Sign In / Register 🎉",
    alumni_btn_preview: "Preview Chatroom 💬",

    // FAQ
    faq_badge: "Frequently Asked Questions",
    faq_title: "Parent Information & FAQs",
    faq_subtitle: "Find quick answers to common questions about RPPS admissions, academics, and campus life.",
    faq_guide_title: "Download Official School Guide",
    faq_guide_desc: "Get the full 2026 Rwenanura Parents Primary School prospectus including academic calendar, fee schedules, and school policies.",
    faq_guide_btn: "Download Prospectus (PDF)",

    // Testimonials
    test_badge: "Community Voices",
    test_title: "What Parents & Pupils Say",
    test_subtitle: "Hear firsthand experiences from members of our thriving Rwenanura school community.",

    // Footer
    footer_motto: "Education for Light and Leadership",
    footer_desc: "Dedicated to providing holistic primary education, academic excellence, digital literacy, and character development for every learner.",
    footer_quick_links: "Quick Links",
    footer_info_title: "Information",
    footer_office_hours: "Office Hours",
    footer_closed_weekend: "Saturday - Sunday: Closed",
    footer_newsletter_title: "Subscribe to Bulletin",
    footer_newsletter_placeholder: "Enter email",
    footer_newsletter_btn: "Join",
    footer_copyright: "All Rights Reserved. Education for Light and Leadership.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Admission",
    footer_portal: "Parent Portal"
  },

  rw: {
    // Header
    top_location: "Nyagatare, u Rwanda",
    top_track: "Gukurikirana Dosiyeti",
    top_alumni: "Urugaga rw'Abaharangije",
    top_staff: "Irembo ry'Abarimu",
    top_call: "Hamagara Ishuri",
    top_email: "Twandikire",
    nav_about: "Ibyerekeye Ishuri",
    nav_academics: "Amasomo",
    nav_campus: "Ubuzima ku Ishuri",
    nav_news: "Amakuru",
    nav_admissions: "Kwinjira",
    nav_alumni: "Abaharangije",
    nav_contact: "Twandikire",
    btn_apply_now: "Saba Umwanya",
    school_name: "Rwenanura Parents",
    school_type: "Amashuri Abanza",

    // Hero
    hero_badge: "Uburezi bufite Ireme mu Ntara y'Iburasirazuba",
    hero_title_1: "Gushishikariza Abana Kugera ku Ntego Zisumbuye",
    hero_subtitle_1: "Ishuri ribanza rya Rwenanura Parents Primary School ritanga uburere n'ubumenyi bufite ireme ku rwego rwo hejuru mu karere ka Nyagatare.",
    hero_cta_apply: "Saba Umwanya mu Ishuri",
    hero_cta_tour: "Gusura Ikigo",
    hero_title_2: "100% Batsinze Ikizamini cya Leta cya P6",
    hero_subtitle_2: "Duhagaze ku mwanya wa mbere mu bizamini bya Leta by'amashuri abanza mu karere ka Nyagatare no mu Ntara y'Iburasirazuba.",
    hero_title_3: "Ikoranabuhanga rya Mudasobwa na Laboratwari ya Siyansi",
    hero_subtitle_3: "Duhugura abanyeshuri mu gutegura porogaramu za mudasobwa (coding), ubushakashatsi bwa siyansi, n'ubumenyi bukenewe mu bihe biri imbere.",
    hero_title_4: "Siporo, Umuziki, Imbyino Nyarwanda n'Ubuyobozi",
    hero_subtitle_4: "Gukuza impano z'abana mu mikino, umuziki, imbyino z'umuco nyarwanda, no kwigirira icyizere.",
    btn_learn_more: "Ibindi Bisobanuro",

    // Stats
    stat_pass_rate: "100%",
    stat_pass_label: "Batsinze Ikizamini cya Leta",
    stat_pass_desc: "Amanota yo mu cyiciro cya mbere",
    stat_pupils: "850+",
    stat_pupils_label: "Abanyeshuri Biyandikishije",
    stat_pupils_desc: "Mu nshuke no mu mashuri abanza (P1–P6)",
    stat_teachers: "38+",
    stat_teachers_label: "Abarimu Babifitiye Ubushobozi",
    stat_teachers_desc: "Abarimu b'inzobere bafite impamyabumenyi",
    stat_ratio: "1:22",
    stat_ratio_label: "Umwarimu ku Banyeshuri",
    stat_ratio_desc: "Kwitaho by'umwihariko buri munyeshuri",

    // Academics
    acad_badge: "Integanyanyigisho n'Amasomo",
    acad_title: "Uburezi bufite Ireme muri Buri Cyiciro",
    acad_subtitle: "Dukurikiza integanyanyigisho y'u Rwanda yibanze ku bushobozi (CBC) itangwa n'Ikigo cy'Igihugu gishinzwe Uburezi (REB), yunganirwa n'ikoranabuhanga n'indangagaciro.",
    acad_nursery: "Icyiciro cy'Ibibondo n'Inshuke",
    acad_nursery_grades: "Ibyiciro bya Baby, Middle na Top (Imyaka 3 - 5)",
    acad_nursery_desc: "Aho abana bato bishimira kwiga binyuze mu mikino, gukuza ubwenge n'imbaraga z'umubiri, no kumenya Icyongereza n'Ikinyarwanda.",
    acad_lower: "Icyiciro cya Mbere cy'Abanza (P1–P3)",
    acad_lower_grades: "Kuva mu wa 1 kugeza mu wa 3 (Imyaka 6 - 8)",
    acad_lower_desc: "Gutsindagira ubumenyi bwo gusoma no kwandika neza, imibare y'umutwe, siyansi ibanza, no kumenya kurengera ibidukikije.",
    acad_upper: "Icyiciro cya Kabiri n'Abakandida (P4–P6)",
    acad_upper_grades: "Kuva mu wa 4 kugeza mu wa 6 (Imyaka 9 - 12)",
    acad_upper_desc: "Gutegura neza abanyeshuri gukora ikizamini cya Leta gisoza amashuri abanza (PLE), gutekereza byimbitse, no kwiga Igifaransa.",
    acad_stem: "Ikoranabuhanga rya STEM & Mudasobwa",
    acad_stem_grades: "Abanyeshuri Bose (P1 - P6)",
    acad_stem_desc: "Kumenya gukoresha mudasobwa, gutegura porogaramu zoroheje (coding), ubumenyi bwa roboti n'imishinga yo kubungabunga ibidukikije.",
    btn_apply_program: "Kwiyandikisha muri iki Cyiciro →",

    // About
    about_badge: "Abo Turi Bo",
    about_title: "Ubuyobozi n'Indangagaciro Z'Ingenzi",
    about_p1: "Ishuri ryashinzwe rigamije kurera abayobozi b'ejo hazaza b'u Rwanda bafite ubumenyi buhanitse n'ikinyabupfura.",
    about_p2: "Uyu munsi, RPPS ni intangarugero mu Ntara y'Iburasirazuba mu gutsindisha abanyeshuri bose mu cyiciro cya mbere.",
    headteacher_title: "Umuyobozi w'Ishuri n'Amasomo",
    headteacher_name: "Bwana Geofrey K. Kayinamura",
    headteacher_quote: "Ku Ishuri rya Rwenanura Parents, twemera ko buri mwana avukana impano yihariye. Abarimu bacu bita ku bumenyi, ikinyabupfura, no gutegura abana kuzaba abayobozi beza b'ejo hazaza.",
    about_pillars_title: "Inkingi Zacu z'Uburere",
    about_pillars_desc: "Ku Ishuri rya Rwenanura Parents, dutoza indangagaciro eshanu z'ingenzi muri buri munyeshuri kuva mu nshuke kugeza mu wa gatandatu:",

    // Core Values
    val_integrity: "Ubunyangamugayo n'Ubwubahane",
    val_integrity_desc: "Turangwa n'ukuri, kubahana, kwitwararika no kwihesha agaciro.",
    val_excellence: "Ubuhanga n'Indashyikirwa",
    val_excellence_desc: "Duharanira gutsinda ku rwego rwo hejuru no gushaka kumenya byinshi.",
    val_inclusivity: "Ubuvandimwe no Kwitanaho",
    val_inclusivity_desc: "Ahantu huje urugwiro aho buri mwana ahabwa agaciro, umutekano, no gufashwa gutera imbere.",
    val_innovation: "Ikoranabuhanga no Guhanga Udushya",
    val_innovation_desc: "Gukemura ibibazo no gukoresha mudasobwa kuva mu mashuri abanza.",
    val_community: "Ubufatanye n'Ubuyobozi",
    val_community_desc: "Gutoza abanyeshuri kuba abayobozi beza bafitiye umumaro umuryango mugari.",

    // Facilities
    fac_badge: "Ibikorwaremezo Bigezweho",
    fac_title: "Hateguwe mu Buryo Butekanye kandi Bunoze",
    fac_subtitle: "Ku kigo cyacu kigari kandi gikeye muri Nyagatare, abanyeshuri bafite ibikoresho byose bikenewe mu myigire no mu mikurire myiza.",

    // News & Events
    news_badge: "Amakuru Mashya",
    news_title: "Ibiri Kubera ku Ishuri",
    news_subtitle: "Menya amakuru ajyanye n'ibimaze kugerwaho, amatariki y'ibizamini, amarushanwa ya siporo, n'amatangazo agenewe ababyeyi.",
    news_read_more: "Soma Byose →",

    // Tuition Estimator
    calc_badge: "Kugaragaza Ibiciro neza",
    calc_title: "Kubara Amafaranga y'Ishuri ku Gihembwe",
    calc_subtitle: "Bara amafaranga y'ishuri, ayo kurara mu kigo, imyenda y'ishuri, no gutwara abanyeshuri mu buryo bworoshye kandi bweruye.",
    calc_select_options: "Hitamo Amasomo na Serivisi",
    calc_label_grade: "Hitamo Umwaka w'Amashuri *",
    calc_opt_nursery: "Inshuke (Baby, Middle, Top Class) - 75,000 RWF",
    calc_opt_lower: "Icyiciro cya Mbere cy'Abanza (P1, P2, P3) - 95,000 RWF",
    calc_opt_upper: "Icyiciro cya Kabiri cy'Abanza (P4, P5, P6) - 110,000 RWF",
    calc_label_services: "Ibindi Bikorwa Bihitamo",
    calc_lunch_label: "Ifunguro rya Saa Sita n'Icyayi (+18,000 RWF/igihembwe)",
    calc_transport_label: "Imodoka Itwara Abanyeshuri (Nyagatare) (+25,000 RWF/igihembwe)",
    calc_uniform_label: "Imyenda y'Ishuri Yose (Amashati 2, Umupira, Siporo) (+20,000 RWF)",
    calc_note: "💡 Icyitonderwa: Amafaranga y'ishuri arimo gukoresha mudasobwa, isomero n'ibibuga bya siporo.",
    calc_summary_title: "Incamake y'Amafaranga",
    calc_tuition_row: "Amafaranga y'Ishuri:",
    calc_meal_row: "Ifunguro:",
    calc_transport_row: "Kwigira ku Ishuri:",
    calc_uniform_row: "Imyenda y'Ishuri:",
    calc_total_investment: "Ayose Hamwe ku Gihembwe cya 1",
    calc_btn_apply: "Ohereza Dosiyeti yo Gusaba Umwanya 🚀",

    // Admissions
    adm_badge: "Injira mu Muryango wa RPPS",
    adm_title: "Uko Kwiyandikisha Bikorwa",
    adm_subtitle: "Twakira abanyeshuri bashya mu mashuri y'inshuke n'abanza umwaka wose. Dore intambwe eshatu zoroshye.",
    adm_step1_title: "Kuzuza Ifishi kuri Murandasi cyangwa ku Kigo",
    adm_step1_desc: "Uzuza ifishi yacu yo gusaba umwanya kuri murandasi cyangwa usure ibiro by'ubuyobozi ku kigo i Rwenanura.",
    adm_step2_title: "Gushyikiriza Ibyangombwa n'Ikizamini",
    adm_step2_desc: "Zana icyemezo cy'amavuko na raporo y'aho yigaga. Umwana akora isuzuma ryoroshye ryo kureba aho ageze mu myigire.",
    adm_step3_title: "Ibaruwa yo Kwemererwa Umwanya",
    adm_step3_desc: "Nyuma yo gusuzuma, umubyeyi ahabwa ibaruwa imwemerera umwanya, amabwiriza y'amafaranga, n'amatariki yo gutangira.",
    adm_banner_badge: "Kwandika Abanyeshuri Bashya b'Umwaka wa 2026/2027 Birakomeje",
    adm_banner_title: "Witeguye Gutegura Ejo Hazaza h'Umwana Wawe?",
    adm_banner_desc: "Uzuza ifishi yacu yo gusaba umwanya kuri murandasi cyangwa usure ikigo cyacu i Nyagatare uyu munsi.",
    btn_start_app: "Tangira Gusaba Umwanya",
    btn_book_tour: "Gusura Ikigo",
    btn_track_app: "Kurikirana Aho Dosiyeti Igeze",

    // Alumni
    alumni_badge: "Urugaga rw'Abaharangije",
    alumni_title: "Abahungu n'Abakobwa Baharangije (OBs & OGs)",
    alumni_subtitle: "Kuva i Rwenanura kugeza muri kaminuza no mu buyobozi mu Rwanda hose. Ongera uhure n'abo mwiganye, ufashirize abakandida bato, kandi uteze imbere ishuri ryawe.",
    alumni_stat_graduated: "Abaharangije Bose",
    alumni_stat_cohorts: "Ibyiciro Byarangije",
    alumni_stat_mentors: "Abatoza n'Abajyanama",
    alumni_stat_spirit: "Umwuka n'Ishema rya RPPS",
    alumni_card1_title: "Ikiganiro Mpuzabanyeshuri (Live Chat)",
    alumni_card1_desc: "Gana n'abo mwiganye: amakuru y'umunsi muri #General, gutegura iminsi mikuru muri #Reunions, inama z'ubumenyamwuga muri #Mentorship, n'urwibutso muri #Memories.",
    alumni_card2_title: "Urubuga rwa WhatsApp rw'Ishuri",
    alumni_card2_desc: "Komeza guhana amakuru kuri terefoni yawe, ubone amatangazo y'ishuri n'ibirori biteganyijwe.",
    alumni_card3_title: "Ibirori Bikomeye by'Abaharangije 2026",
    alumni_card3_desc: "Umunsi mukuru w'abaharangije ku kigo i Nyagatare: umupira w'amaguru w'abahungu, gusura ikoranabuhanga rishya, no gusabana.",
    btn_open_chat: "Fungura Ikiganiro cy'Abaharangije",
    btn_join_whatsapp: "Injira mu Rubuga rwa WhatsApp",
    btn_discuss_reunions: "Tegura Ibirori mu Itsinda rya #Reunions",
    alumni_spotlight_title: "Abaharangije b'Indashyikirwa",
    alumni_spotlight_sub: "Menya aho abaharangije muri RPPS bari gutera imbere no guteza imbere igihugu.",
    alumni_btn_directory: "Reba Urutonde rw'Abaharangije Bose (500+) →",
    alumni_banner_auth_badge: "Umunyamuryango Wemewe",
    alumni_banner_auth_title: "Murakaza neza",
    alumni_banner_auth_p: "Gana n'abo mwiganye ako kanya, tegura ibirori bya 2026, cyangwa urebe aderesi z'abaharangije bose.",
    alumni_banner_guest_badge: "Injira mu Murage",
    alumni_banner_guest_title: "Waba warize mu Ishuri rya Rwenanura Parents?",
    alumni_banner_guest_p: "Injira cyangwa wiyandikishe kugira ngo ubone aderesi z'abo mwiganye, uganire nabo, kandi wandike mu kiganiro cy'abaharangije.",
    alumni_btn_lounge: "Fungura Icyumba cy'Abaharangije 💬",
    alumni_btn_signin: "Injira / Iyandikishe nk'Uwaharangije 🎉",
    alumni_btn_preview: "Reba Ikiganiro 💬",

    // FAQ
    faq_badge: "Ibibazo Bikunze Kubazwa",
    faq_title: "Amakuru y'Ababyeyi n'Ibibazo Bikunze Kubazwa",
    faq_subtitle: "Bona ibisubizo byihuse ku bibazo bikunze kubazwa ku bijyanye no kwiyandikisha, amasomo, n'ubuzima ku kigo.",
    faq_guide_title: "Kumanura Igitabo cy'Amabwiriza y'Ishuri",
    faq_guide_desc: "Bona igitabo cyose cya 2026 cy'ishuri rya Rwenanura Parents kirimo ingengabihe y'amasomo, amafaranga y'ishuri, n'amabwiriza agenga ikigo.",
    faq_guide_btn: "Kumanura Igitabo (PDF)",

    // Testimonials
    test_badge: "Ubuhamya bw'Umuryango w'Ishuri",
    test_title: "Icyo Ababyeyi n'Abanyeshuri Batuvugaho",
    test_subtitle: "Ubuhamya bw'ababyeyi n'abanyeshuri bishimira ireme ry'uburezi bahabwa ku kigo cya Rwenanura.",

    // Footer
    footer_motto: "Uburezi bugana ku Rumuri n'Ubuyobozi",
    footer_desc: "Duharanira gutanga uburezi bw'ibanze buhamye, ubuhanga mu masomo, ikoranabuhanga n'uburere bwiza kuri buri mwana.",
    footer_quick_links: "Ahandi Wajya",
    footer_info_title: "Amakuru y'Ingenzi",
    footer_office_hours: "Amasaha y'Akazi",
    footer_closed_weekend: "Kuwa Gatandatu - Kucyumweru: Birafunze",
    footer_newsletter_title: "Iyandikishe mu Kinyamakuru cy'Ishuri",
    footer_newsletter_placeholder: "Andika imeyili yawe",
    footer_newsletter_btn: "Iyandikishe",
    footer_copyright: "Uburenganzira Bwose Burabitswe. Uburezi bugana ku Rumuri n'Ubuyobozi.",
    footer_privacy: "Amategeko y'Ibwanga",
    footer_terms: "Amabwiriza yo Kwinjira",
    footer_portal: "Irembo ry'Umubyeyi"
  },

  fr: {
    // Header
    top_location: "Nyagatare, Rwanda",
    top_track: "Suivre la Candidature",
    top_alumni: "Réseau des Anciens",
    top_staff: "Portail du Personnel",
    top_call: "Appeler les Admissions",
    top_email: "Envoyer un Courriel",
    nav_about: "À Propos",
    nav_academics: "Académique",
    nav_campus: "Vie Scolaire",
    nav_news: "Actualités",
    nav_admissions: "Admissions",
    nav_alumni: "Anciens Élèves",
    nav_contact: "Contact",
    btn_apply_now: "Postuler",
    school_name: "Rwenanura Parents",
    school_type: "École Primaire",

    // Hero
    hero_badge: "Excellence Académique dans la Province de l'Est",
    hero_title_1: "Inspirer les Jeunes Esprits vers les Plus Hauts Sommets",
    hero_subtitle_1: "L'École Primaire Rwenanura Parents offre une base holistique de classe mondiale dans un environnement bienveillant et centré sur l'élève à Nyagatare.",
    hero_cta_apply: "Découvrir les Admissions",
    hero_cta_tour: "Visiter le Campus",
    hero_title_2: "100% de Réussite avec Distinction au PLE",
    hero_subtitle_2: "Classée parmi les meilleures écoles primaires du district de Nyagatare et de la province de l'Est du Rwanda.",
    hero_title_3: "Alphabétisation Numérique et Laboratoires Modernes",
    hero_subtitle_3: "Former les élèves au codage, à la robotique, à la découverte scientifique et aux compétences TIC indispensables pour l'avenir.",
    hero_title_4: "Sports, Musique et Développement du Leadership",
    hero_subtitle_4: "Développer la confiance en soi, l'esprit d'équipe et les talents au-delà de la salle de classe grâce à des activités parascolaires.",
    btn_learn_more: "En Savoir Plus",

    // Stats
    stat_pass_rate: "100%",
    stat_pass_label: "Taux de Réussite PLE",
    stat_pass_desc: "Mentions de première division aux examens nationaux",
    stat_pupils: "850+",
    stat_pupils_label: "Élèves Inscrits",
    stat_pupils_desc: "De la maternelle à la 6ème année primaire",
    stat_teachers: "38+",
    stat_teachers_label: "Enseignants Qualifiés",
    stat_teachers_desc: "Éducateurs certifiés et dévoués",
    stat_ratio: "1:22",
    stat_ratio_label: "Ratio Enseignant-Élève",
    stat_ratio_desc: "Attention personnalisée pour chaque élève",

    // Academics
    acad_badge: "Programmes et Cursus",
    acad_title: "L'Excellence Académique à Chaque Étape",
    acad_subtitle: "Conforme au programme axé sur les compétences (CBC) du Rwanda Basic Education Board (REB), enrichi par les technologies de pointe et les langues.",
    acad_nursery: "Maternelle et Petite Enfance",
    acad_nursery_grades: "Petite, Moyenne et Grande Sections (3 à 5 ans)",
    acad_nursery_desc: "Un environnement chaleureux et stimulant axé sur l'apprentissage par le jeu, la motricité, l'immersion en anglais et kinyarwanda.",
    acad_lower: "Primaire Inférieur (P1–P3)",
    acad_lower_grades: "De la 1ère à la 3ème Année (6 à 8 ans)",
    acad_lower_desc: "Bâtir des fondations solides en lecture, calcul mental, découverte des sciences et respect de l'environnement.",
    acad_upper: "Primaire Supérieur (P4–P6)",
    acad_upper_grades: "De la 4ème à la 6ème Année (9 à 12 ans)",
    acad_upper_desc: "Préparation rigoureuse aux examens nationaux du PLE, pensée critique, recherche et initiation pratique à la langue française.",
    acad_stem: "STEM et Innovation Numérique",
    acad_stem_grades: "Tous les Niveaux (P1 - P6)",
    acad_stem_desc: "Ateliers interactifs de programmation Scratch, initiation à la robotique, écologie scolaire et maîtrise des outils informatiques.",
    btn_apply_program: "S'inscrire à ce Programme →",

    // About
    about_badge: "Qui Sommes-Nous",
    about_title: "Leadership et Valeurs Fondamentales",
    about_p1: "Fondée avec la vision de former des leaders éclairés, éthiques et ambitieux pour le Rwanda et la communauté internationale.",
    about_p2: "Aujourd'hui, RPPS est une institution de référence au Rwanda oriental, maintenant un taux de réussite parfait de 100%.",
    headteacher_title: "Directeur et Responsable Pédagogique",
    headteacher_name: "M. Geofrey K. Kayinamura",
    headteacher_quote: "À l'École Primaire Rwenanura Parents, nous croyons que chaque enfant naît avec un potentiel unique. Notre équipe pédagogique dévouée cultive l'excellence scolaire, le caractère et l'épanouissement global.",
    about_pillars_title: "Nos Piliers Fondamentaux",
    about_pillars_desc: "À l'École Primaire Rwenanura Parents, nous cultivons cinq principes fondamentaux chez chaque élève, de la maternelle à la 6ème:",

    // Core Values
    val_integrity: "Intégrité et Respect Mutuel",
    val_integrity_desc: "Nous cultivons l'honnêteté, le respect mutuel, l'autodiscipline et des principes éthiques inébranlables.",
    val_excellence: "Excellence Académique",
    val_excellence_desc: "Nous maintenons des standards élevés, stimulant la soif d'apprendre et la maîtrise intellectuelle.",
    val_inclusivity: "Inclusivité et Bienveillance",
    val_inclusivity_desc: "Un environnement bienveillant et solidaire où chaque enfant se sent valorisé, en sécurité et encouragé à s'épanouir.",
    val_innovation: "Innovation et Technologies",
    val_innovation_desc: "Résolution créative de problèmes, codage informatique et éveil scientifique dès le plus jeune âge.",
    val_community: "Communauté et Leadership",
    val_community_desc: "Inspirer les élèves à devenir des citoyens responsables, solidaires et des leaders de demain.",

    // Facilities
    fac_badge: "Infrastructures Modernes",
    fac_title: "Conçu pour un Apprentissage Sûr, Épanouissant et Moderne",
    fac_subtitle: "Sur un campus sécurisé et spacieux à Nyagatare, nous mettons à disposition des équipements modernes stimulant la réussite scolaire et humaine.",

    // News & Events
    news_badge: "Restez Informé",
    news_title: "Actualités de l'École",
    news_subtitle: "Suivez les réussites récentes, les événements académiques à venir, les tournois sportifs et les communiqués aux parents.",
    news_read_more: "Lire la Suite →",

    // Tuition Estimator
    calc_badge: "Transparence Tarifaire",
    calc_title: "Calculateur Interactif des Frais de Scolarité",
    calc_subtitle: "Estimez les frais trimestriels, l'hébergement en internat, les tenues uniformes et le transport en toute clarté.",
    calc_select_options: "Sélectionnez les Options",
    calc_label_grade: "Niveau Scolaire *",
    calc_opt_nursery: "Maternelle (Petite, Moyenne, Grande Section) - 75 000 RWF",
    calc_opt_lower: "Primaire Inférieur (P1, P2, P3) - 95 000 RWF",
    calc_opt_upper: "Primaire Supérieur (P4, P5, P6) - 110 000 RWF",
    calc_label_services: "Prestations Optionnelles",
    calc_lunch_label: "Repas Chaud de Midi Équilibré et Goûter (+18 000 RWF/trimestre)",
    calc_transport_label: "Transport par Bus Scolaire (Ligne Nyagatare) (+25 000 RWF/trimestre)",
    calc_uniform_label: "Ensemble Uniforme Complet (2 Chemises, Pull, Kit Sport) (+20 000 RWF)",
    calc_note: "💡 Remarque: Les frais de scolarité comprennent l'accès complet aux laboratoires informatiques, à la bibliothèque et aux installations sportives.",
    calc_summary_title: "Récapitulatif Estimé",
    calc_tuition_row: "Frais Scolaires:",
    calc_meal_row: "Restauration:",
    calc_transport_row: "Transport Bus:",
    calc_uniform_row: "Uniforme:",
    calc_total_investment: "Investissement Total Trimestre 1",
    calc_btn_apply: "Envoyer ma Candidature Maintenant 🚀",

    // Admissions
    adm_badge: "Rejoindre la Famille RPPS",
    adm_title: "Procédure d'Admission et Inscriptions",
    adm_subtitle: "Les inscriptions sont ouvertes tout au long de l'année pour la maternelle et l'école primaire. Suivez notre démarche en 3 étapes simples.",
    adm_step1_title: "Formulaire en Ligne ou au Secrétariat",
    adm_step1_desc: "Remplissez notre formulaire rapide de pré-inscription en ligne ou visitez le secrétariat sur le campus de Rwenanura.",
    adm_step2_title: "Dépôt des Pièces et Entretien Éducatif",
    adm_step2_desc: "Déposez l'acte de naissance et le dernier bulletin scolaire. L'élève participe à une brève évaluation amicale de niveau.",
    adm_step3_title: "Lettre d'Admission et Livret d'Accueil",
    adm_step3_desc: "Dès validation, les parents reçoivent la lettre officielle d'admission, le code de suivi et les informations pratiques de rentrée.",
    adm_banner_badge: "Inscriptions Ouvertes pour l'Année Scolaire 2026/2027",
    adm_banner_title: "Prêt à Débuter le Parcours de Votre Enfant ?",
    adm_banner_desc: "Remplissez notre formulaire rapide de pré-inscription en ligne ou visitez le secrétariat sur le campus de Rwenanura dès aujourd'hui.",
    btn_start_app: "Commencer la Candidature",
    btn_book_tour: "Visiter le Campus",
    btn_track_app: "Suivre ma Candidature",

    // Alumni
    alumni_badge: "Réseau des Anciens Élèves",
    alumni_title: "Anciens et Anciennes Élèves (OBs & OGs)",
    alumni_subtitle: "De Rwenanura aux universités et aux postes de direction au Rwanda et dans le monde. Retrouvez vos camarades, guidez les nouveaux candidats et contribuez à l'école.",
    alumni_stat_graduated: "Anciens Diplômés",
    alumni_stat_cohorts: "Promotions Diplômées",
    alumni_stat_mentors: "Mentors Actifs",
    alumni_stat_spirit: "Fierté et Esprit RPPS",
    alumni_card1_title: "Salon de Discussion en Direct",
    alumni_card1_desc: "Échangez directement : nouvelles du quotidien dans #General, préparation des retrouvailles dans #Reunions, mentorat dans #Mentorship et souvenirs d'enfance dans #Memories.",
    alumni_card2_title: "Communauté WhatsApp Officielle",
    alumni_card2_desc: "Restez connecté sur votre mobile et recevez instantanément les actualités de l'école et les invitations aux événements.",
    alumni_card3_title: "Grand Gala des Anciens 2026",
    alumni_card3_desc: "Les retrouvailles officielles sur le campus de Nyagatare : match de football amical, visite des nouveaux laboratoires et banquet.",
    btn_open_chat: "Ouvrir le Salon des Anciens",
    btn_join_whatsapp: "Rejoindre le Groupe WhatsApp",
    btn_discuss_reunions: "Préparer les Retrouvailles (#Reunions)",
    alumni_spotlight_title: "Anciens Élèves à l'Honneur",
    alumni_spotlight_sub: "Découvrez l'impact remarquable de nos anciens élèves aujourd'hui.",
    alumni_btn_directory: "Consulter l'Annuaire Complet (500+) →",
    alumni_banner_auth_badge: "Membre Vérifié",
    alumni_banner_auth_title: "Bienvenue à nouveau",
    alumni_banner_auth_p: "Échangez en temps réel, préparez le gala de 2026 ou consultez le répertoire des anciens.",
    alumni_banner_guest_badge: "Rejoignez la Grande Famille",
    alumni_banner_guest_title: "Êtes-vous un Ancien ou une Ancienne Élève de RPPS ?",
    alumni_banner_guest_p: "Connectez-vous ou enregistrez votre profil pour accéder à l'annuaire complet, retrouver vos camarades et participer au salon de discussion en direct.",
    alumni_btn_lounge: "Accéder au Salon des Anciens 💬",
    alumni_btn_signin: "Connexion / Inscription Ancien Élève 🎉",
    alumni_btn_preview: "Aperçu du Salon 💬",

    // FAQ
    faq_badge: "Foire Aux Questions",
    faq_title: "Guide Pratique et Questions Fréquentes",
    faq_subtitle: "Trouvez des réponses rapides aux questions courantes sur les admissions, la pédagogie et la vie sur le campus.",
    faq_guide_title: "Télécharger le Guide Officiel de l'École",
    faq_guide_desc: "Obtenez le livret officiel 2026 avec le calendrier scolaire, la grille tarifaire détaillée et le règlement intérieur.",
    faq_guide_btn: "Télécharger le Livret (PDF)",

    // Testimonials
    test_badge: "Témoignages de la Communauté",
    test_title: "Ce Que Disent Parents et Élèves",
    test_subtitle: "Découvrez les retours d'expérience authentiques des familles et élèves de notre communauté scolaire.",

    // Footer
    footer_motto: "L'Éducation pour la Lumière et le Leadership",
    footer_desc: "Dévoué à fournir un enseignement primaire holistique, l'excellence académique, les compétences numériques et l'éthique pour chaque élève.",
    footer_quick_links: "Accès Rapide",
    footer_info_title: "Informations",
    footer_office_hours: "Heures d'Ouverture",
    footer_closed_weekend: "Samedi - Dimanche: Fermé",
    footer_newsletter_title: "Lettre d'Information",
    footer_newsletter_placeholder: "Votre adresse email",
    footer_newsletter_btn: "S'abonner",
    footer_copyright: "Tous droits réservés. L'Éducation pour la Lumière et le Leadership.",
    footer_privacy: "Politique de Confidentialité",
    footer_terms: "Conditions d'Admission",
    footer_portal: "Portail Parents"
  }
};

/**
 * Get translated string by key with optional fallback
 */
export function t(key, fallback = '') {
  const lang = getLanguage();
  const langDict = translations[lang] || translations.en;
  if (langDict && langDict[key] !== undefined) {
    return langDict[key];
  }
  if (translations.en && translations.en[key] !== undefined) {
    return translations.en[key];
  }
  return fallback || key;
}
