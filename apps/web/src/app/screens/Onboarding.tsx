import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { 
  Briefcase, 
  Palette, 
  Code, 
  Globe, 
  ShoppingBag, 
  FileText,
  Rocket,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

export interface OnboardingData {
  role: 'business' | 'designer' | 'developer';
  goal: 'portfolio' | 'store' | 'blog' | 'business' | 'landing';
  experience: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const roles = [
    {
      id: 'business',
      title: 'Business Owner',
      description: 'I want to grow my business online',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'designer',
      title: 'Designer',
      description: 'I want to create beautiful websites',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'developer',
      title: 'Developer',
      description: 'I want full control and customization',
      icon: Code,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const goals = [
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'Showcase my work and projects',
      icon: Globe,
      stats: 'Popular for freelancers',
    },
    {
      id: 'store',
      title: 'Online Store',
      description: 'Sell products and services',
      icon: ShoppingBag,
      stats: 'E-commerce ready',
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Share content and ideas',
      icon: FileText,
      stats: 'Great for creators',
    },
    {
      id: 'business',
      title: 'Business Website',
      description: 'Promote my company',
      icon: Briefcase,
      stats: 'Professional presence',
    },
    {
      id: 'landing',
      title: 'Landing Page',
      description: 'Convert visitors to customers',
      icon: Target,
      stats: 'High conversion',
    },
  ];

  const experiences = [
    {
      id: 'beginner',
      title: "I'm just starting",
      description: 'No prior experience with website builders',
      icon: Sparkles,
    },
    {
      id: 'intermediate',
      title: 'I have some experience',
      description: 'Used website builders before',
      icon: TrendingUp,
    },
    {
      id: 'expert',
      title: 'I\'m an expert',
      description: 'Comfortable with web design and development',
      icon: Rocket,
    },
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(data as OnboardingData);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete({
        role: 'business',
        goal: 'business',
        experience: 'beginner',
        interests: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-cyan-500/5 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? 'w-12 bg-primary'
                    : s < step
                    ? 'w-8 bg-primary/50'
                    : 'w-8 bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of 4
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to Buildaweb! 👋</h1>
              <p className="text-lg text-muted-foreground">
                Let's personalize your experience
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-bold text-xl mb-4">What's your role?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = data.role === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setData({ ...data, role: role.id as any })}
                      className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div
                        className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br ${role.color} mb-4`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold mb-2">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={handleSkip}>
                Skip setup
              </Button>
              <Button
                onClick={handleNext}
                disabled={!data.role}
                size="lg"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="font-bold text-2xl mb-2">What do you want to build?</h2>
              <p className="text-muted-foreground">
                We'll customize templates and recommendations for you
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const isSelected = data.goal === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setData({ ...data, goal: goal.id as any })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">{goal.title}</h3>
                          <p className="text-xs text-muted-foreground">{goal.stats}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!data.goal}
                size="lg"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Experience Level */}
        {step === 3 && (
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="font-bold text-2xl mb-2">What's your experience level?</h2>
              <p className="text-muted-foreground">
                This helps us provide the right guidance and tutorials
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {experiences.map((exp) => {
                const Icon = exp.icon;
                const isSelected = data.experience === exp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setData({ ...data, experience: exp.id as any })}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    </div>
                    {isSelected && <CheckCircle className="h-6 w-6 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!data.experience}
                size="lg"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Final */}
        {step === 4 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-bold text-3xl mb-2">You're all set! 🎉</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We've personalized your experience based on your preferences
              </p>
            </div>

            <div className="bg-muted rounded-xl p-6 mb-8">
              <h3 className="font-bold mb-4">Your personalized setup:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium capitalize">{data.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Goal</p>
                  <p className="font-medium capitalize">{data.goal}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience</p>
                  <p className="font-medium capitalize">{data.experience}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Templates ready</p>
                  <p className="text-sm text-muted-foreground">
                    We've selected {data.goal} templates perfect for you
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Interactive tutorial prepared</p>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guide tailored to your experience level
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">AI assistant activated</p>
                  <p className="text-sm text-muted-foreground">
                    Get help anytime with contextual tips and suggestions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                fullWidth
              >
                Start Over
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                fullWidth
              >
                Start Building
                <Rocket className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}