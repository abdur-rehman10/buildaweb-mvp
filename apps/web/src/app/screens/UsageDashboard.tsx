import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, TrendingUp, AlertCircle, Zap, Globe, Database, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageDashboardProps {
  onBack: () => void;
  onUpgrade: () => void;
}

export function UsageDashboard({ onBack, onUpgrade }: UsageDashboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Current usage data
  const usage = {
    bandwidth: {
      used: 45.2, // GB
      limit: 100, // GB
      percentage: 45,
    },
    storage: {
      used: 2.8, // GB
      limit: 10, // GB
      percentage: 28,
    },
    projects: {
      used: 8,
      limit: 10,
      percentage: 80,
    },
    teamMembers: {
      used: 3,
      limit: 5,
      percentage: 60,
    },
    aiCredits: {
      used: 750,
      limit: 1000,
      percentage: 75,
    },
  };

  // Historical data
  const bandwidthHistory = [
    { date: 'Week 1', usage: 8.5 },
    { date: 'Week 2', usage: 12.3 },
    { date: 'Week 3', usage: 10.1 },
    { date: 'Week 4', usage: 14.3 },
  ];

  const storageHistory = [
    { date: 'Jan', usage: 1.2 },
    { date: 'Feb', usage: 1.8 },
    { date: 'Mar', usage: 2.1 },
    { date: 'Apr', usage: 2.8 },
  ];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Usage Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your resource usage and limits
              </p>
            </div>
            <Button onClick={onUpgrade}>
              <TrendingUp className="h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Bandwidth */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bandwidth</p>
                  <p className="text-xs text-muted-foreground">Data transfer</p>
                </div>
              </div>
              {usage.bandwidth.percentage >= 80 && (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className={`font-bold ${getUsageColor(usage.bandwidth.percentage)}`}>
                  {usage.bandwidth.used} GB / {usage.bandwidth.limit} GB
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.bandwidth.percentage)} transition-all`}
                  style={{ width: `${usage.bandwidth.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {usage.bandwidth.percentage}% used
              </p>
            </div>
          </Card>

          {/* Storage */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-xs text-muted-foreground">Files & media</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className={`font-bold ${getUsageColor(usage.storage.percentage)}`}>
                  {usage.storage.used} GB / {usage.storage.limit} GB
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.storage.percentage)} transition-all`}
                  style={{ width: `${usage.storage.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {usage.storage.percentage}% used
              </p>
            </div>
          </Card>

          {/* AI Credits */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">AI Credits</p>
                  <p className="text-xs text-muted-foreground">AI generations</p>
                </div>
              </div>
              {usage.aiCredits.percentage >= 80 && (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className={`font-bold ${getUsageColor(usage.aiCredits.percentage)}`}>
                  {usage.aiCredits.used} / {usage.aiCredits.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.aiCredits.percentage)} transition-all`}
                  style={{ width: `${usage.aiCredits.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {usage.aiCredits.percentage}% used
              </p>
            </div>
          </Card>
        </div>

        {/* Project & Team Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Projects</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-bold">
                  {usage.projects.used} / {usage.projects.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.projects.percentage)}`}
                  style={{ width: `${usage.projects.percentage}%` }}
                />
              </div>
              {usage.projects.percentage >= 80 && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning">
                    You're approaching your project limit. Upgrade to create more projects.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Team Members</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Members</span>
                <span className="font-bold">
                  {usage.teamMembers.used} / {usage.teamMembers.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.teamMembers.percentage)}`}
                  style={{ width: `${usage.teamMembers.percentage}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Bandwidth Usage (Monthly)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bandwidthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Storage Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={storageHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="usage" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Upgrade CTA */}
        {(usage.bandwidth.percentage >= 80 || usage.aiCredits.percentage >= 80 || usage.projects.percentage >= 80) && (
          <Card className="p-6 mt-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Need More Resources?</h3>
                <p className="text-muted-foreground">
                  Upgrade your plan to get more bandwidth, storage, and AI credits
                </p>
              </div>
              <Button onClick={onUpgrade}>
                <TrendingUp className="h-4 w-4" />
                View Plans
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
