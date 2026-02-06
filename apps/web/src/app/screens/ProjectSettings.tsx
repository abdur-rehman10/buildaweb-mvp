import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Settings, Trash2, Copy, Download, Archive, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectSettingsProps {
  projectId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function ProjectSettings({ projectId, onBack, onDelete }: ProjectSettingsProps) {
  const [settings, setSettings] = useState({
    projectName: 'My Portfolio',
    description: 'Personal portfolio website',
    url: 'portfolio',
    customDomain: '',
    visibility: 'public',
    password: '',
    enableAnalytics: true,
    enableComments: false,
    enableForms: true,
    seoIndexing: true,
  });

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const handleSave = () => {
    toast.success('Project settings saved');
  };

  const handleDuplicate = () => {
    toast.success('Project duplicated successfully');
  };

  const handleArchive = () => {
    toast.success('Project archived');
    setArchiveConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Project Settings</h1>
                  <p className="text-sm text-muted-foreground">
                    Configure your project
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* General Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">General</h2>
          <div className="space-y-4">
            <Input
              label="Project Name"
              value={settings.projectName}
              onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </Card>

        {/* Domain & URL */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain & URL
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subdomain</label>
              <div className="flex gap-2">
                <Input
                  value={settings.url}
                  onChange={(e) => setSettings({ ...settings, url: e.target.value })}
                  className="flex-1"
                />
                <span className="flex items-center text-muted-foreground">.buildaweb.app</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                https://{settings.url}.buildaweb.app
              </p>
            </div>
            <Input
              label="Custom Domain (Pro)"
              placeholder="www.example.com"
              value={settings.customDomain}
              onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
              helperText="Connect your own domain name"
            />
          </div>
        </Card>

        {/* Privacy & Access */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Privacy & Access
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={settings.visibility === 'public'}
                    onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                  />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">Anyone can view this site</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="password"
                    checked={settings.visibility === 'password'}
                    onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                  />
                  <div>
                    <div className="font-medium">Password Protected</div>
                    <div className="text-xs text-muted-foreground">Requires password to view</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={settings.visibility === 'private'}
                    onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                  />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-muted-foreground">Only you can view</div>
                  </div>
                </label>
              </div>
            </div>
            {settings.visibility === 'password' && (
              <Input
                label="Site Password"
                type="password"
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                helperText="Visitors will need this password to view your site"
              />
            )}
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Features</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Track visitor data</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableAnalytics}
                onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Comments</div>
                <div className="text-xs text-muted-foreground">Allow visitor comments</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableComments}
                onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Forms</div>
                <div className="text-xs text-muted-foreground">Enable form submissions</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableForms}
                onChange={(e) => setSettings({ ...settings, enableForms: e.target.checked })}
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">SEO Indexing</div>
                <div className="text-xs text-muted-foreground">Allow search engines to index</div>
              </div>
              <input
                type="checkbox"
                checked={settings.seoIndexing}
                onChange={(e) => setSettings({ ...settings, seoIndexing: e.target.checked })}
                className="h-5 w-5"
              />
            </label>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h2 className="text-lg font-bold mb-4 text-destructive">Danger Zone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Duplicate Project</div>
                <div className="text-xs text-muted-foreground">Create a copy of this project</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Download Project</div>
                <div className="text-xs text-muted-foreground">Export as ZIP file</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Archive Project</div>
                <div className="text-xs text-muted-foreground">Hide from main list</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiveConfirm(true)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
              <div>
                <div className="font-medium text-destructive">Delete Project</div>
                <div className="text-xs text-muted-foreground">Permanently delete this project</div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will move it to trash where it can be recovered for 30 days."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          onDelete();
          setDeleteConfirm(false);
        }}
        onClose={() => setDeleteConfirm(false)}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        isOpen={archiveConfirm}
        title="Archive Project"
        description="This project will be hidden from your main dashboard. You can restore it anytime from the archived projects section."
        confirmLabel="Archive"
        variant="warning"
        onConfirm={handleArchive}
        onClose={() => setArchiveConfirm(false)}
      />
    </div>
  );
}
