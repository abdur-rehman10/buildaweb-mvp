import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RestoreFromBackupProps {
  backupId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function RestoreFromBackup({ backupId, onComplete, onCancel }: RestoreFromBackupProps) {
  const [step, setStep] = useState<'confirm' | 'restoring' | 'complete'>('confirm');
  const [progress, setProgress] = useState(0);

  const backup = {
    name: 'Manual Backup - Pre Launch',
    created: 'Feb 6, 2026 10:30 AM',
    size: '12.5 MB',
    pages: 8,
  };

  const handleRestore = () => {
    setStep('restoring');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('complete');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8">
        {step === 'confirm' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Restore from Backup</h1>
                <p className="text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <Card className="p-4 mb-6 bg-muted">
              <h3 className="font-bold mb-3">Backup Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{backup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{backup.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{backup.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium">{backup.pages}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Restoring this backup will replace all current content with the backup version. Any changes made after {backup.created} will be lost.
              </p>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRestore} className="flex-1">
                <RotateCcw className="h-5 w-5" />
                Restore Backup
              </Button>
            </div>
          </>
        )}

        {step === 'restoring' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <RotateCcw className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Restoring Backup...</h2>
              <p className="text-muted-foreground">
                Please don't close this window
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className={progress >= 25 ? 'text-success' : 'text-muted-foreground'}>
                ✓ Preparing restore...
              </div>
              <div className={progress >= 50 ? 'text-success' : 'text-muted-foreground'}>
                {progress >= 50 ? '✓' : '○'} Restoring pages...
              </div>
              <div className={progress >= 75 ? 'text-success' : 'text-muted-foreground'}>
                {progress >= 75 ? '✓' : '○'} Restoring media...
              </div>
              <div className={progress >= 100 ? 'text-success' : 'text-muted-foreground'}>
                {progress >= 100 ? '✓' : '○'} Finalizing...
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Restore Complete!</h2>
              <p className="text-muted-foreground">
                Your site has been successfully restored
              </p>
            </div>

            <Card className="p-4 mb-6 bg-muted">
              <h3 className="font-bold mb-2">What's Next?</h3>
              <ul className="text-sm space-y-1">
                <li>• Review your restored content</li>
                <li>• Test all functionality</li>
                <li>• Republish your site if needed</li>
              </ul>
            </Card>

            <Button fullWidth onClick={onComplete}>
              Continue to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
