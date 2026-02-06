import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, MoreVertical, Crown, Mail, Trash2, Shield } from 'lucide-react';

interface TeamProps {
  onBack: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  avatar: string;
  joinedAt: string;
}

export function Team({ onBack }: TeamProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

  const [members] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'active',
      avatar: 'JD',
      joinedAt: '6 months ago',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'admin',
      status: 'active',
      avatar: 'SJ',
      joinedAt: '3 months ago',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'editor',
      status: 'active',
      avatar: 'MC',
      joinedAt: '1 month ago',
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'viewer',
      status: 'pending',
      avatar: 'EW',
      joinedAt: '2 days ago',
    },
  ]);

  const roles = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access including billing and team management',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Can manage sites and invite team members',
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can edit and publish sites',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Can only view sites, no editing',
    },
  ];

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId: string) => {
    toast.success('Member removed from team');
    setShowMemberMenu(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'editor':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">Invite and manage team members</p>
          </div>
          <Button size="lg" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-5 w-5" />
            Invite Member
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
                <h3 className="font-bold text-lg">Team Collaboration</h3>
                <p className="text-sm opacity-90">Available on Pro plan • Up to 10 team members</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Team Members List */}
        <Card>
          <div className="p-6 border-b border-border">
            <h2 className="font-bold text-lg">Team Members ({members.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between hover:bg-accent transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {member.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-warning/10 text-warning">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Joined {member.joinedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>

                  <div className="relative">
                    {member.role !== 'owner' && (
                      <>
                        <button
                          onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMemberMenu === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMemberMenu(null)}
                            />
                            <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg border border-border shadow-lg py-1">
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Change Role
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Resend Invite
                              </button>
                              <hr className="my-1 border-border" />
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Roles & Permissions */}
        <Card className="mt-8">
          <div className="p-6 border-b border-border">
            <h2 className="font-bold text-lg">Roles & Permissions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Understanding team member roles
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role.id)}`}>
                    {role.name}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="font-bold text-lg">Invite Team Member</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send an invitation to join your team
              </p>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 h-10 rounded-md border border-input bg-background"
                >
                  {roles.filter((r) => r.id !== 'owner').map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" fullWidth onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button fullWidth onClick={handleInvite}>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
