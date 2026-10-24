import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  GraduationCap, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAcademic } from '../context/AcademicContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGlobalSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileMenu, 
  activeTab: _activeTab,
  setActiveTab, 
  onGlobalSearch 
}) => {
  const { user, signOut, switchDemoRole, dbHealth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { announcements } = useAcademic();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onGlobalSearch(searchQuery.trim());
      setActiveTab('library');
    }
  };

  const urgentAnnouncements = announcements.filter((a) => a.priority === 'urgent');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#10131C]/90 dark:bg-[#10131C]/90 light:bg-white/90 border-b border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#191F2E] transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#54D6C7] flex items-center justify-center shadow-lg shadow-[#8B7CFF]/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 text-[#10131C]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
                  AIT Academia Hub
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
                  Pune
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-[#A4ADBE] dark:text-[#A4ADBE] light:text-slate-500 leading-none">
                Army Institute of Technology
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
            <input
              type="text"
              placeholder="Search notes, PYQs, subjects, topics (e.g. BCNF, TOC, SPOS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#191F2E] dark:bg-[#191F2E] light:bg-slate-100 text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 placeholder-[#A4ADBE]/60 border border-white/[0.06] focus:border-[#8B7CFF] focus:ring-1 focus:ring-[#8B7CFF] transition-all"
            />
            {searchQuery && (
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium rounded-md bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90"
              >
                Find
              </button>
            )}
          </div>
        </form>

        {/* Right Actions: Theme Toggle, Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Revision Shortcut */}
          <button
            onClick={() => setActiveTab('revision')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8B7CFF]/15 text-[#8B7CFF] hover:bg-[#8B7CFF]/25 border border-[#8B7CFF]/30 transition-all duration-200"
            title="Open Last-Night Revision Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#54D6C7]" />
            <span>Revision Mode</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-slate-100 text-[#A4ADBE] hover:text-[#F3F4F8] border border-white/[0.06] transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F0B86E]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8B7CFF]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-slate-100 text-[#A4ADBE] hover:text-[#F3F4F8] border border-white/[0.06] transition-colors"
              aria-label="View announcements and notifications"
            >
              <Bell className="w-4 h-4" />
              {urgentAnnouncements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#54D6C7] ring-2 ring-[#10131C]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-white border border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#8B7CFF]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
                      AIT Announcements
                    </span>
                  </div>
                  <button 
                    onClick={() => { setShowNotifications(false); setActiveTab('announcements'); }}
                    className="text-[11px] font-semibold text-[#8B7CFF] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {announcements.slice(0, 3).map((ann) => (
                    <div 
                      key={ann.id}
                      onClick={() => { setShowNotifications(false); setActiveTab('announcements'); }}
                      className="p-2.5 rounded-xl bg-[#10131C]/60 dark:bg-[#10131C]/60 light:bg-slate-50 hover:bg-[#222A3D] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#8B7CFF]/20 text-[#8B7CFF]">
                          {ann.category}
                        </span>
                        <span className="text-[10px] text-[#A4ADBE]">
                          {new Date(ann.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 line-clamp-1">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-[#A4ADBE] dark:text-[#A4ADBE] light:text-slate-500 line-clamp-2 mt-0.5">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-slate-100 hover:bg-[#222A3D] border border-white/[0.06] transition-colors"
              aria-label="User profile settings menu"
            >
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'Cadet'}`}
                alt={user?.full_name || 'User Profile'}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#8B7CFF]/40"
              />
              <div className="hidden xl:flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 leading-tight">
                  {user?.full_name?.split(' ')[0] || 'Cadet'}
                </span>
                <span className="text-[10px] font-medium text-[#54D6C7] leading-none uppercase">
                  {user?.role || 'student'}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-white border border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06] mb-3">
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'Cadet'}`}
                    alt={user?.full_name || 'Profile'}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#8B7CFF]/50"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 truncate">
                      {user?.full_name}
                    </h3>
                    <p className="text-[11px] text-[#A4ADBE] truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#54D6C7]/15 text-[#54D6C7]">
                      {user?.branch} • {user?.year} (Sem {user?.semester})
                    </span>
                  </div>
                </div>

                {/* Role Switcher for Demo / Evaluation */}
                <div className="mb-3 p-2.5 rounded-xl bg-[#10131C]/60 dark:bg-[#10131C]/60 light:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#A4ADBE] uppercase tracking-wider">
                      Preview Role
                    </span>
                    <span className="text-[10px] text-[#F0B86E]">
                      Permission Gate
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['student', 'mentor', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => switchDemoRole(r)}
                        className={`py-1 px-1.5 text-[10px] font-semibold rounded-lg capitalize transition-colors ${
                          user?.role === r
                            ? 'bg-[#8B7CFF] text-[#10131C]'
                            : 'bg-[#191F2E] dark:bg-[#191F2E] light:bg-white text-[#A4ADBE] hover:text-[#F3F4F8]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Status */}
                <div className="mb-3 px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px] bg-white/[0.02]">
                  <span className="text-[#A4ADBE]">Supabase Status:</span>
                  <span className="flex items-center gap-1 font-medium">
                    {dbHealth.hasTables ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#54D6C7]" />
                        <span className="text-[#54D6C7]">Live Tables Synced</span>
                      </>
                    ) : dbHealth.isConnected ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400">API Live (Schema Pending)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-[#F0B86E]" />
                        <span className="text-[#F0B86E]">Offline Demo Mode</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveTab('profile'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-[#A4ADBE] hover:text-[#F3F4F8] hover:bg-[#222A3D] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#8B7CFF]" />
                    <span>Profile & Academic Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); setActiveTab('bookmarks'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-[#A4ADBE] hover:text-[#F3F4F8] hover:bg-[#222A3D] transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#54D6C7]" />
                    <span>Saved Bookmarks</span>
                  </button>
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
