-- ====================================================================
-- AIT Academia Hub - Database Migration
-- Target: Supabase (PostgreSQL with Row Level Security)
-- ====================================================================

-- 1. Create User Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE academic_branch AS ENUM ('COMP', 'IT', 'ENTC', 'MECH');
CREATE TYPE academic_year AS ENUM ('FE', 'SE', 'TE', 'BE');
CREATE TYPE resource_type AS ENUM ('notes', 'pyq', 'tutorial', 'lab_manual', 'imp_questions', 'assignment');

-- 2. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    branch academic_branch DEFAULT 'COMP'::academic_branch NOT NULL,
    year academic_year DEFAULT 'TE'::academic_year NOT NULL,
    semester INT DEFAULT 5 CHECK (semester BETWEEN 1 AND 8),
    prn_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    branch academic_branch NOT NULL,
    year academic_year NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INT DEFAULT 3 NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Academic Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit INT CHECK (unit BETWEEN 1 AND 6),
    title TEXT NOT NULL,
    description TEXT,
    type resource_type NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT DEFAULT '1.2 MB',
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contributor_name TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    downloads_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Peer Doubts Table
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit INT,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    upvotes INT DEFAULT 0 NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    accepted_answer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Doubt Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0 NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Foreign key for accepted answer
ALTER TABLE public.doubts 
    ADD CONSTRAINT fk_accepted_answer 
    FOREIGN KEY (accepted_answer_id) 
    REFERENCES public.answers(id) 
    ON DELETE SET NULL;

-- 7. Upvotes Tracking (Avoid duplicate votes)
CREATE TABLE IF NOT EXISTS public.doubt_upvotes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doubt_id UUID REFERENCES public.doubts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, doubt_id)
);

CREATE TABLE IF NOT EXISTS public.answer_upvotes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, answer_id)
);

-- 8. Assignments & Deadlines
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    total_marks INT DEFAULT 25,
    unit INT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    grade TEXT,
    feedback TEXT,
    UNIQUE(assignment_id, student_id)
);

-- 10. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'academic' CHECK (category IN ('academic', 'exam', 'placement', 'club')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    posted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, resource_id)
);

-- 12. Content Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper security function to check current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Anyone can view profiles, users can only update their non-role fields
CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Subjects: Viewable by all authenticated users; mentors/admins can create/edit
CREATE POLICY "Subjects are viewable by authenticated users" 
    ON public.subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mentors and Admins can manage subjects" 
    ON public.subjects FOR ALL TO authenticated 
    USING (public.current_user_role() IN ('mentor', 'admin'));

-- Resources: All viewable; teachers/mentors and admins can upload & verify
CREATE POLICY "Resources viewable by authenticated users" 
    ON public.resources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can upload resources" 
    ON public.resources FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Mentors and Admins can update/verify resources" 
    ON public.resources FOR UPDATE TO authenticated 
    USING (public.current_user_role() IN ('mentor', 'admin') OR auth.uid() = uploaded_by);

-- Doubts: Viewable by all; author can edit; anyone can create
CREATE POLICY "Doubts viewable by authenticated users" 
    ON public.doubts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can post doubts" 
    ON public.doubts FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or Admins can edit doubts" 
    ON public.doubts FOR UPDATE TO authenticated 
    USING (auth.uid() = author_id OR public.current_user_role() = 'admin');

-- Answers: Viewable by all; author can edit; anyone can post
CREATE POLICY "Answers viewable by authenticated users" 
    ON public.answers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can post answers" 
    ON public.answers FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = author_id);

-- Bookmarks: Private to the owner
CREATE POLICY "Users can view own bookmarks" 
    ON public.bookmarks FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" 
    ON public.bookmarks FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
    ON public.bookmarks FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);

-- Reports: Users can insert, only Admins can view/update
CREATE POLICY "Users can report content" 
    ON public.reports FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports" 
    ON public.reports FOR ALL TO authenticated 
    USING (public.current_user_role() = 'admin');

-- Announcements: Viewable by all, insertable by Mentors and Admins
CREATE POLICY "Announcements viewable by all authenticated users" 
    ON public.announcements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mentors and Admins can post announcements" 
    ON public.announcements FOR ALL TO authenticated 
    USING (public.current_user_role() IN ('mentor', 'admin'));

-- Trigger: Automatically create public.profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, branch, year, semester)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'AIT Cadet'),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
        COALESCE((new.raw_user_meta_data->>'branch')::academic_branch, 'COMP'::academic_branch),
        COALESCE((new.raw_user_meta_data->>'year')::academic_year, 'TE'::academic_year),
        COALESCE((new.raw_user_meta_data->>'semester')::int, 5)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 13. SEED DATA (Idempotent initial catalog for SPPU curriculum)
-- ====================================================================

INSERT INTO public.subjects (code, name, branch, year, semester, credits, description)
VALUES 
    ('310241', 'Database Management Systems', 'COMP', 'TE', 5, 3, 'Relational data models, SQL queries, transaction management, indexing (B+ trees), and NoSQL architectures.'),
    ('310242', 'Theory of Computation', 'COMP', 'TE', 5, 3, 'Finite Automata, Regular Expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.'),
    ('310243', 'Systems Programming & OS', 'COMP', 'TE', 5, 4, 'Assemblers, macro processors, process scheduling, memory virtualization, IPC, and Linux kernel fundamentals.'),
    ('310244', 'Computer Networks & Security', 'COMP', 'TE', 5, 3, 'TCP/IP architecture, routing algorithms, cryptographic primitives, public key infrastructure, and SSL/TLS.'),
    ('210242', 'Data Structures & Algorithms', 'COMP', 'SE', 3, 4, 'Linear & non-linear data structures, trees, graphs, sorting algorithms, algorithmic paradigms, and amortized complexity.'),
    ('314442', 'Operating Systems', 'IT', 'TE', 5, 3, 'Process management, concurrency, virtual memory management, file systems, and distributed storage.'),
    ('304181', 'Digital Signal Processing', 'ENTC', 'TE', 5, 3, 'DFT, FFT algorithms, IIR/FIR filter design, multi-rate processing, and DSP architecture.'),
    ('302041', 'Design of Machine Elements', 'MECH', 'TE', 5, 4, 'Stress analysis, shaft design, spring mechanisms, gears, and failure prevention in mechanical components.')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    credits = EXCLUDED.credits,
    description = EXCLUDED.description;

INSERT INTO public.announcements (title, content, category, priority)
SELECT 'SPPU In-Sem Examination Timetable Released (TE COMP/IT)', 'The Savitribai Phule Pune University 30-mark In-Sem examination for Third Year (2019/2024 Pattern) begins from 10th November 2026. Hall tickets available on SPPU Student Portal.', 'exam', 'urgent'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'SPPU In-Sem Examination Timetable Released (TE COMP/IT)');

INSERT INTO public.announcements (title, content, category, priority)
SELECT 'Microsoft & Oracle Campus Recruitment Drive 2026-27', 'Eligible BE and TE Cadets are requested to submit updated resumes to the T&P Cell before 30th October. Technical rounds will cover DSA and Operating Systems concepts.', 'placement', 'urgent'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Microsoft & Oracle Campus Recruitment Drive 2026-27');

INSERT INTO public.announcements (title, content, category, priority)
SELECT 'AIT Solutions Hackathon 2026 - Registration Open', 'Open to all branches (FE through BE). Build solutions addressing defense logistics, campus automation, and peer learning. Cash prizes worth Rs. 1,00,000.', 'club', 'normal'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'AIT Solutions Hackathon 2026 - Registration Open');

