import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle, Sparkles, Rocket, Gift, ArrowRight, ExternalLink } from 'lucide-react';

interface UpgradeSuccessProps {
  planName: string;
  onContinue: () => void;
  onViewInvoice?: () => void;
}

export function UpgradeSuccess({ planName, onContinue, onViewInvoice }: UpgradeSuccessProps) {
  const newFeatures = [
    {
      icon: Rocket,
      title: 'Unlimited Websites',
      description: 'Create as many sites as you need',
    },
    {
      icon: Sparkles,
      title: 'Advanced Analytics',
      description: 'Deep insights into your traffic',
    },
    {
      icon: Gift,
      title: 'Premium Templates',
      description: 'Access to all professional templates',
    },
  ];

  const nextSteps = [
    {
      title: 'Explore Premium Templates',
      description: 'Browse our collection of professional designs',
      cta: 'View Templates',
      icon: '🎨',
    },
    {
      title: 'Connect Your Domain',
      description: 'Add a custom domain to your website',
      cta: 'Add Domain',
      icon: '🌐',
    },
    {
      title: 'Invite Team Members',
      description: 'Collaborate with your team',
      cta: 'Invite Team',
      icon: '👥',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#E0E7FF] to-[#DBEAFE] dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-success/20 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-success/40 animate-pulse" />
            </div>
            
            {/* Success Icon */}
            <div className="relative h-32 w-32 rounded-full bg-success flex items-center justify-center shadow-xl">
              <CheckCircle className="h-16 w-16 text-white animate-scale-in" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-3">
            Welcome to {planName}! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            Your upgrade was successful. You now have access to all premium features.
          </p>
        </div>

        {/* Plan Summary */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">You're now on</p>
              <h2 className="text-3xl font-bold mb-2">{planName}</h2>
              <p className="text-muted-foreground">
                Billing starts today. Your first invoice is ready.
              </p>
            </div>
            {onViewInvoice && (
              <Button variant="outline" onClick={onViewInvoice}>
                <ExternalLink className="h-4 w-4" />
                View Invoice
              </Button>
            )}
          </div>
        </Card>

        {/* New Features Unlocked */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Features Unlocked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Next Steps</h2>
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <Card key={index} className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="text-4xl">{step.icon}</div>
                    <div>
                      <h3 className="font-bold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    {step.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <Button
            fullWidth
            size="lg"
            onClick={onContinue}
          >
            <Rocket className="h-5 w-5" />
            Go to Dashboard
          </Button>
        </div>

        {/* Thank You Note */}
        <Card className="p-6 mt-8 bg-muted text-center">
          <p className="text-lg font-medium mb-2">Thank you for upgrading! 💜</p>
          <p className="text-sm text-muted-foreground">
            We're excited to help you build amazing websites. If you need any help, our support team is always here for you.
          </p>
        </Card>
      </div>
    </div>
  );
}
