import { Button } from '../components/Button';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 6, 2026</p>

        <h2>1. Information We Collect</h2>
        
        <h3>Information you provide to us:</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, password</li>
          <li><strong>Payment Information:</strong> Credit card details (processed securely by Stripe)</li>
          <li><strong>Profile Information:</strong> Optional bio, avatar, and preferences</li>
          <li><strong>Content:</strong> Websites, pages, and media you create</li>
        </ul>

        <h3>Information we collect automatically:</h3>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
          <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
          <li><strong>Cookies:</strong> Session tokens and preferences (see Cookie Policy)</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide and maintain the Service</li>
          <li>Process your transactions</li>
          <li>Send service updates and marketing communications</li>
          <li>Improve our products and services</li>
          <li>Detect and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information. We share information only:</p>
        <ul>
          <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
          <li><strong>Service providers:</strong> Stripe for payments, AWS for hosting</li>
          <li><strong>Legal requirements:</strong> When required by law or to protect rights</li>
          <li><strong>Business transfers:</strong> In case of merger or acquisition</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>Encryption in transit (TLS/SSL) and at rest</li>
          <li>Regular security audits and penetration testing</li>
          <li>Access controls and authentication</li>
          <li>Automated backups</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your information as long as your account is active or as needed to provide services. When you delete your account, we delete your personal information within 30 days, except as required by law.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Withdraw consent</li>
        </ul>

        <h2>7. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Our Service is not directed to children under 13. We do not knowingly collect information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
        </p>

        <h2>9. Changes to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our Service.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          For privacy-related questions or to exercise your rights:
          <br />
          Email: privacy@buildaweb.com
          <br />
          Data Protection Officer: dpo@buildaweb.com
          <br />
          Address: 123 Web Street, San Francisco, CA 94105
        </p>
      </div>
    </div>
  );
}
