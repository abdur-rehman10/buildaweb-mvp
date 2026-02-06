import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Pause,
  Trophy,
  TrendingUp,
  Users,
  Eye,
  Crown,
  BarChart3
} from 'lucide-react';

interface ABTestingProps {
  projectId: string;
  onBack: () => void;
}

interface Test {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    isControl: boolean;
  }[];
  startDate: string;
  description: string;
}

export function ABTesting({ projectId, onBack }: ABTestingProps) {
  const [tests] = useState<Test[]>([
    {
      id: '1',
      name: 'Hero CTA Button Color',
      status: 'running',
      description: 'Testing blue vs. green call-to-action button',
      startDate: '2 days ago',
      variants: [
        {
          id: 'a',
          name: 'Blue Button (Control)',
          visitors: 1240,
          conversions: 89,
          conversionRate: 7.2,
          isControl: true,
        },
        {
          id: 'b',
          name: 'Green Button',
          visitors: 1198,
          conversions: 104,
          conversionRate: 8.7,
          isControl: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Pricing Section Layout',
      status: 'paused',
      description: 'Comparing vertical vs. horizontal pricing cards',
      startDate: '1 week ago',
      variants: [
        {
          id: 'a',
          name: 'Vertical Cards (Control)',
          visitors: 856,
          conversions: 42,
          conversionRate: 4.9,
          isControl: true,
        },
        {
          id: 'b',
          name: 'Horizontal Cards',
          visitors: 891,
          conversions: 38,
          conversionRate: 4.3,
          isControl: false,
        },
      ],
    },
    {
      id: '3',
      name: 'Headline Copy Test',
      status: 'completed',
      description: 'Testing different headline messages',
      startDate: '2 weeks ago',
      variants: [
        {
          id: 'a',
          name: 'Original (Control)',
          visitors: 2450,
          conversions: 156,
          conversionRate: 6.4,
          isControl: true,
        },
        {
          id: 'b',
          name: 'Alternative',
          visitors: 2398,
          conversions: 198,
          conversionRate: 8.3,
          isControl: false,
        },
      ],
    },
  ]);

  const handleStartTest = (testId: string) => {
    toast.success('Test started!');
  };

  const handlePauseTest = (testId: string) => {
    toast.success('Test paused');
  };

  const handleDeclareWinner = (testId: string, variantId: string) => {
    toast.success('Winner declared! Variant will be applied to all visitors.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success/10 text-success';
      case 'paused':
        return 'bg-warning/10 text-warning';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWinner = (variants: Test['variants']) => {
    return variants.reduce((max, variant) =>
      variant.conversionRate > max.conversionRate ? variant : max
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">A/B Testing</h1>
            <p className="text-muted-foreground">
              Test different versions and optimize conversions
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            Create New Test
          </Button>
        </div>

        {/* Pro Feature Banner */}
        <Card className="mb-8 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pro Feature</h3>
                <p className="text-sm opacity-90">
                  A/B testing is available on the Pro plan • Unlimited tests
                </p>
              </div>
            </div>
            <Button variant="secondary" size="lg">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </Card>

        {/* Tests List */}
        <div className="space-y-6">
          {tests.map((test) => {
            const winner = getWinner(test.variants);
            const totalVisitors = test.variants.reduce((sum, v) => sum + v.visitors, 0);

            return (
              <Card key={test.id}>
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-bold text-xl">{test.name}</h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            test.status
                          )}`}
                        >
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.status === 'running' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseTest(test.id)}
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                      {test.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartTest(test.id)}
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {totalVisitors.toLocaleString()} visitors
                    </span>
                    <span>Started {test.startDate}</span>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`p-6 rounded-lg border-2 ${
                          variant.id === winner.id && test.status === 'completed'
                            ? 'border-success bg-success/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold">{variant.name}</h3>
                              {variant.isControl && (
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                                  Control
                                </span>
                              )}
                              {variant.id === winner.id && test.status === 'completed' && (
                                <Trophy className="h-5 w-5 text-success" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Visitors</span>
                              <span className="font-bold">
                                {variant.visitors.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Conversions</span>
                              <span className="font-bold">{variant.conversions}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Conversion Rate</span>
                              <span className="font-bold text-xl">
                                {variant.conversionRate}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  variant.id === winner.id
                                    ? 'bg-success'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${variant.conversionRate * 10}%` }}
                              />
                            </div>
                          </div>

                          {variant.id === winner.id &&
                            !variant.isControl &&
                            test.status === 'running' && (
                              <div className="pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-sm text-success mb-2">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>
                                    +{(variant.conversionRate - test.variants[0].conversionRate).toFixed(1)}% better
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>

                        {!variant.isControl &&
                          variant.id === winner.id &&
                          test.status === 'running' && (
                            <Button
                              fullWidth
                              size="sm"
                              className="mt-4"
                              onClick={() => handleDeclareWinner(test.id, variant.id)}
                            >
                              <Trophy className="h-4 w-4" />
                              Declare Winner
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Statistical Significance */}
                  {test.status === 'running' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Statistical Significance: 95%</p>
                          <p className="text-blue-800">
                            The results are statistically significant. You can confidently
                            declare a winner.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {test.status === 'completed' && (
                    <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-success" />
                        <div className="text-sm">
                          <p className="font-medium text-success mb-1">Test Completed</p>
                          <p className="text-muted-foreground">
                            "{winner.name}" is now being shown to 100% of visitors
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {tests.length === 0 && (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No tests running</h3>
            <p className="text-muted-foreground mb-6">
              Create your first A/B test to optimize your conversions
            </p>
            <Button>
              <Plus className="h-4 w-4" />
              Create First Test
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
