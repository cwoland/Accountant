export const ICON_NAMES = [

  'house', 'lightbulb', 'wifi', 'landmark', 'shield', 'scale',

  'shopping-cart', 'utensils', 'coffee', 'shirt', 'monitor', 'pill',
  'stethoscope', 'scissors', 'paw-print', 'baby', 'dog',

  'car', 'fuel', 'bus', 'train', 'plane',

  'tv', 'book-open', 'graduation-cap', 'dumbbell', 'gamepad-2',
  'music', 'film', 'beer', 'gift', 'flower-2',

  'briefcase', 'laptop', 'trending-up', 'handshake', 'undo-2',
  'wallet', 'coins', 'banknote', 'credit-card', 'piggy-bank',

  'package', 'hammer', 'wrench', 'receipt', 'users', 'user',
  'target', 'trophy', 'gem', 'rocket', 'crown', 'star', 'heart',
  'arrow-left-right', 'circle',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const NAME_SET = new Set<string>(ICON_NAMES);

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && NAME_SET.has(value);
}

export function toIconName(value: unknown, fallback: IconName = 'circle'): IconName {
  return isIconName(value) ? value : fallback;
}

export const EMOJI_TO_ICON: Readonly<Record<string, IconName>> = {
  '🏠': 'house',        '💡': 'lightbulb',   '📡': 'wifi',          '🏦': 'landmark',
  '🛡️': 'shield',       '🛡': 'shield',       '⚖️': 'scale',
  '🛒': 'shopping-cart', '🍽️': 'utensils',   '🍽': 'utensils',      '☕': 'coffee',
  '👕': 'shirt',        '🖥️': 'monitor',     '🖥': 'monitor',        '💻': 'laptop',
  '💊': 'pill',         '🩺': 'stethoscope', '✂️': 'scissors',       '🐾': 'paw-print',
  '👶': 'baby',         '🐕': 'dog',
  '🚗': 'car',          '⛽': 'fuel',         '🚌': 'bus',            '🚆': 'train',
  '✈️': 'plane',        '✈': 'plane',
  '📺': 'tv',           '📚': 'book-open',   '🎓': 'graduation-cap', '🏋️': 'dumbbell',
  '🏋': 'dumbbell',     '🎮': 'gamepad-2',   '🎵': 'music',          '🎬': 'film',
  '🍺': 'beer',         '🎁': 'gift',        '🌷': 'flower-2',
  '💼': 'briefcase',    '📈': 'trending-up', '🤝': 'handshake',      '↩️': 'undo-2',
  '↩': 'undo-2',        '💰': 'wallet',      '🪙': 'coins',          '💵': 'banknote',
  '💳': 'credit-card',  '🐷': 'piggy-bank',
  '📦': 'package',      '🔨': 'hammer',      '🔧': 'wrench',         '⚙️': 'wrench',
  '⚙': 'wrench',        '🧾': 'receipt',     '👥': 'users',          '👤': 'user',
  '🎯': 'target',       '🏆': 'trophy',      '💎': 'gem',            '🚀': 'rocket',
  '👑': 'crown',        '⭐': 'star',         '❤️': 'heart',          '🔄': 'arrow-left-right',
  '💸': 'wallet',       '📊': 'trending-up', '🔔': 'circle',         '🤖': 'circle',
};
