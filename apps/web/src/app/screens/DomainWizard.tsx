import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  Crown,
  RefreshCw
} from 'lucide-react';

interface DomainWizardProps {
  onBack: () => void;
}

export function DomainWizard({ onBack }: DomainWizardProps) {
  const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
  const [domain, setDomain] = useState('');
  const [verifying, setVerifying] = useState(false);

  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      value: '76.76.21.21',
      description: 'Points your domain to Buildaweb',
    },
    {
      type: 'CNAME',
      name: 'www',
      value: 'cname.buildaweb.app',
      description: 'Points www subdomain to Buildaweb',
    },
  ];

  const handleSubmitDomain = () => {
    if (!domain) {
      toast.error('Please enter a domain name');
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain)) {
      toast.error('Please enter a valid domain name');
      return;
    }
    setStep('verify');
  };

  const handleVerify = () => {
    setVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setVerifying(false);
      setStep('success');
      toast.success('Domain connected successfully!');
    }, 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === 'input' ? 'bg-primary text-white' : 'bg-success text-white'
              }`}>
                {step === 'input' ? '1' : <CheckCircle className="h-6 w-6" />}
              </div>
              <span className="font-medium">Enter Domain</span>
            </div>

            <div className="w-16 h-0.5 bg-border" />

            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === 'verify' ? 'bg-primary text-white' : 
                step === 'success' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'success' ? <CheckCircle className="h-6 w-6" /> : '2'}
              </div>
              <span className={`font-medium ${step === 'input' ? 'text-muted-foreground' : ''}`}>
                Configure DNS
              </span>
            </div>

            <div className="w-16 h-0.5 bg-border" />

            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === 'success' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'success' ? <CheckCircle className="h-6 w-6" /> : '3'}
              </div>
              <span className={`font-medium ${step !== 'success' ? 'text-muted-foreground' : ''}`}>
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Input Domain */}
        {step === 'input' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Connect Your Custom Domain</h1>
              <p className="text-lg text-muted-foreground">
                Use your own domain name for your website
              </p>
            </div>

            {/* Pro Feature Banner */}
            <Card className="mb-8 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
              <div className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pro Feature</h3>
                  <p className="text-sm opacity-90">Custom domains are available on the Pro plan</p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Domain Name</label>
                  <Input
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter your domain without www (e.g., example.com)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Before you continue:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Make sure you own this domain</li>
                        <li>You'll need access to your domain's DNS settings</li>
                        <li>Changes may take up to 48 hours to propagate</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={handleSubmitDomain}>
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: DNS Configuration */}
        {step === 'verify' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Configure DNS Records</h1>
              <p className="text-lg text-muted-foreground">
                Add these DNS records to your domain provider
              </p>
            </div>

            <Card className="mb-6">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-bold text-lg">{domain}</p>
                    <p className="text-sm text-muted-foreground">Connecting to Buildaweb</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Important Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Log in to your domain registrar (GoDaddy, Namecheap, etc.)</li>
                        <li>Find the DNS settings or DNS management section</li>
                        <li>Add the records below exactly as shown</li>
                        <li>Save your changes and return here to verify</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {dnsRecords.map((record, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono font-bold">
                          {record.type}
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">{record.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Name/Host</label>
                        <div className="flex gap-2">
                          <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                            {record.name}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(record.name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Value/Points To</label>
                        <div className="flex gap-2">
                          <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                            {record.value}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(record.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying DNS...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Verify Connection
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    This may take a few minutes
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-3">Need help?</h3>
                <div className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    DNS Configuration Guide
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GoDaddy DNS Setup
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Namecheap DNS Setup
                  </a>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>

            <h1 className="text-4xl font-bold mb-3">Domain Connected!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your custom domain <strong>{domain}</strong> is now connected
            </p>

            <Card className="max-w-md mx-auto mb-8">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span className="text-sm font-medium">SSL Certificate</span>
                  <span className="text-xs text-success font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span className="text-sm font-medium">DNS Status</span>
                  <span className="text-xs text-success font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span className="text-sm font-medium">HTTPS</span>
                  <span className="text-xs text-success font-medium">Enabled</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={onBack}>
                Go to Dashboard
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="h-4 w-4" />
                Visit Site
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Your site is now available at https://{domain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}