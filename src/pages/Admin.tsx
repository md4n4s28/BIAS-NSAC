import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArchiveRestore,
  BarChart3,
  Download,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  ArrowUpRight,
  MessageSquareText,
  Trash2,
} from 'lucide-react';
import { api, type Registration, type Settings, type TeamQuery } from '../lib/api';
import { ButtonLink, Notice, PageIntro } from '../components/UI';
import EditTeam from '../components/EditTeam';

function exportCsv(records: Registration[]) {
  const escape = (input: string) => {
    const value = /^[=+\-@\t\r]/.test(input) ? `'${input}` : input;
    return `"${value.replaceAll('"', '""')}"`;
  };

  const rows = [
    [
      'Team ID',
      'Team',
      'Problem statement',
      'Participant ID',
      'Institution',
      'Category',
      'Status',
      'Participant',
      'Role',
      'Email',
      'Mobile',
    ],
    ...records.flatMap((record) =>
      record.members.map((member) => [
        record.teamId,
        record.teamName,
        record.problemStatement,
        member.registrationId,
        member.institution,
        record.category,
        record.status,
        member.name,
        member.role,
        member.email,
        member.mobile,
      ])
    ),
  ];

  const url = URL.createObjectURL(
    new Blob(
      [
        '\uFEFF' +
          rows
            .map((row) => row.map(escape).join(','))
            .join('\r\n'),
      ],
      { type: 'text/csv;charset=utf-8;' }
    )
  );

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `NSAC-registrations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Admin() {
  const [records, setRecords] = useState<Registration[]>([]);
  const [binRecords, setBinRecords] = useState<Registration[]>([]);
  const [queries, setQueries] = useState<TeamQuery[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Registration | null>(null);
  const [expandedQueryId, setExpandedQueryId] = useState<number | null>(null);
  const [deleteQueryId, setDeleteQueryId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [archiveConfirmation, setArchiveConfirmation] = useState(false);
  const location = useLocation();

  const section = location.pathname.split('/')[2] ?? '';

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [data, config, archived, teamQueries] = await Promise.all([
        api<Registration[]>('admin/registrations'),
        api<Settings>('config'),
        api<Registration[]>('admin/registrations/bin'),
        api<TeamQuery[]>('admin/queries'),
      ]);
      setRecords(data);
      setSettings(config);
      setBinRecords(archived);
      setQueries(teamQueries);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const visible = records.filter(
    (record) =>
      (!status || record.status === status) &&
      (!category || record.category === category) &&
      JSON.stringify(record)
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  const visibleBin = binRecords.filter((record) =>
    JSON.stringify(record).toLowerCase().includes(search.toLowerCase())
  );
  const statusCounts = [
    { label: 'Pending review', value: records.filter((record) => record.status === 'pending').length },
    { label: 'Verified', value: records.filter((record) => record.status === 'approved').length },
    { label: 'Rejected', value: records.filter((record) => record.status === 'rejected').length },
  ];
  const categoryCounts = [
    { label: 'College teams', value: records.filter((record) => record.category === 'college').length },
    { label: 'School teams', value: records.filter((record) => record.category === 'school').length },
  ];
  const maxChartCount = Math.max(
    ...statusCounts.map((item) => item.value),
    ...categoryCounts.map((item) => item.value),
    1
  );

  async function changeStatus(
    record: Registration,
    value: Registration['status']
  ) {
    setBusy(true);
    setError('');
    try {
      await api(`admin/registrations/${record.teamId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: value }),
      });
      setRecords((current) =>
        current.map((item) =>
          item.id === record.id ? { ...item, status: value } : item
        )
      );
      if (selected?.id === record.id) setSelected({ ...record, status: value });
      setMessage(`${record.teamId} marked ${value === 'approved' ? 'verified' : value}.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function archiveRecord() {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ archivedAt: string }>(`admin/registrations/${encodeURIComponent(selected.teamId)}/archive`, {
        method: 'POST',
      });
      setRecords((current) =>
        current.filter((record) => record.id !== selected.id)
      );
      setBinRecords((current) => [{ ...selected, deletedAt: result.archivedAt }, ...current]);
      setSelected(null);
      setArchiveConfirmation(false);
      setMessage('Team moved to the bin. It is excluded from CSV exports and public verification.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function restoreRecord(record: Registration) {
    setBusy(true);
    setError('');
    try {
      await api(`admin/registrations/${encodeURIComponent(record.teamId)}/restore`, {
        method: 'POST',
      });
      setBinRecords((current) => current.filter((item) => item.id !== record.id));
      setRecords((current) => [{ ...record, deletedAt: undefined }, ...current]);
      setMessage(`${record.teamId} restored to active registrations.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function changeQueryStatus(query: TeamQuery, value: TeamQuery['status']) {
    setBusy(true);
    setError('');
    try {
      await api(`admin/queries/${query.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: value }),
      });
      setQueries((current) => current.map((item) => item.id === query.id ? { ...item, status: value } : item));
      setMessage(`Query “${query.title}” marked ${value}.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteQuery(query: TeamQuery) {
    setBusy(true);
    setError('');
    try {
      await api(`admin/queries/${query.id}`, { method: 'DELETE' });
      setQueries((current) => current.filter((item) => item.id !== query.id));
      setExpandedQueryId((current) => current === query.id ? null : current);
      setDeleteQueryId(null);
      setMessage(`Query “${query.title}” deleted.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await api<Settings>('admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          minMembers: Number(data.get('minMembers')),
          maxMembers: Number(data.get('maxMembers')),
          registrationOpen: data.get('open') === 'on' ? 1 : 0,
        }),
      });
      setSettings(result);
      setMessage('Event registration settings saved.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page admin-page">
      <PageIntro
        eyebrow="AUTHORIZED ORGANIZER AREA"
        title="Mission control."
      >
        Live event registrations. Authorized actions. A clear view of the crew.
      </PageIntro>

      <nav className="admin-tabs" aria-label="Administration">
        <Link className={!section ? 'active' : ''} to="/admin">
          Overview
        </Link>
        <Link className={section === 'teams' ? 'active' : ''} to="/admin/teams">
          Teams
        </Link>
        <Link className={section === 'participants' ? 'active' : ''} to="/admin/participants">
          Participants
        </Link>
        <Link className={section === 'queries' ? 'active' : ''} to="/admin/queries">
          Queries <span className="admin-tab-count">{queries.filter((query) => query.status === 'open').length}</span>
        </Link>
        <Link className={section === 'bin' ? 'active' : ''} to="/admin/bin">
          Bin <span className="admin-tab-count">{binRecords.length}</span>
        </Link>
        <Link className={section === 'reports' ? 'active' : ''} to="/admin/reports">
          Reports
        </Link>
        <Link className={section === 'settings' ? 'active' : ''} to="/admin/settings">
          Settings
        </Link>
        <Link to="/verify">
          QR lookup <ArrowUpRight size={13} />
        </Link>
      </nav>

      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}

      {loading ? (
        <div className="panel loading-state">Retrieving live event data…</div>
      ) : !settings ? (
        <div className="panel">
          <h2>Event data is not available yet.</h2>
          <p>No statistics can be shown until the database responds.</p>
          <button className="button button-secondary" onClick={() => void refresh()}>
            Retry connection
          </button>
        </div>
      ) : section === 'settings' ? (
        settings && (
          <form className="panel settings-form" onSubmit={saveSettings}>
            <h2>Registration controls</h2>
            <Notice>
              Open registration only after confirming eligibility, the
              free-participation policy, team rules, guardian consent,
              privacy/retention policy and the event's official status.
            </Notice>
            <div className="form-grid">
              <label>
                Minimum team members
                <input
                  name="minMembers"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={settings.minMembers}
                  required
                />
              </label>
              <label>
                Maximum team members
                <input
                  name="maxMembers"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={settings.maxMembers}
                  required
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="open"
                defaultChecked={!!settings.registrationOpen}
              />
              <span>
                I confirm the event policies and authorize opening
                registration.
              </span>
            </label>
            <button className="button" disabled={busy}>
              Save settings
            </button>
            <p className="fine-print">
              These changes are recorded in the audit table. Existing
              registrations are not retroactively invalidated by changed team
              limits.
            </p>
          </form>
        )
      ) : section === 'queries' ? (
        <section className="panel admin-query-inbox">
          <div className="heading-row">
            <div>
              <span className="eyebrow">TEAM SUPPORT</span>
              <h2>Team queries</h2>
            </div>
            <span className="status open">{queries.filter((query) => query.status === 'open').length} open</span>
          </div>
          {!queries.length ? (
            <div className="empty-state">
              <MessageSquareText size={34} />
              <h3>No team queries yet.</h3>
              <p>Messages submitted from team dashboards will appear here with their team details.</p>
            </div>
          ) : (
            <div className="admin-query-list">
              {queries.map((query) => (
                <article className="admin-query-card" key={query.id}>
                  <div className="admin-query-card-heading">
                    <div>
                      <span className="eyebrow">{query.teamId} · {query.teamName}</span>
                      <h3>{query.title}</h3>
                      <span className="admin-query-leader">Team leader: {query.leaderName}</span>
                      <time dateTime={query.createdAt}>{new Date(query.createdAt).toLocaleString()}</time>
                    </div>
                    <select
                      aria-label={`Set status for ${query.title}`}
                      value={query.status}
                      disabled={busy}
                      onChange={(event) => void changeQueryStatus(query, event.target.value as TeamQuery['status'])}
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="admin-query-actions">
                    <button
                      className="button button-secondary"
                      aria-expanded={expandedQueryId === query.id}
                      onClick={() => setExpandedQueryId((current) => current === query.id ? null : query.id)}
                    >
                      {expandedQueryId === query.id ? 'Hide details' : 'View details'}
                    </button>
                    <button
                      className="button button-danger"
                      disabled={busy}
                      onClick={() => setDeleteQueryId((current) => current === query.id ? null : query.id)}
                    >
                      <Trash2 size={15} /> Delete query
                    </button>
                  </div>
                  {expandedQueryId === query.id && (
                    <div className="admin-query-details">
                      <h4>Full message</h4>
                      <p>{query.message}</p>
                      <div className="admin-query-contact">
                        <span><strong>Team leader:</strong> {query.leaderName}</span>
                        {query.leaderMobile && (
                          <a href={`tel:${query.leaderMobile}`}>
                            <strong>Phone:</strong> {query.leaderMobile}
                          </a>
                        )}
                        {query.leaderEmail && (
                          <a href={`mailto:${query.leaderEmail}`}>
                            <strong>Email:</strong> {query.leaderEmail}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {deleteQueryId === query.id && (
                    <div className="admin-query-delete-confirm" role="alert">
                      <p>Delete this query permanently? This cannot be undone.</p>
                      <button
                        className="button button-danger"
                        disabled={busy}
                        onClick={() => void deleteQuery(query)}
                      >
                        {busy ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        className="button button-secondary"
                        disabled={busy}
                        onClick={() => setDeleteQueryId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : section === 'bin' ? (
        <section className="panel admin-bin">
          <div className="heading-row">
            <div>
              <span className="eyebrow">ARCHIVED RECORDS</span>
              <h2>Team bin</h2>
              <p>Archived teams are excluded from active lists, CSV exports, and public verification.</p>
            </div>
          </div>
          <label className="search-input">
            <Search size={16} />
            <input
              aria-label="Search archived teams"
              placeholder="Search archived teams…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {!visibleBin.length ? (
            <div className="empty-state">
              <Trash2 size={34} />
              <h3>{binRecords.length ? 'No matches found.' : 'The bin is empty.'}</h3>
              <p>{binRecords.length ? 'Try a different team name or ID.' : 'Archived teams will be kept here until restored.'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Team ID</th><th>Team name</th><th>Members</th><th>Status</th><th>Archived</th><th>Action</th></tr></thead>
                <tbody>
                  {visibleBin.map((record) => (
                    <tr key={record.id}>
                      <td>{record.teamId}</td>
                      <td>{record.teamName}</td>
                      <td>{record.members.length}</td>
                      <td><span className={`status ${record.status}`}>{record.status}</span></td>
                      <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <button className="button button-secondary" disabled={busy} onClick={() => void restoreRecord(record)}>
                          <ArchiveRestore size={15} /> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="admin-stats">
            {[
              { label: 'Active teams', value: records.length, icon: Users },
              {
                label: 'Participants',
                value: records.reduce((total, record) => total + record.members.length, 0),
                icon: Users,
              },
              { label: 'Pending review', value: statusCounts[0].value, icon: Clock },
              {
                label: 'Verified',
                value: statusCounts[1].value,
                icon: CheckCircle2,
              },
              {
                label: 'Rejected',
                value: statusCounts[2].value,
                icon: Shield,
              },
            ].map((stat) => (
              <div className="panel stat-card" key={stat.label}>
                <stat.icon size={20} />
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          {(!section || section === 'reports') && (
            <section className="admin-analytics" aria-label="Registration graphs">
              {[
                { title: 'Registration review', icon: BarChart3, rows: statusCounts },
                { title: 'Institution category', icon: Users, rows: categoryCounts },
              ].map((chart) => (
                <article className="panel admin-chart" key={chart.title}>
                  <div className="admin-chart-title">
                    <chart.icon size={18} />
                    <h2>{chart.title}</h2>
                  </div>
                  <div className="admin-chart-bars" role="img" aria-label={chart.rows.map((item) => `${item.label}: ${item.value}`).join(', ')}>
                    {chart.rows.map((item) => (
                      <div className="admin-chart-row" key={item.label}>
                        <div className="admin-chart-label"><span>{item.label}</span><strong>{item.value}</strong></div>
                        <div className="admin-chart-track">
                          <span style={{ width: `${(item.value / maxChartCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}

          {section === 'reports' && (
            <p className="fine-print admin-report-note">
              CSV exports contain personal contact details. Download only for authorized event administration and
              store them securely according to your approved retention policy.
            </p>
          )}

          {section !== 'reports' && (
          <section className="panel admin-team-list">
            <div className="heading-row">
              <div>
                <span className="eyebrow">{section === 'participants' ? 'ROSTER' : 'REGISTRATION DIRECTORY'}</span>
                <h2>{section === 'participants' ? 'Participants' : section === 'teams' ? 'Team directory' : 'Recent registrations'}</h2>
              </div>
              <button
                className="button button-secondary"
                disabled={!visible.length}
                onClick={() => exportCsv(visible)}
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="admin-filters">
              <label className="search-input">
                <Search size={16} />
                <input
                  aria-label="Search by ID, team, participant, email, mobile or institution"
                  placeholder="Search teams, names, email, mobile, ID…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending review</option>
                <option value="approved">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                <option value="school">School</option>
                <option value="college">College</option>
              </select>
            </div>

            {!visible.length ? (
              <div className="empty-state">
                <Users size={34} />
                <h3>{records.length ? 'No matches found.' : 'No registrations yet.'}</h3>
                <p>{records.length ? 'Try another search or filter.' : 'Team registrations will appear here after submission.'}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{section === 'participants' ? 'Participant ID' : 'Team ID'}</th>
                      <th>{section === 'participants' ? 'Participant' : 'Team name'}</th>
                      <th>Institution</th>
                      <th>Category</th>
                      <th>Verification</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.flatMap((record) =>
                      (section === 'participants' ? record.members : [null]).map((member, index) => (
                        <tr key={`${record.id}-${index}`}>
                          <td>{section === 'participants' ? record.members[index]?.registrationId : record.teamId}</td>
                          <td>{member?.name ?? record.teamName}{member && <small>{member.email}</small>}</td>
                          <td>{member?.institution ?? record.institution}</td>
                          <td>{record.category}</td>
                          <td>
                            <select
                              className="admin-status-select"
                              aria-label={`Set verification status for ${record.teamName}`}
                              value={record.status}
                              disabled={busy}
                              onChange={(event) => void changeStatus(record, event.target.value as Registration['status'])}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Verified</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td>
                            <button className="text-button" onClick={() => {
                              setSelected(record);
                              setArchiveConfirmation(false);
                            }}>
                              Details <ArrowUpRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="fine-print">{visible.length} of {records.length} active teams · archived teams are excluded.</p>
          </section>
          )}

          {/* Detail View */}
          {selected && (
            <section className="panel admin-detail">
              <div className="heading-row">
                <div>
                  <span className="eyebrow">{selected.teamId}</span>
                  <h2>{selected.teamName}</h2>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close details
                </button>
              </div>
              <p>
                {selected.institution} · {selected.category} category
              </p>
              <p><strong>Problem statement:</strong> {selected.problemStatement}</p>
              {selected.mentor && <p>Mentor: {selected.mentor}</p>}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Institution</th>
                      <th>Email</th>
                      <th>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.role}</td>
                        <td>{member.institution}</td>
                        <td>{member.email}</td>
                        <td>{member.mobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <EditTeam
                key={selected.id}
                record={selected}
                onSave={(updated) => {
                  setSelected(updated);
                  setRecords((current) =>
                    current.map((record) =>
                      record.id === updated.id ? updated : record
                    )
                  );
                }}
              />

              <div className="admin-detail-actions">
                <label className="admin-status-control">
                  Verification status
                  <select
                    value={selected.status}
                    disabled={busy}
                    onChange={(event) => void changeStatus(selected, event.target.value as Registration['status'])}
                  >
                    <option value="pending">Pending review</option>
                    <option value="approved">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <ButtonLink secondary to={`/verify/${selected.members[0]?.registrationId ?? ''}`}>
                  Preview participant verification
                </ButtonLink>
                <button
                  className="button button-danger"
                  disabled={busy}
                  onClick={() => setArchiveConfirmation(true)}
                >
                  <Trash2 size={15} /> Move team to bin
                </button>
              </div>

              {archiveConfirmation && (
                <Notice>
                  <p>
                    This moves the team to the bin without deleting its data. It will be excluded from CSV exports
                    and public verification; you can restore it later.
                  </p>
                  <button
                    className="button button-danger"
                    disabled={busy}
                    onClick={() => void archiveRecord()}
                  >
                    Confirm move to bin
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => setArchiveConfirmation(false)}
                  >
                    Cancel
                  </button>
                </Notice>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
