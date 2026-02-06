import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface SEOAuditReportProps {
  projectId: string;
  onBack: () => void;
}

export function SEOAuditReport({ projectId, onBack }: SEOAuditReportProps) {
  const seoChecks = [
    { category: 'Technical SEO', passed: 8, failed: 2, total: 10 },
    { category: 'On-Page SEO', passed: 12, failed: 3, total: 15 },
    { category: 'Content Quality', passed: 7, failed: 1, total: 8 },
    { category: 'Mobile Friendliness', passed: 5, failed: 0, total: 5 },
    { category: 'Page Speed', passed: 4, failed: 1, total: 5 },
  ];

  const issues = [
    {
      severity: 'high',
      category: 'Technical SEO',
      title: 'Missing meta descriptions on 3 pages',
      impact: 'May reduce click-through rates from search results',
      fix: 'Add unique meta descriptions to all pages',
    },
    {
      severity: 'medium',
      category: 'On-Page SEO',
      title: 'Multiple H1 tags on homepage',
      impact: 'Confuses search engines about page hierarchy',
      fix: 'Use only one H1 tag per page',
    },
    {
      severity: 'low',
      category: 'Content Quality',
      title: 'Low word count on About page',
      impact: 'May not provide enough context for ranking',
      fix: 'Expand content to at least 300 words',
    },
  ];

  const totalScore = seoChecks.reduce((acc, check) => acc + check.passed, 0);
  const totalChecks = seoChecks.reduce((acc, check) => acc + check.total, 0);
  const score = Math.round((totalScore / totalChecks) * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SEO Audit Report</h1>
                  <p className="text-sm text-muted-foreground">Detailed SEO analysis</p>
                </div>
              </div>
            </div>
            <Button>
              <Search className="h-4 w-4" />
              Run New Audit
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overall Score */}
        <Card className="p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-success/10 mb-4">
            <div>
              <div className="text-5xl font-bold text-success">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Good SEO Performance</h2>
          <p className="text-muted-foreground">
            {totalScore} of {totalChecks} checks passed • {issues.length} issues found
          </p>
        </Card>

        {/* Category Scores */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seoChecks.map((check) => {
              const categoryScore = Math.round((check.passed / check.total) * 100);
              return (
                <Card key={check.category} className="p-6">
                  <h4 className="font-bold mb-4">{check.category}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold">{categoryScore}%</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{check.passed} passed</div>
                      <div>{check.failed} failed</div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        categoryScore >= 80
                          ? 'bg-success'
                          : categoryScore >= 50
                          ? 'bg-warning'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${categoryScore}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issues */}
          <div>
            <h3 className="font-bold text-lg mb-4">Issues to Fix</h3>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Card
                  key={index}
                  className={`p-4 ${
                    issue.severity === 'high'
                      ? 'border-destructive'
                      : issue.severity === 'medium'
                      ? 'border-warning'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded uppercase flex-shrink-0 ${
                        issue.severity === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : issue.severity === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{issue.category}</div>
                      <h4 className="font-medium mb-1">{issue.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{issue.impact}</p>
                  <div className="text-sm bg-muted p-2 rounded">
                    <strong>How to fix:</strong> {issue.fix}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-bold text-lg mb-4">Top Recommendations</h3>
            <Card className="p-6 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Optimize page titles</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Make titles more descriptive and include target keywords
                  </div>
                  <div className="text-xs text-success">High Impact • Easy Fix</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Add alt text to images</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    12 images are missing alt text descriptions
                  </div>
                  <div className="text-xs text-success">High Impact • Easy Fix</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Improve internal linking</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Create more contextual links between related pages
                  </div>
                  <div className="text-xs text-warning">Medium Impact • Moderate Effort</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
