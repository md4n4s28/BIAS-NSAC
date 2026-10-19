import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { gallery } from '../data/event';
import { OptimizedImage } from '../components/UI';

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const move = (offset: number) =>
    setActive((current) =>
      current === null ? null : (current + offset + gallery.length) % gallery.length
    );

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'Tab') {
        const buttons = Array.from(
          document.querySelectorAll<HTMLButtonElement>('.lightbox button')
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[
          (current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length
        ]?.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handler);
      opener.current?.focus();
    };
  }, [active !== null]);

  return (
    <main className="page gallery-page">
      <div className="gallery-layout">
        <section className="gallery-stills" aria-labelledby="gallery-stills-title">
          <div className="gallery-section-heading">
            <div>
              <span className="eyebrow"><span />A MOMENT TO KEEP</span>
              <h2 id="gallery-stills-title">The photo archive.</h2>
            </div>
            <p>{gallery.length} photographs · Select any frame to view it up close.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((image, index) => (
              <button
                className="gallery-image"
                key={image.src}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setActive(index);
                }}
                aria-label={`Open event photograph ${index + 1}: ${image.caption}`}
              >
                <OptimizedImage src={image.src} alt={image.caption} />
              </button>
            ))}
          </div>
        </section>

        <aside className="gallery-film" aria-labelledby="gallery-film-title">
          <div className="gallery-section-heading">
            <div>
              <span className="eyebrow"><span />MOVING PICTURES</span>
              <h2 id="gallery-film-title">Stories beyond the stills.</h2>
            </div>
          </div>
          <div className="gallery-video-grid">
            <article className="gallery-video-card">
              <div className="gallery-video-frame">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="ASTROVERSE event promotional video"
                >
                  <source src="/video/event-promo.mp4" type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
              <div className="gallery-video-copy">
                <span>01 / EVENT FILM</span>
                <h3>ASTROVERSE, in motion.</h3>
              </div>
            </article>
            <article className="gallery-video-card">
              <div className="gallery-video-frame">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="ASTROVERSE event interview"
                >
                  <source src="/video/interview.mp4" type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
              <div className="gallery-video-copy">
                <span>02 / CONVERSATIONS</span>
                <h3>Voices from the event.</h3>
              </div>
            </article>
          </div>
        </aside>
      </div>

      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Event photograph viewer">
          <button
            className="lightbox-close icon-button"
            ref={closeButton}
            onClick={() => setActive(null)}
            aria-label="Close viewer"
          >
            <X />
          </button>
          <button
            className="icon-button"
            onClick={() => move(-1)}
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>
          <figure>
            <img src={gallery[active].src} alt={gallery[active].caption} />
            <figcaption>
              {gallery[active].caption}{' '}
              <span>
                {active + 1} / {gallery.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="icon-button"
            onClick={() => move(1)}
            aria-label="Next image"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </main>
  );
}
