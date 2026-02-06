import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Folder, Plus, MoreVertical, Edit2, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectFolder {
  id: string;
  name: string;
  projectCount: number;
  color: string;
}

interface ProjectFoldersProps {
  onBack: () => void;
}

export function ProjectFolders({ onBack }: ProjectFoldersProps) {
  const [folders, setFolders] = useState<ProjectFolder[]>([
    { id: '1', name: 'Client Work', projectCount: 5, color: '#8B5CF6' },
    { id: '2', name: 'Personal', projectCount: 3, color: '#06B6D4' },
    { id: '3', name: 'Templates', projectCount: 8, color: '#EC4899' },
  ]);

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: ProjectFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      projectCount: 0,
      color: '#10B981',
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowNewFolder(false);
    toast.success('Folder created');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Project Folders</h1>
                  <p className="text-sm text-muted-foreground">Organize your projects</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowNewFolder(true)}>
              <Plus className="h-5 w-5" />
              New Folder
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showNewFolder && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Create New Folder</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button variant="outline" onClick={() => setShowNewFolder(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card key={folder.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <Folder className="h-6 w-6" style={{ color: folder.color }} />
                </div>
                <button className="p-1 hover:bg-accent rounded-md">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-1">{folder.name}</h3>
              <p className="text-sm text-muted-foreground">
                {folder.projectCount} projects
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
