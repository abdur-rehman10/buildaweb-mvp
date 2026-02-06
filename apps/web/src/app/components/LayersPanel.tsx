import { useState } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, MoreVertical } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'section' | 'container' | 'text' | 'image' | 'button';
  visible: boolean;
  locked: boolean;
  children?: Layer[];
}

interface LayersPanelProps {
  onSelectLayer: (layerId: string) => void;
}

export function LayersPanel({ onSelectLayer }: LayersPanelProps) {
  const [layers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Header',
      type: 'section',
      visible: true,
      locked: false,
      children: [
        { id: '1-1', name: 'Logo', type: 'image', visible: true, locked: false },
        { id: '1-2', name: 'Navigation', type: 'container', visible: true, locked: false },
      ],
    },
    {
      id: '2',
      name: 'Hero Section',
      type: 'section',
      visible: true,
      locked: false,
      children: [
        { id: '2-1', name: 'Hero Title', type: 'text', visible: true, locked: false },
        { id: '2-2', name: 'Hero Subtitle', type: 'text', visible: true, locked: false },
        { id: '2-3', name: 'CTA Button', type: 'button', visible: true, locked: false },
      ],
    },
    {
      id: '3',
      name: 'Footer',
      type: 'section',
      visible: true,
      locked: false,
    },
  ]);

  const [expandedLayers, setExpandedLayers] = useState<string[]>(['1', '2']);
  const [selectedLayer, setSelectedLayer] = useState<string>('2-1');

  const toggleExpand = (layerId: string) => {
    setExpandedLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const handleSelectLayer = (layerId: string) => {
    setSelectedLayer(layerId);
    onSelectLayer(layerId);
  };

  const LayerItem = ({ layer, depth = 0 }: { layer: Layer; depth?: number }) => {
    const hasChildren = layer.children && layer.children.length > 0;
    const isExpanded = expandedLayers.includes(layer.id);
    const isSelected = selectedLayer === layer.id;

    return (
      <div>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-accent ${
            isSelected ? 'bg-primary/10' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => handleSelectLayer(layer.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(layer.id);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <span className="text-xs flex-1 truncate">{layer.name}</span>
          <div className="flex items-center gap-1">
            <button className="p-0.5 hover:bg-accent rounded opacity-0 group-hover:opacity-100">
              {layer.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            {layer.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {layer.children!.map((child) => (
              <LayerItem key={child.id} layer={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Layers</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div key={layer.id} className="group">
            <LayerItem layer={layer} />
          </div>
        ))}
      </div>
    </div>
  );
}
