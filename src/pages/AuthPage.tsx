import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Branch, AcademicYear } from '../types';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, allowedDomains, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [branch, setBranch] = useState<Branch>('COMP');
  const [year, setYear] = useState<AcademicYear>('TE');
  const [semester, setSemester] = useState<number>(5);
  const [prnNumber, setPrnNumber] = useState('');

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await signUp({
      email,
      password,
      full_name: fullName,
      role,
      branch,
      year,
      semester,
      prn_number: prnNumber,
    });
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.message) {
      setSuccessMsg(res.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.message) {
      setSuccessMsg(res.message);
    }
  };

  // Quick One-Click Demo Logins for instant evaluation
  const handleQuickDemoLogin = (demoRole: UserRole) => {
    clearMessages();
    if (demoRole === 'student') {
      setEmail('cadet.sharma@aitpune.edu.in');
      setPassword('aitpune@2026');
      signIn('cadet.sharma@aitpune.edu.in', 'aitpune@2026');
    } else if (demoRole === 'mentor') {
      setEmail('prof.deshmukh@aitpune.edu.in');
      setPassword('aitmentor@2026');
      signIn('prof.deshmukh@aitpune.edu.in', 'aitmentor@2026');
    } else if (demoRole === 'admin') {
      setEmail('admin.office@aitpune.edu.in');
      setPassword('aitadmin@2026');
      signIn('admin.office@aitpune.edu.in', 'aitadmin@2026');
    }
  };

  return (
    <div className="min-h-screen bg-[#10131C] text-[#F3F4F8] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B7CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#54D6C7]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#191F2E] rounded-3xl border border-white/[0.08] shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B7CFF] to-[#54D6C7] flex items-center justify-center shadow-lg shadow-[#8B7CFF]/25 mb-3">
            <GraduationCap className="w-8 h-8 text-[#10131C]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F4F8]">
            AIT Academia Hub
          </h1>
          <p className="text-xs text-[#A4ADBE] mt-1">
            Army Institute of Technology, Pune • Academic Portal
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">
              <Building className="w-3 h-3" />
              SPPU Curriculum
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#54D6C7]/15 text-[#54D6C7] border border-[#54D6C7]/30">
              <ShieldCheck className="w-3 h-3" />
              {isConfigured ? 'Supabase Auth' : 'Demo Auth'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#10131C] p-1 mb-6 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => { setMode('signin'); clearMessages(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#8B7CFF] text-[#10131C] shadow-sm'
                : 'text-[#A4ADBE] hover:text-[#F3F4F8]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); clearMessages(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#8B7CFF] text-[#10131C] shadow-sm'
                : 'text-[#A4ADBE] hover:text-[#F3F4F8]'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); clearMessages(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'forgot'
                ? 'bg-[#8B7CFF] text-[#10131C] shadow-sm'
                : 'text-[#A4ADBE] hover:text-[#F3F4F8]'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#54D6C7]/15 border border-[#54D6C7]/30 text-[#54D6C7] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Academic Email Address
              </label>
              <div className="relative">
<Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE] ${email ? 'hidden' : ''}`} />
                <input
                  type="email"
                  required
                  placeholder="cadet.sharma@aitpune.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF] transition-all"
                />
              </div>
              <p className="text-[10px] text-[#A4ADBE]/70 mt-1">
                Official domain: <span className="text-[#8B7CFF]">{allowedDomains.join(', ')}</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[10px] text-[#8B7CFF] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE] ${password ? 'hidden' : ''}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A4ADBE] hover:text-[#F3F4F8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-all shadow-lg shadow-[#8B7CFF]/25 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
                <input
                  type="text"
                  required
                  placeholder="Aryan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE] ${email ? 'hidden' : ''}`} />
                <input
                  type="email"
                  required
                  placeholder="your.name@aitpune.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as Branch)}
                  className="w-full p-2 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                >
                  <option value="COMP">Computer (COMP)</option>
                  <option value="IT">Info Tech (IT)</option>
                  <option value="ENTC">Electronics (ENTC)</option>
                  <option value="MECH">Mechanical (MECH)</option>
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
                  className="w-full p-2 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                >
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Semester (1 - 8)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PRN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="AIT2022COMP042"
                  value={prnNumber}
                  onChange={(e) => setPrnNumber(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
              >
                <option value="student">Cadet Student</option>
                <option value="mentor">Teacher / Faculty Mentor</option>
                <option value="admin">Administrator (Moderator)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE] ${password ? 'hidden' : ''}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A4ADBE] hover:text-[#F3F4F8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-all shadow-lg shadow-[#8B7CFF]/25 disabled:opacity-50"
            >
              {loading ? 'Registering Account...' : 'Create AIT Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Registered AIT Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
                <input
                  type="email"
                  required
                  placeholder="cadet.sharma@aitpune.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-all shadow-lg shadow-[#8B7CFF]/25 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        {/* Quick Demo Logins Container */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#A4ADBE] uppercase tracking-wider">
              Quick Test Sign-In
            </span>
            <span className="text-[10px] text-[#54D6C7]">
              One-Click Session
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="py-1.5 px-2 rounded-xl bg-[#10131C] hover:bg-[#222A3D] text-[#8B7CFF] border border-[#8B7CFF]/30 text-[11px] font-semibold transition-colors"
            >
              Cadet
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('mentor')}
              className="py-1.5 px-2 rounded-xl bg-[#10131C] hover:bg-[#222A3D] text-[#54D6C7] border border-[#54D6C7]/30 text-[11px] font-semibold transition-colors"
            >
              Mentor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-1.5 px-2 rounded-xl bg-[#10131C] hover:bg-[#222A3D] text-[#F0B86E] border border-[#F0B86E]/30 text-[11px] font-semibold transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
