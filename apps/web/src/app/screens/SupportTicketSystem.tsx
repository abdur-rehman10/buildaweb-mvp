import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Ticket, Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicketSystemProps {
  onBack: () => void;
}

export function SupportTicketSystem({ onBack }: SupportTicketSystemProps) {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [tickets] = useState([
    {
      id: 'TKT-1234',
      subject: 'Cannot publish my website',
      status: 'open',
      priority: 'high',
      created: '2 hours ago',
      updated: '30 mins ago',
      responses: 3,
    },
    {
      id: 'TKT-1189',
      subject: 'Custom domain not connecting',
      status: 'in-progress',
      priority: 'medium',
      created: '1 day ago',
      updated: '4 hours ago',
      responses: 5,
    },
    {
      id: 'TKT-1156',
      subject: 'Question about pricing plans',
      status: 'resolved',
      priority: 'low',
      created: '3 days ago',
      updated: '2 days ago',
      responses: 2,
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return null;
    }
  };

  const handleSubmitTicket = () => {
    toast.success('Support ticket submitted successfully');
    setShowNewTicket(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Support Tickets</h1>
                  <p className="text-sm text-muted-foreground">{tickets.length} tickets</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowNewTicket(true)}>
              <Plus className="h-5 w-5" />
              New Ticket
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showNewTicket && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Submit New Ticket</h3>
            <div className="space-y-4">
              <Input label="Subject" placeholder="Briefly describe your issue" />
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg bg-input-background">
                  <option>Technical Issue</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg bg-input-background">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input-background resize-none"
                  placeholder="Provide as much detail as possible..."
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewTicket(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitTicket} className="flex-1">
                  Submit Ticket
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['All', 'Open', 'In Progress', 'Resolved'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        ticket.priority === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : ticket.priority === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{ticket.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Created {ticket.created}</span>
                    <span>•</span>
                    <span>Updated {ticket.updated}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {ticket.responses} responses
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(ticket.status)}
                  <span className="text-sm capitalize">{ticket.status.replace('-', ' ')}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {tickets.length === 0 && (
          <Card className="p-12 text-center">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold text-lg mb-2">No support tickets</h3>
            <p className="text-muted-foreground mb-6">
              You haven't submitted any support tickets yet
            </p>
            <Button onClick={() => setShowNewTicket(true)}>
              <Plus className="h-5 w-5" />
              Create Your First Ticket
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
