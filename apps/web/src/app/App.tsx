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
import { ForgotPassword } from './screens/ForgotPassword';
import { ResetPassword } from './screens/ResetPassword';
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
import { MediaLibrary } from './screens/MediaLibrary';
import { getAuthToken } from '../lib/auth';
import { hydrateCurrentUser, logout } from '../lib/auth-service';

type Screen = 
  | 'signup' 
  | 'login' 
  | 'forgot-password'
  | 'reset-password'
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
  | 'assets'
  | 'page-api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [resetTokenPrefill, setResetTokenPrefill] = useState<string>('');

  const resolveScreenFromPath = (): Screen => {
    const { pathname } = window.location;
    if (pathname === '/signup') return 'signup';
    if (pathname === '/login') return 'login';
    if (pathname === '/dashboard' || pathname === '/') return 'dashboard';
    return 'login';
  };

  const getPathForScreen = (screen: Screen): string => {
    if (screen === 'signup') return '/signup';
    if (screen === 'login') return '/login';
    return '/dashboard';
  };

  const isProtectedScreen = (screen: Screen): boolean => !['login', 'signup', 'forgot-password', 'reset-password'].includes(screen);

  const navigateToLogin = (redirect?: string) => {
    const search = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    const path = `/login${search}`;
    if (window.location.pathname + window.location.search !== path) {
      window.history.replaceState(null, '', path);
    }
    setCurrentScreen('login');
  };

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
    const onPopState = () => {
      const nextScreen = resolveScreenFromPath();
      if (!isAuthenticated && isProtectedScreen(nextScreen)) {
        navigateToLogin(window.location.pathname + window.location.search);
        return;
      }

      setCurrentScreen(nextScreen);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeProjectId || !activePageId) return;
    window.localStorage.setItem(`baw_last_page_${activeProjectId}`, activePageId);
  }, [activeProjectId, activePageId]);

  useEffect(() => {
    const screenFromPath = resolveScreenFromPath();
    setCurrentScreen(screenFromPath);

    const token = getAuthToken();
    if (!token) {
      if (isProtectedScreen(screenFromPath)) {
        navigateToLogin(window.location.pathname + window.location.search);
      }
      setAuthChecking(false);
      return;
    }

    hydrateCurrentUser()
      .then((user) => {
        if (!user) {
          navigateToLogin(window.location.pathname + window.location.search);
          return;
        }

        setIsAuthenticated(true);
        if (screenFromPath === 'login' || screenFromPath === 'signup') {
          setCurrentScreen('dashboard');
          window.history.replaceState(null, '', '/dashboard');
        } else {
          setCurrentScreen(screenFromPath);
        }
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const navigate = (screen: Screen) => {
    const path = getPathForScreen(screen);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setCurrentScreen(screen);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect?.startsWith('/')) {
      window.history.replaceState(null, '', redirect);
    } else {
      window.history.replaceState(null, '', '/dashboard');
    }
    setCurrentScreen('dashboard');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect?.startsWith('/')) {
      window.history.replaceState(null, '', redirect);
    } else {
      window.history.replaceState(null, '', '/dashboard');
    }
    setCurrentScreen('dashboard');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setShowOnboarding(false);
    setActiveProjectId(null);
    setActivePageId(null);
    navigateToLogin();
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
              onNavigateToForgotPassword={() => navigate('forgot-password')}
              onLogin={handleLogin}
            />
          )}

          {currentScreen === 'forgot-password' && (
            <ForgotPassword
              onNavigateToLogin={() => navigate('login')}
              onNavigateToResetPassword={(token) => {
                setResetTokenPrefill(token ?? '');
                navigate('reset-password');
              }}
            />
          )}

          {currentScreen === 'reset-password' && (
            <ResetPassword
              initialToken={resetTokenPrefill}
              onNavigateToLogin={() => {
                setResetTokenPrefill('');
                navigate('login');
              }}
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
              activePageId={activePageId}
              onSelectActivePageId={setActivePageId}
              onSelectProject={(projectId) => {
                setActiveProjectId(projectId);
              }}
              onOpenPage={(projectId, pageId) => {
                setActiveProjectId(projectId);
                setActivePageId(pageId);
                navigate('page-api');
              }}
              onOpenAssetsLibrary={(projectId) => {
                setActiveProjectId(projectId);
                navigate('assets');
              }}
            />
          )}

          {currentScreen === 'page-api' && activeProjectId && (
            <PageApiScreen
              projectId={activeProjectId}
              pageId={activePageId}
              onPageIdChange={setActivePageId}
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

          {currentScreen === 'assets' && (
            <MediaLibrary
              projectId={activeProjectId}
              onBack={() => navigate('dashboard')}
            />
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
