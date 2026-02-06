import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LayersPanel } from '../components/LayersPanel';
import { StyleInspector } from '../components/StyleInspector';
import { KeyboardShortcuts } from '../components/KeyboardShortcuts';
import { 
  Undo, 
  Redo, 
  Eye, 
  Smartphone, 
  Tablet, 
  Monitor,
  Rocket,
  Save,
  Grid3x3,
  Ruler,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Image,
  Type,
  Square,
  Circle,
  MousePointer,
  Hand,
  Users,
  CheckCircle,
  Settings,
  Code,
  Layout
} from 'lucide-react';
import { toast } from 'sonner';

interface EditorProps {
  projectId: string;
  onNavigateTo: (screen: string) => void;
  onBack: () => void;
}

type Breakpoint = 'desktop' | 'tablet' | 'mobile';
type Tool = 'select' | 'hand' | 'text' | 'shape' | 'image';

export function Editor({ projectId, onNavigateTo, onBack }: EditorProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<Tool>('select');
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [lastSaved, setLastSaved] = useState('Just now');
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);

  // Simulate autosave
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved('Just now');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts with ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Zoom
      if ((e.metaKey || e.ctrlKey) && e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleUndo = () => {
    if (canUndo) {
      toast.success('Undo');
      setCanRedo(true);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      toast.success('Redo');
    }
  };

  const handleSave = () => {
    setLastSaved('Saving...');
    setTimeout(() => {
      setLastSaved('Just now');
      toast.success('Changes saved');
    }, 500);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 25));
  };

  const getCanvasWidth = () => {
    switch (breakpoint) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Section - Breakpoint Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setBreakpoint('desktop')}
            className={`p-2 rounded transition-colors ${
              breakpoint === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setBreakpoint('tablet')}
            className={`p-2 rounded transition-colors ${
              breakpoint === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setBreakpoint('mobile')}
            className={`p-2 rounded transition-colors ${
              breakpoint === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onNavigateTo('preview-publish')}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={() => onNavigateTo('preview-publish')}>
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        {showLeftPanel && (
          <div className="w-64 border-r border-border bg-card flex flex-col">
            <div className="p-3 border-b border-border">
              <h3 className="font-bold text-sm">Components</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <button className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span className="text-sm font-medium">Section</span>
                </div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="text-sm font-medium">Text</span>
                </div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="text-sm font-medium">Image</span>
                </div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  <span className="text-sm font-medium">Button</span>
                </div>
              </button>
            </div>
            {/* Layers Panel */}
            <div className="h-64 border-t border-border">
              <LayersPanel onSelectLayer={(id) => console.log('Selected:', id)} />
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col bg-muted/30">
          {/* Tool Bar */}
          <div className="h-12 border-b border-border bg-card flex items-center justify-center gap-2 px-4">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setTool('select')}
                className={`p-1.5 rounded transition-colors ${
                  tool === 'select' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
                title="Select (V)"
              >
                <MousePointer className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTool('hand')}
                className={`p-1.5 rounded transition-colors ${
                  tool === 'hand' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
                title="Hand (H)"
              >
                <Hand className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-8">
            <div
              className="mx-auto bg-white shadow-2xl rounded-lg overflow-hidden transition-all"
              style={{
                width: getCanvasWidth(),
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Demo Canvas Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4">Welcome to Your Website</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Start building something amazing
                  </p>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                    Get Started
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 border border-border rounded-lg">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 mb-4" />
                      <h3 className="font-bold mb-2">Feature {i}</h3>
                      <p className="text-sm text-muted-foreground">
                        Description of this amazing feature
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Style Inspector */}
        {showRightPanel && (
          <div className="w-64">
            <StyleInspector />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-10 border-t border-border bg-card flex items-center justify-between px-4 text-sm">
        {/* Left - Autosave Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-success" />
            <span className="text-xs">Saved {lastSaved}</span>
          </div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors ${
              showGrid ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            <span className="text-xs">Grid</span>
          </button>
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors ${
              showRulers ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Ruler className="h-3.5 w-3.5" />
            <span className="text-xs">Rulers</span>
          </button>
        </div>

        {/* Center - Collaborators */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
              <Users className="h-3 w-3 text-primary" />
            </div>
            <div className="h-6 w-6 rounded-full bg-cyan-500/10 border-2 border-background flex items-center justify-center text-[10px] font-medium">
              JD
            </div>
          </div>
          <span className="text-xs text-muted-foreground">2 editing</span>
        </div>

        {/* Right - Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Zoom out (⌘-)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-1 hover:bg-accent rounded transition-colors text-xs min-w-[60px] text-center"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Zoom in (⌘+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button
            onClick={() => setZoom(100)}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Fit to screen (⌘0)"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Hint */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">?</kbd> for keyboard shortcuts
      </div>
    </div>
  );
}
