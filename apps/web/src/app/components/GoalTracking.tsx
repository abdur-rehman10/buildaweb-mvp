import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Target, Plus, Edit2, Trash2, TrendingUp, CheckCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  type: 'pageview' | 'event' | 'conversion';
  target: number;
  current: number;
  completionRate: number;
  status: 'on-track' | 'at-risk' | 'completed';
}

export function GoalTracking() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Monthly Pageviews',
      type: 'pageview',
      target: 50000,
      current: 42500,
      completionRate: 85,
      status: 'on-track',
    },
    {
      id: '2',
      name: 'Newsletter Signups',
      type: 'conversion',
      target: 500,
      current: 480,
      completionRate: 96,
      status: 'on-track',
    },
    {
      id: '3',
      name: 'Product Purchases',
      type: 'conversion',
      target: 100,
      current: 65,
      completionRate: 65,
      status: 'at-risk',
    },
    {
      id: '4',
      name: 'Video Completions',
      type: 'event',
      target: 1000,
      current: 1000,
      completionRate: 100,
      status: 'completed',
    },
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'on-track': return '#06B6D4';
      case 'at-risk': return '#F59E0B';
    }
  };

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">Goal Tracking</h3>
          <p className="text-sm text-muted-foreground">
            {goals.filter(g => g.status === 'completed').length} of {goals.length} goals completed
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddGoal(true)}>
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getStatusColor(goal.status)}20` }}
                >
                  <Target className="h-4 w-4" style={{ color: getStatusColor(goal.status) }} />
                </div>
                <div>
                  <p className="font-bold">{goal.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{goal.type}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-accent rounded">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button className="p-1 hover:bg-destructive/10 hover:text-destructive rounded">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold">
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(goal.completionRate, 100)}%`,
                    backgroundColor: getStatusColor(goal.status),
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${getStatusColor(goal.status)}20`,
                    color: getStatusColor(goal.status),
                  }}
                >
                  {getStatusLabel(goal.status)}
                </span>
                <span className="text-sm font-bold">{goal.completionRate}%</span>
              </div>
            </div>

            {/* Status icon */}
            {goal.status === 'completed' && (
              <div className="mt-3 flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Goal achieved!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-muted/50">
          <h4 className="font-bold mb-4">Create New Goal</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Goal Name</label>
              <input
                type="text"
                placeholder="e.g., Monthly Sales Target"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Goal Type</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                <option value="pageview">Pageviews</option>
                <option value="event">Event</option>
                <option value="conversion">Conversion</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Value</label>
              <input
                type="number"
                placeholder="1000"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button>Create Goal</Button>
              <Button variant="ghost" onClick={() => setShowAddGoal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {goals.filter(g => g.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">
            {goals.filter(g => g.status === 'on-track').length}
          </p>
          <p className="text-sm text-muted-foreground">On Track</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">
            {goals.filter(g => g.status === 'at-risk').length}
          </p>
          <p className="text-sm text-muted-foreground">At Risk</p>
        </div>
      </div>
    </Card>
  );
}
