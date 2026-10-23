import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Menu,
  X,
  MapPin,
  UserRound,
  CalendarDays,
  Globe2,
  ChevronDown,
  GraduationCap,
  School,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  Phone,
} from 'lucide-react';
import type { SectionBackgroundName } from './SectionBackground';
import { useAuth } from '../lib/auth';
import { directionsUrl, officialUrl } from '../data/event';
import { Notice } from './UI';

const pageBackgrounds: Record<string, SectionBackgroundName> = {
  '/about': 'mission',
  '/highlights': 'experience',
  '/venue-schedule': 'schedule',
  '/venue': 'categories',
  '/gallery': 'experience',
  '/quiz': 'categories',
  '/faq': 'schedule',
  '/certification': 'mission',
  '/contact': 'experience',
  '/why-participate': 'categories',
  '/problem-statements': 'mission',
  '/challenges': 'mission',
  '/school': 'mission',
  '/college': 'experience',
  '/login': 'mission',
  '/signup': 'experience',
  '/register': 'schedule',
};

function RouteContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`route-surface ${!isHome ? 'has-back-nav' : ''}`}>
      {!isHome && (
        <div className="page-back-bar">
          <button
            type="button"
            className="page-back-button"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back</span>
          </button>
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [loginToast, setLoginToast] = useState(false);
  const [logoutToast, setLogoutToast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, callbackError } = useAuth();

  const exploreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const exploreRoutes = [
    '/school',
    '/college',
    '/verify',
    '/gallery',
    '/quiz',
    '/faq',
    '/contact',
    '/certification',
    '/why-participate',
    '/highlights',
  ];
  const isExploreActive = exploreRoutes.some((route) => location.pathname.startsWith(route));

  async function handleSignOut() {
    setAccountError('');
    try {
      await signOut();
      setProfileOpen(false);
      setOpen(false);
      navigate('/login?logged_out=1', { replace: true, state: { loggedOut: true } });
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
    } finally {
      setProfileOpen(false);
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset menus on route navigation
  useEffect(() => {
    setOpen(false);
    setExploreOpen(false);
    setProfileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Lock body scroll on mobile when menu drawer is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('mobile-nav-locked');
    } else {
      document.body.classList.remove('mobile-nav-locked');
    }
    return () => {
      document.body.classList.remove('mobile-nav-locked');
    };
  }, [open]);

  useEffect(() => {
    if ((location.state as { loggedIn?: boolean } | null)?.loggedIn) {
      setLoginToast(true);
      const stateCopy = { ...(location.state as Record<string, unknown>) };
      delete stateCopy.loggedIn;
      navigate(location.pathname + location.search + location.hash, {
        replace: true,
        state: stateCopy,
      });
    } else if (
      (location.state as { loggedOut?: boolean } | null)?.loggedOut ||
      new URLSearchParams(location.search).get('logged_out') === '1'
    ) {
      setLogoutToast(true);
      const stateCopy = { ...(location.state as Record<string, unknown>) };
      delete stateCopy.loggedOut;
      const params = new URLSearchParams(location.search);
      params.delete('logged_out');
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      navigate(location.pathname + newSearch + location.hash, {
        replace: true,
        state: stateCopy,
      });
    }
  }, [location.state, location.pathname, location.search, location.hash, navigate]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`header ${open ? 'menu-active' : ''}`}>
        <Link className="brand" to="/" aria-label="BIAS-NSAC home">
          <img className="brand-logo" src="/img/event-mark.png" alt="" width="52" height="52" />
          <span>
            BIAS-NSAC
            <small>Bhimtal | Uttarakhand</small>
          </span>
        </Link>

        {/* Right side navbar & controls */}
        <div className="header-right">
          <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
            <div className="nav-primary-links">
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                The event
              </NavLink>
              <NavLink to="/problem-statements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Challenges
              </NavLink>
              <NavLink to="/venue-schedule" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Schedule
              </NavLink>
              <NavLink to="/how-to-register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                How to register
              </NavLink>

              {/* Desktop Explore Dropdown */}
              <div className="nav-dropdown" ref={exploreRef}>
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${isExploreActive ? 'active' : ''}`}
                  onClick={() => setExploreOpen(!exploreOpen)}
                  aria-expanded={exploreOpen}
                  aria-label="Explore more pages"
                >
                  <span>Explore</span>
                  <ChevronDown size={14} className={`dropdown-chevron ${exploreOpen ? 'rotate' : ''}`} />
                </button>

                {exploreOpen && (
                  <div className="dropdown-menu explore-menu">
                    <div className="dropdown-menu-header">
                      <span>EVENT TRACKS & DISCOVERY</span>
                    </div>
                    <div className="dropdown-grid">
                      <Link to="/school" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><GraduationCap size={16} /></div>
                        <div>
                          <strong>School Category</strong>
                          <small>Class 8–12 student squads</small>
                        </div>
                      </Link>
                      <Link to="/college" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><School size={16} /></div>
                        <div>
                          <strong>College Category</strong>
                          <small>UG, PG & university teams</small>
                        </div>
                      </Link>
                      <Link to="/verify" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><ShieldCheck size={16} /></div>
                        <div>
                          <strong>Verify Pass</strong>
                          <small>Instant ID pass & team lookup</small>
                        </div>
                      </Link>
                      <Link to="/gallery" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><ImageIcon size={16} /></div>
                        <div>
                          <strong>Gallery</strong>
                          <small>Photos & hackathon highlights</small>
                        </div>
                      </Link>
                      <Link to="/quiz" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><Sparkles size={16} /></div>
                        <div>
                          <strong>Space Quiz</strong>
                          <small>Trivia challenge & astronaut rank</small>
                        </div>
                      </Link>
                      <Link to="/faq" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><HelpCircle size={16} /></div>
                        <div>
                          <strong>FAQs</strong>
                          <small>Rules, food, hardware & lodging</small>
                        </div>
                      </Link>
                      <Link to="/contact" className="dropdown-item" onClick={() => setExploreOpen(false)}>
                        <div className="dropdown-item-icon"><Phone size={16} /></div>
                        <div>
                          <strong>Contact & Venue</strong>
                          <small>Campus route, contacts & helpdesk</small>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Only: Grouped Explore Links */}
            <div className="mobile-explore-section">
              <span className="mobile-nav-heading">EXPLORE & RESOURCES</span>
              <div className="mobile-explore-grid">
                <NavLink to="/school" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <GraduationCap size={15} /> School Category (Class 8–12)
                </NavLink>
                <NavLink to="/college" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <School size={15} /> College Category (UG/PG)
                </NavLink>
                <NavLink to="/verify" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <ShieldCheck size={15} /> Verify Registration Pass
                </NavLink>
                <NavLink to="/gallery" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <ImageIcon size={15} /> Photo & Video Gallery
                </NavLink>
                <NavLink to="/quiz" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <Sparkles size={15} /> Space Quiz
                </NavLink>
                <NavLink to="/faq" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <HelpCircle size={15} /> Frequently Asked Questions
                </NavLink>
                <NavLink to="/contact" className="mobile-explore-link" onClick={() => setOpen(false)}>
                  <Phone size={15} /> Contact & Venue
                </NavLink>
              </div>
            </div>

            {/* Mobile Bottom Action CTA */}
            <div className="mobile-nav-cta">
              {user ? (
                <Link to="/dashboard" className="mobile-cta-btn" onClick={() => setOpen(false)}>
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="mobile-cta-btn" onClick={() => setOpen(false)}>
                  Register Your Team Now
                </Link>
              )}
            </div>
          </nav>

          {/* Desktop Right CTA Button & Profile Menu */}
          <div className="nav-desktop-actions">
            {user ? (
              <Link to="/dashboard" className="nav-register-btn">
                Dashboard
              </Link>
            ) : (
              <Link to="/register" className="nav-register-btn">
                Register Team
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="profile-dropdown" ref={profileRef}>
              <button
                className={`profile-trigger profile-icon-button ${user ? 'is-logged-in' : ''}`}
                aria-expanded={profileOpen}
                aria-label={user ? 'Open profile menu' : 'Open account menu'}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <UserRound size={17} />
                {user && <span className="profile-dot" />}
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  {user ? (
                    <>
                      <div className="profile-menu-header">
                        <span className="profile-account-tag">Signed In</span>
                        <span className="profile-menu-account">{user.email}</span>
                      </div>
                      <NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>
                        Dashboard
                      </NavLink>
                      <NavLink to="/registration-details#team-details" onClick={() => setProfileOpen(false)}>
                        Team details
                      </NavLink>
                      <NavLink to="/registration-details#problem-statement" onClick={() => setProfileOpen(false)}>
                        Problem statement
                      </NavLink>
                      <NavLink to="/id-card#id-cards" onClick={() => setProfileOpen(false)}>
                        ID cards
                      </NavLink>
                      <NavLink to="/forgot-password" onClick={() => setProfileOpen(false)}>
                        Change password
                      </NavLink>
                      {isAdmin && (
                        <NavLink to="/admin" onClick={() => setProfileOpen(false)} className="admin-menu-link">
                          Admin mission control
                        </NavLink>
                      )}
                      <button className="text-button sign-out-btn" onClick={() => void handleSignOut()}>
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="profile-menu-header">
                        <span className="profile-account-tag">Mission Portal</span>
                      </div>
                      <NavLink to="/login" onClick={() => setProfileOpen(false)}>
                        Log in
                      </NavLink>
                      <NavLink to="/signup" onClick={() => setProfileOpen(false)}>
                        Create account
                      </NavLink>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="menu-toggle"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      <main id="main">
        {loginToast && (
          <Notice popup toastOnly>Account login successful.</Notice>
        )}
        {logoutToast && (
          <Notice popup toastOnly>Account logged out successfully.</Notice>
        )}
        {(callbackError || accountError) && (
          <div className="auth-callback-notice" role="alert">{callbackError || accountError}</div>
        )}
        <RouteContent />
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <section className="footer-brand-block" aria-label="BIAS-NSAC">
            <Link className="footer-brand" to="/" aria-label="BIAS-NSAC home">
              <img src="/img/event-mark.png" alt="" width="54" height="54" loading="lazy" />
              <span><strong>BIAS-NSAC</strong><small>BHIMTAL · UTTARAKHAND</small></span>
            </Link>
            <p>Birla Institute of Applied Sciences organizes the local NASA International Space Apps Challenge 2026 in Bhimtal.</p>
            <a className="footer-official-link" href={officialUrl} target="_blank" rel="noreferrer">
              <Globe2 size={16} /> Official Space Apps website <ArrowUpRight size={14} />
            </a>
          </section>

          <section className="footer-event-block" aria-label="Event details">
            <span className="footer-column-label">ORGANIZED BY BIAS</span>
            <h2>Explore ideas. Build together.</h2>
            <p><CalendarDays size={16} /> 14–16 November 2026</p>
            <p><MapPin size={16} /> Birla Institute of Applied Sciences<br /><span>Bhimtal, Uttarakhand, India</span></p>
            <a className="footer-directions" href={directionsUrl} target="_blank" rel="noreferrer">
              Get directions <ArrowUpRight size={14} />
            </a>
          </section>

          <nav className="footer-link-group" aria-label="Explore the event">
            <span className="footer-column-label">EXPLORE</span>
            <Link to="/about">About the challenge</Link>
            <Link to="/venue-schedule">Event schedule</Link>
            <Link to="/gallery">Photo & video gallery</Link>
            <Link to="/faq">Frequently asked questions</Link>
          </nav>

          <nav className="footer-link-group" aria-label="Participate and get help">
            <span className="footer-column-label">TAKE PART</span>
            <Link to="/how-to-register">How to register</Link>
            <Link to="/school">School category</Link>
            <Link to="/college">College category</Link>
            <Link to="/register">Register a team</Link>
            <Link to="/contact">Contact & venue</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>Organized by Birla Institute of Applied Sciences, Bhimtal, Uttarakhand.</span>
          <span>© 2026 · Built for curious minds.</span>
        </div>
      </footer>
    </>
  );
}
