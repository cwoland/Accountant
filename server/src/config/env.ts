import { z } from 'zod';

const csvOrigins = z
  .string()
  .min(1)
  .transform((raw) =>
    raw
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean),
  )
  .refine((list) => list.length > 0, 'CLIENT_URL не может быть пустым')
  .refine(
    (list) => list.every((o) => /^https?:\/\/[^/]+$/.test(o)),
    'CLIENT_URL должен содержать origin без пути, например https://app.example.com',
  );

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGO_URI: z.string().min(1, 'MONGO_URI обязателен'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET должен быть не короче 32 символов'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: csvOrigins,
  CRON_SECRET: z.string().min(16).optional(),

  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.1-8b-instruct:free'),

  VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  console.error(`\nНеверная конфигурация окружения:\n${issues}\n`);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export const isProd = env.NODE_ENV === 'production';

export const pushEnabled = Boolean(
  env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_EMAIL,
);

export const aiEnabled = Boolean(env.OPENROUTER_API_KEY);