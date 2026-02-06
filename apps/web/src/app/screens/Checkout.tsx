import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { CreditCard, Lock, ArrowLeft, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutProps {
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'annual';
  onComplete: () => void;
  onCancel: () => void;
}

export function Checkout({
  planId,
  planName,
  planPrice,
  billingCycle,
  onComplete,
  onCancel,
}: CheckoutProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    country: 'US',
    zipCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = billingCycle === 'annual' ? planPrice * 12 : planPrice;
  const taxRate = 0.08; // 8% tax
  const taxAmount = totalPrice * taxRate;
  const finalTotal = totalPrice + taxAmount;

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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

  const handleProcessPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      onComplete();
    }, 2000);
  };

  const canProceedStep1 = formData.email && formData.email.includes('@');
  const canProceedStep2 =
    formData.cardNumber.replace(/\s/g, '').length === 16 &&
    formData.cardName.length > 0 &&
    formData.expiryDate.length === 5 &&
    formData.cvv.length >= 3;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground">Complete your subscription</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s === step
                        ? 'bg-primary text-primary-foreground'
                        : s < step
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s < step ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-success' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Account */}
            {step === 1 && (
              <Card className="p-8">
                <h2 className="text-xl font-bold mb-6">Account Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Your receipt and account details will be sent to this email.
                  </p>
                  <Button
                    fullWidth
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Payment Details</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange('cardNumber', formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                    required
                  />
                  <Input
                    label="Cardholder Name"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleInputChange('expiryDate', formatExpiryDate(e.target.value))
                      }
                      maxLength={5}
                      required
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      type="password"
                      value={formData.cvv}
                      onChange={(e) =>
                        handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                  <Input
                    label="ZIP/Postal Code"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    required
                  />

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                    <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-900 dark:text-blue-100">
                      Your payment information is encrypted and secure
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1"
                    >
                      Review Order
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <Card className="p-8">
                <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Account</h3>
                    <p className="text-muted-foreground">{formData.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-muted-foreground">
                        •••• •••• •••• {formData.cardNumber.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1" required />
                      <span className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Money-back Guarantee</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{planName} Plan</span>
                    <span className="font-bold">${planPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                  </p>
                </div>

                {billingCycle === 'annual' && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      You're saving 17% with annual billing!
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {[
                      'Full access to all features',
                      '14-day free trial',
                      'Cancel anytime',
                      '24/7 support',
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
