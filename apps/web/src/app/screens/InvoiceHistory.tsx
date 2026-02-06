import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, Download, Eye, FileText, Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  number: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  period: string;
  pdfUrl?: string;
}

interface InvoiceHistoryProps {
  onBack: () => void;
}

export function InvoiceHistory({ onBack }: InvoiceHistoryProps) {
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      date: new Date('2024-02-01'),
      amount: 29.00,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Feb 1, 2024 - Mar 1, 2024',
    },
    {
      id: '2',
      number: 'INV-2024-002',
      date: new Date('2024-01-01'),
      amount: 29.00,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Jan 1, 2024 - Feb 1, 2024',
    },
    {
      id: '3',
      number: 'INV-2023-012',
      date: new Date('2023-12-01'),
      amount: 29.00,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Dec 1, 2023 - Jan 1, 2024',
    },
    {
      id: '4',
      number: 'INV-2023-011',
      date: new Date('2023-11-01'),
      amount: 29.00,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Nov 1, 2023 - Dec 1, 2023',
    },
    {
      id: '5',
      number: 'INV-2023-010',
      date: new Date('2023-10-01'),
      amount: 29.00,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'Oct 1, 2023 - Nov 1, 2023',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.plan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-destructive/10 text-destructive';
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Downloading ${invoice.number}...`);
    // In real app, would download PDF
  };

  const handleView = (invoice: Invoice) => {
    toast.success(`Opening ${invoice.number}...`);
    // In real app, would open PDF in new tab
  };

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice History</h1>
              <p className="text-muted-foreground">
                View and download your past invoices
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Download All */}
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </Card>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-bold text-lg mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your invoices will appear here'}
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Invoice</th>
                    <th className="text-left p-4 font-medium text-sm">Date</th>
                    <th className="text-left p-4 font-medium text-sm">Plan</th>
                    <th className="text-left p-4 font-medium text-sm">Period</th>
                    <th className="text-left p-4 font-medium text-sm">Amount</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-right p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.number}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {invoice.date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{invoice.plan}</span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {invoice.period}
                      </td>
                      <td className="p-4">
                        <span className="font-bold">${invoice.amount.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(invoice)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            aria-label="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(invoice)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            aria-label="Download invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Paid</p>
            <p className="text-2xl font-bold text-success">
              {invoices.filter(i => i.status === 'paid').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning">
              {invoices.filter(i => i.status === 'pending').length}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
