export function toIdString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'bigint') return value.toString();

  if (value && typeof value === 'object') {
    const hexValue = (value as { toHexString?: unknown }).toHexString;
    if (typeof hexValue === 'function') {
      const rendered: unknown = hexValue.call(value);
      if (typeof rendered === 'string') {
        return rendered;
      }
    }

    const idLike = (value as { _id?: unknown })._id;
    if (idLike !== undefined) {
      return toIdString(idLike);
    }
  }

  return '';
}
