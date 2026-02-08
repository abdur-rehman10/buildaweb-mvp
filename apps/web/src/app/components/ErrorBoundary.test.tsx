import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowingComponent() {
  throw new Error('Unhandled test exception');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows a fallback message when a child throws an unhandled error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onWindowError = (event: Event) => {
      event.preventDefault();
    };
    window.addEventListener('error', onWindowError);

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something Went Wrong')).not.toBeNull();
    expect(screen.getByText("We're sorry, but something unexpected happened. Our team has been notified.")).not.toBeNull();
    window.removeEventListener('error', onWindowError);
  });
});
