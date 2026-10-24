export type UserRole = 'student' | 'mentor' | 'admin';

export type Branch = 'COMP' | 'IT' | 'ENTC' | 'MECH';

export type AcademicYear = 'FE' | 'SE' | 'TE' | 'BE';

export type ResourceType = 
  | 'notes' 
  | 'pyq' 
  | 'tutorial' 
  | 'lab_manual' 
  | 'imp_questions' 
  | 'assignment';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch: Branch;
  year: AcademicYear;
  semester: number;
  prn_number?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branch: Branch;
  year: AcademicYear;
  semester: number;
  credits: number;
  unitsCount: number;
  description: string;
  facultyName?: string;
}

export interface AcademicResource {
  id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  unit?: number;
  title: string;
  description: string;
  type: ResourceType;
  file_url: string;
  file_size: string;
  file_name?: string;
  file_type?: string;
  file_content?: string;
  uploaded_by: string;
  contributor_name: string;
  is_verified: boolean;
  downloads_count: number;
  created_at: string;
  tags?: string[];
  year_held?: string; // For PYQs like "Dec 2024 (In-Sem)"
}

export interface DoubtAnswer {
  id: string;
  doubt_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  content: string;
  upvotes: number;
  is_accepted: boolean;
  created_at: string;
  user_has_upvoted?: boolean;
}

export interface Doubt {
  id: string;
  subject_id: string;
  subject_name: string;
  unit?: number;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  is_resolved: boolean;
  accepted_answer_id?: string;
  created_at: string;
  answers: DoubtAnswer[];
  user_has_upvoted?: boolean;
}

export interface Assignment {
  id: string;
  subject_id: string;
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  unit: number;
  created_by_name: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submission?: {
    submitted_at: string;
    file_name: string;
    grade?: string;
    feedback?: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'exam' | 'placement' | 'club';
  priority: 'normal' | 'urgent';
  posted_by: string;
  created_at: string;
  department?: string;
}

export interface RevisionCard {
  id: string;
  subject_id: string;
  subject_name: string;
  unit: number;
  title: string;
  key_points: string[];
  high_yield_question: string;
  high_yield_answer: string;
  is_completed?: boolean;
}

export interface SGPAEntry {
  id: string;
  subjectName: string;
  credits: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  gradePoint: number;
}
