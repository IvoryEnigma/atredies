import React, { useState } from 'react';
import { 
  Bookmark, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface BookmarksPageProps {
  setActiveTab: (tab: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ setActiveTab }) => {
  const { 
    bookmarks, 
    resources, 
    toggleBookmark, 
    openResourcePreview 
  } = useAcademic();

  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter bookmarked resources
  const bookmarkedResources = resources.filter((r) => bookmarks.includes(r.id));
  
  const filteredList = selectedType === 'all'
    ? bookmarkedResources
    : bookmarkedResources.filter((r) => r.type === selectedType);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF]">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Saved Academic Bookmarks
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Instant offline-ready access to your essential lecture notes, formula banks, and PYQs
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#10131C] text-[#54D6C7] border border-white/[0.06] self-start sm:self-auto">
            {bookmarkedResources.length} {bookmarkedResources.length === 1 ? 'Resource' : 'Resources'} Saved
          </span>
        </div>

        {/* Type Filter */}
        {bookmarkedResources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'notes', 'pyq', 'tutorial', 'lab_manual', 'imp_questions'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize shrink-0 transition-colors ${
                  selectedType === t
                    ? 'bg-[#8B7CFF] text-[#10131C]'
                    : 'bg-[#10131C] text-[#A4ADBE] hover:text-[#F3F4F8]'
                }`}
              >
                {t === 'all' ? 'All Saved' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarks Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-3">
          <Bookmark className="w-12 h-12 text-[#A4ADBE]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#F3F4F8]">
            {bookmarkedResources.length === 0 ? 'No bookmarks saved yet' : 'No items under this category'}
          </h3>
          <p className="text-xs text-[#A4ADBE] max-w-sm mx-auto">
            Click the bookmark icon on any lecture note or PYQ in the Resource Library to pin it here for rapid access.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Resource Library</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((res) => (
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
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[#F3F4F8] group-hover:text-[#8B7CFF] transition-colors line-clamp-2">
                  {res.title}
                </h3>
                <p className="text-[11px] text-[#A4ADBE] line-clamp-2 mt-1 leading-relaxed">
                  {res.description}
                </p>
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
                    title="Open Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
