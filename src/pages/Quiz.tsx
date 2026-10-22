import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Rocket,
  Lightbulb,
  Award,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Share2,
  Copy,
  Layers,
  Compass,
  AlertTriangle,
  Clock,
  Timer,
} from 'lucide-react';
import {
  questions,
  checkAnswer,
  isAnswered,
  type QuizQuestion,
  type UserAnswerValue,
  type SingleChoiceQuestion,
  type BooleanQuestion,
  type MultiSelectQuestion,
  type SequenceQuestion,
  type MatchQuestion,
} from '../data/quiz';
import { PageIntro } from '../components/UI';

export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, boolean>>({});

  const getInitialAnswers = (): UserAnswerValue[] => {
    return questions.map((q) => {
      if (q.type === 'sequence') {
        return [...q.items];
      }
      if (q.type === 'multi') {
        return [] as number[];
      }
      if (q.type === 'match') {
        return {} as Record<string, string>;
      }
      return null;
    });
  };

  const [answers, setAnswers] = useState<UserAnswerValue[]>(getInitialAnswers());
  const [checked, setChecked] = useState<boolean[]>(questions.map(() => false));

  // Live stopwatch timer when quiz is in progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (started && !finished) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, finished]);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTimerFriendly = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getPaceRating = (totalSeconds: number) => {
    if (totalSeconds < 90) return 'Hypersonic Flight';
    if (totalSeconds < 180) return 'Nominal Orbital Pace';
    return 'Analytical Deep-Scan';
  };

  // Score calculation
  const correctCount = questions.filter((question, pos) =>
    checkAnswer(question, answers[pos])
  ).length;

  const currentQuestion: QuizQuestion = questions[index];
  const isCurrentChecked = checked[index];
  const currentAnswer = answers[index];
  const isCurrentValid = isAnswered(currentQuestion, currentAnswer);
  const isCurrentCorrect = checkAnswer(currentQuestion, currentAnswer);

  const restart = () => {
    setStarted(true);
    setIndex(0);
    setSecondsElapsed(0);
    setAnswers(getInitialAnswers());
    setChecked(questions.map(() => false));
    setHintsRevealed({});
    setFinished(false);
    setReviewFilter('all');
  };

  const updateCurrentAnswer = (newVal: UserAnswerValue) => {
    if (isCurrentChecked) return; // locked once checked
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = newVal;
      return next;
    });
  };

  const handleSequenceMove = (itemIndex: number, direction: 'up' | 'down') => {
    if (isCurrentChecked) return;
    const currentList = Array.isArray(currentAnswer)
      ? ([...currentAnswer] as string[])
      : [...(currentQuestion as SequenceQuestion).items];

    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const temp = currentList[itemIndex];
    currentList[itemIndex] = currentList[targetIndex];
    currentList[targetIndex] = temp;

    updateCurrentAnswer(currentList);
  };

  const handleMultiToggle = (optionIndex: number) => {
    if (isCurrentChecked) return;
    const currentSelected = Array.isArray(currentAnswer)
      ? ([...currentAnswer] as number[])
      : [];
    const exists = currentSelected.includes(optionIndex);
    const updated = exists
      ? currentSelected.filter((i) => i !== optionIndex)
      : [...currentSelected, optionIndex];
    updateCurrentAnswer(updated);
  };

  const handleMatchSelect = (leftKey: string, rightVal: string) => {
    if (isCurrentChecked) return;
    const currentMap =
      typeof currentAnswer === 'object' && currentAnswer !== null && !Array.isArray(currentAnswer)
        ? { ...(currentAnswer as Record<string, string>) }
        : {};

    if (!rightVal) {
      delete currentMap[leftKey];
    } else {
      currentMap[leftKey] = rightVal;
    }
    updateCurrentAnswer(currentMap);
  };

  const getRank = (score: number) => {
    if (score >= 11) {
      return {
        title: 'Cosmic Flight Commander',
        tier: 'Commander',
        badge: '🏆',
        message: 'Mastery over the stars. Your cosmic aptitude places you in elite astronautical command.',
      };
    }
    if (score >= 8) {
      return {
        title: 'Mission Flight Director',
        tier: 'Specialist',
        badge: '🚀',
        message: 'Impressive scientific intellect. You possess deep knowledge of astrophysics and space exploration.',
      };
    }
    if (score >= 5) {
      return {
        title: 'Orbital Navigator',
        tier: 'Navigator',
        badge: '🛰️',
        message: 'Solid celestial foundation. With continuous curiosity, you are well on your way to orbital command.',
      };
    }
    return {
      title: 'Astrophysics Cadet',
      tier: 'Cadet',
      badge: '🛸',
      message: 'Every great astronomer began with unanswered questions. Review the science debriefs and try again!',
    };
  };

  const copyResults = () => {
    const rank = getRank(correctCount);
    const text = `🌌 BIAS Space Challenge Quiz: I scored ${correctCount}/${questions.length} as [${rank.title}] in ${formatTimerFriendly(secondsElapsed)} (${formatTimer(secondsElapsed)})! Test your cosmic IQ at ${window.location.origin}/quiz`;
    navigator.clipboard?.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Category stats calculation for results
  const categoriesMap = questions.reduce<Record<string, { total: number; correct: number }>>(
    (acc, q, pos) => {
      if (!acc[q.category]) {
        acc[q.category] = { total: 0, correct: 0 };
      }
      acc[q.category].total += 1;
      if (checkAnswer(q, answers[pos])) {
        acc[q.category].correct += 1;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="page quiz-page">
      <PageIntro
        eyebrow="ASTRONOMY · ROCKTRY · COSMOLOGY · DISCOVERY"
        title="COSMIC INTELLIGENCE QUIZ"
      >
        Explore varied challenges—from deep space MCQs and Cosmic Fact vs. Myth checks to orbital sequencing and mission milestones.
      </PageIntro>

      {!started ? (
        <div className="quiz-start panel cosmic-start-panel">
          <div className="quiz-start-header">
            <span className="quiz-badge-glow">
              <Sparkles size={16} /> 12 MULTI-FORMAT MISSIONS
            </span>
            <h2>Ready to Test Your Cosmic IQ?</h2>
            <p>
              Step into the shoes of an astrophysicist. Encounter classic queries, true/false cosmic fact-checks, orbital reordering puzzles, and mission milestone matchings.
            </p>
          </div>

          <div className="quiz-features-row">
            <div className="quiz-feat-pill">
              <span className="feat-icon">🪐</span>
              <div>
                <strong>Varied Question Types</strong>
                <small>MCQ, Fact vs Myth, Sequences & Match</small>
              </div>
            </div>
            <div className="quiz-feat-pill">
              <span className="feat-icon">💡</span>
              <div>
                <strong>Mission Debriefs</strong>
                <small>Learn the real physics behind every answer</small>
              </div>
            </div>
            <div className="quiz-feat-pill">
              <span className="feat-icon">⏱️</span>
              <div>
                <strong>Live Mission Stopwatch</strong>
                <small>Track your celestial flight time & pace</small>
              </div>
            </div>
          </div>

          <div className="quiz-start-actions">
            <button className="button button-gold-pulse" onClick={() => setStarted(true)}>
              INITIATE LAUNCH <ArrowRight size={18} />
            </button>
            <span className="quiz-quick-note">No login required · Live mission timer starts on launch</span>
          </div>
        </div>
      ) : finished ? (
        <div className="quiz-results panel cosmic-results-panel">
          {/* Results Header */}
          <div className="results-top-banner">
            <span className="eyebrow">
              <Sparkles size={14} /> MISSION LOG CONCLUDED
            </span>
            <div className="rank-badge-box">
              <span className="rank-icon">{getRank(correctCount).badge}</span>
              <div className="rank-text">
                <small className="rank-tier">OFFICIAL DESIGNATION</small>
                <h3>{getRank(correctCount).title}</h3>
              </div>
            </div>
          </div>

          {/* Score Meter & Metrics */}
          <div className="results-score-grid">
            <div className="score-dial-card">
              <div className="score-number-display">
                <span className="score-big">{correctCount}</span>
                <span className="score-divider">/</span>
                <span className="score-total">{questions.length}</span>
              </div>
              <div className="score-pct-bar">
                <div
                  className="score-pct-fill"
                  style={{ width: `${Math.round((correctCount / questions.length) * 100)}%` }}
                />
              </div>
              <span className="score-pct-text">
                {Math.round((correctCount / questions.length) * 100)}% Mission Accuracy
              </span>

              {/* Live Time metrics */}
              <div className="score-time-metrics">
                <div className="time-metric-box">
                  <Clock size={16} />
                  <div>
                    <small>TOTAL MISSION TIME</small>
                    <strong>{formatTimerFriendly(secondsElapsed)} ({formatTimer(secondsElapsed)})</strong>
                  </div>
                </div>
                <div className="time-metric-box">
                  <Timer size={16} />
                  <div>
                    <small>AVERAGE PACE</small>
                    <strong>{(secondsElapsed / questions.length).toFixed(1)}s / mission</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="score-insight-card">
              <div>
                <div className="insight-top-tag">
                  <span className="pace-badge">
                    <Rocket size={13} /> {getPaceRating(secondsElapsed)}
                  </span>
                </div>
                <h4>Flight Evaluation</h4>
                <p>{getRank(correctCount).message}</p>
              </div>

              <div className="category-performance-list">
                {Object.entries(categoriesMap).map(([category, stats]) => (
                  <div key={category} className="cat-perf-item">
                    <span className="cat-name">{category}</span>
                    <span className="cat-stat">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="results-action-bar">
            <button className="button" onClick={restart}>
              <RotateCcw size={17} /> Relaunch Mission
            </button>
            <button className="button button-secondary" onClick={copyResults}>
              {copiedNotification ? (
                <>
                  <Check size={17} /> Log Copied to Clipboard!
                </>
              ) : (
                <>
                  <Share2 size={17} /> Share Flight Score
                </>
              )}
            </button>
          </div>

          {/* Interactive Review Section */}
          <div className="results-review-section">
            <div className="review-section-header">
              <h3>Scientific Debrief & Review</h3>
              <div className="review-filter-buttons">
                <button
                  className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('all')}
                >
                  All ({questions.length})
                </button>
                <button
                  className={`filter-btn ${reviewFilter === 'correct' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('correct')}
                >
                  Correct ({correctCount})
                </button>
                <button
                  className={`filter-btn ${reviewFilter === 'incorrect' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('incorrect')}
                >
                  Review Needed ({questions.length - correctCount})
                </button>
              </div>
            </div>

            <div className="review-cards-list">
              {questions.map((q, idx) => {
                const isCorrect = checkAnswer(q, answers[idx]);
                if (reviewFilter === 'correct' && !isCorrect) return null;
                if (reviewFilter === 'incorrect' && isCorrect) return null;

                return (
                  <div
                    key={q.id}
                    className={`review-card ${isCorrect ? 'review-correct' : 'review-incorrect'}`}
                  >
                    <div className="review-card-top">
                      <span className="review-q-num">Q{idx + 1}</span>
                      <span className="review-cat-tag">{q.category}</span>
                      <span className={`review-status-pill ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={14} /> Solved
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Anomaly
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="review-q-title">{q.question}</h4>
                    {q.type === 'boolean' && (
                      <p className="review-statement">
                        <em>"{q.statement}"</em> &rarr;{' '}
                        <strong>{q.answer ? 'Cosmic Fact' : 'Space Myth'}</strong>
                      </p>
                    )}

                    <div className="review-explanation">
                      <Lightbulb size={16} />
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-question panel cosmic-question-panel">
          {/* Top Mission HUD */}
          <div className="quiz-hud">
            <div className="hud-meta-left">
              <span className="hud-cat-pill">
                <Compass size={13} /> {currentQuestion.category}
              </span>
              <span className={`hud-difficulty-pill diff-${currentQuestion.difficulty.toLowerCase()}`}>
                {currentQuestion.difficulty} Tier
              </span>
              <span className="hud-type-pill">
                {currentQuestion.type === 'boolean' && 'Cosmic Fact vs Myth'}
                {currentQuestion.type === 'single' && 'Multiple Choice'}
                {currentQuestion.type === 'multi' && 'Multi-Select'}
                {currentQuestion.type === 'sequence' && 'Sequence Reorder'}
                {currentQuestion.type === 'match' && 'Mission Matching'}
              </span>
            </div>

            <div className="hud-meta-right">
              {/* Mission Stopwatch Clock */}
              <div className="hud-timer">
                <div className="hud-timer-badge">
                  <span className="hud-live-dot" />
                  <Clock size={13} />
                  <span className="hud-timer-digits">{formatTimer(secondsElapsed)}</span>
                </div>
                <span className="hud-timer-caption">MISSION TIME</span>
              </div>

              <div className="hud-counter">
                <span>MISSION STEP</span>
                <strong>
                  {String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                </strong>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="quiz-progress-track">
            <div
              className="quiz-progress-bar"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Title & Prompt */}
          <div className="quiz-prompt-header">
            <h2>{currentQuestion.question}</h2>
            {currentQuestion.type === 'multi' && currentQuestion.instruction && (
              <p className="quiz-subinstruction">
                <Layers size={15} /> {currentQuestion.instruction}
              </p>
            )}
            {currentQuestion.type === 'sequence' && currentQuestion.instruction && (
              <p className="quiz-subinstruction">
                <Compass size={15} /> {currentQuestion.instruction}
              </p>
            )}
            {currentQuestion.type === 'match' && currentQuestion.instruction && (
              <p className="quiz-subinstruction">
                <Award size={15} /> {currentQuestion.instruction}
              </p>
            )}
          </div>

          {/* ==================================================== */}
          {/* QUESTION TYPE 1: SINGLE CHOICE                       */}
          {/* ==================================================== */}
          {currentQuestion.type === 'single' && (
            <fieldset className="quiz-options single-choice-grid">
              <legend className="sr-only">Choose one option</legend>
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = currentAnswer === optIdx;
                const isCorrectOpt = currentQuestion.answer === optIdx;

                let optClass = 'quiz-option-card';
                if (isSelected) optClass += ' selected';
                if (isCurrentChecked) {
                  if (isCorrectOpt) optClass += ' state-correct';
                  else if (isSelected) optClass += ' state-incorrect';
                }

                return (
                  <button
                    type="button"
                    key={option}
                    className={optClass}
                    disabled={isCurrentChecked}
                    onClick={() => updateCurrentAnswer(optIdx)}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                    <span className="opt-text">{option}</span>
                    {isCurrentChecked && isCorrectOpt && (
                      <Check className="opt-icon-status correct" size={18} />
                    )}
                    {isCurrentChecked && isSelected && !isCorrectOpt && (
                      <X className="opt-icon-status incorrect" size={18} />
                    )}
                  </button>
                );
              })}
            </fieldset>
          )}

          {/* ==================================================== */}
          {/* QUESTION TYPE 2: BOOLEAN (COSMIC FACT OR MYTH)       */}
          {/* ==================================================== */}
          {currentQuestion.type === 'boolean' && (
            <div className="quiz-boolean-wrapper">
              <div className="boolean-statement-box">
                <span className="statement-quotes">“</span>
                <p className="statement-text">{currentQuestion.statement}</p>
                <span className="statement-quotes-close">”</span>
              </div>

              <div className="boolean-cards-row">
                {/* FACT CARD (TRUE) */}
                <button
                  type="button"
                  className={`boolean-choice-card fact-card ${
                    currentAnswer === true ? 'selected' : ''
                  } ${
                    isCurrentChecked && currentQuestion.answer === true
                      ? 'state-correct'
                      : isCurrentChecked && currentAnswer === true && !currentQuestion.answer
                        ? 'state-incorrect'
                        : ''
                  }`}
                  disabled={isCurrentChecked}
                  onClick={() => updateCurrentAnswer(true)}
                >
                  <div className="bool-icon-wrap">
                    <Sparkles size={24} />
                  </div>
                  <div className="bool-content">
                    <span className="bool-label">{currentQuestion.factLabel || 'Cosmic Fact'}</span>
                    <small>Scientifically accurate & confirmed</small>
                  </div>
                  {isCurrentChecked && currentQuestion.answer === true && (
                    <Check className="bool-status-icon correct" size={22} />
                  )}
                  {isCurrentChecked && currentAnswer === true && !currentQuestion.answer && (
                    <X className="bool-status-icon incorrect" size={22} />
                  )}
                </button>

                {/* MYTH CARD (FALSE) */}
                <button
                  type="button"
                  className={`boolean-choice-card myth-card ${
                    currentAnswer === false ? 'selected' : ''
                  } ${
                    isCurrentChecked && currentQuestion.answer === false
                      ? 'state-correct'
                      : isCurrentChecked && currentAnswer === false && currentQuestion.answer
                        ? 'state-incorrect'
                        : ''
                  }`}
                  disabled={isCurrentChecked}
                  onClick={() => updateCurrentAnswer(false)}
                >
                  <div className="bool-icon-wrap">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="bool-content">
                    <span className="bool-label">{currentQuestion.mythLabel || 'Space Myth'}</span>
                    <small>Common misconception or fiction</small>
                  </div>
                  {isCurrentChecked && currentQuestion.answer === false && (
                    <Check className="bool-status-icon correct" size={22} />
                  )}
                  {isCurrentChecked && currentAnswer === false && currentQuestion.answer && (
                    <X className="bool-status-icon incorrect" size={22} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* QUESTION TYPE 3: MULTI-SELECT                        */}
          {/* ==================================================== */}
          {currentQuestion.type === 'multi' && (
            <div className="quiz-multi-wrapper">
              <div className="multi-selection-indicator">
                <span>
                  {Array.isArray(currentAnswer) ? currentAnswer.length : 0} item
                  {Array.isArray(currentAnswer) && currentAnswer.length === 1 ? '' : 's'} selected
                </span>
                <span className="multi-hint-tag">Multiple answers apply</span>
              </div>

              <div className="quiz-multi-grid">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected =
                    Array.isArray(currentAnswer) && (currentAnswer as number[]).includes(optIdx);
                  const isCorrect = currentQuestion.answer.includes(optIdx);

                  let multiClass = 'quiz-multi-card';
                  if (isSelected) multiClass += ' selected';
                  if (isCurrentChecked) {
                    if (isCorrect) multiClass += ' state-correct';
                    else if (isSelected) multiClass += ' state-incorrect';
                  }

                  return (
                    <button
                      type="button"
                      key={opt}
                      className={multiClass}
                      disabled={isCurrentChecked}
                      onClick={() => handleMultiToggle(optIdx)}
                    >
                      <div className="multi-checkbox">
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="multi-opt-label">{opt}</span>
                      {isCurrentChecked && isCorrect && (
                        <span className="multi-tag-correct">Correct Item</span>
                      )}
                      {isCurrentChecked && isSelected && !isCorrect && (
                        <span className="multi-tag-wrong">Not an answer</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* QUESTION TYPE 4: SEQUENCE REORDER                    */}
          {/* ==================================================== */}
          {currentQuestion.type === 'sequence' && (
            <div className="quiz-sequence-wrapper">
              <div className="sequence-items-list">
                {((Array.isArray(currentAnswer)
                  ? currentAnswer
                  : currentQuestion.items) as string[]
                ).map((item, itemIdx, arr) => {
                  const isCorrectPos =
                    isCurrentChecked && currentQuestion.correctOrder[itemIdx] === item;

                  return (
                    <div
                      key={item}
                      className={`sequence-card ${
                        isCurrentChecked
                          ? isCorrectPos
                            ? 'state-correct'
                            : 'state-incorrect'
                          : ''
                      }`}
                    >
                      <div className="sequence-step-num">
                        <span className="step-badge">STEP {String(itemIdx + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="sequence-text">{item}</div>
                      {!isCurrentChecked ? (
                        <div className="sequence-controls">
                          <button
                            type="button"
                            className="seq-btn"
                            disabled={itemIdx === 0}
                            title="Move earlier"
                            onClick={() => handleSequenceMove(itemIdx, 'up')}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            className="seq-btn"
                            disabled={itemIdx === arr.length - 1}
                            title="Move later"
                            onClick={() => handleSequenceMove(itemIdx, 'down')}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="sequence-status-box">
                          {isCorrectPos ? (
                            <span className="seq-correct-tag">
                              <Check size={14} /> Correct Position
                            </span>
                          ) : (
                            <span className="seq-wrong-tag">
                              <X size={14} /> Expected: #
                              {currentQuestion.correctOrder.indexOf(item) + 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isCurrentChecked && !isCurrentCorrect && (
                <div className="sequence-expected-reveal">
                  <strong>Expected Sequence:</strong>
                  <ol>
                    {currentQuestion.correctOrder.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* QUESTION TYPE 5: MATCH PAIRING                       */}
          {/* ==================================================== */}
          {currentQuestion.type === 'match' && (
            <div className="quiz-match-wrapper">
              <div className="match-rows-container">
                {currentQuestion.pairs.map((pair, pIdx) => {
                  const matchMap =
                    typeof currentAnswer === 'object' &&
                    currentAnswer !== null &&
                    !Array.isArray(currentAnswer)
                      ? (currentAnswer as Record<string, string>)
                      : {};
                  const userSelection = matchMap[pair.left] || '';
                  const isPairCorrect = isCurrentChecked && userSelection === pair.right;

                  // Right options to show in dropdown
                  const allRightOptions = currentQuestion.pairs.map((p) => p.right);

                  return (
                    <div
                      key={pair.left}
                      className={`match-row-card ${
                        isCurrentChecked
                          ? isPairCorrect
                            ? 'state-correct'
                            : 'state-incorrect'
                          : ''
                      }`}
                    >
                      <div className="match-left-item">
                        <span className="match-badge">Target {pIdx + 1}</span>
                        <strong>{pair.left}</strong>
                      </div>

                      <div className="match-divider">&rarr;</div>

                      <div className="match-right-item">
                        {!isCurrentChecked ? (
                          <select
                            className="match-select-input"
                            value={userSelection}
                            onChange={(e) => handleMatchSelect(pair.left, e.target.value)}
                          >
                            <option value="">-- Choose matching milestone --</option>
                            {allRightOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="match-reveal-text">
                            <span
                              className={`match-selected-value ${
                                isPairCorrect ? 'correct' : 'incorrect'
                              }`}
                            >
                              {userSelection || 'No selection'}
                            </span>
                            {!isPairCorrect && (
                              <small className="match-correct-answer">
                                Correct: {pair.right}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Hint Drawer */}
          <div className="quiz-hint-section">
            <button
              type="button"
              className="quiz-hint-toggle"
              onClick={() =>
                setHintsRevealed((prev) => ({ ...prev, [index]: !prev[index] }))
              }
            >
              <Lightbulb size={15} />
              {hintsRevealed[index] ? 'Hide Mission Clue' : 'Need a Clue? Consult NASA Archives'}
            </button>
            {hintsRevealed[index] && (
              <div className="quiz-hint-bubble">
                <span className="hint-label">MISSION CLUE:</span>
                <p>{currentQuestion.hint}</p>
              </div>
            )}
          </div>

          {/* Feedback & Debrief Panel */}
          {isCurrentChecked && (
            <div
              className={`quiz-feedback-box ${
                isCurrentCorrect ? 'feedback-correct' : 'feedback-incorrect'
              }`}
            >
              <div className="feedback-header">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 size={20} className="icon-success" />
                    <strong>Trajectory Confirmed! Direct hit.</strong>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="icon-error" />
                    <strong>Orbital Drift. Trajectory revised.</strong>
                  </>
                )}
              </div>
              <p className="feedback-explanation">
                <strong>Science Insight:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action / Navigation Controls */}
          <div className="quiz-controls-row">
            <button
              type="button"
              className="button button-secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <ArrowLeft size={16} /> Previous Mission
            </button>

            {!isCurrentChecked ? (
              <button
                type="button"
                className="button button-gold-action"
                disabled={!isCurrentValid}
                onClick={() =>
                  setChecked((curr) => {
                    const next = [...curr];
                    next[index] = true;
                    return next;
                  })
                }
              >
                Confirm Trajectory <Check size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="button button-gold-action"
                onClick={() => {
                  if (index === questions.length - 1) {
                    setFinished(true);
                  } else {
                    setIndex(index + 1);
                  }
                }}
              >
                {index === questions.length - 1 ? 'Complete Flight Log' : 'Next Mission'}{' '}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
