import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      setIsVisible(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    setIsVisible(false);
  };

  useEffect(() => {
    // Scroll to target element if specified
    if (step.target) {
      const element = document.querySelector(step.target);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, step.target]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

      {/* Spotlight on target */}
      {step.target && (
        <div className="fixed inset-0 z-[51] pointer-events-none">
          <div className="absolute inset-0" style={{
            boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }} />
        </div>
      )}

      {/* Tour Card */}
      <div className="fixed inset-0 z-[52] flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto animate-scale-in">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 hover:bg-accent rounded-md transition-colors"
                aria-label="Skip tour"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-6">
              {step.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!isLastStep && (
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {isLastStep ? 'Get Started' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// Hook for managing onboarding tour state
export function useOnboarding(tourId: string) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourId}_completed`);
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, [tourId]);

  const completeTour = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(`tour_${tourId}_completed`);
    setShowTour(true);
  };

  return {
    showTour,
    completeTour,
    skipTour,
    resetTour,
  };
}
