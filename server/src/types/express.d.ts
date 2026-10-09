import type { HydratedDocument } from 'mongoose';
import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      /** Проставляется middleware `protect`. */
      user?: HydratedDocument<IUser>;
      /**
       * Результат zod-валидации. Отдельное поле, а не перезапись req.query —
       * в Express 5 `query` стал геттером, и присваивание туда не проходит.
       */
      validated?: { body?: unknown; query?: unknown; params?: unknown };
      // `id` здесь НЕ объявляем: его уже объявляет pino-http как ReqId
      // (string | number), и наше `id?: string` конфликтовало с ним.
    }
  }
}

export {};
