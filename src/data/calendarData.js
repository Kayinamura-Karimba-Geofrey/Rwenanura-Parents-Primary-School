/**
 * Academic Calendar & Term Dates Data for Rwenanura Parents Primary School
 * Follows the Rwanda Basic Education Board (REB) 3-Term School Calendar (2026/2027)
 */

export const academicTerms = [
  {
    id: "term-1",
    termNumber: 1,
    name: {
      en: "Term 1 (First Term)",
      rw: "Igihembwe cya Mbere (Term 1)",
      fr: "Premier Trimestre (Term 1)"
    },
    period: "September 07 – December 18, 2026",
    duration: "15 Weeks",
    status: "active", // active, upcoming, completed
    highlights: {
      en: "School Opening, Diagnostic Tests, General Parents Assembly, Midterm Break, End of Term 1 Exams",
      rw: "Itangira ry'Amashuri, Isuzuma ry'Ibanze, Inteko Rusange y'Ababyeyi, Ikiruhuko cy'Igihembwe Hagati, Ibizamini",
      fr: "Rentrée des Classes, Évaluations Diagnostiques, Assemblée Générale des Parents, Congé de Mi-trimestre, Examens"
    }
  },
  {
    id: "term-2",
    termNumber: 2,
    name: {
      en: "Term 2 (Second Term)",
      rw: "Igihembwe cya Kabiri (Term 2)",
      fr: "Deuxième Trimestre (Term 2)"
    },
    period: "January 11 – April 09, 2027",
    duration: "13 Weeks",
    status: "upcoming",
    highlights: {
      en: "Heroes Day, District Mock PLE Exams, STEM & Science Fair, Kwibuka 33 Observance, Easter Holiday",
      rw: "Umunsi w'Intwari, Isuzuma rya Leta ry'Icyitegererezo (Mock), Imurikagurisha rya STEM, Kwibuka 33, Pasika",
      fr: "Journée des Héros, Examens Blancs du District, Salon STEM et Sciences, Commémoration Kwibuka 33, Pâques"
    }
  },
  {
    id: "term-3",
    termNumber: 3,
    name: {
      en: "Term 3 (Promotional Term)",
      rw: "Igihembwe cya Gatatu (Term 3)",
      fr: "Troisième Trimestre (Term 3)"
    },
    period: "April 26 – July 23, 2027",
    duration: "13 Weeks",
    status: "upcoming",
    highlights: {
      en: "Sports Derby Cup, National PLE Exams (P6), End of Year Promotion Exams, Grand Graduation Gala",
      rw: "Igikombe cya Siporo, Ikizamini cya Leta (PLE), Ibizamini byo Kwimuka, Umunsi Mukuru wo Gusoza Amashuri",
      fr: "Coupe de Sport Scolaire, Examens Nationaux du PLE, Examens de Passage, Cérémonie de Remise des Diplômes"
    }
  }
];

export const calendarEvents = [
  // --- TERM 1 ---
  {
    id: "ev-t1-open",
    term: "term-1",
    category: "academic",
    title: {
      en: "Term 1 School Opening & Orientation",
      rw: "Itangira ry'Igihembwe cya Mbere n'Iyakirwa ry'Abashya",
      fr: "Rentrée Scolaire du 1er Trimestre et Accueil"
    },
    dateDisplay: "Sep 07, 2026",
    startDate: "2026-09-07T07:30:00",
    endDate: "2026-09-07T16:00:00",
    audience: "All Pupils & Staff",
    location: "Main Campus Grounds",
    description: {
      en: "Official reopening of school gates for Nursery and Primary 1-6 pupils. Welcome assembly and distribution of learning materials.",
      rw: "Gufungura amarembo ku banyeshuri bo mu nshuke no mu mashuri abanza (P1–P6). Inteko yo kubaha ikaze no gutanga ibikoresho.",
      fr: "Ouverture officielle des portes pour les élèves de la maternelle et du primaire. Rassemblement d'accueil et remise des manuels."
    }
  },
  {
    id: "ev-t1-athletics",
    term: "term-1",
    category: "community",
    title: {
      en: "Inter-House Athletics & Cultural Dance Heats",
      rw: "Amarushanwa y'Imikino n'Umuco mu Matsinda y'Ishuri",
      fr: "Compétitions Sportives et Éliminatoires de Danses"
    },
    dateDisplay: "Sep 28, 2026",
    startDate: "2026-09-28T09:00:00",
    endDate: "2026-09-28T14:30:00",
    audience: "All Learners & House Teams",
    location: "Sports Stadium",
    description: {
      en: "Track relay races, traditional Rwandan dance tryouts, and team selections for upcoming district inter-school tournaments.",
      rw: "Gusiganwa ku maguru, gutoranya abazaserukira amatsinda mu mbyino gakondo no mu mikino y'akarere.",
      fr: "Courses de relais, répétitions générales de danses traditionnelles et sélection des équipes de maison."
    }
  },
  {
    id: "ev-t1-midbreak",
    term: "term-1",
    category: "holiday",
    title: {
      en: "Term 1 Midterm Break Holiday",
      rw: "Ikiruhuko cy'Igihembwe Hagati (Mid-Term)",
      fr: "Congé Scolaire de Mi-Trimestre"
    },
    dateDisplay: "Oct 26 – Oct 30, 2026",
    startDate: "2026-10-26T00:00:00",
    endDate: "2026-10-30T23:59:59",
    audience: "All Pupils",
    location: "Home Vacation",
    description: {
      en: "Five-day rest and relaxation break for pupils. School administration remains open for admissions and consultations.",
      rw: "Ikiruhuko cy'iminsi 5 ku banyeshuri. Ibiro by'ubuyobozi by'ikigo bikomeza gufungura kwakira ababyeyi.",
      fr: "Pause de 5 jours pour les élèves. Les bureaux administratifs restent ouverts pour les admissions et renseignements."
    }
  },
  {
    id: "ev-t1-pta",
    term: "term-1",
    category: "community",
    title: {
      en: "Annual Parents-Teachers General Assembly",
      rw: "Inteko Rusange y'Ababyeyi n'Abarimu (PTA)",
      fr: "Assemblée Générale des Parents d'Élèves et Enseignants"
    },
    dateDisplay: "Nov 14, 2026",
    startDate: "2026-11-14T09:00:00",
    endDate: "2026-11-14T13:00:00",
    audience: "All Parents & Guardians",
    location: "Multi-Purpose Hall",
    description: {
      en: "General gathering of RPPS parents to review academic progress, pupil welfare initiatives, and upcoming infrastructure projects.",
      rw: "Inama rusange y'ababyeyi yo gusuzuma imyigire y'abana, imibereho myiza yabo, n'imishinga yo kwagura ikigo.",
      fr: "Réunion générale pour évaluer la progression académique, le bien-être des enfants et les projets d'équipements."
    }
  },
  {
    id: "ev-t1-exams",
    term: "term-1",
    category: "academic",
    title: {
      en: "End of Term 1 Comprehensive Examinations",
      rw: "Ibizamini Bisoza Igihembwe cya Mbere",
      fr: "Examens Périodiques de Fin de 1er Trimestre"
    },
    dateDisplay: "Dec 07 – Dec 15, 2026",
    startDate: "2026-12-07T08:00:00",
    endDate: "2026-12-15T15:00:00",
    audience: "P1 to P6 Learners",
    location: "Classroom Examination Halls",
    description: {
      en: "Summative assessment covering REB curriculum content taught during Term 1 across all core subjects.",
      rw: "Ibizamini by'isuzumabumenyi by'amasomo yose yize muri iki gihembwe cya mbere.",
      fr: "Évaluations formatives et sommatives portant sur l'ensemble du programme REB enseigné au 1er trimestre."
    }
  },
  {
    id: "ev-t1-reports",
    term: "term-1",
    category: "community",
    title: {
      en: "Term 1 Report Cards & Christmas Vacation",
      rw: "Umunsi wo Gutanga Raporo n'Ikiruhuko cya Noheli",
      fr: "Remise des Bulletins et Vacances de Noël"
    },
    dateDisplay: "Dec 18, 2026",
    startDate: "2026-12-18T08:30:00",
    endDate: "2026-12-18T13:00:00",
    audience: "Parents & Pupils",
    location: "Respective Classrooms",
    description: {
      en: "Distribution of report cards and individual parent-teacher consultations. Christmas and New Year holidays commence.",
      rw: "Gushyikiriza ababyeyi raporo z'amanota no kuganira n'abarezi. Hatangiye ikiruhuko cya Noheli n'Ubunani.",
      fr: "Remise officielle des bulletins trimestriels et entretiens individuels parents-enseignants. Début des vacances de fin d'année."
    }
  },

  // --- TERM 2 ---
  {
    id: "ev-t2-open",
    term: "term-2",
    category: "academic",
    title: {
      en: "Term 2 Resumption & Academic Kickoff",
      rw: "Itangira ry'Igihembwe cya Kabiri",
      fr: "Rentrée du 2ème Trimestre"
    },
    dateDisplay: "Jan 11, 2027",
    startDate: "2027-01-11T07:30:00",
    endDate: "2027-01-11T16:00:00",
    audience: "All Pupils",
    location: "Main Campus",
    description: {
      en: "Classes resume promptly at 7:30 AM across all nursery and primary streams.",
      rw: "Amasomo asubukurwa neza saa moya n'igice za mu gitondo mu byiciro byose.",
      fr: "Reprise effective des cours à 7h30 pour toutes les sections de la maternelle et du primaire."
    }
  },
  {
    id: "ev-t2-heroes",
    term: "term-2",
    category: "holiday",
    title: {
      en: "National Heroes Day (Umunsi w'Intwari)",
      rw: "Umunsi Mukuru w'Intwari z'Igihugu",
      fr: "Journée Nationale des Héros de la Patrie"
    },
    dateDisplay: "Feb 01, 2027",
    startDate: "2027-02-01T00:00:00",
    endDate: "2027-02-01T23:59:59",
    audience: "Public Holiday",
    location: "National Holiday",
    description: {
      en: "National public holiday in Rwanda honoring patriotism, bravery, and unity. Special moral lessons on heroism follow.",
      rw: "Umunsi w'ikiruhuko mu gihugu hose uziririkana ubutwari, ubunyangamugayo n'urukundo rw'igihugu.",
      fr: "Jour férié national au Rwanda célébrant la bravoure, le dévouement et l'unité de la patrie."
    }
  },
  {
    id: "ev-t2-mock",
    term: "term-2",
    category: "academic",
    title: {
      en: "P6 District Mock PLE Pre-Examinations",
      rw: "Isuzuma ry'Icyitegererezo rya PLE ku Karere",
      fr: "Examens Blancs du PLE au Niveau du District (P6)"
    },
    dateDisplay: "Feb 15 – Feb 19, 2027",
    startDate: "2027-02-15T08:00:00",
    endDate: "2027-02-19T14:30:00",
    audience: "P6 Candidate Classes",
    location: "Examination Hall",
    description: {
      en: "Standardized district simulation test to measure candidate readiness for national exams in English, Math, Science, and Social Studies.",
      rw: "Isuzuma ry'icyitegererezo ritegurwa n'Akarere ka Nyagatare ryo kureba aho abakandida bageze bitegura ikizamini cya Leta.",
      fr: "Simulation officielle organisée par le district pour mesurer le niveau de préparation aux épreuves nationales."
    }
  },
  {
    id: "ev-t2-stem-fair",
    term: "term-2",
    category: "community",
    title: {
      en: "Annual STEM & Science Discovery Fair 2027",
      rw: "Imurikagurisha ry'Imishinga ya Mudasobwa na Siyansi",
      fr: "Foire Annuelle des Sciences et de l'Innovation STEM"
    },
    dateDisplay: "Mar 20, 2027",
    startDate: "2027-03-20T09:00:00",
    endDate: "2027-03-20T15:00:00",
    audience: "Pupils, Parents & Public",
    location: "Campus Exhibition Pavilion",
    description: {
      en: "Young inventors demonstrate coding software, robotics modules, plant biology discoveries, and green energy models.",
      rw: "Abahanga bato berekana imishinga bakoze muri mudasobwa, ubumenyi bwa roboti, n'imishinga yo kurengera ibidukikije.",
      fr: "Démonstrations interactives de codage informatique, montages de robotique et expériences écologiques par les élèves."
    }
  },
  {
    id: "ev-t2-kwibuka",
    term: "term-2",
    category: "holiday",
    title: {
      en: "Kwibuka 33 Commemoration Observance",
      rw: "Icyunamo cyo Kwibuka ku Nshuro ya 33",
      fr: "Commémoration Kwibuka 33"
    },
    dateDisplay: "Apr 07 – Apr 13, 2027",
    startDate: "2027-04-07T00:00:00",
    endDate: "2027-04-13T23:59:59",
    audience: "School & National Community",
    location: "National Commemoration",
    description: {
      en: "National week of remembrance honoring the victims of the 1994 Genocide against the Tutsi in Rwanda. Remember, Unite, Renew.",
      rw: "Icyunamo n'iminsi yo kwibuka ku nshuro ya 33 Jenoside yakorewe Abatutsi mu 1994. Kwibuka, Kwiyubaka, no Kubana mu Mahoro.",
      fr: "Semaine nationale de commémoration du Génocide perpétré contre les Tutsi en 1994 au Rwanda. Mémoire, Unité et Renaissance."
    }
  },

  // --- TERM 3 ---
  {
    id: "ev-t3-open",
    term: "term-3",
    category: "academic",
    title: {
      en: "Term 3 Opening (Promotional Term)",
      rw: "Itangira ry'Igihembwe cya Gatatu cyo Kwimuka",
      fr: "Rentrée du 3ème Trimestre (Trimestre de Promotion)"
    },
    dateDisplay: "Apr 26, 2027",
    startDate: "2027-04-26T07:30:00",
    endDate: "2027-04-26T16:00:00",
    audience: "All Pupils",
    location: "Campus",
    description: {
      en: "Final term of the academic year focused on curriculum completion, comprehensive revisions, and promotion evaluations.",
      rw: "Igihembwe gisoza umwaka w'amashuri kigamije kuzuza integanyanyigisho, gusubiramo amasomo, no gutegura kwimuka.",
      fr: "Dernier trimestre de l'année scolaire consacré à l'achèvement des programmes et aux examens de passage."
    }
  },
  {
    id: "ev-t3-derby",
    term: "term-3",
    category: "community",
    title: {
      en: "Annual Inter-House Sports Derby Championship",
      rw: "Amarushanwa y'Igikombe cy'Umupira n'Imikino",
      fr: "Tournoi Annuel du Championnat Sportif Inter-Maisons"
    },
    dateDisplay: "May 15, 2027",
    startDate: "2027-05-15T09:00:00",
    endDate: "2027-05-15T16:30:00",
    audience: "All School & Parents",
    location: "Sports Ground & Courts",
    description: {
      en: "The highlight of our athletic calendar: football finals, volleyball trophies, track races, and medal award ceremony.",
      rw: "Umunsi ukomeye w'imikino: imikino ya nyuma y'umupira w'amaguru, volleyball, kwiruka, no gutanga imidari n'ibikombe.",
      fr: "Le grand rendez-vous sportif de l'année : finales de football, trophées de volley-ball et remise officielle des médailles."
    }
  },
  {
    id: "ev-t3-ple",
    term: "term-3",
    category: "academic",
    title: {
      en: "National Primary Leaving Examinations (PLE)",
      rw: "Ikizamini cya Leta Gisoza Amashuri Abanza (PLE)",
      fr: "Examens Nationaux du Primary Leaving Examination (PLE)"
    },
    dateDisplay: "Jul 12 – Jul 15, 2027",
    startDate: "2027-07-12T08:00:00",
    endDate: "2027-07-15T15:00:00",
    audience: "P6 Candidate Classes",
    location: "National Examination Center",
    description: {
      en: "Rwanda Basic Education Board (REB) official national examinations for Primary 6 candidates across the nation.",
      rw: "Ibizamini bya Leta bisoza amashuri abanza bitegurwa n'Ikigo cy'Igihugu cy'Uburezi (REB) ku bakandida bose mu gihugu.",
      fr: "Épreuves officielles nationales du Rwanda Basic Education Board (REB) pour l'accès aux études secondaires."
    }
  },
  {
    id: "ev-t3-grad",
    term: "term-3",
    category: "community",
    title: {
      en: "Grand Speech Day, P6 Graduation & Awards Gala",
      rw: "Umunsi Mukuru wo Gutanga Impamyabumenyi no Gusoza Umwaka",
      fr: "Grande Cérémonie de Remise des Diplômes et Gala Annuel"
    },
    dateDisplay: "Jul 23, 2027",
    startDate: "2027-07-23T09:00:00",
    endDate: "2027-07-23T15:30:00",
    audience: "Graduating P6, Parents & Community",
    location: "Main Auditorium & Green Pavilion",
    description: {
      en: "P6 graduates celebrate transition to secondary education with caps and gowns, top academic awards, and cultural performances.",
      rw: "Gushyikiriza impamyabumenyi abasoje amashuri abanza, gushimira abanyeshuri n'abarimu b'indashyikirwa, no gutangira ibiruhuko bikuru.",
      fr: "Célébration festive de fin d'études primaires, remise des prix d'excellence et clôture officielle de l'année scolaire."
    }
  }
];

/**
 * Generate an RFC 5545 compliant .ics (iCalendar) file string
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook, and Android
 */
export function generateICalString(events, lang = 'en') {
  const formatIcalDate = (isoStr) => {
    return isoStr.replace(/[-:]/g, '').replace('.000', '') + 'Z';
  };

  const escapeIcal = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const nowStr = formatIcalDate(new Date().toISOString());

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rwenanura Parents Primary School//Academic Calendar 2026-2027//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:RPPS Academic Calendar 2026/2027',
    'X-WR-TIMEZONE:Africa/Kigali',
    'X-WR-CALDESC:Official Term Dates and Academic Milestones for Rwenanura Parents Primary School'
  ];

  events.forEach(ev => {
    const title = ev.title[lang] || ev.title.en;
    const desc = ev.description[lang] || ev.description.en;
    const start = formatIcalDate(new Date(ev.startDate).toISOString());
    const end = formatIcalDate(new Date(ev.endDate).toISOString());

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${ev.id}-2026-rpps@rwenanuraparents.sch.rw`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(`DTSTART:${start}`);
    ics.push(`DTEND:${end}`);
    ics.push(`SUMMARY:${escapeIcal(title)}`);
    ics.push(`DESCRIPTION:${escapeIcal(desc)}`);
    ics.push(`LOCATION:${escapeIcal(ev.location)}`);
    ics.push(`CATEGORIES:${escapeIcal(ev.category.toUpperCase())}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Trigger immediate client-side download of the .ics file
 */
export function downloadICalFile(events, filename = 'RPPS-Academic-Calendar-2026-2027.ics', lang = 'en') {
  const icalData = generateICalString(events, lang);
  const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
