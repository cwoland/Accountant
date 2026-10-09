/**
 * Реестр иконок. Вместо эмодзи в БД лежит ИМЯ иконки из этого списка.
 *
 * Почему не эмодзи: они рендерятся шрифтом системы — на Android, iOS и
 * Windows это три разные картинки, они не наследуют цвет и толщину линии,
 * не масштабируются под сетку интерфейса и ломают выравнивание строки.
 * Для мира печатных постеров нужен один штрих одной толщины.
 *
 * Список закрытый: и сид на сервере, и рендер на клиенте проверяются
 * против него на этапе компиляции. Добавление иконки — правка здесь плюс
 * запись в ICON_COMPONENTS на клиенте, иначе TypeScript не пропустит.
 */
export const ICON_NAMES = [
  // Жильё и обязательное
  'house', 'lightbulb', 'wifi', 'landmark', 'shield', 'scale',
  // Повседневное
  'shopping-cart', 'utensils', 'coffee', 'shirt', 'monitor', 'pill',
  'stethoscope', 'scissors', 'paw-print', 'baby', 'dog',
  // Транспорт
  'car', 'fuel', 'bus', 'train', 'plane',
  // Досуг
  'tv', 'book-open', 'graduation-cap', 'dumbbell', 'gamepad-2',
  'music', 'film', 'beer', 'gift', 'flower-2',
  // Доходы и финансы
  'briefcase', 'laptop', 'trending-up', 'handshake', 'undo-2',
  'wallet', 'coins', 'banknote', 'credit-card', 'piggy-bank',
  // Служебные
  'package', 'hammer', 'wrench', 'receipt', 'users', 'user',
  'target', 'trophy', 'gem', 'rocket', 'crown', 'star', 'heart',
  'arrow-left-right', 'circle',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const NAME_SET = new Set<string>(ICON_NAMES);

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && NAME_SET.has(value);
}

/** Безопасное приведение: что угодно неизвестное становится нейтральным кружком. */
export function toIconName(value: unknown, fallback: IconName = 'circle'): IconName {
  return isIconName(value) ? value : fallback;
}

/**
 * Карта миграции со старых эмодзи. Нужна и скрипту миграции на сервере,
 * и клиенту — в БД пользователя могут лежать свои категории с эмодзи,
 * созданные до перехода.
 */
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
