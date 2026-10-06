export const schoolInfo = {
  name: "Rwenanura Parents Primary School",
  shortName: "RPPS",
  tagline: "Nurturing Academic Excellence, Strong Moral Values & Future Leaders",
  motto: "Education for Light and Leadership",
  established: 2010,
  location: "Rwenanura Cell, Nyagatare District, Eastern Province, Rwanda",
  phone: "+250 788 456 789",
  altPhone: "+250 783 112 233",
  email: "info@rwenanuraparents.sch.rw",
  admissionsEmail: "admissions@rwenanuraparents.sch.rw",
  workingHours: "Monday - Friday: 7:30 AM - 4:30 PM",
  // Optional links. Leave empty to hide the related buttons.
  links: {
    // Invite link of the official alumni WhatsApp group (https://chat.whatsapp.com/...)
    alumniWhatsApp: "",
    // Prospectus PDF: place the file at public/prospectus.pdf. When it is
    // missing, visitors are offered to request it by email instead.
    prospectusPdf: "/prospectus.pdf"
  },
  headteacher: {
    name: "Mr. Geofrey K. Kayinamura",
    title: "Headteacher & Academic Director",
    message: "At Rwenanura Parents Primary School, we believe every child is born with unique potential. Our dedicated team of educators fosters an environment where academic rigor meets character building, critical thinking, and holistic development. We prepare young minds to lead in a dynamic world while remaining deeply grounded in sound ethical values.",
    image: "/images/headteacher.jpg"
  }
};

export const heroSlides = [
  {
    id: 1,
    title: "Inspiring Young Minds to Reach Higher Heights",
    subtitle: "Rwenanura Parents Primary School provides a world-class holistic foundation in a nurturing, learner-centered environment.",
    badge: "Welcome to RPPS",
    ctaPrimary: "Explore Admissions",
    ctaSecondary: "Schedule a Campus Tour",
    image: "/images/hero-1.jpg"
  },
  {
    id: 2,
    title: "100% Primary Leaving Exam Distinction Rate",
    subtitle: "Consistently ranked among the top-performing primary schools in Nyagatare District and the Eastern Province.",
    badge: "Academic Excellence",
    ctaPrimary: "View Academic Programs",
    ctaSecondary: "Meet Our Educators",
    image: "/images/hero-2.jpg"
  },
  {
    id: 3,
    title: "Digital Literacy & Modern Science Laboratories",
    subtitle: "Empowering pupils with coding, robotics, hands-on scientific discovery, and modern ICT skills for tomorrow.",
    badge: "Innovation & Technology",
    ctaPrimary: "Discover Facilities",
    ctaSecondary: "Join Innovation Club",
    image: "/images/hero-3.jpg"
  },
  {
    id: 4,
    title: "Vibrant Sports, Music, and Leadership Clubs",
    subtitle: "Developing confidence, teamwork, and talents beyond the classroom through comprehensive extracurricular activities.",
    badge: "Holistic Development",
    ctaPrimary: "Campus Life",
    ctaSecondary: "Apply Now",
    image: "/images/hero-4.jpg"
  }
];

export const quickStats = [
  { value: "100%", label: "PLE Pass Rate", desc: "First-grade division achievement" },
  { value: "850+", label: "Enrolled Pupils", desc: "Nursery through Primary 6" },
  { value: "38+", label: "Dedicated Teachers", desc: "Certified, experienced educators" },
  { value: "1:22", label: "Teacher-Pupil Ratio", desc: "Personalized individual attention" }
];

export const academicPrograms = [
  {
    id: "nursery",
    title: "Nursery & Early Childhood",
    grades: "Baby, Middle & Top Classes (Ages 3 - 5)",
    description: "A warm, child-centered environment focused on play-based learning, fundamental motor skills, language immersion (English & Kinyarwanda), and creative social interaction.",
    features: [
      "Phonics & Early Reading Foundations",
      "Interactive Learning Games & Play Area",
      "Art, Music & Creative Movement",
      "Character & Social Etiquette Development"
    ],
    image: "/images/program-nursery.jpg"
  },
  {
    id: "lower-primary",
    title: "Lower Primary School",
    grades: "Primary 1 to Primary 3 (Ages 6 - 8)",
    description: "Building strong foundations in literacy, numeracy, scientific inquiry, and environmental awareness while instilling curiosity and confidence.",
    features: [
      "Mastery in Mathematics & Mental Calculation",
      "Bilingual Proficiency in English & Kinyarwanda",
      "Foundational Science & Technology Skills",
      "Guided Reading & Storytelling Sessions"
    ],
    image: "/images/program-lower-primary.jpg"
  },
  {
    id: "upper-primary",
    title: "Upper Primary School",
    grades: "Primary 4 to Primary 6 (Ages 9 - 12)",
    description: "Rigorous academic preparation for national Primary Leaving Examinations (PLE), critical thinking development, research projects, and introduction to French.",
    features: [
      "Comprehensive PLE National Exam Preparation",
      "Advanced Science, Social Studies & Mathematics",
      "French & ICT Practical Computer Modules",
      "Debate, Leadership & Science Fair Competitions"
    ],
    image: "/images/program-upper-primary.jpg"
  },
  {
    id: "stem-club",
    title: "STEM & Digital Innovation",
    grades: "All Primary Learners",
    description: "Interactive coding workshops, basic robotics, environmental science projects, and computer literacy lab sessions.",
    features: [
      "Hands-on Science Experiments",
      "Introduction to Scratch Programming",
      "Eco-Club & School Garden Projects",
      "Math Quiz Olympiad Club"
    ],
    image: "/images/program-stem-club.jpg"
  }
];

export const coreValues = [
  {
    icon: "ShieldCheck",
    title: "Integrity & Respect",
    description: "We cultivate honesty, mutual respect, self-discipline, and strong moral principles in every learner."
  },
  {
    icon: "Award",
    title: "Academic Excellence",
    description: "We strive for high standards, encouraging curiosity, critical thinking, and intellectual mastery."
  },
  {
    icon: "HeartHandshake",
    title: "Inclusivity & Caring",
    description: "A welcoming, supportive environment where every child feels valued, safe, and encouraged to thrive."
  },
  {
    icon: "Lightbulb",
    title: "Innovation & Curiosity",
    description: "Fostering active problem-solving, digital literacy, and creative expression across all ages."
  },
  {
    icon: "Users",
    title: "Community & Leadership",
    description: "Inspiring pupils to be active contributors, responsible stewards, and collaborative leaders."
  }
];

export const campusFacilities = [
  {
    id: "ict-lab",
    category: "Academic",
    title: "Modern ICT Computer Lab",
    description: "Equipped with high-speed internet, age-appropriate computer workstations, and educational software for digital literacy.",
    image: "/images/facility-ict-lab.jpg"
  },
  {
    id: "library",
    category: "Academic",
    title: "Resourceful Children's Library",
    description: "Thousands of English, Kinyarwanda, and French books, storybooks, reference materials, and quiet reading nooks.",
    image: "/images/facility-library.jpg"
  },
  {
    id: "sports-ground",
    category: "Extracurricular",
    title: "Sports Pitch & Athletics Oval",
    description: "Spacious green fields for football, volleyball, athletics, physical education, and outdoor recreational play.",
    image: "/images/facility-sports-ground.jpg"
  },
  {
    id: "science-lab",
    category: "Academic",
    title: "Interactive Science Lab",
    description: "Safe, hands-on science discovery room equipped with models, microscopes, and experimental apparatus.",
    image: "/images/facility-science-lab.jpg"
  },
  {
    id: "dining-hall",
    category: "Wellness",
    title: "Hygienic Dining & Nutrition Hall",
    description: "Clean dining facility providing balanced, nutritious mid-day hot meals prepared fresh daily for all pupils.",
    image: "/images/facility-dining-hall.jpg"
  },
  {
    id: "nursery-playground",
    category: "Early Years",
    title: "Safe Early Years Outdoor Playground",
    description: "Dedicated, secure playground equipped with soft safety surfacing, swings, slides, and sensory play modules.",
    image: "/images/facility-nursery-playground.jpg"
  }
];

export const newsAndEvents = [
  {
    id: 1,
    type: "event",
    category: "Academic",
    date: { day: "15", month: "SEP", year: "2026" },
    time: "08:30 AM - 02:00 PM",
    location: "School Main Hall",
    title: "Annual STEM & Science Discovery Fair 2026",
    summary: "Pupils from P1 to P6 present innovative science models, environmental projects, and coding demonstrations to parents and guests.",
    image: "/images/news-1.jpg"
  },
  {
    id: 2,
    type: "news",
    category: "Achievement",
    date: { day: "02", month: "SEP", year: "2026" },
    time: "All Day",
    location: "Nyagatare District",
    title: "RPPS Top Ranked in District Mock PLE Examinations",
    summary: "Our Primary 6 candidates scored 100% first grade passes in the recent regional pre-national examination series.",
    image: "/images/news-2.jpg"
  },
  {
    id: 3,
    type: "event",
    category: "Community",
    date: { day: "28", month: "SEP", year: "2026" },
    time: "09:00 AM - 01:00 PM",
    location: "Sports Stadium",
    title: "Inter-House Sports & Cultural Competition",
    summary: "A thrilling day of track events, relay races, traditional Rwandan dance, and inter-house athletics competition.",
    image: "/images/news-3.jpg"
  },
  {
    id: 4,
    type: "event",
    category: "Admissions",
    date: { day: "10", month: "OCT", year: "2026" },
    time: "09:00 AM - 03:00 PM",
    location: "Rwenanura Campus",
    title: "Open Day & New Pupil Orientation 2027",
    summary: "Prospective parents and children are invited to explore classrooms, meet teachers, and tour our facilities.",
    image: "/images/news-4.jpg"
  }
];

export const admissionsSteps = [
  {
    step: "01",
    title: "Online Application / In-Person Form",
    desc: "Fill out our quick admission application online or visit our school administration office at Rwenanura campus."
  },
  {
    step: "02",
    title: "Document Submission",
    desc: "Submit child's birth certificate, 2 passport photos, previous academic report cards, and immunization records."
  },
  {
    step: "03",
    title: "Learner Readiness Assessment",
    desc: "A friendly, age-appropriate assessment to determine the child's academic placement and learning support needs."
  },
  {
    step: "04",
    title: "Enrollment & Orientation",
    desc: "Receive official acceptance letter, collect school uniform pack, and join our welcome orientation!"
  }
];

export const testimonials = [
  {
    id: 1,
    quote: "Sending my two daughters to Rwenanura Parents Primary School was the best decision. Their confidence, spoken English, and math skills have grown tremendously. The teachers truly care about each child.",
    author: "Mrs. Claudine Mukamana",
    role: "Parent of P3 & P5 Pupils",
    avatar: "/images/testimonial-1.jpg"
  },
  {
    id: 2,
    quote: "I love RPPS because we have computers to practice coding, a big library with fun storybooks, and my teachers always help me understand science experiments!",
    author: "Kevin Manzi",
    role: "Primary 6 Head Boy",
    avatar: "/images/testimonial-2.jpg"
  },
  {
    id: 3,
    quote: "The academic standards at RPPS are outstanding. The school balances discipline, spiritual and moral guidance, and high examination performance seamlessly.",
    author: "Dr. Jean-Claude Habimana",
    role: "Parent Association Member",
    avatar: "/images/testimonial-3.jpg"
  }
];
