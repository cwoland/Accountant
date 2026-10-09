import { env, aiEnabled } from '../config/env.js';
import { serviceUnavailable } from '../lib/HttpError.js';
import { logger } from '../lib/logger.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 30_000;

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function callAI(messages: ChatMessage[], maxTokens = 600): Promise<string> {
  if (!aiEnabled) throw serviceUnavailable('ИИ-советник сейчас недоступен.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY!}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.CLIENT_URL[0] ?? '',
        'X-Title': 'Accountant',
      },
      body: JSON.stringify({ model: env.OPENROUTER_MODEL, messages, max_tokens: maxTokens }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, text: text.slice(0, 500) }, 'OpenRouter: ошибка');
      throw serviceUnavailable(
        res.status === 429
          ? 'ИИ перегружен. Попробуйте через пару минут.'
          : 'ИИ-советник временно недоступен.',
      );
    }

    const data = (await res.json()) as OpenRouterResponse;
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      logger.warn({ data }, 'OpenRouter: пустой ответ');
      throw serviceUnavailable('ИИ не смог ответить. Попробуйте переформулировать.');
    }
    return text;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw serviceUnavailable('ИИ не ответил за 30 секунд.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function fence(input: string): string {
  return input.replace(/[`\u0000-\u001F]/g, ' ').slice(0, 500);
}