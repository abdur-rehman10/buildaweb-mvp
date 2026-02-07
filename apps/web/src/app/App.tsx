import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
import { BottomTabBar } from './components/BottomTabBar';
import { ScreenReaderAnnouncer, useRouteAnnouncer } from './components/ScreenReaderAnnouncer';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { Eye } from 'lucide-react';
import { SignUp } from './screens/SignUp';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Onboarding } from './screens/Onboarding';
import { ProjectFolders } from './screens/ProjectFolders';
import { Templates } from './screens/Templates';
import { Analytics } from './screens/Analytics';
import { Team } from './screens/Team';
import { Billing } from './screens/Billing';
import { AccountSettings } from './screens/AccountSettings';
import { Help } from './screens/Help';
import { Notifications } from './screens/Notifications';
import { ProjectsApiScreen } from './screens/ProjectsApiScreen';
import { PageApiScreen } from './screens/PageApiScreen';
import { clearAuthToken, getAuthToken } from '../lib/auth';
import { authApi } from '../lib/api';

type Screen = 
  | 'signup' 
  | 'login' 
  | 'onboarding' 
  | 'dashboard' 
  | 'project-folders'
  | 'templates'
  | 'analytics'
  | 'team'
  | 'billing'
  | 'account-settings'
  | 'help'
  | 'notifications'
  | 'page-api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Announce route changes to screen readers
  useRouteAnnouncer(currentScreen);

  // Detect keyboard usage for focus indicators
  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
      window.addEventListener('keydown', handleFirstTab);
    };

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }

    authApi
      .me()
      .then(() => {
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthenticated(false);
        setCurrentScreen('login');
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleSignUp = () => {
    toast.info('Sign up is not wired in this MVP flow. Please log in.');
    navigate('login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('dashboard');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('dashboard');
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setShowOnboarding(false);
    setActiveProjectId(null);
    navigate('login');
  };

  if (authChecking) {
    return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <Toaster position="top-right" />
      
      {/* Screen Reader Announcer */}
      <ScreenReaderAnnouncer />
      
      {/* Accessibility Settings Modal */}
      <AccessibilitySettings 
        isOpen={showAccessibilitySettings}
        onClose={() => setShowAccessibilitySettings(false)}
      />

      {/* Accessibility Toggle - Fixed position */}
      <button
        onClick={() => setShowAccessibilitySettings(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-card border-2 border-border rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Open accessibility settings"
        title="Accessibility Settings (A)"
      >
        <Eye className="h-5 w-5" />
      </button>
      
      {/* Sidebar - only shown when authenticated on desktop, but not on onboarding */}
      {isAuthenticated && currentScreen !== 'onboarding' && (
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={(screen) => navigate(screen as Screen)}
          onLogout={handleLogout}
        />
      )}
      
      {/* Main Content */}
      <div className={isAuthenticated && currentScreen !== 'onboarding' ? 'md:ml-64' : ''}>
        {/* TopBar - only shown when authenticated on desktop, but not on onboarding */}
        {isAuthenticated && currentScreen !== 'onboarding' && (
          <TopBar
            currentScreen={currentScreen}
            onSearch={() => {}}
            onNotifications={() => {}}
            onProfile={() => {}}
            onNavigate={(screen) => navigate(screen as Screen)}
          />
        )}
        
        {/* Main Content Area */}
        <main 
          id="main-content" 
          className={
            isAuthenticated && currentScreen !== 'onboarding' 
              ? 'md:pt-16 pb-20 md:pb-0' 
              : ''
          }
          role="main"
          aria-label="Main content"
        >
          {currentScreen === 'signup' && (
            <SignUp 
              onNavigateToLogin={() => navigate('login')} 
              onSignUp={handleSignUp} 
            />
          )}
          
          {currentScreen === 'login' && (
            <Login 
              onNavigateToSignUp={() => navigate('signup')} 
              onNavigateToForgotPassword={() => {}}
              onLogin={handleLogin}
            />
          )}
          
          {currentScreen === 'onboarding' && (
            <Onboarding 
              onComplete={handleOnboardingComplete}
            />
          )}
          
          {currentScreen === 'dashboard' && (
            <ProjectsApiScreen
              activeProjectId={activeProjectId}
              onSelectProject={(projectId) => {
                setActiveProjectId(projectId);
                navigate('page-api');
              }}
            />
          )}

          {currentScreen === 'page-api' && activeProjectId && (
            <PageApiScreen
              projectId={activeProjectId}
              onBackToProjects={() => navigate('dashboard')}
            />
          )}

          {currentScreen === 'page-api' && !activeProjectId && (
            <Dashboard 
              onSelectProject={() => navigate('dashboard')}
              onCreateProject={() => navigate('dashboard')}
              onLogout={handleLogout}
            />
          )}
          
          {currentScreen === 'project-folders' && (
            <ProjectFolders 
              onBack={() => navigate('dashboard')}
            />
          )}
          
          {currentScreen === 'templates' && (
            <Templates 
              onBack={() => navigate('dashboard')}
              onSelectTemplate={() => {}}
            />
          )}
          
          {currentScreen === 'analytics' && (
            <Analytics />
          )}
          
          {currentScreen === 'team' && (
            <Team />
          )}
          
          {currentScreen === 'billing' && (
            <Billing />
          )}
          
          {currentScreen === 'account-settings' && (
            <AccountSettings />
          )}
          
          {currentScreen === 'help' && (
            <Help />
          )}
          
          {currentScreen === 'notifications' && (
            <Notifications />
          )}
        </main>

        {/* Mobile Navigation - Only visible on mobile */}
        {isAuthenticated && (
          <MobileNav
            currentScreen={currentScreen}
            onNavigate={(screen) => navigate(screen as Screen)}
            onLogout={handleLogout}
          />
        )}

        {/* Bottom Tab Bar - Only visible on mobile */}
        {isAuthenticated && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screen) => navigate(screen as Screen)}
            onCreateProject={() => toast.success('Create project clicked!')}
          />
        )}
      </div>
    </div>
  );
}
