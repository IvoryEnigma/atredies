import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Subject, 
  AcademicResource, 
  Doubt, 
  Assignment, 
  Announcement, 
  RevisionCard,
  Branch,
  AcademicYear,
  UserRole
} from '../types';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_RESOURCES, 
  INITIAL_DOUBTS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_ANNOUNCEMENTS, 
  REVISION_CARDS 
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { saveResourceFile, deleteResourceFile } from '../utils/fileStorage';

interface AcademicContextType {
  subjects: Subject[];
  resources: AcademicResource[];
  doubts: Doubt[];
  assignments: Assignment[];
  announcements: Announcement[];
  revisionCards: RevisionCard[];
  bookmarks: string[]; // resource ids
  selectedResourceForPreview: AcademicResource | null;
  reportModalResource: AcademicResource | null;
  
  // Actions
  toggleBookmark: (resourceId: string) => void;
  openResourcePreview: (resource: AcademicResource) => void;
  closeResourcePreview: () => void;
  openReportModal: (resource: AcademicResource) => void;
  closeReportModal: () => void;
  submitReport: (resourceId: string, reason: string) => void;
  addResource: (res: Omit<AcademicResource, 'id' | 'downloads_count' | 'created_at'>, fileBlob?: File | Blob) => void;
  verifyResource: (resourceId: string) => void;
  deleteResource: (resourceId: string) => void;
  
  // Doubts Actions
  askDoubt: (data: { subject_id: string; unit?: number; title: string; content: string; tags: string[] }) => void;
  addAnswer: (doubtId: string, content: string) => void;
  upvoteDoubt: (doubtId: string) => void;
  upvoteAnswer: (doubtId: string, answerId: string) => void;
  acceptAnswer: (doubtId: string, answerId: string) => void;
  
  // Assignment Actions
  submitAssignment: (assignmentId: string, fileName: string) => void;
  createAssignment: (data: { subject_id: string; title: string; description: string; due_date: string; total_marks: number; unit: number }) => void;
  
  // Announcements Action
  addAnnouncement: (data: { title: string; content: string; category: 'academic' | 'exam' | 'placement' | 'club'; priority: 'normal' | 'urgent'; department?: string }) => void;

  // Revision Actions
  toggleRevisionCompleted: (cardId: string) => void;

  // Filter Helpers
  getSubjectsByBranchAndYear: (branch: Branch, year: AcademicYear, semester?: number) => Subject[];
  getResourcesBySubject: (subjectId: string) => AcademicResource[];
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

// Safe background dispatcher for Supabase operations without breaking offline UX
function safeBackgroundOp(promise: PromiseLike<any>) {
  Promise.resolve(promise).catch((err: unknown) => {
    console.warn('Supabase sync warning (offline/pending migration):', err);
  });
}

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('ait_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });
  
  const [resources, setResources] = useState<AcademicResource[]>(() => {
    const saved = localStorage.getItem('ait_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [doubts, setDoubts] = useState<Doubt[]>(() => {
    const saved = localStorage.getItem('ait_doubts');
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('ait_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('ait_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [revisionCards, setRevisionCards] = useState<RevisionCard[]>(() => {
    const saved = localStorage.getItem('ait_revision_cards');
    return saved ? JSON.parse(saved) : REVISION_CARDS;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ait_bookmarks');
    return saved ? JSON.parse(saved) : ['res-dbms-u2', 'res-dbms-pyq-2024'];
  });

  const [selectedResourceForPreview, setSelectedResourceForPreview] = useState<AcademicResource | null>(null);
  const [reportModalResource, setReportModalResource] = useState<AcademicResource | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('ait_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    try {
      // Avoid localStorage quota crash if large file_content or base64 exists
      const safeResources = resources.map((r) => {
        if (r.file_content && r.file_content.length > 50000) {
          const { file_content, ...rest } = r;
          return { ...rest, file_content: file_content.slice(0, 50000) };
        }
        return r;
      });
      localStorage.setItem('ait_resources', JSON.stringify(safeResources));
    } catch (e) {
      console.warn('Could not save resources to localStorage (storage full):', e);
    }
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('ait_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('ait_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('ait_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('ait_revision_cards', JSON.stringify(revisionCards));
  }, [revisionCards]);

  useEffect(() => {
    localStorage.setItem('ait_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Attempt to synchronize with live Supabase database tables if available
  useEffect(() => {
    let active = true;

    async function syncWithSupabase() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        // Query subjects
        const { data: suData, error: suError } = await supabase.from('subjects').select('*');
        if (!suError && suData && suData.length > 0 && active) {
          setSubjects(
            suData.map((s: any) => ({
              id: s.id,
              code: s.code,
              name: s.name,
              branch: s.branch as Branch,
              year: s.year as AcademicYear,
              semester: s.semester,
              credits: s.credits,
              unitsCount: 6,
              description: s.description || '',
            }))
          );
        }

        // Query announcements
        const { data: annData, error: annError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!annError && annData && annData.length > 0 && active) {
          setAnnouncements(annData);
        }

        // Query resources
        const { data: resData, error: resError } = await supabase
          .from('resources')
          .select('*, subjects(name, code)')
          .order('created_at', { ascending: false });

        if (!resError && resData && resData.length > 0 && active) {
          setResources(
            resData.map((r: any) => ({
              id: r.id,
              subject_id: r.subject_id,
              subject_name: r.subjects?.name || 'Academic Subject',
              subject_code: r.subjects?.code,
              unit: r.unit,
              title: r.title,
              description: r.description || '',
              type: r.type,
              file_url: r.file_url,
              file_size: r.file_size || '1.2 MB',
              uploaded_by: r.uploaded_by || 'AIT Faculty',
              contributor_name: r.contributor_name || 'Contributor',
              is_verified: r.is_verified,
              downloads_count: r.downloads_count || 0,
              created_at: r.created_at,
              tags: [r.type.toUpperCase(), ...(r.unit ? [`Unit ${r.unit}`] : [])],
            }))
          );
        }

        // Query assignments
        const { data: asgData, error: asgError } = await supabase
          .from('assignments')
          .select('*, subjects(name), submissions(*)')
          .order('due_date', { ascending: true });

        if (!asgError && asgData && asgData.length > 0 && active) {
          setAssignments(
            asgData.map((a: any) => {
              const mySub = a.submissions?.find((s: any) => s.student_id === user?.id);
              return {
                id: a.id,
                subject_id: a.subject_id,
                subject_name: a.subjects?.name || 'Subject Assignment',
                title: a.title,
                description: a.description || '',
                due_date: a.due_date,
                total_marks: a.total_marks || 25,
                unit: a.unit || 1,
                created_by_name: 'AIT Faculty Mentor',
                status: mySub ? (mySub.status as any) : 'pending',
                submission: mySub
                  ? {
                      submitted_at: mySub.submitted_at,
                      file_name: mySub.file_url,
                      grade: mySub.grade,
                      feedback: mySub.feedback,
                    }
                  : undefined,
              };
            })
          );
        }

        // Query doubts and answers
        const { data: dbtData, error: dbtError } = await supabase
          .from('doubts')
          .select('*, subjects(name), answers(*)')
          .order('created_at', { ascending: false });

        if (!dbtError && dbtData && dbtData.length > 0 && active) {
          setDoubts(
            dbtData.map((d: any) => ({
              id: d.id,
              subject_id: d.subject_id,
              subject_name: d.subjects?.name || 'SPPU Doubt',
              unit: d.unit,
              author_id: d.author_id,
              author_name: 'Cadet Scholar',
              author_role: 'student',
              title: d.title,
              content: d.content,
              tags: d.tags || [],
              upvotes: d.upvotes || 0,
              is_resolved: d.is_resolved,
              accepted_answer_id: d.accepted_answer_id,
              created_at: d.created_at,
              answers: (d.answers || []).map((ans: any) => ({
                id: ans.id,
                doubt_id: ans.doubt_id,
                author_id: ans.author_id,
                author_name: 'Peer Cadet',
                author_role: 'student',
                content: ans.content,
                upvotes: ans.upvotes || 0,
                is_accepted: ans.is_accepted || false,
                created_at: ans.created_at,
              })),
            }))
          );
        }

        // Query bookmarks if user authenticated
        if (user?.id && !user.id.startsWith('usr-ait-cadet')) {
          const { data: bmData } = await supabase.from('bookmarks').select('resource_id').eq('user_id', user.id);
          if (bmData && active) {
            setBookmarks(bmData.map((b: any) => b.resource_id));
          }
        }
      } catch (err) {
        console.warn('Supabase initial fetch gracefully falling back to local dataset:', err);
      }
    }

    syncWithSupabase();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggleBookmark = (resourceId: string) => {
    setBookmarks((prev) => {
      const willBookmark = !prev.includes(resourceId);
      const next = willBookmark ? [...prev, resourceId] : prev.filter((id) => id !== resourceId);

      // Sync with Supabase if configured and user is live
      if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet')) {
        if (willBookmark) {
          safeBackgroundOp(supabase.from('bookmarks').insert({ user_id: user.id, resource_id: resourceId }));
        } else {
          safeBackgroundOp(supabase.from('bookmarks').delete().match({ user_id: user.id, resource_id: resourceId }));
        }
      }

      return next;
    });
  };

  const openResourcePreview = (resource: AcademicResource) => {
    // Increment download/view count
    setResources((prev) => 
      prev.map((r) => r.id === resource.id ? { ...r, downloads_count: r.downloads_count + 1 } : r)
    );
    setSelectedResourceForPreview({ ...resource, downloads_count: resource.downloads_count + 1 });

    if (isSupabaseConfigured && supabase && !resource.id.startsWith('res-')) {
      safeBackgroundOp(supabase.from('resources').update({ downloads_count: resource.downloads_count + 1 }).eq('id', resource.id));
    }
  };

  const closeResourcePreview = () => {
    setSelectedResourceForPreview(null);
  };

  const openReportModal = (resource: AcademicResource) => {
    setReportModalResource(resource);
  };

  const closeReportModal = () => {
    setReportModalResource(null);
  };

  const submitReport = (resourceId: string, reason: string) => {
    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet') && !resourceId.startsWith('res-')) {
      safeBackgroundOp(supabase.from('reports').insert({
        reporter_id: user.id,
        resource_id: resourceId,
        reason,
        status: 'pending'
      }));
    }
    closeReportModal();
  };

  const addResource = (res: Omit<AcademicResource, 'id' | 'downloads_count' | 'created_at'>, fileBlob?: File | Blob) => {
    const newId = 'res-' + Date.now();
    let finalUrl = res.file_url;

    if (fileBlob) {
      saveResourceFile(newId, fileBlob);
      if (!finalUrl || finalUrl === 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf') {
        finalUrl = URL.createObjectURL(fileBlob);
      }
    }

    const newRes: AcademicResource = {
      ...res,
      id: newId,
      file_url: finalUrl,
      downloads_count: 0,
      created_at: new Date().toISOString(),
    };
    setResources((prev) => [newRes, ...prev]);

    // Push to Supabase if live
    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet')) {
      safeBackgroundOp(supabase.from('resources').insert({
        subject_id: res.subject_id,
        unit: res.unit,
        title: res.title,
        description: res.description,
        type: res.type,
        file_url: res.file_url,
        file_size: res.file_size,
        uploaded_by: user.id,
        contributor_name: res.contributor_name,
        is_verified: res.is_verified,
        downloads_count: 0,
      }));
    }
  };

  const verifyResource = (resourceId: string) => {
    setResources((prev) => 
      prev.map((r) => r.id === resourceId ? { ...r, is_verified: true } : r)
    );

    if (isSupabaseConfigured && supabase && !resourceId.startsWith('res-')) {
      safeBackgroundOp(supabase.from('resources').update({ is_verified: true }).eq('id', resourceId));
    }
  };

  const deleteResource = (resourceId: string) => {
    deleteResourceFile(resourceId);
    setResources((prev) => prev.filter((r) => r.id !== resourceId));

    if (isSupabaseConfigured && supabase && !resourceId.startsWith('res-')) {
      safeBackgroundOp(supabase.from('resources').delete().eq('id', resourceId));
    }
  };

  const askDoubt = (data: { subject_id: string; unit?: number; title: string; content: string; tags: string[] }) => {
    const subj = subjects.find((s) => s.id === data.subject_id);
    const newDoubt: Doubt = {
      id: 'dbt-' + Date.now(),
      subject_id: data.subject_id,
      subject_name: subj?.name || 'Computer Engineering',
      unit: data.unit,
      author_id: user?.id || 'usr-guest',
      author_name: user?.full_name || 'Cadet Scholar',
      author_role: (user?.role || 'student') as UserRole,
      title: data.title,
      content: data.content,
      tags: data.tags,
      upvotes: 0,
      is_resolved: false,
      created_at: new Date().toISOString(),
      answers: [],
    };
    setDoubts((prev) => [newDoubt, ...prev]);

    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet')) {
      safeBackgroundOp(supabase.from('doubts').insert({
        subject_id: data.subject_id,
        unit: data.unit,
        author_id: user.id,
        title: data.title,
        content: data.content,
        tags: data.tags,
        upvotes: 0,
        is_resolved: false
      }));
    }
  };

  const addAnswer = (doubtId: string, content: string) => {
    const newAnswer = {
      id: 'ans-' + Date.now(),
      doubt_id: doubtId,
      author_id: user?.id || 'usr-guest',
      author_name: user?.full_name || 'Cadet Scholar',
      author_role: (user?.role || 'student') as UserRole,
      content,
      upvotes: 0,
      is_accepted: false,
      created_at: new Date().toISOString(),
    };

    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          return {
            ...d,
            answers: [...d.answers, newAnswer],
          };
        }
        return d;
      })
    );

    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet') && !doubtId.startsWith('dbt-')) {
      safeBackgroundOp(supabase.from('answers').insert({
        doubt_id: doubtId,
        author_id: user.id,
        content,
        upvotes: 0,
        is_accepted: false
      }));
    }
  };

  const upvoteDoubt = (doubtId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          const hasVoted = d.user_has_upvoted;
          const nextCount = hasVoted ? d.upvotes - 1 : d.upvotes + 1;
          return {
            ...d,
            upvotes: nextCount,
            user_has_upvoted: !hasVoted,
          };
        }
        return d;
      })
    );
  };

  const upvoteAnswer = (doubtId: string, answerId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          return {
            ...d,
            answers: d.answers.map((a) => {
              if (a.id === answerId) {
                const hasVoted = a.user_has_upvoted;
                const nextCount = hasVoted ? a.upvotes - 1 : a.upvotes + 1;
                return {
                  ...a,
                  upvotes: nextCount,
                  user_has_upvoted: !hasVoted,
                };
              }
              return a;
            }),
          };
        }
        return d;
      })
    );
  };

  const acceptAnswer = (doubtId: string, answerId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          return {
            ...d,
            is_resolved: true,
            accepted_answer_id: answerId,
            answers: d.answers.map((a) => ({
              ...a,
              is_accepted: a.id === answerId,
            })),
          };
        }
        return d;
      })
    );

    if (isSupabaseConfigured && supabase && !doubtId.startsWith('dbt-')) {
      safeBackgroundOp(supabase.from('doubts').update({ is_resolved: true, accepted_answer_id: answerId }).eq('id', doubtId));
      safeBackgroundOp(supabase.from('answers').update({ is_accepted: true }).eq('id', answerId));
    }
  };

  const submitAssignment = (assignmentId: string, fileName: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            status: 'submitted',
            submission: {
              submitted_at: new Date().toISOString(),
              file_name: fileName,
            },
          };
        }
        return a;
      })
    );

    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet') && !assignmentId.startsWith('asg-')) {
      safeBackgroundOp(supabase.from('submissions').upsert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: fileName,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }));
    }
  };

  const createAssignment = (data: { subject_id: string; title: string; description: string; due_date: string; total_marks: number; unit: number }) => {
    const subj = subjects.find((s) => s.id === data.subject_id);
    const newAsg: Assignment = {
      id: 'asg-' + Date.now(),
      subject_id: data.subject_id,
      subject_name: subj?.name || 'Academic Course',
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      total_marks: data.total_marks,
      unit: data.unit,
      created_by_name: user?.full_name || 'Faculty Mentor',
      status: 'pending',
    };
    setAssignments((prev) => [newAsg, ...prev]);

    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet')) {
      safeBackgroundOp(supabase.from('assignments').insert({
        subject_id: data.subject_id,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        total_marks: data.total_marks,
        unit: data.unit,
        created_by: user.id,
      }));
    }
  };

  const addAnnouncement = (data: { title: string; content: string; category: 'academic' | 'exam' | 'placement' | 'club'; priority: 'normal' | 'urgent'; department?: string }) => {
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      posted_by: user?.full_name || 'Office of Academics',
      department: data.department || (user?.branch ? `${user.branch} Dept` : 'Academic Cell'),
      created_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    if (isSupabaseConfigured && supabase && user?.id && !user.id.startsWith('usr-ait-cadet')) {
      safeBackgroundOp(supabase.from('announcements').insert({
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        posted_by: user.id,
      }));
    }
  };

  const toggleRevisionCompleted = (cardId: string) => {
    setRevisionCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, is_completed: !c.is_completed } : c))
    );
  };

  const getSubjectsByBranchAndYear = (branch: Branch, year: AcademicYear, semester?: number) => {
    return subjects.filter((s) => {
      const matchBranch = s.branch === branch;
      const matchYear = s.year === year;
      const matchSem = semester ? s.semester === semester : true;
      return matchBranch && matchYear && matchSem;
    });
  };

  const getResourcesBySubject = (subjectId: string) => {
    return resources.filter((r) => r.subject_id === subjectId);
  };

  return (
    <AcademicContext.Provider
      value={{
        subjects,
        resources,
        doubts,
        assignments,
        announcements,
        revisionCards,
        bookmarks,
        selectedResourceForPreview,
        reportModalResource,
        toggleBookmark,
        openResourcePreview,
        closeResourcePreview,
        openReportModal,
        closeReportModal,
        submitReport,
        addResource,
        verifyResource,
        deleteResource,
        askDoubt,
        addAnswer,
        upvoteDoubt,
        upvoteAnswer,
        acceptAnswer,
        submitAssignment,
        createAssignment,
        addAnnouncement,
        toggleRevisionCompleted,
        getSubjectsByBranchAndYear,
        getResourcesBySubject,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
