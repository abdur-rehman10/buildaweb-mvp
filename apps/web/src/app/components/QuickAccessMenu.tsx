import { useState } from 'react';
import { Plus, Zap, FileText, Image, Code, Rocket, X } from 'lucide-react';
import { Button } from './Button';

interface QuickAccessMenuProps {
  onAction: (action: string) => void;
}

export function QuickAccessMenu({ onAction }: QuickAccessMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'new-project', label: 'New Project', icon: FileText, color: 'bg-primary' },
    { id: 'templates', label: 'Browse Templates', icon: Zap, color: 'bg-cyan-500' },
    { id: 'media-library', label: 'Upload Media', icon: Image, color: 'bg-purple-500' },
    { id: 'custom-code-editor', label: 'Custom Code', icon: Code, color: 'bg-orange-500' },
  ];

  return (
    <>
      {/* Quick Actions Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-card border border-border rounded-lg shadow-2xl p-2 space-y-1">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onAction(action.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all ${
          isOpen
            ? 'bg-destructive hover:bg-destructive/90 rotate-45'
            : 'bg-gradient-to-br from-primary to-cyan-500 hover:shadow-xl hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
}
