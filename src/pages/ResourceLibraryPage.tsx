import React, { useState } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  CheckCircle2, 
  Bookmark, 
  Eye, 
  Download, 
  PlusCircle, 
  SlidersHorizontal 
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface ResourceLibraryPageProps {
  onOpenUploadModal: () => void;
  initialQuery?: string;
}

export const ResourceLibraryPage: React.FC<ResourceLibraryPageProps> = ({ 
  onOpenUploadModal,
  initialQuery = '' 
}) => {
  const { 
    resources, 
    subjects, 
    openResourcePreview, 
    toggleBookmark, 
    bookmarks 
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'downloads' | 'newest' | 'title'>('downloads');

  // Filter logic
  const filteredResources = resources.filter((res) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchDesc = res.description.toLowerCase().includes(q);
      const matchSubj = (res.subject_name || '').toLowerCase().includes(q);
      const matchTags = res.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSubj && !matchTags) return false;
    }

    // Type filter
    if (selectedType !== 'all' && res.type !== selectedType) return false;

    // Subject filter
    if (selectedSubjectId !== 'all' && res.subject_id !== selectedSubjectId) return false;

    // Unit filter
    if (selectedUnit !== 0 && res.unit !== selectedUnit) return false;

    // Verified only filter
    if (verifiedOnly && !res.is_verified) return false;

    return true;
  });

  // Sorting logic
  filteredResources.sort((a, b) => {
    if (sortBy === 'downloads') {
      return b.downloads_count - a.downloads_count;
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const RESOURCE_TYPE_FILTERS = [
    { id: 'all', label: 'All Resources' },
    { id: 'notes', label: 'Lecture Notes' },
    { id: 'pyq', label: 'PYQs (Exam Papers)' },
    { id: 'tutorial', label: 'Tutorials' },
    { id: 'lab_manual', label: 'Lab Manuals' },
    { id: 'imp_questions', label: 'High Yield & Formulae' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header and Controls */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF]">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Searchable Resource Library
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Unified archive of verified notes, SPPU question papers, and lab manuals
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-lg shadow-[#8B7CFF]/20 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4ADBE]" />
          <input
            type="text"
            placeholder="Search by topic, theorem, keyword, question year (e.g. BCNF, Pumping Lemma, In-Sem 2024)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF] focus:ring-1 focus:ring-[#8B7CFF] transition-all text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A4ADBE] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {RESOURCE_TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedType === t.id
                  ? 'bg-[#8B7CFF] text-[#10131C]'
                  : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Extended Filter Dropdowns */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Selector */}
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

            {/* Unit Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(Number(e.target.value))}
                className="p-1.5 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] text-xs"
              >
                <option value={0}>All Units</option>
                <option value={1}>Unit 1</option>
                <option value={2}>Unit 2</option>
                <option value={3}>Unit 3</option>
                <option value={4}>Unit 4</option>
                <option value={5}>Unit 5</option>
                <option value={6}>Unit 6</option>
              </select>
            </div>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[#A4ADBE] hover:text-[#F3F4F8]">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#10131C] border-white/[0.2] text-[#8B7CFF] focus:ring-0"
              />
              <span className="text-[11px] font-medium">Faculty Verified Only</span>
            </label>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A4ADBE]" />
            <span className="text-[#A4ADBE]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] text-xs"
            >
              <option value="downloads">Most Popular</option>
              <option value="newest">Recently Uploaded</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#A4ADBE]">
        <span>Showing {filteredResources.length} {filteredResources.length === 1 ? 'result' : 'results'}</span>
        {searchQuery && (
          <span>Filtering by "{searchQuery}"</span>
        )}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-3">
          <Library className="w-12 h-12 text-[#A4ADBE]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#F3F4F8]">
            No matching resources found
          </h3>
          <p className="text-xs text-[#A4ADBE] max-w-sm mx-auto">
            Try adjusting your search terms or filters, or contribute this resource to the AIT repository.
          </p>
          <button
            onClick={onOpenUploadModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload this Resource</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const isBookmarked = bookmarks.includes(res.id);

            return (
              <div
                key={res.id}
                onClick={() => openResourcePreview(res)}
                className="p-5 rounded-2xl bg-[#191F2E] hover:bg-[#222A3D] border border-white/[0.06] hover:border-[#8B7CFF]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
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
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-[#8B7CFF]' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#F3F4F8] group-hover:text-[#8B7CFF] transition-colors line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-[11px] text-[#A4ADBE] line-clamp-2 mt-1 leading-relaxed">
                    {res.description}
                  </p>

                  {res.year_held && (
                    <div className="mt-2 text-[10px] font-semibold text-[#F0B86E]">
                      Exam Period: {res.year_held}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#A4ADBE]">
                  <div className="truncate max-w-[150px]">
                    <span className="font-medium text-slate-300 block truncate">{res.subject_name}</span>
                    <span className="text-[10px] text-[#A4ADBE]/70">{res.unit ? `Unit ${res.unit}` : 'Comprehensive'} • {res.file_size}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Eye className="w-3.5 h-3.5 text-[#54D6C7]" />
                      {res.downloads_count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openResourcePreview(res);
                      }}
                      className="p-1.5 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF] hover:bg-[#8B7CFF] hover:text-[#10131C] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
