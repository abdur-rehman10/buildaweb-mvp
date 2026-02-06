import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle,
  Sparkles,
  MousePointer
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  action?: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TutorialStep[];
}

export function InteractiveTutorial({ isOpen, onClose, onComplete, steps }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    
    if (isLastStep) {
      onComplete();
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
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Tutorial Card */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
        <Card className="max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-cyan-500/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Interactive Tutorial</h3>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h4 className="font-bold text-lg mb-2">{step.title}</h4>
            <p className="text-muted-foreground mb-4">{step.description}</p>

            {/* Video/Image */}
            {step.videoUrl && (
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                <PlayCircle className="h-12 w-12 text-primary" />
              </div>
            )}

            {step.imageUrl && (
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-lg mb-4" />
            )}

            {/* Action Hint */}
            {step.action && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <MousePointer className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Try it yourself</p>
                    <p className="text-sm text-muted-foreground">{step.action}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex gap-1.5 mb-4">
              {steps.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : index < currentStep
                      ? 'w-2 bg-success'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              </div>

              <Button onClick={handleNext}>
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Highlight Target Element */}
      {step.target && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-20 left-64 w-64 h-32 border-2 border-primary rounded-lg animate-pulse" />
        </div>
      )}
    </>
  );
}
