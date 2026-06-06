import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';

dotenv.config();

const systemCategories = [
  { name: 'Аренда / Ипотека', type: 'expense', icon: '🏠', color: '#ef4444', isMandatory: true, isSystem: true },
  { name: 'Коммунальные услуги', type: 'expense', icon: '💡', color: '#f97316', isMandatory: true, isSystem: true },
  { name: 'Интернет и связь', type: 'expense', icon: '📡', color: '#f59e0b', isMandatory: true, isSystem: true },
  { name: 'Кредит / Долги', type: 'expense', icon: '🏦', color: '#dc2626', isMandatory: true, isSystem: true },
  { name: 'Страховка', type: 'expense', icon: '🛡️', color: '#7c3aed', isMandatory: true, isSystem: true },


  { name: 'Продукты', type: 'expense', icon: '🛒', color: '#10b981', isMandatory: false, isSystem: true },
  { name: 'Рестораны и кафе', type: 'expense', icon: '🍽️', color: '#f97316', isMandatory: false, isSystem: true },
  { name: 'Одежда и обувь', type: 'expense', icon: '👕', color: '#6366f1', isMandatory: false, isSystem: true },
  { name: 'Бытовая техника', type: 'expense', icon: '🖥️', color: '#8b5cf6', isMandatory: false, isSystem: true },
  { name: 'Здоровье и аптека', type: 'expense', icon: '💊', color: '#ec4899', isMandatory: false, isSystem: true },


  { name: 'Транспорт', type: 'expense', icon: '🚗', color: '#3b82f6', isMandatory: false, isSystem: true },
  { name: 'Подписки', type: 'expense', icon: '📺', color: '#a855f7', isMandatory: false, isSystem: true },
  { name: 'Образование', type: 'expense', icon: '📚', color: '#14b8a6', isMandatory: false, isSystem: true },
  { name: 'Спорт и фитнес', type: 'expense', icon: '🏋️', color: '#22c55e', isMandatory: false, isSystem: true },
  { name: 'Развлечения', type: 'expense', icon: '🎮', color: '#f43f5e', isMandatory: false, isSystem: true },
  { name: 'Путешествия', type: 'expense', icon: '✈️', color: '#0ea5e9', isMandatory: false, isSystem: true },
  { name: 'Прочие расходы', type: 'expense', icon: '📦', color: '#64748b', isMandatory: false, isSystem: true },


  { name: 'Зарплата', type: 'income', icon: '💼', color: '#10b981', isMandatory: false, isSystem: true },
  { name: 'Фриланс', type: 'income', icon: '💻', color: '#6366f1', isMandatory: false, isSystem: true },
  { name: 'Инвестиции', type: 'income', icon: '📈', color: '#f59e0b', isMandatory: false, isSystem: true },
  { name: 'Подработка', type: 'income', icon: '🤝', color: '#14b8a6', isMandatory: false, isSystem: true },
  { name: 'Возврат средств', type: 'income', icon: '↩️', color: '#22c55e', isMandatory: false, isSystem: true },
  { name: 'Прочие доходы', type: 'income', icon: '💰', color: '#64748b', isMandatory: false, isSystem: true },
];

const seed = async () => {
  await connectDB();

  const existing = await Category.countDocuments({ isSystem: true });
  if (existing > 0) {
    console.log(`⚠️  Системные категории уже существуют (${existing} шт.), пропускаем.`);
    process.exit(0);
  }

  await Category.insertMany(systemCategories);
  console.log(`✅ Создано ${systemCategories.length} системных категорий.`);
  process.exit(0);
};

seed();