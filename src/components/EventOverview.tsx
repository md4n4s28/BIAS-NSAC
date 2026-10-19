import { ButtonLink, Notice } from './UI';
import { officialUrl } from '../data/event';

export default function EventOverview() {
  return <div className="event-overview">
    <p>NASA International Space Apps Challenge brings people together around collaborative problem-solving using space science, technology and open-data resources.</p>
    <p>ASTROVERSE is the distinct local event identity at Birla Institute of Applied Sciences, Bhimtal. The organizer-provided programme is scheduled for 14–16 November 2026.</p>
    <ButtonLink to={officialUrl} external>Official Space Apps information</ButtonLink>
  </div>;
}
