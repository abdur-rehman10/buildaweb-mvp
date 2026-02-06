import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Upload,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  X,
  Trash2,
  Download,
  ExternalLink,
  FileImage
} from 'lucide-react';

interface MediaLibraryProps {
  projectId: string;
  onBack: () => void;
}

interface Media {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
  uploadedAt: string;
  type: 'image';
}

export function MediaLibrary({ projectId, onBack }: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [media] = useState<Media[]>([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      size: '245 KB',
      dimensions: '1920 × 1080',
      uploadedAt: '2 days ago',
      type: 'image',
    },
    {
      id: '2',
      name: 'team-photo.jpg',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      size: '189 KB',
      dimensions: '1600 × 900',
      uploadedAt: '5 days ago',
      type: 'image',
    },
    {
      id: '3',
      name: 'product-1.jpg',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      size: '156 KB',
      dimensions: '1200 × 800',
      uploadedAt: '1 week ago',
      type: 'image',
    },
    {
      id: '4',
      name: 'office.jpg',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      size: '312 KB',
      dimensions: '1920 × 1280',
      uploadedAt: '1 week ago',
      type: 'image',
    },
    {
      id: '5',
      name: 'background.jpg',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      size: '421 KB',
      dimensions: '2400 × 1600',
      uploadedAt: '2 weeks ago',
      type: 'image',
    },
    {
      id: '6',
      name: 'testimonial-bg.jpg',
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
      size: '278 KB',
      dimensions: '1600 × 1067',
      uploadedAt: '2 weeks ago',
      type: 'image',
    },
  ]);

  const handleUpload = () => {
    toast.success('File uploaded successfully!');
  };

  const handleDelete = (id: string) => {
    toast.success('File deleted successfully!');
    setSelectedMedia(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Media Library</h1>
            <p className="text-muted-foreground">Upload and manage your images</p>
          </div>
          <Button size="lg" onClick={handleUpload}>
            <Upload className="h-5 w-5" />
            Upload Files
          </Button>
        </div>

        {/* Toolbar */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-9 pr-3 h-10 rounded-md border border-input bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select className="px-3 h-10 rounded-md border border-input bg-background">
                <option>All Files</option>
                <option>Images</option>
                <option>Videos</option>
              </select>
              <div className="h-6 w-px bg-border" />
              <div className="flex gap-1 border border-border rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-6">
          {/* Media Grid/List */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="divide-y divide-border">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center gap-4 hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.dimensions} • {item.size}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.uploadedAt}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Details Panel */}
          {selectedMedia && (
            <div className="w-80 flex-shrink-0">
              <Card>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold">File Details</h3>
                  <button onClick={() => setSelectedMedia(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">File Name</label>
                      <p className="text-sm break-all">{selectedMedia.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Dimensions</label>
                      <p className="text-sm">{selectedMedia.dimensions}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">File Size</label>
                      <p className="text-sm">{selectedMedia.size}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Uploaded</label>
                      <p className="text-sm">{selectedMedia.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button variant="outline" fullWidth size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" fullWidth size="sm">
                      <ExternalLink className="h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button variant="outline" fullWidth size="sm">
                      <FileImage className="h-4 w-4" />
                      Replace
                    </Button>
                    <Button 
                      variant="destructive" 
                      fullWidth 
                      size="sm"
                      onClick={() => handleDelete(selectedMedia.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
