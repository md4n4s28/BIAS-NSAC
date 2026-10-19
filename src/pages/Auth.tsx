import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Orbit } from 'lucide-react';
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
  const [searchParams] = useSearchParams();

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
        setMessage('If an account exists for this email, a password recovery link has been sent.');
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
        setMessage('Account created. Open the verification link sent to your email, then sign in to register your team.');
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
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/register', { replace: true });
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
      setMessage('If this account still needs verification, a fresh link has been sent.');
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
        <span className="eyebrow">ASTROVERSE / 2026</span>
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
          <Notice>Your email is verified. Sign in to continue to team registration.</Notice>
        )}
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
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

        {['signup', 'login', 'admin', 'recover'].includes(mode) && (
          <p className="auth-rate-limit-note">
            Avoid repeatedly pressing the button. If you hit a rate limit, wait 2–5 minutes before trying again.
          </p>
        )}

        {['login', 'admin'].includes(mode) && (
          <Link className="arrow-link" to="/forgot-password">Forgot your password?</Link>
        )}

        {mode === 'login' && (
          <p>Team leader? <Link to="/signup">Create an account</Link></p>
        )}
        {mode === 'signup' && (
          <div className="auth-switch">
            <span>Already have an account?</span>
            <Link className="auth-switch-link" to="/login">Sign in <ArrowRight size={16} /></Link>
          </div>
        )}
        {mode === 'admin' && (
          <p> <Link to="/signup">Create account</Link></p>
        )}
        {mode === 'reset' && message && (
          <Link className="button" to="/login">Go to sign in</Link>
        )}
      </div>
    </div>
  );
}
