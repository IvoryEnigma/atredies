import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RotateCcw, 
  TrendingUp, 
  Sparkles,
  Info
} from 'lucide-react';
import { SGPAEntry } from '../types';

const GRADE_POINTS: { [grade: string]: number } = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

const DEFAULT_SEMESTER_5_COMP: SGPAEntry[] = [
  { id: '1', subjectName: 'Database Management Systems (310241)', credits: 3, grade: 'O', gradePoint: 10 },
  { id: '2', subjectName: 'Theory of Computation (310242)', credits: 3, grade: 'A+', gradePoint: 9 },
  { id: '3', subjectName: 'Systems Programming & OS (310243)', credits: 4, grade: 'A+', gradePoint: 9 },
  { id: '4', subjectName: 'Computer Networks & Security (310244)', credits: 3, grade: 'A', gradePoint: 8 },
  { id: '5', subjectName: 'Software Engineering & PM (310245)', credits: 3, grade: 'A+', gradePoint: 9 },
  { id: '6', subjectName: 'DBMS Laboratory (310246)', credits: 1, grade: 'O', gradePoint: 10 },
  { id: '7', subjectName: 'SPOS Laboratory (310247)', credits: 1, grade: 'O', gradePoint: 10 },
  { id: '8', subjectName: 'Seminar & Technical Communication', credits: 2, grade: 'O', gradePoint: 10 },
];

export const SGPACalculatorPage: React.FC = () => {
  const [entries, setEntries] = useState<SGPAEntry[]>(DEFAULT_SEMESTER_5_COMP);
  const [previousCgpa, setPreviousCgpa] = useState<string>('8.85');
  const [previousCredits, setPreviousCredits] = useState<string>('80');

  const handleGradeChange = (id: string, grade: any) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, grade, gradePoint: GRADE_POINTS[grade] ?? 0 } : e
      )
    );
  };

  const handleCreditsChange = (id: string, credits: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, credits: Math.max(1, credits) } : e))
    );
  };

  const handleSubjectNameChange = (id: string, name: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, subjectName: name } : e))
    );
  };

  const addRow = () => {
    const newEntry: SGPAEntry = {
      id: 'sub-' + Date.now(),
      subjectName: 'Elective / Audit Course',
      credits: 3,
      grade: 'A',
      gradePoint: 8,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const removeRow = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const resetDefaults = () => {
    setEntries(DEFAULT_SEMESTER_5_COMP);
  };

  // Calculations
  const totalCredits = entries.reduce((acc, curr) => acc + curr.credits, 0);
  const totalEarnedPoints = entries.reduce(
    (acc, curr) => acc + curr.credits * curr.gradePoint,
    0
  );
  const sgpa = totalCredits > 0 ? (totalEarnedPoints / totalCredits).toFixed(2) : '0.00';

  // Projected CGPA calculation
  const prevCgpaNum = parseFloat(previousCgpa) || 0;
  const prevCreditsNum = parseFloat(previousCredits) || 0;
  const totalCumulativeCredits = prevCreditsNum + totalCredits;
  const projectedCgpa =
    totalCumulativeCredits > 0
      ? (
          (prevCgpaNum * prevCreditsNum + totalEarnedPoints) /
          totalCumulativeCredits
        ).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0B86E]/15 flex items-center justify-center text-[#F0B86E]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F8]">
                SPPU 10-Point SGPA & CGPA Calculator
              </h1>
              <p className="text-xs text-[#A4ADBE]">
                Official Savitribai Phule Pune University grading matrix with real-time credit weighting
              </p>
            </div>
          </div>

          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#10131C] text-[#A4ADBE] hover:text-white border border-white/[0.06] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semester Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator Table + Result Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Interactive Subject Grade Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold text-[#F3F4F8] flex items-center gap-2">
              <span>Semester Courses & Credit Allocations</span>
              <span className="text-xs text-[#54D6C7] font-semibold bg-[#54D6C7]/15 px-2 py-0.5 rounded-full">
                {totalCredits} Total Credits
              </span>
            </h2>

            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[#A4ADBE] text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-2">Subject / Course Name</th>
                  <th className="py-2.5 px-2 w-20">Credits</th>
                  <th className="py-2.5 px-2 w-28">Grade</th>
                  <th className="py-2.5 px-2 w-20 text-center">Points</th>
                  <th className="py-2.5 px-2 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.subjectName}
                        onChange={(e) => handleSubjectNameChange(item.id, e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.06] text-xs font-medium"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={item.credits}
                        onChange={(e) => handleCreditsChange(item.id, Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.06] text-xs text-center font-bold"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.grade}
                        onChange={(e) => handleGradeChange(item.id, e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#10131C] text-[#F3F4F8] border border-white/[0.06] text-xs font-bold"
                      >
                        <option value="O">O (10)</option>
                        <option value="A+">A+ (9)</option>
                        <option value="A">A (8)</option>
                        <option value="B+">B+ (7)</option>
                        <option value="B">B (6)</option>
                        <option value="C">C (5)</option>
                        <option value="P">P (4)</option>
                        <option value="F">F (0)</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#8B7CFF]">
                      {item.gradePoint * item.credits}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeRow(item.id)}
                        disabled={entries.length <= 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-[#A4ADBE]">
            <Info className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0" />
            <span>
              {'SPPU Formula: SGPA = ∑(Ci × GPi) / ∑Ci'} = {totalEarnedPoints} / {totalCredits} = <strong>{sgpa}</strong>
            </span>
          </div>
        </div>

        {/* Right Column (1 span): Result Metrics & CGPA Predictor */}
        <div className="space-y-6">
          
          {/* SGPA Score Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#191F2E] via-[#20273B] to-[#191F2E] border border-[#8B7CFF]/30 shadow-2xl text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4ADBE] block">
              Calculated Semester SGPA
            </span>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#54D6C7] to-[#F0B86E]">
              {sgpa}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#54D6C7]/15 text-[#54D6C7]">
              <Sparkles className="w-3.5 h-3.5" />
              {parseFloat(sgpa) >= 9.0 ? 'First Class with Distinction (Dist.)' : parseFloat(sgpa) >= 7.75 ? 'First Class (FC)' : 'Passing Status'}
            </div>
          </div>

          {/* CGPA Projection Calculator */}
          <div className="p-6 rounded-3xl bg-[#191F2E] border border-white/[0.08] shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F4F8] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#54D6C7]" />
              <span>Cumulative CGPA Predictor</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Previous Cumulative CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={previousCgpa}
                  onChange={(e) => setPreviousCgpa(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Total Completed Credits So Far
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={previousCredits}
                  onChange={(e) => setPreviousCredits(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#10131C] text-[#F3F4F8] border border-white/[0.08] font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#A4ADBE] block uppercase font-bold">
                    Projected New CGPA
                  </span>
                  <span className="text-2xl font-extrabold text-[#54D6C7]">
                    {projectedCgpa}
                  </span>
                </div>
                <div className="text-right text-[11px] text-[#A4ADBE]">
                  <span>Total Credits:</span>
                  <span className="font-bold text-white block">{totalCumulativeCredits}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
