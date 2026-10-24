import React, { useState } from 'react';
import { 
  Megaphone, 
  Calendar, 
  AlertCircle, 
  Building, 
  Search,
  PlusCircle,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, addAnnouncement } = useAcademic();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Post Announcement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'academic' | 'exam' | 'placement' | 'club'>('academic');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');
  const [newDepartment, setNewDepartment] = useState(user?.branch ? `${user.branch} Dept` : 'Academic Cell');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const canPost = user?.role === 'mentor' || user?.role === 'admin';

  const CATEGORIES = [
    { id: 'all', label: 'All Notices' },
    { id: 'exam', label: 'Examination Cell' },
    { id: 'academic', label: 'Academic & Curriculum' },
    { id: 'placement', label: 'Training & Placement' },
    { id: 'club', label: 'Clubs & Hackathons' },
  ];

  const filteredAnnouncements = announcements.filter((ann) => {
    if (selectedCategory !== 'all' && ann.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ann.title.toLowerCase().includes(q) ||
        ann.content.toLowerCase().includes(q) ||
        (ann.department || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      department: newDepartment.trim() || 'AIT Academic Office',
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewPriority('normal');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Official Notices & Announcements
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Verified circulars from Army Institute of Technology administrative offices and department cells
              </p>
            </div>
          </div>

          {canPost && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-lg shadow-[#8B7CFF]/20 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Circular</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
          <input
            type="text"
            placeholder="Search circulars, examination dates, placement notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] text-xs sm:text-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#8B7CFF] text-[#10131C]'
                  : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-2">
            <Megaphone className="w-10 h-10 text-[#A4ADBE]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[#F3F4F8]">
              No circulars found
            </h3>
            <p className="text-xs text-[#A4ADBE]">
              Try resetting your search query or selecting another category.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl border transition-all shadow-lg space-y-3 ${
                ann.priority === 'urgent'
                  ? 'bg-red-500/[0.04] border-red-500/30'
                  : 'bg-[#191F2E] border-white/[0.06]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF]">
                    {ann.category}
                  </span>
                  {ann.priority === 'urgent' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                      <AlertCircle className="w-3 h-3" /> Priority Notice
                    </span>
                  )}
                  {ann.department && (
                    <span className="text-xs text-[#54D6C7] font-semibold flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {ann.department}
                    </span>
                  )}
                </div>

                <span className="text-xs text-[#A4ADBE] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  {new Date(ann.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[#F3F4F8]">
                {ann.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#A4ADBE]">
                <span>Issued by: {ann.posted_by}</span>
                <span className="text-[#54D6C7] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Institutional Dispatch
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Circular Modal (Mentors / Admins only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg bg-[#191F2E] rounded-3xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F3F4F8]">
                  Publish Official Notice / Circular
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#54D6C7] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[#F3F4F8]">
                  Circular Published Successfully!
                </h4>
                <p className="text-xs text-[#A4ADBE]">
                  Notice is now visible to all AIT students and faculty.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for In-Sem Exam October 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                    >
                      <option value="academic">Academic & Curriculum</option>
                      <option value="exam">Examination Cell</option>
                      <option value="placement">Training & Placement</option>
                      <option value="club">Clubs & Hackathons</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Priority Level
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                    >
                      <option value="normal">Standard Notice</option>
                      <option value="urgent">Urgent / Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Department / Cell
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dept of Computer Engineering or Exam Section"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notice Description / Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full circular instructions, reporting times, hall tickets, or contact persons..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
                  >
                    Dispatch Notice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
