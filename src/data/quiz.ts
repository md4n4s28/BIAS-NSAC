export type QuestionType = 'single' | 'boolean' | 'multi' | 'sequence' | 'match';

export type QuestionCategory =
  | 'Astrophysics'
  | 'Solar System'
  | 'Space Exploration'
  | 'Cosmology'
  | 'Rocket Science'
  | 'Deep Space';

export type DifficultyLevel = 'Cadet' | 'Specialist' | 'Commander';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  question: string;
  hint: string;
  explanation: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  answer: number; // 0-based index
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  statement: string;
  answer: boolean; // true = Fact, false = Myth
  factLabel?: string;
  mythLabel?: string;
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi';
  options: string[];
  answer: number[]; // array of correct indices
  instruction?: string;
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  items: string[]; // initial items
  correctOrder: string[]; // expected sequence
  instruction?: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  pairs: MatchPair[];
  instruction?: string;
}

export type QuizQuestion =
  | SingleChoiceQuestion
  | BooleanQuestion
  | MultiSelectQuestion
  | SequenceQuestion
  | MatchQuestion;

export type UserAnswerValue =
  | number // single option index
  | boolean // true/false
  | number[] // multi-choice indices
  | string[] // sequence of items
  | Record<string, string> // match pairs (left -> right)
  | null;

export const questions: QuizQuestion[] = [
  {
    id: 'q1-saturn',
    type: 'single',
    category: 'Solar System',
    difficulty: 'Cadet',
    question: 'Which planet in our solar system features the most expansive and brilliant ring system?',
    options: ['Jupiter', 'Mars', 'Saturn', 'Neptune'],
    answer: 2,
    hint: 'This gas giant would float in water if you had a bathtub big enough for it.',
    explanation:
      'Saturn’s rings span up to 282,000 kilometers across yet are astonishingly thin—averaging only about 10 to 30 meters thick—composed of billions of ice, rock, and dust particles.',
  },
  {
    id: 'q2-sun-color',
    type: 'boolean',
    category: 'Solar System',
    difficulty: 'Cadet',
    question: 'Cosmic Fact or Space Myth?',
    statement: 'The Sun is physically yellow in color when viewed from outer space.',
    answer: false, // Myth
    factLabel: 'Cosmic Fact',
    mythLabel: 'Space Myth',
    hint: 'Think about all the colors of light coming from solar rays before they hit Earth’s atmosphere.',
    explanation:
      'Myth! The Sun emits light across all visible wavelengths with near-equal intensity, making it pure white in space. Earth’s atmosphere scatters shorter blue wavelengths (Rayleigh scattering), giving the Sun a golden or yellow hue when viewed from the ground.',
  },
  {
    id: 'q3-jwst-orbit',
    type: 'single',
    category: 'Space Exploration',
    difficulty: 'Specialist',
    question: 'Where is the James Webb Space Telescope (JWST) positioned to observe the early universe in deep infrared?',
    options: [
      'Low Earth Orbit (550 km altitude)',
      'The Moon’s South Pole Shackleton Crater',
      'Sun-Earth Lagrange Point 2 (L2, 1.5M km away)',
      'Geostationary Transfer Orbit (36,000 km)',
    ],
    answer: 2,
    hint: 'It orbits a gravitational balance point on the night side of Earth.',
    explanation:
      'JWST operates in a halo orbit around the second Sun-Earth Lagrange point (L2), roughly 1.5 million kilometers behind Earth. This keeps the Sun, Earth, and Moon aligned behind its tennis-court-sized sunshield, keeping its detectors chilled to -233°C (-388°F).',
  },
  {
    id: 'q4-distance-sequence',
    type: 'sequence',
    category: 'Solar System',
    difficulty: 'Cadet',
    question: 'Cosmic Orbit Sequencing',
    instruction: 'Arrange these celestial regions and bodies in order of increasing distance from the Sun (closest to farthest).',
    items: ['Jupiter', 'Mercury', 'Kuiper Belt (Pluto orbit)', 'Earth'],
    correctOrder: ['Mercury', 'Earth', 'Jupiter', 'Kuiper Belt (Pluto orbit)'],
    hint: 'Start with the sun-baked smallest planet and journey out to the icy frontier.',
    explanation:
      'Mercury is nearest to the Sun at ~0.39 AU (58 million km), Earth rests in the habitable zone at 1.0 AU (150 million km), Jupiter rules the gas giants at ~5.2 AU, and the icy Kuiper Belt extends from 30 AU out past 50 AU.',
  },
  {
    id: 'q5-terrestrial-multi',
    type: 'multi',
    category: 'Solar System',
    difficulty: 'Cadet',
    question: 'Which of the following are terrestrial (rocky) planets with solid silicate or metallic surfaces?',
    options: ['Mercury', 'Jupiter', 'Mars', 'Venus', 'Saturn', 'Uranus'],
    answer: [0, 2, 3], // Mercury, Mars, Venus
    instruction: 'Select all 3 terrestrial planets',
    hint: 'Exclude the gas giants and ice giants that lack a solid landing surface.',
    explanation:
      'The four inner terrestrial planets of our solar system are Mercury, Venus, Earth, and Mars. Jupiter and Saturn are gas giants, while Uranus and Neptune are ice giants with thick fluid envelopes rather than solid crusts.',
  },
  {
    id: 'q6-black-hole-dilation',
    type: 'single',
    category: 'Astrophysics',
    difficulty: 'Commander',
    question: 'According to General Relativity, what happens to time on a spacecraft as it nears a black hole’s event horizon, as viewed by a distant observer?',
    options: [
      'Time accelerates exponentially toward infinite speed',
      'Time slows down asymptotically until the craft appears frozen at the horizon',
      'Time reverses and runs backward into negative entropy',
      'Time flows at the exact same invariant rate everywhere in the universe',
    ],
    answer: 1,
    hint: 'Think about gravitational time dilation near extreme mass curvature.',
    explanation:
      'Due to gravitational time dilation, an outside observer watches the falling craft’s clock tick ever more slowly. Light emitted by the craft becomes redshifted to infinity, making the spacecraft appear to freeze and fade away at the event horizon without ever being seen crossing it.',
  },
  {
    id: 'q7-venus-day',
    type: 'boolean',
    category: 'Solar System',
    difficulty: 'Specialist',
    question: 'Cosmic Fact or Space Myth?',
    statement: 'A single planetary day on Venus is longer than a full Venusian year.',
    answer: true, // Fact
    factLabel: 'True Cosmic Fact',
    mythLabel: 'False Space Myth',
    hint: 'Venus rotates in reverse (retrograde) at an astonishingly sluggish rate.',
    explanation:
      'Fact! Venus has the slowest rotation of any planet in our Solar System. It takes 243 Earth days to complete just one rotation on its axis, but only 225 Earth days to complete a full orbit around the Sun. Thus, its sidereal day is longer than its orbital year!',
  },
  {
    id: 'q8-missions-match',
    type: 'match',
    category: 'Space Exploration',
    difficulty: 'Specialist',
    question: 'Mission Milestone Matching',
    instruction: 'Match each historic space exploration mission to its groundbreaking discovery or feat.',
    pairs: [
      { left: 'Apollo 11', right: 'First human landing and footsteps on the Moon (1969)' },
      { left: 'Voyager 1', right: 'First human-made craft to cross into interstellar space' },
      { left: 'Curiosity Rover', right: 'Uncovered evidence of ancient habitable freshwater lakes on Mars' },
      { left: 'Cassini-Huygens', right: 'Sampled water plumes erupting from Saturn’s moon Enceladus' },
    ],
    hint: 'Consider the iconic achievements of lunar exploration, outer-planet probes, and Martian rovers.',
    explanation:
      'Apollo 11 made history on July 20, 1969; Voyager 1 crossed the heliopause into interstellar space in 2012; Curiosity discovered clay minerals confirming wet Martian history in Gale Crater; and Cassini revealed ocean geysers at Enceladus.',
  },
  {
    id: 'q9-ocean-worlds-multi',
    type: 'multi',
    category: 'Deep Space',
    difficulty: 'Commander',
    question: 'Which of these planetary bodies are confirmed or strongly indicated to harbor subsurface liquid oceans beneath icy crusts?',
    options: [
      'Europa (Moon of Jupiter)',
      'Enceladus (Moon of Saturn)',
      'Earth’s Moon',
      'Ganymede (Moon of Jupiter)',
      'Mercury',
    ],
    answer: [0, 1, 3], // Europa, Enceladus, Ganymede
    instruction: 'Select all 3 icy ocean worlds',
    hint: 'Look for moons orbiting gas giants whose interiors are kept liquid by intense tidal flexing.',
    explanation:
      'Europa, Enceladus, and Ganymede (the solar system’s largest moon) harbor internal saltwater oceans warmed by tidal friction and radioactive decay. Europa’s ocean is estimated to hold more than twice the liquid water of all Earth’s oceans combined!',
  },
  {
    id: 'q10-rocket-sequence',
    type: 'sequence',
    category: 'Rocket Science',
    difficulty: 'Commander',
    question: 'Orbital Flight Sequence',
    instruction: 'Arrange the sequence of primary milestones for a multi-stage orbital rocket launch from pad to orbit.',
    items: [
      'Max Q (Maximum Dynamic Pressure)',
      'Main Engine Ignition & Pad Liftoff',
      'Second Stage Engine Cutoff (SECO) & Orbital Insertion',
      'Main Engine Cutoff (MECO) & Stage 1 Separation',
    ],
    correctOrder: [
      'Main Engine Ignition & Pad Liftoff',
      'Max Q (Maximum Dynamic Pressure)',
      'Main Engine Cutoff (MECO) & Stage 1 Separation',
      'Second Stage Engine Cutoff (SECO) & Orbital Insertion',
    ],
    hint: 'Start with ignition, pass atmospheric aerodynamic stress, jettison the booster, then achieve orbital velocity.',
    explanation:
      'First the booster engines roar to life at T-0 for liftoff. Roughly 60–80 seconds in, the rocket encounters Max Q where atmospheric structural stresses peak. Once the first stage runs low on propellant, MECO occurs and it separates. The upper stage then burns to final velocity, shutting down at SECO in orbit.',
  },
  {
    id: 'q11-microgravity-myth',
    type: 'boolean',
    category: 'Rocket Science',
    difficulty: 'Specialist',
    question: 'Cosmic Fact or Space Myth?',
    statement: 'Astronauts on the International Space Station float because there is zero gravity at that altitude.',
    answer: false, // Myth
    factLabel: 'True Fact',
    mythLabel: 'Space Myth',
    hint: 'The ISS orbits at only ~400 km above Earth’s surface. Does Earth’s gravitational field disappear there?',
    explanation:
      'Myth! At 400 km altitude, Earth’s gravity is still roughly 90% as strong as it is on the ground! Astronauts float because the ISS travels sideways at 27,600 km/h (17,150 mph)—falling toward Earth at the exact same rate the planet curves away. It is continuous free-fall, known as microgravity.',
  },
  {
    id: 'q12-dark-energy',
    type: 'single',
    category: 'Cosmology',
    difficulty: 'Commander',
    question: 'What mysterious component accounts for approximately 68% of the total energy-matter budget of the universe and drives its accelerated expansion?',
    options: ['Baryonic (Normal) Matter', 'Dark Energy', 'Cold Dark Matter', 'Cosmic Microwave Background Radiation'],
    answer: 1,
    hint: 'It acts as an anti-gravitational repulsive pressure across empty cosmic space.',
    explanation:
      'According to the standard Lambda-CDM cosmological model, Dark Energy comprises roughly 68.3% of the universe, Dark Matter makes up 26.8%, and all the atoms making up stars, planets, and humans constitute only 4.9% of existence.',
  },
];

export function checkAnswer(question: QuizQuestion, answer: UserAnswerValue): boolean {
  if (answer === null || answer === undefined) return false;

  switch (question.type) {
    case 'single':
      return typeof answer === 'number' && answer === question.answer;

    case 'boolean':
      return typeof answer === 'boolean' && answer === question.answer;

    case 'multi': {
      if (!Array.isArray(answer)) return false;
      const sortedUser = [...answer].sort((a, b) => a - b);
      const sortedAns = [...question.answer].sort((a, b) => a - b);
      if (sortedUser.length !== sortedAns.length) return false;
      return sortedUser.every((val, idx) => val === sortedAns[idx]);
    }

    case 'sequence': {
      if (!Array.isArray(answer)) return false;
      if (answer.length !== question.correctOrder.length) return false;
      return answer.every((val, idx) => val === question.correctOrder[idx]);
    }

    case 'match': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      const matchMap = answer as Record<string, string>;
      return question.pairs.every((pair) => matchMap[pair.left] === pair.right);
    }

    default:
      return false;
  }
}

export function isAnswered(question: QuizQuestion, answer: UserAnswerValue): boolean {
  if (answer === null || answer === undefined) return false;

  switch (question.type) {
    case 'single':
      return typeof answer === 'number';

    case 'boolean':
      return typeof answer === 'boolean';

    case 'multi':
      return Array.isArray(answer) && answer.length > 0;

    case 'sequence':
      return Array.isArray(answer) && answer.length === question.correctOrder.length;

    case 'match': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      const matchMap = answer as Record<string, string>;
      return question.pairs.every((pair) => !!matchMap[pair.left]);
    }

    default:
      return false;
  }
}
