import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Check, X, Zap, Crown, Rocket, HelpCircle } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (planId: string) => void;
  onNavigateToLogin: () => void;
  isAuthenticated?: boolean;
}

export function Pricing({ onSelectPlan, onNavigateToLogin, isAuthenticated = false }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        '1 website',
        'buildaweb.app subdomain',
        '1GB storage',
        'Basic templates',
        'Community support',
        'Buildaweb branding',
      ],
      limitations: [
        'Custom domains',
        'Advanced analytics',
        'Priority support',
        'White-label',
        'Team collaboration',
        'API access',
      ],
      highlighted: false,
      cta: 'Get Started',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      price: { monthly: 29, annual: 24 },
      description: 'For professionals and growing businesses',
      features: [
        'Unlimited websites',
        'Custom domains',
        '50GB storage',
        'All premium templates',
        'Priority support',
        'Advanced analytics',
        'Remove branding',
        'Team collaboration (5 members)',
        'Form submissions (10k/month)',
        'SEO tools',
      ],
      limitations: [
        'API access',
        'Custom integrations',
      ],
      highlighted: true,
      cta: 'Start Free Trial',
      badge: 'Most Popular',
    },
    {
      id: 'business',
      name: 'Business',
      icon: Rocket,
      price: { monthly: 99, annual: 82 },
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        '500GB storage',
        'White-label solution',
        'Dedicated support',
        'Custom templates',
        'API access',
        'Custom integrations',
        'Form submissions (unlimited)',
        'Advanced permissions',
        'SLA guarantee',
        'Priority features',
      ],
      limitations: [],
      highlighted: false,
      cta: 'Start Free Trial',
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
    return price;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'annual' && plan.price.monthly > 0) {
      const monthlyCost = plan.price.monthly * 12;
      const annualCost = plan.price.annual * 12;
      const savings = monthlyCost - annualCost;
      return savings;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E0E7FF] dark:from-gray-900 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={onNavigateToLogin}>
                  Log In
                </Button>
                <Button size="sm" onClick={onNavigateToLogin}>
                  Sign Up
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start free, upgrade as you grow. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-white dark:bg-gray-800 rounded-lg border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  plan.highlighted
                    ? 'border-2 border-primary shadow-xl scale-105'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      plan.highlighted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">${price}</span>
                      <span className="text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'mo' : 'mo'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && plan.price.monthly > 0 && (
                      <p className="text-sm text-success mt-1">
                        Save ${savings}/year
                      </p>
                    )}
                    {billingCycle === 'annual' && plan.price.annual > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ${plan.price.annual * 12}/year
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    fullWidth
                    size="lg"
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    onClick={() => onSelectPlan(plan.id)}
                    className="mb-6"
                  >
                    {plan.cta}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold">What's included:</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.length > 0 && (
                      <>
                        <div className="border-t border-border my-4" />
                        <p className="text-sm font-bold text-muted-foreground">Not included:</p>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Pro and Business plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
              },
              {
                q: 'Can I get a refund?',
                a: 'Yes! We offer a 30-day money-back guarantee on all paid plans.',
              },
            ].map((faq, index) => (
              <div key={index}>
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold">{faq.q}</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Enterprise CTA */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Need a custom solution?</h2>
            <p className="text-muted-foreground mb-6">
              Our Enterprise plan offers custom features, dedicated support, and flexible pricing.
            </p>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
