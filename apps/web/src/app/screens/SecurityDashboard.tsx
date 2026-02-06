import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Shield, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';

interface SecurityDashboardProps {
  projectId: string;
  onBack: () => void;
}

export function SecurityDashboard({ projectId, onBack }: SecurityDashboardProps) {
  const securityChecks = [
    { name: 'SSL Certificate', status: 'pass', message: 'Valid until Dec 2026' },
    { name: 'HTTPS Enabled', status: 'pass', message: 'All pages served over HTTPS' },
    { name: 'Security Headers', status: 'warning', message: 'Some headers missing' },
    { name: 'XSS Protection', status: 'pass', message: 'Enabled and configured' },
    { name: 'CSRF Protection', status: 'pass', message: 'Tokens validated' },
    { name: 'SQL Injection Protection', status: 'pass', message: 'Parameterized queries' },
    { name: 'Content Security Policy', status: 'warning', message: 'Could be more strict' },
    { name: 'Subresource Integrity', status: 'fail', message: 'Not implemented' },
  ];

  const vulnerabilities = [
    {
      severity: 'medium',
      title: 'Missing X-Frame-Options Header',
      description: 'Your site could be vulnerable to clickjacking attacks',
      fix: 'Add X-Frame-Options header with SAMEORIGIN or DENY value',
    },
    {
      severity: 'low',
      title: 'Weak Content Security Policy',
      description: 'CSP allows inline scripts which could be exploited',
      fix: 'Update CSP to disallow unsafe-inline for scripts',
    },
  ];

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
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Security Dashboard</h1>
                  <p className="text-sm text-muted-foreground">SSL, HTTPS & Vulnerability Scan</p>
                </div>
              </div>
            </div>
            <Button>
              <Shield className="h-4 w-4" />
              Run Security Scan
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Security Score */}
        <Card className="p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-success/10 mb-4">
            <div>
              <div className="text-5xl font-bold text-success">B+</div>
              <div className="text-sm text-muted-foreground">Grade</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Good Security Posture</h2>
          <p className="text-muted-foreground">
            6 of 8 security checks passed • 2 vulnerabilities found
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Checks */}
          <div>
            <h3 className="font-bold text-lg mb-4">Security Checks</h3>
            <Card className="p-6">
              <div className="space-y-3">
                {securityChecks.map((check) => (
                  <div
                    key={check.name}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    {check.status === 'pass' && (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    )}
                    {check.status === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    )}
                    {check.status === 'fail' && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium mb-1">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* SSL Certificate */}
          <div>
            <h3 className="font-bold text-lg mb-4">SSL Certificate</h3>
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="font-bold">Valid Certificate</div>
                  <div className="text-sm text-muted-foreground">Let's Encrypt Authority X3</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued to:</span>
                  <span>*.buildaweb.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid from:</span>
                  <span>Dec 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>Dec 15, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-renewal:</span>
                  <span className="text-success">Enabled</span>
                </div>
              </div>
            </Card>

            <h3 className="font-bold text-lg mb-4">Vulnerabilities</h3>
            <div className="space-y-3">
              {vulnerabilities.map((vuln, index) => (
                <Card
                  key={index}
                  className={`p-4 ${
                    vuln.severity === 'high'
                      ? 'border-destructive'
                      : vuln.severity === 'medium'
                      ? 'border-warning'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded uppercase ${
                        vuln.severity === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : vuln.severity === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {vuln.severity}
                    </span>
                    <h4 className="font-medium flex-1">{vuln.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                  <div className="text-sm bg-muted p-2 rounded">
                    <strong>Fix:</strong> {vuln.fix}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
