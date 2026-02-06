import { Card } from './Card';
import { Users, ShoppingCart, CreditCard, CheckCircle, TrendingDown } from 'lucide-react';

interface FunnelStep {
  name: string;
  visitors: number;
  percentage: number;
  dropoff: number;
  icon: any;
  color: string;
}

export function ConversionFunnel() {
  const steps: FunnelStep[] = [
    {
      name: 'Landing Page',
      visitors: 10000,
      percentage: 100,
      dropoff: 0,
      icon: Users,
      color: '#8B5CF6',
    },
    {
      name: 'Product View',
      visitors: 6500,
      percentage: 65,
      dropoff: 35,
      icon: ShoppingCart,
      color: '#06B6D4',
    },
    {
      name: 'Add to Cart',
      visitors: 3200,
      percentage: 32,
      dropoff: 33,
      icon: ShoppingCart,
      color: '#EC4899',
    },
    {
      name: 'Checkout',
      visitors: 1800,
      percentage: 18,
      dropoff: 14,
      icon: CreditCard,
      color: '#F59E0B',
    },
    {
      name: 'Purchase',
      visitors: 1260,
      percentage: 12.6,
      dropoff: 5.4,
      icon: CheckCircle,
      color: '#10B981',
    },
  ];

  const conversionRate = ((steps[steps.length - 1].visitors / steps[0].visitors) * 100).toFixed(1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">Conversion Funnel</h3>
          <p className="text-sm text-muted-foreground">
            Overall conversion rate: <span className="font-bold text-success">{conversionRate}%</span>
          </p>
        </div>
        <select className="px-3 py-2 border border-border rounded-lg text-sm">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.name} className="relative">
              {/* Funnel step */}
              <div
                className="relative p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{
                  borderColor: step.color,
                  backgroundColor: `${step.color}10`,
                  width: `${step.percentage}%`,
                  minWidth: '200px',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: step.color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">{step.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.visitors.toLocaleString()} visitors
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: step.color }}>
                      {step.percentage}%
                    </p>
                    {index > 0 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {step.dropoff}% dropoff
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex justify-center my-2">
                  <div className="h-6 w-0.5 bg-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-bold mb-2 text-sm">Key Insights</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Highest drop-off at Product View (35%)</li>
          <li>• Add to Cart conversion needs improvement (32%)</li>
          <li>• Strong checkout completion rate (70%)</li>
        </ul>
      </div>
    </Card>
  );
}
