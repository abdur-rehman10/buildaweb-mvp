import { Types } from 'mongoose';

type Stringable = { toString(): string };

function hasToString(value: unknown): value is Stringable {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toString' in value &&
    typeof value.toString === 'function'
  );
}

export function toIdString(value: unknown): string {
  if (typeof value === 'string') return value;

  if (value instanceof Types.ObjectId) {
    return value.toHexString();
  }

  if (hasToString(value)) {
    return value.toString();
  }

  return '';
}
