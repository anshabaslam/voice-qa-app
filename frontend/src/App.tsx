import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
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
import { DocumentationPage } from './components/documentation/DocumentationPage';

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
      case 'documentation':
        return <DocumentationPage />;
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
        <Toaster 
          position="top-right"
          closeButton
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgb(31 41 55)',
              border: '1px solid rgb(75 85 99)',
              color: 'rgb(243 244 246)',
            },
            className: 'sonner-toast',
          }}
        />
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
