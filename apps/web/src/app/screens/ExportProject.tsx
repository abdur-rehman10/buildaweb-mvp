import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Download, FileCode, Image, Palette, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExportProjectProps {
  projectId: string;
  projectName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function ExportProject({ projectId, projectName, onComplete, onCancel }: ExportProjectProps) {
  const [exportOptions, setExportOptions] = useState({
    includeHTML: true,
    includeCSS: true,
    includeJS: true,
    includeImages: true,
    includeFonts: true,
    minifyCode: false,
    includeSourceMaps: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExporting(false);
          toast.success('Project exported successfully');
          onComplete();
        }, 500);
      }
    }, 300);
  };

  const estimatedSize = () => {
    let size = 0;
    if (exportOptions.includeHTML) size += 0.5;
    if (exportOptions.includeCSS) size += 0.3;
    if (exportOptions.includeJS) size += 0.8;
    if (exportOptions.includeImages) size += 12.5;
    if (exportOptions.includeFonts) size += 2.1;
    return size.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Export Project</h1>
            <p className="text-muted-foreground">Download {projectName}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">Include Files</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent">
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">HTML Files</div>
                    <div className="text-xs text-muted-foreground">All page structures</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeHTML}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeHTML: e.target.checked })}
                  className="h-5 w-5"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">CSS Styles</div>
                    <div className="text-xs text-muted-foreground">All stylesheets</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeCSS}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeCSS: e.target.checked })}
                  className="h-5 w-5"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent">
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">JavaScript</div>
                    <div className="text-xs text-muted-foreground">All scripts</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeJS}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeJS: e.target.checked })}
                  className="h-5 w-5"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Images & Media</div>
                    <div className="text-xs text-muted-foreground">All uploaded files</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeImages}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeImages: e.target.checked })}
                  className="h-5 w-5"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.minifyCode}
                  onChange={(e) => setExportOptions({ ...exportOptions, minifyCode: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">Minify Code</div>
                  <div className="text-xs text-muted-foreground">Compress files for smaller size</div>
                </div>
              </label>
            </div>
          </div>

          <Card className="p-4 bg-muted">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estimated Size</span>
              <span className="text-lg font-bold">{estimatedSize()} MB</span>
            </div>
          </Card>

          {isExporting && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1" disabled={isExporting}>
              <Download className="h-5 w-5" />
              {isExporting ? 'Exporting...' : 'Export as ZIP'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
