export function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}
