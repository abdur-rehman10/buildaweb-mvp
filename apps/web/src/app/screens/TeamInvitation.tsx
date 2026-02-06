import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { UserPlus, Mail, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TeamInvitationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function TeamInvitation({ onComplete, onCancel }: TeamInvitationProps) {
  const [step, setStep] = useState<'send' | 'sent' | 'accept' | 'onboard'>('send');
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  const handleSendInvite = () => {
    if (!inviteData.email) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success('Invitation sent!');
    setStep('sent');
  };

  const handleAcceptInvite = () => {
    setStep('onboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Step 1: Send Invite */}
        {step === 'send' && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Invite Team Member</h1>
                <p className="text-muted-foreground">Add someone to your workspace</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="colleague@company.com"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="owner">Owner - Full access</option>
                  <option value="admin">Admin - Manage team & projects</option>
                  <option value="editor">Editor - Edit projects</option>
                  <option value="member">Member - View & comment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  rows={3}
                  placeholder="Welcome to the team! Looking forward to working with you."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  They'll receive an email with a link to join your workspace.
                </p>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendInvite} className="flex-1">
                  <Mail className="h-5 w-5" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Invitation Sent */}
        {step === 'sent' && (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invitation Sent!</h2>
            <p className="text-muted-foreground mb-6">
              We've sent an email to <strong>{inviteData.email}</strong>
            </p>
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-muted rounded-lg text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Email</span>
                  <span className="text-muted-foreground">{inviteData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Role</span>
                  <span className="capitalize">{inviteData.role}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onComplete} className="flex-1">
                Done
              </Button>
              <Button onClick={() => setStep('send')} className="flex-1">
                Invite Another
              </Button>
            </div>

            {/* Demo: Simulate accept flow */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Demo: Simulate invitation acceptance
              </p>
              <Button size="sm" variant="outline" onClick={() => setStep('accept')}>
                View Invite (Recipient View)
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Accept Invitation (Recipient View) */}
        {step === 'accept' && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
              <p className="text-muted-foreground">
                John Doe has invited you to join their workspace
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Card className="p-4 bg-muted">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Workspace</span>
                    <span className="font-medium">Acme Inc.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your Role</span>
                    <span className="font-medium capitalize">{inviteData.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Invited By</span>
                    <span className="font-medium">john@acme.com</span>
                  </div>
                </div>
              </Card>

              {inviteData.message && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    Personal Message:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    "{inviteData.message}"
                  </p>
                </Card>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="mb-1">As a <strong className="capitalize">{inviteData.role}</strong>, you'll be able to:</p>
                <ul className="list-disc list-inside space-y-1">
                  {inviteData.role === 'owner' && (
                    <>
                      <li>Full administrative access</li>
                      <li>Manage billing and subscriptions</li>
                      <li>Delete the workspace</li>
                    </>
                  )}
                  {inviteData.role === 'admin' && (
                    <>
                      <li>Manage team members</li>
                      <li>Create and delete projects</li>
                      <li>Configure workspace settings</li>
                    </>
                  )}
                  {inviteData.role === 'editor' && (
                    <>
                      <li>Edit all projects</li>
                      <li>Publish changes</li>
                      <li>Comment and collaborate</li>
                    </>
                  )}
                  {inviteData.role === 'member' && (
                    <>
                      <li>View projects</li>
                      <li>Leave comments</li>
                      <li>Participate in discussions</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('sent')} className="flex-1">
                Decline
              </Button>
              <Button onClick={handleAcceptInvite} className="flex-1">
                Accept Invitation
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Onboarding */}
        {step === 'onboard' && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Acme Inc.!</h1>
              <p className="text-muted-foreground">
                You're now part of the team
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Card className="p-4">
                <h3 className="font-bold mb-3">Quick Start Guide</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <div className="font-medium">Complete your profile</div>
                      <div className="text-xs text-muted-foreground">Add photo and bio</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <div className="font-medium">Explore projects</div>
                      <div className="text-xs text-muted-foreground">See what the team is working on</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <div className="font-medium">Join team chat</div>
                      <div className="text-xs text-muted-foreground">Introduce yourself</div>
                    </div>
                  </label>
                </div>
              </Card>
            </div>

            <Button fullWidth onClick={onComplete}>
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
