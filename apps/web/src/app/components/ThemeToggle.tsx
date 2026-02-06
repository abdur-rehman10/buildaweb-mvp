import { useTheme } from './ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Toggle theme"
        className="relative"
      >
        <Icon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-12 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-lg py-1">
            {themes.map((themeOption) => {
              const ThemeIcon = themeOption.icon;
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 ${
                    theme === themeOption.value ? 'bg-accent' : ''
                  }`}
                >
                  <ThemeIcon className="h-4 w-4" />
                  {themeOption.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
