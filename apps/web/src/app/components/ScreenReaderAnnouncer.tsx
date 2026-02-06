import { useEffect, useRef } from 'react';

interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

// Global announcer hook
export function useAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById(`aria-announcer-${priority}`);
    if (announcer) {
      // Clear first to ensure re-announcement of same message
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return { announce };
}

// Screen reader announcer component - should be placed at root level
export function ScreenReaderAnnouncer() {
  return (
    <>
      {/* Polite announcements - don't interrupt current speech */}
      <div
        id="aria-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Assertive announcements - interrupt current speech for important updates */}
      <div
        id="aria-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

// Hook for announcing route changes
export function useRouteAnnouncer(currentScreen: string) {
  const previousScreen = useRef<string>(currentScreen);
  const { announce } = useAnnouncer();

  useEffect(() => {
    if (previousScreen.current !== currentScreen) {
      // Announce page change to screen readers
      const screenName = currentScreen
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      announce(`Navigated to ${screenName}`, 'polite');
      previousScreen.current = currentScreen;
    }
  }, [currentScreen, announce]);
}

// Hook for announcing loading states
export function useLoadingAnnouncer(isLoading: boolean, loadingMessage?: string) {
  const { announce } = useAnnouncer();
  const previousLoading = useRef<boolean>(isLoading);

  useEffect(() => {
    if (previousLoading.current !== isLoading) {
      if (isLoading) {
        announce(loadingMessage || 'Loading', 'polite');
      } else {
        announce('Content loaded', 'polite');
      }
      previousLoading.current = isLoading;
    }
  }, [isLoading, loadingMessage, announce]);
}

// Hook for announcing success/error messages
export function useStatusAnnouncer() {
  const { announce } = useAnnouncer();

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite');
  };

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive');
  };

  const announceWarning = (message: string) => {
    announce(`Warning: ${message}`, 'assertive');
  };

  return { announceSuccess, announceError, announceWarning };
}
