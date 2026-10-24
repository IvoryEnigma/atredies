import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  X, 
  PlusCircle,
  Award
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';

export const AssignmentsPage: React.FC = () => {
  const { assignments, submitAssignment, createAssignment, subjects } = useAcademic();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('AIT_Assignment_Submission.pdf');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Faculty Create Assignment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubjectId, setCreateSubjectId] = useState(subjects[0]?.id || '');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createUnit, setCreateUnit] = useState<number>(1);
  const [createMarks, setCreateMarks] = useState<number>(25);
  const [createDueDate, setCreateDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [createSuccess, setCreateSuccess] = useState(false);

  const canCreate = user?.role === 'mentor' || user?.role === 'admin';

  const pendingList = assignments.filter((a) => a.status === 'pending');
  const submittedList = assignments.filter((a) => a.status === 'submitted');

  const handleConfirmSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId) return;

    submitAssignment(submittingAssignmentId, submissionFileName);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setSubmittingAssignmentId(null);
    }, 1200);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createSubjectId) return;

    createAssignment({
      subject_id: createSubjectId,
      title: createTitle.trim(),
      description: createDescription.trim() || 'Laboratory assignment for SPPU curriculum continuous evaluation.',
      due_date: new Date(createDueDate).toISOString(),
      total_marks: Number(createMarks) || 25,
      unit: Number(createUnit) || 1,
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateDescription('');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0B86E]/15 flex items-center justify-center text-[#F0B86E]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                Assignments & Deadlines
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Laboratory writeups, tutorial problems, and continuous evaluation deadlines
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            )}

            {/* Pending vs Submitted Tabs */}
            <div className="flex rounded-xl bg-[#10131C] p-1 border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-[#8B7CFF] text-[#10131C]'
                    : 'text-[#A4ADBE] hover:text-[#F3F4F8]'
                }`}
              >
                Pending ({pendingList.length})
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === 'submitted'
                    ? 'bg-[#54D6C7] text-[#10131C]'
                    : 'text-[#A4ADBE] hover:text-[#F3F4F8]'
                }`}
              >
                Submitted ({submittedList.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {(activeTab === 'pending' ? pendingList : submittedList).length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#191F2E] border border-white/[0.06] space-y-3">
            <CalendarCheck className="w-12 h-12 text-[#A4ADBE]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#F3F4F8]">
              {activeTab === 'pending' ? 'No pending assignments!' : 'No completed submissions yet.'}
            </h3>
            <p className="text-xs text-[#A4ADBE]">
              {activeTab === 'pending' 
                ? 'All laboratory journals and tutorial submissions are up to date.' 
                : 'Submissions will appear here once turned in.'}
            </p>
          </div>
        ) : (
          (activeTab === 'pending' ? pendingList : submittedList).map((asg) => (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF]">
                    {asg.subject_name} • Unit {asg.unit}
                  </span>
                  <span className="text-xs text-[#54D6C7] font-semibold bg-[#54D6C7]/10 px-2 py-0.5 rounded">
                    Max Marks: {asg.total_marks}
                  </span>
                  <span className="text-[11px] text-[#A4ADBE]">
                    Assigned by {asg.created_by_name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F3F4F8]">
                  {asg.title}
                </h3>
                <p className="text-xs text-[#A4ADBE] leading-relaxed">
                  {asg.description}
                </p>

                {asg.submission && (
                  <div className="mt-3 p-3 rounded-2xl bg-[#10131C] border border-[#54D6C7]/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#54D6C7] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Submitted on {new Date(asg.submission.submitted_at).toLocaleDateString()}
                      </span>
                      {asg.submission.grade && (
                        <span className="font-bold bg-[#54D6C7]/20 px-2 py-0.5 rounded">
                          Grade: {asg.submission.grade}
                        </span>
                      )}
                    </div>
                    {asg.submission.feedback && (
                      <p className="text-slate-300 text-[11px]">
                        <strong>Faculty Feedback:</strong> {asg.submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Side */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0B86E]">
                  <Clock className="w-4 h-4" />
                  <span>Due: {new Date(asg.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {asg.status === 'pending' ? (
                  <button
                    onClick={() => setSubmittingAssignmentId(asg.id)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-lg shadow-[#8B7CFF]/20"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Turn In Assignment</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#54D6C7] bg-[#54D6C7]/15 px-3 py-1.5 rounded-xl border border-[#54D6C7]/30">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Turn-In Modal */}
      {submittingAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-md bg-[#191F2E] rounded-3xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F3F4F8]">
                  Submit Academic Assignment
                </h3>
              </div>
              <button
                onClick={() => setSubmittingAssignmentId(null)}
                className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#54D6C7] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[#F3F4F8]">
                  Assignment Submitted on Record!
                </h4>
                <p className="text-xs text-[#A4ADBE]">
                  Logged with timestamp for AIT faculty grading.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmission} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Student / Cadet Author
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#10131C] text-slate-300 border border-white/[0.06]">
                    {user?.full_name} ({user?.branch} - {user?.prn_number || 'AIT2022COMP042'})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Attachment File Name
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionFileName}
                    onChange={(e) => setSubmissionFileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div className="p-4 rounded-xl border-2 border-dashed border-white/[0.1] bg-[#10131C]/60 text-center">
                  <FileText className="w-6 h-6 text-[#8B7CFF] mx-auto mb-1" />
                  <p className="text-[11px] text-[#F3F4F8] font-medium">
                    PDF / Code Zip Ready for Submission
                  </p>
                  <p className="text-[10px] text-[#A4ADBE] mt-0.5">
                    File integrity validated • Official evaluation format
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignmentId(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
                  >
                    Confirm Submission
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Faculty Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg bg-[#191F2E] rounded-3xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F3F4F8]">
                  Create New Course Assignment
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#54D6C7] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[#F3F4F8]">
                  Assignment Published!
                </h4>
                <p className="text-xs text-[#A4ADBE]">
                  Students can now view problem specifications and turn in submissions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={createSubjectId}
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.branch} Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Assignment 4: B+ Tree Indexing & Query Plans"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Syllabus Unit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={createUnit}
                      onChange={(e) => setCreateUnit(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={createMarks}
                      onChange={(e) => setCreateMarks(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createDueDate}
                      onChange={(e) => setCreateDueDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Problem Specification & Instructions
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify implementation language, submission guidelines, test cases, and marking rubrics..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
                  >
                    Publish Assignment
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
