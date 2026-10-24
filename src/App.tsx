import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AcademicProvider } from './context/AcademicContext';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { ReportModal } from './components/ReportModal';
import { UploadResourceModal } from './components/UploadResourceModal';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectExplorerPage } from './pages/SubjectExplorerPage';
import { ResourceLibraryPage } from './pages/ResourceLibraryPage';
import { PeerDoubtForumPage } from './pages/PeerDoubtForumPage';
import { RevisionModePage } from './pages/RevisionModePage';
import { SGPACalculatorPage } from './pages/SGPACalculatorPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string | undefined>(undefined);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10131C] text-[#F3F4F8] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B7CFF] to-[#54D6C7] flex items-center justify-center animate-spin">
          <div className="w-6 h-6 rounded-lg bg-[#10131C]" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-bold text-[#F3F4F8]">AIT Academia Hub</h2>
          <p className="text-xs text-[#A4ADBE] mt-0.5">Initializing Academic Environment...</p>
        </div>
      </div>
    );
  }

  // Protected route check: if user is not signed in, show AuthPage
  if (!user) {
    return <AuthPage />;
  }

  const handleOpenUploadModal = (subjectId?: string) => {
    setUploadSubjectId(subjectId);
    setIsUploadModalOpen(true);
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setActiveTab('library');
  };

  return (
    <div className="flex flex-col h-screen bg-[#10131C] dark:bg-[#10131C] light:bg-slate-50 text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-900 transition-colors duration-200">
      
      {/* Header */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGlobalSearch={handleGlobalSearch}
      />

      {/* Main Body with Sidebar + Active Page */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 min-w-0">
          
          {/* Sample Demo Banner */}
          <div className="mb-6 p-3 rounded-2xl bg-[#191F2E] border border-white/[0.06] flex items-center justify-between text-xs text-[#A4ADBE]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#54D6C7]" />
              <span>
                <strong>AIT Pune Portal:</strong> SPPU 2019/2024 Pattern Curriculum • Verified Peer Learning Environment
              </span>
            </div>
            <button
              onClick={() => setActiveTab('revision')}
              className="hidden sm:inline-flex text-[11px] font-bold text-[#8B7CFF] hover:underline"
            >
              Sprint Revision Active →
            </button>
          </div>

          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onOpenUploadModal={() => handleOpenUploadModal()}
            />
          )}

          {activeTab === 'explorer' && (
            <SubjectExplorerPage
              onOpenUploadModalWithSubject={(sId) => handleOpenUploadModal(sId)}
            />
          )}

          {activeTab === 'library' && (
            <ResourceLibraryPage
              onOpenUploadModal={() => handleOpenUploadModal()}
              initialQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'doubts' && <PeerDoubtForumPage />}

          {activeTab === 'revision' && <RevisionModePage />}

          {activeTab === 'sgpa' && <SGPACalculatorPage />}

          {activeTab === 'assignments' && <AssignmentsPage />}

          {activeTab === 'announcements' && <AnnouncementsPage />}

          {activeTab === 'bookmarks' && (
            <BookmarksPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'profile' && <ProfileSettingsPage />}
        </main>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Interactive Modals */}
      <PDFPreviewModal />
      <ReportModal />
      <UploadResourceModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadSubjectId(undefined);
        }}
        defaultSubjectId={uploadSubjectId}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 bg-[#10131C] dark:bg-[#10131C] light:bg-slate-100 py-6 px-4 sm:px-8 text-center text-xs text-[#A4ADBE] space-y-2">
        <p className="font-medium text-[#F3F4F8] dark:text-[#F3F4F8] light:text-slate-800">
          Army Institute of Technology (AIT), Pune — Academia Hub
        </p>
        <p className="text-[11px] text-[#A4ADBE]">
          Designed for Cadet Peer Learning, SPPU Exam Preparation, and Department Resource Consolidation.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#A4ADBE]/60 pt-1">
          <span>SPPU 2019/2024 Curriculum</span>
          <span>•</span>
          <span>Supabase Auth & PostgreSQL</span>
          <span>•</span>
          <span>Row Level Security (RLS)</span>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AcademicProvider>
          <MainLayout />
        </AcademicProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
