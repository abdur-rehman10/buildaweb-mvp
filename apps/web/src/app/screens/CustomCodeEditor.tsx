import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Code, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface CustomCodeEditorProps {
  projectId: string;
  onBack: () => void;
}

export function CustomCodeEditor({ projectId, onBack }: CustomCodeEditorProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [code, setCode] = useState({
    html: '<!-- Add custom HTML here -->\n<div class="custom-section">\n  <h2>Custom Section</h2>\n  <p>Your content here</p>\n</div>',
    css: '/* Add custom CSS here */\n.custom-section {\n  padding: 2rem;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 12px;\n  color: white;\n}\n\n.custom-section h2 {\n  font-size: 2rem;\n  margin-bottom: 1rem;\n}',
    js: '// Add custom JavaScript here\nconsole.log("Custom code loaded");\n\n// Example: Add click event\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Page loaded successfully");\n});',
  });

  const [injectionLocation, setInjectionLocation] = useState({
    html: 'before-closing-body',
    css: 'head',
    js: 'before-closing-body',
  });

  const handleSave = () => {
    toast.success('Custom code saved successfully');
  };

  const handleReset = () => {
    setCode({
      html: '',
      css: '',
      js: '',
    });
    toast.success('Code reset to default');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Custom Code Editor</h1>
                  <p className="text-sm text-muted-foreground">Inject HTML, CSS, and JavaScript</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" />
                Save Code
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Advanced Feature:</strong> Add custom HTML, CSS, and JavaScript code to your site. This code will be injected at the specified location.
          </p>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'css'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'js'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            JavaScript
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Injection Location</label>
                <select
                  value={injectionLocation[activeTab]}
                  onChange={(e) =>
                    setInjectionLocation({ ...injectionLocation, [activeTab]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {activeTab === 'html' && (
                    <>
                      <option value="before-closing-head">Before closing &lt;/head&gt;</option>
                      <option value="after-opening-body">After opening &lt;body&gt;</option>
                      <option value="before-closing-body">Before closing &lt;/body&gt;</option>
                    </>
                  )}
                  {activeTab === 'css' && (
                    <>
                      <option value="head">In &lt;head&gt; section</option>
                      <option value="inline">Inline styles</option>
                    </>
                  )}
                  {activeTab === 'js' && (
                    <>
                      <option value="before-closing-head">Before closing &lt;/head&gt;</option>
                      <option value="before-closing-body">Before closing &lt;/body&gt;</option>
                      <option value="defer">With defer attribute</option>
                      <option value="async">With async attribute</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {activeTab.toUpperCase()} Code
                </label>
                <textarea
                  value={code[activeTab]}
                  onChange={(e) => setCode({ ...code, [activeTab]: e.target.value })}
                  rows={20}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-muted font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  spellCheck={false}
                />
              </div>
            </Card>
          </div>

          {/* Settings & Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  <div>
                    <div className="font-medium">Enable Custom Code</div>
                    <div className="text-xs text-muted-foreground">Apply code to site</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Minify Code</div>
                    <div className="text-xs text-muted-foreground">Compress for production</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Apply to All Pages</div>
                    <div className="text-xs text-muted-foreground">Global injection</div>
                  </div>
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Code Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">HTML Lines</span>
                  <span className="font-mono text-sm">{code.html.split('\n').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CSS Lines</span>
                  <span className="font-mono text-sm">{code.css.split('\n').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">JS Lines</span>
                  <span className="font-mono text-sm">{code.js.split('\n').length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Custom code can affect site performance and security. Test thoroughly before publishing.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
