import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ThumbsUp, 
  CheckCircle2, 
  PlusCircle, 
  Send, 
  X,
  Code
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';

export const PeerDoubtForumPage: React.FC = () => {
  const { 
    doubts, 
    subjects, 
    askDoubt, 
    addAnswer, 
    upvoteDoubt, 
    upvoteAnswer, 
    acceptAnswer 
  } = useAcademic();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(doubts[0]?.id || null);

  // Ask Doubt Modal State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [askSubjectId, setAskSubjectId] = useState(subjects[0]?.id || '');
  const [askUnit, setAskUnit] = useState<number>(1);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [askTags, setAskTags] = useState('');

  // New Answer Input State
  const [answerContent, setAnswerContent] = useState<{ [doubtId: string]: string }>({});

  const handleAskDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askTitle.trim() || !askContent.trim() || !askSubjectId) return;

    const tagsArray = askTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    askDoubt({
      subject_id: askSubjectId,
      unit: askUnit,
      title: askTitle.trim(),
      content: askContent.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['SPPU-Exam'],
    });

    setIsAskModalOpen(false);
    setAskTitle('');
    setAskContent('');
    setAskTags('');
  };

  const handleAddAnswer = (doubtId: string) => {
    const text = (answerContent[doubtId] || '').trim();
    if (!text) return;

    addAnswer(doubtId, text);
    setAnswerContent((prev) => ({ ...prev, [doubtId]: '' }));
  };

  // Filtered Doubts
  const filteredDoubts = doubts.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchContent = d.content.toLowerCase().includes(q);
      const matchSubj = d.subject_name.toLowerCase().includes(q);
      const matchTags = d.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchSubj && !matchTags) return false;
    }

    if (selectedSubjectId !== 'all' && d.subject_id !== selectedSubjectId) return false;

    if (filterStatus === 'resolved' && !d.is_resolved) return false;
    if (filterStatus === 'unresolved' && d.is_resolved) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Forum Header & Action Bar */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#54D6C7]/15 flex items-center justify-center text-[#54D6C7]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Subject-Wise Peer Doubt Forum
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Persistent academic solutions & faculty mentorship. Never lose doubt answers in chat threads.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-lg shadow-[#8B7CFF]/20 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask a Doubt</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
          <input
            type="text"
            placeholder="Search questions, derivation steps, algorithms, exam numericals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF] text-xs sm:text-sm"
          />
        </div>

        {/* Filter Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#A4ADBE]" />
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="p-1.5 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] text-xs"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-[#10131C] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'all' ? 'bg-[#8B7CFF] text-[#10131C]' : 'text-[#A4ADBE]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('unresolved')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'unresolved' ? 'bg-[#8B7CFF] text-[#10131C]' : 'text-[#A4ADBE]'
                }`}
              >
                Needs Answer
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'resolved' ? 'bg-[#54D6C7] text-[#10131C]' : 'text-[#A4ADBE]'
                }`}
              >
                Solved
              </button>
            </div>
          </div>

          <span className="text-xs text-[#A4ADBE]">
            {filteredDoubts.length} {filteredDoubts.length === 1 ? 'discussion' : 'discussions'}
          </span>
        </div>
      </div>

      {/* Doubts List & Expanded Detail View */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-3">
            <MessageSquare className="w-12 h-12 text-[#A4ADBE]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#F3F4F8]">
              No doubts found matching criteria
            </h3>
            <p className="text-xs text-[#A4ADBE] max-w-sm mx-auto">
              Have a question on theory or SPPU exam numericals? Post it now and let fellow cadets and faculty assist.
            </p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask this Doubt</span>
            </button>
          </div>
        ) : (
          filteredDoubts.map((doubt) => {
            const isExpanded = expandedDoubtId === doubt.id;
            const canManageAccepted = 
              user?.id === doubt.author_id || 
              user?.role === 'mentor' || 
              user?.role === 'admin';

            return (
              <div
                key={doubt.id}
                className="rounded-3xl bg-[#191F2E] border border-white/[0.06] hover:border-white/[0.12] transition-all overflow-hidden shadow-lg"
              >
                {/* Doubt Card Header */}
                <div 
                  onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start gap-4"
                >
                  {/* Upvote Pill */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      upvoteDoubt(doubt.id);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[52px] border transition-all cursor-pointer ${
                      doubt.user_has_upvoted
                        ? 'bg-[#8B7CFF] text-[#10131C] border-[#8B7CFF]'
                        : 'bg-[#10131C] text-[#F3F4F8] border-white/[0.06] hover:border-[#8B7CFF]/50'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-extrabold mt-0.5">{doubt.upvotes}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF]">
                        {doubt.subject_name} {doubt.unit ? `• Unit ${doubt.unit}` : ''}
                      </span>
                      {doubt.is_resolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#54D6C7] bg-[#54D6C7]/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                      <span className="text-[11px] text-[#A4ADBE]">
                        {new Date(doubt.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-[#F3F4F8] hover:text-[#8B7CFF] transition-colors leading-snug">
                      {doubt.title}
                    </h2>

                    <p className={`text-xs text-[#A4ADBE] mt-1.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {doubt.content}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {doubt.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#10131C] text-[#A4ADBE] border border-white/[0.04]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#A4ADBE]">
                        <span className="text-[#54D6C7] font-semibold">
                          {doubt.answers.length} {doubt.answers.length === 1 ? 'Answer' : 'Answers'}
                        </span>
                        <span>•</span>
                        <span>Asked by {doubt.author_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Answers Section */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] bg-[#10131C]/40 p-5 sm:p-6 space-y-5 animate-in slide-in-from-top-2 duration-150">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8] flex items-center gap-2">
                      <span>Peer & Faculty Answers ({doubt.answers.length})</span>
                    </h3>

                    {doubt.answers.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-[#191F2E] border border-white/[0.04] text-center text-xs text-[#A4ADBE]">
                        No answers posted yet. Help your fellow cadet by contributing the first solution below!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {doubt.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              ans.is_accepted
                                ? 'bg-[#54D6C7]/5 border-[#54D6C7]/30 shadow-md shadow-[#54D6C7]/5'
                                : 'bg-[#191F2E] border-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.04]">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] flex items-center justify-center text-[10px] font-bold">
                                  {ans.author_name.charAt(0)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-[#F3F4F8]">
                                    {ans.author_name}
                                  </span>
                                  {ans.author_role === 'mentor' && (
                                    <span className="ml-2 text-[10px] font-semibold text-[#54D6C7] bg-[#54D6C7]/15 px-1.5 py-0.5 rounded">
                                      Faculty Mentor
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {ans.is_accepted ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#54D6C7] bg-[#54D6C7]/20 px-2.5 py-0.5 rounded-full border border-[#54D6C7]/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                                  </span>
                                ) : (
                                  canManageAccepted && (
                                    <button
                                      onClick={() => acceptAnswer(doubt.id, ans.id)}
                                      className="text-[11px] text-[#A4ADBE] hover:text-[#54D6C7] flex items-center gap-1 transition-colors"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Mark Accepted</span>
                                    </button>
                                  )
                                )}

                                {/* Upvote answer */}
                                <button
                                  onClick={() => upvoteAnswer(doubt.id, ans.id)}
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
                                    ans.user_has_upvoted
                                      ? 'bg-[#8B7CFF] text-[#10131C] border-[#8B7CFF]'
                                      : 'bg-[#10131C] text-[#A4ADBE] border-white/[0.06] hover:text-white'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{ans.upvotes}</span>
                                </button>
                              </div>
                            </div>

                            {/* Answer Text */}
                            <div className="text-xs sm:text-sm text-[#F3F4F8] leading-relaxed whitespace-pre-line font-sans">
                              {ans.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post an Answer Form */}
                    <div className="p-4 rounded-2xl bg-[#191F2E] border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#F3F4F8]">
                        <span>Contribute a Solution / Clarification</span>
                        <span className="text-[10px] text-[#A4ADBE] flex items-center gap-1">
                          <Code className="w-3 h-3 text-[#8B7CFF]" /> Markdown & Formulas Supported
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Write clear explanation, step-by-step proof, or reference unit lecture notes..."
                        value={answerContent[doubt.id] || ''}
                        onChange={(e) =>
                          setAnswerContent((prev) => ({ ...prev, [doubt.id]: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/40 border border-white/[0.08] focus:border-[#8B7CFF] text-xs"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAddAnswer(doubt.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post Answer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Doubt Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg bg-[#191F2E] rounded-3xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F3F4F8]">
                  Post Academic Doubt
                </h3>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskDoubtSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Subject
                  </label>
                  <select
                    value={askSubjectId}
                    onChange={(e) => setAskSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Unit (1 - 6)
                  </label>
                  <select
                    value={askUnit}
                    onChange={(e) => setAskUnit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  >
                    <option value={1}>Unit 1</option>
                    <option value={2}>Unit 2</option>
                    <option value={3}>Unit 3</option>
                    <option value={4}>Unit 4</option>
                    <option value={5}>Unit 5</option>
                    <option value={6}>Unit 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Doubt Question Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to verify lossless join in BCNF decomposition?"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Explanation / Error / Numerical
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context, formulas, functional dependencies, or exact university question paper year..."
                  value={askContent}
                  onChange={(e) => setAskContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="DBMS, BCNF, Lossless, SPPU-2024"
                  value={askTags}
                  onChange={(e) => setAskTags(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
                >
                  Publish Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
