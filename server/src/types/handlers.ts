import type { RequestHandler } from 'express';

/**
 * Хендлеры с параметрами пути. Без этих алиасов req.params.id имеет тип
 * `string | string[] | undefined` (ParamsDictionary из Express 5), и каждое
 * обращение требовало `!`, который всё равно не убирал `string[]`.
 * Формат id гарантирует validate('params', z.object({ id: objectId })).
 */
export type IdHandler = RequestHandler<{ id: string }>;
export type AccountIdHandler = RequestHandler<{ accountId: string }>;
