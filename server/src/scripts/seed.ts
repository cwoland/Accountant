import { connectDB, disconnectDB } from '../config/db.js';
import type { IconName } from '@accountant/shared';
import { Category } from '../models/Category.js';
import { logger } from '../lib/logger.js';

type Seed = {
  name: string;
  type: 'income' | 'expense';
  icon: IconName;
  ink: number;
  isMandatory?: boolean;
  dueDay?: number;
};

const SYSTEM_CATEGORIES: Seed[] = [
  { name: 'Аренда / Ипотека',    type: 'expense', icon: 'house', ink: 0,  isMandatory: true, dueDay: 5 },
  { name: 'Коммунальные услуги', type: 'expense', icon: 'lightbulb', ink: 1,  isMandatory: true, dueDay: 10 },
  { name: 'Интернет и связь',    type: 'expense', icon: 'wifi', ink: 3,  isMandatory: true, dueDay: 15 },
  { name: 'Кредит / Долги',      type: 'expense', icon: 'landmark', ink: 11, isMandatory: true, dueDay: 20 },
  { name: 'Страховка',           type: 'expense', icon: 'shield', ink: 5,  isMandatory: true, dueDay: 25 },

  { name: 'Продукты',            type: 'expense', icon: 'shopping-cart', ink: 2 },
  { name: 'Рестораны и кафе',    type: 'expense', icon: 'utensils', ink: 8 },
  { name: 'Одежда и обувь',      type: 'expense', icon: 'shirt', ink: 4 },
  { name: 'Бытовая техника',     type: 'expense', icon: 'monitor', ink: 10 },
  { name: 'Здоровье и аптека',   type: 'expense', icon: 'pill', ink: 7 },
  { name: 'Транспорт',           type: 'expense', icon: 'car', ink: 4 },
  { name: 'Подписки',            type: 'expense', icon: 'tv', ink: 6 },
  { name: 'Образование',         type: 'expense', icon: 'book-open', ink: 3 },
  { name: 'Спорт и фитнес',      type: 'expense', icon: 'dumbbell', ink: 9 },
  { name: 'Развлечения',         type: 'expense', icon: 'gamepad-2', ink: 7 },
  { name: 'Путешествия',         type: 'expense', icon: 'plane', ink: 3 },
  { name: 'Подарки',             type: 'expense', icon: 'gift', ink: 6 },
  { name: 'Прочие расходы',      type: 'expense', icon: 'package', ink: 10 },

  { name: 'Зарплата',            type: 'income',  icon: 'briefcase', ink: 2 },
  { name: 'Фриланс',             type: 'income',  icon: 'laptop', ink: 4 },
  { name: 'Инвестиции',          type: 'income',  icon: 'trending-up', ink: 1 },
  { name: 'Подработка',          type: 'income',  icon: 'handshake', ink: 3 },
  { name: 'Возврат средств',     type: 'income',  icon: 'undo-2', ink: 2 },
  { name: 'Прочие доходы',       type: 'income',  icon: 'wallet', ink: 10 },
];

async function main(): Promise<void> {
  await connectDB();

  let created = 0;
  let updated = 0;

  for (const c of SYSTEM_CATEGORIES) {
    const result = await Category.updateOne(
      { name: c.name, isSystem: true },
      {
        $set: {
          type: c.type,
          icon: c.icon,
          ink: c.ink,
          isMandatory: c.isMandatory ?? false,
          dueDay: c.dueDay ?? null,
          archivedAt: null,
        },
        $setOnInsert: { user: null, isSystem: true, hiddenFor: [] },
      },
      { upsert: true },
    );
    if (result.upsertedCount > 0) created += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  const names = SYSTEM_CATEGORIES.map((c) => c.name);
  const archived = await Category.updateMany(
    { isSystem: true, name: { $nin: names }, archivedAt: null },
    { $set: { archivedAt: new Date() } },
  );

  logger.info(
    { created, updated, archived: archived.modifiedCount },
    'системные категории синхронизированы',
  );
  await disconnectDB();
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'сид провалился');
  process.exit(1);
});