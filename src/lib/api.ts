import { registrationSchema } from './validation';
import { getSupabase, type Database } from './supabase';

type RegistrationRow = Database['public']['Tables']['registrations']['Row'];
type ParticipantRow = Database['public']['Tables']['participants']['Row'];

export type Registration = {
  id: number;
  teamId: string;
  ownerId: string;
  teamName: string;
  problemStatement: string;
  institution: string;
  category: 'school' | 'college';
  participationMode: 'offline' | 'online';
  status: 'pending' | 'approved' | 'rejected';
  mentor?: string;
  createdAt: string;
  deletedAt?: string;
  members: {
    id: number;
    registrationId: string;
    name: string;
    email: string;
    mobile: string;
    institution: string;
    role: 'leader' | 'member';
  }[];
};

export type Settings = {
  minMembers: number;
  maxMembers: number;
  registrationOpen: number;
};

export type TeamQuery = {
  id: number;
  teamId?: string;
  teamName?: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderMobile?: string;
  title: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
};

function fail(error: { message: string; code?: string }): never {
  if (error.code === '23505') {
    throw new Error('This account, team name, email or mobile number is already registered.');
  }
  if (error.code === 'PGRST202' || error.code === 'PGRST203') {
    if (error.message.includes('admin_update_team')) {
      throw new Error(
        'Supabase is missing the organizer team-edit function. Apply the admin-console migration from the README, then reload the schema cache and retry.'
      );
    }
    throw new Error(
      'Supabase is missing the updated team-registration function. In Supabase SQL Editor, apply the registration/problem-statement migration from the README. If you already applied it, run NOTIFY pgrst, \'reload schema\'; then retry.'
    );
  }
  if (error.code === '23514' || error.code === 'P0001') {
    throw new Error(error.message || 'The registration does not meet the current team rules.');
  }
  throw new Error(error.message || 'The service could not complete this request.');
}

function mapParticipant(member: ParticipantRow) {
  return {
    id: member.id,
    registrationId: member.reference,
    name: member.name,
    email: member.email,
    mobile: member.mobile,
    institution: member.institution,
    role: member.role,
  };
}

function mapRegistration(
  row: RegistrationRow,
  members: ParticipantRow[] = []
): Registration {
  return {
    id: row.id,
    teamId: row.reference,
    ownerId: row.owner_id,
    teamName: row.team_name,
    problemStatement: row.problem_statement,
    institution: row.institution,
    category: row.category,
    participationMode: (row.participation_mode ?? 'offline') as 'offline' | 'online',
    status: row.status,
    mentor: row.mentor ?? undefined,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? undefined,
    members: members.map(mapParticipant),
  };
}

function parseBody(init: RequestInit): Record<string, unknown> {
  if (!init.body || typeof init.body !== 'string') return {};
  const value: unknown = JSON.parse(init.body);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The submitted request is invalid.');
  }
  return value as Record<string, unknown>;
}

async function requireUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error) fail(error);
  if (!data.user || !data.user.email_confirmed_at) {
    throw new Error('Sign in with a confirmed team leader account to continue.');
  }
  return data.user;
}

async function loadRegistration(row: RegistrationRow): Promise<Registration> {
  const { data: members, error } = await getSupabase()
    .from('participants')
    .select('*')
    .eq('registration_id', row.id)
    .order('id');
  if (error) fail(error);
  return mapRegistration(row, members);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = getSupabase();
  const method = (init.method ?? 'GET').toUpperCase();
  const body = parseBody(init);

  if (path === 'config' && method === 'GET') {
    const { data, error } = await supabase
      .from('event_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Event registration settings have not been configured.');
    return {
      minMembers: data.min_members,
      maxMembers: data.max_members,
      registrationOpen: data.registration_open ? 1 : 0,
    } as T;
  }

  if (path === 'session' && method === 'GET') {
    await requireUser();
    const { data, error } = await supabase.rpc('is_admin');
    if (error) fail(error);
    return { isAdmin: data } as T;
  }

  if (path === 'registration' && method === 'GET') {
    const user = await requireUser();
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) fail(error);
    return (data ? await loadRegistration(data) : null) as T;
  }

  if (path === 'registration' && method === 'POST') {
    const user = await requireUser();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(' '));
    }
    const input = parsed.data;
    let rpcResult = await supabase.rpc('register_team', {
      p_team_name: input.teamName,
      p_institution: input.institution,
      p_category: input.category,
      p_mentor: input.mentor || null,
      p_problem_statement: input.problemStatement,
      p_members: input.members.map((member) => ({
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        institution: member.institution,
        role: member.role,
      })),
      p_consent: input.consent,
      p_participation_mode: input.participationMode,
    });

    if (
      rpcResult.error &&
      (rpcResult.error.message.includes('p_participation_mode') ||
        rpcResult.error.code === 'PGRST202')
    ) {
      rpcResult = await supabase.rpc('register_team', {
        p_team_name: input.teamName,
        p_institution: input.institution,
        p_category: input.category,
        p_mentor: input.mentor || null,
        p_problem_statement: input.problemStatement,
        p_members: input.members.map((member) => ({
          name: member.name,
          email: member.email,
          mobile: member.mobile,
          institution: member.institution,
          role: member.role,
        })),
        p_consent: input.consent,
      });

      if (!rpcResult.error && rpcResult.data && input.participationMode) {
        await supabase
          .from('registrations')
          .update({ participation_mode: input.participationMode })
          .eq('id', rpcResult.data.id);
        rpcResult.data.participation_mode = input.participationMode;
      }
    }

    if (rpcResult.error) fail(rpcResult.error);
    const data = rpcResult.data;
    if (data.owner_id !== user.id) throw new Error('The registration owner could not be verified.');
    return mapRegistration(data) as T;
  }

  if (path === 'team-queries' && method === 'GET') {
    const user = await requireUser();
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    if (registrationError) fail(registrationError);
    if (!registration) return [] as T;
    const { data: rows, error } = await supabase
      .from('team_queries')
      .select('*')
      .eq('registration_id', registration.id)
      .order('created_at', { ascending: false });
    if (error) fail(error);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    })) as T;
  }

  if (path === 'team-queries' && method === 'POST') {
    const user = await requireUser();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (title.length < 3 || title.length > 120 || message.length < 10 || message.length > 2000) {
      throw new Error('Enter a title (3–120 characters) and a message (10–2000 characters).');
    }
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    if (registrationError) fail(registrationError);
    if (!registration) throw new Error('A submitted team registration is required to contact the organizer.');
    const { data, error } = await supabase
      .from('team_queries')
      .insert({ registration_id: registration.id, title, message })
      .select('*')
      .single();
    if (error) fail(error);
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
    } as T;
  }

  if (path === 'admin/queries' && method === 'GET') {
    await requireAdmin();
    const { data: rows, error } = await supabase
      .from('team_queries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) fail(error);
    if (!rows.length) return [] as T;
    const registrationIds = [...new Set(rows.map((row) => row.registration_id))];
    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('id, reference, team_name')
      .in('id', registrationIds);
    if (registrationsError) fail(registrationsError);
    const { data: leaders, error: leadersError } = await supabase
      .from('participants')
      .select('registration_id, name, email, mobile')
      .in('registration_id', registrationIds)
      .eq('role', 'leader');
    if (leadersError) fail(leadersError);
    return rows.map((row) => {
      const registration = registrations.find((item) => item.id === row.registration_id);
      const leader = leaders.find((item) => item.registration_id === row.registration_id);
      return {
        id: row.id,
        teamId: registration?.reference ?? 'Archived team',
        teamName: registration?.team_name ?? 'Archived team',
        leaderName: leader?.name ?? 'Not available',
        leaderEmail: leader?.email ?? '',
        leaderMobile: leader?.mobile ?? '',
        title: row.title,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
      };
    }) as T;
  }

  if (path.startsWith('admin/queries/') && method === 'PATCH') {
    await requireAdmin();
    const queryId = Number(path.slice('admin/queries/'.length));
    if (!Number.isSafeInteger(queryId) || queryId < 1 || !['open', 'resolved'].includes(String(body.status))) {
      throw new Error('Choose a valid query and status.');
    }
    const { data, error } = await supabase
      .from('team_queries')
      .update({ status: body.status as 'open' | 'resolved' })
      .eq('id', queryId)
      .select('id')
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('The team query was not found or could not be updated.');
    return { updated: true } as T;
  }

  if (path.startsWith('admin/queries/') && method === 'DELETE') {
    await requireAdmin();
    const queryId = Number(path.slice('admin/queries/'.length));
    if (!Number.isSafeInteger(queryId) || queryId < 1) {
      throw new Error('Choose a valid team query to delete.');
    }
    const { data, error } = await supabase
      .from('team_queries')
      .delete()
      .eq('id', queryId)
      .select('id')
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('The team query was not found or could not be deleted.');
    return { deleted: true } as T;
  }

  if (path === 'admin/registrations' && method === 'GET') {
    await requireAdmin();
    const { data: rows, error } = await supabase
      .from('registrations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) fail(error);
    if (!rows.length) return [] as T;
    const { data: members, error: membersError } = await supabase
      .from('participants')
      .select('*')
      .in('registration_id', rows.map((row) => row.id))
      .order('id');
    if (membersError) fail(membersError);
    return rows.map((row) =>
      mapRegistration(row, members.filter((member) => member.registration_id === row.id))
    ) as T;
  }

  if (path === 'admin/registrations/bin' && method === 'GET') {
    await requireAdmin();
    const { data: rows, error } = await supabase
      .from('registrations')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) fail(error);
    if (!rows.length) return [] as T;
    const { data: members, error: membersError } = await supabase
      .from('participants')
      .select('*')
      .in('registration_id', rows.map((row) => row.id))
      .order('id');
    if (membersError) fail(membersError);
    return rows.map((row) =>
      mapRegistration(row, members.filter((member) => member.registration_id === row.id))
    ) as T;
  }

  if (path.endsWith('/archive') && method === 'POST') {
    await requireAdmin();
    const teamId = decodeURIComponent(path.slice('admin/registrations/'.length, -'/archive'.length));
    const { data, error } = await supabase
      .from('registrations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('reference', teamId)
      .is('deleted_at', null)
      .select('id, deleted_at')
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Active team registration not found.');
    return { archivedAt: data.deleted_at } as T;
  }

  if (path.endsWith('/restore') && method === 'POST') {
    await requireAdmin();
    const teamId = decodeURIComponent(path.slice('admin/registrations/'.length, -'/restore'.length));
    const { data, error } = await supabase
      .from('registrations')
      .update({ deleted_at: null })
      .eq('reference', teamId)
      .not('deleted_at', 'is', null)
      .select('id')
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Archived team registration not found.');
    return { restored: true } as T;
  }

  if (path.startsWith('admin/registrations/')) {
    await requireAdmin();
    const teamId = decodeURIComponent(path.slice('admin/registrations/'.length));
    if (method === 'PATCH') {
      if (Array.isArray(body.members)) {
        if (
          typeof body.teamName !== 'string' ||
          typeof body.institution !== 'string' ||
          !['school', 'college'].includes(String(body.category)) ||
          typeof body.problemStatement !== 'string' ||
          typeof body.mentor !== 'string'
        ) {
          throw new Error('Provide complete team details before saving participant changes.');
        }
        const { data, error } = await supabase.rpc('admin_update_team', {
          p_team_reference: teamId,
          p_team: {
            team_name: body.teamName,
            institution: body.institution,
            category: String(body.category),
            mentor: body.mentor,
            problem_statement: body.problemStatement,
            participation_mode: typeof body.participationMode === 'string' ? body.participationMode : undefined,
          },
          p_members: body.members,
        });
        if (error) fail(error);
        return await loadRegistration(data) as T;
      }
      const patch: Database['public']['Tables']['registrations']['Update'] = {};
      if (typeof body.status === 'string') {
        if (!['pending', 'approved', 'rejected'].includes(body.status)) {
          throw new Error('Choose a valid registration status.');
        }
        patch.status = body.status as RegistrationRow['status'];
      }
      if (typeof body.participationMode === 'string') {
        if (!['offline', 'online'].includes(body.participationMode)) {
          throw new Error('Choose a valid participation mode (offline or online).');
        }
        patch.participation_mode = body.participationMode as RegistrationRow['participation_mode'];
      }
      if (typeof body.teamName === 'string') patch.team_name = body.teamName;
      if (typeof body.institution === 'string') patch.institution = body.institution;
      if (typeof body.mentor === 'string') patch.mentor = body.mentor || null;
      if (typeof body.problemStatement === 'string') patch.problem_statement = body.problemStatement;
      if (!Object.keys(patch).length) throw new Error('Choose at least one registration field to update.');
      const { data, error } = await supabase
        .from('registrations')
        .update(patch)
        .eq('reference', teamId)
        .is('deleted_at', null)
        .select('*')
        .maybeSingle();
      if (error) fail(error);
      if (!data) throw new Error('Registration not found or the update was not permitted.');
      return mapRegistration(data) as T;
    }
  }

  if (path === 'admin/config' && method === 'PATCH') {
    await requireAdmin();
    const minMembers = Number(body.minMembers);
    const maxMembers = Number(body.maxMembers);
    const registrationOpen = body.registrationOpen === 1;
    if (
      !Number.isInteger(minMembers) ||
      !Number.isInteger(maxMembers) ||
      minMembers < 1 ||
      maxMembers < minMembers ||
      maxMembers > 20 ||
      ![0, 1].includes(Number(body.registrationOpen))
    ) {
      throw new Error('Enter valid team-size limits and registration status.');
    }
    const { data, error } = await supabase
      .from('event_config')
      .update({
        min_members: minMembers,
        max_members: maxMembers,
        registration_open: registrationOpen,
      })
      .eq('id', 1)
      .select('*')
      .single();
    if (error) fail(error);
    return {
      minMembers: data.min_members,
      maxMembers: data.max_members,
      registrationOpen: data.registration_open ? 1 : 0,
    } as T;
  }

  if (path.startsWith('verify/') && method === 'GET') {
    const reference = decodeURIComponent(path.slice('verify/'.length));
    const { data, error } = await supabase.rpc('public_verify_registration', {
      p_reference: reference,
    });
    if (error) fail(error);
    const record = data[0];
    if (!record) throw new Error('No matching registration was found.');
    return {
      registrationId: record.reference,
      teamId: record.team_reference,
      teamName: record.team_name,
      institution: record.institution,
      category: record.category,
      status: record.status,
    } as T;
  }

  throw new Error('This action is not available.');
}

async function requireAdmin() {
  await requireUser();
  const { data, error } = await getSupabase().rpc('is_admin');
  if (error) fail(error);
  if (!data) throw new Error('This account is not authorized for administration.');
}
