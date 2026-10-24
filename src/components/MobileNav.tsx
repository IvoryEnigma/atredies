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
  X,
  GraduationCap
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab 
}) => {
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Subject Explorer', icon: FolderTree },
    { id: 'library', label: 'Resource Library', icon: Library },
    { id: 'doubts', label: 'Peer Doubt Forum', icon: MessageSquare },
    { id: 'revision', label: 'Revision Mode', icon: Sparkles, highlight: true },
    { id: 'sgpa', label: 'SGPA Calculator', icon: Calculator },
    { id: 'assignments', label: 'Deadlines & Tasks', icon: CalendarCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
    { id: 'profile', label: 'Profile & Settings', icon: UserCircle },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Persistent) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#10131C]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'dashboard' ? 'text-[#8B7CFF] font-bold' : 'text-[#A4ADBE]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'explorer' ? 'text-[#8B7CFF] font-bold' : 'text-[#A4ADBE]'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'revision' ? 'text-[#54D6C7] font-bold' : 'text-[#A4ADBE]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#54D6C7]" />
          <span>Revision</span>
        </button>

        <button
          onClick={() => setActiveTab('doubts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'doubts' ? 'text-[#8B7CFF] font-bold' : 'text-[#A4ADBE]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Doubts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'profile' ? 'text-[#8B7CFF] font-bold' : 'text-[#A4ADBE]'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Slide-over Drawer for All Navigation Items */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#10131C] p-5 shadow-2xl flex flex-col justify-between border-r border-white/[0.08] animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#54D6C7] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-[#10131C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F3F4F8]">AIT Academia</h3>
                    <p className="text-[10px] text-[#A4ADBE]">Army Institute of Tech</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#A4ADBE] hover:text-white hover:bg-[#191F2E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#8B7CFF] text-[#10131C] font-semibold'
                          : 'text-[#A4ADBE] hover:text-[#F3F4F8] hover:bg-[#191F2E]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#10131C]' : 'text-[#8B7CFF]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] text-[10px] text-[#A4ADBE]/60 text-center">
              AIT Pune Academia Portal • Offline & Cloud Ready
            </div>
          </div>
        </div>
      )}
    </>
  );
};
