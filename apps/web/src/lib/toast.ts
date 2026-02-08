import { toast } from 'sonner';
import { ApiError } from './api';

const DEFAULT_DURATION_MS = 3500;
const DEDUPE_WINDOW_MS = 1200;

const lastToastAtByEventKey = new Map<string, number>();

type ToastOptions = {
  eventKey?: string;
  duration?: number;
};

function shouldSkipEventToast(eventKey?: string): boolean {
  if (!eventKey) return false;

  const now = Date.now();
  const lastShownAt = lastToastAtByEventKey.get(eventKey) ?? 0;
  if (now - lastShownAt < DEDUPE_WINDOW_MS) return true;

  lastToastAtByEventKey.set(eventKey, now);
  return false;
}

function resolveDuration(duration?: number): number {
  return typeof duration === 'number' && duration > 0 ? duration : DEFAULT_DURATION_MS;
}

export function toApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function notifySuccess(message: string, options?: ToastOptions) {
  if (shouldSkipEventToast(options?.eventKey)) return;
  toast.success(message, {
    id: options?.eventKey,
    duration: resolveDuration(options?.duration),
  });
}

function notifyError(message: string, options?: ToastOptions) {
  if (shouldSkipEventToast(options?.eventKey)) return;
  toast.error(message, {
    id: options?.eventKey,
    duration: resolveDuration(options?.duration),
  });
}

function notifyApiError(error: unknown, fallback: string, options?: ToastOptions) {
  notifyError(toApiErrorMessage(error, fallback), options);
}

export const appToast = {
  success: notifySuccess,
  error: notifyError,
  apiError: notifyApiError,
};

export function resetToastDedupeStateForTests() {
  lastToastAtByEventKey.clear();
}
