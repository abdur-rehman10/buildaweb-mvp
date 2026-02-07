import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, projectsApi, type ProjectSummary } from '../../lib/api';

interface ProjectsApiScreenProps {
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function ProjectsApiScreen({ activeProjectId, onSelectProject }: ProjectsApiScreenProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [defaultLocale, setDefaultLocale] = useState('en');

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list();
      setProjects(res.projects);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await projectsApi.create({
        name: name.trim(),
        defaultLocale: defaultLocale.trim() || 'en',
      });
      setName('');
      await loadProjects();
      onSelectProject(res.project_id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create project';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">List, create, and select your active project.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Website"
            required
          />
          <Input
            label="Default locale"
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            placeholder="en"
          />
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your projects</h2>
          <Button variant="outline" size="sm" onClick={() => void loadProjects()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}

        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-3 border rounded-md flex items-center justify-between ${
                activeProjectId === project.id ? 'border-primary' : 'border-border'
              }`}
            >
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-xs text-muted-foreground">
                  {project.status} • locale: {project.defaultLocale}
                </div>
              </div>
              <Button size="sm" onClick={() => onSelectProject(project.id)}>
                {activeProjectId === project.id ? 'Selected' : 'Select'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
