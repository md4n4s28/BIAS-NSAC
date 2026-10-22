import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ButtonLink({ to, children, secondary = false, external = false }: { to: string; children: ReactNode; secondary?: boolean; external?: boolean }) {
  const props = { className: `button ${secondary ? 'button-secondary' : ''}` };
  return external ? <a href={to} target="_blank" rel="noreferrer" {...props}>{children}<ArrowUpRight size={17} /></a> : <Link to={to} {...props}>{children}<ChevronRight size={17} /></Link>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <div className="section-heading"><span className="eyebrow"><span />{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>; }

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <div className="page-intro"><span className="eyebrow"><span />{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</div>; }

export function Notice({
  children,
  error = false,
  popup = error,
  toastOnly = false,
}: {
  children: ReactNode;
  error?: boolean;
  popup?: boolean;
  toastOnly?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 8500);

    if (error && typeof window !== 'undefined') {
      const invalidField = document.querySelector<HTMLElement>('input:invalid, select:invalid, textarea:invalid, [aria-invalid="true"]');
      if (invalidField) {
        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        invalidField.focus?.();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [children, error]);

  return (
    <>
      {!toastOnly && (
        <div role={error ? 'alert' : 'status'} className={`notice ${error ? 'error' : ''}`}>
          {children}
        </div>
      )}
      {popup && visible && typeof document !== 'undefined' && createPortal(
        <div className="toast-portal-container" role="region" aria-label="Notifications">
          <div
            className={`toast-notification ${error ? 'toast-error' : 'toast-success'}`}
            onMouseEnter={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
            }}
            onMouseLeave={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = window.setTimeout(() => setVisible(false), 3500);
            }}
          >
            <div className="toast-icon">
              {error ? <AlertCircle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
            </div>
            <div className="toast-body">
              <strong className="toast-title">{error ? 'Action Required' : 'Update'}</strong>
              <div className="toast-message">{children}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => setVisible(false)}
              aria-label="Dismiss notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
export function OptimizedImage({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) { return <img className={className} src={`/.netlify/images?url=${encodeURIComponent(src)}&w=1400&fm=webp`} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={event => { const image = event.currentTarget; if (!image.dataset.fallback) { image.dataset.fallback = 'true'; image.src = src; } }} />; }
