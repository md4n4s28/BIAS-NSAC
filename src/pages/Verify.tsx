import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Notice, PageIntro } from '../components/UI';

type Verified = {
  registrationId: string;
  teamId: string;
  teamName: string;
  institution: string;
  category: 'school' | 'college';
  status: 'pending' | 'approved' | 'rejected';
};

export default function Verify() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Verified | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState(registrationId ?? '');

  useEffect(() => {
    if (!registrationId) return;
    setLoading(true);
    setError('');
    setRecord(null);
    api<Verified>(`verify/${encodeURIComponent(registrationId)}`)
      .then(setRecord)
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [registrationId]);

  return (
    <div className="page verify-page">
      <PageIntro
        eyebrow="DATABASE-BACKED VERIFICATION"
        title="Check the mission credentials."
      >
        Scan a participant ID card with your phone camera or enter its unique
        participation ID below.
      </PageIntro>

      <form
        className="lookup-form panel"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(`/verify/${encodeURIComponent(lookup.trim())}`);
        }}
      >
        <label htmlFor="lookup">Participant ID</label>
        <div>
          <input
            id="lookup"
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
            placeholder="BIAS-NSAC26-P001"
            required
          />
          <button className="button">
            <Search size={17} />
            Verify
          </button>
        </div>
      </form>

      {loading && <Notice>Checking the real registration record…</Notice>}
      {error && <Notice error>{error}</Notice>}
      {record && (
        <div className="panel verification-result">
          {record.status === 'approved' ? (
            <ShieldCheck size={52} />
          ) : (
            <ShieldAlert size={52} />
          )}
          <span className={`status ${record.status}`}>{record.status}</span>
          <h2>
            {record.status === 'approved'
              ? 'Valid approved registration'
              : record.status === 'pending'
                ? 'Record found — approval pending'
                : 'Record found — registration rejected'}
          </h2>
          <dl>
            <dt>Participant ID</dt>
            <dd>{record.registrationId}</dd>
            <dt>Team ID</dt>
            <dd>{record.teamId}</dd>
            <dt>Team</dt>
            <dd>{record.teamName}</dd>
            <dt>Institution</dt>
            <dd>{record.institution}</dd>
            <dt>Category</dt>
            <dd>{record.category}</dd>
          </dl>
          <p className="fine-print">
            Private contact details are never included in public verification.
            An ID code is a lookup reference, not proof of identity or
            authorization to enter.
          </p>
        </div>
      )}
    </div>
  );
}
