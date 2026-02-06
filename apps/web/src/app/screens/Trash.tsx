import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Trash2, RotateCcw, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DeletedProject {
  id: string;
  name: string;
  deletedDate: string;
  expiryDate: string;
  daysRemaining: number;
  thumbnail?: string;
}

interface TrashProps {
  onBack: () => void;
  onRestore: (projectId: string) => void;
}

export function Trash({ onBack, onRestore }: TrashProps) {
  const [deletedProjects, setDeletedProjects] = useState<DeletedProject[]>([
    {
      id: '1',
      name: 'Old Portfolio',
      deletedDate: 'Feb 1, 2026',
      expiryDate: 'Mar 3, 2026',
      daysRemaining: 25,
    },
    {
      id: '2',
      name: 'Test Landing Page',
      deletedDate: 'Jan 15, 2026',
      expiryDate: 'Feb 14, 2026',
      daysRemaining: 8,
    },
    {
      id: '3',
      name: 'Blog Prototype',
      deletedDate: 'Jan 28, 2026',
      expiryDate: 'Feb 27, 2026',
      daysRemaining: 21,
    },
  ]);

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'restore' | 'delete' | 'empty';
    projectId?: string;
  }>({
    isOpen: false,
    type: 'restore',
  });

  const handleSelect = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === deletedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(deletedProjects.map((p) => p.id));
    }
  };

  const handleRestore = (projectId: string) => {
    setDeletedProjects(deletedProjects.filter((p) => p.id !== projectId));
    setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    onRestore(projectId);
    toast.success('Project restored successfully');
    setConfirmDialog({ isOpen: false, type: 'restore' });
  };

  const handlePermanentDelete = (projectId: string) => {
    setDeletedProjects(deletedProjects.filter((p) => p.id !== projectId));
    setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    toast.success('Project permanently deleted');
    setConfirmDialog({ isOpen: false, type: 'delete' });
  };

  const handleEmptyTrash = () => {
    setDeletedProjects([]);
    setSelectedProjects([]);
    toast.success('Trash emptied');
    setConfirmDialog({ isOpen: false, type: 'empty' });
  };

  const handleRestoreSelected = () => {
    selectedProjects.forEach((id) => {
      handleRestore(id);
    });
  };

  const handleDeleteSelected = () => {
    setDeletedProjects(deletedProjects.filter((p) => !selectedProjects.includes(p.id)));
    setSelectedProjects([]);
    toast.success(`${selectedProjects.length} projects permanently deleted`);
  };

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-destructive';
    if (days <= 14) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Trash</h1>
                  <p className="text-sm text-muted-foreground">
                    {deletedProjects.length} deleted projects
                  </p>
                </div>
              </div>
            </div>
            {deletedProjects.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDialog({ isOpen: true, type: 'empty' })}
              >
                <Trash2 className="h-4 w-4" />
                Empty Trash
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                30-Day Recovery Period
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Deleted projects are kept for 30 days before being permanently removed. You can restore them anytime within this period.
              </p>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedProjects.length > 0 && (
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRestoreSelected}>
                  <RotateCcw className="h-4 w-4" />
                  Restore Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })}
                >
                  <X className="h-4 w-4" />
                  Delete Forever
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Project List */}
        {deletedProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <Trash2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold text-lg mb-2">Trash is Empty</h3>
            <p className="text-muted-foreground">
              Deleted projects will appear here
            </p>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProjects.length === deletedProjects.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <span className="text-sm">Select all</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {deletedProjects.map((project) => (
                <Card key={project.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelect(project.id)}
                      className="h-5 w-5"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Deleted: {project.deletedDate}</span>
                        <span className={getDaysColor(project.daysRemaining)}>
                          {project.daysRemaining} days remaining
                        </span>
                      </div>
                      {project.daysRemaining <= 7 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Will be permanently deleted on {project.expiryDate}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({ isOpen: true, type: 'restore', projectId: project.id })
                        }
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({ isOpen: true, type: 'delete', projectId: project.id })
                        }
                      >
                        <X className="h-4 w-4" />
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'restore'}
        title="Restore Project"
        description="This project will be restored to your dashboard."
        confirmLabel="Restore"
        variant="info"
        onConfirm={() => {
          if (confirmDialog.projectId) {
            handleRestore(confirmDialog.projectId);
          }
        }}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'restore' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        title="Delete Permanently"
        description={
          confirmDialog.projectId
            ? 'This project will be permanently deleted and cannot be recovered.'
            : `${selectedProjects.length} projects will be permanently deleted and cannot be recovered.`
        }
        confirmLabel="Delete Forever"
        variant="danger"
        onConfirm={() => {
          if (confirmDialog.projectId) {
            handlePermanentDelete(confirmDialog.projectId);
          } else {
            handleDeleteSelected();
          }
        }}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'delete' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'empty'}
        title="Empty Trash"
        description="All deleted projects will be permanently removed and cannot be recovered. This action cannot be undone."
        confirmLabel="Empty Trash"
        variant="danger"
        onConfirm={handleEmptyTrash}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'empty' })}
      />
    </div>
  );
}
