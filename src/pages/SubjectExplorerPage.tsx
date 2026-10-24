import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Bookmark, 
  Eye, 
  ArrowLeft, 
  PlusCircle,
  Award
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';
import { Branch, AcademicYear, Subject } from '../types';
import { AIT_BRANCHES, AIT_YEARS } from '../data/mockData';

interface SubjectExplorerPageProps {
  onOpenUploadModalWithSubject?: (subjectId: string) => void;
}

export const SubjectExplorerPage: React.FC<SubjectExplorerPageProps> = ({
  onOpenUploadModalWithSubject
}) => {
  const { user } = useAuth();
  const { 
    subjects, 
    resources, 
    openResourcePreview, 
    toggleBookmark, 
    bookmarks 
  } = useAcademic();

  const [selectedBranch, setSelectedBranch] = useState<Branch>(user?.branch || 'COMP');
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(user?.year || 'TE');
  const [selectedSemester, setSelectedSemester] = useState<number>(user?.semester || 5);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (user?.branch) setSelectedBranch(user.branch);
    if (user?.year) setSelectedYear(user.year);
    if (user?.semester) setSelectedSemester(user.semester);
  }, [user?.branch, user?.year, user?.semester]);

  // Deep-dive filters within a subject
  const [selectedUnit, setSelectedUnit] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter subjects by selected branch, year, semester
  const filteredSubjects = subjects.filter(
    (s) => s.branch === selectedBranch && s.year === selectedYear && s.semester === selectedSemester
  );

  // If a subject is selected, filter its resources
  const subjectResources = selectedSubject
    ? resources.filter((r) => {
        const matchSubj = r.subject_id === selectedSubject.id;
        const matchUnit = selectedUnit === 0 ? true : r.unit === selectedUnit;
        const matchType = selectedType === 'all' ? true : r.type === selectedType;
        return matchSubj && matchUnit && matchType;
      })
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Subject Deep-Dive View */}
      {selectedSubject ? (
        <div className="space-y-6">
          {/* Back button and subject header */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
            <button
              onClick={() => setSelectedSubject(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B7CFF] hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {selectedBranch} Curriculum</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#8B7CFF]/20 text-[#8B7CFF]">
                    {selectedSubject.code}
                  </span>
                  <span className="text-xs text-[#A4ADBE]">
                    {selectedSubject.branch} • Year {selectedSubject.year} • Semester {selectedSubject.semester}
                  </span>
                  <span className="text-xs text-[#54D6C7] font-semibold">
                    {selectedSubject.credits} Credits
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                  {selectedSubject.name}
                </h1>
                <p className="text-xs text-[#A4ADBE] max-w-3xl mt-1 leading-relaxed">
                  {selectedSubject.description}
                </p>
                {selectedSubject.facultyName && (
                  <p className="text-[11px] text-[#54D6C7] mt-2 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Faculty Coordinator: {selectedSubject.facultyName}
                  </p>
                )}
              </div>

              {onOpenUploadModalWithSubject && (
                <button
                  onClick={() => onOpenUploadModalWithSubject(selectedSubject.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shrink-0 shadow-lg shadow-[#8B7CFF]/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Resource</span>
                </button>
              )}
            </div>
          </div>

          {/* Unit & Type Filtering Bar */}
          <div className="p-4 rounded-2xl bg-[#191F2E] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Units Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-[#A4ADBE] font-semibold mr-1 shrink-0">
                Syllabus Unit:
              </span>
              {[0, 1, 2, 3, 4, 5, 6].map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    selectedUnit === u
                      ? 'bg-[#8B7CFF] text-[#10131C]'
                      : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
                  }`}
                >
                  {u === 0 ? 'All Units' : `Unit ${u}`}
                </button>
              ))}
            </div>

            {/* Resource Type Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs text-[#A4ADBE] font-semibold mr-1 shrink-0">
                Type:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'notes', label: 'Notes' },
                { id: 'pyq', label: 'PYQs' },
                { id: 'tutorial', label: 'Tutorials' },
                { id: 'lab_manual', label: 'Lab Manuals' },
                { id: 'imp_questions', label: 'High Yield' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    selectedType === t.id
                      ? 'bg-[#54D6C7] text-[#10131C]'
                      : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

          </div>

          {/* Subject Resources Grid */}
          {subjectResources.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-3">
              <FileText className="w-12 h-12 text-[#A4ADBE]/40 mx-auto" />
              <h3 className="text-sm font-bold text-[#F3F4F8]">
                No Resources Found for this Unit & Type
              </h3>
              <p className="text-xs text-[#A4ADBE] max-w-sm mx-auto">
                Be the first to contribute lecture notes, PYQs, or tutorials for {selectedSubject.name}.
              </p>
              {onOpenUploadModalWithSubject && (
                <button
                  onClick={() => onOpenUploadModalWithSubject(selectedSubject.id)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Resource</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectResources.map((res) => {
                const isBookmarked = bookmarks.includes(res.id);

                return (
                  <div
                    key={res.id}
                    onClick={() => openResourcePreview(res)}
                    className="p-5 rounded-2xl bg-[#191F2E] hover:bg-[#222A3D] border border-white/[0.06] hover:border-[#8B7CFF]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
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
                      <span>{res.unit ? `Unit ${res.unit}` : 'All Units'} • {res.file_size}</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3 text-[#54D6C7]" />
                        {res.downloads_count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Top Level Curriculum Explorer */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-2.5 mb-1.5">
              <FolderTree className="w-6 h-6 text-[#8B7CFF]" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Subject & Curriculum Explorer
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#A4ADBE] leading-relaxed">
              Explore AIT Pune curriculum by department, academic year, and active semester. Click on any subject to explore unit-wise lecture notes, question papers, and lab manuals.
            </p>

            {/* Department / Branch Filter Tabs */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AIT_BRANCHES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setSelectedBranch(b.code as Branch)}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    selectedBranch === b.code
                      ? 'bg-[#8B7CFF] text-[#10131C] font-bold shadow-lg shadow-[#8B7CFF]/20'
                      : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8] hover:bg-[#222A3D]'
                  }`}
                >
                  <span className="text-xs font-mono font-bold block">{b.code}</span>
                  <span className="text-[11px] leading-tight block mt-0.5 truncate">{b.name}</span>
                </button>
              ))}
            </div>

            {/* Year & Semester Filter Bar */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A4ADBE] font-semibold">Year:</span>
                {AIT_YEARS.map((y) => (
                  <button
                    key={y.code}
                    onClick={() => {
                      setSelectedYear(y.code as AcademicYear);
                      setSelectedSemester(y.semesters[0]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedYear === y.code
                        ? 'bg-[#54D6C7] text-[#10131C]'
                        : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
                    }`}
                  >
                    {y.code}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A4ADBE] font-semibold">Semester:</span>
                {(AIT_YEARS.find((y) => y.code === selectedYear)?.semesters || [1, 2]).map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedSemester === sem
                        ? 'bg-[#8B7CFF] text-[#10131C]'
                        : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F3F4F8]">
                {selectedBranch} • {selectedYear} (Semester {selectedSemester}) Subjects ({filteredSubjects.length})
              </h2>
              <span className="text-xs text-[#A4ADBE]">
                SPPU Scheme 2019 / 2024
              </span>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06]">
                <BookOpen className="w-10 h-10 text-[#A4ADBE]/40 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#F3F4F8]">
                  Curriculum syllabus being updated
                </h3>
                <p className="text-xs text-[#A4ADBE] mt-1">
                  Subjects for {selectedBranch} {selectedYear} Sem {selectedSemester} are currently being added. Check back shortly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subj) => {
                  const resCount = resources.filter((r) => r.subject_id === subj.id).length;

                  return (
                    <div
                      key={subj.id}
                      onClick={() => setSelectedSubject(subj)}
                      className="p-5 rounded-2xl bg-[#191F2E] hover:bg-[#222A3D] border border-white/[0.06] hover:border-[#8B7CFF]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF]">
                            {subj.code}
                          </span>
                          <span className="text-[11px] font-semibold text-[#54D6C7] bg-[#54D6C7]/10 px-2 py-0.5 rounded">
                            {subj.credits} Credits
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#F3F4F8] group-hover:text-[#8B7CFF] transition-colors">
                          {subj.name}
                        </h3>
                        <p className="text-xs text-[#A4ADBE] line-clamp-2 mt-1 leading-relaxed">
                          {subj.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#A4ADBE]">
                        <span className="font-medium text-[#F3F4F8]">
                          {resCount} {resCount === 1 ? 'Resource' : 'Resources'}
                        </span>
                        <span className="text-[#8B7CFF] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Explore Units →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
