import FAQList from '../components/FAQList';
import { useState } from 'react';
import {
  Code2,
  Lightbulb,
  Atom,
  Cpu,
  Users,
  MessageCircle,
  Wrench,
  Target,
  Presentation,
  Network,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Download,
  Mail,
  Phone,
  Send,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ButtonLink, Notice, PageIntro } from '../components/UI';
import { detailedSchedule, directionsUrl, itineraryPdfUrl, officialRegistrationUrl, officialUrl, organizerContacts, schedule, venueMapEmbedUrl } from '../data/event';

export function About() {
  return (
    <main className="page about-page">
      <PageIntro eyebrow="ABOUT ASTROVERSE" title="A global challenge. A local community.">
        NASA International Space Apps Challenge brings people together to explore
        real-world questions through science, creativity and open data. ASTROVERSE
        is the local event identity for the Bhimtal gathering.
      </PageIntro>

      <section className="about-event-banner" aria-label="Local event details">
        <div className="about-event-banner-copy">
          <span className="eyebrow">THE LOCAL GATHERING</span>
          <h2>Three days to explore, create and collaborate.</h2>
          <p>
            The local programme is scheduled for 14–16 November 2026 at Birla
            Institute of Applied Sciences in Bhimtal, Uttarakhand.
          </p>
        </div>
        <div className="about-event-facts">
          <div><CalendarDays size={19} aria-hidden="true" /><span><small>DATES</small><strong>14–16 November 2026</strong></span></div>
          <div><MapPin size={19} aria-hidden="true" /><span><small>LOCATION</small><strong>Bhimtal, Uttarakhand, India</strong></span></div>
        </div>
      </section>

      <section className="about-context" aria-label="About the global challenge and local event">
        <article className="about-context-card">
          <span className="about-card-index">01 / THE GLOBAL CHALLENGE</span>
          <div className="about-card-icon"><Atom size={22} aria-hidden="true" /></div>
          <h2>Big questions, open data.</h2>
          <p>
            NASA International Space Apps Challenge is a global, collaborative
            hackathon. Participants work in teams on challenge topics connected
            to Earth and space, drawing on scientific information and open data
            to develop and present ideas.
          </p>
          <ButtonLink external to={officialUrl} secondary>Explore official Space Apps</ButtonLink>
        </article>

        <article className="about-context-card about-local-card">
          <span className="about-card-index">02 / THE LOCAL EVENT</span>
          <div className="about-card-icon"><MapPin size={22} aria-hidden="true" /></div>
          <h2>ASTROVERSE in Bhimtal.</h2>
          <p>
            ASTROVERSE is the distinct local event identity for the programme
            hosted at Birla Institute of Applied Sciences. It brings the
            challenge experience to a local community; it is not the global
            Space Apps organization itself.
          </p>
          <ButtonLink to="/venue" secondary>View venue information</ButtonLink>
        </article>
      </section>

      <section className="about-how" aria-labelledby="about-how-title">
        <div className="about-section-heading">
          <span className="eyebrow">A SHARED WAY OF WORKING</span>
          <h2 id="about-how-title">Curiosity becomes collaboration.</h2>
          <p>
            The challenge is an invitation to learn and build together. Bring
            different perspectives, explore a question and shape an idea as a team.
          </p>
        </div>
        <div className="about-process-grid">
          <article><span>01</span><Lightbulb size={21} aria-hidden="true" /><h3>Find a question</h3><p>Explore challenge topics and choose a problem your team wants to understand.</p></article>
          <article><span>02</span><Users size={21} aria-hidden="true" /><h3>Bring your strengths</h3><p>Combine skills and viewpoints; thoughtful collaboration matters as much as technical experience.</p></article>
          <article><span>03</span><Target size={21} aria-hidden="true" /><h3>Make an idea tangible</h3><p>Develop a concept or project and communicate the thinking behind your approach.</p></article>
        </div>
        <Notice>
          The local schedule, eligibility rules, equipment guidance and other
          event-specific policies are subject to organizer confirmation. Check
          the schedule and FAQ pages for updates.
        </Notice>
      </section>

      <section className="about-next-steps" aria-label="Explore ASTROVERSE">
        <div>
          <span className="eyebrow">CONTINUE EXPLORING</span>
          <h2>Ready to find your place in the challenge?</h2>
          <p>Read the current event information, see the venue, or start a team registration.</p>
        </div>
        <div className="about-actions">
          <ButtonLink to="/register">Team registration</ButtonLink>
          <ButtonLink to="/faq" secondary>Read the FAQ</ButtonLink>
          <ButtonLink to="/venue-schedule" secondary>View schedule</ButtonLink>
        </div>
      </section>
    </main>
  );
}

export function Highlights() {
  const items = [
    [Code2, 'Hackathon', 'Collaborative building around real-world questions.'],
    [Lightbulb, 'Innovation', 'Fresh perspectives and creative solutions.'],
    [Atom, 'Space science', 'Scientific questions with everyday relevance.'],
    [Cpu, 'Technology', 'Data, software and thoughtful technical design.'],
    [Users, 'Teamwork', 'Different skills, one shared goal.'],
    [MessageCircle, 'Mentorship', 'Guided learning sessions, subject to confirmation.'],
    [Wrench, 'Workshops', 'Hands-on sessions, subject to confirmation.'],
    [Target, 'Challenges', 'Open-data problem-solving and research.'],
    [Presentation, 'Presentations', 'Share the story behind your ideas.'],
    [Network, 'Networking', 'Meet a community of curious minds.'],
  ] as const;

  return (
    <div className="page">
      <PageIntro
        eyebrow="THE EXPERIENCE"
        title="Built around possibility."
      >
        A proposed programme of learning, making and collaboration. Specific
        sessions and activities remain subject to organizer confirmation.
      </PageIntro>
      <div className="feature-grid public-features">
        {items.map(([Icon, title, text]) => (
          <article className="feature-card" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <ButtonLink to="/register">Register your interest</ButtonLink>
    </div>
  );
}

export function Schedule() {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Activities' },
    { id: 'Hacking', label: 'Hacking & Building' },
    { id: 'Mentorship', label: 'Mentorship Syncs' },
    { id: 'Evaluation', label: 'Evaluation & Pitches' },
    { id: 'Ceremony', label: 'Keynotes & Ceremonies' },
    { id: 'Food', label: 'Meals & Energy' },
  ];

  const displayedDays = selectedDay === 'all'
    ? detailedSchedule
    : detailedSchedule.filter((d) => d.day === selectedDay);

  const getCategoryClass = (cat: string) => {
    switch (cat) {
      case 'Registration': return 'cat-cyan';
      case 'Ceremony': return 'cat-purple';
      case 'Briefing': return 'cat-sky';
      case 'Hacking': return 'cat-gold';
      case 'Mentorship': return 'cat-green';
      case 'Food': return 'cat-orange';
      case 'Evaluation': return 'cat-fuchsia';
      case 'Milestone': return 'cat-rose';
      default: return 'cat-gold';
    }
  };

  return (
    <div className="page schedule-page">
      <PageIntro eyebrow="14–16 NOVEMBER 2026 · BHIMTAL" title="Three days to turn ideas into action.">
        The official mission flight plan and continuous 3-day itinerary for the NASA International Space Apps Challenge at Birla Institute of Applied Sciences (BIAS Bhimtal).
      </PageIntro>

      {/* Top Telemetry Info & Quick Action Grid */}
      <div className="schedule-telemetry-banner">
        <div className="schedule-telemetry-grid">
          <div className="schedule-telemetry-card">
            <div className="telemetry-card-icon">
              <CalendarDays size={20} />
            </div>
            <div className="telemetry-card-content">
              <span className="telemetry-card-label">MISSION WINDOW</span>
              <strong>14–16 November 2026</strong>
              <small>3-Day Continuous Hackathon</small>
            </div>
          </div>

          <div className="schedule-telemetry-card">
            <div className="telemetry-card-icon">
              <MapPin size={20} />
            </div>
            <div className="telemetry-card-content">
              <span className="telemetry-card-label">EVENT VENUE</span>
              <strong>BIAS Bhimtal Campus</strong>
              <small>Nainital, Uttarakhand, India</small>
            </div>
          </div>

          <div className="schedule-telemetry-card">
            <div className="telemetry-card-icon">
              <Sparkles size={20} />
            </div>
            <div className="telemetry-card-content">
              <span className="telemetry-card-label">PARTICIPATION MODE</span>
              <strong>Dual Track (Onsite + Virtual)</strong>
              <small>14 NASA Global Challenges</small>
            </div>
          </div>
        </div>

        <div className="schedule-telemetry-actions">
          <a
            className="schedule-download-action-btn"
            href={itineraryPdfUrl}
            download="BIAS-NSAC-2026-Itinerary.pdf"
            target="_blank"
            rel="noreferrer"
            title="Download the proposed event itinerary (PDF)"
          >
            <Download size={16} />
            <span>Download Official Itinerary (PDF · 931 KB)</span>
          </a>
          <a
            className="schedule-directions-action-btn"
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={15} />
            <span>Campus Directions on Google Maps</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Interactive Day Filter Tabs */}
      <div className="schedule-controls-bar">
        <div className="schedule-day-tabs" role="tablist" aria-label="Select Hackathon Day">
          <button
            type="button"
            className={`schedule-day-tab-btn ${selectedDay === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDay('all')}
          >
            <span className="day-tab-kicker">FULL MISSION</span>
            <strong className="day-tab-title">All 3 Days</strong>
          </button>
          {detailedSchedule.map((day) => (
            <button
              type="button"
              key={day.day}
              className={`schedule-day-tab-btn ${selectedDay === day.day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day.day)}
            >
              <span className="day-tab-kicker">DAY {day.day} · {day.date}</span>
              <strong className="day-tab-title">{day.title}</strong>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="schedule-category-filters" aria-label="Filter by activity category">
          <span className="category-filter-hint">Filter track:</span>
          <div className="category-chips-row">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`category-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Cards with Detailed Activity Timelines */}
      <div className="schedule-days-container">
        {displayedDays.map((day) => {
          const filteredActivities = day.activities.filter(
            (act) => selectedCategory === 'all' || act.category === selectedCategory
          );

          return (
            <article className="schedule-day-card" id={`schedule-day-${day.day}`} key={day.day}>
              <header className="schedule-day-header">
                <div className="schedule-date-block">
                  <span className="schedule-day-badge">
                    <span className="schedule-badge-dot" />
                    DAY {day.day}
                  </span>
                  <div className="schedule-date-display">
                    <strong>{day.date.split(' ')[0]}</strong>
                    <div className="schedule-date-meta">
                      <span>NOVEMBER</span>
                      <small>2026</small>
                    </div>
                  </div>
                </div>

                <div className="schedule-day-intro">
                  <span className="schedule-phase-kicker">{day.phase}</span>
                  <h2 className="schedule-day-title">{day.title}</h2>
                  <p className="schedule-day-subtitle">{day.subtitle}</p>
                  {day.note && (
                    <div className="schedule-day-note-badge">
                      <Clock size={13} />
                      <span>{day.note}</span>
                    </div>
                  )}
                </div>
              </header>

              {filteredActivities.length === 0 ? (
                <div className="schedule-empty-activities">
                  <p>No activities matching "{categories.find(c => c.id === selectedCategory)?.label}" on Day {day.day}.</p>
                  <button
                    type="button"
                    className="button button-secondary text-sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Reset Category Filter
                  </button>
                </div>
              ) : (
                <ol className="schedule-activity-list">
                  {filteredActivities.map((activity) => (
                    <li
                      key={activity.title}
                      className={`schedule-activity-item ${activity.isHighlight ? 'is-highlight' : ''}`}
                    >
                      <div className="schedule-activity-time-col">
                        <span className="schedule-time-badge">
                          <Clock size={13} />
                          <span>{activity.time}</span>
                        </span>
                        <span className={`schedule-category-badge ${getCategoryClass(activity.category)}`}>
                          {activity.category}
                        </span>
                      </div>

                      <div className="schedule-activity-main-col">
                        <div className="schedule-activity-heading-row">
                          <h3 className="schedule-activity-title">{activity.title}</h3>
                          {activity.isHighlight && (
                            <span className="schedule-milestone-tag">
                              <Sparkles size={12} />
                              <span>KEY MILESTONE</span>
                            </span>
                          )}
                        </div>

                        <p className="schedule-activity-desc">{activity.desc}</p>

                        <div className="schedule-activity-location-row">
                          <span className="schedule-location-chip">
                            <MapPin size={12} />
                            <span>{activity.location}</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          );
        })}
      </div>

      {/* Participant Gear & Flight Kit Checklist */}
      <section className="schedule-flight-kit-section">
        <div className="schedule-flight-kit-header">
          <div className="section-heading">
            <span className="eyebrow"><span />PARTICIPANT FLIGHT KIT</span>
            <h2>What to Bring & Mission Checklist</h2>
          </div>
          <p className="schedule-flight-kit-lead">
            Essential gear and preparation requirements for onsite and virtual competitors attending BIAS Bhimtal.
          </p>
        </div>

        <div className="schedule-flight-kit-grid">
          <div className="flight-kit-card">
            <div className="flight-kit-icon">
              <CheckCircle2 size={20} />
            </div>
            <h3>Official Identification</h3>
            <p>Original College / School Student ID Card, valid Government Photo ID (Aadhar/Passport/DL), and printed or digital BIAS-NSAC registration pass.</p>
          </div>

          <div className="flight-kit-card">
            <div className="flight-kit-icon">
              <Cpu size={20} />
            </div>
            <h3>Hardware & Power Gear</h3>
            <p>Personal laptops, power adaptors, multi-plug extension boards (crucial for team bays), and any specialized microcontrollers or sensors for hardware tracks.</p>
          </div>

          <div className="flight-kit-card">
            <div className="flight-kit-icon">
              <Code2 size={20} />
            </div>
            <h3>Pre-Configured Environments</h3>
            <p>Pre-install your team's code IDEs (VS Code, Android Studio, etc.), Git, Python/Node runtime, and Docker before arrival to ensure zero setup downtime.</p>
          </div>

          <div className="flight-kit-card">
            <div className="flight-kit-icon">
              <Compass size={20} />
            </div>
            <h3>Mountain Weather Prep</h3>
            <p>Bhimtal is nestled in Kumaon hills at ~1,370m altitude. Mid-November evenings range between 12°C–16°C. Light woolens, sweaters, and comfortable shoes are recommended.</p>
          </div>
        </div>
      </section>

      {/* Notice / Advisory Box */}
      <aside className="schedule-confirmation">
        <div className="schedule-confirmation-copy">
          <span className="schedule-kicker">MISSION CONTROL ADVISORY</span>
          <h2>Live Onsite Schedule Governance</h2>
          <p>
            All times listed are in Indian Standard Time (IST). While the core 24-hour development window, code freeze, and jury pitch rounds are fixed, organizers may fine-tune refreshment or break hours based on live hackathon momentum.
          </p>
        </div>
        <div className="schedule-confirmation-actions">
          <ButtonLink to="/register">Register Team Now</ButtonLink>
          <ButtonLink to="/venue" secondary>Campus Venue Details</ButtonLink>
        </div>
      </aside>

      {/* Footer Navigation Strip */}
      <div className="schedule-footer-actions">
        <ButtonLink to="/problem-statements">
          <span>Explore 14 Challenges</span>
          <ArrowRight size={16} />
        </ButtonLink>
        <ButtonLink to="/how-to-register" secondary>
          <span>View Registration Guide</span>
        </ButtonLink>
      </div>
    </div>
  );
}

export function Venue() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="IN THE HILLS OF BHIMTAL"
        title="A place for a new perspective."
      >
        Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, India.
      </PageIntro>
      <div className="venue-grid">
        <div>
          <h2>
            Birla Institute of
            <br />
            Applied Sciences
          </h2>
          <p>
            <MapPin size={17} /> Bhimtal 263136, Uttarakhand, India
          </p>
          <p>
            <CalendarDays size={17} /> 14–16 November 2026
          </p>
          <p>
            The directions destination is sourced from the institute's own
            website. Please confirm arrival and check-in instructions with the
            organizers before travelling.
          </p>
          <ButtonLink external to={directionsUrl}>
            Get directions
          </ButtonLink>
          <a
            className="arrow-link"
            href="https://birlainstitute.co.in/"
            target="_blank"
            rel="noreferrer"
          >
            Institute website <ArrowUpRight size={17} />
          </a>
        </div>
        <iframe
          title="Birla Institute of Applied Sciences, Bhimtal map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={venueMapEmbedUrl}
        />
      </div>
    </div>
  );
}

export function Certification() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="CERTIFICATES & REGISTRATION"
        title="Complete both registrations."
      >
        Secure your place in the local event and register your team on the official NASA Space Apps website.
      </PageIntro>
      <div className="split-content certificate-section">
        <div>
          <h2>
            Two registrations.
            <br />
            One team experience.
          </h2>
          <p>
            To be eligible for an e-certificate, every team member must be included in a completed team registration on both the BIAS–NSAC portal and the official NASA Space Apps website.
          </p>
          <div className="certificate-rules" aria-label="Certificate eligibility">
            <article className="certificate-rule certificate-rule-primary">
              <span className="certificate-rule-label">E-CERTIFICATE</span>
              <p>Provided to registered team members once the required registrations on both portals are complete.</p>
            </article>
            <article className="certificate-rule">
              <span className="certificate-rule-label">HARD-COPY CERTIFICATE</span>
              <p>Provided only to winning teams.</p>
            </article>
          </div>
          <Notice>
            <strong>Important:</strong> Register your team on both portals. Completing only one registration does not meet the stated certificate eligibility requirement.
          </Notice>
          <div className="certificate-actions">
            <ButtonLink to="/register">Register on the BIAS–NSAC portal</ButtonLink>
            <ButtonLink to={officialRegistrationUrl} external secondary>
              Register on NASA Space Apps
            </ButtonLink>

          </div>
        </div>
        <figure className="certificate-example">
          <img
            src="/img/certificate-example.png"
            alt="Reference example of a NASA International Space Apps Challenge certificate from 2024"
            loading="lazy"
          />
          <figcaption>
            Reference example only. The 2026 certificate design may differ; this image does not guarantee certificate eligibility.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export function Category({ category }: { category: 'school' | 'college' }) {
  const school = category === 'school';
  const title = school ? 'School Category' : 'College Category';
  const traits = school
    ? ([
      [Lightbulb, 'Stay curious', 'Start with a question about Earth, space or the world around you.'],
      [Users, 'Learn as a team', 'Bring different interests and ideas together as you explore a challenge.'],
      [Presentation, 'Share your thinking', 'Explain the idea your team developed and how you approached the problem.'],
    ] as const)
    : ([
      [Code2, 'Apply your skills', 'Bring technical, scientific, design or research perspectives to a real-world question.'],
      [Network, 'Build collaboratively', 'Combine different strengths to explore data, test ideas and shape a solution.'],
      [Presentation, 'Show the process', 'Present your project clearly, including the question, approach and outcome.'],
    ] as const);

  return (
    <main className={`page category-page ${school ? 'school-category-page' : 'college-category-page'}`}>
      <PageIntro eyebrow={`ASTROVERSE · ${school ? 'SCHOOL' : 'COLLEGE'} CATEGORY`} title={school ? 'Curiosity can change your point of view.' : 'Bring your ideas into the real world.'}>
        {school
          ? 'Explore big questions, learn with your team and discover what you can create together.'
          : 'Connect your skills with open questions and collaborate on ideas that matter.'}
      </PageIntro>

      <section className="category-hero" aria-labelledby="category-hero-title">
        <div className="category-hero-copy">
          <span className="category-kicker">ONE CHALLENGE · MANY WAYS TO CONTRIBUTE</span>
          <h2 id="category-hero-title">{school ? 'Think boldly. Explore together.' : 'Question deeply. Build together.'}</h2>
          <p>
            NASA International Space Apps Challenge is a global collaborative
            hackathon. ASTROVERSE is the local event identity for the Bhimtal
            gathering, where teams can explore challenge topics connected to
            Earth and space using creativity, science and open data.
          </p>
          <div className="category-hero-actions">
            <ButtonLink to={`/register?category=${category}`}>Start team registration</ButtonLink>
            <ButtonLink to="/faq" secondary>Read participant FAQ</ButtonLink>
          </div>
        </div>
        <div className="category-hero-aside">
          <span className="eyebrow">LOCAL EVENT SNAPSHOT</span>
          <div><CalendarDays size={19} aria-hidden="true" /><span><small>WHEN</small><strong>14–16 November 2026</strong></span></div>
          <div><MapPin size={19} aria-hidden="true" /><span><small>WHERE</small><strong>Bhimtal, Uttarakhand</strong></span></div>
          <div><Users size={19} aria-hidden="true" /><span><small>TEAM SIZE</small><strong>Current limit shown in registration</strong></span></div>
          <p>Eligibility, category rules and final team policies are subject to organizer confirmation.</p>
        </div>
      </section>

      <section className="category-value-section" aria-labelledby="category-value-title">
        <div className="category-section-heading">
          <span className="eyebrow">{school ? 'A PLACE TO DISCOVER' : 'A PLACE TO PUT KNOWLEDGE TO WORK'}</span>
          <h2 id="category-value-title">{school ? 'Bring your questions. Find new possibilities.' : 'Your perspective is part of the solution.'}</h2>
          <p>
            There is no single way to contribute. The challenge invites teams
            to explore, learn and communicate their thinking.
          </p>
        </div>
        <div className="category-value-grid">
          {traits.map(([Icon, heading, description], index) => (
            <article className="category-value-card" key={heading}>
              <span className="category-value-index">0{index + 1}</span>
              <Icon size={23} aria-hidden="true" />
              <h3>{heading}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="category-steps-section" aria-labelledby="category-steps-title">
        <div>
          <span className="eyebrow">YOUR NEXT STEPS</span>
          <h2 id="category-steps-title">From account to team entry.</h2>
          <p>The team leader manages the online registration for the full team.</p>
        </div>
        <ol className="category-steps">
          <li><span>01</span><div><strong>Create and verify an account</strong><p>The team leader signs up and confirms their email address.</p></div></li>
          <li><span>02</span><div><strong>Prepare your team details</strong><p>Have your team name, institution, members and selected challenge ready.</p></div></li>
          <li><span>03</span><div><strong>Submit when registration is open</strong><p>Choose {school ? 'School' : 'College'} Category and complete the team form.</p></div></li>
        </ol>
      </section>

      <Notice>
        No payment is collected by this website;
        check the FAQ or contact the organizers for confirmed updates.
      </Notice>

      <nav className="category-footer-actions" aria-label={`${title} information`}>
        <ButtonLink to="/venue-schedule" secondary>Explore the schedule</ButtonLink>
        <ButtonLink to="/contact" secondary>Contact the organizers</ButtonLink>
        <ButtonLink to={`/register?category=${category}`}>Continue to registration</ButtonLink>
      </nav>
    </main>
  );
}

export function WhyParticipate() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="THE VALUE IS IN THE JOURNEY"
        title="Leave with a new perspective."
      >
        Real learning. New connections. Work you can be proud of.
      </PageIntro>
      <div className="feature-grid public-features">
        {[
          'Collaboration',
          'Scientific learning',
          'Technical experience',
          'Problem-solving',
          'Portfolio development',
          'Networking',
          'Creativity',
          'Open-data challenges',
          'Innovation',
        ].map((item, index) => (
          <article className="feature-card" key={item}>
            <span className="eyebrow">0{index + 1}</span>
            <h3>{item}</h3>
            <p>
              Build practical experience through shared questions, thoughtful
              experimentation and working with a team.
            </p>
          </article>
        ))}
      </div>

      <ButtonLink to="/register">Take the first step</ButtonLink>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="page faq-page">
      <PageIntro
        eyebrow="ASTROVERSE · MISSION BRIEFING"
        title="Good questions. Clear answers."
      >
        Find practical information about the local event, team registration, and what to expect.
      </PageIntro>
      <div className="faq-fact-strip" aria-label="Event details">
        <div>
          <CalendarDays size={19} aria-hidden="true" />
          <span><small>LOCAL EVENT DATES</small><strong>14–16 November 2026</strong></span>
        </div>
        <div>
          <MapPin size={19} aria-hidden="true" />
          <span><small>HOST LOCATION</small><strong>Bhimtal, Uttarakhand</strong></span>
        </div>
        <ButtonLink external to={officialUrl} secondary>
          Official Space Apps website
        </ButtonLink>
      </div>
      <section className="faq-page-content" aria-label="Frequently asked questions">
        <div className="faq-page-heading">
          <span className="eyebrow">YOUR QUESTIONS, IN ORBIT</span>
          <h2>Find your answer.</h2>
          <p>Choose a topic to browse the information you need.</p>
        </div>
        <FAQList interactive />
      </section>
      <aside className="faq-help-card">
        <div>
          <span className="eyebrow">STILL WONDERING?</span>
          <h2>We’re here to help.</h2>
          <p>Visit the event contact and venue page for the confirmed local information currently available.</p>
        </div>
        <ButtonLink to="/contact">
          Contact & venue information
        </ButtonLink>
      </aside>
    </div>
  );
}

export function Contact() {
  return (
    <main className="page contact-page">
      <PageIntro eyebrow="ASTROVERSE ORGANIZER DESK" title="We’re here to help.">
        Find the local event details or send a question to the organizing team.
      </PageIntro>

      <section className="contact-query-card" aria-labelledby="contact-query-title">
        <div className="contact-query-icon"><Send size={22} aria-hidden="true" /></div>
        <div className="contact-query-copy">
          <span className="eyebrow">FOR REGISTERED TEAMS</span>
          <h2 id="contact-query-title">Ask the organizers directly.</h2>
          <p>
            Once your team registration is submitted, the team leader can send a
            private message from the dashboard. Your query stays linked to your
            team, and you can check its status there.
          </p>
          <ButtonLink to="/dashboard#contact-admin">Open team support</ButtonLink>
        </div>
        <div className="contact-query-step" aria-hidden="true">
          <span>01</span><span>REGISTER</span>
          <span className="contact-query-step-line" />
          <span>02</span><span>MESSAGE</span>
        </div>
      </section>

      <section className="contact-information" aria-label="Event contact details and venue">
        <article className="contact-information-card">
          <span className="contact-information-icon"><MessageCircle size={20} aria-hidden="true" /></span>
          <span className="micro-label">WHATSAPP · DIRECT CHAT</span>
          <h2>Message the team</h2>
          <div className="contact-person-list">
            {organizerContacts.map((contact) => (
              <div key={contact.name} className="contact-person-item">
                <div className="contact-person-meta">
                  <strong className="contact-person-name">{contact.name}</strong>
                  <span className="contact-role-badge">{contact.role}</span>
                </div>
                <div className="contact-person-actions">
                  <a
                    className="contact-whatsapp-link"
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={14} />
                    <span>Chat on WhatsApp</span>
                    <ArrowUpRight size={13} />
                  </a>
                  <a
                    className="contact-phone-link"
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  >
                    <Phone size={13} />
                    <span>{contact.displayPhone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="contact-information-card">
          <span className="contact-information-icon"><Mail size={20} aria-hidden="true" /></span>
          <span className="micro-label">OFFICIAL EMAIL CHANNELS</span>
          <h2>Send us an email</h2>
          <div className="contact-person-list">
            {organizerContacts.map((contact) => (
              <div key={contact.name} className="contact-person-item">
                <div className="contact-person-meta">
                  <strong className="contact-person-name">{contact.name}</strong>
                  <span className="contact-role-badge">{contact.role}</span>
                </div>
                <div className="contact-person-actions">
                  <a
                    className="contact-email-link"
                    href={`mailto:${contact.email}`}
                  >
                    <Mail size={14} />
                    <span>{contact.email}</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="contact-information-card contact-venue-card">
          <span className="contact-information-icon"><MapPin size={20} aria-hidden="true" /></span>
          <span className="micro-label">LOCAL EVENT VENUE</span>
          <h2>Birla Institute of Applied Sciences</h2>
          <p>Bhimtal, Uttarakhand, India</p>
          <div className="contact-venue-date"><CalendarDays size={17} aria-hidden="true" />14–16 November 2026</div>
          <div className="contact-actions">
            <ButtonLink to="/venue" secondary>Venue & map</ButtonLink>
            <ButtonLink external to="https://birlainstitute.co.in/">Host institution</ButtonLink>
          </div>
        </article>
      </section>
    </main>
  );
}
