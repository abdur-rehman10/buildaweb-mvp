import { Input } from './Input';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function StyleInspector() {
  const [expandedSections, setExpandedSections] = useState(['layout', 'typography']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const isExpanded = expandedSections.includes(title.toLowerCase().replace(' ', '-'));
    const sectionId = title.toLowerCase().replace(' ', '-');

    return (
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between p-3 hover:bg-accent"
        >
          <span className="font-medium text-sm">{title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
          />
        </button>
        {isExpanded && <div className="p-3 space-y-3">{children}</div>}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-3 border-b border-border">
        <h3 className="font-bold text-sm">Style Inspector</h3>
        <p className="text-xs text-muted-foreground">Hero Title selected</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Section title="Layout">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Width" defaultValue="100%" size="sm" />
            <Input label="Height" defaultValue="auto" size="sm" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Input label="Top" defaultValue="0" size="sm" />
            <Input label="Right" defaultValue="0" size="sm" />
            <Input label="Bottom" defaultValue="0" size="sm" />
            <Input label="Left" defaultValue="0" size="sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Display</label>
            <select className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background">
              <option>Block</option>
              <option>Flex</option>
              <option>Grid</option>
              <option>Inline</option>
            </select>
          </div>
        </Section>

        <Section title="Typography">
          <div>
            <label className="text-xs font-medium mb-1 block">Font Family</label>
            <select className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background">
              <option>Inter</option>
              <option>Helvetica</option>
              <option>Arial</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Size" defaultValue="48px" size="sm" />
            <Input label="Weight" defaultValue="700" size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Line Height" defaultValue="1.2" size="sm" />
            <Input label="Letter Spacing" defaultValue="0" size="sm" />
          </div>
        </Section>

        <Section title="Colors">
          <div>
            <label className="text-xs font-medium mb-1 block">Text Color</label>
            <div className="flex gap-2">
              <input type="color" defaultValue="#000000" className="h-8 w-12 rounded border border-input" />
              <Input defaultValue="#000000" size="sm" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Background</label>
            <div className="flex gap-2">
              <input type="color" defaultValue="#ffffff" className="h-8 w-12 rounded border border-input" />
              <Input defaultValue="#ffffff" size="sm" className="flex-1" />
            </div>
          </div>
        </Section>

        <Section title="Border">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Width" defaultValue="0px" size="sm" />
            <Input label="Radius" defaultValue="0px" size="sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Style</label>
            <select className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background">
              <option>None</option>
              <option>Solid</option>
              <option>Dashed</option>
              <option>Dotted</option>
            </select>
          </div>
        </Section>

        <Section title="Effects">
          <div>
            <label className="text-xs font-medium mb-1 block">Box Shadow</label>
            <Input defaultValue="0 1px 3px rgba(0,0,0,0.1)" size="sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Opacity</label>
            <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
          </div>
        </Section>
      </div>
    </div>
  );
}
