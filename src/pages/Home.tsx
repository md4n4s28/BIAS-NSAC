import { useState, useEffect, useRef } from 'react';
import CountdownSection from '../components/CountdownSection';
import EventOverview from '../components/EventOverview';
import FAQList from '../components/FAQList';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Mail,
  MessageCircle,
  Code2,
  Atom,
  Users,
  Rocket,
  GraduationCap,
  School,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Sparkles,
  Lightbulb,
  Trophy,
  Network,
  Radio,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  Eye,
  Camera,
  Maximize2,
} from 'lucide-react';
import { ButtonLink, SectionHeading } from '../components/UI';
import { directionsUrl, gallery, officialUrl, schedule, venueMapEmbedUrl } from '../data/event';
import { questions } from '../data/quiz';
import { problemStatements } from '../data/problem-statements';

const homeNasaPreviews = [
  {
    step: 'Step 01',
    title: 'Official NASA Space Apps Portal',
    desc: 'Access official spaceappschallenge.org and complete participant registration',
    img: '/registration/nasa/1. NASA-Portal.png',
  },
  {
    step: 'Step 04',
    title: 'Haldwani Local Event Page',
    desc: 'Sign up for the local event hosted by Birla Institute of Applied Sciences',
    img: '/registration/nasa/5. Sign Up For This Local Event.png',
  },
  {
    step: 'Step 09',
    title: 'Create Team (Team Leader Only)',
    desc: 'Leader creates team name, problem challenge, and invites members',
    img: '/registration/nasa/9. Create a Team.png',
  },
  {
    step: 'Step 10',
    title: 'Join Team (Team Members)',
    desc: 'Members search for team and accept join invitations',
    img: '/registration/nasa/10. Join a Team (For Team Members).png',
  },
];

const homeBiasPreviews = [
  {
    step: 'Step 01',
    title: 'Register Team on BIAS-NSAC',
    desc: 'Team Leader creates account and initiates institutional registration',
    img: '/registration/bias/1. Click Register Team or Profile Login.png',
  },
  {
    step: 'Step 03',
    title: 'Gmail Account Verification',
    desc: 'Verify designated email address from BIAS-NSAC mailbox to activate login',
    img: '/registration/bias/3. Check Gmail for Account Verification.png',
  },
  {
    step: 'Step 05',
    title: 'Complete Team Registration Form',
    desc: 'Enter exact same member details & select participation mode',
    img: '/registration/bias/5. Fill Complete Team Form.png',
  },
  {
    step: 'Step 07',
    title: 'Download Digital ID Cards',
    desc: 'Instant generated delegate badges for all team members',
    img: '/registration/bias/7. Download Digital ID.png',
  },
];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;
  const [mobileViewport, setMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  );
  const [homeRegTab, setHomeRegTab] = useState<'nasa' | 'bias'>('nasa');
  const [homeRegPreviewIdx, setHomeRegPreviewIdx] = useState(0);
  const fullText = 'CHALLENGE 2026';
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const psGridRef = useRef<HTMLDivElement>(null);

  const scrollPsGrid = (direction: 'left' | 'right') => {
    if (psGridRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      psGridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 800px)');
    const updateViewport = () => setMobileViewport(mobileQuery.matches);
    mobileQuery.addEventListener('change', updateViewport);
    return () => mobileQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const delay = isDeleting
      ? typedText.length === 1 ? 500 : 55
      : typedText.length === fullText.length ? 1400 : 100;
    const timer = setTimeout(() => {
      if (isDeleting) {
        if (typedText.length === 1) setIsDeleting(false);
        else setTypedText(fullText.slice(0, typedText.length - 1));
      } else if (typedText.length === fullText.length) {
        setIsDeleting(true);
      } else {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [fullText, isDeleting, reduceMotion, typedText]);

  const filmstripRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'prev' | 'next') => {
    const el = filmstripRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 280);
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === 'prev') {
      if (el.scrollLeft <= 20) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft >= maxScroll - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const activeHomeList = homeRegTab === 'nasa' ? homeNasaPreviews : homeBiasPreviews;
  const currentHomePreview = activeHomeList[homeRegPreviewIdx] || activeHomeList[0];

  return (
    <div className={`home-page ${motionEnabled ? 'motion-enabled' : 'motion-paused'}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image">
          {motionEnabled && !mobileViewport ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="hero-video"
              src="/video/hero.mp4"
              poster="/img/hero-space.webp"
              preload="metadata"
            />
          ) : (
            <img
              src="/img/hero-space.webp"
              alt=""
              fetchPriority="high"
              loading="eager"
            />
          )}
        </div>
        <div className="hero-shade" />
        <div className="starfield" />
        <div className="hero-content">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8 }}
          >
            <div className="hero-kicker">
              <span className="live-dot" /> Astroverse X Birla Institute of Applied Sciences
            </div>
            <h1>
              NASA SPACE
              <br />
              APPS
              <br />
              <span className="typing-wrap" aria-label="CHALLENGE 2026">
                <span className="typing-title">{reduceMotion ? fullText : typedText}</span>
              </span>
            </h1>
            <div className="hero-description">
              <p className="hero-subtitle">Big ideas don't belong on one planet.</p>
              <p className="hero-copy">
                Turn curiosity into solutions. Three days of space science,
                <br className="desktop-only" /> collaboration, and possibilities beyond the ordinary.
              </p>
              <div className="hero-meta">
                <span>
                  <CalendarDays size={17} />
                  14–16 NOVEMBER 2026
                </span>
                <span>
                  <MapPin size={17} />
                  BHIMTAL, UTTARAKHAND
                </span>
              </div>
              <div className="hero-actions">
                <ButtonLink external to={officialUrl}>
                  VISIT OFFICIAL NASA SPACE APPS
                </ButtonLink>
                <ButtonLink secondary to="/register">
                  Register your team
                </ButtonLink>
                <ButtonLink secondary external to="https://www.spaceappschallenge.org/2026/challenges/">
                  PROBLEM STATEMENTS
                </ButtonLink>
              </div>
              <a
                className="hero-host"
                href="https://www.birlainstitute.co.in/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Birla Institute of Applied Sciences website"
              >
                HOSTED BY <span>Birla Institute of Applied Sciences</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Strip */}
      <div className="event-strip">
        <span>
          <Globe2 size={19} /> ONE PLANET. INFINITE POSSIBILITIES.
        </span>
        <span>
          <Code2 size={18} /> BUILD WITH OPEN DATA
        </span>
        <span>
          <Users size={18} /> CREATE TOGETHER
        </span>
        <span>
          <Sparkles size={18} /> THINK BEYOND THE ORDINARY
        </span>
      </div>

      {/* Countdown Section */}
      <CountdownSection />

      {/* How to Register Section */}
      <section id="how-to-register" className="section home-register-guide-section">
        <div className="home-reg-guide-container">
          <div className="home-reg-guide-header">
            <div className="section-heading">
              <span className="eyebrow"><span />OFFICIAL ONBOARDING PROTOCOL</span>
              <h2 className="home-reg-guide-title">
                <span>How to Register.</span>
                <span className="text-accent">2 Mandatory Phases.</span>
              </h2>
            </div>
            <p className="home-reg-guide-lead">
              To participate at BIAS Bhimtal and qualify for NASA global nominee awards, every team must complete registration on both the <strong>official NASA Space Apps portal</strong> and the <strong>BIAS-NSAC portal</strong> with matching roster details.
            </p>
          </div>

          <div className="home-reg-guide-grid">
            {/* Left Column: 2 Phases Summary */}
            <div className="home-reg-steps-col">
              {/* Phase 1 Tile */}
              <div className="home-reg-phase-card">
                <div className="home-reg-phase-top">
                  <span className="home-reg-phase-pill">PHASE 01 · GLOBAL ROSTER</span>
                  <span className="home-reg-portal-name">spaceappschallenge.org</span>
                </div>
                <h3 className="home-reg-phase-title">1. Official NASA Hackathon</h3>
                <ul className="home-reg-phase-list">
                  <li><strong>Account Setup:</strong> Every member creates an account on <code>spaceappschallenge.org</code>.</li>
                  <li><strong>Local Event:</strong> Search &quot;Haldwani&quot; & click &quot;Sign Up For This Local Event&quot;.</li>
                  <li><strong>Team Formation:</strong> Leader creates the team in the Teams tab; members join.</li>
                </ul>
                <div className="home-reg-phase-footer">
                  <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="home-reg-link">
                    <span>Open NASA Portal</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Phase 2 Tile */}
              <div className="home-reg-phase-card">
                <div className="home-reg-phase-top">
                  <span className="home-reg-phase-pill pill-cyan">PHASE 02 · COLLEGE VENUE</span>
                  <span className="home-reg-portal-name cyan">bias-nsac</span>
                </div>
                <h3 className="home-reg-phase-title">2. BIAS-NSAC College Portal</h3>
                <ul className="home-reg-phase-list">
                  <li><strong>Leader Signup:</strong> Team leader registers on BIAS-NSAC and verifies Gmail.</li>
                  <li><strong>Match Details:</strong> Enter exact same team name, members, and participation mode.</li>
                  <li><strong>Passes:</strong> Submit to generate digital ID cards & verify official status.</li>
                </ul>
                <div className="home-reg-phase-footer">
                  <Link to="/register" className="home-reg-link">
                    <span>Register on BIAS-NSAC</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Screenshot Reference Preview Card */}
            <div className="home-reg-player-col">
              <div className="home-reg-preview-card">
                <div className="home-preview-header">
                  <div className="home-preview-tabs">
                    <button
                      type="button"
                      className={`home-tab-pill ${homeRegTab === 'nasa' ? 'active' : ''}`}
                      onClick={() => {
                        setHomeRegTab('nasa');
                        setHomeRegPreviewIdx(0);
                      }}
                    >
                      <Globe2 size={13} />
                      <span>NASA Portal (10)</span>
                    </button>
                    <button
                      type="button"
                      className={`home-tab-pill ${homeRegTab === 'bias' ? 'active' : ''}`}
                      onClick={() => {
                        setHomeRegTab('bias');
                        setHomeRegPreviewIdx(0);
                      }}
                    >
                      <Rocket size={13} />
                      <span>BIAS-NSAC (8)</span>
                    </button>
                  </div>
                  <span className="home-preview-badge-pill">SCREENSHOTS</span>
                </div>

                <div className="home-preview-main">
                  <div className="home-preview-browser-frame">
                    <div className="home-browser-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="home-browser-url">
                      {homeRegTab === 'nasa' ? 'spaceappschallenge.org · Official Portal' : 'bias-nsac.in/portal · College Registration'}
                    </span>
                    <span className="home-browser-step-badge">{currentHomePreview.step}</span>
                  </div>

                  <Link to="/how-to-register" className="home-preview-img-container" title="Click to view complete screenshot guide">
                    <img
                      src={currentHomePreview.img}
                      alt={currentHomePreview.title}
                      loading="lazy"
                      className="home-preview-img"
                    />
                    <div className="home-preview-zoom-overlay">
                      <span className="home-preview-zoom-tag">
                        <Eye size={15} />
                        <span>View Full 21 Step Screenshots</span>
                      </span>
                    </div>
                  </Link>

                  <div className="home-preview-details">
                    <div className="home-preview-caption">
                      <h4>{currentHomePreview.title}</h4>
                      <p>{currentHomePreview.desc}</p>
                    </div>

                    {/* Miniature thumbnail reel */}
                    <div className="home-preview-thumbnails">
                      {activeHomeList.map((item, idx) => (
                        <button
                          key={item.step}
                          type="button"
                          className={`home-thumb-btn ${idx === homeRegPreviewIdx ? 'active' : ''}`}
                          onClick={() => setHomeRegPreviewIdx(idx)}
                          aria-label={`Preview ${item.step}`}
                        >
                          <img src={item.img} alt="" loading="lazy" />
                          <span>{item.step}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="home-preview-footer">
                  <Link to="/how-to-register" className="home-player-cta-link">
                    <span>Explore All 21 Step-by-Step Screenshots</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Master Call to Action Bar */}
          <div className="home-reg-guide-actions">
            <Link to="/how-to-register" className="button button-primary home-reg-full-guide-btn">
              <span>View Full Step-by-Step Guide</span>
              <ArrowRight size={17} />
            </Link>
            <span className="home-reg-note">
              <Sparkles size={14} className="text-accent" />
              <span>Interactive 21-step checklist & tabbed walkthrough</span>
            </span>
          </div>
        </div>
      </section>

      {/* Schedule Section - "3 Days" */}
      <section className="section immersive-section home-flight-plan">
        <div className="heading-row">
          <SectionHeading
            eyebrow="YOUR FLIGHT PLAN"
            title="From “what if” to what’s next."
          />
          <Link className="flight-plan-link" to="/venue-schedule">
            Full event schedule <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="flight-plan-grid">
          {schedule.map((day) => {
            const [date, month] = day.date.split(' ');

            return (
              <Link to="/venue-schedule" className="flight-plan-card" key={day.day}>
                <div className="flight-plan-card-header">
                  <div className="flight-plan-date">
                    <strong>{date}</strong>
                    <span>
                      <small>{month === 'NOV' ? 'NOVEMBER' : month}</small>
                      <small>2026</small>
                    </span>
                  </div>
                  <span className="flight-plan-day">DAY {day.day}</span>
                </div>
                <h3>{day.title}</h3>
                <ol className="flight-plan-activities">
                  {day.activities.map((activity, index) => (
                    <li key={activity}>
                      <span className="flight-plan-activity-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ol>
              </Link>
            );
          })}
        </div>

      </section>

      {/* Problem Statements Section */}
      <section id="problem-statements" className="section home-ps-section">
        <div className="home-ps-header">
          <div className="home-ps-heading-block">
            <div className="section-heading">
              <span className="eyebrow"><span />OFFICIAL 2026 CHALLENGES</span>
              <h2 className="home-ps-title-heading">
                <span className="home-ps-title-line">14 Problem Statements.</span>
                <span className="home-ps-title-line">Choose Your Mission.</span>
              </h2>
            </div>
            <p className="home-ps-lead">
              Tackle real-world challenges defined by NASA scientists and engineers.
              Explore all 14 problem statements, assemble your crew, and build either a functional hardware prototype or software application at BIAS Bhimtal.
            </p>
          </div>
          <div className="home-ps-header-cta">
            <Link to="/problem-statements" className="button button-primary home-ps-view-all-btn">
              <span>View Full Problem Statements</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Mobile Quick Rail Controls */}
        <div className="home-ps-rail-controls">
          <span className="home-ps-rail-hint">
            <Sparkles size={14} className="text-accent" />
            <span>Swipe or click arrows to browse all 14 challenges (Swipe availabe in mobile view)</span>
          </span>
          <div className="home-ps-arrow-buttons">
            <button
              type="button"
              className="home-ps-arrow-nav-btn"
              onClick={() => scrollPsGrid('left')}
              aria-label="Scroll left to previous challenges"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="home-ps-arrow-nav-btn"
              onClick={() => scrollPsGrid('right')}
              aria-label="Scroll right to next challenges"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="home-ps-grid" ref={psGridRef}>
          {problemStatements.map((ps) => {
            const primaryDiff = ps.difficulties[0] || 'Intermediate';
            const diffClass = primaryDiff.toLowerCase().includes('beginner')
              ? 'diff-beginner'
              : primaryDiff.toLowerCase().includes('advanced')
                ? 'diff-advanced'
                : 'diff-intermediate';

            return (
              <Link
                to={`/problem-statements#ps-${ps.id}`}
                key={ps.id}
                className="home-ps-tile"
                aria-label={`View challenge ${ps.id}: ${ps.title}`}
              >
                <div className="home-ps-tile-top">
                  <span className="home-ps-tile-number">PS {ps.id}</span>
                  <span className={`home-ps-diff-pill ${diffClass}`}>
                    {primaryDiff}
                  </span>
                </div>

                <h3 className="home-ps-tile-title" title={ps.title}>
                  {ps.title}
                </h3>

                <div className="home-ps-tile-subjects">
                  {ps.subjects.slice(0, 2).map((subj) => (
                    <span key={subj} className="home-ps-subj-badge">
                      #{subj}
                    </span>
                  ))}
                  {ps.subjects.length > 2 && (
                    <span className="home-ps-subj-more">+{ps.subjects.length - 2}</span>
                  )}
                </div>

                <div className="home-ps-tile-footer">
                  <span className="home-ps-tile-link-text">Read brief</span>
                  <ArrowUpRight size={14} className="home-ps-tile-arrow" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-ps-bottom-bar">
          <div className="home-ps-note">
            <Sparkles size={18} className="text-accent" />
            <span>Each team chooses 1 of the 14 challenges. Solutions built on-site can qualify for international Global Nominee judging.</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="section mission-section">
        <div className="mission-content-left">
          <div className="section-heading">
            <span className="eyebrow"><span />OUR SHARED MISSION</span>
            <h2 className="mission-main-heading">
              <span>A global challenge.</span>
              <span>A local community.</span>
            </h2>
          </div>

          <p className="mission-lead-text">
            The NASA International Space Apps Challenge is the world&apos;s premier hackathon, uniting coders, scientists, designers, and space enthusiasts to solve real-world challenges using open NASA space assets.
          </p>

          <div className="mission-host-callout">
            <div className="mission-host-tag">
              <Sparkles size={14} className="text-accent" />
              <span>ASTROVERSE // LOCAL EDITION</span>
            </div>
            <p className="mission-host-desc">
              Hosted on the scenic mountain campus of <strong>Birla Institute of Applied Sciences (BIAS)</strong> in Bhimtal, Uttarakhand from <strong>14–16 November 2026</strong>.
            </p>
          </div>

          <div className="mission-telemetry-chips">
            <div className="mission-chip">
              <span className="mission-chip-val">36 HRS</span>
              <span className="mission-chip-lbl">Sprint Hackathon</span>
            </div>
            <div className="mission-chip">
              <span className="mission-chip-val">OPEN DATA</span>
              <span className="mission-chip-lbl">NASA Space Assets</span>
            </div>
            <div className="mission-chip">
              <span className="mission-chip-val">HYBRID</span>
              <span className="mission-chip-lbl">On-Campus & Online</span>
            </div>
          </div>

          <div className="mission-actions-row">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary mission-official-btn"
            >
              <span>Official NASA Space Apps Hub</span>
              <ArrowUpRight size={17} />
            </a>
            <Link to="/venue" className="button button-secondary mission-venue-btn">
              <MapPin size={16} />
              <span>Campus & Travel Guide</span>
            </Link>
          </div>
        </div>

        {/* Observatory Map Console Panel */}
        <div className="observatory-console-panel">
          <div className="observatory-card-header">
            <div className="observatory-status-pill">
              <span className="radar-ping-dot" />
              <span>LIVE GROUND STATION</span>
            </div>
            <span className="observatory-telemetry-tag">
              29.3567° N, 79.5541° E
            </span>
          </div>

          <div className="observatory-identity">
            <span className="observatory-subhead">NASA SPACE APPS CHALLENGE 2026 VENUE</span>
            <h3 className="observatory-city-title">BHIMTAL, UTTARAKHAND</h3>
            <span className="observatory-institution">Birla Institute of Applied Sciences</span>
            <span className="observatory-date-badge">
              <CalendarDays size={14} /> 14–16 NOVEMBER 2026
            </span>
          </div>

          {/* High-Tech Map Frame */}
          <div className="observatory-map-frame">
            <iframe
              className="observatory-map-embed"
              title="Map locating Birla Institute of Applied Sciences, Bhimtal"
              src={venueMapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="observatory-map-overlay">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="observatory-open-maps-btn"
                aria-label="Open location in Google Maps"
              >
                <MapPin size={14} />
                <span>Get Directions in Maps</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Observatory Venue Specs - Using span instead of strong */}
          <div className="observatory-specs-grid">
            <div className="observatory-spec-item">
              <span className="spec-label">ALTITUDE</span>
              <span className="spec-value">1,370 m (4,495 ft)</span>
            </div>
            <div className="observatory-spec-item">
              <span className="spec-label">CAMPUS FACILITIES</span>
              <span className="spec-value">Labs & Fast WiFi</span>
            </div>
            <div className="observatory-spec-item">
              <span className="spec-label">ACCOMMODATION</span>
              <span className="spec-value">For Shortlisted Teams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="section perspective-section immersive-section">
        <div className="perspective-heading">
          <SectionHeading
            eyebrow="MORE THAN A HACKATHON"
            title="Three days. A whole new perspective."
          />
          <Link className="perspective-link" to="/why-participate">
            <span>Why participate?</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="perspective-mobile-hint">
          <Sparkles size={14} className="text-accent" />
          <span>Swipe to explore all 4 pillars</span>
        </div>

        <div className="perspective-grid">
          {[
            {
              pillar: '01',
              phase: 'ACCREDITATION',
              accent: 'gold',
              icon: Trophy,
              label: 'Official Recognition',
              title: 'NASA Certification',
              text: 'Every registered, active participant receives an official NASA Space Apps Certificate of Participation. Top winning teams are awarded physical mementos and certificates.',
              linkText: 'Certificate details',
              to: '/certification',
            },
            {
              pillar: '02',
              phase: 'PERKS & SWAG',
              accent: 'cyan',
              icon: Sparkles,
              label: 'Participant Perks',
              title: 'Exclusive Keepsakes',
              text: 'Receive specialized hackathon badges, digital badges, curated event perks, and commemorative memorabilia designed for the 2026 Bhimtal cohort.',
              linkText: 'Event highlights',
              to: '/highlights',
            },
            {
              pillar: '03',
              phase: 'CHALLENGES',
              accent: 'purple',
              icon: Atom,
              label: 'Space Science',
              title: 'Follow Your Curiosity',
              text: 'Choose from 14 real-world challenges set by NASA scientists. Access open satellite telemetry, planetary imagery, and APIs to develop hardware or software solutions.',
              linkText: 'Browse 14 Challenges',
              to: '/problem-statements',
            },
            {
              pillar: '04',
              phase: 'COMMUNITY',
              accent: 'emerald',
              icon: Users,
              label: 'Networking & Mentors',
              title: 'Connect & Collaborate',
              text: 'Team up with talented peers, receive one-on-one guidance from domain mentors, and present your prototype to an esteemed academic and industry jury panel.',
              linkText: 'Participant guide',
              to: '/why-participate',
            },
          ].map((item) => (
            <article className={`perspective-card perspective-pillar-${item.accent}`} key={item.pillar}>
              <div className="perspective-card-top">
                <div className="perspective-icon-box">
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <span className="perspective-pillar-tag">PILLAR {item.pillar} // {item.phase}</span>
              </div>

              <div className="perspective-card-body">
                <span className="perspective-label">{item.label}</span>
                <h3 className="perspective-card-title">{item.title}</h3>
                <p className="perspective-card-text">{item.text}</p>
              </div>

              <div className="perspective-card-footer">
                <Link className="perspective-action-link" to={item.to}>
                  <span>{item.linkText}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quiz Banner */}
      <section className="quiz-banner section">
        <div className="quiz-invitation">
          <div className="quiz-live-badge">
            <span className="quiz-pulse-dot" />
            <span>INTERACTIVE CHALLENGE · {questions.length} MISSIONS</span>
          </div>

          <h2>
            A curious mind.
            <br />
            <span className="quiz-gold-gradient">A cosmic challenge.</span>
          </h2>

          <p>
            From planetary rings and black hole physics to rocket flight staging and mission milestones, discover how well you know the universe. Just you and your cosmic curiosity.
          </p>

          <div className="quiz-chips-row">
            <span className="quiz-chip">🪐 5 Question Formats</span>
            <span className="quiz-chip">⏱️ Live Flight Timer</span>
            <span className="quiz-chip">🎖️ Official Ranks</span>
          </div>

          <div className="quiz-action-wrapper">
            <ButtonLink to="/quiz" className="quiz-launch-btn">
              <span>INITIATE MISSION</span>
            </ButtonLink>
            <span className="quiz-access-note">
              <CheckCircle2 size={13} />
              <span>No login required · 5–7 min mission time · Instant debrief</span>
            </span>
          </div>
        </div>

        <div className="quiz-brief">
          <div className="quiz-brief-top-bar">
            <div className="quiz-telemetry-status">
              <span className="quiz-telemetry-dot" />
              <span>TELEMETRY: ACTIVE</span>
            </div>
            <span className="quiz-brief-tag">NASA FLIGHT TEST</span>
          </div>

          <div className="quiz-brief-hero">
            <div className="quiz-brief-number-box">
              <strong className="quiz-big-num">{questions.length}</strong>
              <div className="quiz-num-caption">
                <span className="quiz-num-title">MISSIONS</span>
                <span className="quiz-num-sub">Multi-Format Challenges</span>
              </div>
            </div>
            <div className="quiz-brief-icon-orbital">
              <Rocket size={24} strokeWidth={1.75} aria-hidden="true" />
            </div>
          </div>

          <div className="quiz-format-pills">
            <span>MCQ</span>
            <span>Fact vs Myth</span>
            <span>Sequences</span>
            <span>Matching</span>
          </div>

          <div className="quiz-brief-features">
            <div className="quiz-brief-row">
              <div className="quiz-row-icon-wrap">
                <Atom size={16} aria-hidden="true" />
              </div>
              <div className="quiz-row-content">
                <strong>Astrophysics & Exploration</strong>
                <small>James Webb, black holes, ocean worlds & Saturn rings</small>
              </div>
            </div>

            <div className="quiz-brief-row">
              <div className="quiz-row-icon-wrap">
                <Clock size={16} aria-hidden="true" />
              </div>
              <div className="quiz-row-content">
                <strong>Precision Mission Clock</strong>
                <small>Real-time telemetry stopwatch tracking your flight pace</small>
              </div>
            </div>

            <div className="quiz-brief-row">
              <div className="quiz-row-icon-wrap">
                <Award size={16} aria-hidden="true" />
              </div>
              <div className="quiz-row-content">
                <strong>Astronautical Rank & Debrief</strong>
                <small>Earn rank from Cadet to Flight Commander with scientific insights</small>
              </div>
            </div>
          </div>

          <div className="quiz-brief-footer">
            <span>FLIGHT SECTOR: DEEP SPACE</span>
            <span>TIERS: CADET &rarr; COMMANDER</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories immersive-section">
        <SectionHeading
          eyebrow="THINK. SOLVE. INNOVATE."
          title="CHALLENGE YOUR MIND"
        >
          Different starting points. The same limitless curiosity.
        </SectionHeading>
        <div className="category-grid">
          <Link to="/school" className="category-card">
            <div className="category-content">
              <div className="category-icon-box">
                <School size={28} />
              </div>
              <span className="micro-label">FOR THE NEXT GENERATION</span>
              <h3>School Category</h3>
              <p>Put your curiosity to work with science, logic, creativity and teamwork.</p>
              <span className="arrow-link">
                Find your starting point <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="category-orbit-visual" aria-hidden="true">
              <span className="category-orbit-halo" />
              <span className="category-orbit-ring category-orbit-ring-one" />
              <span className="category-orbit-ring category-orbit-ring-two" />
              <span className="category-orbit-core"><Sparkles size={22} strokeWidth={1.4} /></span>
              <span className="category-orbit-node category-orbit-node-one"><Globe2 size={14} /></span>
              <span className="category-orbit-node category-orbit-node-two"><Lightbulb size={14} /></span>
              <span className="category-orbit-node category-orbit-node-three"><Users size={14} /></span>
              <span className="category-orbit-star category-orbit-star-one" />
              <span className="category-orbit-star category-orbit-star-two" />
              <span className="category-orbit-star category-orbit-star-three" />
            </div>
          </Link>
          <Link to="/college" className="category-card college">
            <div className="category-content">
              <div className="category-icon-box">
                <GraduationCap size={28} />
              </div>
              <span className="micro-label">FOR TOMORROW'S PROBLEM-SOLVERS</span>
              <h3>College Category</h3>
              <p>Turn technical skills and bold ideas into real-world solutions.</p>
              <span className="arrow-link">
                Build your next big idea <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="category-orbit-visual category-orbit-college" aria-hidden="true">
              <span className="category-orbit-halo" />
              <span className="category-orbit-ring category-orbit-ring-one" />
              <span className="category-orbit-ring category-orbit-ring-two" />
              <span className="category-orbit-ring category-orbit-ring-three" />
              <span className="category-orbit-core"><Atom size={24} strokeWidth={1.4} /></span>
              <span className="category-orbit-node category-orbit-node-one"><Code2 size={14} /></span>
              <span className="category-orbit-node category-orbit-node-two"><Rocket size={14} /></span>
              <span className="category-orbit-node category-orbit-node-three"><Globe2 size={14} /></span>
              <span className="category-orbit-star category-orbit-star-one" />
              <span className="category-orbit-star category-orbit-star-two" />
              <span className="category-orbit-star category-orbit-star-three" />
            </div>
          </Link>
        </div>
      </section>

      {/* Scroll Gallery */}
      <section className="section home-gallery immersive-section">
        <div className="home-gallery-heading">
          <div className="home-gallery-title">
            <span className="eyebrow"><span />REAL PEOPLE. REAL POSSIBILITIES.</span>
            <h2>A glimpse of the journey.</h2>
          </div>
          <Link className="button gallery-view-button" to="/gallery">
            View event gallery <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="gallery-media-grid">
          <div className="gallery-filmstrip-wrapper">
            <button
              type="button"
              className="gallery-nav-btn gallery-nav-prev"
              onClick={() => handleScroll('prev')}
              aria-label="Previous photos in gallery reel"
              title="Previous photos"
            >
              <ChevronLeft size={22} strokeWidth={2.2} />
            </button>
            <div
              className="gallery-filmstrip"
              ref={filmstripRef}
              role="region"
              aria-label="Event photo filmstrip"
              tabIndex={0}
            >
              <div className="gallery-filmstrip-track">
                {gallery.map((image) => (
                  <figure className="gallery-film-frame" key={image.src}>
                    <img src={image.src} alt={image.caption} loading="lazy" />
                  </figure>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="gallery-nav-btn gallery-nav-next"
              onClick={() => handleScroll('next')}
              aria-label="Next photos in gallery reel"
              title="Next photos"
            >
              <ChevronRight size={22} strokeWidth={2.2} />
            </button>
          </div>
          <figure className="gallery-promo">
            <video
              src="/video/event-promo.mp4"
              poster={gallery[0].src}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="ASTROVERSE event promotional video"
            />
          </figure>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="organizer-section section immersive-section">
        <div className="organizer-orbit">
          <img
            className="organizer-logo"
            src="/img/my-logo.png.png"
            alt="Birla Institute of Applied Sciences logo"
            loading="lazy"
          />
        </div>
        <div>
          <span className="eyebrow">
            <span />
            ORGANISED BY
          </span>
          <h2>
            Birla Institute of
            <br />
            Applied Sciences
          </h2>
          <p>Bhimtal, Uttarakhand, India</p>
          <Link to="/venue" className="button button-secondary organizer-link">
            A remarkable setting for remarkable ideas <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="organizer-radar-visual" aria-hidden="true">
          <div className="radar-casing" />
          <div className="radar-ring radar-ring-3" />
          <div className="radar-ring radar-ring-2" />
          <div className="radar-ring radar-ring-1" />
          <div className="radar-axis radar-axis-h" />
          <div className="radar-axis radar-axis-v" />
          <div className="radar-sweep" />

          <div className="radar-blip blip-1">
            <span className="blip-dot" />
            <span className="blip-ring" />
            <span className="blip-tag">NSAC</span>
          </div>
          <div className="radar-blip blip-2">
            <span className="blip-dot" />
            <span className="blip-ring" />
            <span className="blip-tag">BIAS</span>
          </div>
          <div className="radar-blip blip-3">
            <span className="blip-dot" />
            <span className="blip-ring" />
          </div>

          <div className="radar-center-beacon">
            <span className="beacon-wave wave-1" />
            <span className="beacon-wave wave-2" />
            <div className="beacon-core">
              <Radio size={20} />
            </div>
          </div>

          <span className="radar-cardinal cardinal-n">000°</span>
          <span className="radar-cardinal cardinal-e">090°</span>
          <span className="radar-cardinal cardinal-s">180°</span>
          <span className="radar-cardinal cardinal-w">270°</span>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section home-faq immersive-section">
        <SectionHeading eyebrow="MISSION BRIEFING" title="Good questions. Clear answers.">
          Quick answers to help you prepare for the local event.
        </SectionHeading>
        <FAQList />
      </section>

      <section id="contact" className="section home-contact immersive-section">
        <div className="home-contact-heading">
          <SectionHeading eyebrow="WE'RE HERE TO HELP" title="Need a hand? Talk to the organizers.">
            Questions about registration or the event? Reach out through one of the organizer contact channels.
          </SectionHeading>
        </div>
        <div className="home-contact-grid">
          <article className="home-contact-card">
            <div className="home-contact-card-heading">
              <MessageCircle size={21} aria-hidden="true" />
              <div>
                <span className="micro-label">WHATSAPP · INDIA</span>
                <h3>Message the team</h3>
              </div>
            </div>
            <p>Organizer WhatsApp contact details will be announced here when confirmed.</p>
            <span className="contact-card-note">No contact number has been published yet.</span>
          </article>
          <article className="home-contact-card">
            <div className="home-contact-card-heading">
              <Mail size={21} aria-hidden="true" />
              <div>
                <span className="micro-label">EMAIL</span>
                <h3>Send us an email</h3>
              </div>
            </div>
            <p>For event and registration questions.</p>
            <strong className="contact-email-placeholder">Organizer email to be announced</strong>
            <span className="contact-card-note">No event email has been published yet.</span>
          </article>
          <article className="home-contact-card home-contact-event">
            <div className="home-contact-card-heading">
              <MapPin size={21} aria-hidden="true" />
              <div>
                <span className="micro-label">EVENT INFORMATION</span>
                <h3>Find us in Bhimtal</h3>
              </div>
            </div>
            <p>ASTROVERSE · NASA International Space Apps Challenge 2026</p>
            <strong>Birla Institute of Applied Sciences</strong>
            <span>Bhimtal, Uttarakhand, India</span>
            <span className="home-contact-event-date">14–16 November 2026</span>
            <a className="home-contact-directions" href={directionsUrl} target="_blank" rel="noreferrer">
              View directions <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section final-cta immersive-section">
        <div className="final-cta-copy">
          <span className="eyebrow">
            <span />
            THE NEXT CHAPTER STARTS WITH YOU
          </span>
          <h2>
            Your mind is the
            <br />
            <em>most powerful spacecraft.</em>
          </h2>
          <p>Bring your ideas. Find your team. Make your mark.</p>
          <div className="final-cta-actions">
            <ButtonLink to="/register">Join the mission</ButtonLink>
            <Link to="/why-participate" className="arrow-link">
              Why participate? <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="final-cta-orbit" aria-hidden="true">
          <span className="final-cta-orbit-ring" />
          <span className="final-cta-orbit-core"><Rocket className="final-cta-rocket" size={38} strokeWidth={1.15} /></span>
          <span className="final-cta-orbit-label">YOUR NEXT<br />MISSION</span>
        </div>
      </section>
    </div>
  );
}
