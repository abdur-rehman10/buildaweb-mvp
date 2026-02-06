import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { LayoutTemplate, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SaveAsTemplateProps {
  projectId: string;
  projectName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function SaveAsTemplate({ projectId, projectName, onComplete, onCancel }: SaveAsTemplateProps) {
  const [templateData, setTemplateData] = useState({
    name: `${projectName} Template`,
    description: '',
    category: 'portfolio',
    isPublic: false,
  });

  const handleSave = () => {
    toast.success('Template saved successfully');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutTemplate className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Save as Template</h1>
            <p className="text-muted-foreground">Reuse this project as a starting point</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <Input
            label="Template Name"
            value={templateData.name}
            onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe your template..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={templateData.category}
              onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="portfolio">Portfolio</option>
              <option value="business">Business</option>
              <option value="ecommerce">E-commerce</option>
              <option value="blog">Blog</option>
              <option value="landing">Landing Page</option>
              <option value="other">Other</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={templateData.isPublic}
              onChange={(e) => setTemplateData({ ...templateData, isPublic: e.target.checked })}
              className="h-4 w-4"
            />
            <div>
              <div className="font-medium">Make template public</div>
              <div className="text-xs text-muted-foreground">Allow others to use this template</div>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-5 w-5" />
            Save Template
          </Button>
        </div>
      </Card>
    </div>
  );
}
