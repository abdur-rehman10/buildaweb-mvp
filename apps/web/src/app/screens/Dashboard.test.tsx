import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders dashboard shell heading', () => {
    render(
      <Dashboard
        onSelectProject={() => {}}
        onCreateProject={() => {}}
        onLogout={() => {}}
      />
    );

    expect(screen.getByRole('heading', { name: 'Welcome to Qwerty' })).toBeInTheDocument();
  });
});
