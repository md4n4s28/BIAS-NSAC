import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Download, MapPin, MessageSquareText, Send, ShieldCheck, Users } from 'lucide-react';
import { api, type Registration, type TeamQuery } from '../lib/api';
import { ButtonLink, Notice, PageIntro } from '../components/UI';
import { problemStatements } from '../data/problem-statements';

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function downloadMemberCard(member: Registration['members'][number], teamName: string) {
  const background = new Image();
  background.src = '/img/id-card-template.png';
  await background.decode();

  const canvas = document.createElement('canvas');
  canvas.width = background.naturalWidth;
  canvas.height = background.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare the ID card image.');
  context.drawImage(background, 0, 0);

  const scaleX = canvas.width / 768;
  const scaleY = canvas.height / 1152;
  const drawField = (
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number
  ) => {
    let size = fontSize * scaleY;
    let lines: string[];
    do {
      context.font = `700 ${size}px Arial, sans-serif`;
      lines = wrapCanvasText(context, text, width * scaleX - 28 * scaleX);
      if (lines.length <= 2 || size <= 15 * scaleY) break;
      size -= 1 * scaleY;
    } while (size > 14 * scaleY);

    context.fillStyle = '#082b55';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const lineHeight = size * 1.16;
    const centerY = (y + height / 2) * scaleY;
    lines.slice(0, 2).forEach((line, index) => {
      context.fillText(
        line,
        (x + width / 2) * scaleX,
        centerY + (index - (Math.min(lines.length, 2) - 1) / 2) * lineHeight,
        width * scaleX - 28 * scaleX
      );
    });
  };

  drawField(member.registrationId, 190, 68, 388, 47, 22);
  drawField(member.name, 296, 615, 411, 62, 22);
  drawField(teamName, 296, 724, 411, 63, 21);
  drawField(member.mobile, 296, 832, 411, 63, 22);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('The ID card image could not be generated. Try printing the card instead.'));
    }, 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${member.registrationId}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MemberIdCard({
  member,
  teamName,
}: {
  member: Registration['members'][number];
  teamName: string;
}) {
  return (
    <article className="id-card-template" aria-label={`ID card for ${member.name}`}>
      <img src="/img/id-card-template.png" alt="" />
      <span className="id-card-overlay id-card-registration">{member.registrationId}</span>
      <span className="id-card-overlay id-card-participant">{member.name}</span>
      <span className="id-card-overlay id-card-team">{teamName}</span>
      <span className="id-card-overlay id-card-phone">{member.mobile}</span>
    </article>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [queries, setQueries] = useState<TeamQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberReference, setMemberReference] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [queryMessage, setQueryMessage] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api<Registration | null>('registration');
        setRegistration(data);
        if (data) setQueries(await api<TeamQuery[]>('team-queries'));
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : 'Could not load your registration.');
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (loading || !location.hash) return;
    const targetId = decodeURIComponent(location.hash.slice(1));
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' }), 0);
  }, [loading, location.hash, registration]);

  const selectedMember = registration?.members.find((member) => member.registrationId === memberReference)
    ?? registration?.members.find((member) => member.role === 'leader')
    ?? registration?.members[0];
  const teamLeaderName = registration?.members.find((member) => member.role === 'leader')?.name.trim();
  const selectedProblem = registration
    ? problemStatements.find((statement) => statement.title === registration.problemStatement)
    : undefined;

  async function saveIdCard() {
    if (!selectedMember || !registration) return;
    setError('');
    setDownloading(true);
    try {
      await downloadMemberCard(selectedMember, registration.teamName);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not download this ID card.');
    } finally {
      setDownloading(false);
    }
  }

  async function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError('');
    setQueryMessage('');
    setSubmittingQuery(true);
    const data = new FormData(form);
    try {
      const query = await api<TeamQuery>('team-queries', {
        method: 'POST',
        body: JSON.stringify({
          title: data.get('queryTitle'),
          message: data.get('queryMessage'),
        }),
      });
      setQueries((current) => [query, ...current]);
      setQueryMessage('Your message has been sent to the organizer.');
      form.reset();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not send your message.');
    } finally {
      setSubmittingQuery(false);
    }
  }

  return (
    <div className="page dashboard-page">
      <PageIntro eyebrow="TEAM LEADER MISSION CONTROL" title={teamLeaderName ? `Welcome aboard, ${teamLeaderName.split(/\s+/)[0]}.` : 'Your team mission control.'}>
        One place for your team record, selected challenge, and participant ID cards.
      </PageIntro>

      {Boolean((location.state as { registered?: boolean } | null)?.registered) && (
        <Notice popup>Team registration submitted successfully! Your application is now in review.</Notice>
      )}
      {queryMessage && <Notice popup>{queryMessage}</Notice>}
      {error && <Notice error popup>{error}</Notice>}

      {loading ? (
        <div className="panel loading-state">Retrieving your registration…</div>
      ) : !registration ? (
        !error && (
          <div className="panel">
            <h2>Your mission is waiting.</h2>
            <p>No team registration is linked to this account yet.</p>
            <ButtonLink to="/register">Register a team</ButtonLink>
          </div>
        )
      ) : (
        <>
          <nav className="dashboard-ribbon" aria-label="Your registration sections">
            <a href="#team-details"><Users size={16} /> Team details</a>
            <a href="#problem-statement"><ShieldCheck size={16} /> Problem statement</a>
            <a href="#id-cards"><Download size={16} /> Participant ID cards</a>
            <a href="#contact-admin"><MessageSquareText size={16} /> Contact organizer</a>
          </nav>

          <div className="dashboard-stats">
            <article className="dashboard-stat panel">
              <span className="micro-label">TEAM ID</span>
              <strong>{registration.teamId}</strong>
            </article>
            <article className="dashboard-stat panel">
              <span className="micro-label">REGISTRATION STATUS</span>
              <span className={`status ${registration.status}`}>{registration.status}</span>
            </article>
            <article className="dashboard-stat panel">
              <span className="micro-label">TEAM MEMBERS</span>
              <strong>{registration.members.length}</strong>
            </article>
          </div>

          <aside className="dashboard-verification-notice" aria-labelledby="dashboard-verification-title">
            <ShieldCheck size={21} aria-hidden="true" />
            <div>
              <h2 id="dashboard-verification-title">Complete registration on both platforms</h2>
              <p>
                Your team can be verified only after registration is complete on both the BIAS-NSAC portal
                and the official NASA Space Apps Challenge website. The organizer will then review and verify
                your registration manually. If you have completed both registrations and your verification is
                still pending, please contact the organizer.
              </p>
            </div>
          </aside>

          <section className="panel dashboard-panel" id="team-details">
            <div className="dashboard-panel-heading">
              <div>
                <span className="eyebrow">TEAM PROFILE</span>
                <h2>{registration.teamName}</h2>
              </div>
              <span className={`status ${registration.status}`}>{registration.status}</span>
            </div>
            <dl className="dashboard-team-meta">
              <div><dt>Team ID</dt><dd>{registration.teamId}</dd></div>
              <div><dt>Participation Mode</dt><dd>{registration.participationMode === 'online' ? 'Online (Virtual)' : 'Offline (Onsite at BIAS Bhimtal)'}</dd></div>
              <div><dt>Institution Category</dt><dd>{registration.category}</dd></div>
              <div><dt>Mentor</dt><dd>{registration.mentor || 'Not provided'}</dd></div>
              <div><dt>Event dates</dt><dd>14–16 November 2026</dd></div>
            </dl>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Participation ID</th>
                    <th>Participant</th>
                    <th>Role</th>
                    <th>Institution</th>
                    <th>Email</th>
                    <th>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {registration.members.map((member) => (
                    <tr key={member.id}>
                      <td><strong>{member.registrationId}</strong></td>
                      <td>{member.name}</td>
                      <td>{member.role}</td>
                      <td>{member.institution || registration.institution}</td>
                      <td>{member.email}</td>
                      <td>{member.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fine-print">Each participant has a unique registration ID. All participants on this team share the team ID.</p>
          </section>



          <section className="panel dashboard-panel dashboard-challenge" id="problem-statement">
            <div>
              <span className="eyebrow">SELECTED NASA SPACE APPS CHALLENGE</span>
              <h2>{registration.problemStatement}</h2>
              {selectedProblem && <span className="tag">Problem Statement Id: {selectedProblem.difficulty}</span>}
            </div>
          </section>

          <section className="dashboard-id-panel" id="id-cards">
            <div className="dashboard-id-heading">
              <div>
                <span className="eyebrow">DIGITAL PARTICIPANT CREDENTIALS</span>
                <h2>Team ID cards</h2>
                <p>Choose a participant to preview and download their card using the supplied event artwork.</p>
              </div>
              <a className="dashboard-verify-link" href={`/verify/${encodeURIComponent(selectedMember?.registrationId ?? '')}`}>
                Verify selected participant
              </a>
            </div>
            {selectedMember && (
              <div className="dashboard-id-content">
                <MemberIdCard member={selectedMember} teamName={registration.teamName} />
                <div className="dashboard-id-controls">
                  <label>
                    Participant
                    <select
                      value={selectedMember.registrationId}
                      onChange={(event) => setMemberReference(event.target.value)}
                    >
                      {registration.members.map((member) => (
                        <option value={member.registrationId} key={member.registrationId}>
                          {member.name} · {member.registrationId}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button" onClick={() => void saveIdCard()} disabled={downloading}>
                    <Download size={17} />
                    {downloading ? 'Preparing card…' : 'Download ID card (PNG)'}
                  </button>
                  <p className="fine-print">The card shows the participant ID, their name, team name, and phone number. It is a local event ID, not an official NASA credential.</p>
                  <Link className="arrow-link" to={`/verify/${encodeURIComponent(selectedMember.registrationId)}`}>
                    Open public registration verification
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="panel dashboard-panel dashboard-query-panel" id="contact-admin">
            <div className="dashboard-query-heading">
              <div>
                <span className="eyebrow">TEAM SUPPORT</span>
                <h2><MessageSquareText size={20} /> Contact the organizer</h2>
                <p>Your message will be linked to team {registration.teamId} and visible to the organizer.</p>
              </div>
            </div>
            <form className="dashboard-query-form" onSubmit={(event) => void submitQuery(event)}>
              <label>
                Title
                <input name="queryTitle" minLength={3} maxLength={120} placeholder="What do you need help with?" required />
              </label>
              <label>
                Message
                <textarea name="queryMessage" minLength={10} maxLength={2000} rows={5} placeholder="Describe your question or issue…" required />
              </label>
              <button className="button" type="submit" disabled={submittingQuery}>
                <Send size={16} />
                {submittingQuery ? 'Sending…' : 'Send message'}
              </button>
            </form>
            {queryMessage && (
              <div className="dashboard-query-feedback">
                <Notice popup>{queryMessage}</Notice>
              </div>
            )}
            {queries.length > 0 && (
              <div className="dashboard-query-history">
                <h3>Your messages</h3>
                {queries.map((query) => (
                  <article className="dashboard-query-item" key={query.id}>
                    <div>
                      <strong>{query.title}</strong>
                      <span className={`status ${query.status}`}>{query.status}</span>
                    </div>
                    <p>{query.message}</p>
                    <time dateTime={query.createdAt}>{new Date(query.createdAt).toLocaleString()}</time>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="panel dashboard-event">
            <span><CalendarDays />14–16 November 2026</span>
            <span><MapPin />Birla Institute of Applied Sciences, Bhimtal</span>
          </div>
        </>
      )}
    </div>
  );
}
