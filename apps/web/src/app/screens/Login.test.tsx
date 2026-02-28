import { render, screen } from '@testing-library/react';
import { Login } from './Login';

describe('Login', () => {
  it('renders an email input', () => {
    render(
      <Login
        onNavigateToSignUp={() => {}}
        onNavigateToForgotPassword={() => {}}
        onLogin={() => {}}
      />
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });
});
