import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Link2, Copy, Eye, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareProjectLinkProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function ShareProjectLink({ projectId, projectName, onClose }: ShareProjectLinkProps) {
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    requirePassword: false,
    password: '',
    allowComments: true,
    showBranding: true,
  });

  const shareUrl = `https://buildaweb.app/preview/${projectId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const handleTogglePublic = () => {
    setShareSettings({ ...shareSettings, isPublic: !shareSettings.isPublic });
    if (!shareSettings.isPublic) {
      toast.success('Public sharing enabled');
    } else {
      toast.success('Public sharing disabled');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Share Project</h1>
            <p className="text-muted-foreground">{projectName}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Public Sharing Toggle */}
          <Card className={`p-4 border-2 ${shareSettings.isPublic ? 'border-success bg-success/5' : 'border-border'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  shareSettings.isPublic ? 'bg-success/10' : 'bg-muted'
                }`}>
                  {shareSettings.isPublic ? (
                    <Eye className="h-5 w-5 text-success" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold">
                    {shareSettings.isPublic ? 'Public Sharing On' : 'Public Sharing Off'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shareSettings.isPublic
                      ? 'Anyone with the link can view'
                      : 'Only you can access this project'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={shareSettings.isPublic}
                onChange={handleTogglePublic}
                className="h-6 w-6"
              />
            </label>
          </Card>

          {shareSettings.isPublic && (
            <>
              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium mb-2">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Password Protection */}
              <div>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSettings.requirePassword}
                    onChange={(e) =>
                      setShareSettings({ ...shareSettings, requirePassword: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">Require Password</div>
                    <div className="text-xs text-muted-foreground">
                      Visitors need a password to view
                    </div>
                  </div>
                </label>
                {shareSettings.requirePassword && (
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={shareSettings.password}
                    onChange={(e) =>
                      setShareSettings({ ...shareSettings, password: e.target.value })
                    }
                  />
                )}
              </div>

              {/* Additional Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSettings.allowComments}
                    onChange={(e) =>
                      setShareSettings({ ...shareSettings, allowComments: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">Allow Comments</div>
                    <div className="text-xs text-muted-foreground">
                      Visitors can leave feedback
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSettings.showBranding}
                    onChange={(e) =>
                      setShareSettings({ ...shareSettings, showBranding: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium">Show Buildaweb Branding</div>
                    <div className="text-xs text-muted-foreground">
                      Display "Made with Buildaweb" badge
                    </div>
                  </div>
                </label>
              </div>

              {/* Preview */}
              <Card className="p-4 bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">Preview Settings</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visibility: Public</li>
                  <li>• Password: {shareSettings.requirePassword ? 'Required' : 'Not required'}</li>
                  <li>• Comments: {shareSettings.allowComments ? 'Enabled' : 'Disabled'}</li>
                  <li>• Branding: {shareSettings.showBranding ? 'Visible' : 'Hidden'}</li>
                </ul>
              </Card>
            </>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={onClose} className="flex-1">
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
