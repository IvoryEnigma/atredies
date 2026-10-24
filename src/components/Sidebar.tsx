import React from 'react';
import { 
  LayoutDashboard, 
  FolderTree, 
  Library, 
  MessageSquare, 
  Sparkles, 
  Calculator, 
  CalendarCheck, 
  Megaphone, 
  Bookmark, 
  UserCircle,
  HelpCircle
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { bookmarks, assignments, doubts } = useAcademic();

  const pendingAssignmentsCount = assignments.filter((a) => a.status === 'pending').length;
  const unresolvedDoubtsCount = doubts.filter((d) => !d.is_resolved).length;

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'explorer',
      label: 'Subject Explorer',
      icon: FolderTree,
      badge: 'Curriculum',
    },
    {
      id: 'library',
      label: 'Resource Library',
      icon: Library,
      badge: null,
    },
    {
      id: 'doubts',
      label: 'Peer Doubt Forum',
      icon: MessageSquare,
      badge: unresolvedDoubtsCount > 0 ? `${unresolvedDoubtsCount}` : null,
    },
    {
      id: 'revision',
      label: 'Revision Mode',
      icon: Sparkles,
      badge: 'High Yield',
      highlight: true,
    },
    {
      id: 'sgpa',
      label: 'SGPA Calculator',
      icon: Calculator,
      badge: 'SPPU',
    },
    {
      id: 'assignments',
      label: 'Deadlines & Tasks',
      icon: CalendarCheck,
      badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount}` : null,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: null,
    },
    {
      id: 'bookmarks',
      label: 'Saved Bookmarks',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? `${bookmarks.length}` : null,
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: UserCircle,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full overflow-y-auto p-4 border-r border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 bg-[#10131C] dark:bg-[#10131C] light:bg-slate-50 select-none">
      
      {/* Navigation Group */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-[#A4ADBE]/70">
          Academic Portal
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#8B7CFF] text-[#10131C] font-semibold shadow-lg shadow-[#8B7CFF]/20 translate-x-0.5'
                  : item.highlight
                  ? 'text-[#54D6C7] hover:bg-[#54D6C7]/10 border border-[#54D6C7]/20'
                  : 'text-[#A4ADBE] hover:text-[#F3F4F8] hover:bg-[#191F2E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#10131C]' : item.highlight ? 'text-[#54D6C7]' : 'text-[#8B7CFF]'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-[#10131C]/30 text-[#10131C]'
                    : item.highlight
                    ? 'bg-[#54D6C7]/20 text-[#54D6C7]'
                    : 'bg-[#191F2E] text-[#A4ADBE] border border-white/[0.06]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Institutional Disclaimer Card */}
      <div className="mt-auto pt-4">
        <div className="p-3 rounded-2xl bg-[#191F2E] dark:bg-[#191F2E] light:bg-white border border-white/[0.06] text-[11px] text-[#A4ADBE] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
            <HelpCircle className="w-3.5 h-3.5 text-[#54D6C7]" />
            <span>Academic Guidelines</span>
          </div>
          <p className="leading-relaxed text-[10px]">
            Curated SPPU 2019/2024 syllabus resources. Official syllabus mapping for Army Institute of Technology, Pune.
          </p>
          <div className="pt-1 flex items-center justify-between text-[9px] text-[#A4ADBE]/60 font-mono">
            <span>AIT Pune v2.4</span>
            <span className="text-[#54D6C7]">Verified Portal</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
