import { useState, useEffect } from 'react';
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
  Globe2,
  Sparkles,
  Lightbulb,
  Trophy,
  Network,
  Radio,
} from 'lucide-react';
import { ButtonLink, SectionHeading } from '../components/UI';
import { directionsUrl, gallery, officialUrl, schedule, venueMapEmbedUrl } from '../data/event';
import { questions } from '../data/quiz';

export default function Home() {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;
  const [mobileViewport, setMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  );
  const fullText = 'CHALLENGE 2026';
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
        <p className="flight-plan-note">
          <CalendarDays size={16} aria-hidden="true" />
          Sequence shown for planning. Session details and times remain subject to organizer
          confirmation.
        </p>
      </section>

      {/* Mission Section */}
      <section id="mission" className="section mission-section immersive-section">
        <div>
          <SectionHeading
            eyebrow="OUR SHARED MISSION"
            title={'A global challenge.\nA local community.'}
          />
          <EventOverview />
        </div>
        <div className="event-coordinate">
          <span className="micro-label">NASA INTERNATIONAL SPACE APPS CHALLENGE 2026</span>
          <strong>BHIMTAL</strong>
          <span>14–16 NOVEMBER 2026</span>
          <span>Birla Institute of Applied Sciences</span>
          <iframe
            className="event-coordinate-map"
            title="Mini map locating Birla Institute of Applied Sciences, Bhimtal"
            src={venueMapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
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
            Why participate? <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="perspective-grid">
          {[
            {
              icon: Trophy,
              number: '01 / RECOGNITION',
              label: 'Participation & recognition',
              title: 'CERTIFICATION',
              text: 'See certificate eligibility and complete both event registrations.',
              to: '/certification',
            },
            {
              icon: Sparkles,
              number: '02 / PERKS',
              label: 'Event perks & keepsakes',
              title: 'GOODIES',
              text: 'Any event keepsakes or participant perks are subject to organizer confirmation.',
            },
            {
              icon: Atom,
              number: '03 / EXPLORE',
              label: 'Space science & exploration',
              title: 'FOLLOW YOUR CURIOSITY',
              text: 'Explore new ideas, connect the dots, and turn your curiosity about space into something real.',
            },
            {
              icon: Network,
              number: '04 / CONNECT',
              label: 'Teamwork & networking',
              title: 'CONNECT & COMMUNICATE',
              text: 'Share ideas, communicate clearly, meet new people, and build connections through the event.',
            },
          ].map((item) => (
            <article className="perspective-card" key={item.number}>
              <div className="perspective-card-top">
                <item.icon size={27} aria-hidden="true" />
                <span>{item.number}</span>
              </div>
              <div>
                <span className="perspective-label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.to && (
                  <Link className="arrow-link certificate-card-link" to={item.to}>
                    Certificate details <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quiz Banner */}
      <section className="quiz-banner section">
        <div className="quiz-invitation">
          <span className="eyebrow">
            <span />A LITTLE CURIOSITY GOES A LONG WAY
          </span>
          <h2>
            A curious mind.
            <br />
            <em>A cosmic challenge.</em>
          </h2>
          <p>
            From planetary rings to rocket science, discover how well you know the universe. Just
            you and your curiosity.
          </p>
          <ButtonLink to="/quiz">Take the space quiz</ButtonLink>
          <span className="quiz-access-note">No registration needed. Explore at your own pace.</span>
        </div>
        <div className="quiz-brief">
          <div className="quiz-brief-heading">
            <span className="micro-label">YOUR MISSION BRIEF</span>
            <Rocket size={25} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="quiz-question-count">
            <strong>{questions.length}</strong>
            <span>
              questions.
              <br />
              One universe to explore.
            </span>
          </div>
          <div className="quiz-brief-row">
            <Atom size={20} aria-hidden="true" />
            <span>Space, science & discovery</span>
          </div>
          <div className="quiz-brief-row">
            <Lightbulb size={20} aria-hidden="true" />
            <span>Learn something with every answer</span>
          </div>
          <div className="quiz-brief-row">
            <Sparkles size={20} aria-hidden="true" />
            <span>Instant results, endless curiosity</span>
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
          <div className="gallery-filmstrip" role="region" aria-label="Event photo filmstrip" tabIndex={0}>
            <div className="gallery-filmstrip-track">
              {gallery.map((image) => (
                <figure className="gallery-film-frame" key={image.src}>
                  <img src={image.src} alt={image.caption} loading="lazy" />
                </figure>
              ))}
            </div>
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
