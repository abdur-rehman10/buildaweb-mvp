import { Button } from './Button';
import { Card } from './Card';
import { AlertTriangle, Trash2, AlertCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: Info,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      buttonVariant: 'primary' as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
    if (e.key === 'Enter' && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <Card className="w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className={`h-12 w-12 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <h3 id="dialog-title" className="font-bold text-lg text-center mb-2">
            {title}
          </h3>
          <p id="dialog-description" className="text-sm text-muted-foreground text-center mb-6">
            {description}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={config.buttonVariant}
              fullWidth
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
