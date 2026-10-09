import type { RequestHandler } from 'express';
import type { ZodError, ZodTypeAny, z } from 'zod';
import { badRequest } from '../lib/HttpError.js';

type Part = 'body' | 'query' | 'params';

function fieldMap(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    out[key] ??= issue.message;
  }
  return out;
}

export function validate<S extends ZodTypeAny>(part: Part, schema: S): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const fields = fieldMap(result.error);
      const first = Object.values(fields)[0] ?? 'Некорректные данные';
      return next(badRequest(first, fields));
    }
    req.validated ??= {};
    req.validated[part] = result.data;
    next();
  };
}

export function valid<S extends ZodTypeAny>(
  req: Express.Request,
  part: Part,
): z.infer<S> {
  const data = req.validated?.[part];
  if (data === undefined) {
    throw new Error(`validate('${part}', …) не подключён на этом маршруте`);
  }
  return data as z.infer<S>;
}