import { pushToUser } from './pushController.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nex-agi/nex-n2-pro:free';

const callAI = async (messages) => {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://accountant-bay.vercel.app',
      'X-Title': 'Accountant App',
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 600 }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
};

export const analyzeExpenses = async (req, res, next) => {
  try {
    const { stats, currency = 'RUB' } = req.body;

    const prompt = `Ты финансовый советник. Проанализируй расходы пользователя кратко (3-4 предложения) на русском языке.
Данные за период:
- Доходы: ${stats.income} ${currency}
- Расходы: ${stats.expense} ${currency}
- Баланс: ${stats.balance} ${currency}
- По категориям: ${JSON.stringify(stats.byCategory?.filter(c => c.type === 'expense').slice(0, 5))}

Укажи: на что тратится больше всего, здоров ли баланс, одну конкретную рекомендацию.`;

    const text = await callAI([{ role: 'user', content: prompt }]);
    res.json({ text });
  } catch (err) {
    next(err);
  }
};

export const getBudgetAdvice = async (req, res, next) => {
  try {
    const { income, expense, monthlyBudget, currency = 'RUB', customQuestion } = req.body;

    let prompt;

    if (customQuestion) {
      prompt = `Ты финансовый советник. Отвечай кратко и по делу на русском языке.
Контекст пользователя:
- Доход: ${income} ${currency}
- Расходы: ${expense} ${currency}
- Бюджет: ${monthlyBudget} ${currency}

Вопрос пользователя: ${customQuestion}`;
    } else {
      prompt = `Ты финансовый советник. Пользователь имеет:
- Ежемесячный доход: ${income} ${currency}
- Ежемесячные расходы: ${expense} ${currency}
- Установленный бюджет: ${monthlyBudget} ${currency}

Дай 3 конкретных совета по оптимизации бюджета на русском языке. Ответ в формате нумерованного списка.`;
    }

    const text = await callAI([{ role: 'user', content: prompt }]);
    await pushToUser(req.user._id, {
      title: 'Советник ответил',
      body: text.slice(0, 80) + '...',
      icon: '/pwa-192.png',
      url: '/ai',
    });
    
    res.json({ text });
  } catch (err) {
    next(err);
  }
};

export const categorizeTransaction = async (req, res, next) => {
  try {
    const { description, categories } = req.body;

    if (!description)
      return res.status(400).json({ message: 'Описание обязательно.' });

    const categoryNames = categories?.map((c) => c.name).join(', ') || '';

    const prompt = `Определи категорию транзакции по описанию. Доступные категории: ${categoryNames}.
Описание: "${description}"
Ответь ТОЛЬКО названием категории из списка, без пояснений.`;

    const text = await callAI([{ role: 'user', content: prompt }]);
    res.json({ category: text.trim() });
  } catch (err) {
    next(err);
  }
};