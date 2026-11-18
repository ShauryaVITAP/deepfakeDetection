import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DetectionProvider } from './context/DetectionContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { VideoUploadPage } from './pages/VideoUploadPage';
import { AnalysisProgressPage } from './pages/AnalysisProgressPage';
import { DetectionResultsPage } from './pages/DetectionResultsPage';
import { FrameEvidencePage } from './pages/FrameEvidencePage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { PdfReportPage } from './pages/PdfReportPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DetectionProvider>
        <div className="min-h-screen flex flex-col bg-[#17151C] text-[#F5F0FA]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<VideoUploadPage />} />
              <Route path="/progress" element={<AnalysisProgressPage />} />
              <Route path="/results" element={<DetectionResultsPage />} />
              <Route path="/evidence" element={<FrameEvidencePage />} />
              <Route path="/history" element={<AnalysisHistoryPage />} />
              <Route path="/reports" element={<PdfReportPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </DetectionProvider>
    </BrowserRouter>
  );
};

export default App;
