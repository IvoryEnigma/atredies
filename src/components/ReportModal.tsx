import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export const ReportModal: React.FC = () => {
  const { reportModalResource, closeReportModal, submitReport } = useAcademic();
  const [reason, setReason] = useState('Incorrect or Outdated Syllabus Content');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reportModalResource) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(reportModalResource.id, `${reason}: ${details}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      closeReportModal();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-[#191F2E] dark:bg-[#191F2E] light:bg-white rounded-2xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
              Report Academic Resource
            </h3>
          </div>
          <button 
            onClick={closeReportModal}
            className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#54D6C7] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
              Report Submitted for Review
            </h4>
            <p className="text-xs text-[#A4ADBE]">
              The AIT academic moderation committee will review the report shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Resource Title
              </label>
              <div className="p-2.5 rounded-xl bg-[#10131C] text-slate-400 border border-white/[0.06] line-clamp-1">
                {reportModalResource.title}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
              >
                <option value="Incorrect or Outdated Syllabus Content">Incorrect or Outdated Syllabus Content</option>
                <option value="Duplicate Material Already Exists">Duplicate Material Already Exists</option>
                <option value="Poor Quality or Illegible Handwriting">Poor Quality or Illegible Handwriting</option>
                <option value="Copyright or Unauthorized Publication">Copyright or Unauthorized Publication</option>
                <option value="Incorrect Unit or Subject Categorization">Incorrect Unit or Subject Categorization</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Explain what is inaccurate or specify the duplicate resource ID..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeReportModal}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
