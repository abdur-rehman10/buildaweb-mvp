import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Check, Crown, Zap, X } from 'lucide-react';

interface BillingProps {
  onBack: () => void;
}

export function Billing({ onBack }: BillingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showCheckout, setShowCheckout] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      current: true,
      features: [
        '3 websites',
        'Buildaweb subdomain',
        'Basic templates',
        '100 AI credits/month',
        'Community support',
      ],
      limitations: [
        'Buildaweb branding',
        'No custom domain',
        'Limited storage (500MB)',
      ],
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 190 },
      description: 'For professionals and businesses',
      current: false,
      popular: true,
      features: [
        'Unlimited websites',
        'Custom domain',
        'Remove Buildaweb branding',
        'Unlimited AI credits',
        'Priority support',
        'Advanced analytics',
        '10GB storage',
        'Team collaboration',
        'Custom code injection',
        'A/B testing tools',
      ],
      limitations: [],
    },
  ];

  const handleUpgrade = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    toast.success('Upgrade successful! Welcome to Pro!');
    setShowCheckout(false);
    setTimeout(() => onBack(), 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Unlock powerful features and grow your online presence
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-0.5 rounded-md text-xs bg-success text-white">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-primary border-2 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.name === 'Pro' && <Crown className="h-6 w-6 text-primary" />}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      ${plan.price[billingPeriod]}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(plan.price.yearly / 12).toFixed(2)}/month, billed annually
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="mb-6">
                  {plan.current ? (
                    <Button variant="outline" fullWidth size="lg" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button fullWidth size="lg" onClick={handleUpgrade}>
                      <Crown className="h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <p className="font-medium text-sm">What's included:</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.length > 0 && (
                    <>
                      <div className="pt-3 border-t border-border mt-4">
                        <p className="font-medium text-sm mb-3 text-muted-foreground">
                          Limitations:
                        </p>
                      </div>
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start gap-2">
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time from your account settings. Your
                access will continue until the end of your billing period.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe's
                secure payment processing.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">What happens to my sites if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your sites will remain published, but you'll lose access to Pro features like
                custom domains and unlimited AI credits. You'll need to reduce to 3 sites to match
                the Free plan limit.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Complete Your Upgrade</h3>
              <button onClick={() => setShowCheckout(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Buildaweb Pro</span>
                  <span className="font-bold">
                    ${billingPeriod === 'monthly' ? '19' : '190'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Billed {billingPeriod === 'monthly' ? 'monthly' : 'annually'}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <Input label="Card Number" placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" placeholder="MM / YY" />
                  <Input label="CVC" placeholder="123" />
                </div>
                <Input label="Name on Card" placeholder="John Doe" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowCheckout(false)}>
                  Cancel
                </Button>
                <Button fullWidth onClick={handleCheckoutComplete}>
                  Pay Now
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Secured by Stripe. Your payment information is encrypted.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
