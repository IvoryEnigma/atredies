import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, Paperclip } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';
import { ResourceType } from '../types';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({ 
  isOpen, 
  onClose,
  defaultSubjectId 
}) => {
  const { subjects, addResource } = useAcademic();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [unit, setUnit] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('notes');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFileType(file.type || 'application/octet-stream');
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMb} MB`);
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);

      // If text/markdown/code file, read content directly
      if (file.type.startsWith('text/') || /\.(txt|md|csv|json|py|cpp|c|java|js|ts|html|css|sql)$/i.test(file.name)) {
        try {
          const text = await file.text();
          setFileContent(text);
        } catch (err) {
          console.warn('Could not read text content:', err);
        }
      } else {
        setFileContent('');
      }

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const subj = subjects.find((s) => s.id === subjectId);

    addResource({
      subject_id: subjectId,
      subject_name: subj?.name,
      subject_code: subj?.code,
      unit: unit === 0 ? undefined : unit,
      title: title.trim(),
      description: description.trim() || `Uploaded academic resource for ${subj?.name || 'peer study'}.`,
      type,
      file_url: fileUrl,
      file_size: fileSize,
      file_name: selectedFileName || undefined,
      file_type: fileType || undefined,
      file_content: fileContent || undefined,
      uploaded_by: user?.id || 'usr-cadet-01',
      contributor_name: user?.full_name || 'Cadet Contributor',
      is_verified: user?.role === 'mentor' || user?.role === 'admin',
      tags: [type.toUpperCase(), ...(unit !== 0 ? [`Unit ${unit}`] : ['All Units'])],
    }, selectedFile || undefined);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setTitle('');
      setDescription('');
      setSelectedFileName('');
      setSelectedFile(null);
      setFileType('');
      setFileContent('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-[#191F2E] dark:bg-[#191F2E] light:bg-white rounded-2xl border border-white/[0.08] shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#8B7CFF]" />
            <h3 className="text-sm font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
              Contribute Academic Resource
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#A4ADBE] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#54D6C7] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900">
              Resource Successfully Uploaded!
            </h4>
            <p className="text-xs text-[#A4ADBE]">
              {user?.role === 'student' 
                ? 'Your resource is uploaded and marked pending faculty verification.' 
                : 'Faculty upload verified automatically.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.branch} Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resource Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ResourceType)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                >
                  <option value="notes">Lecture Notes</option>
                  <option value="pyq">Previous Year Question (PYQ)</option>
                  <option value="tutorial">Tutorial / Solved Problems</option>
                  <option value="lab_manual">Lab Manual / Experiment</option>
                  <option value="imp_questions">Important Questions / Formula Sheet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Syllabus Unit (1 - 6)
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] focus:border-[#8B7CFF]"
                >
                  <option value={0}>All Units / Comprehensive</option>
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
                Resource Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3 CFG to CNF Conversion Tutorial Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Description & Topics Covered
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of handwritten formulas, solved university questions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] placeholder-[#A4ADBE]/50 border border-white/[0.08] focus:border-[#8B7CFF]"
              />
            </div>

            {/* Document File Picker */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-white/[0.1] bg-[#10131C]/60 hover:bg-[#10131C] cursor-pointer transition-colors text-center group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                className="hidden" 
              />
              <UploadCloud className="w-6 h-6 text-[#8B7CFF] group-hover:scale-110 transition-transform mx-auto mb-1" />
              <p className="text-[11px] text-[#F3F4F8] font-medium">
                {selectedFileName ? (
                  <span className="text-[#54D6C7] flex items-center justify-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> {selectedFileName}
                  </span>
                ) : (
                  'Click to Attach Document (PDF, DOCX, ZIP)'
                )}
              </p>
              <p className="text-[10px] text-[#A4ADBE] mt-0.5">
                {selectedFileName ? `Selected size: ${fileSize}` : 'Up to 25MB • SPPU 2019/2024 syllabus materials'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-semibold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
              >
                Publish Resource
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
