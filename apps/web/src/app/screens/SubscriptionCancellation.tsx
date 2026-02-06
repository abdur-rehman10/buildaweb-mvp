import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CreditCard, AlertCircle, Gift, TrendingDown, Clock, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionCancellationProps {
  onCancel: () => void;
  onComplete: () => void;
}

export function SubscriptionCancellation({ onCancel, onComplete }: SubscriptionCancellationProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const currentPlan = {
    name: 'Pro Plan',
    price: '$29/month',
    renewalDate: 'March 6, 2026',
    features: [
      'Unlimited websites',
      'Custom domains',
      'Advanced analytics',
      'Priority support',
      'Team collaboration',
      'White-label branding',
    ],
  };

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Missing features',
    'Switching to competitor',
    'Technical issues',
    'Found a better alternative',
    'Business closing',
    'Other',
  ];

  const retentionOffers = [
    {
      id: 'discount',
      icon: Gift,
      title: '40% Off for 3 Months',
      description: 'Special discount just for you',
      price: '$17.40/month',
      savings: 'Save $35 over 3 months',
      color: 'primary',
    },
    {
      id: 'pause',
      icon: Clock,
      title: 'Pause Your Subscription',
      description: 'Take a break, come back anytime',
      price: 'Free for 2 months',
      savings: 'Your sites stay online',
      color: 'secondary',
    },
    {
      id: 'downgrade',
      icon: TrendingDown,
      title: 'Downgrade to Basic',
      description: 'Keep essential features',
      price: '$9/month',
      savings: 'Save $20/month',
      color: 'success',
    },
  ];

  const handleToggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleAcceptOffer = () => {
    if (selectedOffer === 'discount') {
      toast.success('40% discount applied to your subscription!');
    } else if (selectedOffer === 'pause') {
      toast.success('Subscription paused for 2 months');
    } else if (selectedOffer === 'downgrade') {
      toast.success('Downgraded to Basic plan');
    }
    onComplete();
  };

  const handleFinalCancel = () => {
    toast.success('Subscription cancelled. Access until ' + currentPlan.renewalDate);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-warning/10 mb-4">
            <CreditCard className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Cancel Subscription</h1>
          <p className="text-muted-foreground">
            We'd hate to see you go
          </p>
        </div>

        {/* Step 1: Reasons */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-8">
              <h2 className="font-bold text-xl mb-6">Why are you cancelling?</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => handleToggleReason(reason)}
                        className="h-4 w-4 text-primary rounded"
                      />
                      <span className="ml-3 text-sm">{reason}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tell us more (optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback helps us improve..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Keep Subscription
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedReasons.length === 0}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Retention Offers */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <h2 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">
                Before you go...
              </h2>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We'd love to keep you! Here are some special offers just for you:
              </p>
            </Card>

            {/* Retention Offers */}
            <div className="space-y-4">
              {retentionOffers.map((offer) => {
                const Icon = offer.icon;
                const isSelected = selectedOffer === offer.id;
                return (
                  <Card
                    key={offer.id}
                    className={`p-6 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedOffer(offer.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{offer.title}</h3>
                            <p className="text-sm text-muted-foreground">{offer.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-2xl font-bold">{offer.price}</span>
                          <span className="text-sm text-success">{offer.savings}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                No Thanks, Cancel Anyway
              </Button>
              <Button
                onClick={handleAcceptOffer}
                disabled={!selectedOffer}
                className="flex-1"
              >
                Accept This Offer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-8">
              <h2 className="font-bold text-xl mb-6">Confirm Cancellation</h2>

              <div className="space-y-6">
                {/* What You'll Lose */}
                <Card className="p-6 bg-warning/10 border-warning">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm mb-3">You'll lose access to:</h3>
                      <div className="space-y-2">
                        {currentPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <X className="h-4 w-4 text-destructive" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Cancellation Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Current Plan</span>
                    <span className="font-bold">{currentPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Current Price</span>
                    <span className="font-bold">{currentPlan.price}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Access Until</span>
                    <span className="font-bold">{currentPlan.renewalDate}</span>
                  </div>
                </div>

                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Good news:</strong> You'll keep access to all features until {currentPlan.renewalDate}. 
                    You can reactivate anytime before then.
                  </p>
                </Card>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Keep My Subscription
              </Button>
              <Button
                onClick={handleFinalCancel}
                variant="destructive"
                className="flex-1"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}

        {/* Support Card */}
        <Card className="p-6 mt-6 bg-muted">
          <h3 className="font-medium mb-2">Need help instead of cancelling?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is here to help resolve any issues you're experiencing.
          </p>
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
}
