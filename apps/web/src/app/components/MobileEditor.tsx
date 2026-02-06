import { useState } from 'react';
import { Button } from './Button';
import { 
  Smartphone,
  Eye,
  Rocket,
  Settings,
  Layers,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  ChevronUp,
  Save
} from 'lucide-react';

interface MobileEditorProps {
  projectId: string;
  onBack: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function MobileEditor({ projectId, onBack, onPreview, onPublish }: MobileEditorProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'components' | 'styles'>('canvas');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background md:hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <button onClick={onBack} className="text-sm font-medium">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onPreview} touchFriendly>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onPublish} touchFriendly>
            <Rocket className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div className="bg-white rounded-lg shadow-xl min-h-full">
          {/* Demo Canvas Content */}
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-3">Welcome to Your Website</h1>
              <p className="text-base text-muted-foreground mb-4">
                Start building something amazing
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
                Get Started
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded bg-primary/10 mb-3" />
                  <h3 className="font-bold mb-1">Feature {i}</h3>
                  <p className="text-sm text-muted-foreground">
                    Description of this amazing feature
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="border-t border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-around p-2">
          <button
            onClick={() => { setActiveTab('canvas'); setShowBottomSheet(false); }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg min-w-[64px] min-h-[56px] ${
              activeTab === 'canvas' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <Smartphone className="h-5 w-5" />
            <span className="text-xs font-medium">Canvas</span>
          </button>
          <button
            onClick={() => { setActiveTab('components'); setShowBottomSheet(true); }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg min-w-[64px] min-h-[56px] ${
              activeTab === 'components' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <Layers className="h-5 w-5" />
            <span className="text-xs font-medium">Add</span>
          </button>
          <button
            onClick={() => { setActiveTab('styles'); setShowBottomSheet(true); }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg min-w-[64px] min-h-[56px] ${
              activeTab === 'styles' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <Palette className="h-5 w-5" />
            <span className="text-xs font-medium">Style</span>
          </button>
          <button
            onClick={onPreview}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg min-w-[64px] min-h-[56px] text-muted-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowBottomSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl max-h-[70vh] animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-12 bg-muted rounded-full" />
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-3rem)] p-4">
              {activeTab === 'components' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Add Components</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Type, label: 'Text' },
                      { icon: ImageIcon, label: 'Image' },
                      { icon: Square, label: 'Button' },
                      { icon: Layers, label: 'Section' },
                    ].map((component) => {
                      const Icon = component.icon;
                      return (
                        <button
                          key={component.label}
                          className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors min-h-[88px]"
                          onClick={() => setShowBottomSheet(false)}
                        >
                          <Icon className="h-6 w-6 mb-2 mx-auto" />
                          <p className="text-sm font-medium">{component.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'styles' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Style Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Background Color</label>
                      <div className="flex gap-2">
                        {['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                          <button
                            key={color}
                            className="h-12 w-12 rounded-lg border-2 border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        defaultValue="16"
                        className="w-full"
                      />
                    </div>
                    <Button fullWidth onClick={() => setShowBottomSheet(false)}>
                      Apply Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Save FAB */}
      <button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white shadow-lg flex items-center justify-center z-30"
      >
        <Save className="h-6 w-6" />
      </button>
    </div>
  );
}
