import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Upload, File, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImportProjectProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ImportProject({ onComplete, onCancel }: ImportProjectProps) {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
      setProjectName(selectedFile.name.replace(/\.(zip|html)$/, ''));
    }
  };

  const handleImport = () => {
    if (!file || !projectName) return;
    
    setIsUploading(true);
    // Simulate upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          toast.success('Project imported successfully');
          onComplete();
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Import Project</h1>
            <p className="text-muted-foreground">Upload an existing website</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload File</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept=".zip,.html"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="p-1 hover:bg-accent rounded-md"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports ZIP files or HTML files (Max 100MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {file && (
            <>
              <Input
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />

              {isUploading && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Supported formats:</strong> ZIP archives containing HTML/CSS/JS files, or single HTML files.
            </p>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              className="flex-1"
              disabled={!file || !projectName || isUploading}
            >
              {isUploading ? 'Importing...' : 'Import Project'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
