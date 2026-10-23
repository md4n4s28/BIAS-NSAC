export const officialUrl = 'https://www.spaceappschallenge.org/';
export const officialRegistrationUrl = 'https://www.spaceappschallenge.org/2026/';
export const directionsUrl = 'https://www.google.com/maps/place/Birla+Institute+of+Applied+Sciences,+Bhimtal-263136+(Uttarakhand)/@29.3566993,79.550849,17z/data=!4m8!1m2!2m1!1sBirla+Institute+of+applied+sciences,+bhimtal!3m4!1s0x39a099dbdc0befa7:0xa08407c1dac1f3ac!8m2!3d29.3562377!4d79.5540858';
export const venueMapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3477.4607286853357!2d79.55042308813083!3d29.356796190712274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09818f8b9c99f%3A0xfe9870c9d2a28be7!2sBirla%20Institute%20Of%20Applied%20Sciences!5e0!3m2!1sen!2sin!4v1583690649149!5m2!1sen!2sin';
export const itineraryPdfUrl = '/itineary/Itinerary-PDF.pdf';

export interface OrganizerContact {
  name: string;
  role: string;
  phone: string;
  displayPhone: string;
  email: string;
  whatsappUrl: string;
}

export const organizerContacts: OrganizerContact[] = [
  {
    name: 'Mr. Manish Bhatt',
    role: 'Faculty Coordinator',
    phone: '+91 9897501077',
    displayPhone: '+91 98975 01077',
    email: 'Manishbhatt@birlainstitute.co.in',
    whatsappUrl: 'https://wa.me/919897501077?text=Hello%20Mr.%20Manish%2C%20I%20have%20a%20query%20regarding%20NASA%20Space%20Apps%20Challenge%20(BIAS-NSAC%202026).',
  },
  {
    name: 'Mohd Anas',
    role: 'Technical & Student Event Head',
    phone: '+91 8630504115',
    displayPhone: '+91 86305 04115',
    email: 'mohdanas@birlainstitute.co.in',
    whatsappUrl: 'https://wa.me/918630504115?text=Hello%20Mohd%20Anas%2C%20I%20have%20a%20query%20regarding%20NASA%20Space%20Apps%20Challenge%20(BIAS-NSAC%202026).',
  },
  {
    name: 'Astroverse Support Desk',
    role: 'Event Helpdesk',
    phone: '+91 7060744930',
    displayPhone: '+91 70607 44930',
    email: 'contact@astroverse.in',
    whatsappUrl: 'https://wa.me/917060744930?text=Hello%20Astroverse%20Team%2C%20I%20have%20a%20query%20regarding%20the%20NASA%20Space%20Apps%20Challenge.',
  },
];
const galleryCaptions: Record<number, string> = { 1: 'Participants gathered at the event venue', 2: 'An event speaker addressing participants', 3: 'Participants and organizers at the Space Apps backdrop', 4: 'A group gathered at the event stage', 5: 'A speaker presenting at the event', 6: 'Students attending a session', 7: 'Participants on the event stage', 8: 'A group photograph at the event stage', 9: 'A technology demonstration at the event', 10: 'Participants in an interactive session', 11: 'Participants working at computers', 12: 'A team bringing their hands together', 13: 'Students collaborating in the computer lab', 14: 'Participants discussing their work', 15: 'A team collaborating at their workspace', 16: 'An outdoor gathering at the event venue', 17: 'A participant-built rover project', 18: 'A speaker addressing the event', 19: 'A participant presenting a project', 20: 'Students sharing a project outdoors', 21: 'A team explaining a project', 22: 'Participants working on a hands-on project', 26: 'Students collaborating on a rover project', 29: 'A working session in the computer lab', 30: 'A group activity on the event stage' };
export const gallery = [11, 16, 6, 29, 30, 5, 26, 1, 2, 8, 19, 18, 15, 14, 13, 12, 10, 9, 4, 7, 3].map(index => ({ src: `/gallery/event-${String(index).padStart(2, '0')}.jpeg`, caption: `${galleryCaptions[index]} · Organizer-supplied archive` }));
export const homeGallery = [gallery[0], gallery[1], gallery[5]]
export const schedule = [
  { day: '01', date: '14 NOV', title: 'The journey begins', activities: ['Registration & check-in', 'Inauguration & challenge briefing', 'Team formation & development begins'], note: 'Reporting by 08:30 AM with student ID and laptop gear.' },
  { day: '02', date: '15 NOV', title: 'Ideas into action', activities: ['Development & mentorship', '6:00 PM Project submissions', '8:00 PM Live jury evaluation'], note: 'Project submissions open at 06:00 PM; Judging starts at 08:00 PM.' },
  { day: '03', date: '16 NOV', title: 'Make your mark', activities: ['Results announcement', 'Valedictory & awards ceremony', 'Global Nominee reveal'], note: 'Grand closing ceremony & results declaration: 16 November.' },
];

export interface DetailedActivity {
  time: string;
  title: string;
  desc: string;
  category: 'Registration' | 'Ceremony' | 'Briefing' | 'Hacking' | 'Mentorship' | 'Food' | 'Evaluation' | 'Milestone';
  location: string;
  isHighlight?: boolean;
}

export interface DetailedDay {
  day: string;
  date: string;
  fullDate: string;
  phase: string;
  title: string;
  subtitle: string;
  note?: string;
  activities: DetailedActivity[];
}

export const detailedSchedule: DetailedDay[] = [
  {
    day: '01',
    date: '14 NOV',
    fullDate: 'Saturday, 14 November 2026',
    phase: 'PHASE 01 · MISSION LAUNCH & FORMATION',
    title: 'The Journey Begins',
    subtitle: 'Reporting, check-in, grand inauguration, 14 problem statements briefing, team consolidation, and development kickoff.',
    note: 'Participants should arrive by 08:30 AM with student ID and required laptop gear.',
    activities: [
      {
        time: '08:30 AM – 10:30 AM',
        title: 'Participant Check-In, Verification & Kit Distribution',
        desc: 'Onsite identity check, verification of dual registration on both NASA and BIAS-NSAC portals, issuance of official lanyard identity badges, and participant welcome kit.',
        category: 'Registration',
        location: 'Campus Reception & Registration Desks',
      },
      {
        time: '10:30 AM – 11:45 AM',
        title: 'Grand Inaugural Ceremony & Keynote Address',
        desc: 'Official opening remarks by institute leadership, overview of the hackathon mission by the local organizing committee, and address by distinguished space science mentors.',
        category: 'Ceremony',
        location: 'Main Auditorium (Live Streamed)',
        isHighlight: true,
      },
      {
        time: '11:45 AM – 01:00 PM',
        title: 'NASA Space Apps Protocol & 14 Problem Statements Overview',
        desc: 'Comprehensive briefing on the 14 global challenge categories, official submission requirements, evaluation criteria, and accessing NASA open-source data APIs.',
        category: 'Briefing',
        location: 'Main Auditorium',
      },
      {
        time: '01:00 PM – 02:00 PM',
        title: 'Networking Lunch & Onsite Team Matchmaking',
        desc: 'Catered lunch break. Solo participants and incomplete squads connect at the designated matchmaking zone to finalize team rosters before coding starts.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
      {
        time: '02:00 PM',
        title: 'Hacking Timer Commences: Development Sprint Begins',
        desc: 'The mission officially begins! Teams claim their workstation bays, initialize Git repositories, configure development environments, and start prototyping.',
        category: 'Hacking',
        location: 'Innovation Labs & Workspaces',
        isHighlight: true,
      },
      {
        time: '05:30 PM – 08:00 PM',
        title: 'Mentorship Round 01: Architecture & Feasibility Review',
        desc: 'Domain experts and faculty mentors conduct 1-on-1 consultations at each team bay to review problem framing, technical architecture, and NASA dataset usage.',
        category: 'Mentorship',
        location: 'Team Workstation Bays',
      },
      {
        time: '08:30 PM – 09:30 PM',
        title: 'Dinner & Evening Recreation Break',
        desc: 'Dinner served for all participants, organizers, and mentors to recharge spirits before continuing evening development.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
    ],
  },
  {
    day: '02',
    date: '15 NOV',
    fullDate: 'Sunday, 15 November 2026',
    phase: 'PHASE 02 · SPRINT, SUBMISSION & JUDGING',
    title: 'Ideas into Action',
    subtitle: 'Full-day development sprint, technical mentorship, 6:00 PM project submission deadline, and 8:00 PM live jury judging evaluation.',
    note: 'Project submissions commence strictly at 06:00 PM; Live judging evaluation begins at 08:00 PM.',
    activities: [
      {
        time: '08:00 AM – 09:00 AM',
        title: 'Breakfast & Morning Mission Sync',
        desc: 'Fresh breakfast served. Morning sync with organizing coordinators regarding hardware components, testing environments, and cloud APIs.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
      {
        time: '10:00 AM – 01:00 PM',
        title: 'Mentorship Round 02: Prototype & Pitch Clinic',
        desc: 'Mid-way progress review. Mentors test working prototypes, review hardware circuits, inspect codebases, and give direct guidance for presentation decks.',
        category: 'Mentorship',
        location: 'Team Workstations',
        isHighlight: true,
      },
      {
        time: '01:00 PM – 02:00 PM',
        title: 'Lunch Break & Campus Decompression',
        desc: 'Lunch break and leisure walk around the scenic Bhimtal campus before the final afternoon project push.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
      {
        time: '02:30 PM – 05:30 PM',
        title: 'Final Sprint, Documentation & Demo Video Preparation',
        desc: 'Teams wrap up feature development, write technical README documentation, record required project demonstrations, and prepare their pitch slide decks.',
        category: 'Hacking',
        location: 'Innovation Labs',
      },
      {
        time: '06:00 PM – 07:30 PM',
        title: 'Project Submission Window & Official Code Freeze',
        desc: 'Project submission window opens! Teams must submit all project deliverables—including GitHub repositories, demo links, documentation, and slides—on both the NASA Space Apps and local portals.',
        category: 'Milestone',
        location: 'Global NASA Portal & Local System',
        isHighlight: true,
      },
      {
        time: '07:30 PM – 08:00 PM',
        title: 'Dinner & Presentation Rig Setup',
        desc: 'Dinner served before the judging rounds begin. Teams verify audio/video feeds, projector displays, and hardware demo rigs in the evaluation halls.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
      {
        time: '08:00 PM – 11:30 PM',
        title: 'Jury Evaluation: Live Project Pitches & Q&A',
        desc: 'Judging officially commences at 08:00 PM! Teams present their projects to the expert jury panel with live demonstrations followed by questions and answers.',
        category: 'Evaluation',
        location: 'Conference Halls & Evaluation Labs',
        isHighlight: true,
      },
    ],
  },
  {
    day: '03',
    date: '16 NOV',
    fullDate: 'Monday, 16 November 2026',
    phase: 'PHASE 03 · RESULTS, VALEDICTORY & FINALE',
    title: 'Make Your Mark',
    subtitle: 'Official results declaration, valedictory ceremony, awards and certificate distribution, and announcement of NASA Global Nominees.',
    note: 'Grand closing ceremony: 16 November. All participants must be present for certificates, trophies, and results announcement.',
    activities: [
      {
        time: '09:00 AM – 10:00 AM',
        title: 'Breakfast & Morning Gathering',
        desc: 'Breakfast served for all participants, faculty, guests, and organizing staff.',
        category: 'Food',
        location: 'Campus Dining Hall',
      },
      {
        time: '10:30 AM – 11:30 AM',
        title: 'Jury Deliberation Debrief & Keynote Address',
        desc: 'Insightful debrief by the jury panel highlighting the most creative space applications built, followed by a keynote address by invited space tech guest speakers.',
        category: 'Briefing',
        location: 'Main Auditorium',
      },
      {
        time: '11:30 AM – 01:00 PM',
        title: 'Official Results Announcement & Award Presentations',
        desc: 'The big moment! Official announcement of competition results, track winners, school and college category champions, and awarding of winner trophies and prize certificates.',
        category: 'Milestone',
        location: 'Main Auditorium',
        isHighlight: true,
      },
      {
        time: '01:00 PM – 02:00 PM',
        title: 'Celebratory Networking Lunch',
        desc: 'Special celebratory lunch bringing together participants, mentors, faculty, and industry guests.',
        category: 'Food',
        location: 'Campus Dining Lawn',
      },
      {
        time: '02:30 PM – 04:30 PM',
        title: 'Grand Valedictory, Certificate Distribution & Global Nominee Reveal',
        desc: 'Distribution of official participation certificates to all teams, closing valedictory remarks by institute leadership, group photo sessions, and official announcement of the teams selected to represent BIAS Bhimtal as NASA Global Nominees!',
        category: 'Ceremony',
        location: 'Main Auditorium',
        isHighlight: true,
      },
    ],
  },
];
export const faqs = [
  { question: 'What is NASA International Space Apps Challenge?', answer: 'A global collaborative challenge that brings people together to solve problems using space science and open data. Visit the official Space Apps website for global rules and challenge information.', category: 'About the challenge' },
  { question: 'What is ASTROVERSE?', answer: 'ASTROVERSE is the local event identity for the programme hosted at Birla Institute of Applied Sciences, Bhimtal. It is distinct from the global NASA Space Apps Challenge identity.', category: 'About the challenge' },
  { question: 'Do teams need to register on both portals?', answer: 'Yes, registration on two platforms is required: (1) The official NASA International Space Apps Challenge website (for global challenge participation and project submission), and (2) This BIAS-NSAC college portal (for local team management, on-campus check-in, tracking category details, and receiving certificates).', category: 'Teams & registration' },
  { question: 'How do team registration IDs and verification work?', answer: 'Each registered team member is assigned a unique Registration ID. Once your team completes registration, the organizing committee reviews and verifies the application. Team leaders and members can check their team\'s official verification status directly on the portal dashboard using their Registration ID.', category: 'Teams & registration' },
  { question: 'What are the participation modes (Online vs Offline), and is accommodation provided?', answer: 'The team leader must select the preferred participation mode during registration: Offline (Onsite at BIAS Bhimtal) or Online (Virtual). For offline participants, accommodation is limited and will be provided only to selected/shortlisted teams after application review.', category: 'Event details' },
  { question: 'How many problem statements can a team choose?', answer: 'Each team can select and work on only ONE problem statement from the official NASA Space Apps Challenge list. Teams cannot submit solutions for multiple problem statements.', category: 'About the challenge' },
  { question: 'Will participants receive certificates?', answer: 'Yes. All eligible team members who actively participate and submit their project will receive an official E-Certificate of Participation. Winning and runner-up teams will be awarded physical hard-copy certificates along with special recognition at the closing ceremony.', category: 'Event details' },
  { question: 'When and where is the local event?', answer: 'The organizer-provided local programme dates are 14–16 November 2026 at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, India. The closing ceremony is on 16 November. These local dates are not presented as the global challenge dates.', category: 'Event details' },
  { question: 'Who can participate?', answer: 'School and College categories have separate registration choices. Both high school students and college undergraduates/postgraduates are eligible to compete in their respective tracks.', category: 'Teams & registration' },
  { question: 'What is the team size?', answer: 'The initial team-size limit is 4–6 members. Organizers manage the current limits, which are displayed on the registration form and enforced on the server and in the database.', category: 'Teams & registration' },
  { question: 'Is participation free?', answer: 'No payment is collected by this website. Free participation for both categories is proposed, subject to organizer confirmation.', category: 'Event details' },
  { question: 'How do I register?', answer: 'Create an account, confirm your email, and submit your team information when registration opens. The team leader’s email must match the signed-in account.', category: 'Teams & registration' },
  { question: 'What should I bring for offline participation?', answer: 'Offline participants should bring their personal laptops, chargers, extension cords, student ID cards, and any hardware/prototyping tools required for their project.', category: 'Event details' },
  { question: 'How does the judging process work, and how are Global Nominees selected?', answer: 'Projects are evaluated by an expert jury panel based on: (1) Relevance & Impact to the chosen challenge, (2) Creativity & Innovation, (3) Effective use of NASA open-source data and space assets, (4) Technical Feasibility & Execution, and (5) Presentation & Demonstration. The top winning teams evaluated by our local judges will be officially selected and advanced as Global Nominees to represent BIAS Bhimtal in the international NASA Space Apps global judging round.', category: 'Judging & projects' },
  { question: 'Must projects be built during the hackathon, or can pre-built projects be used?', answer: 'All projects must be designed, developed, and built fresh during the hackathon itself. Submitting pre-built or pre-existing projects is strictly prohibited and will lead to heavy mark deductions or disqualification. Teams may utilize publicly available open-source libraries, APIs, and frameworks, but all core code and prototype features must be authored during the event.', category: 'Judging & projects' },
  { question: 'Can teams build a software solution or a physical hardware prototype?', answer: 'Yes! Teams have full flexibility to choose whether they build a software application (e.g. web/mobile platform, AI/ML model, interactive simulation, space data visualizer) or a physical hardware prototype (e.g. robotics, IoT sensor systems, rover mechanisms, antenna/ground models) according to what best solves their selected problem statement.', category: 'Judging & projects' },
  { question: 'How do teams choose their Problem Statement (PS)?', answer: 'Teams can select their challenge from the officially listed NASA Space Apps problem statements. Each team must choose and build their solution according to one designated problem statement from the list to ensure targeted evaluation by the judges.', category: 'Judging & projects' },
];
