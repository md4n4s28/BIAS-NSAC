import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSupabase, type SupabaseUser } from './supabase';

type User = SupabaseUser & { name: string; confirmedAt: string | null };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  callbackError: string;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  callbackError: '',
  refresh: async () => {},
  signOut: async () => {},
});

function toAppUser(user: SupabaseUser): User {
  const name = user.user_metadata.full_name;
  return {
    ...user,
    name: typeof name === 'string' ? name : user.email ?? '',
    confirmedAt: user.email_confirmed_at ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setAdmin] = useState(false);
  const [callbackError, setCallbackError] = useState('');

  async function refresh() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    setCallbackError('');

    const current = data.session?.user ?? null;
    setUser(current ? toAppUser(current) : null);
    if (!current) {
      setAdmin(false);
      setLoading(false);
      return;
    }

    const { data: administrator, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) throw adminError;
    setAdmin(administrator);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (error) {
      setCallbackError(error instanceof Error ? error.message : 'Supabase configuration is missing.');
      setLoading(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? toAppUser(session.user) : null);
      setAdmin(false);
      setLoading(Boolean(session?.user));
      if (session?.user) {
        window.setTimeout(() => {
          if (!active) return;
          void supabase.rpc('is_admin').then(
            ({ data, error }) => {
              if (!active) return;
              if (error) {
                setCallbackError(`Could not verify organizer access: ${error.message}`);
                setLoading(false);
                return;
              }
              setAdmin(data);
              setCallbackError('');
              setLoading(false);
            },
            (error: unknown) => {
              if (!active) return;
              setCallbackError(error instanceof Error ? error.message : 'Could not verify organizer access.');
              setLoading(false);
            }
          );
        }, 0);
      }
    });

    void refresh().catch((error: unknown) => {
      if (!active) return;
      setCallbackError(error instanceof Error ? error.message : 'Could not restore the Supabase session.');
      setLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const { error } = await getSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
    setUser(null);
    setAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, callbackError, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page loading-state">Connecting to mission control…</div>;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (!user.email_confirmed_at) {
    return (
      <div className="page">
        <h1>Confirm your email first.</h1>
        <p>Use the verification link sent to your email, then sign in to continue.</p>
      </div>
    );
  }
  if (admin && !isAdmin) {
    return <div className="page"><h1>Access restricted</h1><p>This account has not been provisioned as an administrator.</p></div>;
  }
  return children;
}
