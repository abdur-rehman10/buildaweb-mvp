import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { X, Type, Eye, Zap, Check } from 'lucide-react';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'x-large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as typeof fontSize;
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast) setHighContrast(savedHighContrast);
    if (savedReducedMotion) setReducedMotion(savedReducedMotion);

    // Check system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedReducedMotion) {
      setReducedMotion(true);
      localStorage.setItem('accessibility-reduced-motion', 'true');
    }
  }, []);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const sizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'x-large': '20px',
    };
    root.style.setProperty('--font-size', sizes[fontSize]);
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [fontSize]);

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', String(highContrast));
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('accessibility-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="accessibility-settings-title"
        aria-modal="true"
      >
        <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="accessibility-settings-title" className="text-2xl font-bold">
              Accessibility Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close accessibility settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Type className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Font Size</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'small', label: 'Small', size: '14px' },
                { value: 'medium', label: 'Medium', size: '16px' },
                { value: 'large', label: 'Large', size: '18px' },
                { value: 'x-large', label: 'Extra Large', size: '20px' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value as typeof fontSize)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    fontSize === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  aria-pressed={fontSize === option.value}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.size}</p>
                    </div>
                    {fontSize === option.value && (
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-bold">High Contrast Mode</h3>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                highContrast
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              aria-pressed={highContrast}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {highContrast ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Increases contrast for better visibility
                  </p>
                </div>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    highContrast ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Reduce Motion</h3>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                reducedMotion
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              aria-pressed={reducedMotion}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {reducedMotion ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reduces animations and transitions
                  </p>
                </div>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reducedMotion ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> These settings are saved to your browser and will persist across sessions.
            </p>
          </div>

          {/* Close Button */}
          <div className="mt-6">
            <Button fullWidth onClick={onClose}>
              Done
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

// Quick accessibility toggle button (can be placed in TopBar)
export function AccessibilityToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-accent rounded-lg transition-colors"
      aria-label="Open accessibility settings"
      title="Accessibility Settings"
    >
      <Eye className="h-5 w-5" />
    </button>
  );
}
