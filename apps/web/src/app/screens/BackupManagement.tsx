import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Database, Plus, Download, RotateCcw, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BackupManagementProps {
  projectId: string;
  onBack: () => void;
  onRestore: (backupId: string) => void;
}

interface Backup {
  id: string;
  name: string;
  created: string;
  size: string;
  type: 'manual' | 'auto';
  pages: number;
  status: 'complete' | 'in-progress';
}

export function BackupManagement({ projectId, onBack, onRestore }: BackupManagementProps) {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Manual Backup - Pre Launch',
      created: 'Feb 6, 2026 10:30 AM',
      size: '12.5 MB',
      type: 'manual',
      pages: 8,
      status: 'complete',
    },
    {
      id: '2',
      name: 'Auto Backup - Daily',
      created: 'Feb 5, 2026 11:00 PM',
      size: '11.8 MB',
      type: 'auto',
      pages: 8,
      status: 'complete',
    },
    {
      id: '3',
      name: 'Manual Backup - Design Update',
      created: 'Feb 3, 2026 3:45 PM',
      size: '10.2 MB',
      type: 'manual',
      pages: 7,
      status: 'complete',
    },
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        created: 'Just now',
        size: '12.8 MB',
        type: 'manual',
        pages: 8,
        status: 'complete',
      };
      setBackups([newBackup, ...backups]);
      setIsCreatingBackup(false);
      toast.success('Backup created successfully');
    }, 2000);
  };

  const handleDownload = (backup: Backup) => {
    toast.success(`Downloading ${backup.name}`);
  };

  const handleDelete = (id: string) => {
    setBackups(backups.filter((b) => b.id !== id));
    toast.success('Backup deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Backup Management</h1>
                  <p className="text-sm text-muted-foreground">{backups.length} backups available</p>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
              <Plus className="h-5 w-5" />
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4">Auto Backup Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Enable Auto Backups</div>
                <div className="text-xs text-muted-foreground">Automatic daily backups</div>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Backup Frequency</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-input-background">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Retention Period</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-input-background">
                <option>Keep last 7 backups</option>
                <option>Keep last 14 backups</option>
                <option>Keep last 30 backups</option>
                <option>Keep all backups</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {backups.map((backup) => (
            <Card key={backup.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{backup.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        backup.type === 'manual'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {backup.type}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {backup.created}
                    </div>
                    <span>{backup.size}</span>
                    <span>{backup.pages} pages</span>
                  </div>
                  {backup.status === 'in-progress' && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-2/3 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(backup)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(backup.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(backup.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
