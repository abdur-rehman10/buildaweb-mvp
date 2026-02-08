import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';
import { ApiError } from './api';
import { appToast, resetToastDedupeStateForTests } from './toast';

describe('appToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetToastDedupeStateForTests();
  });

  afterEach(() => {
    resetToastDedupeStateForTests();
  });

  it('does not render duplicate toasts for the same event key in quick succession', () => {
    appToast.success('Page duplicated', { eventKey: 'page-duplicate:project-1:page-1' });
    appToast.success('Page duplicated', { eventKey: 'page-duplicate:project-1:page-1' });

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Page duplicated',
      expect.objectContaining({
        id: 'page-duplicate:project-1:page-1',
      }),
    );
  });

  it('maps VERSION_CONFLICT to a friendly error message', () => {
    appToast.apiError(
      new ApiError({
        status: 409,
        code: 'VERSION_CONFLICT',
        message: 'Conflict from API',
      }),
      'Fallback',
      { eventKey: 'version-conflict' },
    );

    expect(toast.error).toHaveBeenCalledWith(
      'This page was modified elsewhere. Please reload.',
      expect.objectContaining({ id: 'version-conflict' }),
    );
  });
});
