import { ApiError } from './api';

const FRIENDLY_ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  VERSION_CONFLICT: 'This page was modified elsewhere. Please reload.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_RESPONSE_SHAPE: 'The server returned an unexpected response. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired reset token.',
  BAD_REQUEST: 'Please check the entered information and try again.',
};

function looksLikeNetworkFailureMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network request failed')
  );
}

export function getUserFriendlyErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const mappedByCode = FRIENDLY_ERROR_MESSAGES_BY_CODE[error.code];
    if (mappedByCode) return mappedByCode;

    if (error.code === 'HTTP_ERROR' && error.status >= 500) {
      return 'Server error. Please try again in a moment.';
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    if (looksLikeNetworkFailureMessage(error.message)) {
      return FRIENDLY_ERROR_MESSAGES_BY_CODE.NETWORK_ERROR;
    }
    return error.message || fallback;
  }

  return fallback;
}
