import { useState, type FormEvent } from 'react';
import { api, type Registration } from '../lib/api';
import { Notice } from './UI';
import { problemStatements } from '../data/problem-statements';

export default function EditTeam({
  record,
  onSave,
}: {
  record: Registration;
  onSave: (record: Registration) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function saveTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const updated = await api<Registration>(`admin/registrations/${encodeURIComponent(record.teamId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          teamName: data.get('teamName'),
          institution: data.get('institution'),
          category: data.get('category'),
          mentor: data.get('mentor'),
          problemStatement: data.get('problemStatement'),
          members: record.members.map((member) => ({
            id: member.id,
            name: data.get(`member-${member.id}-name`),
            email: data.get(`member-${member.id}-email`),
            mobile: data.get(`member-${member.id}-mobile`),
            institution: data.get(`member-${member.id}-institution`),
          })),
        }),
      });
      onSave(updated);
      setMessage('Team and participant details updated.');
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not update the team details.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="edit-team" onSubmit={(event) => void saveTeam(event)}>
      <h3>Edit team and participant details</h3>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <div className="form-grid">
        <label>
          Team name
          <input name="teamName" defaultValue={record.teamName} minLength={2} maxLength={100} required />
        </label>
        <label>
          Team institution
          <input name="institution" defaultValue={record.institution} minLength={2} maxLength={200} required />
        </label>
        <label>
          Institution category
          <select name="category" defaultValue={record.category} required>
            <option value="school">School</option>
            <option value="college">College</option>
          </select>
        </label>
        <label>
          Mentor name
          <input name="mentor" defaultValue={record.mentor ?? ''} maxLength={120} />
        </label>
        <label className="edit-team-problem">
          Problem statement
          <select name="problemStatement" defaultValue={record.problemStatement} required>
            {!problemStatements.some((statement) => statement.title === record.problemStatement) && (
              <option value={record.problemStatement}>{record.problemStatement}</option>
            )}
            {problemStatements.map((statement) => (
              <option value={statement.title} key={statement.title}>
                {statement.difficulty} — {statement.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="edit-team-members">
        <h4>Participant details</h4>
        {record.members.map((member) => (
          <fieldset className="edit-team-member" key={member.id}>
            <legend>{member.name} · {member.role}</legend>
            <label>
              Name
              <input
                name={`member-${member.id}-name`}
                defaultValue={member.name}
                minLength={2}
                maxLength={120}
                required
              />
            </label>
            <label>
              Email
              <input
                name={`member-${member.id}-email`}
                type="email"
                defaultValue={member.email}
                required
                readOnly={member.role === 'leader'}
                aria-describedby={member.role === 'leader' ? `leader-email-note-${member.id}` : undefined}
              />
              {member.role === 'leader' && (
                <small id={`leader-email-note-${member.id}`}>
                  The team leader email is linked to the confirmed account and cannot be changed here.
                </small>
              )}
            </label>
            <label>
              Mobile
              <input
                name={`member-${member.id}-mobile`}
                defaultValue={member.mobile}
                inputMode="numeric"
                pattern="[1-9][0-9]{7,14}"
                title="Enter 8–15 digits without spaces or symbols."
                required
              />
            </label>
            <label>
              Institution
              <input
                name={`member-${member.id}-institution`}
                defaultValue={member.institution}
                minLength={2}
                maxLength={200}
                required
              />
            </label>
          </fieldset>
        ))}
      </div>
      <p className="fine-print">
        Participant IDs, team ownership, and team membership roles stay fixed. The confirmed team leader email cannot
        be changed because it is tied to the sign-in account.
      </p>
      <button className="button button-secondary" disabled={busy}>
        {busy ? 'Saving changes…' : 'Save team and participant details'}
      </button>
    </form>
  );
}
