import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface CookiePolicyProps {
  onBack: () => void;
}

export function CookiePolicy({ onBack }: CookiePolicyProps) {
  const cookieTypes = [
    {
      type: 'Essential Cookies',
      purpose: 'Required for the website to function',
      examples: ['Authentication tokens', 'Session management', 'Security'],
      canDisable: false,
    },
    {
      type: 'Functional Cookies',
      purpose: 'Remember your preferences',
      examples: ['Language preference', 'Theme selection', 'Recently viewed'],
      canDisable: true,
    },
    {
      type: 'Analytics Cookies',
      purpose: 'Help us understand how you use our site',
      examples: ['Page views', 'Feature usage', 'Performance metrics'],
      canDisable: true,
    },
    {
      type: 'Marketing Cookies',
      purpose: 'Deliver relevant advertisements',
      examples: ['Ad targeting', 'Campaign tracking', 'Conversion tracking'],
      canDisable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 prose prose-slate dark:prose-invert max-w-none">
        <h1>Cookie Policy</h1>
        <p className="text-muted-foreground">Last updated: February 6, 2026</p>

        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
        </p>

        <h2>How We Use Cookies</h2>
        <p>
          Buildaweb uses cookies to improve your experience, provide personalized features, and analyze how our Service is used. We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until deleted).
        </p>

        <h2>Types of Cookies We Use</h2>
        <div className="not-prose space-y-4 my-8">
          {cookieTypes.map((cookie) => (
            <Card key={cookie.type} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{cookie.type}</h3>
                {cookie.canDisable ? (
                  <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded">
                    Optional
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{cookie.purpose}</p>
              <div>
                <div className="text-sm font-medium mb-2">Examples:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {cookie.examples.map((example) => (
                    <li key={example}>• {example}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <h2>Third-Party Cookies</h2>
        <p>
          We also use cookies from trusted third-party services:
        </p>
        <ul>
          <li><strong>Google Analytics:</strong> To analyze website traffic and usage</li>
          <li><strong>Stripe:</strong> To process payments securely</li>
          <li><strong>Intercom:</strong> To provide customer support</li>
        </ul>

        <h2>Managing Your Cookie Preferences</h2>
        <p>
          You can control and manage cookies in several ways:
        </p>
        <ul>
          <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
          <li><strong>Cookie Preferences:</strong> Use our cookie preference center (available in account settings)</li>
          <li><strong>Opt-Out Tools:</strong> Use tools like NAI Consumer Opt-Out or DAA WebChoices</li>
        </ul>

        <Card className="p-4 my-6 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Disabling certain cookies may limit your ability to use some features of our Service.
          </p>
        </Card>

        <h2>Do Not Track</h2>
        <p>
          We respect Do Not Track (DNT) browser settings. When DNT is enabled, we limit the use of non-essential tracking technologies.
        </p>

        <h2>Cookie Retention</h2>
        <p>
          Session cookies are deleted when you close your browser. Persistent cookies remain on your device for the period specified in the cookie or until you manually delete them:
        </p>
        <ul>
          <li>Authentication cookies: Until logout or 30 days</li>
          <li>Preference cookies: 1 year</li>
          <li>Analytics cookies: 2 years</li>
          <li>Marketing cookies: 90 days</li>
        </ul>

        <h2>Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy to reflect changes in our practices or for legal reasons. We will notify you of significant changes.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about our use of cookies:
          <br />
          Email: privacy@buildaweb.com
          <br />
          Address: 123 Web Street, San Francisco, CA 94105
        </p>
      </div>
    </div>
  );
}
