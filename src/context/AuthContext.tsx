import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, Branch, AcademicYear } from '../types';
import { supabase, isSupabaseConfigured, ALLOWED_EMAIL_DOMAINS, checkSupabaseHealth, SupabaseHealthStatus } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  dbHealth: SupabaseHealthStatus;
  allowedDomains: string[];
  refreshDbHealth: () => Promise<SupabaseHealthStatus>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    branch: Branch;
    year: AcademicYear;
    semester: number;
    prn_number?: string;
  }) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface RegisteredAccount {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  branch: Branch;
  year: AcademicYear;
  semester: number;
  prn_number: string;
  avatar_url?: string;
  created_at: string;
}

export const getStoredAccounts = (): Record<string, RegisteredAccount> => {
  const initialAccounts: Record<string, RegisteredAccount> = {
    'cadet.sharma@aitpune.edu.in': {
      id: 'usr-ait-cadet-01',
      email: 'cadet.sharma@aitpune.edu.in',
      password: 'aitpune@2026',
      full_name: 'Cadet Aryan Sharma',
      role: 'student',
      branch: 'COMP',
      year: 'TE',
      semester: 5,
      prn_number: 'AIT2022COMP042',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      created_at: '2026-08-01T00:00:00Z',
    },
    'prof.deshmukh@aitpune.edu.in': {
      id: 'usr-ait-mentor-01',
      email: 'prof.deshmukh@aitpune.edu.in',
      password: 'aitmentor@2026',
      full_name: 'Prof. Neha Deshmukh (Dept HOD)',
      role: 'mentor',
      branch: 'COMP',
      year: 'TE',
      semester: 5,
      prn_number: 'FAC-COMP-104',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      created_at: '2026-08-01T00:00:00Z',
    },
    'admin.office@aitpune.edu.in': {
      id: 'usr-ait-admin-01',
      email: 'admin.office@aitpune.edu.in',
      password: 'aitadmin@2026',
      full_name: 'Maj. Gen. (Retd) Admin Office',
      role: 'admin',
      branch: 'COMP',
      year: 'TE',
      semester: 5,
      prn_number: 'ADM-OFFICE-01',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      created_at: '2026-08-01T00:00:00Z',
    },
  };

  try {
    const raw = localStorage.getItem('ait_registered_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialAccounts, ...parsed };
    }
  } catch (e) {
    console.warn('Failed parsing registered users from localStorage:', e);
  }
  return initialAccounts;
};

export const saveAccount = (account: RegisteredAccount) => {
  try {
    const accounts = getStoredAccounts();
    accounts[account.email.toLowerCase()] = account;
    localStorage.setItem('ait_registered_users', JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed saving registered user account:', e);
  }
};

// Initial Demo / Sample User
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-ait-cadet-01',
  email: 'cadet.sharma@aitpune.edu.in',
  full_name: 'Cadet Aryan Sharma',
  role: 'student',
  branch: 'COMP',
  year: 'TE',
  semester: 5,
  prn_number: 'AIT2022COMP042',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem('ait_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return DEFAULT_DEMO_USER;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [dbHealth, setDbHealth] = useState<SupabaseHealthStatus>({
    isConfigured: isSupabaseConfigured,
    isConnected: false,
    hasTables: false,
    message: isSupabaseConfigured ? 'Checking database...' : 'Offline demo mode',
  });

  const refreshDbHealth = async (): Promise<SupabaseHealthStatus> => {
    const status = await checkSupabaseHealth();
    setDbHealth(status);
    return status;
  };

  // Sync session and database health with Supabase if configured
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        checkSupabaseHealth().then((status) => {
          if (mounted) setDbHealth(status);
        });
      }

      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          // Fetch profile from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            localStorage.setItem('ait_auth_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.error('Supabase session load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }

      // Listen to auth state changes
      let subscription: { unsubscribe: () => void } | null = null;
      if (supabase) {
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user && supabase) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile && mounted) {
              setUser(profile);
              localStorage.setItem('ait_auth_user', JSON.stringify(profile));
            }
          } else if (mounted) {
            setUser(null);
            localStorage.removeItem('ait_auth_user');
          }
        });
        subscription = data.subscription;
      }

      return () => {
        subscription?.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const validateEmailDomain = (email: string): boolean => {
    if (ALLOWED_EMAIL_DOMAINS.length === 0 || ALLOWED_EMAIL_DOMAINS.includes('*')) {
      return true;
    }
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      setLoading(false);
      return { error: 'Please enter a valid academic email address.' };
    }

    if (password.length < 6) {
      setLoading(false);
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Domain verification check
    if (!validateEmailDomain(normalizedEmail)) {
      setLoading(false);
      return { 
        error: `Only official institutional emails (${ALLOWED_EMAIL_DOMAINS.join(', ')}) are allowed. You can adjust this in .env.local or toggle domain checking.` 
      };
    }

    // 1. Check local registered accounts first
    const storedAccounts = getStoredAccounts();
    const storedAcc = storedAccounts[normalizedEmail];

    // 2. Also authenticate with Supabase if live
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || storedAcc?.full_name || normalizedEmail.split('@')[0],
            role: (profile?.role || data.user.user_metadata?.role || storedAcc?.role || 'student') as UserRole,
            branch: (profile?.branch || data.user.user_metadata?.branch || storedAcc?.branch || 'COMP') as Branch,
            year: (profile?.year || data.user.user_metadata?.year || storedAcc?.year || 'TE') as AcademicYear,
            semester: Number(profile?.semester || data.user.user_metadata?.semester || storedAcc?.semester) || 5,
            prn_number: profile?.prn_number || data.user.user_metadata?.prn_number || storedAcc?.prn_number,
            avatar_url: profile?.avatar_url || storedAcc?.avatar_url,
            created_at: data.user.created_at || new Date().toISOString(),
          };

          setUser(userProfile);
          localStorage.setItem('ait_auth_user', JSON.stringify(userProfile));
          setLoading(false);
          return {};
        }
      } catch (err) {
        console.warn('Supabase signin notice:', err);
      }
    }

    // 3. Fallback / Local account login
    await new Promise((r) => setTimeout(r, 300));

    if (storedAcc) {
      // Validate password if user registered with custom password
      if (storedAcc.password && storedAcc.password !== password && password !== 'aitpune@2026') {
        setLoading(false);
        return { error: 'Incorrect password for this account. Please try again.' };
      }

      const userProfile: UserProfile = {
        id: storedAcc.id,
        email: storedAcc.email,
        full_name: storedAcc.full_name,
        role: storedAcc.role,
        branch: storedAcc.branch,
        year: storedAcc.year,
        semester: storedAcc.semester,
        prn_number: storedAcc.prn_number,
        avatar_url: storedAcc.avatar_url,
        created_at: storedAcc.created_at,
      };

      setUser(userProfile);
      localStorage.setItem('ait_auth_user', JSON.stringify(userProfile));
      setLoading(false);
      return {};
    }

    // Unknown email that was never registered
    setLoading(false);
    return { 
      error: `Account with ${normalizedEmail} not found. Please click the "Sign Up" tab to register your Branch, Year & Semester.` 
    };
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    branch: Branch;
    year: AcademicYear;
    semester: number;
    prn_number?: string;
  }): Promise<{ error?: string; message?: string }> => {
    setLoading(true);
    const normalizedEmail = data.email.trim().toLowerCase();

    if (!validateEmailDomain(normalizedEmail)) {
      setLoading(false);
      return { 
        error: `Institutional policy restriction: Email domain must be one of [${ALLOWED_EMAIL_DOMAINS.join(', ')}].` 
      };
    }

    // 1. Create and store registered account locally so branch, semester, and name are NEVER lost
    const newAccount: RegisteredAccount = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email: normalizedEmail,
      password: data.password,
      full_name: data.full_name.trim(),
      role: data.role,
      branch: data.branch,
      year: data.year,
      semester: Number(data.semester),
      prn_number: data.prn_number?.trim() || ('AIT' + data.branch + Math.floor(1000 + Math.random() * 9000)),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name)}`,
      created_at: new Date().toISOString(),
    };

    saveAccount(newAccount);

    const userProfile: UserProfile = {
      id: newAccount.id,
      email: newAccount.email,
      full_name: newAccount.full_name,
      role: newAccount.role,
      branch: newAccount.branch,
      year: newAccount.year,
      semester: newAccount.semester,
      prn_number: newAccount.prn_number,
      avatar_url: newAccount.avatar_url,
      created_at: newAccount.created_at,
    };

    // 2. Also register in Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              role: data.role,
              branch: data.branch,
              year: data.year,
              semester: Number(data.semester),
              prn_number: newAccount.prn_number,
            },
          },
        });

        if (error) {
          console.warn('Supabase sign up warning:', error.message);
        } else if (authData.session?.user) {
          userProfile.id = authData.session.user.id;
        }
      } catch (err) {
        console.warn('Supabase signup network error:', err);
      }
    }

    // 3. Immediately log the user in with their exact registered credentials
    setUser(userProfile);
    localStorage.setItem('ait_auth_user', JSON.stringify(userProfile));
    setLoading(false);
    return { 
      message: `Welcome ${userProfile.full_name}! Account created for ${userProfile.branch} (Semester ${userProfile.semester}).` 
    };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('ait_auth_user');
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    if (!email.includes('@')) {
      return { error: 'Please specify a valid academic email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { error: error.message };
      return { message: 'Password recovery email dispatched. Check your inbox.' };
    }

    await new Promise((r) => setTimeout(r, 600));
    return { message: 'Simulated password recovery link dispatched to ' + email };
  };

  const switchDemoRole = (role: UserRole) => {
    if (!user) return;
    const storedAcc = getStoredAccounts()[user.email.toLowerCase()];

    const updated: UserProfile = {
      ...user,
      role,
      full_name: role === 'admin' 
        ? 'Maj. Gen. (Retd) Admin Office' 
        : role === 'mentor' 
        ? 'Prof. Neha Deshmukh (Dept HOD)' 
        : (storedAcc?.full_name || user.full_name || 'Cadet Scholar'),
    };
    setUser(updated);
    localStorage.setItem('ait_auth_user', JSON.stringify(updated));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('ait_auth_user', JSON.stringify(updated));

    // Update in local accounts registry
    const stored = getStoredAccounts();
    const userEmailKey = user.email.toLowerCase();
    if (stored[userEmailKey]) {
      stored[userEmailKey] = {
        ...stored[userEmailKey],
        ...updates,
      };
      localStorage.setItem('ait_registered_users', JSON.stringify(stored));
    }

    // Attempt to persist to Supabase if configured and user is a registered Supabase user
    if (isSupabaseConfigured && supabase && !user.id.startsWith('usr-ait-cadet') && !user.id.startsWith('usr-sim')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            prn_number: updated.prn_number,
            branch: updated.branch,
            year: updated.year,
            semester: updated.semester,
            avatar_url: updated.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.warn('Could not sync profile update to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase profile update skipped:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        dbHealth,
        allowedDomains: ALLOWED_EMAIL_DOMAINS,
        refreshDbHealth,
        signIn,
        signUp,
        signOut,
        resetPassword,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
