import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Shield, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PermissionManagementProps {
  onBack: () => void;
}

export function PermissionManagement({ onBack }: PermissionManagementProps) {
  const [roles, setRoles] = useState([
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full administrative access',
      count: 1,
      permissions: {
        viewProjects: true,
        editProjects: true,
        deleteProjects: true,
        publishProjects: true,
        manageTeam: true,
        manageBilling: true,
        manageSettings: true,
        deleteWorkspace: true,
      },
      isSystem: true,
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage team and projects',
      count: 2,
      permissions: {
        viewProjects: true,
        editProjects: true,
        deleteProjects: true,
        publishProjects: true,
        manageTeam: true,
        manageBilling: false,
        manageSettings: true,
        deleteWorkspace: false,
      },
      isSystem: false,
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Edit and publish projects',
      count: 5,
      permissions: {
        viewProjects: true,
        editProjects: true,
        deleteProjects: false,
        publishProjects: true,
        manageTeam: false,
        manageBilling: false,
        manageSettings: false,
        deleteWorkspace: false,
      },
      isSystem: false,
    },
    {
      id: 'member',
      name: 'Member',
      description: 'View and comment only',
      count: 8,
      permissions: {
        viewProjects: true,
        editProjects: false,
        deleteProjects: false,
        publishProjects: false,
        manageTeam: false,
        manageBilling: false,
        manageSettings: false,
        deleteWorkspace: false,
      },
      isSystem: false,
    },
  ]);

  const permissionLabels = {
    viewProjects: 'View Projects',
    editProjects: 'Edit Projects',
    deleteProjects: 'Delete Projects',
    publishProjects: 'Publish Projects',
    manageTeam: 'Manage Team',
    manageBilling: 'Manage Billing',
    manageSettings: 'Manage Settings',
    deleteWorkspace: 'Delete Workspace',
  };

  const handleTogglePermission = (roleId: string, permission: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error('Cannot modify system roles');
      return;
    }

    setRoles(
      roles.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [permission]: !r.permissions[permission as keyof typeof r.permissions],
              },
            }
          : r
      )
    );
    toast.success('Permission updated');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Permission Management</h1>
                  <p className="text-sm text-muted-foreground">Configure role permissions</p>
                </div>
              </div>
            </div>
            <Button>Save Changes</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Role</th>
                {Object.values(permissionLabels).map((label) => (
                  <th key={label} className="text-center p-4 font-medium text-sm">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-border hover:bg-accent/50">
                  <td className="p-4">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                            System
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.count} members
                      </div>
                    </div>
                  </td>
                  {Object.keys(permissionLabels).map((permission) => (
                    <td key={permission} className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.id, permission)}
                        disabled={role.isSystem}
                        className={`h-6 w-6 rounded flex items-center justify-center ${
                          role.permissions[permission as keyof typeof role.permissions]
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted'
                        } ${role.isSystem ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {role.permissions[permission as keyof typeof role.permissions] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-100">Permission Guide</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• System roles (Owner) cannot be modified</li>
            <li>• Changes apply to all members with that role</li>
            <li>• Members will be notified of permission changes</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
