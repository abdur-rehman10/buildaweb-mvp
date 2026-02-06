import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Download, FileText, Calendar, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

export function AnalyticsExport() {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [scheduleReport, setScheduleReport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleEmail, setScheduleEmail] = useState('');

  const handleExport = () => {
    // Simulate export
    toast.success(`Exporting ${exportFormat.toUpperCase()} report...`);
    
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast.success(`Report downloaded successfully!`);
    }, 2000);
  };

  const handleScheduleReport = () => {
    if (!scheduleEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    toast.success(`Scheduled ${scheduleFrequency} reports to ${scheduleEmail}`);
    setScheduleReport(false);
    setScheduleEmail('');
  };

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-6">Export & Schedule Reports</h3>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                exportFormat === 'csv'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <FileText className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm font-medium">CSV</p>
              <p className="text-xs text-muted-foreground">Spreadsheet data</p>
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                exportFormat === 'pdf'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <FileText className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm font-medium">PDF</p>
              <p className="text-xs text-muted-foreground">Full report</p>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
            <option value="this-year">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        {exportFormat === 'pdf' && (
          <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
            <input
              type="checkbox"
              id="include-charts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="include-charts" className="text-sm cursor-pointer">
              Include charts and graphs
            </label>
          </div>
        )}
      </div>

      <Button fullWidth onClick={handleExport} className="mb-6">
        <Download className="h-4 w-4" />
        Export {exportFormat.toUpperCase()} Report
      </Button>

      {/* Schedule Reports */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold">Schedule Automatic Reports</h4>
            <p className="text-sm text-muted-foreground">
              Receive reports via email automatically
            </p>
          </div>
          <button
            onClick={() => setScheduleReport(!scheduleReport)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              scheduleReport ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                scheduleReport ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {scheduleReport && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (Monday)</option>
                <option value="monthly">Monthly (1st of month)</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <input
                type="email"
                value={scheduleEmail}
                onChange={(e) => setScheduleEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            <Button fullWidth onClick={handleScheduleReport}>
              <Calendar className="h-4 w-4" />
              Schedule Reports
            </Button>
          </div>
        )}
      </div>

      {/* Scheduled Reports List */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-bold">Active Schedules</h4>
        <div className="p-3 border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Weekly Report</p>
              <p className="text-xs text-muted-foreground">john@example.com • Every Monday</p>
            </div>
          </div>
          <button className="text-sm text-destructive hover:underline">Cancel</button>
        </div>
      </div>
    </Card>
  );
}
