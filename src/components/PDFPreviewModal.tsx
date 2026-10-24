import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Bookmark, 
  AlertTriangle, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Maximize2, 
  Calendar, 
  Share2, 
  Eye, 
  ExternalLink,
  Copy,
  FileCode,
  Image as ImageIcon,
  FileArchive,
  File
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { getResourceFile } from '../utils/fileStorage';
import { AcademicResource } from '../types';

export const PDFPreviewModal: React.FC = () => {
  const { 
    selectedResourceForPreview: resource, 
    closeResourcePreview, 
    toggleBookmark, 
    bookmarks,
    openReportModal 
  } = useAcademic();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 6;
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // File loading state from IndexedDB or URL
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [isStoredFile, setIsStoredFile] = useState<boolean>(false);
  const [fileMime, setFileMime] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let createdBlobUrl: string | null = null;

    async function loadResourceFile() {
      if (!resource) return;
      setIsLoadingFile(true);
      setIsStoredFile(false);
      setTextContent(resource.file_content || '');
      setFileMime(resource.file_type || '');

      try {
        const stored = await getResourceFile(resource.id);
        if (stored && isMounted) {
          setIsStoredFile(true);

          if (typeof stored === 'string') {
            setResolvedUrl(stored);
            if (stored.startsWith('data:text') || !stored.startsWith('data:')) {
              setTextContent(stored);
            }
            setIsLoadingFile(false);
            return;
          } else if (stored instanceof Blob) {
            setFileMime(stored.type || resource.file_type || '');
            const blobUrl = URL.createObjectURL(stored);
            createdBlobUrl = blobUrl;
            setResolvedUrl(blobUrl);

            // If it's a text/code file, extract text content
            const isTextLike = 
              stored.type.startsWith('text/') || 
              /\.(txt|md|csv|json|py|cpp|c|java|js|ts|html|css|sql|log)$/i.test(resource.file_name || resource.title);

            if (isTextLike) {
              const text = await stored.text();
              if (isMounted) setTextContent(text);
            }
            setIsLoadingFile(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read file from storage:', err);
      }

      // Fallback to resource.file_url
      if (isMounted) {
        setResolvedUrl(resource.file_url || '');
        setIsLoadingFile(false);
      }
    }

    loadResourceFile();

    return () => {
      isMounted = false;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [resource]);

  if (!resource) return null;

  const isBookmarked = bookmarks.includes(resource.id);

  // Determine file format
  const fileName = resource.file_name || '';
  const isMockUrl = resolvedUrl === 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  
  const isPdf = 
    fileMime === 'application/pdf' || 
    fileName.toLowerCase().endsWith('.pdf') || 
    (!isStoredFile && isMockUrl) ||
    resolvedUrl.startsWith('data:application/pdf');

  const isImage = 
    fileMime.startsWith('image/') || 
    /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName) ||
    resolvedUrl.startsWith('data:image/');

  const isText = 
    Boolean(textContent) || 
    fileMime.startsWith('text/') || 
    /\.(txt|md|csv|json|py|cpp|c|java|js|ts|html|css|sql|log)$/i.test(fileName);

  const isZipOrArchive = /\.(zip|rar|tar|gz|7z)$/i.test(fileName);
  const isOfficeDoc = /\.(docx?|pptx?|xlsx?)$/i.test(fileName);

  // File download handler
  const handleDownload = () => {
    // If real file uploaded by user in IndexedDB or direct Blob URL
    if (resolvedUrl && !isMockUrl) {
      const a = document.createElement('a');
      a.href = resolvedUrl;
      a.download = fileName || `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${isPdf ? 'pdf' : isImage ? 'png' : 'bin'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // If text file
    if (textContent) {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    // Otherwise download synthesized academic document
    const content = `=====================================================
ARMY INSTITUTE OF TECHNOLOGY, PUNE
Department of Computer Engineering - Academic Resource
=====================================================

Title:       ${resource.title}
Subject:     ${resource.subject_name || 'SPPU Curriculum'} (${resource.subject_code || 'AIT Pune'})
Unit:        ${resource.unit ? `Unit ${resource.unit}` : 'Comprehensive (All Units)'}
Type:        ${resource.type.toUpperCase()}
Contributor: ${resource.contributor_name}
File Size:   ${resource.file_size}

Description:
${resource.description}

Key Tags:
${resource.tags?.join(', ') || 'SPPU Exam Reference'}

-----------------------------------------------------
Downloaded from AIT Academia Hub Portal for educational study.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}_Study_Notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard?.writeText(textContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-5xl h-[92vh] bg-[#191F2E] dark:bg-[#191F2E] light:bg-white rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#10131C]/80 dark:bg-[#10131C]/80 light:bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF] flex items-center justify-center shrink-0">
              {isImage ? (
                <ImageIcon className="w-4 h-4" />
              ) : isText ? (
                <FileCode className="w-4 h-4" />
              ) : isZipOrArchive ? (
                <FileArchive className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 truncate">
                {resource.title}
              </h3>
              <p className="text-[11px] text-[#A4ADBE] truncate">
                {resource.subject_name} • Unit {resource.unit || 'All'} • {resource.file_size}
                {fileName && ` • ${fileName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => toggleBookmark(resource.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked 
                  ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/40' 
                  : 'bg-[#191F2E] text-[#A4ADBE] border-white/[0.08] hover:text-[#F3F4F8]'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[#191F2E] text-[#A4ADBE] hover:text-[#F3F4F8] border border-white/[0.08] transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="hidden sm:inline text-[10px] text-[#54D6C7] font-semibold animate-pulse">
                Copied!
              </span>
            )}

            {/* Open original file in new tab if available */}
            {resolvedUrl && !isMockUrl && (
              <button
                onClick={() => window.open(resolvedUrl, '_blank')}
                className="p-2 rounded-lg bg-[#191F2E] text-slate-300 hover:text-white border border-white/[0.08] transition-colors hidden sm:block"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Report */}
            <button
              onClick={() => openReportModal(resource)}
              className="p-2 rounded-lg bg-[#191F2E] text-slate-400 hover:text-red-400 border border-white/[0.08] transition-colors"
              title="Report content error or duplicate"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-colors shadow-md shadow-[#8B7CFF]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close */}
            <button
              onClick={closeResourcePreview}
              className="p-2 rounded-lg text-[#A4ADBE] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Controls Strip (Zoom & info) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-[#191F2E] dark:bg-[#191F2E] light:bg-slate-100 border-b border-white/[0.06] text-xs text-[#A4ADBE]">
          <div className="flex items-center gap-2">
            {isPdf && isStoredFile ? (
              <span className="text-[11px] font-mono text-[#54D6C7] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct PDF Reader Active
              </span>
            ) : isImage ? (
              <span className="text-[11px] font-mono text-[#54D6C7] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> High-Res Image Preview
              </span>
            ) : isText ? (
              <span className="text-[11px] font-mono text-[#54D6C7] flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> Text / Code Source ({textContent.split('\n').length} lines)
              </span>
            ) : isMockUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-0.5 rounded bg-[#10131C] disabled:opacity-40 text-xs hover:bg-[#222A3D]"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-0.5 rounded bg-[#10131C] disabled:opacity-40 text-xs hover:bg-[#222A3D]"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-slate-300">
                {fileName || 'Document File Archive'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isText && (
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#10131C] hover:bg-[#222A3D] text-[11px] text-slate-300"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedText ? 'Copied Text!' : 'Copy Text'}</span>
              </button>
            )}

            {!isPdf && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                  className="p-1 rounded hover:bg-white/[0.05]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-12 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 rounded hover:bg-white/[0.05]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setZoomLevel(100)} 
                  className="p-1 rounded hover:bg-white/[0.05]" 
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="flex-1 overflow-auto bg-[#10131C] p-3 sm:p-6 flex justify-center items-stretch">
          {isLoadingFile ? (
            <div className="m-auto flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading document contents...</p>
            </div>
          ) : isPdf && isStoredFile ? (
            /* REAL USER-UPLOADED PDF PREVIEW (NATIVE BROWSER PDF VIEWER) */
            <div className="w-full h-full min-h-[580px] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <iframe
                src={`${resolvedUrl}#view=FitH`}
                className="w-full h-full min-h-[580px] border-0"
                title={resource.title}
              />
            </div>
          ) : isImage && resolvedUrl ? (
            /* REAL USER-UPLOADED IMAGE PREVIEW */
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img 
                src={resolvedUrl} 
                alt={resource.title}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-transform duration-150"
              />
            </div>
          ) : isText && textContent ? (
            /* REAL USER-UPLOADED TEXT / CODE / NOTES */
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-4xl bg-[#0D1117] border border-white/[0.08] rounded-xl p-6 text-slate-200 font-mono text-xs sm:text-sm overflow-auto shadow-2xl select-text leading-relaxed whitespace-pre-wrap transition-transform duration-150"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08] font-sans text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#8B7CFF]" />
                  <span className="font-semibold text-slate-200">{fileName || `${resource.title}.txt`}</span>
                </div>
                <span>{textContent.split('\n').length} lines • {resource.file_size}</span>
              </div>
              <code className="block select-text font-mono text-[13px] leading-6 text-emerald-300">
                {textContent}
              </code>
            </div>
          ) : (isOfficeDoc || isZipOrArchive) && isStoredFile ? (
            /* USER-UPLOADED DOCX / ZIP / PPT DOCUMENT CARD */
            <div className="w-full max-w-lg m-auto p-8 rounded-2xl bg-[#191F2E] border border-white/[0.08] shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#8B7CFF]/15 text-[#8B7CFF] flex items-center justify-center mx-auto">
                {isZipOrArchive ? <FileArchive className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 mb-2 rounded text-[10px] font-bold bg-[#8B7CFF]/20 text-[#8B7CFF] uppercase">
                  {fileName.split('.').pop() || 'DOCUMENT'}
                </span>
                <h3 className="text-base font-bold text-white mb-1.5">{fileName || resource.title}</h3>
                <p className="text-xs text-[#A4ADBE] max-w-md mx-auto leading-relaxed">{resource.description}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#10131C] border border-white/[0.06] text-xs text-slate-300 max-w-xs mx-auto flex justify-between">
                <span className="text-[#A4ADBE]">File Size:</span>
                <span className="font-semibold text-white">{resource.file_size}</span>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-[#8B7CFF] text-[#10131C] hover:bg-[#8B7CFF]/90 transition-all shadow-lg shadow-[#8B7CFF]/20 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Original Document</span>
                </button>
              </div>
            </div>
          ) : (
            /* DYNAMIC ACADEMIC STUDY NOTES VIEW (FOR MOCK & PRE-SEEDED SUBJECT RESOURCES) */
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl min-h-[680px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 transition-transform duration-150 select-text font-serif leading-relaxed"
            >
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-sans">
                      ARMY INSTITUTE OF TECHNOLOGY, PUNE
                    </h1>
                    <p className="text-xs text-slate-600 font-sans font-medium uppercase tracking-wider mt-0.5">
                      Department of {resource.subject_name?.includes('Computer') || resource.subject_code?.startsWith('310') ? 'Computer Engineering' : 'Information Technology'} • Academic Year 2026-27
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-sans font-bold bg-slate-900 text-white rounded">
                      {resource.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Meta */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 text-xs font-sans grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block">Subject:</span>
                  <span className="font-semibold text-slate-800">{resource.subject_name || 'Academic Course'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Module / Unit:</span>
                  <span className="font-semibold text-slate-800">{resource.unit ? `Unit ${resource.unit}` : 'Comprehensive (All Units)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contributor:</span>
                  <span className="font-semibold text-slate-800">{resource.contributor_name}</span>
                </div>
              </div>

              {/* Subject-Specific Document Content */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-800">
                <h2 className="text-base font-bold text-slate-900 font-sans border-b border-slate-200 pb-1">
                  {resource.title}
                </h2>
                
                <p className="leading-relaxed">
                  {resource.description}
                </p>

                <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 text-xs font-sans">
                  <strong>SPPU Curriculum Note:</strong> Topics covered in this module carry 12-16 marks in Savitribai Phule Pune University theory examinations. Review solved numericals and proofs carefully.
                </div>

                {/* Render contextual sections depending on resource id / title */}
                {renderContextualBody(resource)}
              </div>

              {/* Document Footer */}
              <div className="mt-12 pt-4 border-t border-slate-300 text-[10px] font-sans text-slate-500 flex justify-between items-center">
                <span>AIT Pune Academia Hub • Verified Peer Learning Archive</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#10131C] border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-[#A4ADBE]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8B7CFF]" />
              Uploaded on {new Date(resource.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#54D6C7]" />
              {resource.downloads_count} Views / Downloads
            </span>
            {resource.is_verified && (
              <span className="flex items-center gap-1 text-[#54D6C7] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Faculty Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#A4ADBE]">
              Format: {fileName ? fileName.split('.').pop()?.toUpperCase() : isPdf ? 'PDF Document' : isImage ? 'Image' : 'Study Resource'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Dynamic subject-relevant body for pre-seeded or generic resources
 */
function renderContextualBody(resource: AcademicResource) {
  const id = resource.id;
  const title = resource.title.toLowerCase();

  // TOC (Theory of Computation)
  if (id.includes('toc') || title.includes('grammar') || title.includes('cnf') || title.includes('turing')) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          1. Context Free Grammars (CFG) & Chomsky Normal Form
        </h3>
        <p>
          A Context Free Grammar is represented by a 4-tuple $G = (V, \Sigma, R, S)$. A grammar is in Chomsky Normal Form (CNF) if all production rules are strictly of the form $A \rightarrow BC$ or $A \rightarrow a$, where $A, B, C \in V$ and $a \in \Sigma$.
        </p>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
          <code>
            {`Algorithm: Conversion of CFG to CNF\nStep 1: Eliminate Start symbol from RHS (Add S0 -> S)\nStep 2: Eliminate Null productions (A -> ε)\nStep 3: Eliminate Unit productions (A -> B)\nStep 4: Reduce bodies of length > 2 by introducing intermediate non-terminals\nStep 5: Replace terminals in mixed bodies.`}
          </code>
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          2. Pumping Lemma for CFLs
        </h3>
        <p>
          For any context-free language $L$, there exists a pumping length $p$ such that any string $s \in L$ with $|s| \ge p$ can be divided into $s = uvxyz$ satisfying $|vxy| \le p$, $|vy| \ge 1$, and $\forall i \ge 0, uv^ixy^iz \in L$.
        </p>
      </div>
    );
  }

  // SPOS (Systems Programming & Operating Systems)
  if (id.includes('spos') || title.includes('assembler') || title.includes('symtab') || title.includes('operating systems')) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          1. Two-Pass Assembler Architecture & Symbol Resolution
        </h3>
        <p>
          A two-pass assembler resolves forward references by scanning the assembly code twice. Pass 1 constructs the Symbol Table (SYMTAB), Literal Table (LITTAB), and Pool Table (POOLTAB) while allocating addresses with the Location Counter (LC).
        </p>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
          <code>
            {`SYMTAB Data Structure Design:\nIndex | Symbol Name | Address | Length | Defined\n---------------------------------------------\n  1   | LOOP_START  | 204     | 1      | Y\n  2   | RESULT_VAL  | 220     | 2      | Y\n\nIntermediate Code Generation:\n(IS, 04) (RG, 1) (S, 02) -> Machine code emitted during Pass 2.`}
          </code>
        </div>
      </div>
    );
  }

  // CNS (Computer Networks & Security)
  if (id.includes('cns') || title.includes('network') || title.includes('subnet')) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          1. Sliding Window Protocols & Error Recovery
        </h3>
        <p>
          In Stop-and-Wait ARQ, sender transmits one frame and waits for ACK. In Go-Back-N ARQ with window size $N$, sender transmits up to $N$ frames before blocking. If a frame error occurs, all $N$ frames from the erroneous frame onward are retransmitted.
        </p>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
          <code>
            {`Subnetting Calculation Formula:\nGiven Network: 192.168.10.0/24\nRequired Subnets: 4 subnets\nBorrowed bits: 2 (2^2 = 4 subnets)\nNew Subnet Mask: 255.255.255.192 (/26)\nUsable Hosts per subnet: 2^6 - 2 = 62 hosts`}
          </code>
        </div>
      </div>
    );
  }

  // DSA (Data Structures & Algorithms)
  if (id.includes('dsa') || title.includes('tree') || title.includes('avl') || title.includes('data structure')) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          1. AVL Tree Balance Factor & Rotation Algorithms
        </h3>
        <p>
          An AVL tree is a self-balancing Binary Search Tree where the height difference between left and right subtrees (Balance Factor $BF = h_L - h_R$) is strictly $-1, 0,$ or $+1$.
        </p>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
          <code>
            {`Rotation Cases:\n1. Left-Left (LL) Heavy -> Perform Single Right Rotation\n2. Right-Right (RR) Heavy -> Perform Single Left Rotation\n3. Left-Right (LR) Heavy -> Left rotate left child, then Right rotate node\n4. Right-Left (RL) Heavy -> Right rotate right child, then Left rotate node`}
          </code>
        </div>
      </div>
    );
  }

  // PYQ / Question Paper Collection
  if (resource.type === 'pyq' || title.includes('question') || title.includes('pyq')) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
          Savitribai Phule Pune University Exam Structure
        </h3>
        <p>
          Exam Pattern: 30 Marks In-Semester (Units 1 & 2) + 70 Marks End-Semester (Units 3, 4, 5, 6).
        </p>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
          <code>
            {`Sample University Questions:\nQ1. [7 Marks] Compare and contrast architectural design trade-offs.\nQ2. [7 Marks] Solve the numerical problem with step-by-step state transitions.\nQ3. [6 Marks] Write algorithms or pseudo-code with time complexity analysis.`}
          </code>
        </div>
      </div>
    );
  }

  // Default DBMS / Generic Academic Note
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
        1. Core Principles & Theoretical Foundation
      </h3>
      <p>
        A functional dependency is a constraint between two sets of attributes in a relation. Given relation schema $R$ and subsets $X, Y \subseteq R$, the functional dependency $X \rightarrow Y$ specifies that for any legal relation instance $r(R)$, if two tuples $t_1, t_2$ have $t_1[X] = t_2[X]$, then $t_1[Y] = t_2[Y]$.
      </p>
      <div className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-[11px] overflow-x-auto">
        <code>
          {`Algorithm: Lossless-Join Decomposition Check\nInput: Relation R(A, B, C, D), FDs F, Decomposition D = {R1, R2}\nStep 1: Check if (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2.\nStep 2: Compute attribute closure (R1 ∩ R2)+ under F.\nStep 3: If either R1 or R2 is contained in closure, decomposition is lossless.\nConclusion: Verified consistent with Boyce-Codd Normal Form.`}
        </code>
      </div>
      <h3 className="text-sm font-bold text-slate-900 font-sans pt-2">
        2. Solved SPPU University Examination Problems
      </h3>
      <p>
        Determine all candidate keys for $R(A, B, C, D, E, F)$ with dependencies $AB \rightarrow C, C \rightarrow D, D \rightarrow E, E \rightarrow F, F \rightarrow A$.
      </p>
      <ul className="list-disc pl-5 space-y-1 text-xs">
        <li>Attributes never appearing on the right hand side: &#123;B&#125;. Hence $B$ must be in every candidate key.</li>
        <li>Compute closure of $(AB)^+ = &#123;A, B, C, D, E, F&#125; = R$. Therefore, $AB$ is a candidate key.</li>
        <li>Substitute $A$ using $F \rightarrow A$: $(FB)^+ = R \implies FB$ is also a candidate key.</li>
      </ul>
    </div>
  );
}
