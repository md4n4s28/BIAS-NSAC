import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Notice, PageIntro } from '../components/UI';
import { getSupabase, type SupabaseUser } from '../lib/supabase';

let processedUrl = '';
let callbackResult: Promise<SupabaseUser> | null = null;

async function verifyCallback(url: string): Promise<SupabaseUser> {
  if (url !== processedUrl) {
    processedUrl = url;
    callbackResult = (async () => {
      const callbackUrl = new URL(url);
      const hashParams = new URLSearchParams(callbackUrl.hash.slice(1));
      const errorText =
        callbackUrl.searchParams.get('error_description') ??
        hashParams.get('error_description') ??
        callbackUrl.searchParams.get('error');
      if (errorText) throw new Error(errorText);

      const client = getSupabase();
      const code = callbackUrl.searchParams.get('code');
      const tokenHash =
        callbackUrl.searchParams.get('token_hash') ??
        callbackUrl.searchParams.get('token') ??
        hashParams.get('token_hash');
      const callbackType = callbackUrl.searchParams.get('type') ?? hashParams.get('type');
      const type = callbackType === 'email' ? 'signup' : callbackType;
      const accessToken = hashParams.get('access_token') ?? callbackUrl.searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') ?? callbackUrl.searchParams.get('refresh_token');

      if (code) {
        const { data, error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
        if (!data.user) throw new Error('The email link did not return an account.');
        return data.user;
      }

      if (accessToken && refreshToken && (type === 'signup' || type === 'recovery')) {
        const { data, error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        if (!data.user) throw new Error('The email link did not return an account.');
        return data.user;
      }

      if (tokenHash && (type === 'signup' || type === 'recovery')) {
        const { data, error } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (error) throw error;
        if (!data.user) throw new Error('The email link did not return an account.');
        return data.user;
      }

      throw new Error(
        'Supabase returned no confirmation code or token. Check that the email template links to the Supabase verification endpoint and that this site URL is allowed in Supabase Auth URL Configuration.'
      );
    })();
  }
  if (!callbackResult) throw new Error('The email confirmation could not be processed.');
  return callbackResult;
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function finish() {
      try {
        const user = await verifyCallback(window.location.href);
        if (!user.email_confirmed_at && searchParams.get('next') !== 'reset-password') {
          throw new Error('Your email could not be confirmed. Request a fresh verification link.');
        }

        if (searchParams.get('next') === 'reset-password') {
          navigate('/reset-password', { replace: true });
          return;
        }

        const { error: signOutError } = await getSupabase().auth.signOut({ scope: 'local' });
        if (signOutError) throw signOutError;
        navigate('/login?verified=1', { replace: true });
      } catch (caught: unknown) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'This email link is invalid or expired.');
        }
      }
    }
    void finish();
    return () => {
      active = false;
    };
  }, [navigate, searchParams]);

  return (
    <div className="page narrow">
      <PageIntro eyebrow="EMAIL VERIFICATION" title="Confirming your account." />
      {error ? (
        <>
          <Notice error>{error}</Notice>
          <Link className="button" to="/signup">Create account / request a new link</Link>
        </>
      ) : (
        <Notice>Checking your verification link…</Notice>
      )}
    </div>
  );
}
