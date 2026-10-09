export const INKS = [
  { id: 0,  name: 'vermilion', hex: '#E8482D' },
  { id: 1,  name: 'ochre',     hex: '#D99A1F' },
  { id: 2,  name: 'bottle',    hex: '#1F6F4A' },
  { id: 3,  name: 'teal',      hex: '#13746F' },
  { id: 4,  name: 'cobalt',    hex: '#2B5CC4' },
  { id: 5,  name: 'indigo',    hex: '#3B3B8F' },
  { id: 6,  name: 'plum',      hex: '#6E2E63' },
  { id: 7,  name: 'magenta',   hex: '#B52A6B' },
  { id: 8,  name: 'rust',      hex: '#A2452A' },
  { id: 9,  name: 'olive',     hex: '#5F6B23' },
  { id: 10, name: 'slate',     hex: '#44525E' },
  { id: 11, name: 'oxblood',   hex: '#7A1F2B' },
] as const;

export type Ink = (typeof INKS)[number];

export function inkHex(index: number): string {
  const ink = INKS[((index % INKS.length) + INKS.length) % INKS.length];
  return ink?.hex ?? '#44525E';
}