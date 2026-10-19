import { useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { questions } from '../data/quiz';
import { PageIntro } from '../components/UI';

export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null)
  );
  const [checked, setChecked] = useState<boolean[]>(questions.map(() => false));
  const [finished, setFinished] = useState(false);

  const score = questions.filter(
    (question, position) => question.answer === answers[position]
  ).length;

  const restart = () => {
    setStarted(true);
    setIndex(0);
    setAnswers(questions.map(() => null));
    setChecked(questions.map(() => false));
    setFinished(false);
  };

  const question = questions[index];

  return (
    <div className="page quiz-page">
      <PageIntro
        eyebrow="10 QUESTIONS · INFINITE CURIOSITY"
        title="TEST YOUR KNOWLEDGE"
      >
        A little science. A little logic. A whole universe to think about.
      </PageIntro>

      {!started ? (
        <div className="quiz-start panel">
          <h2>Ready to test your cosmic IQ?</h2>
          <p>
            No sign-in needed. Choose one answer per question, check it, and
            learn something new.
          </p>
          <button className="button" onClick={() => setStarted(true)}>
            START QUIZ <ArrowRight size={18} />
          </button>
        </div>
      ) : finished ? (
        <div className="quiz-results panel">
          <span className="eyebrow">MISSION COMPLETE</span>
          <div className="score">
            {score}
            <span> / {questions.length}</span>
          </div>
          <h2>
            {score >= 8
              ? "You're thinking beyond the stars."
              : score >= 5
                ? 'A promising cosmic perspective.'
                : 'Every question starts a new journey.'}
          </h2>
          <p>{score} correct answers. Keep your curiosity alive.</p>
          <button className="button" onClick={restart}>
            Restart quiz <RotateCcw size={17} />
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              setFinished(false);
              setIndex(0);
            }}
          >
            Review answers
          </button>
        </div>
      ) : (
        <div className="quiz-question panel">
          <div className="quiz-progress-label">
            <span>QUESTION {String(index + 1).padStart(2, '0')}</span>
            <span>
              {index + 1} / {questions.length}
            </span>
          </div>
          <div className="quiz-progress">
            <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <h2>{question.question}</h2>
          <fieldset className="quiz-options">
            <legend className="sr-only">Choose one answer</legend>
            {question.options.map((option, optionIndex) => (
              <label
                className={`quiz-option ${
                  answers[index] === optionIndex ? 'selected' : ''
                } ${
                  checked[index] && question.answer === optionIndex
                    ? 'correct'
                    : ''
                } ${
                  checked[index] &&
                  answers[index] === optionIndex &&
                  question.answer !== optionIndex
                    ? 'incorrect'
                    : ''
                }`}
                key={option}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  checked={answers[index] === optionIndex}
                  disabled={checked[index]}
                  onChange={() =>
                    setAnswers((current) =>
                      current.map((value, position) =>
                        position === index ? optionIndex : value
                      )
                    )
                  }
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                {option}
                {checked[index] && question.answer === optionIndex && (
                  <Check size={18} />
                )}
              </label>
            ))}
          </fieldset>

          {checked[index] && (
            <p className="quiz-feedback" role="status">
              <strong>
                {answers[index] === question.answer
                  ? 'Correct!'
                  : 'Not quite.'}
              </strong>
              {' ' + question.explanation}
            </p>
          )}

          <div className="quiz-controls">
            <button
              className="button button-secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            {!checked[index] ? (
              <button
                className="button"
                disabled={answers[index] === null}
                onClick={() =>
                  setChecked((current) =>
                    current.map((value, position) =>
                      position === index ? true : value
                    )
                  )
                }
              >
                Check answer
              </button>
            ) : (
              <button
                className="button"
                onClick={() =>
                  index === questions.length - 1
                    ? setFinished(true)
                    : setIndex(index + 1)
                }
              >
                {index === questions.length - 1
                  ? 'View results'
                  : 'Next question'}{' '}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
