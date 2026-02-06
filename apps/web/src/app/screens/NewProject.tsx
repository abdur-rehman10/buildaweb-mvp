import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewProjectProps {
  onBack: () => void;
  onComplete: (projectId: string) => void;
}

export function NewProject({ onBack, onComplete }: NewProjectProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'preview'>('form');
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteName || !description || !industry) {
      toast.error('Please fill in all fields');
      return;
    }

    setStep('generating');
    
    // Simulate AI generation progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStep('preview');
        }, 500);
      }
      setProgress(currentProgress);
    }, 300);
  };

  const handleAccept = () => {
    toast.success('Site created successfully!');
    onComplete('new-project-' + Date.now());
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl p-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-3">Creating your website with AI...</h2>
          <p className="text-muted-foreground mb-8">
            Our AI is analyzing your business and generating a custom website design
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>

          {/* Loading Steps */}
          <div className="mt-12 space-y-3">
            {[
              { label: 'Analyzing industry trends', done: progress > 20 },
              { label: 'Generating content structure', done: progress > 40 },
              { label: 'Designing layout & sections', done: progress > 60 },
              { label: 'Optimizing for your brand', done: progress > 80 },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 justify-center">
                {item.done ? (
                  <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Header */}
        <header className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className="text-sm text-muted-foreground">Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setStep('form')}>
                Regenerate
              </Button>
              <Button onClick={handleAccept}>
                <Sparkles className="h-4 w-4" />
                Accept & Continue
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Your AI-Generated Website</h1>
            <p className="text-muted-foreground">Review your new website before entering the editor</p>
          </div>

          {/* Preview */}
          <Card className="overflow-hidden">
            <div className="bg-white">
              {/* Mock Website Preview */}
              <div className="p-8 border-b border-border">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">{siteName}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      {description}
                    </p>
                    <div className="flex gap-4 justify-center mt-8">
                      <div className="h-12 w-32 bg-primary rounded-lg" />
                      <div className="h-12 w-32 bg-muted rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#F9FAFB]">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white p-6 rounded-lg border border-border">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg mb-4" />
                        <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-5/6 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-border">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-muted p-6 rounded-lg">
                        <div className="h-3 bg-white rounded w-full mb-2" />
                        <div className="h-3 bg-white rounded w-5/6" />
                        <div className="flex items-center gap-3 mt-4">
                          <div className="h-10 w-10 bg-white rounded-full" />
                          <div className="h-3 bg-white rounded w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Logo size="md" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Create a new website with AI</h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your business and we'll generate a custom website in seconds
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Site Name"
              placeholder="My Awesome Business"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Describe your business
              </label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 rounded-[var(--radius-sm)] border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="We are a local coffee shop that serves organic, fair-trade coffee and homemade pastries..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Be specific about what you do and who your customers are
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Industry
              </label>
              <select
                className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-input bg-input-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              >
                <option value="">Select an industry</option>
                <option value="saas">SaaS / Software</option>
                <option value="agency">Agency / Consulting</option>
                <option value="restaurant">Restaurant / Food Service</option>
                <option value="local">Local Business</option>
                <option value="ecommerce">E-commerce / Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="real-estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Sparkles className="h-4 w-4" />
                Generate Website with AI
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
