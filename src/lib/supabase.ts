import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type RegistrationRow = {
  id: number;
  reference: string;
  problem_statement: string;
  owner_id: string;
  team_name: string;
  institution: string;
  category: 'school' | 'college';
  mentor: string | null;
  status: 'pending' | 'approved' | 'rejected';
  member_count: number;
  participation_mode: 'offline' | 'online';
  consent_version: string;
  created_at: string;
  deleted_at: string | null;
};

type ParticipantRow = {
  id: number;
  reference: string;
  registration_id: number;
  name: string;
  email: string;
  mobile: string;
  institution: string;
  role: 'leader' | 'member';
};

type EventConfigRow = {
  id: number;
  min_members: number;
  max_members: number;
  registration_open: boolean;
};

type TeamQueryRow = {
  id: number;
  registration_id: number;
  title: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      registrations: {
        Row: RegistrationRow;
        Insert: Omit<RegistrationRow, 'id' | 'reference' | 'created_at'>;
        Update: Partial<Omit<RegistrationRow, 'id' | 'reference' | 'created_at'>>;
        Relationships: [];
      };
      participants: {
        Row: ParticipantRow;
        Insert: Omit<ParticipantRow, 'id'>;
        Update: Partial<Omit<ParticipantRow, 'id'>>;
        Relationships: [];
      };
      event_config: {
        Row: EventConfigRow;
        Insert: Partial<EventConfigRow>;
        Update: Partial<EventConfigRow>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string };
        Update: never;
        Relationships: [];
      };
      audit: {
        Row: { id: number; actor_id: string; action: string; reference: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      team_queries: {
        Row: TeamQueryRow;
        Insert: Omit<TeamQueryRow, 'id' | 'created_at' | 'status'> & { status?: TeamQueryRow['status'] };
        Update: Partial<Pick<TeamQueryRow, 'status'>>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      admin_update_team: {
        Args: { p_team_reference: string; p_team: Json; p_members: Json };
        Returns: RegistrationRow;
      };
      register_team: {
        Args: {
          p_team_name: string;
          p_institution: string;
          p_category: 'school' | 'college';
          p_mentor: string | null;
          p_problem_statement: string;
          p_members: Json;
          p_consent: boolean;
          p_participation_mode?: 'offline' | 'online';
        };
        Returns: RegistrationRow;
      };
      public_verify_registration: {
        Args: { p_reference: string };
        Returns: {
          reference: string;
          team_reference: string;
          team_name: string;
          institution: string;
          category: 'school' | 'college';
          status: 'pending' | 'approved' | 'rejected';
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (
    !url ||
    !key ||
    url.includes('your-project') ||
    key === 'your-supabase-anon-or-publishable-key'
  ) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }

  supabaseClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
    },
  });
  return supabaseClient;
}

export type { User as SupabaseUser };
