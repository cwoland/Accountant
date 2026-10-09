export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function prefixSearch(input: string): RegExp {
  return new RegExp(`(^|\\s)${escapeRegex(input.trim())}`, 'i');
}