import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Copy,
  Sparkles,
  Rocket,
  Globe2,
  Users,
  Mail,
  KeyRound,
  FileText,
  BadgeCheck,
  HelpCircle,
  Compass,
  CheckSquare,
  Square,
  AlertCircle,
  Eye,
  Camera,
  Maximize2,
} from 'lucide-react';
import { officialUrl } from '../data/event';

interface StepItem {
  num: string;
  title: string;
  tag: string;
  desc: string;
  icon: any;
  actionText?: string;
  actionUrl?: string;
  note?: string;
  image?: string;
  urlBar?: string;
}

export default function RegistrationGuide() {
  const [activeTab, setActiveTab] = useState<'nasa' | 'bias'>('nasa');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [zoomedStep, setZoomedStep] = useState<StepItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyPageLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const nasaSteps: StepItem[] = [
    {
      num: '01',
      title: 'Login / Sign Up on NASA Portal',
      tag: 'ALL PARTICIPANTS',
      desc: 'Every team member must create an individual account on the official NASA Space Apps Challenge portal.',
      icon: Users,
      actionText: 'Open NASA Space Apps',
      actionUrl: officialUrl,
      image: '/registration/nasa/2. Login -Sign-Up.png',
      urlBar: 'spaceappschallenge.org/auth/login',
    },
    {
      num: '02',
      title: 'Explore the Hackathon → Local Events',
      tag: 'NAVIGATION',
      desc: 'In the top navigation menu, click "Explore the Hackathon" and select "Local Events" from the dropdown.',
      icon: Compass,
      image: '/registration/nasa/3. Local-Events.png',
      urlBar: 'spaceappschallenge.org/explore-the-hackathon/local-events',
    },
    {
      num: '03',
      title: 'Search "Haldwani" in the Search Bar',
      tag: 'FIND LOCATION',
      desc: 'Type "Haldwani" in the location search bar to find the official regional local event hosted by Birla Institute of Applied Sciences (BIAS).',
      icon: Globe2,
      image: '/registration/nasa/4. Search-Haldwani.png',
      urlBar: 'spaceappschallenge.org/2026/locations/?q=Haldwani',
    },
    {
      num: '04',
      title: 'Sign Up For This Local Event',
      tag: 'LOCAL COHORT',
      desc: 'Click the "Sign Up For This Local Event" button on the Haldwani event page to link your profile to this edition.',
      icon: Rocket,
      image: '/registration/nasa/5. Sign Up For This Local Event.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani',
    },
    {
      num: '05',
      title: 'Fill Out the Registration Form',
      tag: 'PROFILE DETAILS',
      desc: 'Provide your emergency contact, academic background, skill sets, and consent declarations accurately.',
      icon: FileText,
      image: '/registration/nasa/6. Fill Out the Registration Form.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/register',
    },
    {
      num: '06',
      title: 'Submit the Registration Form',
      tag: 'CONFIRMATION',
      desc: 'Review your submission carefully and click the Submit button to finalize your individual registration.',
      icon: CheckCircle2,
      image: '/registration/nasa/6. Fill Out the Registration Form.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/register/confirm',
    },
    {
      num: '07',
      title: 'Confirm Participation Type: "In-Person" or "Virtual"',
      tag: 'MODE SELECTION',
      desc: 'Indicate whether you intend to participate physically on-campus in Bhimtal or virtually from remote.',
      icon: Sparkles,
      image: '/registration/nasa/7. Type In-Person or Virtual.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/participation',
    },
    {
      num: '08',
      title: 'Navigate to the "Teams" Tab',
      tag: 'TEAM FORMATION',
      desc: 'Go to the "Teams" tab on the Haldwani event dashboard to either create a new team or join an existing one.',
      icon: Users,
      image: '/registration/nasa/8. Navigate to the Teams Tab.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/teams',
    },
    {
      num: '09',
      title: 'Create a Team (Team Leader Only)',
      tag: 'LEADERS ONLY',
      desc: 'Team Leader creates the team, sets a unique team name, selects challenge focus, and invites members. (Members skip this step).',
      icon: Rocket,
      image: '/registration/nasa/9. Create a Team.png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/teams/create',
    },
    {
      num: '10',
      title: 'Join a Team (For Team Members)',
      tag: 'MEMBERS ONLY',
      desc: 'Team members search for their leader’s team name or find it under "Seeking Members" to request an invite or join.',
      icon: KeyRound,
      image: '/registration/nasa/10. Join a Team (For Team Members).png',
      urlBar: 'spaceappschallenge.org/2026/locations/haldwani/teams/join',
    },
    {
      num: '11',
      title: 'All Set on NASA Space Apps!',
      tag: 'NASA PHASE COMPLETE',
      desc: 'Your roster is successfully locked on NASA Space Apps. Now proceed to Phase 2 to register on the BIAS-NSAC Portal.',
      icon: BadgeCheck,
      image: '/registration/nasa/1. NASA-Portal.png',
      urlBar: 'spaceappschallenge.org/2026/dashboard',
    },
  ];

  const biasSteps: StepItem[] = [
    {
      num: '01',
      title: 'Click "Register Team" or "Profile Login"',
      tag: 'TEAM LEADER ACTION',
      desc: 'The Team Leader initiates portal onboarding by clicking "Register Team" in the navigation bar.',
      icon: Rocket,
      image: '/registration/bias/1. Click Register Team or Profile Login.png',
      urlBar: 'bias-nsac.in/register',
    },
    {
      num: '02',
      title: 'Create Account on Sign Up Page',
      tag: 'ACCOUNT CREATION',
      desc: 'Enter Team Leader email address, secure password, full name, and mobile number to create your portal account.',
      icon: KeyRound,
      image: '/registration/bias/2. Create Account on Sign Up Page.png',
      urlBar: 'bias-nsac.in/signup',
    },
    {
      num: '03',
      title: 'Check Gmail for Account Verification',
      tag: 'CRITICAL STEP',
      desc: 'Open the email titled "BIAS-NSAC" sent to your inbox/spam folder and click "Verify Email Address".',
      note: 'Note: If password is forgotten later, click "Forgot Password" to receive a password reset link.',
      icon: Mail,
      image: '/registration/bias/3. Check Gmail for Account Verification.png',
      urlBar: 'mail.google.com/mail · BIAS-NSAC Verification',
    },
    {
      num: '04',
      title: 'Sign In with Your Credentials',
      tag: 'AUTHENTICATION',
      desc: 'Return to the BIAS-NSAC sign-in page and enter your verified credentials to access the registration wizard.',
      icon: KeyRound,
      image: '/registration/bias/4. Sign In with Your Credentials.png',
      urlBar: 'bias-nsac.in/login',
    },
    {
      num: '05',
      title: 'Fill Complete Team Form (Exact Same NASA Details)',
      tag: 'DATA MATCHING',
      desc: 'Fill team name, leader info, and all member details. Details MUST exactly match what you entered on the NASA portal.',
      note: 'Note: Select preferred mode of participation (in-person visit available for shortlisted candidates).',
      icon: FileText,
      image: '/registration/bias/5. Fill Complete Team Form.png',
      urlBar: 'bias-nsac.in/register/team',
    },
    {
      num: '06',
      title: 'Confirm Form & Submit Application',
      tag: 'APPLICATION SUBMIT',
      desc: 'Thoroughly review all member names, phone numbers, and emails before final submission.',
      icon: CheckCircle2,
      image: '/registration/bias/6. dashboard after sumission.png',
      urlBar: 'bias-nsac.in/dashboard',
    },
    {
      num: '07',
      title: 'Download Digital ID Cards for Each Member',
      tag: 'PASS GENERATION',
      desc: 'Access your team dashboard to view and download personalized NASA Space Apps 2026 digital ID cards.',
      icon: BadgeCheck,
      image: '/registration/bias/7. Download Digital ID.png',
      urlBar: 'bias-nsac.in/dashboard/id-card',
    },
    {
      num: '08',
      title: 'Dual-Portal Cross Verification',
      tag: 'VERIFICATION',
      desc: 'Organizers verify your team once matching registrations are confirmed on both NASA Space Apps and BIAS-NSAC.',
      icon: ShieldAlert,
      image: '/registration/bias/6. dashboard after sumission.png',
      urlBar: 'bias-nsac.in/verify',
    },
    {
      num: '09',
      title: 'Contact Organizing Committee for Queries',
      tag: 'SUPPORT AVAILABLE',
      desc: 'Need help or team adjustments? Reach out to our campus desk via Discord, email, or our Help Center.',
      icon: HelpCircle,
      image: '/registration/bias/9. Queries.png',
      urlBar: 'bias-nsac.in/contact',
    },
    {
      num: '10',
      title: 'All Set! See You at BIAS Bhimtal!',
      tag: 'READY FOR LIFTOFF',
      desc: 'You are completely onboarded! Prepare your hardware/software tools for 36 hours of cosmic innovation.',
      icon: Sparkles,
      image: '/registration/bias/7. Download Digital ID.png',
      urlBar: 'bias-nsac.in/dashboard/ready',
    },
  ];

  const currentSteps = activeTab === 'nasa' ? nasaSteps : biasSteps;
  const currentPrefix = activeTab === 'nasa' ? 'nasa' : 'bias';
  const totalSteps = currentSteps.length;
  const checkedCount = currentSteps.filter((_, idx) => completedSteps[`${currentPrefix}-${idx}`]).length;
  const progressPercent = Math.round((checkedCount / totalSteps) * 100);

  return (
    <div className="page registration-guide-page">
      {/* Hero Header */}
      <div className="guide-hero">
        <div className="guide-hero-badge">
          <Sparkles size={14} className="text-accent" />
          <span>OFFICIAL DUAL-PORTAL REGISTRATION PROTOCOL</span>
        </div>
        <h1 className="guide-hero-title">
          How to Register for <span className="text-accent">NASA Space Apps 2026</span>
        </h1>
        <p className="guide-hero-lead">
          To participate, qualify for global awards, and receive official NASA certificates, every team must complete registration on <strong>both the official NASA Space Apps portal</strong> and the <strong>BIAS-NSAC college portal</strong>. Follow this verified step-by-step screenshot guide.
        </p>

        {/* Hero Quick Telemetry Stats */}
        <div className="guide-telemetry-row">
          <div className="guide-stat-chip">
            <span className="stat-val">2 PHASES</span>
            <span className="stat-lbl">NASA Portal + BIAS-NSAC</span>
          </div>
          <div className="guide-stat-chip">
            <span className="stat-val">100% FREE</span>
            <span className="stat-lbl">No Registration Fee</span>
          </div>
          <div className="guide-stat-chip">
            <span className="stat-val">1–6 CREW</span>
            <span className="stat-lbl">Per Team Roster</span>
          </div>
          <div className="guide-stat-chip">
            <span className="stat-val">SCREENSHOTS</span>
            <span className="stat-lbl">18+ Step References</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="guide-actions-bar">
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary"
          >
            <span>Open NASA Portal</span>
            <ExternalLink size={16} />
          </a>
          <Link to="/register" className="button button-secondary">
            <span>Register Team on BIAS-NSAC</span>
            <ArrowRight size={16} />
          </Link>
          <button type="button" onClick={copyPageLink} className="button button-outline guide-share-btn">
            <Copy size={15} />
            <span>{copiedLink ? 'Link Copied!' : 'Share Guide'}</span>
          </button>
        </div>
      </div>

      {/* Screenshot Visual Walkthrough Hero Banner */}
      <div className="guide-screenshot-banner">
        <div className="guide-screenshot-content">
          <div className="guide-screenshot-tag">
            <Camera size={14} className="text-accent" />
            <span>STEP-BY-STEP SCREENSHOT REFERENCE</span>
          </div>
          <h2>Visual Portal Walkthrough & Screen References</h2>
          <p>
            We have captured live screenshots of each step across both the <strong>official NASA Space Apps challenge portal</strong> and the <strong>BIAS-NSAC college platform</strong>. Compare each reference screen to your own browser to ensure seamless onboarding.
          </p>
          <div className="guide-screenshot-features">
            <span className="screenshot-feature-pill">📸 18+ Live Portal Screenshots</span>
            <span className="screenshot-feature-pill">🔍 Click Any Image to Zoom Full-Screen</span>
            <span className="screenshot-feature-pill">✓ Interactive Progress Checkmarks</span>
          </div>
        </div>
        <div
          className="guide-screenshot-collage-box"
          onClick={() => setZoomedStep(currentSteps[0])}
          title="Click to view high-res screenshot"
        >
          <div className="guide-collage-preview">
            <img
              src={activeTab === 'nasa' ? '/registration/nasa/1. NASA-Portal.png' : '/registration/bias/1. Click Register Team or Profile Login.png'}
              alt="Registration Screenshot Preview"
              className="collage-main-img"
              loading="lazy"
            />
            <div className="collage-zoom-badge">
              <Eye size={15} />
              <span>Click to Enlarge {activeTab === 'nasa' ? 'NASA' : 'BIAS'} Screen</span>
            </div>
          </div>
          <div className="guide-collage-caption">
            <strong>{activeTab === 'nasa' ? 'Phase 1: NASA Space Apps' : 'Phase 2: BIAS-NSAC Portal'}</strong>
            <span>Verified visual references for seamless onboarding</span>
          </div>
        </div>
      </div>

      {/* Dual Phase Tabs Switcher */}
      <div className="guide-tabs-container">
        <div className="guide-tabs-header">
          <button
            type="button"
            className={`guide-tab-btn ${activeTab === 'nasa' ? 'active' : ''}`}
            onClick={() => setActiveTab('nasa')}
          >
            <Globe2 size={18} />
            <span>Phase 1: NASA Portal</span>
            <span className="tab-step-count">11 Steps</span>
          </button>
          <button
            type="button"
            className={`guide-tab-btn ${activeTab === 'bias' ? 'active' : ''}`}
            onClick={() => setActiveTab('bias')}
          >
            <Rocket size={18} />
            <span>Phase 2: BIAS-NSAC Portal</span>
            <span className="tab-step-count">10 Steps</span>
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="guide-progress-bar-card">
          <div className="guide-progress-info">
            <div className="progress-label">
              <span className="progress-dot" />
              <span>
                {activeTab === 'nasa' ? 'Phase 1 Progress:' : 'Phase 2 Progress:'}{' '}
                <strong>
                  {checkedCount} of {totalSteps} steps completed
                </strong>
              </span>
            </div>
            <span className="progress-percentage">{progressPercent}% Completed</span>
          </div>
          <div className="guide-progress-track">
            <div
              className="guide-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Matching Rule Banner */}
        <div className="notice guide-notice">
          <AlertCircle size={20} className="text-accent" />
          <div>
            <strong>Mandatory Rule: Matching Details Required</strong>
            <p>
              Your team name, leader email address, and member rosters on the BIAS-NSAC portal must <strong>exactly match</strong> your team details on the official NASA Space Apps Challenge portal. Mismatches will delay or invalidate on-campus access passes.
            </p>
          </div>
        </div>

        {/* Step List Cards */}
        <div className="guide-steps-grid">
          {currentSteps.map((step, idx) => {
            const stepKey = `${currentPrefix}-${idx}`;
            const isDone = !!completedSteps[stepKey];
            const StepIcon = step.icon;

            return (
              <div
                key={step.num}
                className={`guide-step-card ${isDone ? 'step-completed' : ''}`}
              >
                <div className="step-card-header">
                  <div className="step-num-badge">
                    <span>STEP {step.num}</span>
                  </div>
                  <span className="step-tag-pill">{step.tag}</span>
                  <button
                    type="button"
                    className="step-check-toggle"
                    aria-label={`Mark step ${step.num} as ${isDone ? 'incomplete' : 'complete'}`}
                    onClick={() => toggleStep(stepKey)}
                  >
                    {isDone ? (
                      <CheckSquare size={20} className="text-accent" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </div>

                <div className="step-card-body">
                  <div className="step-icon-wrapper">
                    <StepIcon size={22} />
                  </div>
                  <div className="step-card-text">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-desc">{step.desc}</p>
                    {step.note && (
                      <div className="step-subnote">
                        <AlertCircle size={14} />
                        <span>{step.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshot Reference Box */}
                {step.image && (
                  <div
                    className="guide-step-image-box"
                    onClick={() => setZoomedStep(step)}
                    title="Click to zoom screenshot"
                  >
                    <div className="guide-step-browser-bar">
                      <div className="browser-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="browser-url">{step.urlBar || 'portal.spaceappschallenge.org'}</span>
                      <span className="browser-zoom-pill">
                        <Maximize2 size={12} />
                        <span>Zoom</span>
                      </span>
                    </div>
                    <div className="guide-step-img-wrap">
                      <img
                        src={step.image}
                        alt={`Step ${step.num}: ${step.title}`}
                        loading="lazy"
                        className="guide-step-img"
                      />
                      <div className="guide-step-img-hover-overlay">
                        <span className="hover-zoom-btn">
                          <Eye size={15} />
                          <span>Expand Screenshot</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {step.actionText && step.actionUrl && (
                  <div className="step-card-footer">
                    <a
                      href={step.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-outline step-action-btn"
                    >
                      <span>{step.actionText}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Callout */}
      <div className="guide-summary-card">
        <div className="guide-summary-icon">
          <BadgeCheck size={38} className="text-accent" />
        </div>
        <div className="guide-summary-content">
          <h3>Dual Registration Checklist</h3>
          <ul className="guide-checklist-bullets">
            <li>✓ Individual NASA portal account created for each team member</li>
            <li>✓ Joined the official <strong>Haldwani</strong> local event on NASA Space Apps</li>
            <li>✓ Team created (or joined) under the Teams tab on spaceappschallenge.org</li>
            <li>✓ Team Leader registered on BIAS-NSAC with verified Gmail account</li>
            <li>✓ Matching roster submitted and team ID cards downloaded</li>
          </ul>
        </div>
        <div className="guide-summary-actions">
          <Link to="/register" className="button button-primary guide-cta-btn">
            <span>Proceed to BIAS-NSAC Registration</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/faq" className="button button-secondary guide-faq-btn">
            <span>Registration FAQs</span>
          </Link>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {zoomedStep && (
        <div className="guide-lightbox-backdrop" onClick={() => setZoomedStep(null)}>
          <div className="guide-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="guide-lightbox-header">
              <div className="guide-lightbox-title-group">
                <span className="guide-lightbox-badge">STEP {zoomedStep.num}</span>
                <span className="guide-lightbox-tag">{zoomedStep.tag}</span>
                <h3 className="guide-lightbox-title">{zoomedStep.title}</h3>
              </div>
              <button
                type="button"
                className="guide-lightbox-close"
                onClick={() => setZoomedStep(null)}
                aria-label="Close screenshot preview"
              >
                ✕
              </button>
            </div>

            <div className="guide-lightbox-body">
              <img
                src={zoomedStep.image}
                alt={zoomedStep.title}
                className="guide-lightbox-img"
              />
            </div>

            <div className="guide-lightbox-footer">
              <div className="guide-lightbox-info">
                <p>{zoomedStep.desc}</p>
                {zoomedStep.note && <small className="text-accent">{zoomedStep.note}</small>}
              </div>
              <div className="guide-lightbox-actions">
                {zoomedStep.actionUrl ? (
                  <a
                    href={zoomedStep.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-primary"
                  >
                    <span>{zoomedStep.actionText || 'Open Portal'}</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setZoomedStep(null)}
                  >
                    Close Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
