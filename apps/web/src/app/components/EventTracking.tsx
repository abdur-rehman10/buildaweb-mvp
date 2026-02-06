import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { MousePointer, Download, Play, Mail, ShoppingBag, Plus, Trash2 } from 'lucide-react';

interface TrackedEvent {
  id: string;
  name: string;
  category: string;
  count: number;
  icon: any;
  color: string;
}

export function EventTracking() {
  const [events, setEvents] = useState<TrackedEvent[]>([
    { id: '1', name: 'Button Click', category: 'Engagement', count: 2450, icon: MousePointer, color: '#8B5CF6' },
    { id: '2', name: 'Download PDF', category: 'Conversion', count: 830, icon: Download, color: '#06B6D4' },
    { id: '3', name: 'Video Play', category: 'Engagement', count: 1200, icon: Play, color: '#EC4899' },
    { id: '4', name: 'Form Submit', category: 'Conversion', count: 650, icon: Mail, color: '#10B981' },
    { id: '5', name: 'Add to Cart', category: 'E-commerce', count: 940, icon: ShoppingBag, color: '#F59E0B' },
  ]);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Engagement');

  const handleAddEvent = () => {
    if (!newEventName) return;
    
    const newEvent: TrackedEvent = {
      id: Date.now().toString(),
      name: newEventName,
      category: newEventCategory,
      count: 0,
      icon: MousePointer,
      color: '#8B5CF6',
    };

    setEvents([...events, newEvent]);
    setNewEventName('');
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const totalEvents = events.reduce((sum, e) => sum + e.count, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">Event Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Total events: <span className="font-bold">{totalEvents.toLocaleString()}</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddEvent(true)}>
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Add event form */}
      {showAddEvent && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
          <h4 className="font-bold mb-3">New Event</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Event Name</label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., Newsletter Signup"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="Engagement">Engagement</option>
                <option value="Conversion">Conversion</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Navigation">Navigation</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEvent}>Add Event</Button>
              <Button variant="ghost" onClick={() => setShowAddEvent(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = event.icon;
          const percentage = ((event.count / totalEvents) * 100).toFixed(1);
          
          return (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${event.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: event.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{event.name}</p>
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                      {event.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {event.count.toLocaleString()} events
                    </p>
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: event.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                aria-label="Delete event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Event tracking code */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-bold mb-2 text-sm">Tracking Code</h4>
        <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
          {`// Track custom events\nwindow.analytics.track('${events[0]?.name || 'Event Name'}', {\n  category: '${events[0]?.category || 'Category'}',\n  value: 1\n});`}
        </pre>
      </div>
    </Card>
  );
}
