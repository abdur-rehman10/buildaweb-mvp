import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { AlertTriangle, CreditCard, RefreshCw, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFailedProps {
  onSuccess: () => void;
  onContactSupport: () => void;
}

export function PaymentFailed({ onSuccess, onContactSupport }: PaymentFailedProps) {
  const [step, setStep] = useState<'error' | 'update' | 'retry'>('error');
  const [isRetrying, setIsRetrying] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const failedPayment = {
    amount: 29.0,
    date: 'Feb 6, 2026',
    planName: 'Pro Plan',
    reason: 'Insufficient funds',
    lastFourDigits: '4242',
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleRetryPayment = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      toast.success('Payment successful!');
      onSuccess();
    }, 2000);
  };

  const handleUpdateCard = () => {
    if (
      !newCard.cardNumber ||
      !newCard.cardName ||
      !newCard.expiryDate ||
      !newCard.cvv
    ) {
      toast.error('Please fill in all card details');
      return;
    }
    setStep('retry');
    toast.success('Payment method updated');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Step 1: Error Message */}
        {step === 'error' && (
          <div className="space-y-6">
            {/* Error Icon */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 mb-4">
                <XCircle className="h-12 w-12 text-destructive animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-lg text-muted-foreground">
                We couldn't process your payment
              </p>
            </div>

            {/* Failed Payment Details */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-xl">${failedPayment.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{failedPayment.planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{failedPayment.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">•••• {failedPayment.lastFourDigits}</span>
                </div>
                <div className="flex items-start justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <span className="text-sm font-medium">Reason</span>
                  <span className="text-sm text-destructive font-medium">{failedPayment.reason}</span>
                </div>
              </div>
            </Card>

            {/* Warning */}
            <Card className="p-4 bg-warning/10 border-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">Action Required</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your subscription will be suspended in 7 days if payment isn't successful. Update your payment method or try again.
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={() => setStep('update')}
              >
                <CreditCard className="h-5 w-5" />
                Update Payment Method
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="outline"
                onClick={handleRetryPayment}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Retry With Same Card
                  </>
                )}
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={onContactSupport}
              >
                <HelpCircle className="h-5 w-5" />
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Update Card */}
        {step === 'update' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Update Payment Method</h2>
            <div className="space-y-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChange={(e) =>
                  setNewCard({ ...newCard, cardNumber: formatCardNumber(e.target.value) })
                }
                maxLength={19}
                required
              />
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={newCard.cardName}
                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={newCard.expiryDate}
                  onChange={(e) =>
                    setNewCard({ ...newCard, expiryDate: formatExpiryDate(e.target.value) })
                  }
                  maxLength={5}
                  required
                />
                <Input
                  label="CVV"
                  placeholder="123"
                  type="password"
                  value={newCard.cvv}
                  onChange={(e) =>
                    setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                  }
                  maxLength={4}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('error')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCard}
                  className="flex-1"
                >
                  Update & Retry Payment
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Retry */}
        {step === 'retry' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                <RefreshCw className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Ready to Retry</h1>
              <p className="text-lg text-muted-foreground">
                We'll attempt to charge your new card
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-xl">${failedPayment.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">New Payment Method</span>
                  <span className="font-medium">•••• {newCard.cardNumber.slice(-4)}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleRetryPayment}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Retry Payment
                  </>
                )}
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setStep('update')}
              >
                Use Different Card
              </Button>
            </div>
          </div>
        )}

        {/* Support Info */}
        <Card className="p-6 mt-6 bg-muted">
          <h3 className="font-medium mb-2">Need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you continue to experience payment issues, our support team is here to help.
          </p>
          <Button variant="outline" size="sm" onClick={onContactSupport}>
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
}
