import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Clock, 
  RotateCcw, 
  Eye,
  Download,
  Trash2,
  GitBranch,
  Save,
  CheckCircle
} from 'lucide-react';

interface VersionHistoryProps {
  projectId: string;
  onBack: () => void;
}

interface Version {
  id: string;
  name: string;
  timestamp: string;
  author: string;
  changes: string[];
  size: string;
  isAutoSave: boolean;
  isCurrent: boolean;
}

export function VersionHistory({ projectId, onBack }: VersionHistoryProps) {
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<Version | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Version | null>(null);

  const [versions] = useState<Version[]>([
    {
      id: '1',
      name: 'Current Version',
      timestamp: '5 minutes ago',
      author: 'You',
      changes: ['Updated hero section', 'Changed color scheme', 'Added new CTA button'],
      size: '2.4 MB',
      isAutoSave: false,
      isCurrent: true,
    },
    {
      id: '2',
      name: 'Before color update',
      timestamp: '2 hours ago',
      author: 'You',
      changes: ['Modified pricing section', 'Updated footer links'],
      size: '2.3 MB',
      isAutoSave: false,
      isCurrent: false,
    },
    {
      id: '3',
      name: 'Auto-save',
      timestamp: '1 day ago',
      author: 'System',
      changes: ['Auto-saved changes'],
      size: '2.2 MB',
      isAutoSave: true,
      isCurrent: false,
    },
    {
      id: '4',
      name: 'Initial design',
      timestamp: '3 days ago',
      author: 'You',
      changes: ['Created initial layout', 'Added all sections', 'Set up navigation'],
      size: '2.1 MB',
      isAutoSave: false,
      isCurrent: false,
    },
    {
      id: '5',
      name: 'First publish',
      timestamp: '1 week ago',
      author: 'You',
      changes: ['Published site', 'Optimized images', 'Added meta tags'],
      size: '1.8 MB',
      isAutoSave: false,
      isCurrent: false,
    },
  ]);

  const handleRestore = (version: Version) => {
    setShowRestoreConfirm(version);
  };

  const confirmRestore = () => {
    if (showRestoreConfirm) {
      toast.success(`Restored to version: ${showRestoreConfirm.name}`);
      setShowRestoreConfirm(null);
    }
  };

  const handleDelete = (version: Version) => {
    setShowDeleteConfirm(version);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      toast.success(`Deleted version: ${showDeleteConfirm.name}`);
      setShowDeleteConfirm(null);
    }
  };

  const handleDownload = (version: Version) => {
    toast.success(`Downloading ${version.name}...`);
  };

  const handleCreateBackup = () => {
    toast.success('Manual backup created successfully!');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Version History</h1>
            <p className="text-muted-foreground">
              View and restore previous versions of your site
            </p>
          </div>
          <Button onClick={handleCreateBackup}>
            <Save className="h-4 w-4" />
            Create Backup
          </Button>
        </div>

        {/* Auto-save Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Auto-save is enabled</p>
              <p className="text-sm text-blue-800 mt-1">
                Your changes are automatically saved every 5 minutes. Manual backups are kept forever.
              </p>
            </div>
          </div>
        </Card>

        {/* Version Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* Versions */}
          <div className="space-y-4">
            {versions.map((version, index) => (
              <Card
                key={version.id}
                className={`ml-16 relative ${
                  version.isCurrent ? 'border-primary border-2' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[52px] top-8 h-8 w-8 rounded-full border-4 border-background flex items-center justify-center ${
                    version.isCurrent
                      ? 'bg-primary'
                      : version.isAutoSave
                      ? 'bg-muted'
                      : 'bg-success'
                  }`}
                >
                  {version.isCurrent ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : version.isAutoSave ? (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Save className="h-4 w-4 text-white" />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{version.name}</h3>
                        {version.isCurrent && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            Current
                          </span>
                        )}
                        {version.isAutoSave && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                            Auto-save
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {version.timestamp}
                        </span>
                        <span>by {version.author}</span>
                        <span>{version.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Changes:</p>
                    <ul className="space-y-1">
                      {version.changes.map((change, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  {!version.isCurrent && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(version)}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {version.isAutoSave && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(version)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Storage Info */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Storage Usage</h3>
                <p className="text-sm text-muted-foreground">
                  {versions.length} versions • 12.1 MB total
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
                Clean Up
              </Button>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              12.1 MB of 50 MB used (24%)
            </p>
          </div>
        </Card>

        {/* Pro Feature */}
        <Card className="mt-6 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Unlimited Version History</h3>
              <p className="text-sm opacity-90">
                Upgrade to Pro for unlimited backups and 1-year retention
              </p>
            </div>
            <Button variant="secondary" size="lg">
              Upgrade
            </Button>
          </div>
        </Card>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-bold text-lg text-center mb-2">
                Restore Version?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                This will replace your current version with "{showRestoreConfirm.name}". 
                Your current version will be saved in history.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowRestoreConfirm(null)}
                >
                  Cancel
                </Button>
                <Button fullWidth onClick={confirmRestore}>
                  Restore Version
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-bold text-lg text-center mb-2">
                Delete Version?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" fullWidth onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
