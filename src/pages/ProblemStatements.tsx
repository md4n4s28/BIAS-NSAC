import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Search, Sparkles, Filter, ArrowRight, RotateCcw, CheckCircle2, Globe2 } from 'lucide-react';
import { problemStatements } from '../data/problem-statements';

export default function ProblemStatements() {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Extract all unique subjects
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    problemStatements.forEach((ps) => {
      ps.subjects.forEach((subj) => set.add(subj));
    });
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return problemStatements.filter((ps) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ps.title.toLowerCase().includes(query) ||
        ps.description.toLowerCase().includes(query) ||
        ps.subjects.some((s) => s.toLowerCase().includes(query)) ||
        ps.id.includes(query);

      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        ps.difficulties.some((d) => d.toLowerCase() === selectedDifficulty.toLowerCase());

      const matchesSubject =
        selectedSubject === 'All' ||
        ps.subjects.includes(selectedSubject);

      return matchesSearch && matchesDifficulty && matchesSubject;
    });
  }, [search, selectedDifficulty, selectedSubject]);

  const hasActiveFilters = search.trim() !== '' || selectedDifficulty !== 'All' || selectedSubject !== 'All';

  const resetFilters = () => {
    setSearch('');
    setSelectedDifficulty('All');
    setSelectedSubject('All');
  };

  return (
    <div className="page problem-statements-page">
      {/* Hero Header */}
      <header className="ps-hero">
        <div className="ps-hero-badge">
          <Sparkles size={14} className="accent-sparkle" />
          <span>2026 NASA SPACE APPS CHALLENGE</span>
        </div>
        <h1 className="ps-hero-title">Official Problem Statements</h1>
        <p className="ps-hero-description">
          Choose from <strong>14 official global challenges</strong> designed by NASA scientists and engineers.
          Teams at BIAS Bhimtal can build innovative software applications or functional hardware prototypes during the 36-hour hackathon.
          Top projects will advance as official <strong>Global Nominees</strong> for worldwide judging!
        </p>

        <div className="ps-hero-actions">
          <a
            href="https://www.spaceappschallenge.org/2026/challenges/"
            target="_blank"
            rel="noopener noreferrer"
            className="button button-outline ps-nasa-hub-btn"
          >
            <Globe2 size={16} />
            <span>NASA Space Apps Challenges Portal</span>
            <ExternalLink size={14} />
          </a>
          <Link to="/register" className="button button-primary">
            <span>Register Your Team</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Essential Rules Notice */}
        <div className="ps-guidelines-banner">
          <div className="ps-guidelines-item">
            <CheckCircle2 size={16} className="text-accent" />
            <span><strong>Build on-site:</strong> All code and prototypes must be created during the event. Pre-built projects face mark deductions.</span>
          </div>
          <div className="ps-guidelines-item">
            <CheckCircle2 size={16} className="text-accent" />
            <span><strong>Global Nominee:</strong> Outstanding solutions advance to NASA’s international panel of judges.</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <section className="ps-controls-panel">
        <div className="ps-search-box">
          <Search size={18} className="ps-search-icon" />
          <input
            type="search"
            placeholder="Search by challenge name, keyword, or topic (e.g. Earth, AI, Mars, Radar)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-search-input"
            aria-label="Search problem statements"
          />
          {search && (
            <button
              type="button"
              className="ps-clear-search-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="ps-filters-row">
          <div className="ps-filter-group">
            <span className="ps-filter-label">
              <Filter size={14} /> Difficulty:
            </span>
            <div className="ps-pill-group">
              {['All', 'Beginner/Youth', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`ps-filter-pill ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="ps-filter-group ps-subject-group">
            <label htmlFor="subject-select" className="ps-filter-label">Subject:</label>
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="ps-subject-select"
            >
              <option value="All">All Subjects ({allSubjects.length})</option>
              {allSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button type="button" className="ps-reset-btn" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        <div className="ps-results-meta">
          <span>Showing <strong>{filtered.length}</strong> of {problemStatements.length} challenges</span>
        </div>
      </section>

      {/* Challenges List */}
      <main className="ps-cards-container">
        {filtered.length === 0 ? (
          <div className="ps-empty-state">
            <div className="ps-empty-icon">🚀</div>
            <h3>No matching problem statements found</h3>
            <p>Try searching for a different keyword or resetting your filter criteria.</p>
            <button type="button" className="button button-outline" onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        ) : (
          filtered.map((ps) => (
            <article
              key={ps.id}
              id={`ps-${ps.id}`}
              className="ps-detail-card"
            >
              {/* Header */}
              <div className="ps-card-header">
                <div className="ps-card-badges">
                  <span className="ps-number-badge">CHALLENGE {ps.id}</span>
                  <span className="ps-event-badge">{ps.event}</span>
                  <div className="ps-difficulties-list">
                    {ps.difficulties.map((diff) => {
                      const lower = diff.toLowerCase();
                      const modifier = lower.includes('beginner')
                        ? 'beginner'
                        : lower.includes('advanced')
                        ? 'advanced'
                        : 'intermediate';
                      return (
                        <span key={diff} className={`ps-difficulty-badge ps-diff-${modifier}`}>
                          {diff}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <h2 className="ps-card-title">{ps.title}</h2>

                {/* Subjects */}
                <div className="ps-subjects-list" aria-label="Challenge subjects">
                  {ps.subjects.map((subj) => (
                    <span
                      key={subj}
                      className={`ps-subject-tag ${selectedSubject === subj ? 'active-tag' : ''}`}
                      onClick={() => setSelectedSubject(subj === selectedSubject ? 'All' : subj)}
                      role="button"
                      tabIndex={0}
                      title={`Filter by ${subj}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedSubject(subj === selectedSubject ? 'All' : subj);
                        }
                      }}
                    >
                      #{subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              <div className="ps-card-body">
                <h4 className="ps-desc-heading">Challenge Overview & Objective</h4>
                <p className="ps-desc-text">{ps.description}</p>
              </div>

              {/* Card Actions */}
              <div className="ps-card-actions">
                <a
                  href={ps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-outline ps-official-link-btn"
                  aria-label={`Open official NASA page for ${ps.title}`}
                >
                  <Globe2 size={16} />
                  <span>Official NASA Problem Brief</span>
                  <ExternalLink size={14} />
                </a>

                <Link
                  to={`/register`}
                  className="button button-primary ps-register-btn"
                >
                  <span>Select in Registration</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Footer Info Box */}
      <footer className="ps-footer-note">
        <p>
          Need assistance understanding the problem requirements or forming a team? Join our community or visit the{' '}
          <Link to="/faq">FAQs</Link> to learn about the judging criteria, on-site prototype guidelines, and global nominee advancement.
        </p>
      </footer>
    </div>
  );
}
