import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, Eye, EyeOff, Mail, Orbit } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getSupabase } from '../lib/supabase';
import { Notice, PageIntro } from '../components/UI';

const ADMIN_LOGIN_EMAIL = 'mohdanas@birlainstitute.co.in';

export default function Auth({
  mode = 'login',
}: {
  mode?: 'login' | 'signup' | 'recover' | 'reset' | 'admin';
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLoggedOut = searchParams.get('logged_out') === '1' || Boolean((location.state as { loggedOut?: boolean } | null)?.loggedOut);

  const titles = {
    login: 'Welcome back, stargazer.',
    signup: 'Your journey starts here.',
    recover: 'Back on your trajectory.',
    reset: 'Set a new password.',
    admin: 'Organizer mission control.',
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');
    const confirmPassword = String(data.get('confirmPassword') ?? '');
    if (mode === 'signup' && password !== confirmPassword) {
      setError('The passwords do not match.');
      setBusy(false);
      return;
    }

    try {
      const supabase = getSupabase();
      if (mode === 'recover') {
        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=reset-password`,
        });
        if (recoveryError) throw recoveryError;
        setMessage('Password reset email sent! Please check your Inbox and Spam/Junk folder for the recovery link.');
      } else if (mode === 'reset') {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        await signOut();
        setMessage('Password updated. Sign in with your new password to continue.');
      } else if (mode === 'signup') {
        const fullName = String(data.get('name') ?? '').trim();
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signupError) throw signupError;
        if (signupData.user?.identities?.length === 0) {
          throw new Error('An account may already exist for this email. Sign in or request a password reset.');
        }
        if (signupData.session) {
          const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
          if (signOutError) throw signOutError;
          throw new Error('Email confirmation is disabled for this Supabase project. Enable it in Authentication settings before accepting registrations.');
        }
        setVerificationEmail(email);
        setMessage(`Verification email sent to ${email}! Please check your Inbox and Spam/Junk folder to verify your account.`);
      } else {
        if (mode === 'admin' && email !== ADMIN_LOGIN_EMAIL) {
          throw new Error('Organizer access is restricted to the designated organizer account.');
        }

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        if (!loginData.user.email_confirmed_at) {
          await supabase.auth.signOut({ scope: 'local' });
          throw new Error('Verify your email using the link we sent before signing in.');
        }

        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
        if (adminError) throw adminError;

        if (email === ADMIN_LOGIN_EMAIL && !isAdmin) {
          await supabase.auth.signOut({ scope: 'local' });
          throw new Error('Your email and password were accepted, but this account is not provisioned as an admin. In Supabase SQL Editor, run the designated-admin provisioning SQL from the README after confirming this email, then try again.');
        }
        if (mode === 'admin' && !isAdmin) {
          await supabase.auth.signOut({ scope: 'local' });
          throw new Error('This account has not been authorized for organizer access.');
        }

        await refresh();
        const from = (location.state as { from?: string } | null)?.from;
        if (isAdmin) {
          const target = from?.startsWith('/admin') ? from : '/admin';
          navigate(target, { replace: true, state: { loggedIn: true } });
        } else {
          const target = from && !from.startsWith('/admin') ? from : '/register';
          navigate(target, { replace: true, state: { loggedIn: true } });
        }
      }
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Unable to complete this request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const { error: resendError } = await getSupabase().auth.resend({
        type: 'signup',
        email: verificationEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) throw resendError;
      setMessage(`Verification link resent to ${verificationEmail}! Please check your Inbox and Spam/Junk folder.`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'The verification email could not be sent.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-art">
        <Orbit size={72} strokeWidth={0.8} />
        <span className="eyebrow">BIAS-NSAC / 2026</span>
        <h2>
          Every great mission
          <br />
          starts with a
          <br />
          <em>curious mind.</em>
        </h2>
        <p>14–16 November · Bhimtal, Uttarakhand</p>
      </div>

      <div className="auth-form panel">
        <PageIntro
          eyebrow={mode === 'admin' ? 'AUTHORIZED ORGANIZERS ONLY' : 'YOUR PERSONAL MISSION CONTROL'}
          title={titles[mode]}
        />
        {searchParams.get('verified') === '1' && (
          <Notice popup>Your email is verified. Sign in to continue to team registration.</Notice>
        )}
        {isLoggedOut && (
          <Notice popup>Account logged out successfully.</Notice>
        )}
        {error && <Notice error popup>{error}</Notice>}
        {message && <Notice popup>{message}</Notice>}
        {message && ['signup', 'recover'].includes(mode) && (
          <div className="auth-email-tip">
            <Mail size={16} aria-hidden="true" />
            <div>
              <strong className="auth-card-heading">Check your email box:</strong>
              <p>We’ve dispatched the link. Be sure to check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder if it doesn’t appear in your primary inbox right away.</p>
            </div>
          </div>
        )}
        {mode === 'admin' && (
          <Notice>
            Welcome Back!
          </Notice>
        )}
        {verificationEmail && mode === 'signup' && message && (
          <button className="text-button" type="button" onClick={() => void resendVerification()} disabled={busy}>
            {busy ? 'Sending…' : 'Resend verification link'}
          </button>
        )}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Team leader full name
              <input name="name" autoComplete="name" required minLength={2} maxLength={120} />
            </label>
          )}

          {!['reset'].includes(mode) && (
            <label>
              Email address
              <input type="email" name="email" autoComplete="email" required />
            </label>
          )}

          {mode !== 'recover' && (
            <>
              <label className="auth-password-field">
                {mode === 'reset' ? 'New password' : 'Password'}
                <span className="auth-password-control">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete={['signup', 'reset'].includes(mode) ? 'new-password' : 'current-password'}
                    required
                    minLength={['signup', 'reset'].includes(mode) ? 10 : 1}
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </span>
              </label>
              {mode === 'signup' && (
                <label className="auth-password-field">
                  Confirm password
                  <span className="auth-password-control">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      minLength={10}
                    />
                    <button
                      className="auth-password-toggle"
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                </label>
              )}
            </>
          )}

          {['signup', 'reset'].includes(mode) && (
            <p className="fine-print">Use at least 10 characters and a unique password.</p>
          )}

          <button className="button full-width" disabled={busy}>
            {busy
              ? 'Connecting…'
              : mode === 'signup'
                ? 'Create leader account'
                : mode === 'recover'
                  ? 'Send recovery email'
                  : mode === 'reset'
                    ? 'Save password'
                    : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>

        {['signup', 'recover'].includes(mode) ? (
          <div className="auth-rate-limit-card">
            <Clock size={16} aria-hidden="true" />
            <div>
              <strong className="auth-card-heading">Security & Anti-Spam Notice:</strong>
              <p>
                Please do not repeatedly press the submit button. Frequent requests will trigger a security rate limit block <span style={{ whiteSpace: 'nowrap' }}>(wait <strong>5 to 10 minutes</strong> before retrying).</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="auth-rate-limit-note">
            Avoid repeatedly pressing sign in. If you hit a rate limit, wait 2–5 minutes before trying again.
          </p>
        )}

        <div className="auth-switches">
          {['login', 'admin'].includes(mode) && (
            <div className="auth-switch">
              <span className="auth-switch-label">Forgot your password?</span>
              <Link className="auth-switch-link" to="/forgot-password">
                <span>Reset password</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {mode === 'login' && (
            <div className="auth-switch">
              <span className="auth-switch-label">Team leader?</span>
              <Link className="auth-switch-link" to="/signup">
                <span>Create an account</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
          {mode === 'signup' && (
            <div className="auth-switch">
              <span className="auth-switch-label">Already have an account?</span>
              <Link className="auth-switch-link" to="/login">
                <span>Sign in</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
          {mode === 'admin' && (
            <div className="auth-switch">
              <span className="auth-switch-label">Need an account?</span>
              <Link className="auth-switch-link" to="/signup">
                <span>Create account</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
          {mode === 'recover' && (
            <>
              <div className="auth-switch">
                <span className="auth-switch-label">Remember your password?</span>
                <Link className="auth-switch-link" to="/login">
                  <span>Sign in</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="auth-switch">
                <span className="auth-switch-label">Need a new account?</span>
                <Link className="auth-switch-link" to="/signup">
                  <span>Create an account</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
          {mode === 'reset' && (
            <div className="auth-switch">
              <span className="auth-switch-label">Back to account?</span>
              <Link className="auth-switch-link" to="/login">
                <span>Sign in</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
