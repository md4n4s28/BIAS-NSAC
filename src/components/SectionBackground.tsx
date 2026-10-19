import { useRef } from 'react';

export type SectionBackgroundName = 'mission' | 'experience' | 'schedule' | 'categories';

export default function SectionBackground({ name }: { name: SectionBackgroundName; enabled?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const poster = `/img/section-backgrounds/${name}.jpg`;

  return (
    <div ref={container} className={`section-background section-background-${name}`} aria-hidden="true">
      <img src={poster} alt="" loading="lazy" />
      <div className="section-background-shade" />
    </div>
  );
}
