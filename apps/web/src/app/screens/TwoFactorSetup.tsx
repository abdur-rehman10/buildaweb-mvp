import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Shield, Copy, CheckCircle, Smartphone, Key, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function TwoFactorSetup({ onComplete, onSkip }: TwoFactorSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([
    'ABCD-1234-EFGH-5678',
    'IJKL-9012-MNOP-3456',
    'QRST-7890-UVWX-1234',
    'YZAB-5678-CDEF-9012',
    'GHIJ-3456-KLMN-7890',
    'OPQR-1234-STUV-5678',
    'WXYZ-9012-ABCD-3456',
    'EFGH-7890-IJKL-1234',
  ]);

  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Buildaweb:user@example.com?secret=${secretKey}&issuer=Buildaweb`;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success('Secret key copied to clipboard');
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const handleVerifyCode = () => {
    if (code.length === 6) {
      toast.success('Code verified successfully!');
      setStep(3);
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buildaweb-backup-codes.txt';
    a.click();
    toast.success('Backup codes downloaded');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Enable Two-Factor Authentication</h1>
          <p className="text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 mx-1 ${
                    s < step ? 'bg-success' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Scan QR Code */}
        {step === 1 && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Step 1: Scan QR Code</h2>
                <p className="text-sm text-muted-foreground">
                  Use your authenticator app
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 mb-4"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              {/* Manual Entry */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Recommended Apps */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Recommended Apps:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Google Authenticator (iOS & Android)</li>
                  <li>• Authy (iOS & Android)</li>
                  <li>• 1Password (Cross-platform)</li>
                </ul>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onSkip} className="flex-1">
                  Skip for Now
                </Button>
                <Button onClick={() => setStep(2)} className="flex-1">
                  Next: Verify Code
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Step 2: Verify Code</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your app
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Authentication Code"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />

              <p className="text-sm text-muted-foreground text-center">
                Open your authenticator app and enter the 6-digit code
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6}
                  className="flex-1"
                >
                  Verify & Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Save Backup Codes */}
        {step === 3 && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Step 3: Save Backup Codes</h2>
                <p className="text-sm text-muted-foreground">
                  Keep these codes safe for account recovery
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Warning */}
              <Card className="p-4 bg-warning/10 border-warning">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Important</p>
                    <p className="text-xs text-muted-foreground">
                      Save these codes in a secure location. Each code can only be used once to access your account if you lose your authenticator.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Backup Codes */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center py-2">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopyBackupCodes}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy Codes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadCodes}
                  className="flex-1"
                >
                  Download Codes
                </Button>
              </div>

              <Button fullWidth onClick={onComplete}>
                <CheckCircle className="h-5 w-5" />
                Complete Setup
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can view your backup codes anytime in Security Settings
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
