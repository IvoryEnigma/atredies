import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project-id')
);

// Allowed email domains configured via .env
export const ALLOWED_EMAIL_DOMAINS = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || 'aitpune.edu.in')
  .split(',')
  .map((d: string) => d.trim().toLowerCase())
  .filter(Boolean);

// Create real client if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  hasTables: boolean;
  message: string;
}

/**
 * Actively tests connectivity to Supabase and verifies whether
 * the database tables (e.g. public.subjects) exist.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      hasTables: false,
      message: 'Supabase credentials are not configured. Running in offline demo mode.',
    };
  }

  try {
    const { error, status } = await supabase.from('subjects').select('id', { head: true, count: 'exact' });

    if (error) {
      if (status === 404 || error.message.includes('schema cache') || error.code === 'PGRST204' || error.code === '42P01') {
        return {
          isConfigured: true,
          isConnected: true,
          hasTables: false,
          message: 'Connected to Supabase project, but database tables are not found. Please run the SQL migration in Supabase SQL Editor.',
        };
      }
      return {
        isConfigured: true,
        isConnected: false,
        hasTables: false,
        message: `Connection error: ${error.message}`,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      hasTables: true,
      message: 'Connected to Supabase PostgreSQL database with active schema.',
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      hasTables: false,
      message: err?.message || 'Unable to reach Supabase server.',
    };
  }
}
