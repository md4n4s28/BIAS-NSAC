import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
export function ButtonLink({ to, children, secondary = false, external = false }: { to: string; children: ReactNode; secondary?: boolean; external?: boolean }) {
  const props = { className: `button ${secondary ? 'button-secondary' : ''}` };
  return external ? <a href={to} target="_blank" rel="noreferrer" {...props}>{children}<ArrowUpRight size={17} /></a> : <Link to={to} {...props}>{children}<ChevronRight size={17} /></Link>;
}
export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <div className="section-heading"><span className="eyebrow"><span />{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>; }
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <div className="page-intro"><span className="eyebrow"><span />{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</div>; }
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) { return <div role={error ? 'alert' : 'status'} className={`notice ${error ? 'error' : ''}`}>{children}</div>; }
export function OptimizedImage({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) { return <img className={className} src={`/.netlify/images?url=${encodeURIComponent(src)}&w=1400&fm=webp`} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={event => { const image = event.currentTarget; if (!image.dataset.fallback) { image.dataset.fallback = 'true'; image.src = src; } }} />; }
