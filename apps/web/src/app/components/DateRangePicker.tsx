import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets: DateRange[] = [
    {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(),
      label: 'Last 24 hours',
    },
    {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: 'Last 7 days',
    },
    {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: 'Last 30 days',
    },
    {
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: 'Last 90 days',
    },
    {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
      label: 'This year',
    },
    {
      from: new Date(new Date().getFullYear() - 1, 0, 1),
      to: new Date(new Date().getFullYear() - 1, 11, 31),
      label: 'Last year',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{value.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-card border border-border rounded-lg shadow-lg p-2">
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    value.label === preset.label
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <p className="text-sm font-medium">{preset.label}</p>
                  <p className="text-xs opacity-80">
                    {preset.from.toLocaleDateString()} - {preset.to.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
