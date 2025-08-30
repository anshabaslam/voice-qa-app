import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { VoiceQAPage } from './components/VoiceQAPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('voice-qa');

  useEffect(() => {
    // Check API health on startup
    import('./services/api').then(({ apiService }) => {
      apiService.healthCheck().catch(() => {
        console.warn('Backend API not available');
      });
    });
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'voice-qa':
        return <VoiceQAPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <VoiceQAPage />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        <Toaster position="top-right" />
        {renderCurrentPage()}
      </DashboardLayout>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VoiceProvider>
          <AppContent />
        </VoiceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
