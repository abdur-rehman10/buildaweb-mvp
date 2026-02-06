import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Check, ChevronRight, Play, BookOpen } from 'lucide-react';

interface GettingStartedGuideProps {
  onBack: () => void;
}

export function GettingStartedGuide({ onBack }: GettingStartedGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const guides = [
    {
      id: 'quickstart',
      title: 'Quick Start (5 min)',
      steps: [
        { id: '1', title: 'Create your account', description: 'Sign up with email or Google' },
        { id: '2', title: 'Choose a template', description: 'Browse our template gallery' },
        { id: '3', title: 'Customize your design', description: 'Use the visual editor to make it yours' },
        { id: '4', title: 'Publish your site', description: 'Go live in one click' },
      ],
    },
    {
      id: 'design',
      title: 'Design Basics (10 min)',
      steps: [
        { id: '5', title: 'Understanding the editor', description: 'Learn the drag-and-drop interface' },
        { id: '6', title: 'Working with components', description: 'Add and customize blocks' },
        { id: '7', title: 'Styling your site', description: 'Colors, fonts, and spacing' },
        { id: '8', title: 'Mobile responsiveness', description: 'Ensure your site looks great everywhere' },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Features (15 min)',
      steps: [
        { id: '9', title: 'Custom code injection', description: 'Add your own HTML, CSS, and JS' },
        { id: '10', title: 'Team collaboration', description: 'Invite team members and set permissions' },
        { id: '11', title: 'SEO optimization', description: 'Improve your search rankings' },
        { id: '12', title: 'Analytics & tracking', description: 'Monitor your site performance' },
      ],
    },
  ];

  const toggleStep = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter((id) => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Getting Started Guide</h1>
                <p className="text-sm text-muted-foreground">
                  {completedSteps.length} of 12 steps completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((completedSteps.length / 12) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(completedSteps.length / 12) * 100}%` }}
            />
          </div>
        </Card>

        {/* Guides */}
        <div className="space-y-8">
          {guides.map((guide) => {
            const guideSteps = guide.steps.map((s) => s.id);
            const guideCompleted = guideSteps.filter((id) => completedSteps.includes(id)).length;

            return (
              <Card key={guide.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{guide.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {guideCompleted} of {guide.steps.length} steps
                    </p>
                  </div>
                  {guideCompleted === guide.steps.length && (
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {guide.steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-success/5 border-success/20'
                            : 'bg-muted border-transparent hover:border-border'
                        }`}
                        onClick={() => toggleStep(step.id)}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-success text-primary-foreground'
                                : 'bg-muted-foreground/20'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{index + 1}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium mb-1">{step.title}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        {completedSteps.length === 12 && (
          <Card className="p-8 text-center mt-8 bg-gradient-to-br from-primary/10 to-cyan-500/10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-6">
              You've completed all getting started guides. Ready to build something amazing?
            </p>
            <Button size="lg">Start Building</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
