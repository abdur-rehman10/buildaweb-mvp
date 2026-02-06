import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Palette, Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DesignSystemLibraryProps {
  onBack: () => void;
}

export function DesignSystemLibrary({ onBack }: DesignSystemLibraryProps) {
  const [styles] = useState([
    {
      id: '1',
      name: 'Primary Colors',
      type: 'colors',
      values: ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'],
    },
    {
      id: '2',
      name: 'Typography Scale',
      type: 'typography',
      values: ['64px', '48px', '32px', '24px', '16px'],
    },
    {
      id: '3',
      name: 'Spacing',
      type: 'spacing',
      values: ['4px', '8px', '16px', '24px', '32px', '64px'],
    },
    {
      id: '4',
      name: 'Border Radius',
      type: 'borders',
      values: ['4px', '8px', '12px', '16px', '24px'],
    },
  ]);

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
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Design System</h1>
                  <p className="text-sm text-muted-foreground">Manage your styles</p>
                </div>
              </div>
            </div>
            <Button>
              <Plus className="h-5 w-5" />
              Add Style
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {styles.map((style) => (
          <Card key={style.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{style.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{style.type}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success('Copied to clipboard')}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {style.type === 'colors' && style.values.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="h-16 w-16 rounded-lg border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono">{color}</span>
                </div>
              ))}
              {style.type === 'typography' && style.values.map((size, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div style={{ fontSize: size }} className="font-bold">Aa</div>
                  <span className="text-xs text-muted-foreground">{size}</span>
                </div>
              ))}
              {style.type === 'spacing' && style.values.map((space, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-12 bg-primary/20 rounded" style={{ width: space }} />
                  <span className="text-xs">{space}</span>
                </div>
              ))}
              {style.type === 'borders' && style.values.map((radius, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 bg-primary/20" style={{ borderRadius: radius }} />
                  <span className="text-xs">{radius}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
