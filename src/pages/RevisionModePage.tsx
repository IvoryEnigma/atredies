import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Eye, 
  EyeOff, 
  Zap,
  Award 
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export const RevisionModePage: React.FC = () => {
  const { revisionCards, toggleRevisionCompleted, subjects } = useAcademic();
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<{ [cardId: string]: boolean }>({});

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCards = selectedSubjectId === 'all'
    ? revisionCards
    : revisionCards.filter((c) => c.subject_id === selectedSubjectId);

  const completedCount = revisionCards.filter((c) => c.is_completed).length;
  const progressPercent = Math.round((completedCount / revisionCards.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Revision Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#191F2E] via-[#20273B] to-[#191F2E] p-6 sm:p-8 border border-[#8B7CFF]/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7CFF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#54D6C7]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#54D6C7]/20 text-[#54D6C7] text-xs font-bold uppercase tracking-wider border border-[#54D6C7]/30">
                <Zap className="w-3.5 h-3.5" /> High-Yield Sprint
              </span>
              <span className="text-xs text-[#A4ADBE]">
                SPPU In-Sem & End-Sem Prep
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8] tracking-tight">
              Last-Night Revision Mode
            </h1>
            <p className="text-xs sm:text-sm text-[#A4ADBE] leading-relaxed">
              Distilled high-yield notes, formula cheat sheets, repeated university examination questions, and interactive recall flashcards for fast cramming.
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="p-4 rounded-2xl bg-[#10131C]/80 backdrop-blur-md border border-white/[0.08] min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#A4ADBE]">Revision Progress</span>
              <span className="font-mono font-bold text-[#54D6C7]">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-white/[0.1] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8B7CFF] to-[#54D6C7] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#A4ADBE]">
              <span>{completedCount} of {revisionCards.length} Cards Mastered</span>
              {progressPercent === 100 && (
                <span className="text-[#54D6C7] font-bold">Exam Ready!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Subject */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#A4ADBE] font-semibold shrink-0">Subject:</span>
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors ${
            selectedSubjectId === 'all'
              ? 'bg-[#8B7CFF] text-[#10131C]'
              : 'bg-[#191F2E] text-[#A4ADBE] hover:text-[#F3F4F8]'
          }`}
        >
          All Subjects
        </button>
        {subjects.slice(0, 4).map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubjectId(s.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors ${
              selectedSubjectId === s.id
                ? 'bg-[#8B7CFF] text-[#10131C]'
                : 'bg-[#191F2E] text-[#A4ADBE] hover:text-[#F3F4F8]'
            }`}
          >
            {s.code} - {s.name}
          </button>
        ))}
      </div>

      {/* High-Yield Revision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCards.map((card) => {
          const isRevealed = revealedAnswers[card.id];

          return (
            <div
              key={card.id}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xl ${
                card.is_completed
                  ? 'bg-[#191F2E]/80 border-[#54D6C7]/30'
                  : 'bg-[#191F2E] border-white/[0.08]'
              }`}
            >
              <div>
                {/* Header & Checkbox */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF]">
                        {card.subject_name} • Unit {card.unit}
                      </span>
                      <span className="text-[10px] font-semibold text-[#F0B86E] bg-[#F0B86E]/10 px-1.5 py-0.5 rounded">
                        High Yield
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F3F4F8]">
                      {card.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleRevisionCompleted(card.id)}
                    className="p-1 rounded-lg text-[#A4ADBE] hover:text-[#54D6C7] transition-colors"
                    title={card.is_completed ? 'Mark Incomplete' : 'Mark Mastered'}
                  >
                    {card.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#54D6C7] fill-[#54D6C7]/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-white" />
                    )}
                  </button>
                </div>

                {/* Key Bullet Points */}
                <div className="space-y-2 mb-4 bg-[#10131C]/60 p-4 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4ADBE] block mb-1">
                    Core Formulas & Tenets:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {card.key_points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#54D6C7] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* University Exam Question */}
                <div className="p-4 rounded-2xl bg-[#10131C] border border-[#8B7CFF]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#8B7CFF] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> High-Probability SPPU Question
                    </span>
                    <button
                      onClick={() => toggleReveal(card.id)}
                      className="text-[11px] text-[#54D6C7] hover:underline flex items-center gap-1 font-bold"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide Proof' : 'Reveal Solution'}</span>
                    </button>
                  </div>

                  <p className="text-xs font-medium text-[#F3F4F8] leading-relaxed">
                    {card.high_yield_question}
                  </p>

                  {isRevealed && (
                    <div className="pt-3 border-t border-white/[0.08] text-xs text-[#54D6C7] leading-relaxed animate-in fade-in duration-150">
                      <strong>Worked Derivation & Answer:</strong>
                      <p className="mt-1 text-slate-200">{card.high_yield_answer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between text-[11px] text-[#A4ADBE] pt-2">
                <span>{card.is_completed ? 'Status: Checklist Marked ✓' : 'Status: Unrevised'}</span>
                <span className="text-[#8B7CFF] font-semibold">SPPU 2019/2024 Verified</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
