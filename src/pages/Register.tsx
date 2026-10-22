import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api, type Registration, type Settings } from '../lib/api';
import { registrationSchema, type Member } from '../lib/validation';
import { ButtonLink, Notice, PageIntro } from '../components/UI';
import { problemStatements } from '../data/problem-statements';

const emptyMember = (
  role: 'leader' | 'member' = 'member',
  email = ''
): Member => ({
  name: '',
  email,
  mobile: '',
  institution: '',
  role,
});

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const [members, setMembers] = useState<Member[]>([
    emptyMember('leader'),
    emptyMember(),
    emptyMember(),
    emptyMember(),
  ]);
  const [category, setCategory] = useState(
    params.get('category') === 'school' ? 'school' : 'college'
  );

  useEffect(() => {
    api<Settings>('config')
      .then(setSettings)
      .catch((error) => setError(error.message));
  }, []);

  useEffect(() => {
    if (user)
      setMembers((current) =>
        current.map((member, index) =>
          index === 0 ? { ...member, email: user.email ?? '' } : member
        )
      );
  }, [user?.id]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCheckingRegistration(false);
      return;
    }

    let active = true;
    api<Registration | null>('registration')
      .then((registration) => {
        if (active && registration) {
          const isJustLoggedIn = Boolean((location.state as { loggedIn?: boolean } | null)?.loggedIn);
          navigate('/dashboard', { replace: true, state: isJustLoggedIn ? { loggedIn: true } : {} });
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Could not check your registration.');
        }
      })
      .finally(() => {
        if (active) setCheckingRegistration(false);
      });

    return () => {
      active = false;
    };
  }, [loading, user?.id, navigate]);

  function updateMember(index: number, field: keyof Member, value: string) {
    setMembers((current) =>
      current.map((member, position) =>
        position === index ? { ...member, [field]: value } : member
      )
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    const institution = String(data.get('institution') ?? '').trim();

    const parsed = registrationSchema.safeParse({
      teamName: data.get('teamName'),
      institution,
      problemStatement: data.get('problemStatement'),
      category,
      mentor: data.get('mentor'),
      consent: data.get('consent') === 'on',
      members: members.map((member) => ({
        ...member,
        institution: member.institution || institution,
      })),
    });

    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(' '));
      return;
    }

    if (
      settings &&
      (members.length < settings.minMembers ||
        members.length > settings.maxMembers)
    ) {
      setError(`Add ${settings.minMembers}–${settings.maxMembers} team members.`);
      return;
    }

    setBusy(true);

    try {
      await api('registration', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      navigate('/dashboard', { state: { registered: true } });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page registration-page">
      <PageIntro
        eyebrow="YOUR IDEAS BELONG HERE"
        title="Assemble your crew."
      >
        One team. Different talents. A shared mission.
      </PageIntro>

      {error && <Notice error>{error}</Notice>}

      {loading ? (
        <Notice>Checking your account…</Notice>
      ) : !user ? (
        <div className="panel">
          <h2>First, create your mission account.</h2>
          <p>
            The team leader needs a confirmed account to securely save and
            manage a registration.
          </p>
          <ButtonLink to="/signup">Create an account</ButtonLink>
          <ButtonLink to="/login" secondary>
            Already registered? Sign in
          </ButtonLink>
        </div>
      ) : !user.email_confirmed_at ? (
        <Notice>
          Confirm your team leader email using the link we sent, then sign in to continue.
        </Notice>
      ) : checkingRegistration ? (
        <Notice>Checking your existing team registration…</Notice>
      ) : !settings ? (
        <Notice>
          {error
            ? 'Registration rules are unavailable. Please refresh this page to reconnect.'
            : 'Loading registration rules…'}
        </Notice>
      ) : (
        <>
          <div className="registration-info">
            <span>
              <ShieldCheck size={18} /> Secure team registration
            </span>
            <span>
              {settings.minMembers}–{settings.maxMembers} team members
            </span>
            <span>No payment collected</span>
          </div>

          {!settings.registrationOpen && (
            <Notice>
              Registration has not opened yet. Organizers must confirm category
              eligibility, fees and team rules before enabling submissions. You
              can review the form below.
            </Notice>
          )}

          <nav className="registration-steps" aria-label="Registration form sections">
            <a href="#registration-team"><span>01</span> Team mission</a>
            <a href="#registration-crew"><span>02</span> Team members</a>
            <a href="#registration-consent"><span>03</span> Review & submit</a>
          </nav>

          <form className="registration-form" onSubmit={submit}>
            {/* Team Section */}
            <section className="panel registration-step-panel" id="registration-team">
              <div className="registration-section-heading">
                <span className="registration-step-number">01</span>
                <div>
                  <span className="eyebrow">TEAM MISSION</span>
                  <h2>Start with your team.</h2>
                  <p>Set your team identity and choose the challenge you’ll work on.</p>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Team name
                  <input
                    name="teamName"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label>
                  Team institution / school / college
                  <input
                    name="institution"
                    required
                    minLength={2}
                    maxLength={200}
                    placeholder="Enter your team’s institution"
                  />
                </label>
                <label>
                  Participation category
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as any)}
                  >
                    <option value="school">School Category</option>
                    <option value="college">College Category</option>
                  </select>
                </label>
                <label>
                  Mentor name (optional)
                  <input name="mentor" maxLength={120} />
                </label>
                <label className="registration-field-wide">
                  Problem statement
                  <select name="problemStatement" required defaultValue="">
                    <option value="" disabled>Select your NASA challenge</option>
                    {problemStatements.map((statement) => (
                      <option value={statement.title} key={statement.title}>
                        {statement.difficulty} — {statement.title}
                      </option>
                    ))}
                  </select>
                  <span className="registration-field-help">Choose the same problem statement your team selected on the official NASA Space Apps website. The list shows difficulty and title only.</span>
                </label>
              </div>
            </section>

            {/* Crew Section */}
            <section className="panel registration-step-panel" id="registration-crew">
              <div className="heading-row">
                <div className="registration-section-heading">
                  <span className="registration-step-number">02</span>
                  <div>
                    <span className="eyebrow">TEAM MEMBERS</span>
                    <h2>Every mind matters.</h2>
                    <p>Add each participant’s details. The leader’s email is tied to this account.</p>
                  </div>
                </div>
                <span className="tag">{members.length} MEMBERS</span>
              </div>

              {members.map((member, index) => (
                <fieldset className={`member-fields registration-member ${index === 0 ? 'registration-leader' : ''}`} key={index}>
                  <legend>
                    {index === 0
                      ? 'Team leader'
                      : `Team member ${index + 1}`}
                  </legend>
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-member icon-button"
                      aria-label={`Remove member ${index + 1}`}
                      onClick={() =>
                        setMembers((current) =>
                          current.filter((_, position) => position !== index)
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                  <div className="form-grid">
                    <label>
                      Full name
                      <input
                        required
                        minLength={2}
                        maxLength={120}
                        placeholder="Eg: abc xyz"
                        autoComplete="off"
                        value={member.name}
                        onChange={(event) =>
                          updateMember(index, 'name', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        type="email"
                        required
                        value={member.email}
                        placeholder="Eg: abc@example.com"
                        readOnly={index === 0}
                        onChange={(event) =>
                          updateMember(index, 'email', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Mobile number
                      <input
                        type="tel"
                        required
                        pattern="\+?[1-9][0-9]{7,14}"
                        placeholder="Eg: 9876543210"
                        value={member.mobile}
                        onChange={(event) =>
                          updateMember(index, 'mobile', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className="registration-label-title">
                        Institution <span className="muted">(if different from team)</span>
                      </span>
                      <input
                        maxLength={200}
                        placeholder="Leave blank if same Institution"
                        value={member.institution}
                        onChange={(event) =>
                          updateMember(index, 'institution', event.target.value)
                        }
                      />
                    </label>
                  </div>
                </fieldset>
              ))}

              <button
                className="button button-secondary"
                type="button"
                disabled={members.length >= settings.maxMembers}
                onClick={() =>
                  setMembers((current) => [...current, emptyMember()])
                }
              >
                <Plus size={16} />
                Add team member
              </button>
            </section>

            {/* Consent Section */}
            <section className="panel registration-step-panel" id="registration-consent">
              <div className="registration-section-heading">
                <span className="registration-step-number">03</span>
                <div>
                  <span className="eyebrow">REVIEW & SUBMIT</span>
                  <h2>Ready for liftoff?</h2>
                  <p>Review the details with your team before submitting.</p>
                </div>
              </div>
              <label className="checkbox-label">
                <input name="consent" type="checkbox" required />
                <span>
                  I confirm the information is accurate, that each member has
                  agreed to the collection of these details for event
                  administration, and that any necessary guardian consent has
                  been obtained. I understand the event rules remain subject to
                  organizer confirmation.
                </span>
              </label>

              <button
                className="button registration-submit"
                disabled={busy || !settings.registrationOpen}
              >
                {busy
                  ? 'Saving your registration…'
                  : settings.registrationOpen
                    ? 'Submit team registration'
                    : 'Registration opens after confirmation'}
                <ArrowRight size={17} />
              </button>
            </section>
          </form>
        </>
      )}
    </div>
  );
}
