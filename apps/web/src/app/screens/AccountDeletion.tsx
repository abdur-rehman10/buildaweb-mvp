import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { AlertTriangle, Trash2, CheckCircle, Download, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AccountDeletionProps {
  onCancel: () => void;
  onComplete: () => void;
}

export function AccountDeletion({ onCancel, onComplete }: AccountDeletionProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const reasons = [
    'I found a better alternative',
    'Too expensive',
    'Missing features I need',
    'Too complicated to use',
    'Not using it anymore',
    'Privacy concerns',
    'Technical issues',
    'Other',
  ];

  const handleToggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleDownloadData = () => {
    toast.success('Your data export has been initiated. You\'ll receive an email when it\'s ready.');
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      toast.success('Account deletion initiated');
      onComplete();
    }, 2000);
  };

  const canProceedStep1 = selectedReasons.length > 0;
  const canProceedStep2 = confirmationText === 'DELETE MY ACCOUNT';

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Delete Account</h1>
          <p className="text-muted-foreground">
            We're sorry to see you go
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-destructive text-destructive-foreground'
                    : s < step
                    ? 'bg-muted-foreground text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 mx-1 ${
                    s < step ? 'bg-muted-foreground' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Feedback */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="font-bold text-xl mb-6">Help us improve</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Why are you leaving? (Select all that apply)
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional feedback (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="flex-1"
                  variant="destructive"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Download Data */}
        {step === 2 && (
          <Card className="p-8">
            <h2 className="font-bold text-xl mb-6">Download Your Data</h2>

            <div className="space-y-6">
              <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3 mb-4">
                  <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100 mb-2">
                      Export Your Content
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                      Before you go, you can download a copy of all your data including:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 mb-4">
                      <li>• All your websites and pages</li>
                      <li>• Uploaded media and assets</li>
                      <li>• Custom styles and components</li>
                      <li>• Analytics data and reports</li>
                      <li>• Account settings and preferences</li>
                    </ul>
                    <Button variant="outline" size="sm" onClick={handleDownloadData}>
                      <Download className="h-4 w-4" />
                      Request Data Export
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-warning/10 border-warning">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">What happens when you delete your account?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All your websites will be taken offline immediately</li>
                      <li>• Your custom domains will be disconnected</li>
                      <li>• All data will be permanently deleted after 30 days</li>
                      <li>• Your subscription will be cancelled</li>
                      <li>• This action cannot be undone after 30 days</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="destructive"
                  className="flex-1"
                >
                  Continue to Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <Card className="p-8">
            <h2 className="font-bold text-xl mb-6 text-destructive">Final Confirmation</h2>

            <div className="space-y-6">
              <Card className="p-6 bg-destructive/10 border-destructive">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-2">This action is permanent!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        All websites will be taken offline
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        All data will be permanently deleted
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        Billing will be cancelled immediately
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        You will lose access to all projects
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="font-bold text-destructive">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={!canProceedStep2 || isDeleting}
                  variant="destructive"
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Changed your mind?{' '}
                <button onClick={onCancel} className="text-primary hover:underline">
                  Keep my account
                </button>
              </p>
            </div>
          </Card>
        )}

        {/* Help */}
        <Card className="p-6 mt-6 bg-muted">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Need help instead?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Before you go, our support team might be able to help with any issues you're experiencing.
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
