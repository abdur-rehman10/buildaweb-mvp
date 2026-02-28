import { render, screen } from '@testing-library/react';
import { SignUp } from './SignUp';

describe('SignUp', () => {
  it('renders an email input', () => {
    render(<SignUp onNavigateToLogin={() => {}} onSignUp={() => {}} />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });
});
