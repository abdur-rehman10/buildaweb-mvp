import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Shield, 
  Eye,
  Link as LinkIcon,
  Code,
  Settings,
  Upload,
  Mail,
  Globe,
  Smartphone,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface AccountSettingsProps {
  onBack: () => void;
}

type Tab = 
  | 'profile' 
  | 'account' 
  | 'notifications' 
  | 'billing' 
  | 'security' 
  | 'privacy' 
  | 'integrations' 
  | 'developer' 
  | 'preferences';

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // Profile
  const [name, setName] = useState('John Doe');
  const [bio, setBio] = useState('Building awesome websites with Buildaweb');
  const [company, setCompany] = useState('Acme Inc.');
  
  // Account
  const [email, setEmail] = useState('john@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    emailComments: true,
    emailPublish: true,
    inAppUpdates: true,
    inAppComments: true,
    pushEnabled: false,
  });
  
  // Preferences
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <Card className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Profile</h2>
                    <p className="text-sm text-muted-foreground">
                      Update your profile information
                    </p>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                          Upload Photo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Input
                    label="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Account</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your email and password
                    </p>
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Button onClick={handleChangePassword}>Update Password</Button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button
                        variant={twoFactorEnabled ? 'outline' : 'default'}
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      >
                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Notifications</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage how you receive notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailUpdates', label: 'Product updates', description: 'News about product features' },
                          { key: 'emailComments', label: 'Comments', description: 'When someone comments on your site' },
                          { key: 'emailPublish', label: 'Publishing', description: 'When your site is published' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <button
                              onClick={() => setNotifications({
                                ...notifications,
                                [item.key]: !notifications[item.key as keyof typeof notifications]
                              })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        In-App Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'inAppUpdates', label: 'Updates', description: 'Show updates in the app' },
                          { key: 'inAppComments', label: 'Comments', description: 'Show comment notifications' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <button
                              onClick={() => setNotifications({
                                ...notifications,
                                [item.key]: !notifications[item.key as keyof typeof notifications]
                              })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </h3>
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Enable Push Notifications</p>
                          <button
                            onClick={() => setNotifications({
                              ...notifications,
                              pushEnabled: !notifications.pushEnabled
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notifications.pushEnabled ? 'bg-primary' : 'bg-muted'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notifications.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications on your device
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Billing</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your subscription and billing information
                    </p>
                  </div>

                  <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-lg">Pro Plan</p>
                        <p className="text-sm text-muted-foreground">$29/month</p>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        Active
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Next billing date: March 15, 2024
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Change Plan</Button>
                      <Button variant="ghost" size="sm">Cancel Subscription</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Payment Method</h3>
                    <div className="p-4 border border-border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">•••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/24</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Billing History</h3>
                    <div className="space-y-2">
                      {[
                        { date: 'Feb 15, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Jan 15, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div key={index} className="p-3 border border-border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{invoice.date}</p>
                              <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                              {invoice.status}
                            </span>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Security</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Active Sessions</h3>
                    <div className="space-y-2">
                      {[
                        { device: 'Chrome on MacBook Pro', location: 'New York, US', current: true },
                        { device: 'Safari on iPhone', location: 'New York, US', current: false },
                      ].map((session, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Globe className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{session.device}</p>
                              <p className="text-sm text-muted-foreground">{session.location}</p>
                            </div>
                          </div>
                          {session.current ? (
                            <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                              Current
                            </span>
                          ) : (
                            <Button variant="ghost" size="sm">Revoke</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Activity Log</h3>
                    <div className="space-y-2">
                      {[
                        { action: 'Logged in', time: '2 hours ago' },
                        { action: 'Changed password', time: '1 day ago' },
                        { action: 'Enabled 2FA', time: '3 days ago' },
                      ].map((activity, index) => (
                        <div key={index} className="p-3 border border-border rounded-lg flex items-center justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Privacy</h2>
                    <p className="text-sm text-muted-foreground">
                      Control your data and privacy settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-bold mb-2">Data Collection</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Allow us to collect usage data to improve your experience
                      </p>
                      <Button variant="outline" size="sm">Manage Preferences</Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-bold mb-2">Export Your Data</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download a copy of all your data
                      </p>
                      <Button variant="outline" size="sm">Request Export</Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-bold mb-2">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete your account and all data
                      </p>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Integrations</h2>
                    <p className="text-sm text-muted-foreground">
                      Connect third-party apps and services
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'Google Analytics', connected: true, icon: '📊' },
                      { name: 'Mailchimp', connected: false, icon: '✉️' },
                      { name: 'Stripe', connected: true, icon: '💳' },
                      { name: 'Zapier', connected: false, icon: '⚡' },
                    ].map((integration) => (
                      <div key={integration.name} className="p-4 border border-border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {integration.connected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Developer Tab */}
              {activeTab === 'developer' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Developer</h2>
                    <p className="text-sm text-muted-foreground">
                      API keys and webhook configuration
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">API Keys</h3>
                    <div className="space-y-2 mb-3">
                      {[
                        { name: 'Production Key', key: 'sk_live_...4242', created: '2 days ago' },
                        { name: 'Development Key', key: 'sk_test_...8888', created: '1 week ago' },
                      ].map((apiKey, index) => (
                        <div key={index} className="p-3 border border-border rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-medium">{apiKey.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{apiKey.key}</p>
                          </div>
                          <Button variant="ghost" size="sm">Revoke</Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">Generate New Key</Button>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Webhooks</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure webhooks to receive real-time updates
                    </p>
                    <Button variant="outline" size="sm">Configure Webhooks</Button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Preferences</h2>
                    <p className="text-sm text-muted-foreground">
                      Customize your experience
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                        { id: 'system', label: 'System', icon: '💻' },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.id}
                          onClick={() => setTheme(themeOption.id as typeof theme)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            theme === themeOption.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{themeOption.icon}</div>
                          <p className="font-medium">{themeOption.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => toast.success('Preferences saved!')}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
