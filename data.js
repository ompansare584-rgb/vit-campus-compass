/* ==========================================================================
   data.js — ALL site content lives here, separate from the rendering logic.
   To add or fix something, edit this file only. script.js reads it and builds the page.

   Honesty rules used in this file:
   - Anything not supplied is `null` (never guessed). The UI shows a truthful fallback.
   - `url: null` means "no URL supplied" -> the link button is hidden.
   - Club names keep the exact spelling/capitalisation that was supplied.
   ========================================================================== */

const VCC_DATA = {

  /* ---------- Official source pages (page-level links that were supplied) ---------- */
  SOURCES: {
    cocurricular: { label: "Co-curricular Activities", url: "https://www.vit.edu/about-co-curricular-activities/" },
    technical:    { label: "Technical Clubs",          url: "https://www.vit.edu/technical-clubs-life-at-vit/" },
    sports:       { label: "Sports",                   url: "https://www.vit.edu/sports-life-at-vit/" },
    spdc:         { label: "SPDC",                     url: "https://www.vit.edu/skill-and-personality-development-programme-centre/" },
    sccg:         { label: "SCCG",                     url: "https://www.vit.edu/student-career-counselling-and-guidance/" },
    lifevit:      { label: "Life at VIT",              url: "https://www.vit.edu/lifevit/" }
  },

  /* Nicer labels for interest tags that are acronyms (others are auto-formatted). */
  TAG_LABELS: { uav: "UAVs", sae: "SAE", atv: "ATV", "ar-vr": "AR / VR", microsoft: "Microsoft", google: "Google" },

  /* ---------- Student-friendly discovery categories for clubs ----------
     (Different from the original source category, which is kept per club in `sources`.) */
  CLUB_CATEGORIES: [
    { id: "tech",        label: "Tech & Software",           icon: "code",      blurb: "Coding, app/web development, game dev and emerging tech." },
    { id: "engineering", label: "Engineering & Robotics",    icon: "cog",       blurb: "Racing cars, drones, robots and hands-on building." },
    { id: "science",     label: "Science & Space",           icon: "planet",    blurb: "Astronomy, physics and multidisciplinary projects." },
    { id: "chapters",    label: "Professional Chapters",     icon: "network",   blurb: "Student branches of professional bodies." },
    { id: "business",    label: "Entrepreneurship & Finance",icon: "trending",  blurb: "Start-ups, innovation, investing and markets." },
    { id: "growth",      label: "Communication & Growth",    icon: "mic",       blurb: "Public speaking, leadership, soft skills, networking." },
    { id: "media",       label: "Media & Arts",              icon: "film",      blurb: "Publishing, filmmaking and creative work." },
    { id: "community",   label: "Student Life & Community",  icon: "heart",     blurb: "Welfare, hobbies, culture and documentation." }
  ],

  /* ---------- CLUBS ----------
     33 unique entries: 14 from Co-curricular Activities + 20 from Technical Clubs,
     minus 1 overlap (Reality Spectra appears in both lists and is shown ONCE with both sources).
     `sources` = original source list(s). `category` = discovery category (see above).
     `tags` only where the supplied description supports them. */
  CLUBS: [
    /* --- From: Co-curricular Activities --- */
    { id: "pi-editorial-board", name: "Pi Editorial Board", category: "media", icon: "pen", kind: "Editorial body",
      description: "The official publishing and editorial body.",
      sources: ["cocurricular"], tags: ["publishing", "editorial"] },

    { id: "antariksh-club-of-vi", name: "Antariksh Club of VI", category: "science", icon: "planet", kind: "Club",
      description: "A club focused on space and astronomy.",
      sources: ["cocurricular"], tags: ["space", "astronomy"] },

    { id: "epec", name: "EPEC", fullName: "Entrepreneurship Promotion and Empowerment Cell", category: "business", icon: "lightbulb", kind: "Cell",
      description: "EPEC stands for Entrepreneurship Promotion and Empowerment Cell.",
      sources: ["cocurricular"], tags: ["entrepreneurship"] },

    { id: "sw-and-d", name: "SW & D", fullName: "Student Welfare and Development committee", category: "community", icon: "heart", kind: "Committee",
      description: "SW & D is the Student Welfare and Development committee.",
      sources: ["cocurricular"], tags: ["student-welfare"] },

    { id: "light-hearted-lounge", name: "Light-hearted Lounge", category: "community", icon: "coffee", kind: "Student space",
      description: "A space for casual hobbies and informal student interaction.",
      sources: ["cocurricular"], tags: ["hobbies", "social"] },

    { id: "c-cube", name: "C-Cube", category: "tech", icon: "code", kind: "Technical club",
      description: "A coding and computer science technical club.",
      sources: ["cocurricular"], tags: ["coding", "computer-science"] },

    /* Reality Spectra is listed in BOTH official lists -> one card, two sources */
    { id: "reality-spectra", name: "Reality Spectra", category: "tech", icon: "headset", kind: "Technical club",
      description: "A club focused on augmented reality, virtual reality, and emerging technologies.",
      sources: ["cocurricular", "technical"], tags: ["ar-vr", "emerging-tech"] },

    { id: "rangmanch", name: "RangManch", category: "media", icon: "film", kind: "Club",
      description: "The official filmmaking and cinematic arts club.",
      sources: ["cocurricular"], tags: ["filmmaking", "arts"] },

    { id: "abhivriddhi", name: "Abhivriddhi", category: "growth", icon: "graduation", kind: "Committee",
      description: "A student training and development committee focused on corporate and soft skills.",
      sources: ["cocurricular"], tags: ["soft-skills", "corporate-skills", "training"] },

    { id: "team-eklavya", name: "Team Eklavya", category: "engineering", icon: "wheel", kind: "Team",
      description: "An interdisciplinary technical racing and engineering team.",
      sources: ["cocurricular"], tags: ["racing", "engineering"] },

    { id: "the-investment-forum", name: "The Investment Forum", category: "business", icon: "trending", kind: "Forum",
      description: "A group focused on finance, stock markets, and investment literacy.",
      sources: ["cocurricular"], tags: ["finance", "stock-markets", "investing"] },

    { id: "vedc", name: "VEDC", category: "business", icon: "lightbulb", kind: "Cell / club",
      description: "Listed as Vishwakarma Entrepreneurship Development Cell / Vocational & Entrepreneurial Development Club.",
      note: "The two expansions were supplied together and have not been verified as the same body. The supplied naming is preserved; please check the official page.",
      sources: ["cocurricular"], tags: ["entrepreneurship"] },

    { id: "speakers-club", name: "Speaker’s Club", category: "growth", icon: "mic", kind: "Club",
      description: "A club for public speaking, debates, and communication skills.",
      sources: ["cocurricular"], tags: ["public-speaking", "debate", "communication"] },

    { id: "reports", name: "Reports", category: "community", icon: "file", kind: "Archive",
      description: "An archive for annual event reports and committee documentation.",
      note: "Described as an archive rather than a student club, so it may not be something you can ‘join’.",
      sources: ["cocurricular"], tags: ["documentation", "reports"] },

    /* --- From: Technical Clubs --- */
    { id: "mlsc", name: "Microsoft Learn Student Club (MLSC)", category: "tech", icon: "code", kind: "Student club",
      description: "Microsoft technologies and hands-on learning.",
      sources: ["technical"], tags: ["microsoft", "hands-on-learning"] },

    { id: "team-endurance-racing", name: "Team Endurance Racing", category: "engineering", icon: "wheel", kind: "Team",
      description: "SAE/racing team focused on an ATV or quad-bike engineering project.",
      sources: ["technical"], tags: ["racing", "engineering", "sae", "atv"] },

    { id: "gedit-coding-club", name: "GedIT Coding Club", category: "tech", icon: "code", kind: "Club",
      description: "Coding, software development, and competitive programming.",
      sources: ["technical"], tags: ["coding", "software-development", "competitive-programming"] },

    { id: "ekasutram", name: "Ekasutram", category: "community", icon: "sparkle", kind: "Focus to be verified",
      description: "A cultural, technical, or literary club.",
      note: "The exact focus of Ekasutram has not been verified, so none of these is presented as confirmed. Check the official page.",
      unverified: true,
      sources: ["technical"], tags: [] },

    { id: "gdsc", name: "Google Developer Student Clubs (GDSC)", category: "tech", icon: "code", kind: "Student club",
      description: "Google technologies, application and web development, and workshops.",
      note: "Name shown as supplied. Its current organisational name and status have not been checked.",
      sources: ["technical"], tags: ["google", "web-development", "app-development", "workshops"] },

    { id: "isa-vit-pune", name: "ISA VIT Pune", category: "chapters", icon: "cog", kind: "Student chapter",
      description: "International Society of Automation student chapter.",
      sources: ["technical"], tags: ["automation"] },

    { id: "team-griffin-india", name: "Team Griffin India", category: "engineering", icon: "plane", kind: "Team",
      description: "Aeromodelling, unmanned aerial vehicles (UAVs), and robotics.",
      sources: ["technical"], tags: ["aeromodelling", "uav", "robotics"] },

    { id: "csi-vit-pune", name: "CSI VIT Pune", category: "chapters", icon: "network", kind: "Student branch",
      description: "Computer Society of India student branch.",
      sources: ["technical"], tags: ["computing"] },

    { id: "team-vishwanetrutvam", name: "Team Vishwanetrutvam", category: "growth", icon: "flag", kind: "Team",
      description: "Leadership and management.",
      sources: ["technical"], tags: ["leadership", "management"] },

    { id: "team-veloce-racing", name: "Team Veloce Racing", category: "engineering", icon: "wheel", kind: "Team",
      description: "Formula Student racing-car engineering, including combustion or electric racing-car projects as applicable.",
      sources: ["technical"], tags: ["racing", "engineering", "formula-student"] },

    { id: "club-catalyst", name: "Club Catalyst", category: "community", icon: "sparkle", kind: "Club",
      description: "A cultural, social, and student-driven initiative.",
      sources: ["technical"], tags: ["cultural", "social"] },

    { id: "game-dev-plus", name: "Game Dev +", category: "tech", icon: "gamepad", kind: "Club",
      description: "Game development and design.",
      sources: ["technical"], tags: ["game-development", "design"] },

    { id: "ieee-vit-pune", name: "IEEE VIT Pune", category: "chapters", icon: "chip", kind: "Student branch",
      description: "IEEE student branch.",
      sources: ["technical"], tags: ["ieee"] },

    { id: "chesa", name: "CHESA", fullName: "Chemical Engineering Student Association", category: "chapters", icon: "flask", kind: "Student association",
      description: "CHESA is the Chemical Engineering Student Association.",
      sources: ["technical"], tags: ["chemical-engineering"] },

    { id: "trf", name: "TRF – The Robotics Forum", category: "engineering", icon: "cog", kind: "Forum",
      description: "Robotics, automation, and hardware.",
      sources: ["technical"], tags: ["robotics", "automation", "hardware"] },

    { id: "team-quark", name: "Team Quark", category: "science", icon: "atom", kind: "Team",
      description: "Technical, physics-oriented, and multidisciplinary projects.",
      sources: ["technical"], tags: ["physics", "multidisciplinary"] },

    { id: "personality-development-club", name: "Personality Development Club", category: "growth", icon: "mic", kind: "Club",
      description: "Soft skills, public speaking, and personality enhancement.",
      sources: ["technical"], tags: ["soft-skills", "public-speaking", "personality-development"] },

    { id: "indus-connect", name: "Indus Connect", category: "growth", icon: "network", kind: "Networking group",
      description: "Alumni and industry networking.",
      sources: ["technical"], tags: ["alumni", "industry-networking"] },

    { id: "innovsphere", name: "InnovSphere", category: "business", icon: "lightbulb", kind: "Hub",
      description: "Innovation and entrepreneurship hub.",
      sources: ["technical"], tags: ["innovation", "entrepreneurship"] }
  ],

  /* ---------- Event categories (the UI only shows chips for categories that have events) ---------- */
  EVENT_CATEGORIES: [
    { id: "cultural",        label: "Cultural Festivals",       color: "var(--c-growth)" },
    { id: "entrepreneurship",label: "Entrepreneurship Summits", color: "var(--c-business)" },
    { id: "flagship",        label: "Flagship Fests",           color: "var(--c-tech)" },
    { id: "hackathon",       label: "Hackathons",               color: "var(--c-engineering)" },
    { id: "coding",          label: "Coding Competitions",      color: "var(--c-tech)" },
    { id: "workshop",        label: "Technical Workshops",      color: "var(--c-science)" },
    { id: "recruitment",     label: "Club Recruitment",         color: "var(--c-chapters)" },
    { id: "sports",          label: "Sports & Extracurricular", color: "var(--c-media)" },
    { id: "skills",          label: "Skill Development",        color: "var(--c-community)" },
    { id: "community",       label: "Community & Social",       color: "var(--c-community)" }
  ],

  /* ---------- EVENTS ----------
     Dates are ISO (YYYY-MM-DD). `startDate: null` = date not confirmed.
     Status (upcoming / happening now / past / date not confirmed) is COMPUTED in script.js
     from today's date, so nothing here is hard-labelled "upcoming".

     TEMPLATE for adding an event:
     { id: "unique-id", name: "Name", category: "workshop", startDate: "2026-12-05", endDate: "2026-12-05",
       venue: null, description: "…", registrationUrl: null, unknown: ["Venue"], relatedClubs: ["gdsc"] }
  */
  EVENTS: [
    { id: "vishwakarandak-2026", name: "VishwaKarandak 2026", category: "cultural",
      startDate: "2026-11-01", endDate: "2026-11-04", datesAreUserReported: true,
      theme: "Apex of Infinity",
      venue: null,
      description: "Described as an annual cultural fest and Student Council celebration.",
      sourceNote: "Original source context: Student Council VIT Pune on Instagram. No direct post link was supplied, so the dates and theme are shown as user-reported information, not independently verified.",
      unknown: ["Venue", "Timetable", "Registration link", "Fees", "Individual activities"],
      registrationUrl: null, infinity: true },

    { id: "vishwapreneur-2026", name: "VISHWAPRENEUR 2026", category: "entrepreneurship",
      startDate: "2026-03-14", endDate: "2026-03-15",
      venue: "Mahatma Phule Sanskrutik Bhavan",
      description: "Entrepreneurship summit.",
      unknown: ["Registration link", "Results"],
      registrationUrl: null },

    { id: "melange", name: "Mélange", category: "flagship",
      startDate: null, endDate: null, venue: null,
      description: "Listed among VIT’s flagship fests.",
      unknown: ["Dates", "Venue", "Registration link"],
      registrationUrl: null },

    { id: "vishwotsav", name: "Vishwotsav", category: "flagship",
      startDate: null, endDate: null, venue: null,
      description: "Listed among VIT’s flagship fests.",
      unknown: ["Dates", "Venue", "Registration link"],
      registrationUrl: null },

    { id: "vishwa-tech-spectra", name: "Vishwa Tech Spectra", category: "flagship",
      startDate: null, endDate: null, venue: null,
      description: "Listed among VIT’s flagship fests.",
      unknown: ["Dates", "Venue", "Registration link"],
      registrationUrl: null }
  ],

  /* ---------- Resource categories (empty ones are hidden by the UI) ---------- */
  RESOURCE_CATEGORIES: [
    { id: "campus",       label: "Campus Life Directory",            icon: "compass" },
    { id: "sports",       label: "Sports & Extracurricular",         icon: "ball" },
    { id: "skills",       label: "Skill & Personality Development",  icon: "target" },
    { id: "career",       label: "Career & Placement",               icon: "briefcase" },
    { id: "academic",     label: "Academic & Administrative",        icon: "book" },
    { id: "scholarships", label: "Scholarships & Financial Aid",     icon: "graduation" },
    { id: "community",    label: "Community-maintained",             icon: "users" }
  ],

  /* ---------- RESOURCES ----------
     official: true  -> official VIT page.   official: false -> community / unofficial link.
     url: null -> no link button is shown. */
  RESOURCES: [
    { id: "life-at-vit", title: "Life at VIT", category: "campus", icon: "compass", official: true,
      description: "VIT’s overview of student life, organised into five broad areas.",
      highlights: ["Co-curricular Activities", "Sports", "Technical Clubs", "SPDC (Skill and Personality Development Programme Centre)", "SCCG (Student Career Counselling and Guidance)"],
      caveat: null, url: "https://www.vit.edu/lifevit/", linkLabel: "Open Life at VIT" },

    { id: "co-curricular", title: "Co-curricular Activities", category: "campus", icon: "users", official: true,
      description: "Official VIT page covering co-curricular committees and clubs. A source for many of the names in the Campus Clubs section.",
      highlights: [], caveat: null,
      url: "https://www.vit.edu/about-co-curricular-activities/", linkLabel: "Open official page" },

    { id: "technical-clubs", title: "Technical Clubs", category: "campus", icon: "chip", official: true,
      description: "Official VIT page covering technical clubs and teams. A source for many of the names in the Campus Clubs section.",
      highlights: [], caveat: null,
      url: "https://www.vit.edu/technical-clubs-life-at-vit/", linkLabel: "Open official page" },

    { id: "sports", title: "Sports at VIT", category: "sports", icon: "ball", official: true,
      description: "Sports and athletics opportunities, with facilities, coaching and intercollegiate competition.",
      highlights: ["Cricket, football, basketball, tennis, swimming, badminton, athletics and martial arts",
                   "Sports facilities", "Coaching opportunities", "Intercollegiate competitions", "Opportunities for inclusive participation"],
      caveat: "Contact names and details are not reproduced here. Please check the official page for current information.",
      url: "https://www.vit.edu/sports-life-at-vit/", linkLabel: "Open Sports page" },

    { id: "spdc", title: "SPDC — Skill and Personality Development Programme Centre", category: "skills", icon: "target", official: true,
      description: "A central facility for training, support and guidance in skills and personality development.",
      highlights: ["Communication, problem-solving, teamwork and creativity",
                   "Current programming languages",
                   "Workshops and competitions",
                   "Employability and academic skills",
                   "IT skills, English and aptitude development",
                   "Described as particularly supporting SC/ST students"],
      caveat: "Programme details are as supplied and may be historical (it was described as AICTE-sponsored under AQIS from academic year 2019–20). Check the official page for what is currently offered.",
      url: "https://www.vit.edu/skill-and-personality-development-programme-centre/", linkLabel: "Open SPDC page" },

    { id: "sccg", title: "SCCG — Student Career Counselling and Guidance", category: "career", icon: "briefcase", official: true,
      description: "Career support that bridges industry and academia, from planning to placement preparation.",
      highlights: ["Career guidance and personalised counselling",
                   "Employability workshops",
                   "Career planning, higher education and job opportunities",
                   "Continuous learning",
                   "Resume and interview preparation",
                   "Placement support"],
      caveat: null,
      url: "https://www.vit.edu/student-career-counselling-and-guidance/", linkLabel: "Open SCCG page" }
  ]
};
