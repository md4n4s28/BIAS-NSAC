import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type EventPhase = 'upcoming' | 'live' | 'complete';

const EVENT_START = Date.parse('2026-11-13T18:30:00Z');
const EVENT_END = Date.parse('2026-11-16T18:30:00Z');

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [eventPhase, setEventPhase] = useState<EventPhase>('upcoming');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      if (now >= EVENT_END) {
        setEventPhase('complete');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      if (now >= EVENT_START) {
        setEventPhase('live');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setEventPhase('upcoming');
      const difference = EVENT_START - now;
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown-section section">
      <div className="countdown-container">
        <h2 className="sr-only">Event countdown</h2>
        <div className="countdown">
          <div className="countdown-heading">
            <div className={`countdown-label countdown-label-${eventPhase}`}>
              <span className="live-dot" aria-hidden="true" />
              {eventPhase === 'upcoming'
                ? 'COUNTDOWN TO LIFTOFF'
                : eventPhase === 'live'
                  ? 'LIFTOFF IN PROGRESS'
                  : 'MISSION COMPLETE'}
            </div>
            <p className="countdown-tagline">
              {eventPhase === 'upcoming'
                ? 'The next great idea is closer than you think.'
                : eventPhase === 'live'
                  ? 'Three days of curiosity, collaboration, and discovery.'
                  : 'Thank you for being part of the 2026 mission.'}
            </p>
          </div>
          {eventPhase === 'upcoming' && (
            <div className="countdown-numbers" role="timer" aria-label="Time until the event begins">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className={`countdown-unit countdown-unit-${unit.label.toLowerCase()}`}>
                  <strong>{String(unit.value).padStart(2, '0')}</strong>
                  <span>{unit.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="countdown-date">
          <span>14–16 November 2026</span>
          <span aria-hidden="true">·</span>
          <span>Bhimtal, Uttarakhand</span>
          <span className="countdown-timezone">Indian Standard Time</span>
        </p>
      </div>
    </section>
  );
}
