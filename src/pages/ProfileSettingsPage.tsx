import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Database, 
  CheckCircle2, 
  Building, 
  Save, 
  FileCode, 
  Terminal 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Branch, AcademicYear, UserRole } from '../types';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, switchDemoRole, allowedDomains, dbHealth, refreshDbHealth } = useAuth();
  const { theme, setTheme } = useTheme();
  const [checkingDb, setCheckingDb] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [prnNumber, setPrnNumber] = useState(user?.prn_number || '');
  const [branch, setBranch] = useState<Branch>(user?.branch || 'COMP');
  const [year, setYear] = useState<AcademicYear>(user?.year || 'TE');
  const [semester, setSemester] = useState<number>(user?.semester || 5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPrnNumber(user.prn_number || '');
      setBranch(user.branch || 'COMP');
      setYear(user.year || 'TE');
      setSemester(user.semester || 5);
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      prn_number: prnNumber,
      branch,
      year,
      semester,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF]">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
              Profile & Academic Settings
            </h1>
            <p className="text-xs text-[#A4ADBE]">
              Manage curriculum defaults, institutional credentials, and Supabase database configuration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 spans: Profile Form & Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cadet Information Form */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-bold text-[#F3F4F8]">
                Cadet Academic Identity
              </h2>
              {savedSuccess && (
                <span className="text-xs text-[#54D6C7] font-semibold flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Changes Persisted!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    AIT Permanent Registration Number (PRN)
                  </label>
                  <input
                    type="text"
                    value={prnNumber}
                    onChange={(e) => setPrnNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Institutional Email (Verified)
                </label>
                <div className="p-2.5 rounded-xl bg-[#10131C] text-[#A4ADBE] border border-white/[0.06] flex items-center justify-between">
                  <span>{user?.email}</span>
                  <span className="text-[10px] text-[#54D6C7] font-bold bg-[#54D6C7]/15 px-2 py-0.5 rounded">
                    Domain Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Branch / Dept
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  >
                    <option value="COMP">Computer Engg (COMP)</option>
                    <option value="IT">Info Tech (IT)</option>
                    <option value="ENTC">Electronics & Telecom (ENTC)</option>
                    <option value="MECH">Mechanical Engg (MECH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => {
                      const y = e.target.value as AcademicYear;
                      setYear(y);
                      setSemester(y === 'FE' ? 1 : y === 'SE' ? 3 : y === 'TE' ? 5 : 7);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Active Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-all shadow-md shadow-[#8B7CFF]/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile Defaults</span>
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Display Preferences */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[#F3F4F8] pb-2 border-b border-white/[0.06]">
              Display & Theme Mode
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#10131C] border-[#8B7CFF] text-[#F3F4F8] shadow-lg'
                    : 'bg-[#10131C]/40 border-white/[0.06] text-[#A4ADBE]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF] flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dark Mode (Default)</h4>
                  <p className="text-[11px] text-[#A4ADBE] mt-0.5">
                    #10131C obsidian background. High-contrast violet and teal accents designed for late-night study sessions.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-[#8B7CFF] text-slate-900 shadow-lg'
                    : 'bg-[#10131C]/40 border-white/[0.06] text-[#A4ADBE]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0B86E]/20 text-[#F0B86E] flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Light Mode</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    High contrast crisp white surfaces for daytime library and classroom usage.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Email Domain Enforcement Policy */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Building className="w-4 h-4 text-[#8B7CFF]" />
              <span>Institutional Domain Policy</span>
            </div>
            <p className="text-[#A4ADBE] leading-relaxed">
              To guarantee that study notes and solutions are authentic to the Army Institute of Technology, registration validates against official domains:
            </p>
            <div className="p-3 rounded-2xl bg-[#10131C] border border-white/[0.06] font-mono text-[11px] text-[#54D6C7] flex items-center justify-between">
              <span>Allowed Domains: {allowedDomains.join(', ')}</span>
              <span className="text-[#A4ADBE] text-[10px]">Configured in .env</span>
            </div>
          </div>

        </div>

        {/* Right 1 span: Roles, Permissions & Supabase Guide */}
        <div className="space-y-6">
          
          {/* Active Role & Permission Gate */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#54D6C7]" />
              <span>Role-Aware Access Control</span>
            </h3>

            <div className="p-3 rounded-2xl bg-[#10131C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#A4ADBE]">Active Role:</span>
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF]">
                  {user?.role}
                </span>
              </div>
              <p className="text-[10px] text-[#A4ADBE]">
                {user?.role === 'student'
                  ? 'Cadet Student: Can browse resources, ask doubts, submit assignments, and calculate SGPA.'
                  : user?.role === 'mentor'
                  ? 'Faculty Mentor: Authorized to publish lecture notes, assign assignments, and verify peer answers.'
                  : 'Administrator: Full system moderation, content report resolution, and verification authority.'}
              </p>
            </div>

            {/* Quick Role Switcher for Evaluation */}
            <div>
              <span className="text-[10px] font-bold text-[#A4ADBE] uppercase block mb-1.5">
                Switch Evaluation Role
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['student', 'mentor', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchDemoRole(r)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
                      user?.role === r
                        ? 'bg-[#8B7CFF] text-[#10131C]'
                        : 'bg-[#10131C] text-[#A4ADBE] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Supabase Database Connection Guide */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#F3F4F8]">
                <Database className="w-4 h-4 text-[#8B7CFF]" />
                <span>Supabase PostgreSQL</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dbHealth.hasTables 
                  ? 'bg-[#54D6C7]/20 text-[#54D6C7]' 
                  : dbHealth.isConnected 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-[#F0B86E]/20 text-[#F0B86E]'
              }`}>
                {dbHealth.hasTables ? 'Tables Verified' : dbHealth.isConnected ? 'API Live (Migration Pending)' : 'Offline Ready'}
              </span>
            </div>

            <p className="text-[#A4ADBE] leading-relaxed text-[11px]">
              {dbHealth.message}
            </p>

            <div className="p-3 rounded-2xl bg-[#10131C] border border-white/[0.06] space-y-2 font-mono text-[10px]">
              <div className="text-[#8B7CFF] font-bold flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Migration File:</span>
              </div>
              <div className="text-slate-300 break-all">
                supabase/migrations/20261021_init_ait_hub.sql
              </div>
              <div className="pt-1 text-[#A4ADBE]">
                12 relational tables with Row Level Security (RLS) policies for Student, Mentor, and Admin roles.
              </div>
            </div>

            <button
              onClick={async () => {
                setCheckingDb(true);
                await refreshDbHealth();
                setTimeout(() => setCheckingDb(false), 500);
              }}
              disabled={checkingDb}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold bg-[#10131C] text-[#8B7CFF] hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
            >
              <Terminal className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin' : ''}`} />
              <span>{checkingDb ? 'Testing Connection...' : 'Test Database Connection'}</span>
            </button>

            <div className="space-y-1.5 text-[11px] text-[#A4ADBE] pt-1 border-t border-white/[0.04]">
              <strong>To link your live database:</strong>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Log in to your Supabase project dashboard</li>
                <li>Go to the <span className="text-[#8B7CFF]">SQL Editor</span> tab</li>
                <li>Copy and run <span className="text-[#54D6C7]">20261021_init_ait_hub.sql</span></li>
                <li>Click <em>Test Database Connection</em> above to verify!</li>
              </ol>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
