import { Button } from '../components/Button';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: February 6, 2026</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing and using Buildaweb ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
        </p>

        <h2>2. Use License</h2>
        <p>
          Buildaweb grants you a personal, non-exclusive, non-transferable, limited license to use the Service for your personal or business use, subject to these Terms.
        </p>

        <h3>You may:</h3>
        <ul>
          <li>Create and publish websites using our platform</li>
          <li>Use our templates and design tools</li>
          <li>Connect custom domains to your sites</li>
          <li>Collaborate with team members</li>
        </ul>

        <h3>You may not:</h3>
        <ul>
          <li>Resell or redistribute our Service</li>
          <li>Use the Service for illegal purposes</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Upload malicious code or content</li>
        </ul>

        <h2>3. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities under your account.
        </p>

        <h2>4. Payment Terms</h2>
        <p>
          Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice.
        </p>

        <h2>5. Content Ownership</h2>
        <p>
          You retain all rights to content you create using Buildaweb. We do not claim ownership of your websites, designs, or uploaded content. You grant us a limited license to host and display your content as necessary to provide the Service.
        </p>

        <h2>6. Service Availability</h2>
        <p>
          We strive for 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify or discontinue the Service with reasonable notice.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account immediately if you breach these Terms. Upon termination, your right to use the Service will cease immediately. You may cancel your subscription at any time.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          Buildaweb shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of significant changes via email. Continued use of the Service after changes constitutes acceptance of the new Terms.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at:
          <br />
          Email: legal@buildaweb.com
          <br />
          Address: 123 Web Street, San Francisco, CA 94105
        </p>
      </div>
    </div>
  );
}
