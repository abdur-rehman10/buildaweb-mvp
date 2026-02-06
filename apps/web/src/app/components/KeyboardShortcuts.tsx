import { Card } from './Card';
import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'General', items: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['⌘', 'S'], description: 'Save' },
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', 'Z'], description: 'Undo' },
      { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
    ]},
    { category: 'Navigation', items: [
      { keys: ['⌘', '1'], description: 'Dashboard' },
      { keys: ['⌘', '2'], description: 'Projects' },
      { keys: ['⌘', 'P'], description: 'Preview' },
      { keys: ['Esc'], description: 'Close panel' },
    ]},
    { category: 'Editing', items: [
      { keys: ['⌘', 'C'], description: 'Copy' },
      { keys: ['⌘', 'V'], description: 'Paste' },
      { keys: ['⌘', 'D'], description: 'Duplicate' },
      { keys: ['Delete'], description: 'Delete' },
      { keys: ['⌘', 'G'], description: 'Group' },
    ]},
    { category: 'View', items: [
      { keys: ['⌘', '+'], description: 'Zoom in' },
      { keys: ['⌘', '-'], description: 'Zoom out' },
      { keys: ['⌘', '0'], description: 'Zoom to fit' },
      { keys: ['⌘', '\\'], description: 'Toggle sidebar' },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                  {section.category}
                </h3>
                <div className="space-y-3">
                  {section.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
