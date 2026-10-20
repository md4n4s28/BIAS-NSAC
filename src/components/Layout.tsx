import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Menu, X, MapPin, UserRound, CalendarDays, Globe2 } from 'lucide-react';
import type { SectionBackgroundName } from './SectionBackground';
import { useAuth } from '../lib/auth';
import { directionsUrl, officialUrl } from '../data/event';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountError, setAccountError] = useState('');
  const location = useLocation();
  const { user, isAdmin, signOut, callbackError } = useAuth();

  async function handleSignOut() {
    setAccountError('');
    try {
      await signOut();
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
    } finally {
      setProfileOpen(false);
    }
  }

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="header">
        <Link className="brand" to="/" aria-label="BIAS-NSAC home">
          <img className="brand-logo" src="/img/event-mark.png" alt="" width="52" height="52" />
          <span>
            BIAS-NSAC
            <small>Bhimtal | Uttarakhand</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">The event</NavLink>
          <NavLink to="/venue-schedule">Schedule</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/quiz">
            Space quiz
            <span className="nav-dot" />
          </NavLink>
          <NavLink to="/faq">FAQs</NavLink>
          <div className="profile-dropdown">
            <button
              className="profile-trigger profile-icon-button"
              aria-expanded={profileOpen}
              aria-label={user ? 'Open profile menu' : 'Open account menu'}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <UserRound size={16} />
              {user && <span className="profile-label">Profile</span>}
            </button>
            {profileOpen && (
              <div className="profile-menu">
                {user ? (
                  <>
                    <span className="profile-menu-account">{user.email}</span>
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
                    {isAdmin && <NavLink to="/admin" onClick={() => setProfileOpen(false)}>Admin mission control</NavLink>}
                    <button className="text-button sign-out-btn" onClick={() => void handleSignOut()}>
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
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
        </nav>
      </header>
      <main id="main">
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
            <Link to="/school">School category</Link>
            <Link to="/college">College category</Link>
            <Link to="/register">Register a team</Link>
            <Link to="/contact">Contact & venue</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>Organized by Birla Institute of Applied Sciences, Bhimtal, Uttarakhand.</span>
          <Link to="/admin/login">Organizer access</Link>
          <span>© 2026 · Built for curious minds.</span>
        </div>
      </footer>
    </>
  );
}
