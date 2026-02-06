import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { User, Mail, Calendar, Activity, Shield, MoreVertical, Edit } from 'lucide-react';

interface TeamMemberProfileProps {
  memberId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function TeamMemberProfile({ memberId, onBack, onEdit }: TeamMemberProfileProps) {
  const member = {
    name: 'Sarah Johnson',
    email: 'sarah@acme.com',
    role: 'Editor',
    avatar: '',
    joinedDate: 'Jan 15, 2026',
    lastActive: '2 hours ago',
    bio: 'Senior designer with 8 years of experience in UI/UX and web development.',
    projects: 12,
    contributions: 156,
  };

  const recentActivity = [
    { type: 'edit', project: 'Portfolio Site', action: 'Updated homepage', time: '2 hours ago' },
    { type: 'comment', project: 'E-commerce Store', action: 'Left comment on pricing page', time: '5 hours ago' },
    { type: 'publish', project: 'Blog', action: 'Published new article', time: '1 day ago' },
    { type: 'create', project: 'Landing Page', action: 'Created new project', time: '2 days ago' },
  ];

  const projects = [
    { id: '1', name: 'Portfolio Site', role: 'Owner', lastEdit: '2 hours ago' },
    { id: '2', name: 'E-commerce Store', role: 'Editor', lastEdit: '5 hours ago' },
    { id: '3', name: 'Blog', role: 'Editor', lastEdit: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to Team
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    {member.role}
                  </div>
                </div>
                <p className="text-muted-foreground max-w-2xl">{member.bio}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">{member.projects}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">{member.contributions}</div>
              <div className="text-sm text-muted-foreground">Contributions</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">{member.joinedDate}</div>
              <div className="text-sm text-muted-foreground">Member Since</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">{member.lastActive}</div>
              <div className="text-sm text-muted-foreground">Last Active</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3 p-3 hover:bg-accent rounded-lg transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.project}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {project.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Last edited {project.lastEdit}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
