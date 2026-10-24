import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  UploadCloud, 
  FileText, 
  Bookmark, 
  Eye, 
  TrendingUp,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onOpenUploadModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  setActiveTab, 
  onOpenUploadModal 
}) => {
  const { user } = useAuth();
  const { 
    resources, 
    assignments, 
    doubts, 
    announcements, 
    openResourcePreview, 
    toggleBookmark, 
    bookmarks 
  } = useAcademic();

  const recentResources = resources.slice(0, 4);
  const pendingAssignments = assignments.filter((a) => a.status === 'pending').slice(0, 3);
  const recentDoubts = doubts.slice(0, 3);
  const latestAnnouncements = announcements.slice(0, 2);

  // Time-aware greeting
  const [greeting] = React.useState<string>(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Top Academic Hero Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-3xl bg-white light:bg-white light:bg-none dark:bg-gradient-to-r dark:from-[#191F2E] dark:via-[#1E2538] dark:to-[#191F2E] p-6 sm:p-8 border border-slate-200 dark:border-white/[0.08] shadow-md shadow-slate-200/50 dark:shadow-2xl transition-colors duration-200">
        {/* Ambient atmospheric shapes */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#8B7CFF]/15 dark:bg-[#8B7CFF]/15 light:bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-100" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-[#54D6C7]/10 dark:bg-[#54D6C7]/10 light:bg-[#54D6C7]/10 rounded-full blur-2xl pointer-events-none opacity-30 dark:opacity-100" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 light:bg-purple-50 dark:bg-[#8B7CFF]/20 text-purple-700 light:text-purple-700 dark:text-[#8B7CFF] text-xs font-semibold border border-purple-200 light:border-purple-200 dark:border-[#8B7CFF]/30">
                <span className="w-2 h-2 rounded-full bg-teal-500 light:bg-teal-500 dark:bg-[#54D6C7] animate-pulse" />
                {user?.branch} • {user?.year} (Semester {user?.semester})
              </span>
              <span className="text-xs text-slate-500 light:text-slate-500 dark:text-[#A4ADBE]">
                Army Institute of Technology, Pune
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 light:text-slate-900 dark:text-[#F3F4F8]">
              {greeting}, <span className="text-[#6C5CE7] light:text-[#6C5CE7] dark:text-[#8B7CFF]">{user?.full_name?.replace(/^Cadet\s+/i, '') || 'Scholar'}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 light:text-slate-600 dark:text-[#A4ADBE] leading-relaxed">
              Your centralized academic command: explore verified SPPU notes, solve peer doubts, track deadlines, and launch Last-Night Revision mode.
            </p>

            {/* Quick Actions Row */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab('revision')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8B7CFF] to-[#7B6CE8] text-[#10131C] dark:text-[#10131C] light:text-white hover:opacity-95 transition-all shadow-lg shadow-[#8B7CFF]/25 hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#10131C] dark:text-[#10131C] light:text-white" />
                <span>Last-Night Revision</span>
              </button>

              <button
                onClick={() => setActiveTab('doubts')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white light:bg-slate-50 light:hover:bg-slate-100 dark:bg-[#191F2E] dark:hover:bg-[#222A3D] text-slate-800 light:text-slate-800 dark:text-[#F3F4F8] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none transition-all hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-teal-600 light:text-teal-600 dark:text-[#54D6C7]" />
                <span>Ask a Doubt</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white light:bg-slate-50 light:hover:bg-slate-100 dark:bg-[#191F2E] dark:hover:bg-[#222A3D] text-slate-800 light:text-slate-800 dark:text-[#F3F4F8] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none transition-all hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-purple-600 light:text-purple-600 dark:text-[#8B7CFF]" />
                <span>Browse PYQs</span>
              </button>

              <button
                onClick={() => setActiveTab('sgpa')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white light:bg-slate-50 light:hover:bg-slate-100 dark:bg-[#191F2E] dark:hover:bg-[#222A3D] text-slate-800 light:text-slate-800 dark:text-[#F3F4F8] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none transition-all hover:-translate-y-0.5"
              >
                <Calculator className="w-4 h-4 text-amber-600 light:text-amber-600 dark:text-[#F0B86E]" />
                <span>Calculate SGPA</span>
              </button>

              <button
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 light:text-slate-600 dark:text-[#A4ADBE] hover:text-slate-900 light:hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 light:hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                title="Upload Notes / Question Papers"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3 shrink-0 lg:w-56">
            <div className="p-3 rounded-2xl bg-slate-50/80 light:bg-slate-50/90 dark:bg-[#10131C]/70 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 light:text-slate-500 dark:text-[#A4ADBE] uppercase tracking-wider block">
                  Current SGPA
                </span>
                <span className="text-lg font-extrabold text-teal-700 light:text-teal-700 dark:text-[#54D6C7]">
                  8.92
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 light:bg-teal-50 dark:bg-[#54D6C7]/15 border border-teal-200/60 dark:border-transparent flex items-center justify-center text-teal-600 light:text-teal-600 dark:text-[#54D6C7]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 light:bg-slate-50/90 dark:bg-[#10131C]/70 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 light:text-slate-500 dark:text-[#A4ADBE] uppercase tracking-wider block">
                  Attendance
                </span>
                <span className="text-lg font-extrabold text-purple-700 light:text-purple-700 dark:text-[#8B7CFF]">
                  88.4%
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 light:bg-purple-50 dark:bg-[#8B7CFF]/15 border border-purple-200/60 dark:border-transparent flex items-center justify-center text-purple-600 light:text-purple-600 dark:text-[#8B7CFF]">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 light:bg-slate-50/90 dark:bg-[#10131C]/70 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 light:text-slate-500 dark:text-[#A4ADBE] uppercase tracking-wider block">
                  Pending Tasks
                </span>
                <span className="text-lg font-extrabold text-amber-600 light:text-amber-600 dark:text-[#F0B86E]">
                  {pendingAssignments.length}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 light:bg-amber-50 dark:bg-[#F0B86E]/15 border border-amber-200/60 dark:border-transparent flex items-center justify-center text-amber-600 light:text-amber-600 dark:text-[#F0B86E]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column (2 spans): Recent Resources & Peer Doubts */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Section: Recent Verified Academic Resources */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8B7CFF]" />
                <h2 className="text-base font-bold text-[#F3F4F8]">
                  Recent Curriculum Resources
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs font-semibold text-[#8B7CFF] hover:underline flex items-center gap-1"
              >
                <span>View Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentResources.map((res) => {
                const isBookmarked = bookmarks.includes(res.id);

                return (
                  <div
                    key={res.id}
                    onClick={() => openResourcePreview(res)}
                    className="group relative p-4 rounded-2xl bg-[#191F2E] hover:bg-[#222A3D] border border-white/[0.06] hover:border-[#8B7CFF]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF]">
                          {res.type.toUpperCase()}
                        </span>
                        
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {res.is_verified && (
                            <span className="inline-flex items-center text-[10px] font-semibold text-[#54D6C7] bg-[#54D6C7]/10 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </span>
                          )}
                          <button
                            onClick={() => toggleBookmark(res.id)}
                            className="p-1 rounded text-[#A4ADBE] hover:text-[#8B7CFF]"
                            title="Save Bookmark"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-[#8B7CFF]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-[#F3F4F8] group-hover:text-[#8B7CFF] transition-colors line-clamp-2">
                        {res.title}
                      </h3>
                      <p className="text-[11px] text-[#A4ADBE] line-clamp-2 mt-1">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#A4ADBE]">
                      <span className="truncate max-w-[140px]">
                        {res.subject_name} {res.unit ? `• Unit ${res.unit}` : ''}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 font-medium">
                        <Eye className="w-3 h-3 text-[#54D6C7]" />
                        {res.downloads_count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Recent Peer Doubts */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#54D6C7]" />
                <h2 className="text-base font-bold text-[#F3F4F8]">
                  Active Peer Discussions & Doubts
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('doubts')}
                className="text-xs font-semibold text-[#54D6C7] hover:underline flex items-center gap-1"
              >
                <span>Browse All Doubts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  onClick={() => setActiveTab('doubts')}
                  className="p-4 rounded-2xl bg-[#191F2E] hover:bg-[#222A3D] border border-white/[0.06] hover:border-[#54D6C7]/30 cursor-pointer transition-all flex items-start gap-3.5"
                >
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10131C] min-w-[48px] text-center border border-white/[0.04]">
                    <span className="text-xs font-bold text-[#F3F4F8]">{doubt.upvotes}</span>
                    <span className="text-[9px] text-[#A4ADBE] uppercase">Votes</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-[#8B7CFF] bg-[#8B7CFF]/15 px-2 py-0.5 rounded-full">
                        {doubt.subject_name}
                      </span>
                      {doubt.is_resolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#54D6C7] bg-[#54D6C7]/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F3F4F8] truncate">
                      {doubt.title}
                    </h3>
                    <p className="text-[11px] text-[#A4ADBE] line-clamp-1 mt-0.5">
                      {doubt.content}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-[#A4ADBE]">
                      <span>By {doubt.author_name}</span>
                      <span>•</span>
                      <span>{doubt.answers.length} {doubt.answers.length === 1 ? 'Answer' : 'Answers'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 span): Upcoming Deadlines & Announcements */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Upcoming Assignments Card */}
          <div className="p-5 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F0B86E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8]">
                  Upcoming Deadlines
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="text-[11px] font-semibold text-[#F0B86E] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="text-xs text-[#A4ADBE] text-center py-4">
                  No upcoming deadlines pending!
                </p>
              ) : (
                pendingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => setActiveTab('assignments')}
                    className="p-3 rounded-xl bg-[#10131C]/60 hover:bg-[#222A3D] cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-[#8B7CFF]">{asg.subject_name}</span>
                      <span className="text-[#F0B86E] font-medium">Due in 3 days</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#F3F4F8] line-clamp-1">
                      {asg.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#A4ADBE]">
                      <span>Max Marks: {asg.total_marks}</span>
                      <span className="text-[#54D6C7] font-semibold">Unit {asg.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Announcements Card */}
          <div className="p-5 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8]">
                  Official Notices
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-[11px] font-semibold text-[#8B7CFF] hover:underline"
              >
                Notices
              </button>
            </div>

            <div className="space-y-3">
              {latestAnnouncements.map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => setActiveTab('announcements')}
                  className="p-3 rounded-xl bg-[#10131C]/60 hover:bg-[#222A3D] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold uppercase px-1.5 py-0.5 rounded bg-[#8B7CFF]/20 text-[#8B7CFF]">
                      {ann.category}
                    </span>
                    {ann.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#F3F4F8] line-clamp-1">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-[#A4ADBE] line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Revision Mode High-Yield Promo Banner */}
          <div 
            onClick={() => setActiveTab('revision')}
            className="p-5 rounded-3xl bg-gradient-to-br from-[#8B7CFF]/15 via-[#54D6C7]/10 to-[#191F2E] border border-[#8B7CFF]/30 hover:border-[#8B7CFF]/60 cursor-pointer transition-all duration-200 group shadow-lg"
          >
            <div className="flex items-center gap-2 text-[#54D6C7] mb-1.5">
              <Sparkles className="w-4 h-4 animate-spin text-[#54D6C7]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Exam Sprint Ready
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[#F3F4F8] group-hover:text-[#8B7CFF] transition-colors">
              Last-Night Revision Mode
            </h3>
            <p className="text-[11px] text-[#A4ADBE] mt-1 leading-relaxed">
              Formulas, unit high-yield questions, theorem proofs, and an interactive checklist designed for rapid pre-exam recall.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#8B7CFF]">
              <span>Start Revision</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
